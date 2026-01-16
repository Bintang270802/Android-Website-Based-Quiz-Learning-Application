const express = require('express');
const LogGuru = require('../models/LogGuru');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Get semua log aktivitas
router.get('/', auth, async (req, res) => {
  try {
    const { guru_id, aksi, tabel_terkait } = req.query;
    const filter = {};
    
    if (guru_id) filter.guru_id = guru_id;
    if (aksi) filter.aksi = aksi;
    if (tabel_terkait) filter.tabel_terkait = tabel_terkait;
    
    const logs = await LogGuru.find(filter)
      .populate('guru_id', 'nama')
      .populate('pengguna_id', 'nama')
      .sort({ dibuat_pada: -1 })
      .limit(100);
    
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;