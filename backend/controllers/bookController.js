import Book from '../models/Book.js';

export const getBooks = async (req, res) => res.json(await Book.find());
export const createBook = async (req, res) => { try { res.json(await Book.create(req.body)); } catch(err) { res.status(400).json({message: 'Gagal menambah buku'}); } };
export const updateBook = async (req, res) => { try { res.json(await Book.findByIdAndUpdate(req.params.id, req.body, {new: true})); } catch(err) { res.status(400).json({message: 'Gagal mengubah buku'}); } };
export const deleteBook = async (req, res) => { try { await Book.findByIdAndDelete(req.params.id); res.json({message: 'Terhapus'}); } catch(err) { res.status(400).json({message:'Gagal hapus'}); } };
