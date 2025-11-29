import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getAllMapel = async (req, res) => {
  try {
    // Ambil semua mapel, urutkan A-Z biar rapi
    const mapels = await prisma.mapel.findMany({
      orderBy: { nama_mapel: 'asc' } 
    });
    res.status(200).json(mapels);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};