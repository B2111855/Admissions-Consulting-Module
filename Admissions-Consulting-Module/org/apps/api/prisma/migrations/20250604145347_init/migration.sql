-- CreateTable
CREATE TABLE `khoahoc` (
    `ID` VARCHAR(4) NOT NULL,
    `Name` VARCHAR(50) NULL,

    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `khoahoc_lop` (
    `ID` VARCHAR(4) NOT NULL,
    `Name` VARCHAR(50) NULL,
    `ID_KhoaHoc` VARCHAR(4) NULL,

    INDEX `ID_KhoaHoc`(`ID_KhoaHoc`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lop` (
    `ID` VARCHAR(4) NOT NULL,
    `Name` VARCHAR(50) NULL,
    `ID_KhoaHoc_Lop` VARCHAR(4) NULL,

    INDEX `ID_KhoaHoc_Lop`(`ID_KhoaHoc_Lop`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `khoahoc_lop` ADD CONSTRAINT `khoahoc_lop_ibfk_1` FOREIGN KEY (`ID_KhoaHoc`) REFERENCES `khoahoc`(`ID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `lop` ADD CONSTRAINT `lop_ibfk_1` FOREIGN KEY (`ID_KhoaHoc_Lop`) REFERENCES `lop`(`ID`) ON DELETE RESTRICT ON UPDATE RESTRICT;
