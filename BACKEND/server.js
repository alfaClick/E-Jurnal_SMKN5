import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import router from "./src/app.js"; // ✅ INI YANG KURANG!

dotenv.config();

const app = express();

// --- MIDDLEWARES (URUTAN PENTING!) ---

// 1. Body Parser (HARUS PALING ATAS)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. CORS (Sederhana untuk Development)
app.use(cors({
  origin: [
    "http://localhost:5173", 
    "http://localhost:3000",
    "http://127.0.0.1:5173"  // ✅ TAMBAH INI
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// 3. Security
app.use(helmet());

// 4. Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // Max 100 request per IP
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// 5. Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log("Body:", req.body);
  next();
});

// --- ROUTES ---
app.get("/", (req, res) => {
  res.send("🎉 Halo! Server E-Jurnal sudah berjalan!");
});

app.use("/api", router);

// --- ERROR HANDLER ---
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(500).json({ 
    msg: "Internal server error",
    error: err.message 
  });
});

// --- START SERVER ---
const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});