// ========================================
// API Configuration
// ========================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5500/api';

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

interface Kelas {
  id: string | number;
  nama: string;
}

interface Siswa {
  nis: string;
  nama: string;
  kelas: string;
  status?: 'H' | 'S' | 'I' | 'A';
  keterangan?: string;
  // Add id as alias for compatibility
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Login gagal',
        };
      }

      return {
        success: true,
        user: data.user,
        token: data.token,
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan koneksi',
      };
    }
  },
};

// ========================================
// ADMIN API
// ========================================

const adminAPI = {
  registerUser: async (userData: {
    nip: string;
    nama: string;
    role: string;
    jurusan: string;
    kelas: string[];
    mapel: string[];
    password: string;
  }): Promise<{ success: boolean; message: string }> => {
    try {
      // ambil token admin
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("Admin belum login");
    }

    const response = await fetch(`${API_BASE_URL}/admin/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, 
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Gagal mendaftarkan pengguna');
    }

    return data;
  } catch (error) {
    throw error;
  }
    
  },

  getUsers: async (): Promise<{ users: RegisteredUser[] }> => {
  try {
    // Ambil token dari localStorage
    const token = localStorage.getItem("authToken");

    if (!token) {
      throw new Error("Admin belum login");
    }

    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Gagal memuat daftar pengguna');
    }

    return data; // { users: [...] }
  } catch (error) {
    throw error;
  }
},

};

// ========================================
// GURU API
// ========================================

const guruAPI = {
  me: async (): Promise<User> => {
    // Get current user from localStorage (already logged in)
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      throw new Error('User not found');
    }
    return JSON.parse(storedUser);
  },

  getKelas: async (): Promise<Kelas[]> => {
    try {
      // Get guru NIP from current user
      const storedUser = localStorage.getItem('currentUser');
      if (!storedUser) {
        throw new Error('User not authenticated');
      }

      const user = JSON.parse(storedUser);
      const guruNip = user.nip;

      const response = await fetch(`${API_BASE_URL}/guru/kelas/${guruNip}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error('Gagal memuat daftar kelas');
      }

      // Backend returns { kelas: ["10 RPL 1", "10 RPL 2"] }
      // Convert to format with id and nama
      const kelasList: Kelas[] = data.kelas.map((namaKelas: string, index: number) => ({
        id: index + 1,
        nama: namaKelas,
      }));

      return kelasList;
    } catch (error) {
      throw error;
    }
  },

  getKelasDetail: async (kelasId: string): Promise<Kelas> => {
    try {
      const kelasList = await guruAPI.getKelas();
      const kelas = kelasList.find(k => k.id.toString() === kelasId);
      
      if (!kelas) {
        throw new Error('Kelas tidak ditemukan');
      }

      return kelas;
    } catch (error) {
      throw error;
    }
  },

  getSiswaByKelas: async (kelasId: string): Promise<Siswa[]> => {
    try {
      // First, get kelas detail to get nama kelas
      const kelas = await guruAPI.getKelasDetail(kelasId);
      const namaKelas = kelas.nama;

      // Encode nama kelas for URL
      const encodedKelas = encodeURIComponent(namaKelas);

      const response = await fetch(`${API_BASE_URL}/guru/siswa/${encodedKelas}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error('Gagal memuat daftar siswa');
      }

      // Backend returns { siswa: [{ nis, nama, kelas }] }
      // Add default status 'H' (Hadir) and id as alias for nis
      const siswaWithStatus: Siswa[] = data.siswa.map((s: Siswa) => ({
        ...s,
        id: s.nis, // Add id as alias for backwards compatibility
        status: 'H' as 'H',
      }));

      return siswaWithStatus;
    } catch (error) {
      throw error;
    }
  },

  simpanAbsensi: async (payload: {
    kelasId: string;
    tanggal: string;
    mapel?: string;
    jamPelajaran?: string;
    absensi: Array<{
      siswaId: string;
      status: 'H' | 'S' | 'I' | 'A';
      keterangan: string;
    }>;
  }): Promise<{ success: boolean; id: string; message: string }> => {
    try {
      if (!payload.kelasId) {
        throw new Error('Kelas ID tidak boleh kosong');
      }

      // Get kelas detail
      const kelas = await guruAPI.getKelasDetail(payload.kelasId);
      
      // Get current user (guru)
      const storedUser = localStorage.getItem('currentUser');
      if (!storedUser) {
        throw new Error('User not authenticated');
      }
      const user = JSON.parse(storedUser);

      // Get all siswa to map nis and nama
      const allSiswa = await guruAPI.getSiswaByKelas(payload.kelasId);

      // Convert status to full name
      const statusMap = {
        'H': 'Hadir',
        'S': 'Sakit',
        'I': 'Izin',
        'A': 'Alfa',
      };

      // Format siswa data for backend
      const siswaData = payload.absensi.map(item => {
        const siswa = allSiswa.find(s => s.nis === item.siswaId);
        return {
          nis: item.siswaId,
          nama: siswa?.nama || '',
          status: statusMap[item.status],
        };
      });

      const requestBody = {
        tanggal: payload.tanggal,
        kelas: kelas.nama,
        guru: user.nama,
        siswa: siswaData,
      };

      const response = await fetch(`${API_BASE_URL}/absensi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal menyimpan absensi');
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  simpanJurnal: async (payload: {
    tanggal: string;
    kelasId: string;
    mapel: string;
    jamPelajaran: string;
    materi: string;
  }): Promise<{ success: boolean; id: string; message: string }> => {
    try {
      // Get kelas detail
      const kelas = await guruAPI.getKelasDetail(payload.kelasId);
      
      // Get current user (guru)
      const storedUser = localStorage.getItem('currentUser');
      if (!storedUser) {
        throw new Error('User not authenticated');
      }
      const user = JSON.parse(storedUser);

      const requestBody = {
        tanggal: payload.tanggal,
        kelas: kelas.nama,
        guru: user.nama,
        mapel: payload.mapel,
        materi: payload.materi,
      };

      const response = await fetch(`${API_BASE_URL}/jurnal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal menyimpan jurnal');
      }

      return data;
    } catch (error) {
      throw error;
    }
  },
};

// ========================================
// KEPALA SEKOLAH API
// ========================================

const kepsekAPI = {
  getStatistik: async (): Promise<{
    totalSiswa: number;
    totalGuru: number;
    totalKelas: number;
    persentaseKehadiran: number;
  }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/kepsek/statistics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error('Gagal memuat statistik');
      }

      // Backend returns: { totalGuru, totalKelas, totalSiswa, tingkatKehadiran }
      return {
        totalSiswa: data.totalSiswa,
        totalGuru: data.totalGuru,
        totalKelas: data.totalKelas,
        persentaseKehadiran: data.tingkatKehadiran,
      };
    } catch (error) {
      throw error;
    }
  },

  getAllAbsensi: async (): Promise<any[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/absensi`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error('Gagal memuat absensi');
      }

      // Backend returns: { absensi: [...] }
      // Transform to match frontend format
      const absensiList = data.absensi.map((item: any, index: number) => {
        const statusCount = {
          hadir: 0,
          sakit: 0,
          izin: 0,
          alpha: 0,
        };

        // Count status
        item.siswa.forEach((s: any) => {
          if (s.status === 'Hadir') statusCount.hadir++;
          if (s.status === 'Sakit') statusCount.sakit++;
          if (s.status === 'Izin') statusCount.izin++;
          if (s.status === 'Alfa') statusCount.alpha++;
        });

        return {
          id: item.id || index + 1,
          tanggal: item.tanggal,
          kelas: item.kelas,
          mapel: item.mapel || '-',
          guru: item.guru,
          hadir: statusCount.hadir,
          sakit: statusCount.sakit,
          izin: statusCount.izin,
          alpha: statusCount.alpha,
        };
      });

      return absensiList;
    } catch (error) {
      throw error;
    }
  },

  getAllJurnal: async (): Promise<any[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/jurnal`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error('Gagal memuat jurnal');
      }

      // Backend returns: { jurnal: [...] }
      return data.jurnal.map((item: any, index: number) => ({
        id: item.id || index + 1,
        tanggal: item.tanggal,
        kelas: item.kelas,
        mapel: item.mapel,
        guru: item.guru,
        jamPelajaran: item.jamPelajaran || '-',
        materi: item.materi,
      }));
    } catch (error) {
      throw error;
    }
  },
};

// ========================================
// EXPORTS
// ========================================

export { authAPI, guruAPI, adminAPI, kepsekAPI };
export type { User, LoginResponse, Kelas, Siswa, RegisteredUser };