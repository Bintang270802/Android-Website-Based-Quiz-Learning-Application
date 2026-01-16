const mongoose = require('mongoose');

const pertanyaanSchema = new mongoose.Schema({
  teks_pertanyaan: {
    type: String,
    required: true
  },
  pilihan_a: {
    type: String,
    required: true
  },
  pilihan_b: {
    type: String,
    required: true
  },
  pilihan_c: {
    type: String,
    required: true
  },
  pilihan_benar: {
    type: String,
    required: true,
    enum: ['A', 'B', 'C']
  },
  url_gambar: {
    type: String,
    default: ''
  },
  kategori_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Kategori',
    required: true
  },
  dibuat_oleh: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guru'
  },
  status: {
    type: String,
    enum: ['draft', 'aktif', 'nonaktif'],
    default: 'draft'
  },
  dibuat_pada: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Pertanyaan', pertanyaanSchema);