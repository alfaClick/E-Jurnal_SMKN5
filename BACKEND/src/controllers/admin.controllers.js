import prisma from '../prismaClient.js';
import bcrypt from 'bcrypt';

export const registerGuru = async (req, res) => {
  try {
    // 1. Tambahkan 'id_jurusan' di sini untuk ditangkap dari Form
    const { nip, nama_lengkap, password, role, is_wali_kelas, id_jurusan } = req.body;

    // Validasi input dasar
    if (!nip || !nama_lengkap || !password || !role) {
      return res
        .status(400)
        .json({ msg: 'Semua field wajib diisi (nip, nama, password, role)' });
    }

    // Cek apakah NIP sudah ada
    const existingGuru = await prisma.guru.findUnique({
      where: { nip: nip },
    });

    if (existingGuru) {
      return res.status(409).json({ msg: 'NIP sudah terdaftar' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Buat guru baru
    const newGuru = await prisma.guru.create({
      data: {
        nip: nip,
        nama_lengkap: nama_lengkap,
        password: hashedPassword,
        role: role,
        is_wali_kelas: is_wali_kelas || false,
        
        // 2. SIMPAN ID JURUSAN DI SINI
        // Jika id_jurusan ada isinya, ubah ke Int. Jika tidak (kosong/null), biarkan null.
        id_jurusan: id_jurusan ? parseInt(id_jurusan) : null, 
      },
    });

    delete newGuru.password;

    res.status(201).json({
      msg: 'Registrasi Guru/Kepsek berhasil',
      data: newGuru,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// ----- CRUD UNTUK MAPEL -----

// 1. CREATE Mapel
export const createMapel = async (req, res) => {
  const { nama_mapel } = req.body;
  if (!nama_mapel) {
    return res.status(400).json({ msg: 'Nama mapel tidak boleh kosong' });
  }

  try {
    const newMapel = await prisma.mapel.create({
      data: { nama_mapel: nama_mapel },
    });
    res.status(201).json({ msg: 'Mapel berhasil dibuat', data: newMapel });
  } catch (error) {
    // Kode 'P2002' adalah error unik dari Prisma (jika mapel sudah ada)
    if (error.code === 'P2002') {
      return res.status(409).json({ msg: 'Nama mapel sudah ada' });
    }
    res.status(500).json({ msg: error.message });
  }
};

// 2. READ All Mapel
export const getAllMapel = async (req, res) => {
  try {
    const allMapel = await prisma.mapel.findMany({
      orderBy: { nama_mapel: 'asc' }, // Urutkan berdasarkan abjad
    });
    res.status(200).json(allMapel);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// 3. UPDATE Mapel
export const updateMapel = async (req, res) => {
  const { id } = req.params; // Ambil ID dari URL (misal: /api/admin/mapel/5)
  const { nama_mapel } = req.body;

  try {
    const updatedMapel = await prisma.mapel.update({
      where: { id_mapel: parseInt(id) }, // Pastikan ID diubah jadi angka
      data: { nama_mapel: nama_mapel },
    });
    res.status(200).json({ msg: 'Mapel berhasil diupdate', data: updatedMapel });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ msg: 'Nama mapel sudah ada' });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ msg: 'Mapel tidak ditemukan' });
    }
    res.status(500).json({ msg: error.message });
  }
};

// 4. DELETE Mapel
export const deleteMapel = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.mapel.delete({
      where: { id_mapel: parseInt(id) },
    });
    res.status(200).json({ msg: 'Mapel berhasil dihapus' });
  } catch (error) {
    // 'P2025' error jika data tidak ditemukan
    if (error.code === 'P2025') {
      return res.status(404).json({ msg: 'Mapel tidak ditemukan' });
    }
    res.status(500).json({ msg: error.message });
  }
};

// ----- CRUD UNTUK JADWAL (Assign Guru) -----

// 1. CREATE Jadwal (Mendaftarkan Guru ke Kelas/Mapel)
export const createJadwal = async (req, res) => {
  const { id_guru, id_kelas, id_mapel, hari, jam_mulai, jam_selesai } = req.body;

  // Validasi dasar
  if (!id_guru || !id_kelas || !id_mapel || !hari || !jam_mulai || !jam_selesai) {
    return res.status(400).json({ msg: 'Semua field wajib diisi' });
  }

  try {
    const newJadwal = await prisma.jadwal.create({
      data: {
        id_guru: parseInt(id_guru),
        id_kelas: parseInt(id_kelas),
        id_mapel: parseInt(id_mapel),
        hari: hari,
        // Pastikan format jam_mulai/jam_selesai dikirim sebagai ISO String
        // Contoh: "2025-01-01T07:00:00.000Z" (Hanya jam-nya yang akan diambil oleh MySQL @db.Time)
        jam_mulai: new Date(jam_mulai),
        jam_selesai: new Date(jam_selesai),
      },
      // Kita sertakan data relasinya agar tampil di respons
      include: {
        guru: { select: { nama_lengkap: true } },
        kelas: { select: { nama_kelas: true } },
        mapel: { select: { nama_mapel: true } },
      },
    });
    res
      .status(201)
      .json({ msg: 'Jadwal berhasil ditambahkan', data: newJadwal });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: error.message });
  }
};


// 2. READ All Jadwal (Untuk melihat semua jadwal di sekolah)
export const getAllJadwal = async (req, res) => {
  try {
    const allJadwal = await prisma.jadwal.findMany({
      include: {
        guru: { select: { nama_lengkap: true } },
        kelas: { select: { nama_kelas: true } },
        mapel: { select: { nama_mapel: true } },
      },
      orderBy: { id_jadwal: 'desc' },
    });
    res.status(200).json(allJadwal);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// 3. READ Jadwal by Guru (Untuk melihat jadwal satu guru spesifik)
export const getJadwalByGuru = async (req, res) => {
  const { id_guru } = req.params;
  try {
    const jadwalGuru = await prisma.jadwal.findMany({
      where: { id_guru: parseInt(id_guru) },
      include: {
        kelas: { select: { nama_kelas: true } },
        mapel: { select: { nama_mapel: true } },
      },
      orderBy: { hari: 'asc' }, // Mungkin Anda ingin urutkan berdasarkan hari
    });

    if (jadwalGuru.length === 0) {
      return res
        .status(404)
        .json({ msg: 'Tidak ada jadwal ditemukan untuk guru ini' });
    }
    res.status(200).json(jadwalGuru);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// 4. DELETE Jadwal (Membatalkan/Menghapus jadwal)
export const deleteJadwal = async (req, res) => {
  const { id_jadwal } = req.params;

  try {
    await prisma.jadwal.delete({
      where: { id_jadwal: parseInt(id_jadwal) },
    });
    res.status(200).json({ msg: 'Jadwal berhasil dihapus' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ msg: 'Jadwal tidak ditemukan' });
    }
    res.status(500).json({ msg: error.message });
  }
};

// ----- CRUD UNTUK KELAS -----

// 1. CREATE Kelas
export const createKelas = async (req, res) => {
  const { nama_kelas, id_jurusan, id_wali_kelas } = req.body;

  if (!nama_kelas) {
    return res.status(400).json({ msg: 'Nama kelas tidak boleh kosong' });
  }

  try {
    const newKelas = await prisma.kelas.create({
      data: {
        nama_kelas: nama_kelas,
        // id_jurusan dan id_wali_kelas bisa jadi opsional (null)
        id_jurusan: id_jurusan ? parseInt(id_jurusan) : null,
        id_wali_kelas: id_wali_kelas ? parseInt(id_wali_kelas) : null,
      },
      include: {
        jurusan: true, // Tampilkan data jurusan terkait
        wali_kelas: { select: { nama_lengkap: true } }, // Tampilkan nama wali kelas
      },
    });
    res.status(201).json({ msg: 'Kelas berhasil dibuat', data: newKelas });
  } catch (error) {
    if (error.code === 'P2002') { // Jika nama_kelas unik dan duplikat
      return res.status(409).json({ msg: 'Nama kelas sudah ada' });
    }
    res.status(500).json({ msg: error.message });
  }
};

// 2. READ All Kelas
export const getAllKelas = async (req, res) => {
  try {
    const allKelas = await prisma.kelas.findMany({
      orderBy: { nama_kelas: 'asc' },
      include: {
        jurusan: { select: { nama_jurusan: true } },
        wali_kelas: { select: { nama_lengkap: true } },
      },
    });
    res.status(200).json(allKelas);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// 3. UPDATE Kelas
export const updateKelas = async (req, res) => {
  const { id } = req.params;
  const { nama_kelas, id_jurusan, id_wali_kelas } = req.body;

  try {
    const updatedKelas = await prisma.kelas.update({
      where: { id_kelas: parseInt(id) },
      data: {
        nama_kelas: nama_kelas,
        id_jurusan: id_jurusan ? parseInt(id_jurusan) : null,
        id_wali_kelas: id_wali_kelas ? parseInt(id_wali_kelas) : null,
      },
      include: {
        jurusan: true,
        wali_kelas: { select: { nama_lengkap: true } },
      },
    });
    res.status(200).json({ msg: 'Kelas berhasil diupdate', data: updatedKelas });
  } catch (error) {
    if (error.code === 'P2025') { // Not Found
      return res.status(404).json({ msg: 'Kelas tidak ditemukan' });
    }
    res.status(500).json({ msg: error.message });
  }
};

// 4. DELETE Kelas
export const deleteKelas = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.kelas.delete({
      where: { id_kelas: parseInt(id) },
    });
    res.status(200).json({ msg: 'Kelas berhasil dihapus' });
  } catch (error ) {
    if (error.code === 'P2025') {
      return res.status(404).json({ msg: 'Kelas tidak ditemukan' });
    }
    // Tangani jika kelas tidak bisa dihapus karena masih punya siswa/jadwal
    if (error.code === 'P2003') {
      return res.status(409).json({ msg: 'Gagal hapus: Kelas masih memiliki siswa atau jadwal terkait.' });
    }
    res.status(500).json({ msg: error.message });
  }
};

// -- CRUD UNTUK JURUSAN --

// 1. CREATE Jurusan
export const createJurusan = async (req, res) => {
  const { nama_jurusan } = req.body;
  if (!nama_jurusan) {
    return res.status(400).json({ msg: 'Nama jurusan tidak boleh kosong' });
  }

  try {
    const newJurusan = await prisma.jurusan.create({
      data: { nama_jurusan: nama_jurusan },
    });
    res.status(201).json({ msg: 'Jurusan berhasil dibuat', data: newJurusan });
  } catch (error) {
    if (error.code === 'P2002') { // Jika nama_jurusan unik dan duplikat
      return res.status(409).json({ msg: 'Nama jurusan sudah ada' });
    }
    res.status(500).json({ msg: error.message });
  }
};

// 2. READ All Jurusan
export const getAllJurusan = async (req, res) => {
  try {
    const allJurusan = await prisma.jurusan.findMany({
      orderBy: { nama_jurusan: 'asc' },
    });
    res.status(200).json(allJurusan);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// 3. UPDATE Jurusan
export const updateJurusan = async (req, res) => {
  const { id } = req.params;
  const { nama_jurusan } = req.body;

  try {
    const updatedJurusan = await prisma.jurusan.update({
      where: { id_jurusan: parseInt(id) },
      data: { nama_jurusan: nama_jurusan },
    });
    res.status(200).json({ msg: 'Jurusan berhasil diupdate', data: updatedJurusan });
  } catch (error) {
    if (error.code === 'P2025') { // Not Found
      return res.status(404).json({ msg: 'Jurusan tidak ditemukan' });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ msg: 'Nama jurusan sudah ada' });
    }
    res.status(500).json({ msg: error.message });
  }
};

// 4. DELETE Jurusan
export const deleteJurusan = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.jurusan.delete({
      where: { id_jurusan: parseInt(id) },
    });
    res.status(200).json({ msg: 'Jurusan berhasil dihapus' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ msg: 'Jurusan tidak ditemukan' });
    }
    // Tangani jika jurusan tidak bisa dihapus karena masih dipakai kelas/guru
    if (error.code === 'P2003') {
      return res.status(409).json({ msg: 'Gagal hapus: Jurusan masih terkait dengan kelas atau guru.' });
    }
    res.status(500).json({ msg: error.message });
  }
};

// ----- CRUD UNTUK SISWA -----

// 1. CREATE Siswa
export const createSiswa = async (req, res) => {
  const { nis, nama_lengkap, jenis_kelamin, id_kelas } = req.body;

  if (!nis || !nama_lengkap || !id_kelas) {
    return res
      .status(400)
      .json({ msg: 'NIS, Nama Lengkap, dan ID Kelas wajib diisi' });
  }

  try {
    const newSiswa = await prisma.siswa.create({
      data: {
        nis: nis,
        nama_lengkap: nama_lengkap,
        jenis_kelamin: jenis_kelamin || 'L', // Default 'L' jika tidak diisi
        id_kelas: parseInt(id_kelas),
      },
      include: {
        kelas: { select: { nama_kelas: true } }, // Tampilkan nama kelas
      },
    });
    res.status(201).json({ msg: 'Siswa berhasil ditambahkan', data: newSiswa });
  } catch (error) {
    if (error.code === 'P2002') { // Error NIS duplikat
      return res.status(409).json({ msg: 'NIS sudah terdaftar' });
    }
    res.status(500).json({ msg: error.message });
  }
};

// 2. READ All Siswa (Bisa juga difilter per kelas jika mau)
export const getAllSiswa = async (req, res) => {
  try {
    const allSiswa = await prisma.siswa.findMany({
      orderBy: { nama_lengkap: 'asc' },
      include: {
        kelas: { select: { nama_kelas: true } },
      },
    });
    res.status(200).json(allSiswa);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// 3. UPDATE Siswa
export const updateSiswa = async (req, res) => {
  const { id } = req.params; // Ini adalah id_siswa
  const { nis, nama_lengkap, jenis_kelamin, id_kelas } = req.body;

  try {
    const updatedSiswa = await prisma.siswa.update({
      where: { id_siswa: parseInt(id) },
      data: {
        nis: nis,
        nama_lengkap: nama_lengkap,
        jenis_kelamin: jenis_kelamin,
        id_kelas: id_kelas ? parseInt(id_kelas) : undefined,
      },
      include: {
        kelas: { select: { nama_kelas: true } },
      },
    });
    res.status(200).json({ msg: 'Data siswa berhasil diupdate', data: updatedSiswa });
  } catch (error) {
    if (error.code === 'P2025') { // Not Found
      return res.status(404).json({ msg: 'Siswa tidak ditemukan' });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ msg: 'NIS sudah terdaftar' });
    }
    res.status(500).json({ msg: error.message });
  }
};

// 4. DELETE Siswa
export const deleteSiswa = async (req, res) => {
  const { id } = req.params; // Ini adalah id_siswa

  try {
    await prisma.siswa.delete({
      where: { id_siswa: parseInt(id) },
    });
    res.status(200).json({ msg: 'Siswa berhasil dihapus' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ msg: 'Siswa tidak ditemukan' });
    }
    // Jika siswa punya data absensi terkait
    if (error.code === 'P2003') {
      return res.status(409).json({ msg: 'Gagal hapus: Siswa masih memiliki data absensi terkait.' });
    }
    res.status(500).json({ msg: error.message });
  }
};

/**
 * Ambil semua data guru yang sudah didaftarkan admin
 */
export const getAllUsers = async (req, res) => {
  try {
    const guruList = await prisma.guru.findMany({
      include: {
        jurusan: true, // ambil nama jurusan kalau ada
      },
      orderBy: { id_guru: "asc" },
    });

    // Format agar match dengan frontend
    const users = guruList.map((g) => ({
      nip: g.nip,
      nama: g.nama_lengkap,
      role:
        g.role === "admin"
          ? "Admin"
          : g.role === "kepsek"
          ? "Kepsek"
          : "Guru",
      jurusan: g.jurusan?.nama_jurusan || "-",
      kelas: [], // nanti bisa diisi dari tabel kelas kalau mau
      mapel: [], // bisa dikembangkan juga dari tabel jadwal
    }));

    res.status(200).json({
      success: true,
      message: "Data guru berhasil diambil",
      users,
    });
  } catch (error) {
    console.error("❌ Error getAllUsers:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data guru",
      error: error.message,
    });
  }
};