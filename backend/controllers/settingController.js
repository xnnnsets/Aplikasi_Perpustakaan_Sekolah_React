import Setting from '../models/Setting.js';

export const getSettings = async (req, res) => {
  let settings = await Setting.findOne();
  if (!settings) settings = await Setting.create({});
  const defaults = {
    dendaPerHari: 1000,
    limitPeminjamanGlobal: 3,
    jamBuka: '07:00',
    jamTutup: '15:00',
    hariOperasional: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'],
    pesanSanksi: 'Akun Anda sedang dalam sanksi. Silakan hubungi petugas perpustakaan untuk informasi lebih lanjut.'
  };
  res.json({ ...defaults, ...settings.toObject() });
};

export const updateSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) settings = await Setting.create({});

    const { dendaPerHari, limitPeminjamanGlobal, jamBuka, jamTutup, hariOperasional, pesanSanksi } = req.body;
    if (dendaPerHari !== undefined) settings.dendaPerHari = dendaPerHari;
    if (limitPeminjamanGlobal !== undefined) settings.limitPeminjamanGlobal = limitPeminjamanGlobal;
    if (jamBuka !== undefined) settings.jamBuka = jamBuka;
    if (jamTutup !== undefined) settings.jamTutup = jamTutup;
    if (hariOperasional !== undefined) settings.hariOperasional = hariOperasional;
    if (pesanSanksi !== undefined) settings.pesanSanksi = pesanSanksi;

    await settings.save();
    res.json({ message: 'Pengaturan berhasil disimpan.', settings });
  } catch (err) {
    res.status(400).json({ message: 'Gagal menyimpan pengaturan.' });
  }
};
