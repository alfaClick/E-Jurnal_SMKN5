import { useState } from "react";
import {
  Box,
  Button,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

/**
 * Konfigurasi URL Backend
 */
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5500/api";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState(""); // Bisa NIP atau Username
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const toast = useToast();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // 1. Validasi Input
    if (!identifier || !password) {
      toast({
        title: "Error",
        description: "NIP/Username dan Password wajib diisi",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);

    try {
      // ✅ AUTO DETECT: Admin atau Guru/Kepsek
      const isAdmin = identifier.toLowerCase().includes("admin") || identifier.length < 8;
      const loginEndpoint = isAdmin ? "/auth/login-admin" : "/auth/login";
      const LOGIN_URL = `${API_BASE.replace(/\/$/, "")}${loginEndpoint}`;

      // ✅ Dynamic body berdasarkan endpoint
      const requestBody = isAdmin 
        ? { username: identifier.trim(), password: password }
        : { nip: identifier.trim(), password: password };

      console.log("🔄 Attempting login to:", LOGIN_URL);
      console.log("📤 Request body:", requestBody);

      const response = await fetch(LOGIN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      // 2. Parse JSON
      const data: any = await response.json();

      console.log("📥 Response:", data);

      // 3. Cek jika Backend memberi sinyal Gagal
      if (!response.ok) {
        throw new Error(data.msg || "Login gagal. Periksa kembali kredensial Anda.");
      }

      // 4. LOGIN SUKSES
      console.log("✅ Login Sukses:", data);

      // Simpan Token & Data User ke LocalStorage
      if (data.token) {
        localStorage.setItem("authToken", data.token);
      }
      
      if (data.user) {
        localStorage.setItem("currentUser", JSON.stringify(data.user));
      }

      toast({
        title: "Login Berhasil",
        description: `Selamat datang, ${data.user?.nama || "User"}`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      // 5. Redirect Berdasarkan Role
      setTimeout(() => {
        const role = data.user?.role ? data.user.role.toLowerCase() : "guru";
        
        if (role === "admin") {
          navigate("/admin");
        } else if (role === "kepsek") {
          navigate("/kepsek");
        } else {
          navigate("/guru");
        }
      }, 500);

    } catch (error: any) {
      console.error("❌ Login Error:", error);
      toast({
        title: "Login Gagal",
        description: error.message || "Terjadi kesalahan koneksi ke server",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }

  // --- TAMPILAN (UI) ---
  return (
    <Box
      minH="100vh"
      bg="linear-gradient(135deg, #4299E1 0%, #3182CE 100%)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Box w="full" maxW="md" bg="white" p={8} borderRadius="2xl" boxShadow="2xl">
        <VStack as="form" gap={6} align="stretch" onSubmit={handleSubmit}>
          <Box textAlign="center">
            <Heading size="xl" color="blue.700" mb={2}>
              E-Jurnal Guru
            </Heading>
            <Text color="gray.600" fontSize="md">
              Sistem Absensi & Jurnal Mengajar
            </Text>
          </Box>

          <VStack spacing={4} align="stretch">
            <Box>
              <Text mb={2} fontSize="sm" fontWeight={600} color="gray.700">
                NIP / Username
              </Text>
              <Input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Masukkan NIP atau Username"
                size="lg"
                borderColor="gray.300"
                focusBorderColor="blue.500"
                _hover={{ borderColor: "blue.300" }}
              />
            </Box>

            <Box>
              <Text mb={2} fontSize="sm" fontWeight={600} color="gray.700">
                Password
              </Text>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                size="lg"
                borderColor="gray.300"
                focusBorderColor="blue.500"
                _hover={{ borderColor: "blue.300" }}
              />
            </Box>
          </VStack>

          <Button
            type="submit"
            colorScheme="blue"
            isLoading={loading}
            loadingText="Memproses..."
            w="full"
            size="lg"
            h="50px"
            fontSize="md"
            fontWeight="bold"
            bg="linear-gradient(135deg, #4299E1 0%, #3182CE 100%)"
            _hover={{
              bg: "linear-gradient(135deg, #3182CE 0%, #2C5282 100%)",
              transform: "translateY(-2px)",
              boxShadow: "lg",
            }}
          >
            Masuk
          </Button>

          <Box
            p={4}
            bg="blue.50"
            borderRadius="lg"
            borderLeft="4px solid"
            borderLeftColor="blue.500"
          >
            <Text fontSize="xs" color="blue.900" fontWeight="semibold" mb={1}>
              💡 Info Login:
            </Text>
            <Text fontSize="xs" color="blue.700">
              • Admin: Gunakan username (contoh: "admin"){"\n"}
              • Guru/Kepsek: Gunakan NIP (contoh: "19800202")
            </Text>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
}