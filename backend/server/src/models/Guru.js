const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const guruSchema = new mongoose.Schema({
  pengguna_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pengguna',
    unique: true
  },
  nama: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password_hash: {
    type: String,
    required: true
  },
  terakhir_login: {
    type: Date
  },
  dibuat_pada: {
    type: Date,
    default: Date.now
  }
});

guruSchema.pre('save', async function(next) {
  if (!this.isModified('password_hash')) return next();
  this.password_hash = await bcrypt.hash(this.password_hash, 12);
  next();
});

guruSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password_hash);
};

module.exports = mongoose.model('Guru', guruSchema);