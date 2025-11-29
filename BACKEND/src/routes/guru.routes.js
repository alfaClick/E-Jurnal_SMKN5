import express from 'express';

import {
  getJadwalSaya,
  getSiswaByKelas,
  submitJurnalDanAbsensi,
} from '../controllers/guru.controllers.js';

import { checkAuth, checkRole } from '../middlewares/auth.middlewares.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Guru
 *     description: API untuk fungsionalitas Guru
 */

/**
 * @swagger
 * /guru/jadwal-saya:
 *   get:
 *     summary: (Guru) Mengambil semua jadwal milik guru yang sedang login
 *     tags: [Guru]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Sukses mengambil daftar jadwal
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_jadwal:
 *                     type: integer
 *                     example: 1
 *                   hari:
 *                     type: string
 *                     example: "Senin"
 *                   jam_mulai:
 *                     type: string
 *                     format: time
 *                     example: "07:00"
 *                   jam_selesai:
 *                     type: string
 *                     format: time
 *                     example: "08:30"
 *                   kelas:
 *                     type: object
 *                     properties:
 *                       id_kelas:
 *                         type: integer
 *                         example: 2
 *                       nama_kelas:
 *                         type: string
 *                         example: "XII RPL 1"
 *                   mapel:
 *                     type: object
 *                     properties:
 *                       id_mapel:
 *                         type: integer
 *                         example: 3
 *                       nama_mapel:
 *                         type: string
 *                         example: "Pemrograman Web"
 *       '401':
 *         description: Token tidak valid atau tidak ada
 *       '403':
 *         description: Akses ditolak (bukan Guru atau Kepsek)
 */
router.get(
  '/jadwal-saya',
  checkAuth,
  checkRole(['guru', 'kepsek']),
  getJadwalSaya
);

/**
 * @swagger
 * /guru/kelas/{id_kelas}/siswa:
 *   get:
 *     summary: (Guru) Mengambil daftar siswa berdasarkan ID Kelas
 *     tags: [Guru]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_kelas
 *         required: true
 *         description: ID unik dari Kelas
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       '200':
 *         description: Sukses mengambil daftar siswa
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_siswa:
 *                     type: integer
 *                     example: 12
 *                   nis:
 *                     type: string
 *                     example: "20241023"
 *                   nama_lengkap:
 *                     type: string
 *                     example: "Budi Setiawan"
 *                   jenis_kelamin:
 *                     type: string
 *                     example: "L"
 *       '401':
 *         description: Token tidak valid
 *       '403':
 *         description: Akses ditolak
 *       '404':
 *         description: Tidak ada siswa ditemukan di kelas ini
 */
router.get(
  '/kelas/:id_kelas/siswa',
  checkAuth,
  checkRole(['guru', 'kepsek']),
  getSiswaByKelas
);

/**
 * @swagger
 * /guru/jurnal:
 *   post:
 *     summary: (Guru) Submit jurnal harian dan absensi siswa
 *     tags: [Guru]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_jadwal
 *               - tanggal
 *               - materi
 *               - absensiSiswa
 *             properties:
 *               id_jadwal:
 *                 type: integer
 *                 description: ID dari jadwal yang dipilih
 *                 example: 5
 *               tanggal:
 *                 type: string
 *                 format: date
 *                 description: Tanggal KBM (YYYY-MM-DD)
 *                 example: "2025-11-03"
 *               materi:
 *                 type: string
 *                 description: Materi yang dibahas
 *                 example: "Belajar tentang API"
 *               kegiatan:
 *                 type: string
 *                 description: (Opsional) Kegiatan di kelas
 *                 example: "Siswa praktek membuat API"
 *               absensiSiswa:
 *                 type: array
 *                 description: Daftar absensi semua siswa di kelas itu
 *                 items:
 *                   type: object
 *                   required:
 *                     - id_siswa
 *                     - status
 *                   properties:
 *                     id_siswa:
 *                       type: integer
 *                       example: 1
 *                     status:
 *                       type: string
 *                       enum: [H, I, S, A]
 *                       example: "H"
 *     responses:
 *       '201':
 *         description: Jurnal dan absensi berhasil disimpan
 *       '400':
 *         description: Data input tidak valid
 *       '401':
 *         description: Token tidak valid
 *       '403':
 *         description: Akses ditolak (bukan Guru)
 *       '500':
 *         description: Gagal menyimpan (Transaksi error)
 */
router.post(
  '/jurnal',
  checkAuth,
  checkRole(['guru']), // Hanya guru yang bisa submit
  submitJurnalDanAbsensi
);

export default router;
