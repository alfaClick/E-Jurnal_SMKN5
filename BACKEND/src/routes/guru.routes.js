import express from 'express';

import {
  getJadwalSaya,
  getKelasByNip,  
  getSiswaByKelas,
  submitJurnalDanAbsensi,
} from '../controllers/guru.controllers.js';

import { checkAuth, checkRole } from '../middlewares/auth.middlewares.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 * - name: Guru
 * description: API untuk fungsionalitas Guru
 */

// ==========================================
// 1. ROUTE JADWAL SAYA
// ==========================================
router.get(
  '/jadwal-saya',
  checkAuth,
  checkRole(['guru', 'kepsek']),
  getJadwalSaya
);

// ==========================================
// 2. ROUTE GET KELAS BY NIP (YANG TADI HILANG)
// ==========================================
/**
 * @swagger
 * /guru/kelas/{nip}:
 * get:
 * summary: Mengambil daftar kelas berdasarkan NIP Guru
 * tags: [Guru]
 */
router.get(
  '/kelas/:nip', 
  checkAuth, 
  checkRole(['guru', 'kepsek']), 
  getKelasByNip
);

// ==========================================
// 3. ROUTE GET SISWA BY ID KELAS
// ==========================================
router.get(
  '/kelas/:id_kelas/siswa',
  checkAuth,
  checkRole(['guru', 'kepsek']),
  getSiswaByKelas
);

// ==========================================
// 4. ROUTE SUBMIT JURNAL
// ==========================================
router.post(
  '/jurnal',
  checkAuth,
  checkRole(['guru']),
  submitJurnalDanAbsensi
);

export default router;