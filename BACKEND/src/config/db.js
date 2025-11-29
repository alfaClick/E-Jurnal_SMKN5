import dotenv from "dotenv";
import prisma from "../prismaClient.js";

dotenv.config();

export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("✅ Connected to MySQL database");
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  }
};
