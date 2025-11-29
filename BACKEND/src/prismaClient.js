import { PrismaClient } from '../generated/prisma/index.js';

// Singleton pattern
const prisma = new PrismaClient({
  log: ['error', 'warn'], // Logging
});

// Test connection
prisma.$connect()
  .then(() => {
    console.log('✅ Connected to PostgreSQL database');
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('🔌 Database disconnected');
  process.exit(0);
});

export default prisma;