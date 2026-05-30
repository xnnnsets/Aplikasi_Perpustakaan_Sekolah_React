import mongoose from 'mongoose';

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: String,
  stock: { type: Number, required: true, default: 1 }
});
export default mongoose.model('Book', BookSchema);
