import express from 'express';

import {
  getAllJurnalHarian,
  getDetailJurnalById,
  getRekapMingguan,
} from '../controllers/kepsek.controllers.js';
import { checkAuth, checkRole } from '../middlewares/auth.middlewares.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Kepsek
 *   description: API untuk fungsionalitas Kepala Sekolah (Monitoring)
 */

/**
 * @swagger
 * /kepsek/jurnals:
 *   get:
 *     summary: (Kepsek) Mengambil daftar semua jurnal harian (untuk dashboard)
 *     tags: [Kepsek]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Sukses mengambil daftar semua jurnal.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_jurnal:
 *                     type: integer
 *                     example: 12
 *                   tanggal:
 *                     type: string
 *                     format: date
 *                     example: "2025-11-03"
 *                   materi:
 *                     type: string
 *                     example: "Pengenalan API"
 *                   jadwal:
 *                     type: object
 *                     properties:
 *                       guru:
 *                         type: object
 *                         properties:
 *                           nama_lengkap:
 *                             type: string
 *                             example: "Budi Santoso"
 *                       kelas:
 *                         type: object
 *                         properties:
 *                           nama_kelas:
 *                             type: string
 *                             example: "XII RPL 1"
 *       '401':
 *         description: Token tidak valid
 *       '403':
 *         description: Akses ditolak (bukan Kepsek)
 */
router.get(
  '/jurnals',
  checkAuth,
  checkRole(['kepsek']), // Hanya Kepala Sekolah yang dapat mengakses
  getAllJurnalHarian
);

/**
 * @swagger
 * /kepsek/jurnal/{id_jurnal}:
 *   get:
 *     summary: (Kepsek) Mengambil detail 1 jurnal + daftar absensinya
 *     tags: [Kepsek]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_jurnal
 *         required: true
 *         description: ID unik dari Jurnal Harian
 *         schema:
 *           type: integer
 *           example: 5
 *     responses:
 *       '200':
 *         description: Sukses mengambil data detail jurnal dan absensi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 detailJurnal:
 *                   type: object
 *                   description: Info detail jurnal (materi, guru, kelas, mapel)
 *                   properties:
 *                     id_jurnal:
 *                       type: integer
 *                       example: 5
 *                     tanggal:
 *                       type: string
 *                       format: date
 *                       example: "2025-11-03"
 *                     materi:
 *                       type: string
 *                       example: "Belajar membuat API CRUD"
 *                     guru:
 *                       type: object
 *                       properties:
 *                         nama_lengkap:
 *                           type: string
 *                           example: "Ibu Rina Puspitasari"
 *                     kelas:
 *                       type: object
 *                       properties:
 *                         nama_kelas:
 *                           type: string
 *                           example: "XI TKJ 2"
 *                     mapel:
 *                       type: object
 *                       properties:
 *                         nama_mapel:
 *                           type: string
 *                           example: "Pemrograman Web"
 *                 daftarAbsensi:
 *                   type: array
 *                   description: Daftar absensi siswa untuk jurnal tersebut
 *                   items:
 *                     type: object
 *                     properties:
 *                       status:
 *                         type: string
 *                         enum: [H, I, S, A]
 *                         example: "H"
 *                       siswa:
 *                         type: object
 *                         properties:
 *                           nis:
 *                             type: string
 *                             example: "123456789"
 *                           nama_lengkap:
 *                             type: string
 *                             example: "Andi Wijaya"
 *       '401':
 *         description: Token tidak valid
 *       '403':
 *         description: Akses ditolak (bukan Kepsek)
 *       '404':
 *         description: Jurnal tidak ditemukan
 */
router.get(
  '/jurnal/:id_jurnal',
  checkAuth,
  checkRole(['kepsek']), // Hanya Kepala Sekolah yang dapat mengakses
  getDetailJurnalById
);

/**
 * @swagger
 * /kepsek/rekap/mingguan:
 *   get:
 *     summary: (Kepsek) Mengambil rekap absensi mingguan semua siswa
 *     tags: [Kepsek]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tanggal
 *         schema:
 *           type: string
 *           format: date
 *         description: (Opsional) Tanggal apapun di dalam minggu yang ingin dilihat (YYYY-MM-DD). Default-nya minggu ini.
 *     responses:
 *       '200':
 *         description: Sukses mengambil data rekapitulasi mingguan.
 *       '401':
 *         description: Token tidak valid.
 *       '403':
 *         description: Akses ditolak (bukan Kepsek atau Admin).
 */
router.get(
  '/rekap/mingguan',
  checkAuth,
  checkRole(['kepsek', 'admin']),
  getRekapMingguan
);


export default router;
