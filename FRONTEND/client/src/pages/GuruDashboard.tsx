import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  Text,
  VStack,
  HStack,
  Flex,
  SimpleGrid,
  Spinner,
  Divider,
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { guruAPI } from "@/lib/api";

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

export default function GuruDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [me, setMe] = useState<GuruData | null>(null);
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [guruData, kelasData] = await Promise.all([
          guruAPI.me(),
          guruAPI.getKelas()
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
      <Flex minH="100vh" align="center" justify="center" bg="#F7FAFC">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text color="gray.600">Memuat data...</Text>
        </VStack>
      </Flex>
    );
  }

  if (!me) return null;

  return (
    <Box minH="100vh" bg="#F7FAFC">
      {/* Header - Blue Gradient */}
      <Box 
        bg="linear-gradient(135deg, #4299E1 0%, #3182CE 100%)" 
        color="white" 
        px={8} 
        py={8}
        boxShadow="sm"
      >
        <Box maxW="1400px" mx="auto">
          <Flex justify="space-between" align="center" mb={6}>
            <Box>
              <Heading size="xl" fontWeight="bold" mb={2}>
                Dashboard Guru
              </Heading>
              <Text fontSize="md" opacity={0.95}>
                Kelola jurnal harian dan absensi siswa
              </Text>
            </Box>
            <Button
              colorScheme="whiteAlpha"
              variant="solid"
              onClick={handleLogout}
              px={6}
            >
              Logout
            </Button>
          </Flex>

          <Divider borderColor="whiteAlpha.300" my={4} />

          {/* Profile Info in Header */}
          <HStack spacing={2} fontSize="md">
            <Text fontWeight="bold">{me.nama}</Text>
            <Text opacity={0.9}>|</Text>
            <Text opacity={0.9}>{me.mapel?.join(", ") || "-"}</Text>
          </HStack>
        </Box>
      </Box>

      {/* Content */}
      <Box maxW="1400px" mx="auto" px={8} py={8}>
        {/* Tab-like Section */}
        <HStack 
          spacing={0} 
          mb={6}
          borderRadius="lg"
          overflow="hidden"
          boxShadow="sm"
        >
          <Button
            flex={1}
            bg="blue.500"
            color="white"
            borderRadius="none"
            _hover={{ bg: "blue.600" }}
            h="60px"
            fontSize="lg"
            fontWeight="bold"
          >
            Pilih Kelas
          </Button>
          <Button
            as={Link}
            to="/jurnal"
            flex={1}
            bg="white"
            color="gray.700"
            borderRadius="none"
            _hover={{ bg: "gray.50" }}
            h="60px"
            fontSize="lg"
            fontWeight="semibold"
          >
            Riwayat Jurnal
          </Button>
        </HStack>

        {/* Classes Section */}
        <Box mb={6}>
          <Heading size="md" color="gray.700" mb={4}>
            Kelas yang Diampu
          </Heading>

          {kelas.length === 0 ? (
            <Card bg="white" p={12} borderRadius="xl" boxShadow="sm">
              <VStack spacing={3} color="gray.500">
                <Text fontSize="5xl">📚</Text>
                <Text fontSize="lg" fontWeight="semibold">Belum ada kelas</Text>
                <Text fontSize="sm">Hubungi admin untuk menambahkan kelas</Text>
              </VStack>
            </Card>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {kelas.map((k) => (
                <Card
                  key={k.id}
                  as={Link}
                  to={`/kelas/${k.id}`}
                  bg="white"
                  p={8}
                  borderRadius="xl"
                  boxShadow="sm"
                  border="1px solid"
                  borderColor="gray.200"
                  transition="all 0.2s"
                  _hover={{
                    transform: "translateY(-4px)",
                    boxShadow: "md",
                    borderColor: "blue.300",
                    textDecoration: "none"
                  }}
                  cursor="pointer"
                >
                  <VStack spacing={3} align="center">
                    <Heading size="lg" color="blue.600" fontWeight="bold" textAlign="center">
                      {k.nama}
                    </Heading>
                    <Text fontSize="sm" color="gray.600">
                      32 Siswa
                    </Text>
                  </VStack>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </Box>
      </Box>
    </Box>
  );
}