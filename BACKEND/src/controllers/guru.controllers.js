import prisma from '../prismaClient.js';

/**
 * @route   GET /api/guru/jadwal-saya
 * @desc    Mengambil semua jadwal milik guru yang sedang login
 * @access  Private (Guru, Kepsek)
 */
export const getJadwalSaya = async (req, res) => {
  try {
    // ID guru diambil dari token (setelah lolos middleware checkAuth)
    const idGuruLogin = req.user.userId;

    const jadwalSaya = await prisma.jadwal.findMany({
      where: {
        id_guru: idGuruLogin, // Hanya ambil jadwal milik guru ini
      },
      include: {
        kelas: {
          select: { id_kelas: true, nama_kelas: true },
        },
        mapel: {
          select: { id_mapel: true, nama_mapel: true },
        },
      },
      orderBy: [
        { hari: 'asc' },
        { jam_mulai: 'asc' },
      ],
    });

    if (jadwalSaya.length === 0) {
      return res.status(200).json([]); // Kembalikan array kosong jika tidak ada jadwal
    }

    res.status(200).json(jadwalSaya);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

/**
 * @route   GET /api/guru/kelas/:id_kelas/siswa
 * @desc    Mengambil daftar siswa berdasarkan ID Kelas
 * @access  Private (Guru, Kepsek)
 */
export const getSiswaByKelas = async (req, res) => {
  try {
    const { id_kelas } = req.params;

    const siswaDiKelas = await prisma.siswa.findMany({
      where: {
        id_kelas: parseInt(id_kelas),
      },
      select: {
        id_siswa: true,
        nis: true,
        nama_lengkap: true,
        jenis_kelamin: true,
      },
      orderBy: {
        nama_lengkap: 'asc',
      },
    });

    if (siswaDiKelas.length === 0) {
      return res
        .status(404)
        .json({ msg: 'Tidak ada siswa ditemukan di kelas ini' });
    }

    res.status(200).json(siswaDiKelas);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

/**
 * @route   POST /api/guru/jurnal
 * @desc    Guru submit jurnal harian DAN absensi siswa
 * @access  Private (Guru)
 */
export const submitJurnalDanAbsensi = async (req, res) => {
  const { id_jadwal, tanggal, materi, kegiatan, absensiSiswa } = req.body;

  // 1. Validasi Input
  if (!id_jadwal || !tanggal || !materi || !absensiSiswa) {
    return res.status(400).json({
      msg: 'id_jadwal, tanggal, materi, dan absensiSiswa wajib diisi',
    });
  }

  if (!Array.isArray(absensiSiswa) || absensiSiswa.length === 0) {
    return res
      .status(400)
      .json({ msg: 'absensiSiswa harus berupa array dan tidak boleh kosong' });
  }

  // 2. Gunakan Transaksi Prisma
  // Ini memastikan jika salah satu data absensi gagal,
  // data Jurnal-nya juga akan dibatalkan (rollback).
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Langkah A: Buat Jurnal Harian terlebih dahulu
      const newJurnal = await tx.jurnal_harian.create({
        data: {
          id_jadwal: parseInt(id_jadwal),
          tanggal: new Date(tanggal),
          materi: materi,
          kegiatan: kegiatan || null, // Kegiatan opsional
        },
      });

      // Langkah B: Siapkan data absensi
      const dataAbsensi = absensiSiswa.map((absen) => {
        if (!absen.id_siswa || !absen.status) {
          throw new Error('Setiap siswa harus memiliki id_siswa dan status');
        }
        return {
          id_siswa: parseInt(absen.id_siswa),
          id_jadwal: parseInt(id_jadwal), // Kita simpan id_jadwal juga
          tanggal: new Date(tanggal),
          status: absen.status, // 'H', 'I', 'S', atau 'A'
        };
      });

      // Langkah C: Masukkan SEMUA data absensi sekaligus
      await tx.absensi.createMany({
        data: dataAbsensi,
      });

      return newJurnal; // Kirim balik data jurnal yang berhasil dibuat
    });

    // Jika transaksi sukses
    res.status(201).json({
      msg: 'Jurnal dan Absensi berhasil disimpan',
      data: result,
    });
  } catch (error) {
    // Jika terjadi error di dalam $transaction
    console.error(error);
    res.status(500).json({ msg: 'Gagal menyimpan data', error: error.message });
  }
};