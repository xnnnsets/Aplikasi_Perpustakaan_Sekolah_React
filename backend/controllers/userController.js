import User from '../models/User.js';

export const getUsers = async (req, res) => res.json(await User.find({ role: 'murid' }));
export const createUser = async (req, res) => { try { res.json(await User.create({...req.body, role:'murid'})); } catch(err) { res.status(400).json({message: 'Gagal menambah murid / duplikat'}); } };
export const updateUser = async (req, res) => { try { res.json(await User.findByIdAndUpdate(req.params.id, req.body, {new: true})); } catch(err) { res.status(400).json({message: 'Gagal mengubah'}); } };
export const deleteUser = async (req, res) => { try { await User.findByIdAndDelete(req.params.id); res.json({message: 'Terhapus'}); } catch(err) { res.status(400).json({message:'Gagal hapus'}); } };

export const payFine = async (req, res) => {
  const { nis, amount } = req.body;
  const user = await User.findOne({ nis });
  if(!user) return res.status(404).json({message: 'Murid tidak ditemukan.'});
  user.dendaAktif = Math.max(0, user.dendaAktif - amount);
  await user.save();
  res.json({ message: 'Denda berhasil dibayar.', user });
};

export const toggleSanksi = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Murid tidak ditemukan.' });
    user.statusPeminjaman = user.statusPeminjaman === 'aktif' ? 'disanksi' : 'aktif';
    await user.save();
    res.json({ message: `Status murid diubah menjadi "${user.statusPeminjaman}".`, user });
  } catch (err) {
    res.status(400).json({ message: 'Gagal mengubah status.' });
  }
};
