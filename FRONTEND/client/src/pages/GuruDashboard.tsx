import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Flex,
  SimpleGrid,
  Spinner,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Icon,
  Badge,
  useColorModeValue,
  Progress,
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { guruAPI } from "@/lib/api";

// --- Tipe Data ---
interface Kelas {
  id: string | number;
  nama: string;
}

interface GuruData {
  nama: string;
  role: string;
  jurusan?: string;
  mapel?: string[];
}

// --- Komponen Ikon SVG (Supaya tidak perlu install react-icons) ---
const IconBook = (props: any) => (
  <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </Icon>
);

const IconArrowRight = (props: any) => (
  <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </Icon>
);

export default function GuruDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [me, setMe] = useState<GuruData | null>(null);
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [loading, setLoading] = useState(true);

  // Warna UI Dinamis
  const bgPage = useColorModeValue("gray.50", "gray.900");
  const bgCard = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [guruData, kelasData] = await Promise.all([
          guruAPI.me(),
          guruAPI.getKelas(),
        ]);
        setMe(guruData);
        setKelas(kelasData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (loading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg={bgPage}>
        <Spinner size="xl" color="blue.500" thickness="3px" />
      </Flex>
    );
  }

  if (!me) return null;

  return (
    <Box minH="100vh" bg={bgPage}>
      {/* --- 1. MODERN HEADER (Sticky & Clean) --- */}
      <Box
        as="header"
        bg={bgCard}
        borderBottom="1px"
        borderColor={borderColor}
        position="sticky"
        top={0}
        zIndex={10}
        px={8}
        py={3}
        boxShadow="sm"
      >
        <Container maxW="7xl" px={0}>
          <Flex justify="space-between" align="center">
            {/* Logo / Brand */}
            <HStack spacing={3}>
              <Box bg="blue.600" p={2} borderRadius="md">
                <IconBook color="white" w={5} h={5} />
              </Box>
              <Text fontSize="lg" fontWeight="bold" color="gray.800" letterSpacing="tight">
                E-JURNAL GURU
              </Text>
            </HStack>

            {/* Profile Menu Dropdown */}
            <HStack spacing={4}>
              <VStack align="end" spacing={0} display={{ base: "none", md: "flex" }}>
                <Text fontSize="sm" fontWeight="semibold">{me.nama}</Text>
                <Text fontSize="xs" color="gray.500">{me.role}</Text>
              </VStack>
              <Menu>
                <MenuButton as={Button} rounded="full" variant="link" cursor="pointer" minW={0}>
                  <Avatar size="sm" name={me.nama} bg="blue.500" color="white" />
                </MenuButton>
                <MenuList fontSize="sm" zIndex={20}>
                  <MenuItem fontWeight="medium">Profil Saya</MenuItem>
                  <MenuDivider />
                  <MenuItem color="red.500" onClick={handleLogout}>Logout</MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* --- CONTENT AREA --- */}
      <Container maxW="7xl" py={10}>
        <VStack spacing={8} align="stretch">
          
          {/* --- 2. HERO SECTION (Sapaan Hangat) --- */}
          <Flex justify="space-between" align={{ base: "start", md: "center" }} direction={{ base: "column", md: "row" }} gap={4}>
            <Box>
              <Heading size="lg" fontWeight="extrabold" color="gray.800" mb={1}>
                Halo, {me.nama.split(',')[0]}! 👋
              </Heading>
              <Text color="gray.600">
                Siap mengajar hari ini? Pilih kelas untuk mengisi absensi dan jurnal.
              </Text>
            </Box>
            
            {/* --- 3. NAVIGATION PILLS (Gaya Kapsul Modern) --- */}
            <HStack bg="white" p={1.5} borderRadius="full" shadow="sm" border="1px solid" borderColor="gray.100">
              <Button
                size="sm"
                bg="blue.50"
                color="blue.600"
                borderRadius="full"
                px={6}
                _hover={{ bg: "blue.100" }}
              >
                Kelas Ajar
              </Button>
              <Button
                as={Link}
                to="/jurnal"
                size="sm"
                variant="ghost"
                color="gray.500"
                borderRadius="full"
                px={6}
                _hover={{ bg: "gray.50", color: "gray.800" }}
              >
                Jurnal
              </Button>
            </HStack>
          </Flex>

          {/* --- 4. GRID KARTU KELAS (Interactive Cards) --- */}
          {kelas.length === 0 ? (
            <Box textAlign="center" py={20} bg="white" borderRadius="xl" border="1px dashed" borderColor="gray.300">
              <Text fontSize="2xl">📭</Text>
              <Text fontWeight="medium" mt={2}>Belum ada jadwal kelas.</Text>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {kelas.map((k) => (
                <Box
                  key={k.id}
                  as={Link}
                  to={`/kelas/${k.id}`}
                  position="relative"
                  bg="white"
                  borderRadius="2xl"
                  border="1px solid"
                  borderColor={borderColor}
                  overflow="hidden"
                  transition="all 0.3s cubic-bezier(.25,.8,.25,1)"
                  _hover={{
                    transform: "translateY(-4px)",
                    boxShadow: "xl",
                    borderColor: "blue.200",
                  }}
                  group
                >
                  {/* Bagian Atas Kartu dengan Aksen Warna */}
                  <Box h="6px" w="full" bgGradient="linear(to-r, blue.400, purple.400)" />
                  
                  <Box p={6}>
                    <Flex justify="space-between" align="start" mb={4}>
                      <Box 
                        p={3} 
                        bg="blue.50" 
                        color="blue.600" 
                        borderRadius="xl"
                      >
                         <IconBook w={6} h={6} />
                      </Box>
                      <Badge colorScheme="green" variant="subtle" borderRadius="full" px={3} py={1}>
                        Aktif
                      </Badge>
                    </Flex>

                    <Heading size="md" fontWeight="bold" color="gray.800" mb={1}>
                      {k.nama}
                    </Heading>
                    <Text fontSize="sm" color="gray.500" mb={6}>
                      {me.mapel ? me.mapel[0] : "Mata Pelajaran Umum"}
                    </Text>

                    {/* Footer Kartu: Info Siswa & Panah */}
                    <Flex align="center" justify="space-between" pt={4} borderTop="1px solid" borderColor="gray.50">
                      <HStack spacing={1}>
                         <Text fontSize="xs" fontWeight="bold" color="gray.700">32</Text>
                         <Text fontSize="xs" color="gray.500">Siswa</Text>
                      </HStack>

                      <HStack 
                        color="blue.500" 
                        fontSize="sm" 
                        fontWeight="semibold"
                        className="group-hover:translate-x-1" // Logic placeholder for hover animation idea
                      >
                        <Text>Buka</Text>
                        <IconArrowRight w={4} h={4} />
                      </HStack>
                    </Flex>
                  </Box>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </VStack>
      </Container>
    </Box>
  );
}