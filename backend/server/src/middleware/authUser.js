const jwt = require('jsonwebtoken');
const Pengguna = require('../models/Pengguna');

const authUser = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Akses ditolak. Token tidak ditemukan.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verifikasi bahwa token adalah untuk pengguna
    if (decoded.type !== 'pengguna') {
      return res.status(401).json({ message: 'Token tidak valid untuk pengguna.' });
    }
    
    const pengguna = await Pengguna.findById(decoded.id);
    
    if (!pengguna) {
      return res.status(401).json({ message: 'Pengguna tidak ditemukan.' });
    }

    req.pengguna = pengguna;
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(401).json({ message: 'Token tidak valid.' });
  }
};

module.exports = authUser;