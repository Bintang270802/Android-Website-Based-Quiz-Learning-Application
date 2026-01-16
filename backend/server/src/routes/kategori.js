const express = require('express');
const Kategori = require('../models/Kategori');
const { auth, logActivity } = require('../middleware/auth');
const authUser = require('../middleware/authUser');
const upload = require('../middleware/upload');
const router = express.Router();

// Get semua kategori - untuk admin
router.get('/', auth, async (req, res) => {
  try {
    const kategori = await Kategori.find().populate('dibuat_oleh', 'nama').sort({ dibuat_pada: -1 });
    await logActivity(req.guru._id, 'VIEW', 'kategori', 'Melihat daftar kategori');
    res.json(kategori);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get semua kategori - untuk pengguna
router.get('/user', authUser, async (req, res) => {
  try {
    const kategori = await Kategori.find().select('nama url_gambar dibuat_pada').sort({ dibuat_pada: -1 });
    res.json(kategori);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create kategori
router.post('/', auth, upload.single('gambar'), async (req, res) => {
  try {
    const kategoriData = {
      ...req.body,
      dibuat_oleh: req.guru._id
    };

    if (req.file) {
      kategoriData.url_gambar = `/uploads/${req.file.filename}`;
    }

    const kategori = new Kategori(kategoriData);
    await kategori.save();
    
    await logActivity(req.guru._id, 'INSERT', 'kategori', `Membuat kategori ${kategori.nama}`);
    res.status(201).json(kategori);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update kategori
router.put('/:id', auth, upload.single('gambar'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    if (req.file) {
      updateData.url_gambar = `/uploads/${req.file.filename}`;
    }

    const kategori = await Kategori.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!kategori) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    }
    
    await logActivity(req.guru._id, 'UPDATE', 'kategori', `Mengupdate kategori ${kategori.nama}`);
    res.json(kategori);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete kategori
router.delete('/:id', auth, async (req, res) => {
  try {
    const kategori = await Kategori.findByIdAndDelete(req.params.id);
    if (!kategori) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    }
    
    await logActivity(req.guru._id, 'DELETE', 'kategori', `Menghapus kategori ${kategori.nama}`);
    res.json({ message: 'Kategori berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;