import type { Express } from "express";
import { createServer, type Server } from "http";
// import { storage } from "./storage"; // nanti kalau sudah pakai DB

export async function registerRoutes(app: Express): Promise<Server> {
  // prefix semua route dengan /api
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  // MOCK login dulu biar UI bisa dipakai
  app.post("/api/auth/login", (req, res) => {
    const { nip, password } = req.body || {};
    if (nip === "198227272" && password === "123guru") {
      return res.json({
        success: true,
        user: {
          nip,
          nama: "Iyan Hadi Permana",
          role: "guru",
          jurusan: "RPL",
          kelas: ["10 RPL 1", "10 RPL 2"],
          mapel: ["Algoritma Pemrograman", "Android"],
        },
      });
    }
    return res.status(401).json({ success: false, message: "NIP atau Password salah" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
