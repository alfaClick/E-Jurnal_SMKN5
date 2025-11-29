import { useEffect, useMemo, useState } from "react";
import { guruAPI } from "@/lib/api";

type Status = "hadir" | "sakit" | "izin" | "alpha";
type Siswa = { id: string; nama: string };
type Row = { id: string; nama: string; status: Status };

type Props = {
  /** kalau dipakai di Jurnal, kirim kelas & tanggal dari form */
  kelasId?: string;
  tanggal?: string;
  /** kalau true: header & filter disembunyikan (embed mode) */
  embedded?: boolean;
};

const STY = {
  th: { padding: "12px 14px", fontSize: 13, color: "#475569", fontWeight: 700, borderBottom: "1px solid #e2e8f0" } as React.CSSProperties,
  td: { padding: "12px 14px", fontSize: 14, color: "#0f172a", verticalAlign: "middle" } as React.CSSProperties,
  tdCenter: { padding: "12px 14px", fontSize: 14, color: "#0f172a", verticalAlign: "middle", textAlign: "center", width: 56 } as React.CSSProperties,
};

const PILL: Record<Status, { label: string; color: string; bg: string; border: string }> = {
  hadir: { label: "Hadir", color: "#166534", bg: "#dcfce7", border: "#bbf7d0" },
  sakit: { label: "Sakit", color: "#854d0e", bg: "#fef3c7", border: "#fde68a" },
  izin:  { label: "Izin",  color: "#1e3a8a", bg: "#dbeafe", border: "#bfdbfe" },
  alpha: { label: "Alpha", color: "#991b1b", bg: "#fee2e2", border: "#fecaca" },
};

export default function AbsensiPage({ kelasId, tanggal, embedded }: Props) {
  // kalau tidak embedded, komponen ini berdiri sendiri & punya filter sendiri
  const [kelasList, setKelasList] = useState<{ id: string | number; nama: string }[]>([]);
  const [localKelasId, setLocalKelasId] = useState("");
  const [localTanggal, setLocalTanggal] = useState(() => new Date().toISOString().slice(0, 10));

  const activeKelasId = kelasId ?? localKelasId;
  const activeTanggal = tanggal ?? localTanggal;

  const [rows, setRows] = useState<Row[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // MOCK siswa per kelas — nanti ganti ke fetch BE
  const siswaMock: Record<string, Siswa[]> = useMemo(
    () => ({
      "1": [
        { id: "S01", nama: "Citra Dewi" },
        { id: "S02", nama: "Dani Pratama" },
        { id: "S03", nama: "Eka Sari" },
        { id: "S04", nama: "Fajar Nugroho" },
        { id: "S05", nama: "Gita Permata" },
      ],
      "2": [
        { id: "T01", nama: "Andi Setiawan" },
        { id: "T02", nama: "Bunga Ayu" },
        { id: "T03", nama: "Chandra Putra" },
        { id: "T04", nama: "Dewi Nirmala" },
      ],
    }),
    []
  );

  // kalau standalone: load kelas
  useEffect(() => {
    if (embedded) return;
    (async () => {
      const k = await guruAPI.getKelas();
      setKelasList(k);
      if (k?.length) setLocalKelasId(String(k[0].id));
    })();
  }, [embedded]);

  // load siswa saat kelas berubah
  useEffect(() => {
    if (!activeKelasId) return;
    const siswa = siswaMock[activeKelasId] || [];
    setRows(siswa.map(s => ({ id: s.id, nama: s.nama, status: "hadir" })));
    setMsg("");
  }, [activeKelasId, siswaMock]);

  function setStatus(id: string, status: Status) {
    setRows(prev => prev.map(r => (r.id === id ? { ...r, status } : r)));
  }

  async function submit() {
    setSaving(true);
    setMsg("");
    try {
      const hadir = rows.filter(r => r.status === "hadir").map(r => r.id);
      const izin  = rows.filter(r => r.status === "izin").map(r => r.id);
      const sakit = rows.filter(r => r.status === "sakit").map(r => r.id);
      const alpha = rows.filter(r => r.status === "alpha").map(r => r.id);
      
      // Simpan absensi menggunakan API yang sudah ada
      await guruAPI.simpanAbsensi({ 
        kelasId: activeKelasId, 
        tanggal: activeTanggal, 
        absensi: rows.map(r => ({
          siswaId: r.id,
          status: r.status === 'hadir' ? 'H' : r.status === 'sakit' ? 'S' : r.status === 'izin' ? 'I' : 'A',
          keterangan: ''
        }))
      });
      
      setMsg("Absensi tersimpan ✔");
    } catch (e: any) {
      setMsg(e?.response?.data?.message || e?.message || "Gagal simpan absensi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ marginTop: 20 }}>
      {/* header/filter hanya tampil kalau TIDAK embedded */}
      {!embedded && (
        <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: 13, color: "#6b7280" }}>Kelas</label>
            <select
              value={localKelasId}
              onChange={(e) => setLocalKelasId(e.target.value)}
              style={{ display: "block", width: "100%", padding: 10, border: "1px solid #e5e7eb", borderRadius: 8 }}
            >
              {kelasList.map(k => <option key={k.id} value={String(k.id)}>{k.nama}</option>)}
            </select>
          </div>
          <div style={{ width: 220 }}>
            <label style={{ display: "block", fontSize: 13, color: "#6b7280" }}>Tanggal</label>
            <input
              type="date"
              value={localTanggal}
              onChange={(e) => setLocalTanggal(e.target.value)}
              style={{ display: "block", width: "100%", padding: 10, border: "1px solid #e5e7eb", borderRadius: 8 }}
            />
          </div>
        </div>
      )}

      <div style={{ overflowX: "auto", border: "1px solid #e5e7eb", borderRadius: 10, background: "#fff" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              <th style={STY.th}>No</th>
              <th style={{ ...STY.th, textAlign: "left" }}>Nama Siswa</th>
              <th style={{ ...STY.th, textAlign: "left" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={STY.tdCenter}>{i + 1}</td>
                <td style={{ ...STY.td, fontWeight: 500 }}>{r.nama}</td>
                <td style={STY.td}>
                  {(Object.keys(PILL) as Status[]).map((k) => {
                    const s = PILL[k];
                    const active = r.status === k;
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setStatus(r.id, k)}
                        style={{
                          padding: "4px 10px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 600,
                          border: `1px solid ${active ? s.border : "#e5e7eb"}`,
                          color: active ? s.color : "#6b7280",
                          background: active ? s.bg : "#fff",
                          cursor: "pointer",
                          marginRight: 6,
                        }}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={3} style={{ ...STY.td, textAlign: "center", color: "#6b7280" }}>
                  Tidak ada siswa pada kelas ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={submit}
          disabled={saving || rows.length === 0 || !activeKelasId}
          style={{
            padding: "10px 14px",
            background: "#2563eb",
            color: "#fff",
            fontWeight: 600,
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? "Menyimpan..." : "Simpan Absensi"}
        </button>
      </div>

      {msg && (
        <div style={{ marginTop: 10, color: msg.includes("✔") ? "#166534" : "crimson", fontWeight: 600 }}>
          {msg}
        </div>
      )}
    </div>
  );
}