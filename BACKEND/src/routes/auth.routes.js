import express from 'express';
import { login, loginAdmin } from '../controllers/auth.controllers.js';

const router = express.Router();

// POST /api/auth/login-admin
/**
 * @swagger
 * /auth/login-admin:
 *   post:
 *     summary: Login untuk Admin
 *     tags: [Auth]
 *     description: Endpoint untuk Admin login menggunakan Username dan Password. Mengembalikan token JWT jika berhasil.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username admin
 *                 example: "admin"
 *               password:
 *                 type: string
 *                 description: Password admin
 *                 example: "admin123"
 *     responses:
 *       '200':
 *         description: Login admin berhasil.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Login Admin Berhasil!"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: "admin"
 *                     nama:
 *                       type: string
 *                       example: "Administrator"
 *                     role:
 *                       type: string
 *                       example: "admin"
 *       '400':
 *         description: Username atau Password tidak boleh kosong.
 *       '401':
 *         description: Password salah.
 *       '404':
 *         description: Admin tidak ditemukan.
 *     security: []
 */
router.post('/login-admin', loginAdmin);

// POST /api/auth/login
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login untuk Guru dan Kepala Sekolah
 *     tags: [Auth]
 *     description: Endpoint untuk Guru/Kepsek login menggunakan NIP dan Password. Mengembalikan token JWT jika berhasil.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nip
 *               - password
 *             properties:
 *               nip:
 *                 type: string
 *                 description: NIP pengguna
 *                 example: "19800202"
 *               password:
 *                 type: string
 *                 description: Password pengguna
 *                 example: "guru123"
 *     responses:
 *       '200':
 *         description: Login berhasil.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Login sebagai guru berhasil"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   type: object
 *                   properties:
 *                     id_guru:
 *                       type: integer
 *                       example: 2
 *                     nama:
 *                       type: string
 *                       example: "Budi Santoso"
 *                     role:
 *                       type: string
 *                       example: "guru"
 *       '400':
 *         description: NIP atau Password tidak boleh kosong.
 *       '401':
 *         description: Password salah.
 *       '404':
 *         description: NIP tidak ditemukan.
 *     security: []
 */
router.post('/login', login);

export default router;