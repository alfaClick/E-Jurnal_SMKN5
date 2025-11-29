import request from 'supertest';
// PERBAIKAN: Path dari 'src/tests/' ke 'src/app.js'
import app from '../app.js'; 
// PERBAIKAN: Path dari 'src/tests/' ke 'src/prismaClient.js'
import prisma from '../prismaClient.js'; 

// =======================================================
// PENTING: Tutup Koneksi Prisma Setelah Semua Tes Selesai
// =======================================================
afterAll(async () => {
  await prisma.$disconnect();
});


// =======================================================
// TES 1: Endpoint Login Guru/Kepsek
// =======================================================
describe('POST /api/auth/login (Guru/Kepsek Login)', () => {
  
  it('Harusnya 400 (Bad Request) jika NIP atau Password tidak ada', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        nip: '123456' // Password sengaja dikosongkan
      });
    
    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toBe('NIP dan Password tidak boleh kosong');
  });

  it('Harusnya 404 (Not Found) jika NIP tidak terdaftar', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        nip: '00000000000', // NIP yang pasti tidak ada
        password: 'passwordpalsu'
      });
    
    expect(res.statusCode).toBe(404);
    expect(res.body.msg).toBe('NIP tidak ditemukan');
  });
});


// =======================================================
// TES 2: Rute Admin yang Dilindungi (Contoh: Mapel)
// =======================================================
describe('GET /api/admin/mapel (Rute Admin Terlindungi)', () => {

  it('Harusnya 401 (Unauthorized) jika tidak ada token', async () => {
    const res = await request(app).get('/api/admin/mapel');

    expect(res.statusCode).toBe(401);
    expect(res.body.msg).toBe('Akses ditolak. Tidak ada token.');
  });

  it('Harusnya 401 (Unauthorized) jika token tidak valid/palsu', async () => {
    const res = await request(app)
      .get('/api/admin/mapel')
      .set('Authorization', 'Bearer INIADALAHTOKENPALSU'); // Kirim token palsu

    expect(res.statusCode).toBe(401);
    expect(res.body.msg).toBe('Token tidak valid.');
  });
});

// =======================================================
// TES 3: Rute Guru yang Dilindungi (Contoh: Jadwal Saya)
// =======================================================
describe('GET /api/guru/jadwal-saya (Rute Guru Terlindungi)', () => {

  it('Harusnya 401 (Unauthorized) jika tidak ada token', async () => {
    const res = await request(app).get('/api/guru/jadwal-saya');

    expect(res.statusCode).toBe(401);
    expect(res.body.msg).toBe('Akses ditolak. Tidak ada token.');
  });

  it('Harusnya 401 (Unauthorized) jika token tidak valid/palsu', async () => {
    const res = await request(app)
      .get('/api/guru/jadwal-saya')
      .set('Authorization', 'Bearer INIADALAHTOKENPALSU'); // Kirim token palsu

    expect(res.statusCode).toBe(401);
    expect(res.body.msg).toBe('Token tidak valid.');
  });
});