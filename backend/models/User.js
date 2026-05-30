import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  nis: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['murid', 'admin'], default: 'murid' },
  dendaAktif: { type: Number, default: 0 },
  statusPeminjaman: { type: String, enum: ['aktif', 'disanksi'], default: 'aktif' }
});
export default mongoose.model('User', UserSchema);
