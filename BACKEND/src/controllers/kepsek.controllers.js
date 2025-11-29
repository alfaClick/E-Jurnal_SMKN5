import prisma from '../prismaClient.js';

/**
 * @route   GET /api/kepsek/jurnals
 * @desc    (Dashboard) Mengambil daftar semua jurnal harian dari semua guru
 * @access  Private (Kepsek)
 */
export const getAllJurnalHarian = async (req, res) => {
  try {
    const allJurnals = await prisma.jurnal_harian.findMany({
      // Kita ambil data terkait yang diperlukan untuk card
      include: {
        jadwal: {
          include: {
            guru: {
              select: { nama_lengkap: true }, // Nama Guru
            },
            kelas: {
              select: { nama_kelas: true }, // Nama Kelas
            },
          },
        },
      },
      // Urutkan berdasarkan yang terbaru
      orderBy: {
        tanggal: 'desc',
      },
    });

    res.status(200).json(allJurnals);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

/**
 * @route   GET /api/kepsek/jurnal/:id_jurnal
 * @desc    (Detail) Mengambil detail 1 jurnal harian + daftar absensinya
 * @access  Private (Kepsek)
 */
export const getDetailJurnalById = async (req, res) => {
  const { id_jurnal } = req.params;

  try {
    // Langkah 1: Ambil data jurnal dan detail terkaitnya (guru, kelas, mapel)
    const detailJurnal = await prisma.jurnal_harian.findUnique({
      where: { id_jurnal: parseInt(id_jurnal) },
      include: {
        jadwal: {
          include: {
            guru: { select: { nama_lengkap: true } },
            kelas: { select: { nama_kelas: true } },
            mapel: { select: { nama_mapel: true } },
          },
        },
      },
    });

    if (!detailJurnal) {
      return res.status(404).json({ msg: 'Jurnal tidak ditemukan' });
    }

    // Langkah 2: Ambil daftar absensi yang terkait
    // (Berdasarkan id_jadwal DAN tanggal yang sama dengan jurnal)
    const daftarAbsensi = await prisma.absensi.findMany({
      where: {
        id_jadwal: detailJurnal.id_jadwal,
        tanggal: detailJurnal.tanggal,
      },
      include: {
        siswa: {
          select: { nis: true, nama_lengkap: true }, // Tampilkan nama siswa
        },
      },
      orderBy: {
        siswa: { nama_lengkap: 'asc' }, // Urutkan berdasarkan nama siswa
      },
    });

    // Langkah 3: Gabungkan keduanya dan kirim sebagai respons
    res.status(200).json({
      detailJurnal,
      daftarAbsensi,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// =======================================================
//    REKAP ABSENSI MINGGUAN
// =======================================================
export const getRekapMingguan = async (req, res) => {
  try {
    // 1. Tentukan Rentang Tanggal (Mingguan)
    // Frontend bisa mengirim ?tanggal=YYYY-MM-DD untuk minggu yg diinginkan
    // Jika tidak ada, kita pakai minggu ini.
    const targetDate = req.query.tanggal ? new Date(req.query.tanggal) : new Date();

    // Hitung hari Senin (Start of Week)
    const startOfWeek = new Date(targetDate);
    const dayOfWeek = targetDate.getDay(); // 0=Minggu, 1=Senin, ...
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startOfWeek.setDate(targetDate.getDate() + diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0); // Set ke awal hari Senin

    // Hitung hari Minggu (End of Week)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999); // Set ke akhir hari Minggu

    // 2. Ambil Agregat Absensi dari Database
    // Kita kelompokkan berdasarkan id_siswa dan status
    const agregatAbsensi = await prisma.absensi.groupBy({
      by: ['id_siswa', 'status'],
      where: {
        tanggal: {
          gte: startOfWeek, // >= Senin 00:00
          lte: endOfWeek, // <= Minggu 23:59
        },
      },
      _count: {
        status: true, // Hitung jumlah data per status
      },
    });

    // 3. Ubah hasil Agregat menjadi Map/Lookup yang mudah dibaca
    // Hasilnya: { 1: { H: 5, S: 1 }, 2: { H: 6 } }
    const rekapMap = agregatAbsensi.reduce((acc, item) => {
      const { id_siswa, status, _count } = item;
      if (!acc[id_siswa]) {
        acc[id_siswa] = { H: 0, S: 0, I: 0, A: 0, total: 0 };
      }
      acc[id_siswa][status] = _count.status;
      acc[id_siswa].total += _count.status;
      return acc;
    }, {});

    // 4. Ambil semua data siswa (Nama & Kelas)
    const allSiswa = await prisma.siswa.findMany({
      select: {
        id_siswa: true,
        nis: true,
        nama_lengkap: true,
        kelas: {
          select: { nama_kelas: true },
        },
      },
      orderBy: {
        kelas: { nama_kelas: 'asc' }, // Urutkan per kelas
      },
    });

    // 5. Gabungkan data Siswa dengan data Rekap
    const finalRekap = allSiswa.map((siswa) => ({
      id_siswa: siswa.id_siswa,
      nis: siswa.nis,
      nama_siswa: siswa.nama_lengkap,
      nama_kelas: siswa.kelas?.nama_kelas || 'N/A',
      rekap: rekapMap[siswa.id_siswa] || { H: 0, S: 0, I: 0, A: 0, total: 0 }, // Tampilkan 0 jika siswa tsb tdk ada absensi
    }));

    // Kirim hasilnya
    res.status(200).json({
      rentang_tanggal: {
        mulai: startOfWeek.toISOString().split('T')[0],
        selesai: endOfWeek.toISOString().split('T')[0],
      },
      data: finalRekap,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};