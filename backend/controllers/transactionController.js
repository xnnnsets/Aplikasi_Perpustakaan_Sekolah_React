import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import Book from '../models/Book.js';

export const bookWeb = async (req, res) => {
  const { userId, bookId } = req.body;
  const user = await User.findById(userId);
  if (user.dendaAktif > 0) return res.status(400).json({ message: 'Ada denda menunggak.' });
  const activeTrx = await Transaction.countDocuments({ user: userId, status: { $in: ['pending', 'dipinjam'] } });
  if (activeTrx >= 3) return res.status(400).json({ message: 'Kuota penuh (Maks 3).' });
  const book = await Book.findById(bookId);
  if (book.stock <= 0) return res.status(400).json({ message: 'Buku habis.' });

  book.stock -= 1; await book.save();
  const trx = await Transaction.create({ user: userId, book: bookId, status: 'pending', jalur: 'booking_web' });
  res.json({ message: 'Booking berhasil.', transaction: trx });
};

export const getPendings = async (req, res) => res.json(await Transaction.find({ status: 'pending' }).populate('user book'));
export const getActives = async (req, res) => res.json(await Transaction.find({ status: 'dipinjam' }).populate('user book'));
export const getUserHistory = async (req, res) => res.json(await Transaction.find({ user: req.params.userId }).populate('book'));
export const getAllHistory = async (req, res) => res.json(await Transaction.find().populate('user book').sort({ _id: -1 }));

export const approveBooking = async (req, res) => {
  const trx = await Transaction.findById(req.body.transactionId);
  if (!trx) return res.status(404).json({ message: 'Trx tdk ada' });
  trx.status = 'dipinjam'; trx.tanggalPinjam = new Date();
  const dueDate = new Date(); dueDate.setDate(dueDate.getDate() + 7);
  trx.tanggalJatuhTempo = dueDate;
  await trx.save(); res.json({ message: 'Booking disetujui', transaction: trx });
};

export const walkInBorrow = async (req, res) => {
  const { nis, titleOrId } = req.body;
  const user = await User.findOne({ nis });
  if (!user) return res.status(404).json({ message: 'Murid tdk ada.' });
  if (user.dendaAktif > 0) return res.status(400).json({ message: 'Ada denda.' });
  const activeTrx = await Transaction.countDocuments({ user: user._id, status: { $in: ['pending', 'dipinjam'] } });
  if (activeTrx >= 3) return res.status(400).json({ message: 'Kuota penuh.' });

  const book = await Book.findOne({ _id: titleOrId }).catch(() => null) || await Book.findOne({ title: new RegExp(titleOrId, 'i') });
  if (!book || book.stock <= 0) return res.status(404).json({ message: 'Buku habis/tdk ada.' });

  book.stock -= 1; await book.save();
  const dueDate = new Date(); dueDate.setDate(dueDate.getDate() + 7);
  const trx = await Transaction.create({ user: user._id, book: book._id, status: 'dipinjam', jalur: 'walk_in', tanggalPinjam: new Date(), tanggalJatuhTempo: dueDate });
  res.json({ message: 'Walk-in sukses.', transaction: trx });
};

export const returnBook = async (req, res) => {
  const trx = await Transaction.findById(req.body.transactionId).populate('user book');
  if(!trx || trx.status !== 'dipinjam') return res.status(400).json({message: 'Trx tdk valid'});
  const now = new Date(); let denda = 0;
  if (now > trx.tanggalJatuhTempo) {
    const diffDays = Math.ceil(Math.abs(now - trx.tanggalJatuhTempo) / (1000 * 60 * 60 * 24));
    denda = diffDays * 1000;
  }
  trx.tanggalKembali = now; trx.status = 'kembali'; trx.denda = denda; await trx.save();
  if(trx.book) await Book.findByIdAndUpdate(trx.book._id, { $inc: { stock: 1 } });
  if(denda > 0) await User.findByIdAndUpdate(trx.user._id, { $inc: { dendaAktif: denda } });
  res.json({ message: `Kembali. Denda: Rp${denda}`, trx });
};
