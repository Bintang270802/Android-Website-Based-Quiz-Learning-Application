const mongoose = require('mongoose');

const jawabanSchema = new mongoose.Schema({
  pengguna_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pengguna',
    required: true
  },
  pertanyaan_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pertanyaan',
    required: true
  },
  pilihan_dipilih: {
    type: String,
    required: true,
    enum: ['A', 'B', 'C']
  },
  benar: {
    type: Boolean,
    default: false
  },
  dikoreksi_oleh: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guru'
  },
  dibuat_pada: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Jawaban', jawabanSchema);