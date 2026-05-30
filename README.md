# 📚 Aplikasi Sistem Informasi Perpustakaan Sekolah

Sistem Manajemen Perpustakaan Sekolah berbasis Web yang dibangun menggunakan struktur arsitektur **MVC (Model-View-Controller)** pada backend dan **Component-Driven** pada frontend. Mendukung dua peran: **Admin (Pustakawan)** dan **Murid (Siswa)**.

## 🚀 Fitur Utama
- **Autentikasi Multi-Role**: Login khusus membedakan sesi untuk `admin` dan `murid`.
- **Manajemen Buku (CRUD)**: Pustakawan dapat menambah, mengedit, dan menghapus stok buku.
- **Dukungan Cover Buku Kekinian**: Admin dapat mengunggah gambar langsung dari komputer lokal atau menempel (*paste*) Link Google Drive (otomatis dikonversi ke format *direct link* untuk menembus proteksi CORS Google).
- **Sistem Booking & Peminjaman**: Murid dapat melakukan booking (pemesanan) buku dengan metode *Walk-in* harian.
- **Desain UI Modern & Responsif**: Menggunakan React 19 + Tailwind CSS v4 terbaru dengan gaya tampilan *Card Grid* di antarmuka Siswa.

---

## 📂 Struktur Folder
Aplikasi ini dikembangkan dalam bentuk *monorepo* yang berisi dua entitas utama terpisah. Konsep perpaduan spesifiknya tertulis di bawah ini:

```text
Aplikasi_Perpustakaan_Sekolah_React/
├── backend/                 # API Server (Node.js & Express)
│   ├── config/              # Konfigurasi Koneksi Database (MongoDB)
│   ├── controllers/         # Logika Utama / Pengolah request (MVC - Controller)
│   ├── models/              # Schema Database Mongoose (MVC - Model)
│   ├── routes/              # Routing URL API untuk mapping ke Controller
│   ├── uploads/             # Folder penyimpan gambar static hasil upload lokal
│   └── server.js            # Entry point backend
│
└── frontend/                # Client UI (React, Vite & Tailwind v4)
    ├── src/
    │   ├── components/      # Komponen Modular & Layout (Sidebar Admin & Murid)
    │   ├── pages/           # Halaman Utama (Dashboard, Login, Kelola Buku)
    │   ├── services/        # Konfigurasi Axios & interaksi ke API Backend
    │   ├── App.jsx          # Setup React Router DOM bersarang (Nested Route)
    │   └── main.jsx         # Entry point integrasi frontend
    ├── vite.config.js       # Konfigurasi Vite & Konfigurasi Proxy Network (LAN)
    └── index.css            # File direktif utama milik Tailwind CSS v4
```

---

## 🗄️ Flow Data & Skema Database (MongoDB)

Aplikasi memakai pendekatan Node/Express REST API. 
*Flow kerjanya*: Frontend merequest lewat `axios` (`/api/...`) dan diterima oleh `Routes` Backend -> Diteruskan secara logic ke `Controller` -> Menulis atau mengambil dari `Models` (Mongoose) -> Kembali ke Frontend sebagai JSON Response.

Aplikasi menggunakan 3 Schema utama:
1. **Koleksi `User`**: Atribut => `nis` (sebagai userID/username), `name`, `password` (untuk diproses auth), `role` (mendefinisikan `admin` atau `murid`).
2. **Koleksi `Book`**: Atribut => `title`, `author`, `stock`, `coverImage` (Bisa menampung link URL GDrive `https://lh3...` / url lokal server `/uploads/...`).
3. **Koleksi `Transaction`**: Menghubungkan ID `User` dan ID `Book` dalam logika peminjaman, serta status (`dipinjam`, `kembali`, `booking`).

---

## 🛠️ Panduan Instalasi & Deploy Lokal

### Syarat Wajib Sistem (Prerequisites)
Pastikan PC/Server Anda telah terinstall program berikut:
- **Node.js** (v18 atau yang lebih baru direkomendasikan)
- **Git** (Untuk memproses kloning kode base)
- **MongoDB Server** (Untuk database lokal, silakan abaikan jika menggunakan URI MongoDB Cloud/Atlas)

---

### A. Panduan Pengaktifan MongoDB (OS Spesifik)

#### 🪟 Lingkungan Windows 10/11:
1. Unduh file MSI [MongoDB Community Server](https://www.mongodb.com/try/download/community).
2. Lakukan instalasi metode *Complete*. Pastikan Anda tidak menghapus centang pada *"Install MongoDB as a Service"*.
3. Setelah instalasi selesai, MongoDB otomatis hidup (*running*) di *background* pada porta **27017**.

#### 🐧 Lingkungan Linux (Ubuntu / Debian / Linux Mint):
1. Lakukan instalasi dependensi MongoDB melalui terminal menggunakan sistem manajer paket `apt`:
   ```bash
   sudo apt update
   sudo apt install -y mongodb
   # Atau jika menggunakan dependensi resmi source terbaru (mongodb-org) dapat mengikuti panduannya di web spesifik mongodba.
   ```
2. Pastikan service mongod sudah aktif (*Start* & *Enable*) di Background:
   ```bash
   sudo systemctl start mongod
   sudo systemctl enable mongod
   sudo systemctl status mongod
   ```

---

### B. Tahap *Build* & Menjalankan Aplikasi

1️⃣ **Clone & Buka Folder Repository**
```bash
git clone <URL_REPO_ANDA>
cd Aplikasi_Perpustakaan_Sekolah_React
```

2️⃣ **Setup Environment Backend**
```bash
cd backend
npm install
```
Buat file bernama `.env` di dalam folder `backend/` berisikan script berikut:
```env
PORT=5000
DB_TYPE=MONGODB
# Jika Local:
MONGO_URI=mongodb://127.0.0.1:27017/perpus_sekolah
# Jika MongoDB Cloud: mongodb+srv://<user>:<password>@cluster...
```

3️⃣ **Hidupkan Backend & Taburkan Data Awalan (Seeding)**
```bash
# Menghidupkan Server Backend
npm run dev

# Di terminal *BARU*/TAB LAIN, jalankan command dibawah ini
# Ini bertujuan untuk men-generate Akun Admin, Murid dan Dua Buku contoh awal di Database
curl -X POST http://localhost:5000/api/seed
```
*Pastikan Backend menuntaskan teks pesannya: `"Server jalan di http://localhost:5000"`.*

4️⃣ **Setup Environment Frontend**
Buka terminal baru di *root* repository Anda:
```bash
cd frontend
npm install
```
Sama seperti backend, buat file bernama `.env` di dalam folder `frontend/` memuat kode pengarah *(reverse proxy)*:
```env
# Meredirect logic agar cocok digunakan baik di IP Komputer Lokal maupun via Jaringan WiFi ke HP
VITE_API_URL=/api
```
Jalankan dev-server Vite:
```bash
npm run dev
```

5️⃣ **Akses Sistem (Uji Coba Browser)**
- Buka terminal hasil `npm run dev` pada *frontend*.
- Aplikasi dapat diakses lewat internet atau peramban Chrome/Edge Anda di tautan:
  `http://localhost:5173`
- Anda juga bisa membuka alamat URL `http://192.168.x.x:5173` (*Network IP*) pada Smartphone/Tablet yang terkoneksi pada Wi-Fi yang sama untuk merasakan *Responsive Mobile Mode*.

✅ **Detail Akun Default dari Seeding Utama:**
*   🦸‍♂️ **Admin ID:** `admin` | Password: `admin`
*   👦 **Murid ID:** `1001` atau `1002` | Password: `password`
