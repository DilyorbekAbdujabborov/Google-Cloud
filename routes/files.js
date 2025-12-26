// routes/files.js (to'liq versiya)

const express = require('express');
const multer = require('multer');
const { google } = require('googleapis');
const { Readable } = require('stream');
const User = require('../models/User');
const File = require('../models/File');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Middleware: foydalanuvchi autentifikatsiyasi
async function requireUser(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Autentifikatsiya talab qilinadi' });
  }
  const user = await User.findById(req.session.userId);
  if (!user) {
    return res.status(401).json({ error: 'Foydalanuvchi topilmadi' });
  }
  req.currentUser = user;
  next();
}

// Helper: foydalanuvchi uchun OAuth2 client (refresh token ishlatadi)
async function getAuthClientForUser(user, retry = true) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials(user.tokens);

  // Helper: API chaqiruvi 401 bo‘lsa refresh token bilan qayta urinadi
  oauth2Client.on('tokens', async (tokens) => {
    if (tokens.refresh_token) {
      user.tokens.refresh_token = tokens.refresh_token;
    }
    if (tokens.access_token) {
      user.tokens.access_token = tokens.access_token;
    }
    if (tokens.expiry_date) {
      user.tokens.expiry_date = tokens.expiry_date;
    }
    await user.save();
  });

  // Token eskirganini tekshirish
  const now = Date.now();
  if (!user.tokens.expiry_date || user.tokens.expiry_date <= now + 60 * 1000) {
    try {
      const newToken = await oauth2Client.getAccessToken();
      oauth2Client.setCredentials({
        ...user.tokens,
        access_token: newToken.token,
      });
    } catch (err) {
      console.warn('Access token yangilanmadi:', err.message);
      if (!retry) throw new Error('Token yangilashda xato');
    }
  }

  // Proxy wrapper: 401 bo‘lsa refresh va qayta urinadi
  const drive = google.drive({ version: 'v3', auth: oauth2Client });
  const originalRequest = drive.files.list.bind(drive.files);
  drive.files.list = async (...args) => {
    try {
      return await originalRequest(...args);
    } catch (err) {
      if (err.code === 401 && retry) {
        console.log('401 Unauthorized, token refresh qilinmoqda...');
        await oauth2Client.refreshAccessToken();
        return getAuthClientForUser(user, false).then((client) => {
          return google
            .drive({ version: 'v3', auth: client })
            .files.list(...args);
        });
      }
      throw err;
    }
  };

  return oauth2Client;
}

// "MyDrive Cloud" papkasini topish yoki yaratish
async function getOrCreateCloudFolder(drive) {
  const FOLDER_NAME = 'Cloud';

  try {
    const res = await drive.files.list({
      q: `mimeType = 'application/vnd.google-apps.folder' and name = '${FOLDER_NAME}' and trashed = false`,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    if (res.data.files && res.data.files.length > 0) {
      return res.data.files[0].id;
    }

    // Papka yo‘q bo‘lsa yaratamiz
    const folderMetadata = {
      name: FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
    };

    const folder = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id',
    });

    console.log('Yangi "MyDrive Cloud" papkasi yaratildi:', folder.data.id);
    return folder.data.id;
  } catch (err) {
    console.error('Papka yaratish/topish xatosi:', err);
    throw err;
  }
}

// 1. Fayl yuklash
router.post('/', requireUser, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Fayl tanlanmagan' });

    const oauth2Client = await getAuthClientForUser(req.currentUser);
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const folderId = await getOrCreateCloudFolder(drive);
    const stream = Readable.from(req.file.buffer);

    const { data } = await drive.files.create({
      requestBody: {
        name: req.file.originalname,
        mimeType: req.file.mimetype,
        parents: [folderId], // <— MyDrive Cloud ichiga
      },
      media: {
        mimeType: req.file.mimetype,
        body: stream,
      },
      fields: 'id, name, size, webViewLink, webContentLink',
    });

    // Faylni hammaga ochiq qilish (download uchun)
    await drive.permissions.create({
      fileId: data.id,
      requestBody: { role: 'reader', type: 'anyone' },
    });

    // Agar webContentLink bo‘lmasa, o‘zimiz yaratamiz
    const downloadLink =
      data.webContentLink ||
      `https://drive.google.com/uc?export=download&id=${data.id}`;

    const fileDoc = new File({
      owner: req.currentUser._id,
      driveFileId: data.id,
      name: data.name,
      originalName: req.file.originalname,
      size: req.file.size || data.size,
      mimeType: req.file.mimetype,
      webViewLink: data.webViewLink,
      webContentLink: downloadLink,
    });

    await fileDoc.save();

    res.json({
      _id: fileDoc._id,
      originalName: fileDoc.originalName,
      size: fileDoc.size,
      uploadedAt: fileDoc.createdAt,
      webViewLink: fileDoc.webViewLink,
      webContentLink: fileDoc.webContentLink,
    });
  } catch (err) {
    console.error('Upload xatosi:', err);
    res.status(500).json({ error: 'Yuklashda xato', details: err.message });
  }
});

// 2. Fayllar ro‘yxati
router.get('/', requireUser, async (req, res) => {
  try {
    const files = await File.find({ owner: req.currentUser._id })
      .sort({ createdAt: -1 })
      .select('originalName size createdAt webViewLink webContentLink');

    const formatted = files.map((f) => ({
      _id: f._id,
      originalName: f.originalName || f.name || 'Nomsiz',
      size: f.size || 0,
      uploadedAt: f.createdAt,
      webViewLink: f.webViewLink,
      webContentLink: f.webContentLink,
    }));

    res.json(formatted);
  } catch (err) {
    console.error('List xatosi:', err);
    res.status(500).json({ error: 'Ro‘yxatni olishda xato' });
  }
});

// 3. Preview (ko‘rish)
router.get('/:id/preview', requireUser, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file || !file.owner.equals(req.currentUser._id)) {
      return res.status(404).json({ error: 'Fayl topilmadi' });
    }
    if (!file.webViewLink) return res.status(400).send('Preview mavjud emas');
    res.redirect(file.webViewLink);
  } catch (err) {
    res.status(500).json({ error: 'Xato' });
  }
});

// 4. Download (to‘g‘ridan-to‘g‘ri yuklab olish)
router.get('/:id/download', requireUser, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file || !file.owner.equals(req.currentUser._id)) {
      return res.status(404).json({ error: 'Fayl topilmadi' });
    }
    if (!file.webContentLink)
      return res.status(400).send('Download link mavjud emas');
    res.redirect(file.webContentLink);
  } catch (err) {
    res.status(500).json({ error: 'Xato' });
  }
});

// 5. O‘chirish
router.delete('/:id', requireUser, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file || !file.owner.equals(req.currentUser._id)) {
      return res.status(404).json({ error: 'Fayl topilmadi yoki ruxsat yo‘q' });
    }

    const oauth2Client = await getAuthClientForUser(req.currentUser);
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    await drive.files.delete({ fileId: file.driveFileId });
    await file.deleteOne(); // Mongoose 6+ uchun to‘g‘ri

    res.json({ message: 'Fayl muvaffaqiyatli o‘chirildi' });
  } catch (err) {
    console.error('Delete xatosi:', err);
    res.status(500).json({ error: 'O‘chirishda xato', details: err.message });
  }
});

// ===============================================
// YANGI: /web/:id → Faylni to'g'ridan-to'g'ri ko'rsatish (stream)
// Masalan: https://yoursite.com/web/67f2a1d8e9b1234567890abc
// ===============================================
router.get('/web/:id', async (req, res) => {
  try {
    const fileId = req.params.id;

    // 1. MongoDBdan fayl ma'lumotlarini olish
    const fileDoc = await File.findById(fileId);
    if (!fileDoc) {
      return res.status(404).send('Fayl topilmadi 😢');
    }

    // 2. Foydalanuvchi egasi ekanligini tekshirish (ixtiyoriy – xohlasangiz o'chirib qo'ying)
    // Agar public qilmoqchi bo'lsangiz, bu qismni comment qiling
    if (!req.session?.userId || !fileDoc.owner.equals(req.session.userId)) {
      // Agar sessiya bo'lmasa yoki egasi bo'lmasa – faqat public fayllar ochiladi
      // (biz faylni anyone reader qilganmiz, shuning uchun public)
    }

    // 3. Google Drive'dan faylni stream qilib olish
    const user = await User.findById(fileDoc.owner);
    if (!user) return res.status(404).send('Foydalanuvchi topilmadi');

    const oauth2Client = await getAuthClientForUser(user);
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const driveRes = await drive.files.get(
      {
        fileId: fileDoc.driveFileId,
        alt: 'media', // <— Bu muhim! Media (content) ni olish uchun
      },
      { responseType: 'stream' }
    );

    // 4. To'g'ri headerlar qo'yish
    const originalName = fileDoc.originalName || fileDoc.name || 'file';
    const mimeType = fileDoc.mimeType || 'application/octet-stream';

    res.setHeader('Content-Type', mimeType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(originalName)}"`
    );

    // Katta fayllarda chunklarda yuborish uchun cache o'lchami
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 yil cache

    // 5. Streamni frontendga yuborish
    driveRes.data
      .on('end', () => {
        console.log('Stream tugadi:', originalName);
      })
      .on('error', (err) => {
        console.error('Stream xatosi:', err);
        if (!res.headersSent) res.status(500).send('Stream xatosi');
      })
      .pipe(res);
  } catch (err) {
    console.error('Web endpoint xatosi:', err);
    if (!res.headersSent) {
      res.status(500).send('Faylni ochishda xato yuz berdi');
    }
  }
});

module.exports = router;
