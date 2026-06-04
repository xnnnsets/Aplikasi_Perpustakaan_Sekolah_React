import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'dipinjam', 'kembali', 'ditolak'], default: 'pending' },
  jalur: { type: String, enum: ['booking_web', 'walk_in'] },
  tanggalAmbilRencana: Date,
  tanggalPinjam: Date,
  tanggalJatuhTempo: Date,
  tanggalKembali: Date,
  alasanDitolak: { type: String, default: '' },
  denda: { type: Number, default: 0 }
});
export default mongoose.model('Transaction', TransactionSchema);
