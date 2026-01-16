const mongoose = require('mongoose');

const logGuruSchema = new mongoose.Schema({
  guru_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guru',
    required: true
  },
  pengguna_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pengguna'
  },
  aksi: {
    type: String,
    required: true,
    enum: ['LOGIN', 'INSERT', 'UPDATE', 'DELETE', 'VIEW']
  },
  tabel_terkait: {
    type: String
  },
  deskripsi: {
    type: String
  },
  dibuat_pada: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('LogGuru', logGuruSchema);