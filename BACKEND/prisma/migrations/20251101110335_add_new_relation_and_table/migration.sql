-- CreateTable
CREATE TABLE `guru` (
    `id_guru` INTEGER NOT NULL AUTO_INCREMENT,
    `nip` VARCHAR(50) NOT NULL,
    `nama_lengkap` VARCHAR(100) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('guru', 'admin', 'kepsek') NULL DEFAULT 'guru',
    `is_wali_kelas` BOOLEAN NULL DEFAULT false,
    `id_jurusan` INTEGER NULL,

    UNIQUE INDEX `nip`(`nip`),
    INDEX `id_jurusan`(`id_jurusan`),
    PRIMARY KEY (`id_guru`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jurusan` (
    `id_jurusan` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_jurusan` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`id_jurusan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mapel` (
    `id_mapel` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_mapel` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `mapel_nama_mapel_key`(`nama_mapel`),
    PRIMARY KEY (`id_mapel`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kelas` (
    `id_kelas` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_kelas` VARCHAR(50) NOT NULL,
    `id_jurusan` INTEGER NULL,
    `id_wali_kelas` INTEGER NULL,

    INDEX `id_jurusan`(`id_jurusan`),
    INDEX `id_wali_kelas`(`id_wali_kelas`),
    PRIMARY KEY (`id_kelas`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `siswa` (
    `id_siswa` INTEGER NOT NULL AUTO_INCREMENT,
    `nis` VARCHAR(50) NOT NULL,
    `nama_lengkap` VARCHAR(100) NOT NULL,
    `jenis_kelamin` ENUM('L', 'P') NULL DEFAULT 'L',
    `id_kelas` INTEGER NULL,

    UNIQUE INDEX `nis`(`nis`),
    INDEX `id_kelas`(`id_kelas`),
    PRIMARY KEY (`id_siswa`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jadwal` (
    `id_jadwal` INTEGER NOT NULL AUTO_INCREMENT,
    `id_guru` INTEGER NULL,
    `id_kelas` INTEGER NULL,
    `id_mapel` INTEGER NULL,
    `hari` VARCHAR(20) NULL,
    `jam_mulai` TIME(0) NULL,
    `jam_selesai` TIME(0) NULL,

    INDEX `id_guru`(`id_guru`),
    INDEX `id_kelas`(`id_kelas`),
    INDEX `id_mapel`(`id_mapel`),
    PRIMARY KEY (`id_jadwal`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `absensi` (
    `id_absensi` INTEGER NOT NULL AUTO_INCREMENT,
    `id_siswa` INTEGER NULL,
    `id_jadwal` INTEGER NULL,
    `tanggal` DATE NULL,
    `status` ENUM('H', 'I', 'S', 'A') NULL DEFAULT 'H',

    INDEX `id_jadwal`(`id_jadwal`),
    INDEX `id_siswa`(`id_siswa`),
    PRIMARY KEY (`id_absensi`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jurnal_harian` (
    `id_jurnal` INTEGER NOT NULL AUTO_INCREMENT,
    `id_jadwal` INTEGER NULL,
    `tanggal` DATE NULL,
    `materi` VARCHAR(255) NULL,
    `kegiatan` TEXT NULL,

    INDEX `id_jadwal`(`id_jadwal`),
    PRIMARY KEY (`id_jurnal`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `guru` ADD CONSTRAINT `guru_id_jurusan_fkey` FOREIGN KEY (`id_jurusan`) REFERENCES `jurusan`(`id_jurusan`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `kelas` ADD CONSTRAINT `kelas_ibfk_1` FOREIGN KEY (`id_jurusan`) REFERENCES `jurusan`(`id_jurusan`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `kelas` ADD CONSTRAINT `kelas_ibfk_2` FOREIGN KEY (`id_wali_kelas`) REFERENCES `guru`(`id_guru`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `siswa` ADD CONSTRAINT `siswa_ibfk_1` FOREIGN KEY (`id_kelas`) REFERENCES `kelas`(`id_kelas`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `jadwal` ADD CONSTRAINT `jadwal_ibfk_1` FOREIGN KEY (`id_guru`) REFERENCES `guru`(`id_guru`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `jadwal` ADD CONSTRAINT `jadwal_ibfk_2` FOREIGN KEY (`id_kelas`) REFERENCES `kelas`(`id_kelas`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `jadwal` ADD CONSTRAINT `jadwal_id_mapel_fkey` FOREIGN KEY (`id_mapel`) REFERENCES `mapel`(`id_mapel`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `absensi` ADD CONSTRAINT `absensi_ibfk_1` FOREIGN KEY (`id_siswa`) REFERENCES `siswa`(`id_siswa`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `absensi` ADD CONSTRAINT `absensi_ibfk_2` FOREIGN KEY (`id_jadwal`) REFERENCES `jadwal`(`id_jadwal`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `jurnal_harian` ADD CONSTRAINT `jurnal_harian_ibfk_1` FOREIGN KEY (`id_jadwal`) REFERENCES `jadwal`(`id_jadwal`) ON DELETE NO ACTION ON UPDATE NO ACTION;
