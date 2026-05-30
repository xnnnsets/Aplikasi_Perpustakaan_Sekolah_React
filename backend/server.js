import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Untuk local testing yang mudah, kita tidak mewajibkan MongoDB string dari .env dulu
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/perpus_sekolah';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Terhubung'))
  .catch(err => console.error('Gagal koneksi MongoDB:', err));


// --- MODELS ---

const UserSchema = new mongoose.Schema({
  nis: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['murid', 'admin'], default: 'murid' },
  dendaAktif: { type: Number, default: 0 }
});
const User = mongoose.model('User', UserSchema);

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: String,
  stock: { type: Number, required: true, default: 1 }
});
const Book = mongoose.model('Book', BookSchema);

const TransactionSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'dipinjam', 'kembali', 'ditolak'], default: 'pending' },
  jalur: { type: String, enum: ['booking_web', 'walk_in'] },
  tanggalPinjam: Date,
  tanggalJatuhTempo: Date,
  tanggalKembali: Date,
  denda: { type: Number, default: 0 }
});
const Transaction = mongoose.model('Transaction', TransactionSchema);


// --- API ROUTES ---

// 1. Auth Login (Simulasi sederhana tanpa JWT untuk PoC penggabungan alur)
app.post('/api/login', async (req, res) => {
  const { nis, password } = req.body;
  const user = await User.findOne({ nis, password });
  if (user) {
    res.json(user);
  } else {
    res.status(401).json({ message: 'NIS atau Password salah' });
  }
});

// 2. Mendapatkan daftar buku
app.get('/api/books', async (req, res) => {
  res.json(await Book.find());
});

// 3. JALUR A (MURID): Request Peminjaman (Booking Web)
app.post('/api/transactions/book', async (req, res) => {
  const { userId, bookId } = req.body;
  
  const user = await User.findById(userId);
  if (user.dendaAktif > 0) return res.status(400).json({ message: 'Ada denda menunggak, selesaikan dulu.' });

  const activeTransactions = await Transaction.countDocuments({ user: userId, status: { $in: ['pending', 'dipinjam'] } });
  if (activeTransactions >= 3) return res.status(400).json({ message: 'Kuota peminjaman penuh (Maksimal 3).' });

  const book = await Book.findById(bookId);
  if (book.stock <= 0) return res.status(400).json({ message: 'Buku habis.' });

  // Update stok (kunci stok sementara)
  book.stock -= 1;
  await book.save();

  const trx = await Transaction.create({
    user: userId, book: bookId, status: 'pending', jalur: 'booking_web'
  });

  res.json({ message: 'Booking berhasil, silakan ambil di meja petugas.', transaction: trx });
});

// 4. MENDAPATKAN SEMUA TRANSAKSI PENDING (Untuk Admin)
app.get('/api/transactions/pending', async (req, res) => {
  res.json(await Transaction.find({ status: 'pending' }).populate('user book'));
});

app.get('/api/transactions/active', async (req, res) => {
  res.json(await Transaction.find({ status: 'dipinjam' }).populate('user book'));
});

// 5. MENDAPATKAN RIWAYAT MURID
app.get('/api/transactions/user/:userId', async (req, res) => {
  res.json(await Transaction.find({ user: req.params.userId }).populate('book'));
});

// 6. TAHAP 3 ADMIN: Setujui Booking (Jalur A)
app.post('/api/transactions/approve-booking', async (req, res) => {
  const { transactionId } = req.body;
  
  const trx = await Transaction.findById(transactionId);
  if (!trx) return res.status(404).json({ message: 'Transaksi tidak ada' });

  trx.status = 'dipinjam';
  trx.tanggalPinjam = new Date();
  
  // Set Jatuh tempo 7 hari dari sekarang
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);
  trx.tanggalJatuhTempo = dueDate;

  await trx.save();
  res.json({ message: 'Booking disetujui.', transaction: trx });
});

// 7. TAHAP 3 ADMIN: Walk-In Borrowing (Jalur B)
app.post('/api/transactions/walk-in', async (req, res) => {
  const { nis, titleOrId } = req.body; // asumsikan titleOrId bisa dari scan barcode
  
  const user = await User.findOne({ nis });
  if (!user) return res.status(404).json({ message: 'Murid tidak ditemukan.' });
  if (user.dendaAktif > 0) return res.status(400).json({ message: 'Ada denda menunggak, selesaikan dulu.' });

  const activeTransactions = await Transaction.countDocuments({ user: user._id, status: { $in: ['pending', 'dipinjam'] } });
  if (activeTransactions >= 3) return res.status(400).json({ message: 'Kuota peminjaman penuh.' });

  // Cari buku (Simulasi scan text/ID yg mudah)
  const book = await Book.findOne({ _id: titleOrId }).catch(() => null) 
            || await Book.findOne({ title: new RegExp(titleOrId, 'i') });
            
  if (!book) return res.status(404).json({ message: 'Buku tidak ditemukan.' });
  if (book.stock <= 0) return res.status(400).json({ message: 'Stok buku habis.' });

  book.stock -= 1;
  await book.save();

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);

  const trx = await Transaction.create({
    user: user._id,
    book: book._id,
    status: 'dipinjam',
    jalur: 'walk_in',
    tanggalPinjam: new Date(),
    tanggalJatuhTempo: dueDate
  });

  res.json({ message: 'Peminjaman Walk-in sukses.', transaction: trx });
});

// 8. TAHAP PENGEMBALIAN BUKU DAN DENDA
app.post('/api/transactions/return', async (req, res) => {
  const { transactionId } = req.body;
  const trx = await Transaction.findById(transactionId).populate('user book');
  if(!trx || trx.status !== 'dipinjam') return res.status(400).json({message: 'Transaksi tidak valid.'});

  const now = new Date();
  let denda = 0;
  
  if (now > trx.tanggalJatuhTempo) {
    const diffTime = Math.abs(now - trx.tanggalJatuhTempo);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    denda = diffDays * 1000; // Rp1.000 / Hari
  }

  trx.tanggalKembali = now;
  trx.status = 'kembali';
  trx.denda = denda;
  await trx.save();

  // Tambah stok 
  if(trx.book) {
    await Book.findByIdAndUpdate(trx.book._id, { $inc: { stock: 1 } });
  }

  // Jika ada denda, catat ke dendaAktif murid
  if(denda > 0) {
    await User.findByIdAndUpdate(trx.user._id, { $inc: { dendaAktif: denda } });
  }

  res.json({ message: `Buku dikembalikan. Denda: Rp${denda}`, trx });
});

// 9. BAYAR DENDA
app.post('/api/users/pay-fine', async (req, res) => {
  const { nis, amount } = req.body;
  const user = await User.findOne({ nis });
  if(!user) return res.status(404).json({message: 'Murid tidak ditemukan.'});

  user.dendaAktif = Math.max(0, user.dendaAktif - amount);
  await user.save();
  res.json({ message: 'Denda berhasil dibayar.', user });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server jalan di http://localhost:${PORT}`));


// --- SCRIPT SEEDING DATA AWAL (Jalankan sekali di koding) ---
app.post('/api/seed', async (req, res) => {
  await User.deleteMany({});
  await Book.deleteMany({});
  await Transaction.deleteMany({});
  
  await User.create([
    { nis: '1001', name: 'Budi Santoso', password: 'password', role: 'murid' },
    { nis: '1002', name: 'Ani Yudhoyono', password: 'password', role: 'murid' },
    { nis: 'admin', name: 'Pustakawan', password: 'admin', role: 'admin' }
  ]);
  
  await Book.create([
    { title: 'Matematika Dasar SMA', author: 'Anton', stock: 5 },
    { title: 'Sejarah Indonesia', author: 'Bagus', stock: 3 },
    { title: 'Buku Fiksi: Laskar Pelangi', author: 'Andrea Hirata', stock: 1 }
  ]);
  
  res.json({ message: 'Seeding berhasil! Default User: nis: 1001 (pass: password), Admin: nis: admin (pass: admin)'});
});
