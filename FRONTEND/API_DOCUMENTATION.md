# API Documentation - E-Jurnal Guru Backend

Dokumentasi lengkap untuk Backend Express.js + MySQL

## 📋 Table of Contents
1. [Setup & Configuration](#setup--configuration)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [Request/Response Examples](#requestresponse-examples)
5. [Error Handling](#error-handling)

---

## Setup & Configuration

### Environment Variables
Buat file `.env` di root project backend:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ejurnal_guru

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Secret (optional, jika pakai JWT)
JWT_SECRET=your_jwt_secret_key
```

### CORS Configuration
Di file `server.js` atau `app.js`, tambahkan CORS:

```javascript
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();

// CORS - Allow frontend dari Replit
app.use(cors({
  origin: ['http://localhost:5000', 'https://your-replit-url.repl.co'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Export pool untuk digunakan di routes
module.exports = { pool };
```

---

## Database Schema

### 1. Table `users`
Menyimpan data pengguna (Admin, Guru, Kepala Sekolah)

```sql
CREATE TABLE users (
  nip VARCHAR(50) PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'guru', 'kepsek') NOT NULL,
  jurusan VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2. Table `guru_kelas` (Many-to-Many)
Relasi guru dengan kelas yang diampu

```sql
CREATE TABLE guru_kelas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  guru_nip VARCHAR(50) NOT NULL,
  kelas VARCHAR(50) NOT NULL,
  FOREIGN KEY (guru_nip) REFERENCES users(nip) ON DELETE CASCADE,
  UNIQUE KEY unique_guru_kelas (guru_nip, kelas)
);
```

### 3. Table `guru_mapel` (Many-to-Many)
Relasi guru dengan mata pelajaran

```sql
CREATE TABLE guru_mapel (
  id INT AUTO_INCREMENT PRIMARY KEY,
  guru_nip VARCHAR(50) NOT NULL,
  mapel VARCHAR(255) NOT NULL,
  FOREIGN KEY (guru_nip) REFERENCES users(nip) ON DELETE CASCADE,
  UNIQUE KEY unique_guru_mapel (guru_nip, mapel)
);
```

### 4. Table `siswa`
Data siswa

```sql
CREATE TABLE siswa (
  nis VARCHAR(50) PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  kelas VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. Table `jurnal`
Jurnal agenda harian

```sql
CREATE TABLE jurnal (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tanggal DATE NOT NULL,
  kelas VARCHAR(50) NOT NULL,
  guru_nip VARCHAR(50) NOT NULL,
  mapel VARCHAR(255) NOT NULL,
  materi TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (guru_nip) REFERENCES users(nip) ON DELETE CASCADE,
  INDEX idx_tanggal (tanggal),
  INDEX idx_kelas (kelas),
  INDEX idx_guru (guru_nip)
);
```

### 6. Table `absensi`
Header absensi

```sql
CREATE TABLE absensi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tanggal DATE NOT NULL,
  kelas VARCHAR(50) NOT NULL,
  guru_nip VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (guru_nip) REFERENCES users(nip) ON DELETE CASCADE,
  INDEX idx_tanggal (tanggal),
  INDEX idx_kelas (kelas)
);
```

### 7. Table `absensi_detail`
Detail absensi per siswa

```sql
CREATE TABLE absensi_detail (
  id INT AUTO_INCREMENT PRIMARY KEY,
  absensi_id INT NOT NULL,
  siswa_nis VARCHAR(50) NOT NULL,
  status ENUM('Hadir', 'Sakit', 'Izin', 'Alfa') NOT NULL,
  FOREIGN KEY (absensi_id) REFERENCES absensi(id) ON DELETE CASCADE,
  FOREIGN KEY (siswa_nis) REFERENCES siswa(nis) ON DELETE CASCADE,
  INDEX idx_absensi (absensi_id),
  INDEX idx_siswa (siswa_nis)
);
```

---

## API Endpoints

### Base URL
```
http://localhost:3000/api
```

---

### 🔐 Authentication

#### 1. POST `/api/auth/login`
Login untuk semua role (Admin, Guru, Kepsek)

**Request Body:**
```json
{
  "nip": "198227272",
  "password": "123guru"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "user": {
    "nip": "198227272",
    "nama": "Iyan Hadi Permana",
    "role": "guru",
    "jurusan": "RPL",
    "kelas": ["10 RPL 1", "10 RPL 2", "10 RPL 3"],
    "mapel": ["Algoritma Pemrograman", "Dasar-dasar Pemrograman", "Android"]
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // Optional jika pakai JWT
}
```

**Response Error (401):**
```json
{
  "success": false,
  "message": "NIP atau Password salah"
}
```

**Implementation Example:**
```javascript
const bcrypt = require('bcryptjs');

router.post('/auth/login', async (req, res) => {
  try {
    const { nip, password } = req.body;

    // Validate input
    if (!nip || !password) {
      return res.status(400).json({
        success: false,
        message: 'NIP dan password harus diisi'
      });
    }

    // Get user from database
    const [users] = await pool.query(
      'SELECT * FROM users WHERE nip = ?',
      [nip]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'NIP atau Password salah'
      });
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'NIP atau Password salah'
      });
    }

    // Get kelas & mapel jika guru
    let kelas = [];
    let mapel = [];

    if (user.role === 'guru') {
      const [kelasRows] = await pool.query(
        'SELECT kelas FROM guru_kelas WHERE guru_nip = ?',
        [nip]
      );
      kelas = kelasRows.map(row => row.kelas);

      const [mapelRows] = await pool.query(
        'SELECT mapel FROM guru_mapel WHERE guru_nip = ?',
        [nip]
      );
      mapel = mapelRows.map(row => row.mapel);
    }

    // Return user data
    res.json({
      success: true,
      user: {
        nip: user.nip,
        nama: user.nama,
        role: user.role,
        jurusan: user.jurusan,
        kelas,
        mapel
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});
```

---

### 👨‍💼 Admin Endpoints

#### 2. POST `/api/admin/register`
Register guru atau kepala sekolah baru

**Request Body:**
```json
{
  "nip": "198312345",
  "nama": "Siti Nurhaliza",
  "role": "Guru",
  "jurusan": "TKJ",
  "kelas": ["11 TKJ 1", "11 TKJ 2"],
  "mapel": ["Bahasa Indonesia", "Bahasa Inggris"],
  "password": "password123"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Akun Guru berhasil didaftarkan"
}
```

**Implementation Example:**
```javascript
router.post('/admin/register', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { nip, nama, role, jurusan, kelas, mapel, password } = req.body;

    // Validate
    if (!nip || !nama || !password) {
      return res.status(400).json({
        success: false,
        message: 'NIP, nama, dan password wajib diisi'
      });
    }

    // Check if NIP already exists
    const [existing] = await connection.query(
      'SELECT nip FROM users WHERE nip = ?',
      [nip]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'NIP sudah terdaftar'
      });
    }

    // Start transaction
    await connection.beginTransaction();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    await connection.query(
      'INSERT INTO users (nip, nama, password, role, jurusan) VALUES (?, ?, ?, ?, ?)',
      [nip, nama, hashedPassword, role.toLowerCase(), jurusan]
    );

    // Insert kelas & mapel if guru
    if (role.toLowerCase() === 'guru') {
      for (const kelasItem of kelas) {
        await connection.query(
          'INSERT INTO guru_kelas (guru_nip, kelas) VALUES (?, ?)',
          [nip, kelasItem]
        );
      }

      for (const mapelItem of mapel) {
        await connection.query(
          'INSERT INTO guru_mapel (guru_nip, mapel) VALUES (?, ?)',
          [nip, mapelItem]
        );
      }
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: `Akun ${role} berhasil didaftarkan`
    });

  } catch (error) {
    await connection.rollback();
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mendaftarkan pengguna'
    });
  } finally {
    connection.release();
  }
});
```

#### 3. GET `/api/admin/users`
Get semua user yang terdaftar

**Response Success (200):**
```json
{
  "users": [
    {
      "nip": "198227272",
      "nama": "Iyan Hadi Permana",
      "role": "guru",
      "jurusan": "RPL",
      "kelas": ["10 RPL 1", "10 RPL 2"],
      "mapel": ["Algoritma Pemrograman", "Android"]
    }
  ]
}
```

---

### 👨‍🏫 Guru Endpoints

#### 4. GET `/api/guru/kelas/:guruNip`
Get daftar kelas yang diampu oleh guru

**Response Success (200):**
```json
{
  "kelas": ["10 RPL 1", "10 RPL 2", "10 RPL 3"]
}
```

#### 5. GET `/api/guru/siswa/:namaKelas`
Get daftar siswa dalam satu kelas

**URL Example:** `/api/guru/siswa/10%20RPL%201`

**Response Success (200):**
```json
{
  "siswa": [
    {
      "nis": "2024001",
      "nama": "Ahmad Fauzi",
      "kelas": "10 RPL 1"
    },
    {
      "nis": "2024002",
      "nama": "Dewi Lestari",
      "kelas": "10 RPL 1"
    }
  ]
}
```

---

### 📝 Jurnal Endpoints

#### 6. POST `/api/jurnal`
Create jurnal agenda harian

**Request Body:**
```json
{
  "tanggal": "2024-01-15",
  "kelas": "10 RPL 1",
  "guru": "Iyan Hadi Permana",
  "mapel": "Algoritma Pemrograman",
  "materi": "Pengenalan algoritma sorting: Bubble Sort dan Selection Sort"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "id": "123",
  "message": "Jurnal berhasil disimpan"
}
```

**Implementation Example:**
```javascript
router.post('/jurnal', async (req, res) => {
  try {
    const { tanggal, kelas, guru, mapel, materi } = req.body;

    // Validate
    if (!tanggal || !kelas || !guru || !mapel || !materi) {
      return res.status(400).json({
        success: false,
        message: 'Semua field wajib diisi'
      });
    }

    // Get guru NIP from nama
    const [guruRows] = await pool.query(
      'SELECT nip FROM users WHERE nama = ? AND role = ?',
      [guru, 'guru']
    );

    if (guruRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Guru tidak ditemukan'
      });
    }

    const guruNip = guruRows[0].nip;

    // Insert jurnal
    const [result] = await pool.query(
      'INSERT INTO jurnal (tanggal, kelas, guru_nip, mapel, materi) VALUES (?, ?, ?, ?, ?)',
      [tanggal, kelas, guruNip, mapel, materi]
    );

    res.status(201).json({
      success: true,
      id: result.insertId.toString(),
      message: 'Jurnal berhasil disimpan'
    });

  } catch (error) {
    console.error('Create jurnal error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menyimpan jurnal'
    });
  }
});
```

#### 7. GET `/api/jurnal`
Get semua jurnal (untuk Kepsek)

**Response Success (200):**
```json
{
  "jurnal": [
    {
      "id": "1",
      "tanggal": "2024-01-15",
      "kelas": "10 RPL 1",
      "guru": "Iyan Hadi Permana",
      "mapel": "Algoritma Pemrograman",
      "materi": "Pengenalan algoritma sorting"
    }
  ]
}
```

---

### ✅ Absensi Endpoints

#### 8. POST `/api/absensi`
Create absensi siswa

**Request Body:**
```json
{
  "tanggal": "2024-01-15",
  "kelas": "10 RPL 1",
  "guru": "Iyan Hadi Permana",
  "siswa": [
    {
      "nis": "2024001",
      "nama": "Ahmad Fauzi",
      "status": "Hadir"
    },
    {
      "nis": "2024002",
      "nama": "Dewi Lestari",
      "status": "Sakit"
    }
  ]
}
```

**Response Success (201):**
```json
{
  "success": true,
  "id": "456",
  "message": "Absensi berhasil disimpan"
}
```

**Implementation Example:**
```javascript
router.post('/absensi', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { tanggal, kelas, guru, siswa } = req.body;

    // Validate
    if (!tanggal || !kelas || !guru || !siswa || siswa.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Semua field wajib diisi'
      });
    }

    // Get guru NIP
    const [guruRows] = await connection.query(
      'SELECT nip FROM users WHERE nama = ? AND role = ?',
      [guru, 'guru']
    );

    if (guruRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Guru tidak ditemukan'
      });
    }

    const guruNip = guruRows[0].nip;

    await connection.beginTransaction();

    // Insert absensi header
    const [absensiResult] = await connection.query(
      'INSERT INTO absensi (tanggal, kelas, guru_nip) VALUES (?, ?, ?)',
      [tanggal, kelas, guruNip]
    );

    const absensiId = absensiResult.insertId;

    // Insert absensi details
    for (const siswaItem of siswa) {
      await connection.query(
        'INSERT INTO absensi_detail (absensi_id, siswa_nis, status) VALUES (?, ?, ?)',
        [absensiId, siswaItem.nis, siswaItem.status]
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      id: absensiId.toString(),
      message: 'Absensi berhasil disimpan'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Create absensi error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menyimpan absensi'
    });
  } finally {
    connection.release();
  }
});
```

#### 9. GET `/api/absensi`
Get semua absensi (untuk Kepsek)

**Response Success (200):**
```json
{
  "absensi": [
    {
      "id": "1",
      "tanggal": "2024-01-15",
      "kelas": "10 RPL 1",
      "guru": "Iyan Hadi Permana",
      "siswa": [
        {
          "nis": "2024001",
          "nama": "Ahmad Fauzi",
          "status": "Hadir"
        }
      ]
    }
  ]
}
```

---

### 📊 Kepsek Endpoints

#### 10. GET `/api/kepsek/statistics`
Get statistik untuk dashboard kepala sekolah

**Response Success (200):**
```json
{
  "totalGuru": 5,
  "totalKelas": 10,
  "totalSiswa": 250,
  "tingkatKehadiran": 92
}
```

**Implementation Example:**
```javascript
router.get('/kepsek/statistics', async (req, res) => {
  try {
    // Count total guru
    const [guruCount] = await pool.query(
      'SELECT COUNT(*) as total FROM users WHERE role = ?',
      ['guru']
    );

    // Count total kelas (unique)
    const [kelasCount] = await pool.query(
      'SELECT COUNT(DISTINCT kelas) as total FROM guru_kelas'
    );

    // Count total siswa
    const [siswaCount] = await pool.query(
      'SELECT COUNT(*) as total FROM siswa'
    );

    // Calculate tingkat kehadiran (rata-rata bulan ini)
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const [absensiStats] = await pool.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Hadir' THEN 1 ELSE 0 END) as hadir
       FROM absensi_detail ad
       JOIN absensi a ON ad.absensi_id = a.id
       WHERE a.tanggal BETWEEN ? AND ?`,
      [firstDay.toISOString().split('T')[0], lastDay.toISOString().split('T')[0]]
    );

    const tingkatKehadiran = absensiStats[0].total > 0
      ? Math.round((absensiStats[0].hadir / absensiStats[0].total) * 100)
      : 0;

    res.json({
      totalGuru: guruCount[0].total,
      totalKelas: kelasCount[0].total,
      totalSiswa: siswaCount[0].total,
      tingkatKehadiran
    });

  } catch (error) {
    console.error('Statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil statistik'
    });
  }
});
```

---

## Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "message": "Pesan error yang jelas"
}
```

### HTTP Status Codes
- `200` - Success (GET requests)
- `201` - Created (POST requests)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (login failed)
- `404` - Not Found
- `500` - Internal Server Error

---

## Testing dengan Postman/Insomnia

### 1. Login Test
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "nip": "198227272",
  "password": "123guru"
}
```

### 2. Register Guru Test
```
POST http://localhost:3000/api/admin/register
Content-Type: application/json

{
  "nip": "198312345",
  "nama": "Test Guru",
  "role": "Guru",
  "jurusan": "RPL",
  "kelas": ["10 RPL 1"],
  "mapel": ["Matematika"],
  "password": "test123"
}
```

---

## Notes
- Pastikan semua password di-hash pakai bcrypt sebelum disimpan ke database
- Gunakan prepared statements untuk menghindari SQL injection
- Implementasikan rate limiting untuk endpoint login
- Tambahkan JWT authentication jika diperlukan
- Gunakan transactions untuk operasi yang melibatkan multiple tables

---

**Dibuat untuk:** Frontend E-Jurnal Guru (React + Shadcn UI)  
**Backend Stack:** Express.js + MySQL  
**Versi:** 1.0.0
