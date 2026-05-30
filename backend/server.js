import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import multer from 'multer';
import path from 'path';

import authRoutes from './routes/authRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import userRoutes from './routes/userRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';

import User from './models/User.js';
import Book from './models/Book.js';
import Transaction from './models/Transaction.js';

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Expose folder uploads secara publik agar gambar bisa diakses
app.use('/uploads', express.static('uploads'));

// Konfigurasi Multer untuk Upload Gambar
const storage = multer.diskStorage({
  destination(req, file, cb) { cb(null, 'uploads/') },
  filename(req, file, cb) { cb(null, `${Date.now()}-${file.originalname}`) }
});
const upload = multer({ storage });

// Endpoint khusus upload gambar
app.post('/api/upload', upload.single('image'), (req, res) => {
  if(req.file) {
    res.json({ url: `/uploads/${req.file.filename}` });
  } else {
    res.status(400).json({ message: 'Gagal upload' });
  }
});

// Routes Mount Defaults
app.use('/api', authRoutes); // /api/login
app.use('/api/books', bookRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);

// Seeder default Endpoint
app.post('/api/seed', async (req, res) => {
  await User.deleteMany({}); await Book.deleteMany({}); await Transaction.deleteMany({});
  await User.create([
    { nis: '1001', name: 'Budi Santoso', password: 'password', role: 'murid' },
    { nis: '1002', name: 'Ani Yudhoyono', password: 'password', role: 'murid' },
    { nis: 'admin', name: 'Pustakawan', password: 'admin', role: 'admin' }
  ]);
  await Book.create([
    { title: 'Matematika Dasar SMA', author: 'Anton', stock: 5, coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&q=80' },
    { title: 'Buku Fiksi: Laskar Pelangi', author: 'Andrea Hirata', stock: 1, coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300&q=80' }
  ]);
  res.json({ message: 'Seeding berhasil!'});
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server jalan di http://localhost:${PORT}`));
