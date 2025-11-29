import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Input,
  FormControl,
  FormLabel,
  Select,
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  CardHeader,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Checkbox,
  CheckboxGroup,
  Stack,
  useToast,
  Spinner,
  Flex,
  Divider,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
// Pastikan path import ini sesuai dengan struktur folder Anda
import { useAuth } from '../lib/auth'; 
import { adminAPI } from '../lib/api';

// MAPPING SEMENTARA: Ubah ini sesuai ID Jurusan di Database Anda
// Anda bisa cek ID nya lewat API GET /admin/jurusan
const JURUSAN_MAP = {
  'RPL': 1,
  'TKJ': 2,
  'MM': 3,
  'Guru Umum': null
};

const kelasList = ['10 RPL 1', '10 RPL 2', '10 RPL 3', '10 TKJ 1', '10 TKJ 2', '11 RPL 1', '11 RPL 2', '11 TKJ 1', '12 RPL 1', '12 RPL 2', '12 TKJ 1'];
const mapelList = ['Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'Algoritma', 'Dasar Pemrograman', 'Basis Data', 'Web Programming', 'Jaringan Komputer'];
const jurusanList = ['RPL', 'TKJ', 'MM', 'Guru Umum'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    nip: '',
    nama_lengkap: '', // PERBAIKAN 1: Gunakan nama key yang konsisten
    role: 'Guru',
    jurusan: '',
    kelas: [],
    mapel: [],
    password: '',
  });

  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await adminAPI.getUsers();
        // Pastikan response.users ada, jika tidak fallback ke array kosong
        setRegisteredUsers(response.users || []);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        toast({
          title: 'Error',
          description: 'Gagal memuat daftar pengguna',
          status: 'error',
          duration: 3000,
        });
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [toast]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleRegister = async () => {
    // PERBAIKAN 2: Validasi menggunakan nama_lengkap
    if (!formData.nip || !formData.nama_lengkap || !formData.password) {
      toast({
        title: 'Error',
        description: 'NIP, Nama, dan Password wajib diisi',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (formData.role === 'Guru' && (formData.kelas.length === 0 || formData.mapel.length === 0)) {
      toast({
        title: 'Error',
        description: 'Untuk Guru, minimal 1 Kelas dan 1 Mapel wajib dipilih',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // PERBAIKAN 3: Sesuaikan Payload dengan Controller Backend
      // Backend: { nip, nama_lengkap, password, role, id_jurusan }
      const payload = {
        nip: formData.nip,
        nama_lengkap: formData.nama_lengkap, // KUNCI UTAMA PERBAIKAN ERROR 400
        role: formData.role.toLowerCase(), // Backend mungkin expect lowercase ('guru'/'kepsek')
        // Konversi string jurusan ke ID Integer
        id_jurusan: JURUSAN_MAP[formData.jurusan] || null, 
        password: formData.password,
        // Note: kelas & mapel belum disimpan di registerGuru backend,
        // tapi kita kirim saja jika nanti backend diupdate.
        kelas: formData.kelas,
        mapel: formData.mapel,
      };

      console.log("Mengirim Payload:", payload); // Debugging

      const response = await adminAPI.registerUser(payload);

      // Cek response dari backend (biasanya backend kirim status 201)
      if (response) {
        toast({
          title: 'Berhasil',
          description: response.msg || `Akun ${formData.role} berhasil didaftarkan`,
          status: 'success',
          duration: 3000,
        });

        // Refresh user list
        const usersResponse = await adminAPI.getUsers();
        setRegisteredUsers(usersResponse.users || []);

        // Reset Form
        setFormData({
          nip: '',
          nama_lengkap: '',
          role: 'Guru',
          jurusan: '',
          kelas: [],
          mapel: [],
          password: '',
        });
      }
    } catch (error) {
      console.error("Register Error:", error);
      toast({
        title: 'Error',
        description: error.response?.data?.msg || error.message || 'Gagal mendaftarkan pengguna',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      nip: '',
      nama_lengkap: '',
      role: 'Guru',
      jurusan: '',
      kelas: [],
      mapel: [],
      password: '',
    });
  };

  return (
    <Box minH="100vh" bg="#F7FAFC">
      {/* Header */}
      <Box bg="linear-gradient(135deg, #4299E1 0%, #3182CE 100%)" color="white" px={8} py={8} boxShadow="sm">
        <Flex justify="space-between" align="center" maxW="1400px" mx="auto">
          <Box>
            <Heading size="xl" fontWeight="bold" mb={2}>
              Dashboard Admin
            </Heading>
            <Text fontSize="md" opacity={0.95}>
              Kelola akun guru dan kepala sekolah
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
      </Box>

      <Box maxW="1400px" mx="auto" p={8}>
        <VStack spacing={8} align="stretch">
          {/* Registration Form */}
          <Card bg="white" boxShadow="lg" borderRadius="2xl" border="1px solid" borderColor="blue.100">
            <CardHeader bg="linear-gradient(to right, #EBF8FF, #BEE3F8)" borderTopRadius="2xl" py={6}>
              <HStack spacing={3}>
                <Box bg="blue.500" p={3} borderRadius="xl">
                  <Text fontSize="2xl">👤</Text>
                </Box>
                <Box>
                  <Heading size="md" color="blue.900">
                    Formulir Pendaftaran Guru/Kepala Sekolah
                  </Heading>
                  <Text fontSize="sm" color="blue.600" mt={1}>
                    Isi semua informasi dengan lengkap
                  </Text>
                </Box>
              </HStack>
            </CardHeader>

            <CardBody p={8}>
              <VStack spacing={6} align="stretch">
                {/* NIP */}
                <FormControl isRequired>
                  <FormLabel color="gray.700" fontWeight="semibold">
                    NIP (Nomor Induk Pegawai)
                  </FormLabel>
                  <Input
                    placeholder="Contoh: 198227272"
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    size="lg"
                    borderColor="gray.300"
                    focusBorderColor="blue.500"
                    _hover={{ borderColor: 'blue.300' }}
                    bg="gray.50"
                  />
                </FormControl>

                {/* Nama Lengkap - PERBAIKAN 4: Ubah value dan onChange ke nama_lengkap */}
                <FormControl isRequired>
                  <FormLabel color="gray.700" fontWeight="semibold">
                    Nama Lengkap
                  </FormLabel>
                  <Input
                    placeholder="GURU001"
                    value={formData.nama_lengkap}
                    onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                    size="lg"
                    borderColor="gray.300"
                    focusBorderColor="blue.500"
                    _hover={{ borderColor: 'blue.300' }}
                    bg="yellow.50"
                  />
                </FormControl>

                {/* Role */}
                <FormControl isRequired>
                  <FormLabel color="gray.700" fontWeight="semibold">
                    Role
                  </FormLabel>
                  <Select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    size="lg"
                    borderColor="gray.300"
                    focusBorderColor="blue.500"
                    _hover={{ borderColor: 'blue.300' }}
                    bg="gray.50"
                  >
                    <option value="Guru">Guru</option>
                    <option value="Kepsek">Kepala Sekolah</option>
                  </Select>
                </FormControl>

                {/* Jurusan - Only for Guru */}
                {formData.role === 'Guru' && (
                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="semibold">
                      Jurusan (Opsional)
                    </FormLabel>
                    <Select
                      placeholder="Pilih Jurusan"
                      value={formData.jurusan}
                      onChange={(e) => setFormData({ ...formData, jurusan: e.target.value })}
                      size="lg"
                      borderColor="gray.300"
                      focusBorderColor="blue.500"
                      _hover={{ borderColor: 'blue.300' }}
                      bg="gray.50"
                    >
                      {jurusanList.map((j) => (
                        <option key={j} value={j}>{j}</option>
                      ))}
                    </Select>
                    <Text fontSize="xs" color="gray.500" mt={2}>
                      💡 Pilih "Guru Umum" jika mengajar mata pelajaran umum (non-produktif)
                    </Text>
                  </FormControl>
                )}

                {/* Kelas & Mapel - Only for Guru */}
                {formData.role === 'Guru' && (
                  <Box p={6} bg="blue.50" borderRadius="xl" border="2px solid" borderColor="blue.200">
                    <VStack spacing={6} align="stretch">
                      {/* Kelas yang Diampu */}
                      <FormControl isRequired>
                        <FormLabel color="blue.900" fontWeight="bold" fontSize="md">
                          Kelas yang Diampu <Badge colorScheme="blue" ml={2}>Pilih lebih dari 1</Badge>
                        </FormLabel>
                        <CheckboxGroup
                          value={formData.kelas}
                          onChange={(values) => setFormData({ ...formData, kelas: values })}
                        >
                          <Box 
                            maxH="200px" 
                            overflowY="auto" 
                            p={4} 
                            bg="white" 
                            borderRadius="lg"
                            border="1px solid"
                            borderColor="blue.200"
                          >
                            <Stack spacing={3}>
                              {kelasList.map((kelas) => (
                                <Checkbox key={kelas} value={kelas} colorScheme="blue" size="lg">
                                  <Text fontSize="md">{kelas}</Text>
                                </Checkbox>
                              ))}
                            </Stack>
                          </Box>
                        </CheckboxGroup>
                      </FormControl>

                      <Divider borderColor="blue.300" />

                      {/* Mata Pelajaran yang Diajar */}
                      <FormControl isRequired>
                        <FormLabel color="blue.900" fontWeight="bold" fontSize="md">
                          Mata Pelajaran yang Diajar <Badge colorScheme="green" ml={2}>Pilih lebih dari 1</Badge>
                        </FormLabel>
                        <CheckboxGroup
                          value={formData.mapel}
                          onChange={(values) => setFormData({ ...formData, mapel: values })}
                        >
                          <Box 
                            maxH="200px" 
                            overflowY="auto" 
                            p={4} 
                            bg="white" 
                            borderRadius="lg"
                            border="1px solid"
                            borderColor="blue.200"
                          >
                            <Stack spacing={3}>
                              {mapelList.map((mapel) => (
                                <Checkbox key={mapel} value={mapel} colorScheme="green" size="lg">
                                  <Text fontSize="md">{mapel}</Text>
                                </Checkbox>
                              ))}
                            </Stack>
                          </Box>
                        </CheckboxGroup>
                      </FormControl>
                    </VStack>
                  </Box>
                )}

                {/* Password Baru */}
                <FormControl isRequired>
                  <FormLabel color="gray.700" fontWeight="semibold">
                    Password Baru
                  </FormLabel>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    size="lg"
                    borderColor="gray.300"
                    focusBorderColor="blue.500"
                    _hover={{ borderColor: 'blue.300' }}
                    bg="yellow.50"
                  />
                </FormControl>

                {/* Buttons */}
                <HStack spacing={4} pt={4}>
                  <Button
                    flex={1}
                    size="lg"
                    h="60px"
                    bg="linear-gradient(135deg, #48BB78 0%, #38A169 100%)"
                    color="white"
                    fontSize="lg"
                    fontWeight="bold"
                    onClick={handleRegister}
                    isLoading={isSubmitting}
                    loadingText="Mendaftar..."
                    _hover={{
                      bg: "linear-gradient(135deg, #38A169 0%, #2F855A 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "lg"
                    }}
                  >
                    Daftar Akun
                  </Button>

                  <Button
                    flex={1}
                    size="lg"
                    h="60px"
                    bg="gray.500"
                    color="white"
                    fontSize="lg"
                    fontWeight="bold"
                    onClick={handleResetForm}
                    _hover={{
                      bg: "gray.600",
                      transform: "translateY(-2px)",
                      boxShadow: "lg"
                    }}
                  >
                    Bersihkan Form
                  </Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Registered Users Table */}
          <Card bg="white" boxShadow="lg" borderRadius="2xl" border="1px solid" borderColor="blue.100">
            <CardHeader bg="linear-gradient(to right, #EBF8FF, #BEE3F8)" borderTopRadius="2xl" py={6}>
              <HStack spacing={3}>
                <Box bg="blue.500" p={3} borderRadius="xl">
                  <Text fontSize="2xl">👥</Text>
                </Box>
                <Box>
                  <Heading size="md" color="blue.900">
                    Akun yang Terdaftar
                  </Heading>
                  <Text fontSize="sm" color="blue.600" mt={1}>
                    Total {registeredUsers.length} pengguna
                  </Text>
                </Box>
              </HStack>
            </CardHeader>

            <CardBody p={0}>
              {isLoadingUsers ? (
                <Flex justify="center" align="center" py={12}>
                  <Spinner size="xl" color="blue.500" thickness="4px" mr={3} />
                  <Text color="gray.600">Memuat data...</Text>
                </Flex>
              ) : (
                <Box overflowX="auto">
                  <Table variant="simple">
                    <Thead bg="blue.50">
                      <Tr>
                        <Th color="blue.900" fontWeight="bold">NIP</Th>
                        <Th color="blue.900" fontWeight="bold">Nama</Th>
                        <Th color="blue.900" fontWeight="bold">Role</Th>
                        <Th color="blue.900" fontWeight="bold">Jurusan</Th>
                        <Th color="blue.900" fontWeight="bold">Kelas</Th>
                        <Th color="blue.900" fontWeight="bold">Mapel</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {registeredUsers.map((user, idx) => (
                        <Tr key={idx} _hover={{ bg: 'blue.50' }}>
                          <Td fontWeight="medium" color="blue.900">{user.nip}</Td>
                          {/* Backend mengirim 'nama', tapi kadang 'nama_lengkap' di getUsers. Sesuaikan dengan data API getUsers */}
                          <Td>{user.nama || user.nama_lengkap}</Td>
                          <Td>
                            <Badge
                              colorScheme={user.role && user.role.toLowerCase() === 'guru' ? 'blue' : 'gray'}
                              px={3}
                              py={1}
                              borderRadius="md"
                            >
                              {user.role}
                            </Badge>
                          </Td>
                          <Td>{user.jurusan || '-'}</Td>
                          <Td>
                            {/* Tampilkan list kelas jika ada */}
                            {user.kelas && user.kelas.length > 0 ? (
                              <Wrap spacing={1}>
                                {user.kelas.map((k, i) => (
                                  <WrapItem key={i}>
                                    <Badge variant="outline" colorScheme="blue" fontSize="xs">{k}</Badge>
                                  </WrapItem>
                                ))}
                              </Wrap>
                            ) : '-'}
                          </Td>
                          <Td>
                             {/* Tampilkan list mapel jika ada */}
                             {user.mapel && user.mapel.length > 0 ? (
                              <Wrap spacing={1}>
                                {user.mapel.map((m, i) => (
                                  <WrapItem key={i}>
                                    <Badge variant="outline" colorScheme="green" fontSize="xs">{m}</Badge>
                                  </WrapItem>
                                ))}
                              </Wrap>
                            ) : '-'}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </CardBody>
          </Card>
        </VStack>
      </Box>
    </Box>
  );
}