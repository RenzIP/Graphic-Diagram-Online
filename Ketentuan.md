# 🧩 Tugas Besar Pemrograman III (Webservice)

## 🎯 Deskripsi Umum

Mahasiswa diminta membangun sebuah sistem web lengkap yang terdiri dari **Backend API** menggunakan **Golang Fiber** dan **Frontend Dashboard** menggunakan teknologi frontend bebas. Sistem wajib terhubung ke database **PostgreSQL berbasis Supabase**, memiliki fitur **autentikasi login dan register menggunakan JWT**, menyediakan **CRUD data utama**, terdokumentasi menggunakan **Swagger**, serta dideploy secara online.

Tema aplikasi **bebas**, tetapi **tidak boleh sama antar kelompok**. Setiap kelompok wajib mendaftarkan tema aplikasinya di grup WhatsApp agar tidak terjadi duplikasi tema.

1 Kelompok maksimal terdiri dari 2 orang

Contoh tema:

- Sistem Manajemen Produk dan Kategori
- Sistem Inventaris Barang
- Sistem Manajemen Data Mahasiswa dan Prodi
- Sistem Booking Ruangan
- Sistem Perpustakaan
- Sistem Manajemen Event
- Sistem Pengaduan Masyarakat
- Sistem Presensi Kegiatan
- dll

---

## 🔧 Teknologi Wajib

### Backend

- Bahasa: **Golang**
- Framework: **Fiber**
- ORM: **GORM**
- Database: **PostgreSQL menggunakan Supabase**
- Autentikasi: **JWT Bearer Token**
- Password Hashing: **bcrypt**
- API Documentation: **Swagger UI**
- Middleware: **CORS, Logger, dan JWT Authentication**
- Struktur project: **Modular Design**

### Frontend

- Teknologi frontend **bebas**:
  - React Vite disarankan
  - Boleh menggunakan Vue, Svelte, Next.js, dan lain-lain
- Komunikasi API menggunakan **Fetch, AJAX, atau Axios**
- Jika menggunakan React, disarankan menerapkan **Atomic Design**

### Deployment

- Backend wajib dideploy online
- Frontend wajib dideploy online
- Database menggunakan Supabase Cloud

Contoh platform deploy:

- Backend: Render, Railway, Koyeb, Fly.io, VPS, atau platform sejenis
- Frontend: Vercel, Netlify, GitHub Pages, Render Static Site, atau platform sejenis

---

## 🛠️ Spesifikasi Tugas

## 1. Backend API Golang Fiber

Backend dibuat menggunakan Golang Fiber dan terhubung ke PostgreSQL Supabase menggunakan GORM.

### A. Konfigurasi Database

Backend wajib menggunakan database **PostgreSQL Supabase**.

Contoh konfigurasi `.env`:

```env
SUPABASE_DSN=postgresql://username:password@host:5432/postgres
```

Catatan:

- `SUPABASE_DSN` digunakan untuk koneksi ke PostgreSQL Supabase.
- Jangan push file `.env` ke GitHub.

---

### B. Endpoint Autentikasi

Backend wajib memiliki endpoint autentikasi berikut:

| Method | Endpoint | Keterangan |
|---|---|---|
| `POST` | `/register` | Mendaftarkan user baru |
| `POST` | `/login` | Login user dan menghasilkan JWT |
| `PUT` | `/change-password` | Mengubah password user yang sedang login atau Mengubah password user tertentu khusus role admin |

Minimal data user:

- `id`
- `username`
- `password`
- `role`

Ketentuan autentikasi:

- Password wajib di-hash menggunakan **bcrypt**.
- Login wajib menghasilkan token **JWT**.
- Token dikirim dari frontend melalui header:

```text
Authorization: Bearer <token>
```

- Endpoint tertentu wajib diproteksi menggunakan middleware JWT.
- Role minimal terdiri dari `admin` dan `user`.

---

### C. Endpoint CRUD Data Utama

Setiap kelompok wajib membuat minimal **2 tabel utama** yang saling berelasi.

Contoh relasi:

- Produk dan Kategori
- Mahasiswa dan Prodi
- Buku dan Penulis
- Event dan Peserta
- Barang dan Supplier
- Ruangan dan Booking

Minimal endpoint CRUD:

| Method | Endpoint | Keterangan |
|---|---|---|
| `GET` | `/api/[resource]` | Mengambil semua data |
| `GET` | `/api/[resource]/:id` | Mengambil detail data berdasarkan ID |
| `POST` | `/api/[resource]` | Menambahkan data baru |
| `PUT` | `/api/[resource]/:id` | Mengubah data berdasarkan ID |
| `DELETE` | `/api/[resource]/:id` | Menghapus data berdasarkan ID |

Contoh endpoint:

```text
GET    /api/produk
GET    /api/produk/:id
POST   /api/produk
PUT    /api/produk/:id
DELETE /api/produk/:id
```

---

### D. Relasi Database PostgreSQL

Karena database menggunakan PostgreSQL, relasi dibuat menggunakan **foreign key**.

Contoh relasi:

```text
categories.id  -> products.category_id
prodis.id      -> mahasiswas.prodi_id
suppliers.id   -> products.supplier_id
```

Ketentuan minimal:

- Minimal terdapat **2 tabel**.
- Minimal terdapat **1 relasi foreign key**.
- Setiap tabel utama memiliki minimal **10 data**.
- Data boleh dibuat melalui endpoint, seed, atau insert manual di Supabase.

---

### E. Validasi Backend

Validasi wajib dilakukan di backend.

Contoh validasi:

- Field wajib diisi
- Format email valid
- Username tidak boleh duplikat
- ID unik
- Angka tidak boleh negatif
- Panjang teks minimal/maksimal
- Foreign key harus valid
- Data tidak boleh kosong saat insert/update
- dll.

Backend harus mengembalikan response error yang jelas, misalnya:

```json
{
  "message": "nama wajib diisi"
}
```

---

### F. Middleware Backend

Backend wajib menggunakan middleware berikut:

- `Logger`
- `CORS`
- `JWT Authentication`
- Role authorization, minimal untuk membedakan akses `admin` dan `user`

Contoh ketentuan role:

- `admin` dapat melakukan tambah, ubah, hapus data
- `user` hanya dapat melihat data

---

### G. Dokumentasi API Swagger

Backend wajib memiliki dokumentasi Swagger.

Ketentuan Swagger:

- Swagger UI dapat diakses melalui endpoint:

```text
/docs
```

- Swagger wajib mendokumentasikan:
  - Register
  - Login
  - Change password, jika ada
  - Get all data
  - Get detail data
  - Insert data
  - Update data
  - Delete data
- Endpoint yang membutuhkan token wajib diberi security `BearerAuth`.
- Mahasiswa wajib dapat mencoba endpoint langsung dari Swagger UI.

Contoh format token di tombol Authorize Swagger:

```text
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 2. Frontend Dashboard

Frontend digunakan sebagai dashboard untuk mengakses API backend.

### A. Halaman Minimal

Frontend wajib memiliki halaman berikut:

1. Login
2. Register
3. Dashboard utama
4. List data utama
5. Detail data
6. Form tambah data
7. Form edit data
8. Konfirmasi hapus data
9. Logout

Jika menggunakan lebih dari satu resource, minimal satu resource harus memiliki CRUD lengkap dari frontend.

---

### B. Autentikasi Frontend

Frontend wajib menerapkan autentikasi token.

Ketentuan:

- Setelah login berhasil, token disimpan di browser (`localStorage`).
- Token dikirim otomatis ke backend saat mengakses endpoint protected.
- Jika token tidak ada atau expired, user diarahkan kembali ke halaman login.
- Terdapat tombol logout untuk menghapus sesi login.
---

### C. Fitur Data Table

Tabel data minimal memiliki 6 kolom.

Contoh kolom:

```text
ID, Nama, Kategori, Deskripsi, Tanggal, Status
```

Fitur tabel wajib:

- Menampilkan data dari API
- Pencarian data
- Filter data
- Tombol detail
- Tombol edit
- Tombol delete
- Feedback jika data kosong
- Loading state saat mengambil data (nilai tambah)

---

### D. Form dan Validasi Frontend

Form insert dan edit wajib memiliki validasi sederhana di frontend.

Contoh validasi:

- Input wajib diisi
- Email harus valid
- Angka tidak boleh negatif
- Panjang teks minimal
- Select/dropdown wajib dipilih
- dll.

Frontend juga wajib menampilkan feedback saat aksi berhasil atau gagal, misalnya menggunakan alert, toast, SweetAlert, atau komponen pesan biasa.

---

## 3. Dokumentasi PDF

Setiap kelompok wajib membuat dokumentasi dalam format **PDF**.

Isi dokumentasi minimal:

1. Judul aplikasi
2. Nama anggota kelompok
3. Deskripsi singkat aplikasi
4. Desain database atau penjelasan relasi tabel
5. Screenshot tabel di Supabase
6. Screenshot hasil pengujian endpoint menggunakan Postman atau Swagger
7. Screenshot register dan login
8. Screenshot penggunaan token JWT
9. Screenshot CRUD data utama
10. Screenshot halaman frontend
11. Penjelasan setiap screenshot
12. Link repository GitHub backend
13. Link repository GitHub frontend
14. Link deploy backend
15. Link deploy frontend
16. Link Swagger UI backend

---

## ✅ Fitur Wajib

Berikut fitur wajib yang harus ada pada tugas besar:

- Backend menggunakan Golang Fiber
- Database menggunakan PostgreSQL Supabase
- Koneksi database menggunakan GORM
- Autentikasi menggunakan JWT
- Password disimpan menggunakan bcrypt
- Register dan login
- Middleware JWT
- Role authorization minimal `admin` dan `user`
- CRUD minimal 1 resource utama
- Minimal 2 tabel utama yang saling berelasi menggunakan foreign key
- Minimal 10 data per tabel utama
- Validasi backend
- Validasi frontend
- Dokumentasi Swagger
- Frontend dashboard
- Pencarian dan filter data
- Deploy backend
- Deploy frontend
- Dokumentasi PDF
- Repository GitHub backend dan frontend

---

## 🌟 Nilai Tambahan (Bonus)

Nilai tambahan diberikan jika fitur dikerjakan dengan baik dan dapat dijelaskan saat presentasi.

Contoh fitur bonus:

- Visualisasi data menggunakan Chart.js, ApexCharts, Recharts, dan sejenisnya
- Export data ke PDF
- Export data ke Excel
- Upload gambar atau file
- Pagination server-side
- Sorting data
- Responsive layout
- Dark mode
- Dashboard statistik
- Middleware keamanan tambahan
- Refresh token
- Fitur tambahan lain yang belum pernah dipelajari di kelas

---

## 📁 Struktur Project yang Disarankan

### Backend

```text
backend/
├── config/
│   ├── database.go
│   └── middleware/
├── docs/
├── handler/
├── model/
├── repository/
├── router/
├── pkg/
├── .env
├── go.mod
└── main.go
```
Catatan:
Struktur backend di atas adalah struktur minimal yang disarankan. Backend wajib menerapkan pemisahan layer, minimal terdapat `handler` untuk menangani request/response API dan `repository` untuk komunikasi dengan database PostgreSQL/Supabase. Mahasiswa diperbolehkan menambahkan direktori lain sesuai kebutuhan project, selama struktur tetap rapi, konsisten, modular, dan dapat dijelaskan dengan baik.

### Frontend React, jika menggunakan React

```text
frontend/
├── src/
│   ├── components/
│   │   ├── atoms/
│   │   ├── molecules/
│   │   ├── organisms/
│   │   └── layout/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   └── App.jsx
├── .env
├── package.json
└── index.html
```

Catatan:
Struktur frontend boleh menyesuaikan framework atau pendekatan yang digunakan. Jika menggunakan React, mahasiswa disarankan menerapkan struktur yang rapi seperti pemisahan components, pages, routes, dan services. Yang terpenting adalah project mudah dibaca, konsisten, dan dapat dijelaskan dengan baik.

---

## 🚀 Ketentuan Deployment

### Backend

Backend wajib berjalan secara online dan dapat diakses melalui URL publik.

Pastikan:

- Environment variable sudah diatur di platform deploy
- Backend dapat terhubung ke Supabase
- CORS mengizinkan domain frontend
- Endpoint `/docs` dapat dibuka
- Endpoint API dapat diuji melalui Postman atau Swagger

### Frontend

Frontend wajib berjalan secara online dan dapat mengakses backend yang sudah dideploy.

Pastikan:

- Base URL API mengarah ke URL backend deploy
- Login/register berjalan
- Token berhasil dikirim ke backend
- CRUD dapat berjalan dari frontend

---

## 📅 Timeline dan Pengumpulan

- Batas pengumpulan tugas besar: **seminggu sebelum jadwal UAS**
- Presentasi tugas besar: **saat pertemuan asesmen** atau boleh sebelum pertemuan asesmen
- Telat pengumpulan akan mendapatkan pengurangan nilai
- Link pengumpulan: **menyusul**

---

## 📦 Format Pengumpulan

Setiap kelompok mengumpulkan:

1. Link repository GitHub backend
2. Link repository GitHub frontend
3. Link deploy backend
4. Link deploy frontend
5. Link Swagger UI backend
6. File dokumentasi PDF

---

## 📝 Catatan Penting

- Tema tidak boleh sama antar kelompok.
- Database wajib menggunakan PostgreSQL Supabase.
- Backend wajib menggunakan Golang Fiber.
- Endpoint protected wajib menggunakan JWT.
- Dokumentasi Swagger wajib dapat dibuka dan digunakan.
- Frontend wajib benar-benar terhubung ke backend deploy.
- Semua anggota kelompok harus memahami fitur yang dibuat.
- Saat presentasi, mahasiswa harus bisa menjelaskan alur login, token, relasi database, CRUD, deployment, dll.

---

Selamat mengerjakan tugas besar. Buat aplikasi yang rapi, jelas, dan bisa dijelaskan dengan baik saat presentasi.