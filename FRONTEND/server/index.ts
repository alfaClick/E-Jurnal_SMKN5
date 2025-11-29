// server/index.ts
import express from "express";
import { createServer } from "http";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Root info (biar gak "Cannot GET /")
app.get("/", (_req, res) => res.send("API live. Cek /api/health"));

// Health
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Auth (mock login)
app.post("/api/auth/login", (req, res) => {
  const { nip, password } = req.body || {};
  if (nip === "198227272" && password === "123guru") {
    return res.json({
      success: true,
      token: "mock.jwt.token",
      user: {
        nip,
        nama: "Iyan Hadi Permana",
        role: "guru",
        jurusan: "RPL",
        mapel: ["Algoritma Pemrograman", "Android"],
        kelas: ["10 RPL 1", "10 RPL 2"],
      },
    });
  }
  return res.status(401).json({ success: false, message: "NIP/Password salah" });
});

// Data untuk dashboard guru (mock)
app.get("/api/guru/me", (_req, res) => {
  res.json({
    nip: "198227272",
    nama: "Iyan Hadi Permana",
    role: "guru",
    jurusan: "RPL",
    mapel: ["Algoritma Pemrograman", "Android"],
    kelas: ["10 RPL 1", "10 RPL 2"],
  });
});

app.get("/api/guru/kelas", (_req, res) => {
  res.json([
    { id: "10-rpl-1", nama: "10 RPL 1" },
    { id: "10-rpl-2", nama: "10 RPL 2" },
  ]);
});

// Jurnal & Absensi (mock)
app.post("/api/jurnal", (_req, res) =>
  res.status(201).json({ ok: true, id: "jrnl_" + Date.now() })
);
app.post("/api/absensi", (_req, res) => res.status(201).json({ ok: true }));

// Listen
const port = parseInt(process.env.PORT || "5001", 10);
const host = process.env.HOST || "127.0.0.1";

createServer(app).listen(port, host, () => {
  console.log(`[express] serving on http://${host}:${port}`);
});
