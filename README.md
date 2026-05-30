# Sistem Informasi Perpustakaan Sekolah (React + Express)

Aplikasi perpustakaan modern berbasis Web dengan arsitektur **MVC** (Model-View-Controller) untuk penggunaan internal sekolah. Memisahkan antarmuka klien (Frontend) dengan layanan logika (Backend) secara rapi untuk skalabilitas E2E.

## 🔄 Alur Sistem Bisnis (Workflow)
Sistem ini memfasilitasi 2 jalur utama peminjaman yang akhirnya akan divalidasi oleh petugas di perpustakaan:
1. **Jalur A (Booking Web):** Murid memesan buku dari aplikasi web. Stok akan otomatis direvervasi (terkunci). Murid kemudian harus datang untuk mengambil fisik buku ke meja petugas.
2. **Jalur B (Walk-In):** Murid langsung datang ke rak perpustakaan mencari buku, lalu membawanya ke meja petugas.
3. **Validasi Terpusat:** Di meja petugas, NIS (Nomor Induk Siswa) akan dipindai/diinput. **Gatekeeping Logic**: Jika murid tersebut memiliki tunggakan denda atau kuota pinjam sudah penuh (maksimal 3 transaksi berjalan), sistem akan otomatis memblokir sirkulasi baru.
4. **Sirkulasi Denda Otomatis:** Sistem mendeteksi tanggal pengembalian (*default* 7 hari). Apabila murid terlambat mengembalikan buku, pada saat proses "Terima Kembali" oleh Admin, sistem otomatis mengalkulasi denda (Rp1.000/hari keterlambatan) yang akan dibebankan ke dalam status hutang siswa.

## 🚀 Teknologi Utama
- **Frontend:** React, Vite, Tailwind CSS, React Router, Axios, React Hot Toast
- **Backend:** Node.js, Express, Mongoose (MongoDB)

## 💻 Cara Menjalankan untuk Uji Coba & Testing Lokal

Dibutuhkan Node.js dan MongoDB (lokal atau cloud) yang aktif.

1. **Setup Dependencies:**
   Jalankan ini dari direktori *root*:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
2. **Konfigurasi Environment:**
   - Duplikasi file `.env.example` ke `.env` di folder `backend`. Pastikan `MONGO_URI` mengarah ke database Anda.
   - Duplikasi file `.env.example` ke `.env` di folder `frontend`. Pastikan `VITE_API_URL` mengarah ke localhost backend.
3. **Mulai Layanan:**
   - **Backend:** Buka terminal ke-1, jalankan `cd backend && npm start` (Akan berjalan di http://localhost:5000)
   - **Frontend:** Buka terminal ke-2, jalankan `cd frontend && npm run dev` (Akan berjalan di http://localhost:5173)
4. **Seeding Data Otomatis:**
   Buka terminal khusus (baru) kemudian tembak endpoint berikut, maka database perpustakaan akan langsung terisi *dummy data*:
   ```bash
   curl -X POST http://localhost:5000/api/seed
   ```
   *Anda dapat langsung login menggunakan:*
   - **Sebagai Murid:** NIS: `1001` , Password: `password`
   - **Sebagai Admin:** NIS/ID: `admin` , Password: `admin`

## 🌐 Cara Deploy (Production)
Untuk membawa proyek ini ke *Production* (Internet Publik), ikuti 3 langkah berikut:
1. **Database:** Gunakan layanan seperti **MongoDB Atlas**. Buat cluster, ambil *Connection String* untuk disisipkan.
2. **Backend (Render / Railway / VPS):**
   * Hubungkan repository ke layanan hosting Backend.
   * *Root Directory*: `/backend`
   * *Build / Start Command*: `npm install` dan `npm start`
   * Masukkan Environment Variables: `MONGO_URI` (dari Atlas) dan port yang sesuai.
3. **Frontend (Vercel / Netlify):**
   * Hubungkan repository ke layanan hosting Frontend.
   * *Root Directory*: `/frontend`
   * *Build Command*: `npm run build`
   * *Output Dir*: `dist`
   * Tambahkan Environment Variable: `VITE_API_URL` dengan rute publik URL backend Anda (Misal: `https://backend-perpus.onrender.com/api`).
