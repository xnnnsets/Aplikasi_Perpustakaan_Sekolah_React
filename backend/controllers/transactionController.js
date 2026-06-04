import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import Book from '../models/Book.js';
import Setting from '../models/Setting.js';

const HARI_MAP = { 0: 'Minggu', 1: 'Senin', 2: 'Selasa', 3: 'Rabu', 4: 'Kamis', 5: 'Jumat', 6: 'Sabtu' };

const getEffectiveLoanLimit = (user, settings) => {
  if (typeof user.limitPeminjaman === 'number' && user.limitPeminjaman >= 0) {
    return user.limitPeminjaman;
  }

  if (typeof settings.limitPeminjamanGlobal === 'number' && settings.limitPeminjamanGlobal >= 0) {
    return settings.limitPeminjamanGlobal;
  }

  return 3;
};

const validateLoanLimit = async (user) => {
  const settings = await Setting.findOne() || await Setting.create({});
  const activeTrx = await Transaction.countDocuments({ user: user._id, status: { $in: ['pending', 'dipinjam'] } });
  const limit = getEffectiveLoanLimit(user, settings);

  if (limit > 0 && activeTrx >= limit) {
    return { allowed: false, message: `Kuota pinjaman penuh (Maks ${limit}).` };
  }

  return { allowed: true, limit };
};

export const bookWeb = async (req, res) => {
  const { userId, bookId, tanggalAmbil, tanggalKembali } = req.body;

  // Lapis 1: Cek status akun
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: 'User tidak ditemukan.' });
  if (user.statusPeminjaman === 'disanksi') {
    return res.status(403).json({ message: 'DISANKSI', disanksi: true });
  }
  if (user.dendaAktif > 0) return res.status(400).json({ message: 'Ada denda menunggak.' });

  const loanLimit = await validateLoanLimit(user);
  if (!loanLimit.allowed) return res.status(400).json({ message: loanLimit.message });

  // Lapis 2: Cek jam & hari operasional
  const settings = await Setting.findOne() || await Setting.create({});
  const now = new Date();
  const hariIni = HARI_MAP[now.getDay()];
  if (!settings.hariOperasional.includes(hariIni)) {
    return res.status(400).json({ message: `Perpustakaan tidak beroperasi hari ${hariIni}.` });
  }

  const [bukaJam, bukaMenit] = settings.jamBuka.split(':').map(Number);
  const [tutupJam, tutupMenit] = settings.jamTutup.split(':').map(Number);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const bukaMinutes = bukaJam * 60 + bukaMenit;
  const tutupMinutes = tutupJam * 60 + tutupMenit;

  if (currentMinutes < bukaMinutes || currentMinutes >= tutupMinutes) {
    return res.status(400).json({ message: `Perpustakaan sudah tutup. Jam operasional: ${settings.jamBuka} - ${settings.jamTutup}.` });
  }

  // Lapis 3: Validasi tanggal pilihan
  if (!tanggalAmbil || !tanggalKembali) {
    return res.status(400).json({ message: 'Tanggal ambil dan tanggal kembali wajib dipilih.' });
  }

  const tglAmbil = new Date(tanggalAmbil);
  const tglKembali = new Date(tanggalKembali);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (tglAmbil < today) {
    return res.status(400).json({ message: 'Tanggal ambil tidak boleh di masa lampau.' });
  }
  if (tglKembali <= tglAmbil) {
    return res.status(400).json({ message: 'Tanggal kembali harus setelah tanggal ambil.' });
  }

  const diffDays = Math.ceil((tglKembali - tglAmbil) / (1000 * 60 * 60 * 24));
  if (diffDays > 7) {
    return res.status(400).json({ message: 'Durasi peminjaman maksimal 7 hari.' });
  }

  // Semua validasi lolos
  const book = await Book.findById(bookId);
  if (!book || book.stock <= 0) return res.status(400).json({ message: 'Buku habis.' });

  book.stock -= 1; await book.save();
  const trx = await Transaction.create({
    user: userId,
    book: bookId,
    status: 'pending',
    jalur: 'booking_web',
    tanggalAmbilRencana: tglAmbil,
    tanggalJatuhTempo: tglKembali
  });
  res.json({ message: 'Booking berhasil.', transaction: trx });
};

export const getPendings = async (req, res) => res.json(await Transaction.find({ status: 'pending' }).populate('user book'));
export const getActives = async (req, res) => res.json(await Transaction.find({ status: 'dipinjam' }).populate('user book'));
export const getUserHistory = async (req, res) => res.json(await Transaction.find({ user: req.params.userId }).populate('book'));
export const getAllHistory = async (req, res) => res.json(await Transaction.find().populate('user book').sort({ _id: -1 }));

export const approveBooking = async (req, res) => {
  const trx = await Transaction.findById(req.body.transactionId);
  if (!trx) return res.status(404).json({ message: 'Trx tdk ada' });
  trx.status = 'dipinjam';
  trx.tanggalPinjam = new Date();
  if (!trx.tanggalJatuhTempo) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    trx.tanggalJatuhTempo = dueDate;
  }
  await trx.save();
  res.json({ message: 'Booking disetujui', transaction: trx });
};

export const walkInBorrow = async (req, res) => {
  const { nis, titleOrId } = req.body;
  const user = await User.findOne({ nis });
  if (!user) return res.status(404).json({ message: 'Murid tdk ada.' });
  if (user.statusPeminjaman === 'disanksi') return res.status(403).json({ message: 'Murid sedang disanksi.' });
  if (user.dendaAktif > 0) return res.status(400).json({ message: 'Ada denda.' });
  const loanLimit = await validateLoanLimit(user);
  if (!loanLimit.allowed) return res.status(400).json({ message: loanLimit.message });

  const book = await Book.findOne({ _id: titleOrId }).catch(() => null) || await Book.findOne({ title: new RegExp(titleOrId, 'i') });
  if (!book || book.stock <= 0) return res.status(404).json({ message: 'Buku habis/tdk ada.' });

  const { tanggalPinjam, tanggalJatuhTempo } = req.body;
  const pinjamDate = tanggalPinjam ? new Date(tanggalPinjam) : new Date();
  const jatuhTempoDate = tanggalJatuhTempo ? new Date(tanggalJatuhTempo) : (() => {
    const dueDate = new Date(pinjamDate);
    dueDate.setDate(dueDate.getDate() + 7);
    return dueDate;
  })();

  if (Number.isNaN(pinjamDate.getTime()) || Number.isNaN(jatuhTempoDate.getTime())) {
    return res.status(400).json({ message: 'Tanggal pinjam dan tanggal kembali tidak valid.' });
  }

  if (jatuhTempoDate <= pinjamDate) {
    return res.status(400).json({ message: 'Tanggal kembali harus setelah tanggal pinjam.' });
  }

  const diffDays = Math.ceil((jatuhTempoDate - pinjamDate) / (1000 * 60 * 60 * 24));
  if (diffDays > 7) {
    return res.status(400).json({ message: 'Durasi peminjaman maksimal 7 hari.' });
  }

  book.stock -= 1; await book.save();
  const trx = await Transaction.create({ user: user._id, book: book._id, status: 'dipinjam', jalur: 'walk_in', tanggalPinjam: pinjamDate, tanggalJatuhTempo: jatuhTempoDate });
  res.json({ message: 'Walk-in sukses.', transaction: trx });
};

export const returnBook = async (req, res) => {
  const trx = await Transaction.findById(req.body.transactionId).populate('user book');
  if (!trx || trx.status !== 'dipinjam') return res.status(400).json({ message: 'Trx tdk valid' });

  const settings = await Setting.findOne() || await Setting.create({});
  const now = new Date();
  let denda = 0;
  if (now > trx.tanggalJatuhTempo) {
    const diffDays = Math.ceil(Math.abs(now - trx.tanggalJatuhTempo) / (1000 * 60 * 60 * 24));
    denda = diffDays * settings.dendaPerHari;
  }
  trx.tanggalKembali = now; trx.status = 'kembali'; trx.denda = denda; await trx.save();
  if (trx.book) await Book.findByIdAndUpdate(trx.book._id, { $inc: { stock: 1 } });
  if (denda > 0) await User.findByIdAndUpdate(trx.user._id, { $inc: { dendaAktif: denda } });
  res.json({ message: `Kembali. Denda: Rp${denda}`, trx });
};
