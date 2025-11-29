import jwt from 'jsonwebtoken';

// 1. Middleware untuk mengecek token
export const checkAuth = (req, res, next) => {
  const authHeader = req.header('Authorization'); // "Bearer <token>"
  if (!authHeader) {
    return res.status(401).json({ msg: 'Akses ditolak. Tidak ada token.' });
  }

  try {
    const token = authHeader.split(' ')[1]; // Ambil token-nya saja
    if (!token) {
      return res.status(401).json({ msg: 'Format token salah.' });
    }

    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Simpan data user dari token ke request, agar bisa dipakai di controller
    req.user = decoded;
    next(); // Lanjut ke proses selanjutnya (controller)
  } catch (error) {
    res.status(401).json({ msg: 'Token tidak valid.' });
  }
};

// 2. Middleware untuk mengecek role
export const checkRole = (roles) => {
  // roles adalah array, misal ['admin'] atau ['admin', 'kepsek']
  return (req, res, next) => {
    // req.user didapat dari middleware checkAuth
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        msg: 'Akses ditolak. Anda tidak punya hak akses.',
      });
    }
    next(); // Punya hak, lanjut
  };
};