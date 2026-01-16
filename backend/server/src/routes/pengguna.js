const express = require('express');
const Pengguna = require('../models/Pengguna');
const { auth, logActivity } = require('../middleware/auth');
const router = express.Router();

// Get semua pengguna
router.get('/', auth, async (req, res) => {
  try {
    const pengguna = await Pengguna.find().sort({ dibuat_pada: -1 });
    await logActivity(req.guru._id, 'VIEW', 'pengguna', 'Melihat daftar pengguna');
    res.json(pengguna);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get pengguna berdasarkan ID
router.get('/:id', auth, async (req, res) => {
  try {
    const pengguna = await Pengguna.findById(req.params.id);
    if (!pengguna) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }
    await logActivity(req.guru._id, 'VIEW', 'pengguna', `Melihat detail pengguna ${pengguna.nama}`, pengguna._id);
    res.json(pengguna);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update pengguna
router.put('/:id', auth, async (req, res) => {
  try {
    const pengguna = await Pengguna.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!pengguna) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }
    await logActivity(req.guru._id, 'UPDATE', 'pengguna', `Mengupdate pengguna ${pengguna.nama}`, pengguna._id);
    res.json(pengguna);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete pengguna
router.delete('/:id', auth, async (req, res) => {
  try {
    const pengguna = await Pengguna.findByIdAndDelete(req.params.id);
    if (!pengguna) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }
    await logActivity(req.guru._id, 'DELETE', 'pengguna', `Menghapus pengguna ${pengguna.nama}`, pengguna._id);
    res.json({ message: 'Pengguna berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;