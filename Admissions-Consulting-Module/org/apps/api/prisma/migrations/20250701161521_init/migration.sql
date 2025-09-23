/*
  Warnings:

  - You are about to alter the column `source` on the `students` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(10))` to `VarChar(255)`.

*/
-- AlterTable
ALTER TABLE `students` MODIFY `source` VARCHAR(255) NULL;
