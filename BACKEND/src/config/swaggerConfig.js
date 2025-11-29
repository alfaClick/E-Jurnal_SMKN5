import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API E-Jurnal Guru SMKN 5 KAB. TANGERANG',
      version: '1.0.0',
      description:
        'Dokumentasi API lengkap untuk sistem E-Jurnal Guru.',
    },
    servers: [
      {
        url: 'http://localhost:5500/api', 
        description: 'Server Lokal',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Masukkan token JWT Anda: Bearer <token>',
        },
      },
    },
    security: [
      {
        bearerAuth: [], // Terapkan keamanan JWT ini secara global
      },
    ],
    
  },
  // Lokasi file API 
  apis: [path.join(__dirname, '../routes/*.routes.js')], // Arahkan ke semua file routes 
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;