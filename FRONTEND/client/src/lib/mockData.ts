export interface User {
  nip: string;
  nama: string;
  password: string;
  role: 'admin' | 'guru' | 'kepsek';
  jurusan?: string;
  kelas?: string[];
  mapel?: string[];
}

export interface Siswa {
  nis: string;
  nama: string;
  kelas: string;
}

export interface Absensi {
  id: string;
  tanggal: string;
  kelas: string;
  guru: string;
  siswa: {
    nis: string;
    nama: string;
    status: 'Hadir' | 'Sakit' | 'Izin' | 'Alfa';
  }[];
}

export interface Jurnal {
  id: string;
  tanggal: string;
  kelas: string;
  guru: string;
  mapel: string;
  materi: string;
}

export const users: User[] = [
  {
    nip: 'admin',
    nama: 'Administrator',
    password: 'admin123',
    role: 'admin',
  },
  {
    nip: '198227272',
    nama: 'Iyan Hadi Permana',
    password: '123guru',
    role: 'guru',
    jurusan: 'RPL',
    kelas: ['10 RPL 1', '10 RPL 2', '10 RPL 3'],
    mapel: ['Algoritma Pemrograman', 'Dasar-dasar Pemrograman', 'Android'],
  },
  {
    nip: '198312345',
    nama: 'Siti Nurhaliza',
    password: '123guru',
    role: 'guru',
    kelas: ['11 TKJ 1', '11 TKJ 2'],
    mapel: ['Bahasa Indonesia', 'Bahasa Inggris'],
  },
  {
    nip: '197654321',
    nama: 'Budi Santoso',
    password: '123kepsek',
    role: 'kepsek',
  },
];

export const siswaPerKelas: Record<string, Siswa[]> = {
  '10 RPL 1': [
    { nis: '2024001', nama: 'Ahmad Fauzi', kelas: '10 RPL 1' },
    { nis: '2024002', nama: 'Dewi Lestari', kelas: '10 RPL 1' },
    { nis: '2024003', nama: 'Rizki Pratama', kelas: '10 RPL 1' },
    { nis: '2024004', nama: 'Sinta Wulandari', kelas: '10 RPL 1' },
    { nis: '2024005', nama: 'Andi Wijaya', kelas: '10 RPL 1' },
    { nis: '2024006', nama: 'Fitri Rahmawati', kelas: '10 RPL 1' },
    { nis: '2024007', nama: 'Budi Setiawan', kelas: '10 RPL 1' },
    { nis: '2024008', nama: 'Nina Kartika', kelas: '10 RPL 1' },
  ],
  '10 RPL 2': [
    { nis: '2024009', nama: 'Hendra Gunawan', kelas: '10 RPL 2' },
    { nis: '2024010', nama: 'Lisa Anggraini', kelas: '10 RPL 2' },
    { nis: '2024011', nama: 'Yoga Pranata', kelas: '10 RPL 2' },
    { nis: '2024012', nama: 'Dini Safitri', kelas: '10 RPL 2' },
    { nis: '2024013', nama: 'Arif Rahman', kelas: '10 RPL 2' },
    { nis: '2024014', nama: 'Putri Ayu', kelas: '10 RPL 2' },
  ],
  '10 RPL 3': [
    { nis: '2024015', nama: 'Fajar Nugroho', kelas: '10 RPL 3' },
    { nis: '2024016', nama: 'Maya Sari', kelas: '10 RPL 3' },
    { nis: '2024017', nama: 'Dedi Hermawan', kelas: '10 RPL 3' },
    { nis: '2024018', nama: 'Rini Susanti', kelas: '10 RPL 3' },
    { nis: '2024019', nama: 'Toni Kurniawan', kelas: '10 RPL 3' },
  ],
  '11 TKJ 1': [
    { nis: '2023001', nama: 'Agus Salim', kelas: '11 TKJ 1' },
    { nis: '2023002', nama: 'Rina Melati', kelas: '11 TKJ 1' },
    { nis: '2023003', nama: 'Doni Saputra', kelas: '11 TKJ 1' },
    { nis: '2023004', nama: 'Wati Rahayu', kelas: '11 TKJ 1' },
  ],
  '11 TKJ 2': [
    { nis: '2023005', nama: 'Eko Prasetyo', kelas: '11 TKJ 2' },
    { nis: '2023006', nama: 'Ani Susilo', kelas: '11 TKJ 2' },
    { nis: '2023007', nama: 'Rudi Hartono', kelas: '11 TKJ 2' },
  ],
};

export const jurnalData: Jurnal[] = [
  {
    id: '1',
    tanggal: '2024-01-15',
    kelas: '10 RPL 1',
    guru: 'Iyan Hadi Permana',
    mapel: 'Algoritma Pemrograman',
    materi: 'Pengenalan algoritma sorting: Bubble Sort dan Selection Sort',
  },
  {
    id: '2',
    tanggal: '2024-01-15',
    kelas: '11 TKJ 1',
    guru: 'Siti Nurhaliza',
    mapel: 'Bahasa Indonesia',
    materi: 'Menulis teks argumentasi',
  },
];

export const absensiData: Absensi[] = [
  {
    id: '1',
    tanggal: '2024-01-15',
    kelas: '10 RPL 1',
    guru: 'Iyan Hadi Permana',
    siswa: [
      { nis: '2024001', nama: 'Ahmad Fauzi', status: 'Hadir' },
      { nis: '2024002', nama: 'Dewi Lestari', status: 'Hadir' },
      { nis: '2024003', nama: 'Rizki Pratama', status: 'Sakit' },
      { nis: '2024004', nama: 'Sinta Wulandari', status: 'Hadir' },
      { nis: '2024005', nama: 'Andi Wijaya', status: 'Hadir' },
      { nis: '2024006', nama: 'Fitri Rahmawati', status: 'Izin' },
      { nis: '2024007', nama: 'Budi Setiawan', status: 'Hadir' },
      { nis: '2024008', nama: 'Nina Kartika', status: 'Hadir' },
    ],
  },
];

export const kelasList = [
  '10 RPL 1', '10 RPL 2', '10 RPL 3',
  '11 RPL 1', '11 RPL 2',
  '10 TKJ 1', '10 TKJ 2',
  '11 TKJ 1', '11 TKJ 2',
  '10 MM 1', '10 MM 2',
];

export const mapelList = [
  'Algoritma Pemrograman',
  'Dasar-dasar Pemrograman',
  'Android',
  'Bahasa Indonesia',
  'Bahasa Inggris',
  'Matematika',
  'Jaringan Komputer',
  'Sistem Operasi',
  'Multimedia',
  'Design Grafis',
];

export const jurusanList = ['RPL', 'TKJ', 'MM', 'Umum'];
