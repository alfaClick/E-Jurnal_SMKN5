import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const bcrypt = require("bcrypt");
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 MEMULAI SEEDING FINAL...");

  // 1. BERSIH-BERSIH DATABASE
  console.log("🔥 Menghapus data lama...");
  await prisma.jurnal_harian.deleteMany();
  await prisma.absensi.deleteMany();
  await prisma.jadwal.deleteMany();
  await prisma.siswa.deleteMany();
  await prisma.kelas.deleteMany();
  await prisma.guru.deleteMany();
  await prisma.mapel.deleteMany();
  await prisma.jurusan.deleteMany();

  // 2. DATA MASTER (JURUSAN)
  console.log("🏗️ Membangun Struktur Sekolah...");
  const rpl = await prisma.jurusan.create({ data: { nama_jurusan: "Rekayasa Perangkat Lunak" } });
  const tkj = await prisma.jurusan.create({ data: { nama_jurusan: "Teknik Komputer dan Jaringan" } });

  // 3. BUAT GURU & ADMIN
  console.log("👩‍🏫 Mendaftarkan Guru & Admin...");
  
  // Password Hash untuk "123456"
  const passwordHash = bcrypt.hashSync("123456", 10);

  // Guru Biasa
  const guruBudi = await prisma.guru.create({ data: { nip: "19851212RPL001", nama_lengkap: "Budi Santoso (Wali RPL)", password: passwordHash, role: "guru", is_wali_kelas: true, id_jurusan: rpl.id_jurusan } });
  const guruSiti = await prisma.guru.create({ data: { nip: "19870507TKJ001", nama_lengkap: "Siti Marlina (Wali TKJ)", password: passwordHash, role: "guru", is_wali_kelas: true, id_jurusan: tkj.id_jurusan } });
  const guruDewi = await prisma.guru.create({ data: { nip: "19900101RPL002", nama_lengkap: "Dewi Kartika (Guru Mapel)", password: passwordHash, id_jurusan: rpl.id_jurusan } });

  // ADMIN SYSTEM (Superuser)
  const admin = await prisma.guru.create({ 
    data: { 
        nip: "19800000ADM001", 
        nama_lengkap: "Admin Sistem", 
        password: passwordHash, 
        role: "admin" 
    } 
  });
  console.log("✅ Admin Created (NIP: 19800000ADM001 / Pass: 123456)");

  // 4. BUAT KELAS
  const kelasRPL = await prisma.kelas.create({ data: { nama_kelas: "X RPL 1", id_jurusan: rpl.id_jurusan, id_wali_kelas: guruBudi.id_guru } });
  const kelasTKJ = await prisma.kelas.create({ data: { nama_kelas: "X TKJ 1", id_jurusan: tkj.id_jurusan, id_wali_kelas: guruSiti.id_guru } });

  // 5. INPUT FULL MATA PELAJARAN (Biar Checkbox Dashboard Admin Rame)
  console.log("📚 Mengisi Daftar Mata Pelajaran Lengkap...");
  const dataMapel = [
    { nama_mapel: "Pendidikan Agama dan Budi Pekerti" },
    { nama_mapel: "Pendidikan Pancasila dan Kewarganegaraan" },
    { nama_mapel: "Bahasa Indonesia" },
    { nama_mapel: "Matematika" },
    { nama_mapel: "Sejarah Indonesia" },
    { nama_mapel: "Bahasa Inggris" },
    { nama_mapel: "Seni Budaya" },
    { nama_mapel: "Pendidikan Jasmani, Olahraga, dan Kesehatan" },
    { nama_mapel: "Simulasi dan Komunikasi Digital" },
    { nama_mapel: "Fisika" },
    { nama_mapel: "Kimia" },
    { nama_mapel: "Sistem Komputer" },
    { nama_mapel: "Komputer dan Jaringan Dasar" },
    { nama_mapel: "Pemrograman Dasar" },
    { nama_mapel: "Dasar Desain Grafis" },
    { nama_mapel: "Basis Data" },
    { nama_mapel: "Pemrograman Berorientasi Objek" },
    { nama_mapel: "Pemrograman Web dan Perangkat Bergerak" },
    { nama_mapel: "Produk Kreatif dan Kewirausahaan" },
    { nama_mapel: "Teknologi Jaringan Berbasis Luas (WAN)" },
    { nama_mapel: "Administrasi Infrastruktur Jaringan" },
    { nama_mapel: "Administrasi Sistem Jaringan" },
    { nama_mapel: "Teknologi Layanan Jaringan" }
  ];

  // Masukin sekaligus banyak
  await prisma.mapel.createMany({ data: dataMapel, skipDuplicates: true });

  // 6. IMPORT SISWA DARI JSON
  console.log("📂 Membaca data_siswa.json...");
  const mapKelas = { "X RPL 1": kelasRPL.id_kelas, "X TKJ 1": kelasTKJ.id_kelas };

  try {
    const rawData = fs.readFileSync('prisma/data_siswa.json', 'utf-8');
    const dataSiswaJSON = JSON.parse(rawData);
    const siswaSiapInput = [];

    for (const siswa of dataSiswaJSON) {
        const idKelasTarget = mapKelas[siswa.kelas];
        if (idKelasTarget) {
            siswaSiapInput.push({
                nis: String(siswa.nis),
                nama_lengkap: siswa.nama_lengkap,
                jenis_kelamin: siswa.jenis_kelamin,
                id_kelas: idKelasTarget
            });
        }
    }

    if (siswaSiapInput.length > 0) {
        await prisma.siswa.createMany({ data: siswaSiapInput });
        console.log(`✅ SUKSES! ${siswaSiapInput.length} Siswa Masuk Database.`);
    }
  } catch (error) {
    console.error("❌ Error JSON:", error.message);
  }

  // 7. MENYUSUN JADWAL PELAJARAN (Sample Data)
  console.log("⏰ Menyusun Jadwal Pelajaran...");

  // Cari ID Mapel yang baru dibuat
  const mapelWeb = await prisma.mapel.findFirst({ where: { nama_mapel: "Pemrograman Web dan Perangkat Bergerak" } });
  const mapelJarkom = await prisma.mapel.findFirst({ where: { nama_mapel: "Komputer dan Jaringan Dasar" } });
  const mapelBasdat = await prisma.mapel.findFirst({ where: { nama_mapel: "Basis Data" } });

  if (mapelWeb && mapelJarkom && mapelBasdat) {
      const jadwalData = [
        // SENIN: Bu Dewi ngajar RPL
        {
            hari: "Senin",
            jam_mulai: new Date("1970-01-01T07:00:00Z"),
            jam_selesai: new Date("1970-01-01T09:00:00Z"),
            id_guru: guruDewi.id_guru,
            id_kelas: kelasRPL.id_kelas,
            id_mapel: mapelWeb.id_mapel, 
        },
        // SENIN: Bu Siti ngajar TKJ
        {
            hari: "Senin",
            jam_mulai: new Date("1970-01-01T07:00:00Z"),
            jam_selesai: new Date("1970-01-01T09:00:00Z"),
            id_guru: guruSiti.id_guru,
            id_kelas: kelasTKJ.id_kelas,
            id_mapel: mapelJarkom.id_mapel,
        },
        // SELASA: Admin (Pak Budi/Admin) ngajar RPL (Contoh Admin punya jadwal)
        {
            hari: "Selasa",
            jam_mulai: new Date("1970-01-01T08:00:00Z"),
            jam_selesai: new Date("1970-01-01T10:00:00Z"),
            id_guru: admin.id_guru, 
            id_kelas: kelasRPL.id_kelas,
            id_mapel: mapelBasdat.id_mapel,
        }
      ];
      
      await prisma.jadwal.createMany({ data: jadwalData });
      console.log(`✅ Berhasil membuat ${jadwalData.length} Jadwal Pelajaran.`);
  } else {
      console.warn("⚠️ Gagal membuat jadwal: Nama Mapel tidak ditemukan di database.");
  }

  console.log("✅ SEEDING SELESAI TOTAL!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });