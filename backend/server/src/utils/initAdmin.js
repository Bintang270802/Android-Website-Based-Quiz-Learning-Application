const Guru = require('../models/Guru');

const initializeAdmin = async () => {
  try {
    const adminExists = await Guru.findOne({ email: 'nico@gmail.com' });
    
    if (!adminExists) {
      const admin = new Guru({
        nama: 'nico',
        email: 'nico@gmail.com',
        password_hash: 'nico'
      });
      
      await admin.save();
      console.log('Admin default berhasil dibuat:');
      console.log('Email: nico@gmail.com');
      console.log('Password: nico');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

module.exports = initializeAdmin;