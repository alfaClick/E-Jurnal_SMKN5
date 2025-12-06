import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// ===== LOGIN GURU/KEPSEK =====
export const login = async (req, res) => {
  try {
    const { nip, password } = req.body;

    // 1. Validasi Input
    if (!nip || !password) {
      return res.status(400).json({ msg: "NIP dan Password wajib diisi!" });
    }

    // 2. Cari User di Database berdasarkan NIP
    const user = await prisma.guru.findUnique({
      where: { nip: nip.trim() }
    });

    // Kalau NIP gak ketemu
    if (!user) {
      return res.status(404).json({ msg: "User tidak ditemukan!" });
    }

    // 3. Cek Password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ msg: "Password salah!" });
    }

    // 4. Bikin Token
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
        nama: user.nama_lengkap,
        role: user.role
      }
    });

  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ msg: "Terjadi kesalahan server" });
  }
};

// ===== LOGIN ADMIN =====
export const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Validasi Input
    if (!username || !password) {
      return res.status(400).json({ msg: "Username dan Password wajib diisi!" });
    }

    // 2. Cari Admin di Database
    const admin = await prisma.admin.findUnique({
      where: { username: username.trim() }
    });

    if (!admin) {
      return res.status(404).json({ msg: "Admin tidak ditemukan!" });
    }

    // 3. Cek Password
    const isMatch = await bcrypt.compare(password, admin.password);
    
    if (!isMatch) {
      return res.status(401).json({ msg: "Password salah!" });
    }

    // 4. Bikin Token
    const secretKey = process.env.JWT_SECRET || "rahasia_negara_api";
    const token = jwt.sign(
      { 
        id: admin.id_admin, 
        role: "admin",
        username: admin.username 
      }, 
      secretKey, 
      { expiresIn: "1d" } 
    );

    // 5. Login Sukses
    res.status(200).json({
      msg: "Login Admin Berhasil!",
      token: token,
      user: {
        id: admin.id_admin,
        username: admin.username,
        nama: admin.nama_lengkap || admin.username,
        role: "admin"
      }
    });

  } catch (error) {
    console.error("❌ Login Admin Error:", error);
    res.status(500).json({ msg: "Terjadi kesalahan server" });
  }
};