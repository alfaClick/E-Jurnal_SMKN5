import express from 'express';
import { checkAuth, checkRole } from '../middlewares/auth.middlewares.js';
import {
  registerGuru,
  createMapel,
  getAllMapel,
  updateMapel,
  deleteMapel,
  createJadwal,
  getAllJadwal,
  getJadwalByGuru,
  deleteJadwal,
  createKelas,
  getAllKelas,
  updateKelas,
  deleteKelas,
  createJurusan,
  getAllJurusan,
  updateJurusan,
  deleteJurusan,
  createSiswa,
  getAllSiswa,
  updateSiswa,
  deleteSiswa,
  getAllUsers
} from '../controllers/admin.controllers.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Admin - Auth & Users
 *     description: API untuk mendaftarkan dan mengelola data user (Guru & Kepsek)
 *   - name: Admin - Mapel
 *     description: API untuk mengelola data master Mata Pelajaran
 *   - name: Admin - Jurusan
 *     description: API untuk mengelola data master Jurusan
 *   - name: Admin - Kelas
 *     description: API untuk mengelola data master Kelas
 *   - name: Admin - Siswa
 *     description: API untuk mengelola data master Siswa
 *   - name: Admin - Jadwal
 *     description: API untuk mengelola penugasan Jadwal Guru
 */

// =======================================================
// AUTH & USERS
// =======================================================

/**
 * @swagger
 * /admin/register:
 *   post:
 *     summary: (Admin) Mendaftarkan Guru atau Kepsek baru
 *     tags: [Admin - Auth & Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nip, nama_lengkap, password, role]
 *             properties:
 *               nip:
 *                 type: string
 *               nama_lengkap:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [guru, kepsek]
 *               id_jurusan:
 *                 type: integer
 *                 description: Opsional, untuk guru produktif
 *     responses:
 *       '201':
 *         description: User berhasil dibuat
 *       '400':
 *         description: Data tidak lengkap
 *       '409':
 *         description: NIP sudah terdaftar
 */
router.post('/register', checkAuth, checkRole(['admin']), registerGuru);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: (Admin) Mengambil semua data user (Guru & Kepsek)
 *     tags: [Admin - Auth & Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Sukses mengambil data user
 */
router.get('/users', checkAuth, checkRole(['admin']), getAllUsers);

// =======================================================
// MATA PELAJARAN
// =======================================================

/**
 * @swagger
 * /admin/mapel:
 *   post:
 *     summary: (Admin) Membuat Mapel baru
 *     tags: [Admin - Mapel]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nama_mapel]
 *             properties:
 *               nama_mapel:
 *                 type: string
 *                 example: "Bahasa Jepang"
 *     responses:
 *       '201':
 *         description: Mapel berhasil dibuat
 *       '409':
 *         description: Nama mapel sudah ada
 */
router.post('/mapel', checkAuth, checkRole(['admin']), createMapel);

/**
 * @swagger
 * /admin/mapel:
 *   get:
 *     summary: (Admin) Mengambil semua data Mapel
 *     tags: [Admin - Mapel]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Sukses mengambil data
 */
router.get('/mapel', checkAuth, checkRole(['admin']), getAllMapel);

/**
 * @swagger
 * /admin/mapel/{id}:
 *   put:
 *     summary: (Admin) Mengupdate data Mapel
 *     tags: [Admin - Mapel]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID Mapel
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nama_mapel:
 *                 type: string
 *                 example: "Matematika Wajib"
 *     responses:
 *       '200':
 *         description: Mapel berhasil diupdate
 *       '404':
 *         description: Mapel tidak ditemukan
 */
router.put('/mapel/:id', checkAuth, checkRole(['admin']), updateMapel);

/**
 * @swagger
 * /admin/mapel/{id}:
 *   delete:
 *     summary: (Admin) Menghapus data Mapel
 *     tags: [Admin - Mapel]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID Mapel
 *     responses:
 *       '200':
 *         description: Mapel berhasil dihapus
 *       '404':
 *         description: Mapel tidak ditemukan
 */
router.delete('/mapel/:id', checkAuth, checkRole(['admin']), deleteMapel);

// =======================================================
// JURUSAN
// =======================================================

/**
 * @swagger
 * /admin/jurusan:
 *   post:
 *     summary: (Admin) Membuat Jurusan baru
 *     tags: [Admin - Jurusan]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nama_jurusan]
 *             properties:
 *               nama_jurusan:
 *                 type: string
 *                 example: "Teknik Komputer dan Jaringan"
 *     responses:
 *       '201':
 *         description: Jurusan berhasil dibuat
 */
router.post('/jurusan', checkAuth, checkRole(['admin']), createJurusan);

/**
 * @swagger
 * /admin/jurusan:
 *   get:
 *     summary: (Admin) Mengambil semua data Jurusan
 *     tags: [Admin - Jurusan]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Sukses mengambil data jurusan
 */
router.get('/jurusan', checkAuth, checkRole(['admin']), getAllJurusan);

/**
 * @swagger
 * /admin/jurusan/{id}:
 *   put:
 *     summary: (Admin) Mengupdate data Jurusan
 *     tags: [Admin - Jurusan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID Jurusan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nama_jurusan:
 *                 type: string
 *                 example: "Teknik Elektro"
 *     responses:
 *       '200':
 *         description: Jurusan berhasil diupdate
 *       '404':
 *         description: Jurusan tidak ditemukan
 */
router.put('/jurusan/:id', checkAuth, checkRole(['admin']), updateJurusan);

/**
 * @swagger
 * /admin/jurusan/{id}:
 *   delete:
 *     summary: (Admin) Menghapus data Jurusan
 *     tags: [Admin - Jurusan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID Jurusan
 *     responses:
 *       '200':
 *         description: Jurusan berhasil dihapus
 *       '404':
 *         description: Jurusan tidak ditemukan
 */
router.delete('/jurusan/:id', checkAuth, checkRole(['admin']), deleteJurusan);

// =======================================================
// KELAS
// =======================================================

/**
 * @swagger
 * /admin/kelas:
 *   post:
 *     summary: (Admin) Membuat data Kelas baru
 *     tags: [Admin - Kelas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nama_kelas, id_jurusan]
 *             properties:
 *               nama_kelas:
 *                 type: string
 *                 example: "XII RPL 1"
 *               id_jurusan:
 *                 type: integer
 *                 example: 1
 *               id_wali_kelas:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       '201':
 *         description: Kelas berhasil dibuat
 */
router.post('/kelas', checkAuth, checkRole(['admin']), createKelas);

/**
 * @swagger
 * /admin/kelas:
 *   get:
 *     summary: (Admin) Mengambil semua data Kelas
 *     tags: [Admin - Kelas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Sukses mengambil data kelas
 */
router.get('/kelas', checkAuth, checkRole(['admin']), getAllKelas);

/**
 * @swagger
 * /admin/kelas/{id}:
 *   put:
 *     summary: (Admin) Mengupdate data Kelas
 *     tags: [Admin - Kelas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID Kelas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nama_kelas:
 *                 type: string
 *               id_jurusan:
 *                 type: integer
 *               id_wali_kelas:
 *                 type: integer
 *     responses:
 *       '200':
 *         description: Kelas berhasil diupdate
 *       '404':
 *         description: Kelas tidak ditemukan
 */
router.put('/kelas/:id', checkAuth, checkRole(['admin']), updateKelas);

/**
 * @swagger
 * /admin/kelas/{id}:
 *   delete:
 *     summary: (Admin) Menghapus data Kelas
 *     tags: [Admin - Kelas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID Kelas
 *     responses:
 *       '200':
 *         description: Kelas berhasil dihapus
 *       '404':
 *         description: Kelas tidak ditemukan
 */
router.delete('/kelas/:id', checkAuth, checkRole(['admin']), deleteKelas);

// =======================================================
// SISWA
// =======================================================

/**
 * @swagger
 * /admin/siswa:
 *   post:
 *     summary: (Admin) Membuat data Siswa baru
 *     tags: [Admin - Siswa]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nama_lengkap, nis, id_kelas]
 *             properties:
 *               nama_lengkap:
 *                 type: string
 *                 example: "Budi Setiawan"
 *               nis:
 *                 type: string
 *                 example: "20241023"
 *               id_kelas:
 *                 type: integer
 *                 example: 1
 *               jenis_kelamin:
 *                 type: string
 *                 enum: [L, P]
 *     responses:
 *       '201':
 *         description: Siswa berhasil dibuat
 */
router.post('/siswa', checkAuth, checkRole(['admin']), createSiswa);

/**
 * @swagger
 * /admin/siswa:
 *   get:
 *     summary: (Admin) Mengambil semua data Siswa
 *     tags: [Admin - Siswa]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Sukses mengambil data siswa
 */
router.get('/siswa', checkAuth, checkRole(['admin']), getAllSiswa);

/**
 * @swagger
 * /admin/siswa/{id}:
 *   put:
 *     summary: (Admin) Mengupdate data Siswa
 *     tags: [Admin - Siswa]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID Siswa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nama_lengkap:
 *                 type: string
 *               nis:
 *                 type: string
 *               id_kelas:
 *                 type: integer
 *               jenis_kelamin:
 *                 type: string
 *                 enum: [L, P]
 *     responses:
 *       '200':
 *         description: Siswa berhasil diupdate
 *       '404':
 *         description: Siswa tidak ditemukan
 */
router.put('/siswa/:id', checkAuth, checkRole(['admin']), updateSiswa);

/**
 * @swagger
 * /admin/siswa/{id}:
 *   delete:
 *     summary: (Admin) Menghapus data Siswa
 *     tags: [Admin - Siswa]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID Siswa
 *     responses:
 *       '200':
 *         description: Siswa berhasil dihapus
 *       '404':
 *         description: Siswa tidak ditemukan
 */
router.delete('/siswa/:id', checkAuth, checkRole(['admin']), deleteSiswa);

// =======================================================
// JADWAL
// =======================================================

/**
 * @swagger
 * /admin/jadwal:
 *   post:
 *     summary: (Admin) Membuat jadwal baru (Menugaskan Guru)
 *     tags: [Admin - Jadwal]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_mapel, id_guru, id_kelas, hari, jam_mulai, jam_selesai]
 *             properties:
 *               id_mapel:
 *                 type: integer
 *                 example: 1
 *               id_guru:
 *                 type: integer
 *                 example: 3
 *               id_kelas:
 *                 type: integer
 *                 example: 2
 *               hari:
 *                 type: string
 *                 example: "Senin"
 *               jam_mulai:
 *                 type: string
 *                 example: "07:30"
 *               jam_selesai:
 *                 type: string
 *                 example: "09:00"
 *     responses:
 *       '201':
 *         description: Jadwal berhasil dibuat
 */
router.post('/jadwal', checkAuth, checkRole(['admin']), createJadwal);

/**
 * @swagger
 * /admin/jadwal:
 *   get:
 *     summary: (Admin) Mengambil semua jadwal
 *     tags: [Admin - Jadwal]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Sukses mengambil data jadwal
 */
router.get('/jadwal', checkAuth, checkRole(['admin']), getAllJadwal);

/**
 * @swagger
 * /admin/jadwal/guru/{id_guru}:
 *   get:
 *     summary: (Admin) Mengambil semua jadwal berdasarkan ID Guru
 *     tags: [Admin - Jadwal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_guru
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID Guru
 *     responses:
 *       '200':
 *         description: Sukses mengambil data jadwal
 *       '404':
 *         description: Guru tidak ditemukan
 */
router.get('/jadwal/guru/:id_guru', checkAuth, checkRole(['admin']), getJadwalByGuru);

/**
 * @swagger
 * /admin/jadwal/{id_jadwal}:
 *   delete:
 *     summary: (Admin) Menghapus data Jadwal
 *     tags: [Admin - Jadwal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_jadwal
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID Jadwal
 *     responses:
 *       '200':
 *         description: Jadwal berhasil dihapus
 *       '404':
 *         description: Jadwal tidak ditemukan
 */
router.delete('/jadwal/:id_jadwal', checkAuth, checkRole(['admin']), deleteJadwal);

export default router;
