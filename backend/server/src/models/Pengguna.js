const mongoose = require('mongoose');

const penggunaSchema = new mongoose.Schema({
  nama: {
    type: String,
    required: true,
    trim: true
  },
  dibuat_pada: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Pengguna', penggunaSchema);