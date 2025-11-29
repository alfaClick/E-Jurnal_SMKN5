import { Button, Box, Text } from "@chakra-ui/react";

export default function TestChakra() {
  return (
    <Box p={8} bg="gray.50" minH="100vh">
      <Text fontSize="xl" mb={4}>Chakra UI aktif 🎉</Text>
      <Button colorScheme="blue">Tombol Chakra</Button>
    </Box>
  );
}
