import api from "@/lib/api";
import type { User, Kelas, JurnalReq, AbsenReq } from "@shared/types";

export async function me(): Promise<User> {
  const { data } = await api.get<User>("/guru/me"); return data;
}
export async function getKelas(): Promise<Kelas[]> {
  const { data } = await api.get<Kelas[]>("/guru/kelas"); return data;
}
export async function postJurnal(b: JurnalReq) { return (await api.post("/jurnal", b)).data; }
export async function postAbsen(b: AbsenReq)  { return (await api.post("/absensi", b)).data; }
