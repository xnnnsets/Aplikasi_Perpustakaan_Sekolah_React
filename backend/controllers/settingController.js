import Setting from '../models/Setting.js';

export const getSettings = async (req, res) => {
  let settings = await Setting.findOne();
  if (!settings) settings = await Setting.create({});
  res.json(settings);
};

export const updateSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) settings = await Setting.create({});

    const { dendaPerHari, jamBuka, jamTutup, hariOperasional, pesanSanksi } = req.body;
    if (dendaPerHari !== undefined) settings.dendaPerHari = dendaPerHari;
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
