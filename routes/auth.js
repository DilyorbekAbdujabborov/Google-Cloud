// routes/auth.js
const express = require('express');
const { google } = require('googleapis');
const User = require('../models/User');

const router = express.Router();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const SCOPES = [
  'https://www.googleapis.com/auth/drive.file', // faqat biz yaratgan fayllarga kirish
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'openid',
];

// 1) Google login boshlash
router.get('/google', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // <— refresh token olish uchun MUHIM
    prompt: 'consent', // har safar refresh token berishi uchun
    scope: SCOPES,
  });
  res.redirect(url);
});

// 2) Callback – tokenlarni saqlash
router.get('/google/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('Kod topilmadi');

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // User info olish
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();

    let user = await User.findOne({ googleId: data.id });
    if (!user) {
      user = new User({
        googleId: data.id,
        email: data.email,
        name: data.name,
        tokens: tokens, // yangi tokenlar (refresh_token bor)
      });
    } else {
      // Har doim yangi refresh tokenni saqlaymiz (Google ba'zan yangisini beradi)
      user.tokens = tokens;
      user.email = data.email;
      user.name = data.name;
    }
    await user.save();

    req.session.userId = user._id;

    res.send(`
      <script>
        setTimeout(() => { window.location.href = '/file'; }, 3000);
      </script>
      <div style="font-family:sans-serif;text-align:center;padding:50px;">
        <h2>Salom, ${user.name || user.email}!</h2>
        <p>Muvaffaqiyatli kirish. 3 soniyadan so‘ng fayllar sahifasiga o‘tadi...</p>
      </div>
    `);
  } catch (err) {
    console.error('Auth error:', err);
    res.status(500).send('Kirishda xato yuz berdi');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
