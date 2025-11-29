import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";



dotenv.config();

const app = express();

// --- MIDDLEWARES ---

// 1. Konfigurasi CORS "STRICT" (Wajib spesifik, gak boleh bintang *)
const corsOptions = {
  // Ganti ini dengan URL Frontend lu. 
  // Kalau lu pake Vite biasanya 5173. Kalau React biasa 3000.
  // Gua masukin dua-duanya biar aman.
  origin: ["http://localhost:5173", "http://localhost:3000"], 
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Karena ini true, origin GAK BOLEH '*'
};

app.use(cors(corsOptions));

// 2. Header Security Tambahan (Manual Fallback yang Benar)
app.use((req, res, next) => {
  // Ambil origin dari request yang masuk
  const origin = req.headers.origin;
  
  // Kalau originnya dari localhost kita, izinkan. Kalau gak, blokir.
  if (origin === "http://localhost:5173" || origin === "http://localhost:3000") {
    res.header("Access-Control-Allow-Origin", origin);
  }
  
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Credentials", "true"); // Wajib string "true"
  
  if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
  }
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  standardHeaders: true, 
  legacyHeaders: false, 
});
app.use(limiter);

app.use(express.json());

// 3. Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// --- ROUTING ---
app.use("/api", router);


app.get('/', (req, res) => {
  res.send('🎉 Halo! Server E-Jurnal sudah berjalan!');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));