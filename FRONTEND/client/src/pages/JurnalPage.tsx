import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Heading,
  Text,
  VStack,
  HStack,
  useToast,
  Flex,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { guruAPI } from "@/lib/api";

interface Kelas {
  id: string | number;
  nama: string;
}

export default function JurnalPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const toast = useToast();
  
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    kelasId: '',
    mapel: '',
    jamPelajaran: '',
    materi: '',
  });

  useEffect(() => {
    guruAPI.getKelas().then(setKelas);
  }, []);

  const jamPelajaranOptions = [
    '07:00 - 08:30',
    '08:30 - 10:00',
    '10:15 - 11:45',
    '12:30 - 14:00',
    '14:00 - 15:30',
  ];

  const handleSubmit = async () => {
    // Validasi
    if (!formData.kelasId || !formData.mapel || !formData.jamPelajaran || !formData.materi) {
      toast({
        title: 'Error',
        description: 'Semua field wajib diisi',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      await guruAPI.simpanJurnal({
        tanggal: formData.tanggal,
        kelasId: formData.kelasId,
        mapel: formData.mapel,
        jamPelajaran: formData.jamPelajaran,
        materi: formData.materi,
      });

      toast({
        title: 'Berhasil',
        description: 'Jurnal berhasil disimpan',
        status: 'success',
        duration: 3000,
      });

      // Reset form
      setFormData({
        tanggal: new Date().toISOString().split('T')[0],
        kelasId: '',
        mapel: '',
        jamPelajaran: '',
        materi: '',
      });

      // Redirect ke dashboard
      setTimeout(() => {
        navigate('/guru');
      }, 1500);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Gagal menyimpan jurnal',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="#F7FAFC">
      {/* Header */}
      <Box 
        bg="linear-gradient(135deg, #4299E1 0%, #3182CE 100%)" 
        color="white" 
        px={8} 
        py={8}
        boxShadow="sm"
      >
        <Box maxW="1000px" mx="auto">
          <Flex justify="space-between" align="center">
            <Box>
              <Heading size="xl" fontWeight="bold" mb={2}>
                Jurnal Mengajar
              </Heading>
              <Text fontSize="md" opacity={0.95}>
                Catat kegiatan mengajar harian Anda
              </Text>
            </Box>
            <Button
              colorScheme="whiteAlpha"
              variant="solid"
              onClick={() => navigate('/guru')}
              px={6}
            >
              ← Kembali
            </Button>
          </Flex>
        </Box>
      </Box>

      {/* Content */}
      <Box maxW="1000px" mx="auto" px={8} py={8}>
        <Card 
          bg="white" 
          boxShadow="lg" 
          borderRadius="2xl" 
          overflow="hidden"
          border="1px solid"
          borderColor="blue.100"
        >
          <CardHeader 
            bg="linear-gradient(to right, #EBF8FF, #BEE3F8)" 
            py={6}
          >
            <HStack spacing={3}>
              <Box bg="blue.500" p={3} borderRadius="xl">
                <Text fontSize="2xl">📝</Text>
              </Box>
              <Box>
                <Heading size="md" color="blue.900">
                  Formulir Jurnal Agenda Harian
                </Heading>
                <Text fontSize="sm" color="blue.600" mt={1}>
                  Isi semua informasi dengan lengkap
                </Text>
              </Box>
            </HStack>
          </CardHeader>

          <CardBody p={8}>
            <VStack spacing={6} align="stretch">
              {/* Row 1: Tanggal, Kelas, Mapel */}
              <HStack spacing={6} align="start">
                <FormControl isRequired>
                  <FormLabel color="gray.700" fontWeight="semibold" fontSize="sm">
                    Tanggal
                  </FormLabel>
                  <Input
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    size="lg"
                    borderColor="gray.300"
                    focusBorderColor="blue.500"
                    _hover={{ borderColor: 'blue.300' }}
                    bg="gray.50"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="gray.700" fontWeight="semibold" fontSize="sm">
                    Kelas
                  </FormLabel>
                  <Select
                    placeholder="Pilih Kelas"
                    value={formData.kelasId}
                    onChange={(e) => setFormData({ ...formData, kelasId: e.target.value })}
                    size="lg"
                    borderColor="gray.300"
                    focusBorderColor="blue.500"
                    _hover={{ borderColor: 'blue.300' }}
                    bg="gray.50"
                  >
                    {kelas.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.nama}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="gray.700" fontWeight="semibold" fontSize="sm">
                    Mata Pelajaran
                  </FormLabel>
                  <Input
                    placeholder="Contoh: Matematika"
                    value={formData.mapel}
                    onChange={(e) => setFormData({ ...formData, mapel: e.target.value })}
                    size="lg"
                    borderColor="gray.300"
                    focusBorderColor="blue.500"
                    _hover={{ borderColor: 'blue.300' }}
                    bg="gray.50"
                  />
                </FormControl>
              </HStack>

              {/* Row 2: Jam Pelajaran */}
              <FormControl isRequired>
                <FormLabel color="gray.700" fontWeight="semibold" fontSize="sm">
                  Jam Pelajaran
                </FormLabel>
                <Select
                  placeholder="Pilih Jam"
                  value={formData.jamPelajaran}
                  onChange={(e) => setFormData({ ...formData, jamPelajaran: e.target.value })}
                  size="lg"
                  borderColor="gray.300"
                  focusBorderColor="blue.500"
                  _hover={{ borderColor: 'blue.300' }}
                  bg="gray.50"
                >
                  {jamPelajaranOptions.map((jam) => (
                    <option key={jam} value={jam}>
                      {jam}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* Row 3: Materi */}
              <FormControl isRequired>
                <FormLabel color="gray.700" fontWeight="semibold" fontSize="sm">
                  Materi yang Dibahas
                </FormLabel>
                <Textarea
                  placeholder="Jelaskan materi yang diajarkan hari ini..."
                  value={formData.materi}
                  onChange={(e) => setFormData({ ...formData, materi: e.target.value })}
                  size="lg"
                  rows={6}
                  borderColor="gray.300"
                  focusBorderColor="blue.500"
                  _hover={{ borderColor: 'blue.300' }}
                  bg="gray.50"
                  resize="vertical"
                />
                <Text fontSize="xs" color="gray.500" mt={2}>
                  {formData.materi.length} karakter
                </Text>
              </FormControl>

              {/* Submit Button */}
              <Box pt={4}>
                <Button
                  size="lg"
                  w="full"
                  h="60px"
                  bg="linear-gradient(135deg, #4299E1 0%, #3182CE 100%)"
                  color="white"
                  fontSize="lg"
                  fontWeight="bold"
                  onClick={handleSubmit}
                  isLoading={loading}
                  loadingText="Menyimpan..."
                  _hover={{
                    bg: "linear-gradient(135deg, #3182CE 0%, #2C5282 100%)",
                    transform: "translateY(-2px)",
                    boxShadow: "lg"
                  }}
                  _active={{
                    transform: "translateY(0)",
                  }}
                  transition="all 0.2s"
                  boxShadow="md"
                  leftIcon={<Text fontSize="xl">💾</Text>}
                >
                  Simpan Jurnal
                </Button>
              </Box>

              {/* Info Box */}
              <Box 
                bg="blue.50" 
                p={4} 
                borderRadius="lg" 
                borderLeft="4px solid"
                borderLeftColor="blue.500"
              >
                <HStack spacing={2}>
                  <Text fontSize="lg">💡</Text>
                  <Text fontSize="sm" color="blue.900">
                    <strong>Tips:</strong> Pastikan semua informasi sudah benar sebelum menyimpan. 
                    Jurnal yang telah disimpan dapat dilihat di menu "Riwayat Jurnal".
                  </Text>
                </HStack>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </Box>
    </Box>
  );
}