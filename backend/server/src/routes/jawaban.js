const express = require('express');
const Jawaban = require('../models/Jawaban');
const Pertanyaan = require('../models/Pertanyaan');
const Skor = require('../models/Skor'); // Tambahkan import Skor
const { auth, logActivity } = require('../middleware/auth');
const router = express.Router();

// Get semua jawaban
router.get('/', auth, async (req, res) => {
  try {
    const { pengguna_id } = req.query;
    const filter = pengguna_id ? { pengguna_id } : {};
    
    const jawaban = await Jawaban.find(filter)
      .populate('pengguna_id', 'nama')
      .populate('pertanyaan_id', 'teks_pertanyaan pilihan_benar')
      .populate('dikoreksi_oleh', 'nama')
      .sort({ dibuat_pada: -1 });
    
    await logActivity(req.guru._id, 'VIEW', 'jawaban', 'Melihat daftar jawaban');
    res.json(jawaban);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit jawaban (untuk pengguna)
router.post('/submit', async (req, res) => {
  try {
    const { pengguna_id, pertanyaan_id, pilihan_dipilih } = req.body;
    
    // Cek jawaban yang benar
    const pertanyaan = await Pertanyaan.findById(pertanyaan_id);
    if (!pertanyaan) {
      return res.status(404).json({ message: 'Pertanyaan tidak ditemukan' });
    }

    const benar = pertanyaan.pilihan_benar === pilihan_dipilih;

    const jawaban = new Jawaban({
      pengguna_id,
      pertanyaan_id,
      pilihan_dipilih,
      benar
    });

    await jawaban.save();
    
    // Update skor pengguna
    let skor = await Skor.findOne({
      pengguna_id,
      kategori_id: pertanyaan.kategori_id
    });
    
    if (!skor) {
      // Jika belum ada skor untuk kategori ini, buat baru
      skor = new Skor({
        pengguna_id,
        kategori_id: pertanyaan.kategori_id,
        total_benar: benar ? 1 : 0,
        total_salah: benar ? 0 : 1,
        total_pertanyaan: 1,
        persentase: benar ? 100 : 0
      });
    } else {
      // Update skor yang sudah ada
      skor.total_pertanyaan += 1;
      if (benar) {
        skor.total_benar += 1;
      } else {
        skor.total_salah += 1;
      }
      skor.persentase = Math.round((skor.total_benar / skor.total_pertanyaan) * 100);
    }
    
    await skor.save();
    
    res.status(201).json({
      ...jawaban.toObject(),
      skor: skor.toObject()
    });
  } catch (error) {
    console.error('Submit jawaban error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Koreksi jawaban
router.put('/:id/koreksi', auth, async (req, res) => {
  try {
    const { benar } = req.body;
    
    const jawaban = await Jawaban.findByIdAndUpdate(
      req.params.id,
      { benar, dikoreksi_oleh: req.guru._id },
      { new: true }
    );
    
    if (!jawaban) {
      return res.status(404).json({ message: 'Jawaban tidak ditemukan' });
    }
    
    await logActivity(req.guru._id, 'UPDATE', 'jawaban', `Mengoreksi jawaban`, jawaban.pengguna_id);
    res.json(jawaban);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;