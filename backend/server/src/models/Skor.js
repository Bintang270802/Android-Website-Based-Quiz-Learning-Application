const mongoose = require('mongoose');

const skorSchema = new mongoose.Schema({
  pengguna_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pengguna',
    required: true
  },
  kategori_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Kategori'
  },
  total_benar: {
    type: Number,
    default: 0
  },
  total_salah: {
    type: Number,
    default: 0
  },
  total_pertanyaan: {
    type: Number,
    default: 0
  },
  persentase: {
    type: Number,
    default: 0
  },
  direview_oleh: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guru'
  },
  dibuat_pada: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Skor', skorSchema);