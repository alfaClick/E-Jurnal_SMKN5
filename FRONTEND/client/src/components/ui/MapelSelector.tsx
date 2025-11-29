import { useState, useEffect } from "react";
import { 
  Box, 
  Text, 
  Checkbox, 
  CheckboxGroup, 
  Stack, 
  Spinner,
  useToast 
} from "@chakra-ui/react";

// Sesuaikan URL Backend kamu. 
// Fallback ke localhost:5500 kalau gak ada env.
const API_BASE = "http://localhost:5500/api";

interface Mapel {
  id_mapel: number;
  nama_mapel: string;
}

// Props biar komponen ini bisa komunikasi sama Form Induknya (AdminDashboard)
interface MapelSelectorProps {
  selectedMapel: string[]; // Array ID Mapel yang dipilih (sebagai string)
  setSelectedMapel: (value: string[]) => void; // Fungsi buat update state di induk
}

export default function MapelSelector({ selectedMapel, setSelectedMapel }: MapelSelectorProps) {
  // State lokal buat nampung data dari database
  const [listMapel, setListMapel] = useState<Mapel[]>([]); 
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // INI BAGIAN PENTINGNYA: Ambil data dari API pas komponen muncul
  useEffect(() => {
    const fetchMapel = async () => {
      try {
        console.log("Fetching mapel from:", `${API_BASE}/mapel`); // Debugging
        const res = await fetch(`${API_BASE}/mapel`);
        
        if (!res.ok) {
            throw new Error(`Gagal mengambil data mapel (${res.status})`);
        }

        const data = await res.json();
        console.log("Data mapel received:", data); // Debugging
        setListMapel(data); 
      } catch (error: any) {
        console.error("Error fetch mapel:", error);
        toast({
            title: "Gagal memuat Mapel",
            description: "Pastikan server backend nyala. " + error.message,
            status: "error",
            duration: 5000,
            isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMapel();
  }, [toast]);

  return (
    <Box mt={4}>
      <Text mb={2} fontWeight="bold" fontSize="sm" color="gray.700">
        Mata Pelajaran yang Diajar <span style={{color: "red"}}>*</span>
      </Text>
      
      <Box 
        border="1px solid" 
        borderColor="gray.200" 
        p={3} 
        borderRadius="md" 
        h="200px"        // Tinggi kotak fix biar gak kepanjangan
        overflowY="auto" // Biar bisa di-scroll kalau mapelnya banyak
        bg="gray.50"
      >
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" h="100%">
             <Spinner size="md" color="blue.500" thickness="3px" />
             <Text ml={3} fontSize="sm" color="gray.500">Memuat data...</Text>
          </Box>
        ) : listMapel.length === 0 ? (
            <Text fontSize="sm" color="red.500" textAlign="center" mt={10}>
                Tidak ada data mapel ditemukan. <br/> Cek database / seed.js!
            </Text>
        ) : (
          <CheckboxGroup colorScheme="blue" value={selectedMapel} onChange={setSelectedMapel}>
            <Stack direction="column" spacing={2}>
              
              {/* LOOPING DATA DARI DATABASE DI SINI */}
              {listMapel.map((m) => (
                <Checkbox 
                    key={m.id_mapel} 
                    value={String(m.id_mapel)} // Value yang disimpan adalah ID (angka jadi string)
                    size="sm"
                >
                  {m.nama_mapel}
                </Checkbox>
              ))}

            </Stack>
          </CheckboxGroup>
        )}
      </Box>
      
      <Text fontSize="xs" color="gray.500" mt={1} fontStyle="italic">
        {selectedMapel.length} mapel dipilih
      </Text>
    </Box>
  );
}