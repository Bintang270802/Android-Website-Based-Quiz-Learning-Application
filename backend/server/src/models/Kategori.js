const mongoose = require('mongoose');

const kategoriSchema = new mongoose.Schema({
  nama: {
    type: String,
    required: true,
    trim: true
  },
  url_gambar: {
    type: String,
    default: ''
  },
  dibuat_oleh: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guru'
  },
  dibuat_pada: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Kategori', kategoriSchema);