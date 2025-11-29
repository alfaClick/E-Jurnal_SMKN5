export type Role = "admin" | "guru" | "kepsek";

export interface LoginReq { nip: string; password: string; }
export interface LoginRes { success: boolean; token?: string; user?: User; message?: string; }

export interface User {
  nip: string;
  nama: string;
  role: Role;
  jurusan?: string;
  mapel?: string[];
  kelas?: string[];
}

export interface Kelas { id: string; nama: string; }

export interface JurnalReq { kelasId: string; tanggal: string; mapel: string; materi: string; }
export interface AbsenReq  { kelasId: string; tanggal: string; hadir: string[]; izin: string[]; sakit: string[]; alpha: string[]; }
