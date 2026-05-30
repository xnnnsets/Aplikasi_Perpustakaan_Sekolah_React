import mongoose from 'mongoose';

const SettingSchema = new mongoose.Schema({
  dendaPerHari: { type: Number, default: 1000 },
  jamBuka: { type: String, default: '07:00' },
  jamTutup: { type: String, default: '15:00' },
  hariOperasional: { type: [String], default: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'] },
  pesanSanksi: { type: String, default: 'Akun Anda sedang dalam sanksi. Silakan hubungi petugas perpustakaan untuk informasi lebih lanjut.' }
});

export default mongoose.model('Setting', SettingSchema);
