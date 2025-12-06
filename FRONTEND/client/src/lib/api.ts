// ========================================
// API Configuration
// ========================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ========================================
// Interfaces
// ========================================

interface User {
  nip: string;
  nama: string;
  role: "guru" | "admin" | "kepsek";
  jurusan?: string;
  kelas?: string[];
  mapel?: string[];
}

interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
}

// ✅ UPDATED: Tambah id_jadwal dan mapel
interface Kelas {
  id: string | number;
  nama: string;
  mapel?: string;
  id_jadwal?: number; 
}

interface Siswa {
  id_siswa: number; // ID Database
  nis: string;
  nama: string;
  nama_lengkap?: string; // Alias
  kelas?: string;
  status?: 'H' | 'S' | 'I' | 'A';
  keterangan?: string;
  // Alias untuk kompatibilitas UI
  id?: string; 
}

interface RegisteredUser {
  nip: string;
  nama: string;
  role: string;
  jurusan: string;
  kelas: string[];
  mapel: string[];
}

// ========================================
// AUTH API
// ========================================

const authAPI = {
  login: async (credentials: { nip: string; password?: string }): Promise<LoginResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.message || 'Login gagal' };
      }

      // Simpan token otomatis jika login berhasil
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
      }

      return { success: true, user: data.user, token: data.token };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Terjadi kesalahan koneksi' };
    }
  },
};

// ========================================
// ADMIN API
// ========================================

const adminAPI = {
  registerUser: async (userData: any): Promise<{ success: boolean; message: string }> => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Admin belum login");

      const response = await fetch(`${API_BASE_URL}/admin/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Gagal mendaftarkan pengguna');
      return data;
    } catch (error) { throw error; }
  },

  getUsers: async (): Promise<{ users: RegisteredUser[] }> => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Admin belum login");

      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Gagal memuat daftar pengguna');
      return data;
    } catch (error) { throw error; }
  },
};

// ========================================
// GURU API
// ========================================

const guruAPI = {
  me: async (): Promise<User> => {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) throw new Error('User not found');
    return JSON.parse(storedUser);
  },

  // ✅ UPDATED: Mengambil kelas + ID Jadwal
  getKelas: async (): Promise<Kelas[]> => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (!storedUser) throw new Error('User not authenticated');
      const user = JSON.parse(storedUser);
      const token = localStorage.getItem('authToken');

      const response = await fetch(`${API_BASE_URL}/guru/kelas/${user.nip}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error('Gagal memuat daftar kelas');

      // Mapping data dari Backend ke Frontend
      // Backend mengirim: { id_kelas, nama_kelas, mapel, id_jadwal }
      const kelasList: Kelas[] = data.kelas.map((item: any) => ({
        id: item.id_kelas,
        nama: item.nama_kelas,
        mapel: item.mapel || '-',
        id_jadwal: item.id_jadwal // PENTING: Ini agar tombol simpan berfungsi
      }));

      return kelasList;
    } catch (error) { throw error; }
  },

  getKelasDetail: async (kelasId: string): Promise<Kelas> => {
    try {
      const kelasList = await guruAPI.getKelas();
      const kelas = kelasList.find(k => k.id.toString() === kelasId);
      if (!kelas) throw new Error('Kelas tidak ditemukan');
      return kelas;
    } catch (error) { throw error; }
  },

  // ✅ UPDATED: Mengambil Siswa
  getSiswaByKelas: async (kelasId: string): Promise<Siswa[]> => {
    try {
      const token = localStorage.getItem('authToken');
      // Request ke endpoint yang benar
      const response = await fetch(`${API_BASE_URL}/guru/kelas/${kelasId}/siswa`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || 'Gagal memuat daftar siswa');

      // Mapping data
      const siswaFormatted: Siswa[] = data.map((s: any) => ({
        id_siswa: s.id_siswa,
        nis: s.nis,
        nama: s.nama_lengkap, // Backend kirim nama_lengkap
        nama_lengkap: s.nama_lengkap,
        jenis_kelamin: s.jenis_kelamin,
        // Alias
        id: s.nis, 
        status: 'H' as 'H', // Default Hadir
      }));

      return siswaFormatted;
    } catch (error) { throw error; }
  },

  // ❌ DEPRECATED: Gunakan simpanJurnal
  simpanAbsensi: async (payload: any) => {
    console.warn("Fungsi simpanAbsensi sudah usang, gunakan simpanJurnal.");
    throw new Error("Gunakan tombol Simpan Jurnal");
  },

  // ✅ FIXED: Simpan Jurnal + Absensi
  simpanJurnal: async (payload: {
    id_jadwal: number;
    tanggal: string;
    materi: string;
    kegiatan?: string;
    absensi: Array<{
      id_siswa: number;
      status: 'H' | 'S' | 'I' | 'A';
    }>;
  }): Promise<{ success: boolean; message: string }> => {
    try {
      const token = localStorage.getItem('authToken');
      
      const requestBody = {
        id_jadwal: payload.id_jadwal,
        tanggal: payload.tanggal,
        materi: payload.materi,
        kegiatan: payload.kegiatan || '-',
        absensiSiswa: payload.absensi
      };

      console.log("📤 Sending to backend:", requestBody);

      const response = await fetch(`${API_BASE_URL}/guru/jurnal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Gagal menyimpan jurnal');
      }

      return { success: true, message: data.msg };
    } catch (error) { 
      console.error("❌ Error simpanJurnal:", error);
      throw error; 
    }
  },
};

// ========================================
// KEPALA SEKOLAH API (FIXED)
// ========================================

const kepsekAPI = {
  /**
   * Mengambil statistik dashboard kepsek
   */
  getStatistik: async (): Promise<{
    totalSiswa: number;
    totalGuru: number;
    totalKelas: number;
    persentaseKehadiran: number;
  }> => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Token tidak ditemukan');

      const response = await fetch(`${API_BASE_URL}/kepsek/statistik`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Gagal memuat statistik');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getStatistik:', error);
      throw error;
    }
  },

  /**
   * Mengambil semua data absensi
   */
  getAllAbsensi: async (): Promise<any[]> => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Token tidak ditemukan');

      const response = await fetch(`${API_BASE_URL}/kepsek/absensi`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Gagal memuat data absensi');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getAllAbsensi:', error);
      throw error;
    }
  },

  /**
   * Mengambil semua jurnal mengajar
   */
  getAllJurnal: async (): Promise<any[]> => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Token tidak ditemukan');

      const response = await fetch(`${API_BASE_URL}/kepsek/jurnal`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Gagal memuat data jurnal');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getAllJurnal:', error);
      throw error;
    }
  },

  /**
   * (BONUS) Mengambil semua jurnal harian dengan detail lengkap
   */
  getAllJurnalHarian: async (): Promise<any[]> => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Token tidak ditemukan');

      const response = await fetch(`${API_BASE_URL}/kepsek/jurnals`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Gagal memuat jurnal harian');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getAllJurnalHarian:', error);
      throw error;
    }
  },

  /**
   * (BONUS) Mengambil detail jurnal + absensi berdasarkan ID
   */
  getDetailJurnalById: async (id_jurnal: number): Promise<{
    detailJurnal: any;
    daftarAbsensi: any[];
  }> => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Token tidak ditemukan');

      const response = await fetch(`${API_BASE_URL}/kepsek/jurnal/${id_jurnal}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Gagal memuat detail jurnal');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getDetailJurnalById:', error);
      throw error;
    }
  },

  /**
   * (BONUS) Mengambil rekap mingguan
   */
  getRekapMingguan: async (tanggal?: string): Promise<any> => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Token tidak ditemukan');

      const url = tanggal 
        ? `${API_BASE_URL}/kepsek/rekap/mingguan?tanggal=${tanggal}`
        : `${API_BASE_URL}/kepsek/rekap/mingguan`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Gagal memuat rekap mingguan');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getRekapMingguan:', error);
      throw error;
    }
  },
};

// ========================================
// EXPORTS
// ========================================

export { authAPI, guruAPI, adminAPI, kepsekAPI };
export type { User, LoginResponse, Kelas, Siswa, RegisteredUser };