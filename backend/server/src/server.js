const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const penggunaRoutes = require('./routes/pengguna');
const kategoriRoutes = require('./routes/kategori');
const pertanyaanRoutes = require('./routes/pertanyaan');
const jawabanRoutes = require('./routes/jawaban');
const skorRoutes = require('./routes/skor');
const logsRoutes = require('./routes/logs');

// Inisialisasi admin default
const initializeAdmin = require('./utils/initAdmin');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Static files untuk upload
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/pengguna', penggunaRoutes);
app.use('/api/kategori', kategoriRoutes);
app.use('/api/pertanyaan', pertanyaanRoutes);
app.use('/api/jawaban', jawabanRoutes);
app.use('/api/skor', skorRoutes);
app.use('/api/logs', logsRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error.message);
  
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File terlalu besar! Maksimal 5MB.' });
  }
  
  if (error.message === 'Hanya file gambar yang diperbolehkan!') {
    return res.status(400).json({ message: error.message });
  }
  
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Token tidak valid.' });
  }
  
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token telah kedaluwarsa.' });
  }
  
  res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
});

// Initialize admin user
initializeAdmin();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
  console.log(`Upload directory: ${path.join(__dirname, '../uploads')}`);
});