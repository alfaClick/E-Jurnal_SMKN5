import prisma from '../prismaClient.js';

/**
 * @route   GET /api/kepsek/absensi
 * @desc    Mengambil semua data absensi untuk dashboard
 * @access  Private (Kepsek)
 */
export const getAllAbsensi = async (req, res) => {
  try {
    const allAbsensi = await prisma.absensi.findMany({
      include: {
        siswa: {
          select: { nis: true, nama_lengkap: true }
        },
        jadwal: {
          include: {
            guru: { select: { nama_lengkap: true } },
            kelas: { select: { nama_kelas: true } },
            mapel: { select: { nama_mapel: true } }
          }
        }
      },
      orderBy: { tanggal: 'desc' }
    });

    // Group by tanggal + jadwal untuk hitung statistik
    const grouped = {};
    
    allAbsensi.forEach(item => {
      const key = `${item.tanggal}-${item.id_jadwal}`;
      if (!grouped[key]) {
        grouped[key] = {
          tanggal: item.tanggal,
          kelas: item.jadwal?.kelas?.nama_kelas || '-',
          mapel: item.jadwal?.mapel?.nama_mapel || '-',
          guru: item.jadwal?.guru?.nama_lengkap || '-',
          hadir: 0,
          sakit: 0,
          izin: 0,
          alpha: 0
        };
      }
      
      // Count per status
      if (item.status === 'H') grouped[key].hadir++;
      else if (item.status === 'S') grouped[key].sakit++;
      else if (item.status === 'I') grouped[key].izin++;
      else if (item.status === 'A') grouped[key].alpha++;
    });

    // Convert to array
    const result = Object.values(grouped).map((item, idx) => ({
      id: idx + 1,
      tanggal: item.tanggal.toISOString().split('T')[0],
      kelas: item.kelas,
      mapel: item.mapel,
      guru: item.guru,
      hadir: item.hadir,
      sakit: item.sakit,
      izin: item.izin,
      alpha: item.alpha
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error('Error getAllAbsensi:', error);
    res.status(500).json({ msg: error.message });
  }
};

/**
 * @route   GET /api/kepsek/jurnal  
 * @desc    Mengambil semua jurnal untuk dashboard
 * @access  Private (Kepsek)
 */
export const getAllJurnal = async (req, res) => {
  try {
    const allJurnals = await prisma.jurnal_harian.findMany({
      include: {
        jadwal: {
          include: {
            guru: { select: { nama_lengkap: true } },
            kelas: { select: { nama_kelas: true } },
            mapel: { select: { nama_mapel: true } }
          }
        }
      },
      orderBy: { tanggal: 'desc' }
    });

    const result = allJurnals.map((item, idx) => ({
      id: idx + 1,
      tanggal: item.tanggal.toISOString().split('T')[0],
      kelas: item.jadwal?.kelas?.nama_kelas || '-',
      mapel: item.jadwal?.mapel?.nama_mapel || '-',
      guru: item.jadwal?.guru?.nama_lengkap || '-',
      jamPelajaran: '-',
      materi: item.materi
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error('Error getAllJurnal:', error);
    res.status(500).json({ msg: error.message });
  }
};

/**
 * @route   GET /api/kepsek/statistik
 * @desc    Mengambil statistik dashboard
 * @access  Private (Kepsek)
 */
export const getStatistik = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalSiswa, totalGuru, totalKelas, absensiToday] = await Promise.all([
      prisma.siswa.count(),
      prisma.guru.count({ where: { role: 'guru' } }),
      prisma.kelas.count(),
      prisma.absensi.findMany({
        where: {
          tanggal: today
        }
      })
    ]);

    const hadirCount = absensiToday.filter(a => a.status === 'H').length;
    const totalAbsensi = absensiToday.length;
    const persentaseKehadiran = totalAbsensi > 0 
      ? Math.round((hadirCount / totalAbsensi) * 100) 
      : 0;

    res.status(200).json({
      totalSiswa,
      totalGuru,
      totalKelas,
      persentaseKehadiran
    });
  } catch (error) {
    console.error('Error getStatistik:', error);
    res.status(500).json({ msg: error.message });
  }
};

/**
 * @route   GET /api/kepsek/jurnals
 * @desc    (Dashboard) Mengambil daftar semua jurnal harian dari semua guru
 * @access  Private (Kepsek)
 */
export const getAllJurnalHarian = async (req, res) => {
  try {
    const allJurnals = await prisma.jurnal_harian.findMany({
      include: {
        jadwal: {
          include: {
            guru: {
              select: { nama_lengkap: true },
            },
            kelas: {
              select: { nama_kelas: true },
            },
          },
        },
      },
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

    const daftarAbsensi = await prisma.absensi.findMany({
      where: {
        id_jadwal: detailJurnal.id_jadwal,
        tanggal: detailJurnal.tanggal,
      },
      include: {
        siswa: {
          select: { nis: true, nama_lengkap: true },
        },
      },
      orderBy: {
        siswa: { nama_lengkap: 'asc' },
      },
    });

    res.status(200).json({
      detailJurnal,
      daftarAbsensi,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

/**
 * @route   GET /api/kepsek/rekap-mingguan
 * @desc    Rekap absensi mingguan
 * @access  Private (Kepsek)
 */
export const getRekapMingguan = async (req, res) => {
  try {
    const targetDate = req.query.tanggal ? new Date(req.query.tanggal) : new Date();

    const startOfWeek = new Date(targetDate);
    const dayOfWeek = targetDate.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startOfWeek.setDate(targetDate.getDate() + diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const agregatAbsensi = await prisma.absensi.groupBy({
      by: ['id_siswa', 'status'],
      where: {
        tanggal: {
          gte: startOfWeek,
          lte: endOfWeek,
        },
      },
      _count: {
        status: true,
      },
    });

    const rekapMap = agregatAbsensi.reduce((acc, item) => {
      const { id_siswa, status, _count } = item;
      if (!acc[id_siswa]) {
        acc[id_siswa] = { H: 0, S: 0, I: 0, A: 0, total: 0 };
      }
      acc[id_siswa][status] = _count.status;
      acc[id_siswa].total += _count.status;
      return acc;
    }, {});

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
        kelas: { nama_kelas: 'asc' },
      },
    });

    const finalRekap = allSiswa.map((siswa) => ({
      id_siswa: siswa.id_siswa,
      nis: siswa.nis,
      nama_siswa: siswa.nama_lengkap,
      nama_kelas: siswa.kelas?.nama_kelas || 'N/A',
      rekap: rekapMap[siswa.id_siswa] || { H: 0, S: 0, I: 0, A: 0, total: 0 },
    }));

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