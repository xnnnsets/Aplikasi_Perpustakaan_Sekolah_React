import User from '../models/User.js';

export const loginUser = async (req, res) => {
  const { nis, password } = req.body;
  const user = await User.findOne({ nis, password });
  if (user) {
    res.json(user);
  } else {
    res.status(401).json({ message: 'NIS atau Password salah' });
  }
};
