const express = require('express');
const Skor = require('../models/Skor');
const { auth, logActivity } = require('../middleware/auth');
const authUser = require('../middleware/authUser');
const router = express.Router();

// Get semua skor - untuk admin
router.get('/', auth, async (req, res) => {
  try {
    const { pengguna_id, kategori_id } = req.query;
    const filter = {};
    
    if (pengguna_id) filter.pengguna_id = pengguna_id;
    if (kategori_id) filter.kategori_id = kategori_id;
    
    const skor = await Skor.find(filter)
      .populate('pengguna_id', 'nama')
      .populate('kategori_id', 'nama')
      .populate('direview_oleh', 'nama')
      .sort({ dibuat_pada: -1 });
    
    await logActivity(req.guru._id, 'VIEW', 'skor', 'Melihat daftar skor');
    res.json(skor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get skor untuk pengguna tertentu - untuk pengguna
router.get('/user', authUser, async (req, res) => {
  try {
    const skor = await Skor.find({ pengguna_id: req.pengguna._id })
      .populate('kategori_id', 'nama')
      .sort({ dibuat_pada: -1 });
    
    res.json(skor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create skor
router.post('/', auth, async (req, res) => {
  try {
    const skorData = {
      ...req.body,
      direview_oleh: req.guru._id
    };

    const skor = new Skor(skorData);
    await skor.save();
    
    await logActivity(req.guru._id, 'INSERT', 'skor', `Membuat skor untuk pengguna`, skor.pengguna_id);
    res.status(201).json(skor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update skor
router.put('/:id', auth, async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      direview_oleh: req.guru._id
    };

    const skor = await Skor.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!skor) {
      return res.status(404).json({ message: 'Skor tidak ditemukan' });
    }
    
    await logActivity(req.guru._id, 'UPDATE', 'skor', `Mengupdate skor`, skor.pengguna_id);
    res.json(skor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;