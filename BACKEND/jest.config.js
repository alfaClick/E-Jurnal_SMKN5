// jest.config.js
export default {
  // Memberi tahu Jest bahwa ini adalah lingkungan Node.js
  testEnvironment: 'jest-environment-node',

  // Ini adalah bagian terpenting:
  // Memberi tahu Jest untuk menggunakan SWC (yang kita instal)
  // untuk "mengubah" (transform) file .js dan .ts
  // agar Jest bisa memahaminya.
  transform: {
    '^.+\\.(ts|js)$': '@swc/jest',
  },

  // Ini diperlukan karena proyek Anda menggunakan ES Modules (import/export)
  extensionsToTreatAsEsm: ['.ts'],
};