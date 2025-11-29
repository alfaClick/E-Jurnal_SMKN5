import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  VStack,
  HStack,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  SimpleGrid,
  Spinner,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Progress,
  Select,
  Input,
  useToast,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { kepsekAPI } from "@/lib/api";

interface AbsensiData {
  id: number;
  tanggal: string;
  kelas: string;
  mapel: string;
  guru: string;
  hadir: number;
  sakit: number;
  izin: number;
  alpha: number;
}

interface JurnalData {
  id: number;
  tanggal: string;
  kelas: string;
  mapel: string;
  guru: string;
  jamPelajaran: string;
  materi: string;
}

interface StatistikData {
  totalSiswa: number;
  totalGuru: number;
  totalKelas: number;
  persentaseKehadiran: number;
}

export default function KepsekDashboard() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  
  const [statistik, setStatistik] = useState<StatistikData>({
    totalSiswa: 0,
    totalGuru: 0,
    totalKelas: 0,
    persentaseKehadiran: 0,
  });

  const [absensiList, setAbsensiList] = useState<AbsensiData[]>([]);
  const [jurnalList, setJurnalList] = useState<JurnalData[]>([]);

  // Filter states
  const [filterTanggal, setFilterTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [filterKelas, setFilterKelas] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch statistik
        const stats = await kepsekAPI.getStatistik();
        setStatistik(stats);

        // Fetch absensi
        const absensiData = await kepsekAPI.getAllAbsensi();
        setAbsensiList(absensiData);

        // Fetch jurnal
        const jurnalData = await kepsekAPI.getAllJurnal();
        setJurnalList(jurnalData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast({
          title: 'Error',
          description: 'Gagal memuat data',
          status: 'error',
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Filter data
  const filteredAbsensi = absensiList.filter(item => {
    const matchTanggal = filterTanggal ? item.tanggal === filterTanggal : true;
    const matchKelas = filterKelas ? item.kelas === filterKelas : true;
    return matchTanggal && matchKelas;
  });

  const filteredJurnal = jurnalList.filter(item => {
    const matchTanggal = filterTanggal ? item.tanggal === filterTanggal : true;
    const matchKelas = filterKelas ? item.kelas === filterKelas : true;
    return matchTanggal && matchKelas;
  });

  // Get unique classes for filter
  const uniqueKelas = Array.from(new Set(absensiList.map(item => item.kelas)));

  if (loading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="#F7FAFC">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text color="gray.600">Memuat data...</Text>
        </VStack>
      </Flex>
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
        <Box maxW="1600px" mx="auto">
          <Flex justify="space-between" align="center" mb={6}>
            <Box>
              <Heading size="xl" fontWeight="bold" mb={2}>
                Dashboard Kepala Sekolah
              </Heading>
              <Text fontSize="md" opacity={0.95}>
                Monitoring kegiatan belajar mengajar
              </Text>
            </Box>
            <HStack spacing={4}>
              <Box textAlign="right">
                <Text fontSize="xs" opacity={0.8}>Logged in as</Text>
                <Text fontWeight="semibold">{currentUser?.nama}</Text>
              </Box>
              <Button
                colorScheme="whiteAlpha"
                variant="solid"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </HStack>
          </Flex>

          {/* Statistics Cards */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <Box bg="whiteAlpha.200" p={6} borderRadius="xl" backdropFilter="blur(10px)">
              <HStack spacing={3} mb={2}>
                <Text fontSize="3xl">👨‍🎓</Text>
                <Box>
                  <Text fontSize="xs" opacity={0.9}>Total Siswa</Text>
                  <Text fontSize="3xl" fontWeight="bold">{statistik.totalSiswa}</Text>
                </Box>
              </HStack>
            </Box>

            <Box bg="whiteAlpha.200" p={6} borderRadius="xl" backdropFilter="blur(10px)">
              <HStack spacing={3} mb={2}>
                <Text fontSize="3xl">👨‍🏫</Text>
                <Box>
                  <Text fontSize="xs" opacity={0.9}>Total Guru</Text>
                  <Text fontSize="3xl" fontWeight="bold">{statistik.totalGuru}</Text>
                </Box>
              </HStack>
            </Box>

            <Box bg="whiteAlpha.200" p={6} borderRadius="xl" backdropFilter="blur(10px)">
              <HStack spacing={3} mb={2}>
                <Text fontSize="3xl">🏫</Text>
                <Box>
                  <Text fontSize="xs" opacity={0.9}>Total Kelas</Text>
                  <Text fontSize="3xl" fontWeight="bold">{statistik.totalKelas}</Text>
                </Box>
              </HStack>
            </Box>

            <Box bg="green.400" p={6} borderRadius="xl">
              <HStack spacing={3} mb={2}>
                <Text fontSize="3xl">📊</Text>
                <Box>
                  <Text fontSize="xs">Tingkat Kehadiran</Text>
                  <Text fontSize="3xl" fontWeight="bold">{statistik.persentaseKehadiran}%</Text>
                </Box>
              </HStack>
              <Progress 
                value={statistik.persentaseKehadiran} 
                size="sm" 
                colorScheme="whiteAlpha" 
                borderRadius="full"
                bg="whiteAlpha.300"
              />
            </Box>
          </SimpleGrid>
        </Box>
      </Box>

      {/* Content */}
      <Box maxW="1600px" mx="auto" px={8} py={8}>
        <VStack spacing={6} align="stretch">
          {/* Filter Section */}
          <Card bg="white" boxShadow="lg" borderRadius="xl" border="1px solid" borderColor="blue.100">
            <CardBody p={6}>
              <HStack spacing={4}>
                <Box flex={1}>
                  <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                    Filter Tanggal
                  </Text>
                  <Input
                    type="date"
                    value={filterTanggal}
                    onChange={(e) => setFilterTanggal(e.target.value)}
                    size="lg"
                    borderColor="gray.300"
                    focusBorderColor="blue.500"
                  />
                </Box>
                <Box flex={1}>
                  <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                    Filter Kelas
                  </Text>
                  <Select
                    placeholder="Semua Kelas"
                    value={filterKelas}
                    onChange={(e) => setFilterKelas(e.target.value)}
                    size="lg"
                    borderColor="gray.300"
                    focusBorderColor="blue.500"
                  >
                    {uniqueKelas.map((kelas) => (
                      <option key={kelas} value={kelas}>{kelas}</option>
                    ))}
                  </Select>
                </Box>
                <Box pt={7}>
                  <Button
                    colorScheme="gray"
                    size="lg"
                    onClick={() => {
                      setFilterTanggal(new Date().toISOString().split('T')[0]);
                      setFilterKelas('');
                    }}
                  >
                    Reset Filter
                  </Button>
                </Box>
              </HStack>
            </CardBody>
          </Card>

          {/* Tabs for Absensi & Jurnal */}
          <Card bg="white" boxShadow="lg" borderRadius="xl" border="1px solid" borderColor="blue.100">
            <Tabs colorScheme="blue" variant="enclosed">
              <TabList bg="linear-gradient(to right, #EBF8FF, #BEE3F8)" borderTopRadius="xl">
                <Tab 
                  fontWeight="bold" 
                  fontSize="lg"
                  _selected={{ 
                    bg: 'white', 
                    borderColor: 'blue.200',
                    borderBottomColor: 'white'
                  }}
                >
                  <HStack spacing={2}>
                    <Text fontSize="xl">📋</Text>
                    <Text>Rekap Absensi ({filteredAbsensi.length})</Text>
                  </HStack>
                </Tab>
                <Tab 
                  fontWeight="bold"
                  fontSize="lg"
                  _selected={{ 
                    bg: 'white', 
                    borderColor: 'blue.200',
                    borderBottomColor: 'white'
                  }}
                >
                  <HStack spacing={2}>
                    <Text fontSize="xl">📝</Text>
                    <Text>Jurnal Agenda Harian ({filteredJurnal.length})</Text>
                  </HStack>
                </Tab>
              </TabList>

              <TabPanels>
                {/* Tab Absensi */}
                <TabPanel p={0}>
                  {filteredAbsensi.length === 0 ? (
                    <Flex direction="column" align="center" justify="center" py={12} color="gray.500">
                      <Text fontSize="5xl" mb={3}>📊</Text>
                      <Text fontSize="lg" fontWeight="semibold">Tidak ada data absensi</Text>
                      <Text fontSize="sm" mt={1}>Coba ubah filter tanggal atau kelas</Text>
                    </Flex>
                  ) : (
                    <Box overflowX="auto">
                      <Table variant="simple">
                        <Thead bg="blue.50">
                          <Tr>
                            <Th color="blue.900" fontWeight="bold">No</Th>
                            <Th color="blue.900" fontWeight="bold">Tanggal</Th>
                            <Th color="blue.900" fontWeight="bold">Kelas</Th>
                            <Th color="blue.900" fontWeight="bold">Mata Pelajaran</Th>
                            <Th color="blue.900" fontWeight="bold">Guru</Th>
                            <Th color="blue.900" fontWeight="bold" textAlign="center">Hadir</Th>
                            <Th color="blue.900" fontWeight="bold" textAlign="center">Sakit</Th>
                            <Th color="blue.900" fontWeight="bold" textAlign="center">Izin</Th>
                            <Th color="blue.900" fontWeight="bold" textAlign="center">Alpha</Th>
                            <Th color="blue.900" fontWeight="bold" textAlign="center">Total</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {filteredAbsensi.map((item, idx) => {
                            const total = item.hadir + item.sakit + item.izin + item.alpha;
                            const persenKehadiran = total > 0 ? ((item.hadir / total) * 100).toFixed(1) : '0';
                            
                            return (
                              <Tr key={item.id} _hover={{ bg: 'blue.50' }}>
                                <Td fontWeight="medium">{idx + 1}</Td>
                                <Td>{new Date(item.tanggal).toLocaleDateString('id-ID')}</Td>
                                <Td>
                                  <Badge colorScheme="blue" px={3} py={1} borderRadius="md">
                                    {item.kelas}
                                  </Badge>
                                </Td>
                                <Td fontWeight="semibold">{item.mapel}</Td>
                                <Td>{item.guru}</Td>
                                <Td textAlign="center">
                                  <Badge colorScheme="green" fontSize="md" px={2} py={1}>
                                    {item.hadir}
                                  </Badge>
                                </Td>
                                <Td textAlign="center">
                                  <Badge colorScheme="yellow" fontSize="md" px={2} py={1}>
                                    {item.sakit}
                                  </Badge>
                                </Td>
                                <Td textAlign="center">
                                  <Badge colorScheme="blue" fontSize="md" px={2} py={1}>
                                    {item.izin}
                                  </Badge>
                                </Td>
                                <Td textAlign="center">
                                  <Badge colorScheme="red" fontSize="md" px={2} py={1}>
                                    {item.alpha}
                                  </Badge>
                                </Td>
                                <Td textAlign="center">
                                  <VStack spacing={1}>
                                    <Text fontWeight="bold">{total}</Text>
                                    <Badge colorScheme={parseFloat(persenKehadiran) >= 80 ? 'green' : 'orange'} fontSize="xs">
                                      {persenKehadiran}%
                                    </Badge>
                                  </VStack>
                                </Td>
                              </Tr>
                            );
                          })}
                        </Tbody>
                      </Table>
                    </Box>
                  )}
                </TabPanel>

                {/* Tab Jurnal */}
                <TabPanel p={0}>
                  {filteredJurnal.length === 0 ? (
                    <Flex direction="column" align="center" justify="center" py={12} color="gray.500">
                      <Text fontSize="5xl" mb={3}>📝</Text>
                      <Text fontSize="lg" fontWeight="semibold">Tidak ada jurnal</Text>
                      <Text fontSize="sm" mt={1}>Coba ubah filter tanggal atau kelas</Text>
                    </Flex>
                  ) : (
                    <VStack spacing={4} p={6} align="stretch">
                      {filteredJurnal.map((item, idx) => (
                        <Card 
                          key={item.id} 
                          bg="gray.50" 
                          border="1px solid" 
                          borderColor="blue.200"
                          _hover={{ borderColor: 'blue.400', bg: 'blue.50' }}
                          transition="all 0.2s"
                        >
                          <CardBody p={6}>
                            <Flex justify="space-between" align="start" mb={4}>
                              <HStack spacing={3}>
                                <Box bg="blue.500" color="white" w="40px" h="40px" borderRadius="lg" display="flex" alignItems="center" justifyContent="center" fontWeight="bold">
                                  {idx + 1}
                                </Box>
                                <Box>
                                  <HStack spacing={2} mb={1}>
                                    <Badge colorScheme="blue" px={3} py={1} fontSize="sm">
                                      {item.kelas}
                                    </Badge>
                                    <Badge colorScheme="purple" px={3} py={1} fontSize="sm">
                                      {item.mapel}
                                    </Badge>
                                    <Badge colorScheme="orange" px={3} py={1} fontSize="sm">
                                      {item.jamPelajaran}
                                    </Badge>
                                  </HStack>
                                  <Text fontSize="sm" color="gray.600">
                                    {new Date(item.tanggal).toLocaleDateString('id-ID', { 
                                      weekday: 'long', 
                                      year: 'numeric', 
                                      month: 'long', 
                                      day: 'numeric' 
                                    })}
                                  </Text>
                                </Box>
                              </HStack>
                              <Badge colorScheme="gray" px={3} py={1} fontSize="sm">
                                👨‍🏫 {item.guru}
                              </Badge>
                            </Flex>
                            
                            <Box 
                              bg="white" 
                              p={4} 
                              borderRadius="lg" 
                              border="1px solid" 
                              borderColor="gray.200"
                            >
                              <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>
                                Materi yang Diajarkan:
                              </Text>
                              <Text fontSize="sm" color="gray.700" lineHeight="tall">
                                {item.materi}
                              </Text>
                            </Box>
                          </CardBody>
                        </Card>
                      ))}
                    </VStack>
                  )}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Card>
        </VStack>
      </Box>
    </Box>
  );
}