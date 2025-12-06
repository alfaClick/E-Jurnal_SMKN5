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
import { useAuth } from '../lib/auth'; 
import { adminAPI } from '../lib/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    nip: '',
    nama_lengkap: '',
    role: 'Guru',
    jurusan: '',
    kelas: [],
    mapel: [],
    password: '',
  });

  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  // ✅ DYNAMIC DATA FROM DATABASE
  const [kelasList, setKelasList] = useState([]);
  const [mapelList, setMapelList] = useState([]);
  const [jurusanList, setJurusanList] = useState([]);
  const [isLoadingMasterData, setIsLoadingMasterData] = useState(true);

  // ✅ Fetch Master Data (Kelas, Mapel, Jurusan) from Database
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        // Fetch semua data master dari backend
        const [kelasResponse, mapelResponse, jurusanResponse] = await Promise.all([
          fetch('http://localhost:5000/api/admin/kelas', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
          }).then(r => r.json()),
          fetch('http://localhost:5000/api/admin/mapel', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
          }).then(r => r.json()),
          fetch('http://localhost:5000/api/admin/jurusan', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
          }).then(r => r.json())
        ]);

        setKelasList(kelasResponse || []);
        setMapelList(mapelResponse || []);
        setJurusanList(jurusanResponse || []);
      } catch (error) {
        console.error('Failed to fetch master data:', error);
        toast({
          title: 'Error',
          description: 'Gagal memuat data kelas/mapel/jurusan',
          status: 'error',
          duration: 3000,
        });
      } finally {
        setIsLoadingMasterData(false);
      }
    };

    fetchMasterData();
  }, [toast]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await adminAPI.getUsers();
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
      const payload = {
        nip: formData.nip,
        nama_lengkap: formData.nama_lengkap,
        role: formData.role.toLowerCase(),
        id_jurusan: formData.jurusan ? parseInt(formData.jurusan) : null,
        password: formData.password,
        kelas: formData.kelas,
        mapel: formData.mapel,
      };

      console.log("Mengirim Payload:", payload);

      const response = await adminAPI.registerUser(payload);

      if (response) {
        toast({
          title: 'Berhasil',
          description: response.msg || `Akun ${formData.role} berhasil didaftarkan`,
          status: 'success',
          duration: 3000,
        });

        const usersResponse = await adminAPI.getUsers();
        setRegisteredUsers(usersResponse.users || []);

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
              {isLoadingMasterData ? (
                <Flex justify="center" align="center" py={12}>
                  <Spinner size="xl" color="blue.500" thickness="4px" mr={3} />
                  <Text color="gray.600">Memuat data...</Text>
                </Flex>
              ) : (
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

                  {/* Nama Lengkap */}
                  <FormControl isRequired>
                    <FormLabel color="gray.700" fontWeight="semibold">
                      Nama Lengkap
                    </FormLabel>
                    <Input
                      placeholder="Contoh: Budi Santoso"
                      value={formData.nama_lengkap}
                      onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                      size="lg"
                      borderColor="gray.300"
                      focusBorderColor="blue.500"
                      _hover={{ borderColor: 'blue.300' }}
                      bg="gray.50"
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
                          <option key={j.id_jurusan} value={j.id_jurusan}>
                            {j.nama_jurusan}
                          </option>
                        ))}
                      </Select>
                      <Text fontSize="xs" color="gray.500" mt={2}>
                        💡 Pilih jurusan jika guru mengajar mata pelajaran produktif
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
                            Kelas yang Diajar 
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
                                  <Checkbox 
                                    key={kelas.id_kelas} 
                                    value={kelas.id_kelas.toString()} 
                                    colorScheme="blue" 
                                    size="lg"
                                  >
                                    <Text fontSize="md">{kelas.nama_kelas}</Text>
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
                            Mata Pelajaran yang Diajar
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
                                  <Checkbox 
                                    key={mapel.id_mapel} 
                                    value={mapel.id_mapel.toString()} 
                                    colorScheme="green" 
                                    size="lg"
                                  >
                                    <Text fontSize="md">{mapel.nama_mapel}</Text>
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
                      bg="gray.50"
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
              )}
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