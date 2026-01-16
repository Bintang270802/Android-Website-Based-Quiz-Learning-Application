const express = require('express');
const Pertanyaan = require('../models/Pertanyaan');
const { auth, logActivity } = require('../middleware/auth');
const authUser = require('../middleware/authUser'); // Tambahkan import authUser
const upload = require('../middleware/upload');
const router = express.Router();

// Get semua pertanyaan - untuk admin
router.get('/', auth, async (req, res) => {
  try {
    const { kategori_id } = req.query;
    const filter = kategori_id ? { kategori_id } : {};
    
    const pertanyaan = await Pertanyaan.find(filter)
      .populate('kategori_id', 'nama')
      .populate('dibuat_oleh', 'nama')
      .sort({ dibuat_pada: -1 });
    
    await logActivity(req.guru._id, 'VIEW', 'pertanyaan', 'Melihat daftar pertanyaan');
    res.json(pertanyaan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get pertanyaan - untuk pengguna mobile
router.get('/user', authUser, async (req, res) => {
  try {
    const { kategori_id } = req.query;
    if (!kategori_id) {
      return res.status(400).json({ message: 'Parameter kategori_id diperlukan' });
    }
    
    const pertanyaan = await Pertanyaan.find({ 
      kategori_id, 
      status: 'aktif' // Hanya tampilkan pertanyaan aktif untuk pengguna
    })
    .select('teks_pertanyaan pilihan_a pilihan_b pilihan_c pilihan_benar url_gambar kategori_id')
    .populate('kategori_id', 'nama')
    .sort({ dibuat_pada: -1 });
    
    res.json(pertanyaan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create pertanyaan
router.post('/', auth, upload.single('gambar'), async (req, res) => {
  try {
    const pertanyaanData = {
      ...req.body,
      dibuat_oleh: req.guru._id
    };

    if (req.file) {
      pertanyaanData.url_gambar = `/uploads/${req.file.filename}`;
    }

    const pertanyaan = new Pertanyaan(pertanyaanData);
    await pertanyaan.save();
    
    await logActivity(req.guru._id, 'INSERT', 'pertanyaan', `Membuat pertanyaan baru`);
    res.status(201).json(pertanyaan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update pertanyaan
router.put('/:id', auth, upload.single('gambar'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    if (req.file) {
      updateData.url_gambar = `/uploads/${req.file.filename}`;
    }

    const pertanyaan = await Pertanyaan.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!pertanyaan) {
      return res.status(404).json({ message: 'Pertanyaan tidak ditemukan' });
    }
    
    await logActivity(req.guru._id, 'UPDATE', 'pertanyaan', `Mengupdate pertanyaan`);
    res.json(pertanyaan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete pertanyaan
router.delete('/:id', auth, async (req, res) => {
  try {
    const pertanyaan = await Pertanyaan.findByIdAndDelete(req.params.id);
    if (!pertanyaan) {
      return res.status(404).json({ message: 'Pertanyaan tidak ditemukan' });
    }
    
    await logActivity(req.guru._id, 'DELETE', 'pertanyaan', `Menghapus pertanyaan`);
    res.json({ message: 'Pertanyaan berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;