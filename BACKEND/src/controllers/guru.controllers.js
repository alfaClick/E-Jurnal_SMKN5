import prisma from '../prismaClient.js';

/**
 * @route   GET /api/guru/jadwal-saya
 * @desc    Mengambil semua jadwal milik guru yang sedang login
 * @access  Private (Guru, Kepsek)
 */
export const getJadwalSaya = async (req, res) => {
  try {
    const idGuruLogin = req.user.userId;

    const jadwalSaya = await prisma.jadwal.findMany({
      where: {
        id_guru: idGuruLogin,
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
      return res.status(200).json([]);
    }

    res.status(200).json(jadwalSaya);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

/**
 * @route   GET /api/guru/kelas/:nip
 * @desc    Mengambil daftar kelas yang diampu guru berdasarkan NIP
 * @access  Private (Guru, Kepsek)
 */
export const getKelasByNip = async (req, res) => {
  try {
    const { nip } = req.params;

    // Cari guru
    const guru = await prisma.guru.findUnique({
      where: { nip: nip },
      select: { id_guru: true, nama_lengkap: true }
    });

    if (!guru) return res.status(404).json({ msg: 'Guru tidak ditemukan' });

    // Ambil jadwal
    const jadwalGuru = await prisma.jadwal.findMany({
      where: { id_guru: guru.id_guru },
      include: {
        kelas: true,
        mapel: true,
      },
      // Hapus distinct supaya kita bisa dapat ID jadwalnya
      // distinct: ['id_kelas'], 
    });

    // Extract data
    const kelasList = jadwalGuru.map(jadwal => ({
      id_kelas: jadwal.kelas.id_kelas,
      nama_kelas: jadwal.kelas.nama_kelas,
      mapel: jadwal.mapel.nama_mapel,
      // PENTING: Kita kirim ID Jadwal ke frontend
      id_jadwal: jadwal.id_jadwal 
    }));

    res.status(200).json({
      guru: {
        id_guru: guru.id_guru,
        nama: guru.nama_lengkap,
        nip: nip
      },
      kelas: kelasList
    });

  } catch (error) {
    console.error('Error getKelasByNip:', error);
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

  try {
    const result = await prisma.$transaction(async (tx) => {
      const newJurnal = await tx.jurnal_harian.create({
        data: {
          id_jadwal: parseInt(id_jadwal),
          tanggal: new Date(tanggal),
          materi: materi,
          kegiatan: kegiatan || null,
        },
      });

      const dataAbsensi = absensiSiswa.map((absen) => {
        if (!absen.id_siswa || !absen.status) {
          throw new Error('Setiap siswa harus memiliki id_siswa dan status');
        }
        return {
          id_siswa: parseInt(absen.id_siswa),
          id_jadwal: parseInt(id_jadwal),
          tanggal: new Date(tanggal),
          status: absen.status,
        };
      });

      await tx.absensi.createMany({
        data: dataAbsensi,
      });

      return newJurnal;
    });

    res.status(201).json({
      msg: 'Jurnal dan Absensi berhasil disimpan',
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Gagal menyimpan data', error: error.message });
  }
};