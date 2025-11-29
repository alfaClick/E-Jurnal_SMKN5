import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const login = async (req, res) => {
  try {
    const { nip, password } = req.body;

    // 1. Validasi Input
    if (!nip || !password) {
      return res.status(400).json({ msg: "NIP dan Password wajib diisi!" });
    }

    // 2. Cari User di Database berdasarkan NIP
    const user = await prisma.guru.findUnique({
      where: { nip: nip.trim() } // Tambah .trim() untuk hapus spasi
    });

    // Kalau NIP gak ketemu
    if (!user) {
      return res.status(404).json({ msg: "User tidak ditemukan!" });
    }

    // 3. Cek Password (Bandingkan inputan vs Hash di DB)
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ msg: "Password salah!" }); // Ubah ke 401
    }

    // 4. Bikin Token (Tiket Masuk)
    const secretKey = process.env.JWT_SECRET || "rahasia_negara_api";
    const token = jwt.sign(
      { 
        id: user.id_guru, 
        role: user.role, 
        nama: user.nama_lengkap 
      }, 
      secretKey, 
      { expiresIn: "1d" } 
    );

    // 5. Login Sukses
    res.status(200).json({
      msg: "Login Berhasil!",
      token: token,
      user: {
        id: user.id_guru,
        nip: user.nip,
        nama: user.nama_lengkap, // ✅ PERBAIKAN: Frontend expect "nama"
        role: user.role
      }
    });

  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ msg: "Terjadi kesalahan server" });
  }
};