import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 MEMULAI PROSES DISTRIBUSI SISWA...");

  // 1. Ambil semua kelas yang tersedia
  const daftarKelas = await prisma.kelas.findMany({
    orderBy: { nama_kelas: 'asc' }
  });

  if (daftarKelas.length === 0) {
    console.error("❌ ERROR: Tidak ada data KELAS. Buat dulu data kelas.");
    return;
  }
  console.log(`📦 Ditemukan ${daftarKelas.length} Kelas.`);

  // 2. Ambil semua siswa real Anda
  const semuaSiswa = await prisma.siswa.findMany();
  
  if (semuaSiswa.length === 0) {
    console.error("❌ ERROR: Tidak ada data SISWA. Pastikan database siswa sudah terisi.");
    return;
  }
  console.log(`👥 Ditemukan ${semuaSiswa.length} Siswa.`);

  console.log("🔄 Sedang mengelompokkan siswa ke dalam kelas...");

  // 3. Algoritma Bagi Rata (Round Robin)
  // Siswa 1 -> Kelas A
  // Siswa 2 -> Kelas B
  // Siswa 3 -> Kelas A ... dst
  
  let updateCount = 0;
  
  for (let i = 0; i < semuaSiswa.length; i++) {
    const siswa = semuaSiswa[i];
    
    // Tentukan kelas target berdasarkan urutan
    // (Menggunakan modulo operator %)
    const indexKelas = i % daftarKelas.length; 
    const targetKelas = daftarKelas[indexKelas];

    // Update siswa tersebut
    await prisma.siswa.update({
      where: { id_siswa: siswa.id_siswa }, // atau nis: siswa.nis
      data: {
        id_kelas: targetKelas.id_kelas
      }
    });

    process.stdout.write(`\r✅ Mengupdate Siswa ke-${i + 1}: ${siswa.nama_lengkap} -> ${targetKelas.nama_kelas}   `);
    updateCount++;
  }

  console.log("\n\n==========================================");
  console.log(`🎉 SELESAI! Berhasil mengelompokkan ${updateCount} siswa.`);
  console.log("==========================================");
  console.log("👉 Sekarang coba buka Dashboard Guru dan klik salah satu kelas.");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());