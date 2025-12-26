const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    driveFileId: { type: String, required: true, unique: true },
    name: String, // Google Drive'dagi nomi
    originalName: String, // Foydalanuvchi yuklagan asl nomi
    size: { type: Number }, // baytlarda
    mimeType: String,
    webViewLink: String, // Ko'rish uchun (Google Drive preview)
    webContentLink: String, // To'g'ridan-to'g'ri yuklab olish (download)
  },
  { timestamps: true }
);

module.exports = mongoose.model('File', fileSchema);
