const express = require('express');
const jwt = require('jsonwebtoken');
const Guru = require('../models/Guru');
const Pengguna = require('../models/Pengguna');
const { logActivity } = require('../middleware/auth');
const router = express.Router();

// Login Admin/Guru
router.post('/login-admin', async (req, res) => {
  try {
    const { email, password } = req.body;

    const guru = await Guru.findOne({ email });
    if (!guru || !(await guru.comparePassword(password))) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    guru.terakhir_login = new Date();
    await guru.save();

    const token = jwt.sign({ id: guru._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    await logActivity(guru._id, 'LOGIN', 'guru', 'Login admin berhasil');

    res.json({
      token,
      guru: {
        id: guru._id,
        nama: guru.nama,
        email: guru.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login/Register Pengguna (hanya nama)
router.post('/login-user', async (req, res) => {
  try {
    const { nama } = req.body;

    let pengguna = await Pengguna.findOne({ nama });
    
    if (!pengguna) {
      pengguna = new Pengguna({ nama });
      await pengguna.save();
    }

    const token = jwt.sign({ id: pengguna._id, type: 'pengguna' }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      token,
      pengguna: {
        id: pengguna._id,
        nama: pengguna.nama
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;