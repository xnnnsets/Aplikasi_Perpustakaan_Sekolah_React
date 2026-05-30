import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

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
    { title: 'Matematika Dasar SMA', author: 'Anton', stock: 5 },
    { title: 'Buku Fiksi: Laskar Pelangi', author: 'Andrea Hirata', stock: 1 }
  ]);
  res.json({ message: 'Seeding berhasil!'});
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server jalan di http://localhost:${PORT}`));
