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
  Heading,
  Text,
  VStack,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Radio,
  useToast,
  Flex,
  Badge,
  Spinner,
  SimpleGrid,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { guruAPI, type Siswa, type Kelas } from "@/lib/api";

export default function KelasDetailPage() {
  const { kelasId } = useParams<{ kelasId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const toast = useToast();

  const [kelas, setKelas] = useState<Kelas | null>(null);
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    mapel: '',
    jamPelajaran: '',
  });

  const jamPelajaranOptions = [
    '07:00 - 08:30',
    '08:30 - 10:00',
    '10:15 - 11:45',
    '12:30 - 14:00',
    '14:00 - 15:30',
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!kelasId) return;

      try {
        const [kelasData, siswaData] = await Promise.all([
          guruAPI.getKelasDetail(kelasId),
          guruAPI.getSiswaByKelas(kelasId)
        ]);
        
        setKelas(kelasData);
        setSiswaList(siswaData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast({
          title: 'Error',
          description: 'Gagal memuat data kelas',
          status: 'error',
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [kelasId, toast]);

  const handleStatusChange = (siswaIdentifier: string, newStatus: 'H' | 'S' | 'I' | 'A') => {
    setSiswaList(prev =>
      prev.map(siswa =>
        (siswa.nis === siswaIdentifier || siswa.id === siswaIdentifier) 
          ? { ...siswa, status: newStatus } 
          : siswa
      )
    );
  };

  const handleKeteranganChange = (siswaIdentifier: string, keterangan: string) => {
    setSiswaList(prev =>
      prev.map(siswa =>
        (siswa.nis === siswaIdentifier || siswa.id === siswaIdentifier)
          ? { ...siswa, keterangan } 
          : siswa
      )
    );
  };

  const handleSubmit = async () => {
    if (!formData.mapel || !formData.jamPelajaran) {
      toast({
        title: 'Error',
        description: 'Mata Pelajaran dan Jam Pelajaran wajib diisi',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setSubmitting(true);

    try {
      await guruAPI.simpanAbsensi({
        kelasId: kelasId || '',
        tanggal: formData.tanggal,
        mapel: formData.mapel,
        jamPelajaran: formData.jamPelajaran,
        absensi: siswaList.map(s => ({
          siswaId: s.nis,
          status: s.status || 'H',
          keterangan: s.keterangan || ''
        }))
      });

      toast({
        title: 'Berhasil',
        description: 'Absensi berhasil disimpan',
        status: 'success',
        duration: 3000,
      });

      setTimeout(() => {
        navigate('/guru');
      }, 1500);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menyimpan absensi',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate statistics
  const stats = {
    total: siswaList.length,
    hadir: siswaList.filter(s => s.status === 'H').length,
    sakit: siswaList.filter(s => s.status === 'S').length,
    izin: siswaList.filter(s => s.status === 'I').length,
    alpha: siswaList.filter(s => s.status === 'A').length,
  };

  if (loading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="#F7FAFC">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text color="gray.600">Memuat data kelas...</Text>
        </VStack>
      </Flex>
    );
  }

  if (!kelas) {
    return (
      <Box minH="100vh" bg="#F7FAFC" p={8}>
        <Card maxW="600px" mx="auto" mt={20}>
          <CardBody textAlign="center" py={12}>
            <Text fontSize="5xl" mb={4}>❌</Text>
            <Heading size="lg" color="red.600" mb={2}>Kelas Tidak Ditemukan</Heading>
            <Text color="gray.600" mb={6}>Kelas yang Anda cari tidak tersedia</Text>
            <Button colorScheme="blue" onClick={() => navigate('/guru')}>
              Kembali ke Dashboard
            </Button>
          </CardBody>
        </Card>
      </Box>
    );
  }

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
        <Box maxW="1400px" mx="auto">
          <Flex justify="space-between" align="center" mb={4}>
            <Box>
              <Heading size="xl" fontWeight="bold" mb={2}>
                Absensi Kelas: {kelas.nama}
              </Heading>
              <Text fontSize="md" opacity={0.95}>
                Catat kehadiran siswa hari ini
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

          {/* Stats in Header */}
          <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4} mt={6}>
            <Box bg="whiteAlpha.200" p={4} borderRadius="lg" backdropFilter="blur(10px)">
              <Text fontSize="xs" opacity={0.9} mb={1}>Total Siswa</Text>
              <Text fontSize="2xl" fontWeight="bold">{stats.total}</Text>
            </Box>
            <Box bg="green.400" p={4} borderRadius="lg">
              <Text fontSize="xs" mb={1}>Hadir</Text>
              <Text fontSize="2xl" fontWeight="bold">{stats.hadir}</Text>
            </Box>
            <Box bg="yellow.400" p={4} borderRadius="lg" color="gray.800">
              <Text fontSize="xs" mb={1}>Sakit</Text>
              <Text fontSize="2xl" fontWeight="bold">{stats.sakit}</Text>
            </Box>
            <Box bg="blue.300" p={4} borderRadius="lg">
              <Text fontSize="xs" mb={1}>Izin</Text>
              <Text fontSize="2xl" fontWeight="bold">{stats.izin}</Text>
            </Box>
            <Box bg="red.400" p={4} borderRadius="lg">
              <Text fontSize="xs" mb={1}>Alpha</Text>
              <Text fontSize="2xl" fontWeight="bold">{stats.alpha}</Text>
            </Box>
          </SimpleGrid>
        </Box>
      </Box>

      {/* Content */}
      <Box maxW="1400px" mx="auto" px={8} py={8}>
        <VStack spacing={6} align="stretch">
          {/* Form Info */}
          <Card bg="white" boxShadow="lg" borderRadius="xl" border="1px solid" borderColor="blue.100">
            <CardHeader bg="linear-gradient(to right, #EBF8FF, #BEE3F8)" borderTopRadius="xl" py={5}>
              <HStack spacing={3}>
                <Box bg="blue.500" p={2} borderRadius="lg">
                  <Text fontSize="2xl">📋</Text>
                </Box>
                <Box>
                  <Heading size="md" color="blue.900">
                    Informasi Pembelajaran
                  </Heading>
                </Box>
              </HStack>
            </CardHeader>
            <CardBody p={6}>
              <HStack spacing={6} align="start">
                <FormControl isRequired flex={1}>
                  <FormLabel color="gray.700" fontWeight="semibold">Tanggal</FormLabel>
                  <Input
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    size="lg"
                    borderColor="gray.300"
                    focusBorderColor="blue.500"
                    bg="gray.50"
                  />
                </FormControl>

                <FormControl isRequired flex={1}>
                  <FormLabel color="gray.700" fontWeight="semibold">Mata Pelajaran</FormLabel>
                  <Input
                    placeholder="Contoh: Matematika"
                    value={formData.mapel}
                    onChange={(e) => setFormData({ ...formData, mapel: e.target.value })}
                    size="lg"
                    borderColor="gray.300"
                    focusBorderColor="blue.500"
                    bg="gray.50"
                  />
                </FormControl>

                <FormControl isRequired flex={1}>
                  <FormLabel color="gray.700" fontWeight="semibold">Jam Pelajaran</FormLabel>
                  <Select
                    placeholder="Pilih Jam"
                    value={formData.jamPelajaran}
                    onChange={(e) => setFormData({ ...formData, jamPelajaran: e.target.value })}
                    size="lg"
                    borderColor="gray.300"
                    focusBorderColor="blue.500"
                    bg="gray.50"
                  >
                    {jamPelajaranOptions.map((jam) => (
                      <option key={jam} value={jam}>{jam}</option>
                    ))}
                  </Select>
                </FormControl>
              </HStack>
            </CardBody>
          </Card>

          {/* Daftar Siswa */}
          <Card bg="white" boxShadow="lg" borderRadius="xl" border="1px solid" borderColor="blue.100">
            <CardHeader bg="linear-gradient(to right, #EBF8FF, #BEE3F8)" borderTopRadius="xl" py={5}>
              <HStack spacing={3}>
                <Box bg="blue.500" p={2} borderRadius="lg">
                  <Text fontSize="2xl">👥</Text>
                </Box>
                <Box>
                  <Heading size="md" color="blue.900">
                    Daftar Kehadiran Siswa
                  </Heading>
                  <Text fontSize="sm" color="blue.600" mt={1}>
                    Pilih status kehadiran untuk setiap siswa
                  </Text>
                </Box>
              </HStack>
            </CardHeader>
            <CardBody p={0}>
              {siswaList.length === 0 ? (
                <Flex direction="column" align="center" justify="center" py={12} color="gray.500">
                  <Text fontSize="5xl" mb={3}>📚</Text>
                  <Text fontSize="lg" fontWeight="semibold">Belum ada data siswa</Text>
                </Flex>
              ) : (
                <Box overflowX="auto">
                  <Table variant="simple">
                    <Thead bg="blue.50">
                      <Tr>
                        <Th color="blue.900" fontWeight="bold" w="60px">No</Th>
                        <Th color="blue.900" fontWeight="bold">Nama Siswa</Th>
                        <Th color="blue.900" fontWeight="bold" textAlign="center">Hadir</Th>
                        <Th color="blue.900" fontWeight="bold" textAlign="center">Sakit</Th>
                        <Th color="blue.900" fontWeight="bold" textAlign="center">Izin</Th>
                        <Th color="blue.900" fontWeight="bold" textAlign="center">Alpha</Th>
                        <Th color="blue.900" fontWeight="bold">Keterangan</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {siswaList.map((siswa, idx) => (
                        <Tr key={siswa.nis} _hover={{ bg: 'blue.50' }}>
                          <Td fontWeight="medium" color="gray.700">{idx + 1}</Td>
                          <Td fontWeight="semibold">{siswa.nama}</Td>
                          <Td textAlign="center">
                            <Radio
                              colorScheme="green"
                              size="lg"
                              isChecked={siswa.status === 'H'}
                              onChange={() => handleStatusChange(siswa.nis, 'H')}
                            />
                          </Td>
                          <Td textAlign="center">
                            <Radio
                              colorScheme="yellow"
                              size="lg"
                              isChecked={siswa.status === 'S'}
                              onChange={() => handleStatusChange(siswa.nis, 'S')}
                            />
                          </Td>
                          <Td textAlign="center">
                            <Radio
                              colorScheme="blue"
                              size="lg"
                              isChecked={siswa.status === 'I'}
                              onChange={() => handleStatusChange(siswa.nis, 'I')}
                            />
                          </Td>
                          <Td textAlign="center">
                            <Radio
                              colorScheme="red"
                              size="lg"
                              isChecked={siswa.status === 'A'}
                              onChange={() => handleStatusChange(siswa.nis, 'A')}
                            />
                          </Td>
                          <Td>
                            <Input
                              size="sm"
                              placeholder="Opsional"
                              value={siswa.keterangan || ''}
                              onChange={(e) => handleKeteranganChange(siswa.nis, e.target.value)}
                              borderColor="gray.300"
                              focusBorderColor="blue.500"
                            />
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </CardBody>
          </Card>

          {/* Submit Button */}
          <Button
            size="lg"
            h="60px"
            bg="linear-gradient(135deg, #48BB78 0%, #38A169 100%)"
            color="white"
            fontSize="lg"
            fontWeight="bold"
            onClick={handleSubmit}
            isLoading={submitting}
            loadingText="Menyimpan..."
            _hover={{
              bg: "linear-gradient(135deg, #38A169 0%, #2F855A 100%)",
              transform: "translateY(-2px)",
              boxShadow: "lg"
            }}
            leftIcon={<Text fontSize="xl">💾</Text>}
          >
            Simpan Absensi
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}