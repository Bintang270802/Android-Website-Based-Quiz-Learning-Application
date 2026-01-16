const jwt = require('jsonwebtoken'); // Tambahkan import jwt
const Guru = require('../models/Guru');
const LogGuru = require('../models/LogGuru');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Akses ditolak. Token tidak ditemukan.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const guru = await Guru.findById(decoded.id);
    
    if (!guru) {
      return res.status(401).json({ message: 'Token tidak valid.' });
    }

    req.guru = guru;
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(401).json({ message: 'Token tidak valid.' });
  }
};

const logActivity = async (guru_id, aksi, tabel_terkait, deskripsi, pengguna_id = null) => {
  try {
    await LogGuru.create({
      guru_id,
      pengguna_id,
      aksi,
      tabel_terkait,
      deskripsi
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

module.exports = { auth, logActivity };