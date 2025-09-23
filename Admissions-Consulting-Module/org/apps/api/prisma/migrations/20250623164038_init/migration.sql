/*
  Warnings:

  - You are about to drop the `khoahoc` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `khoahoc_lop` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `lop` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `gender` to the `students` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `khoahoc_lop` DROP FOREIGN KEY `khoahoc_lop_ibfk_1`;

-- DropForeignKey
ALTER TABLE `lop` DROP FOREIGN KEY `lop_ibfk_1`;

-- AlterTable
ALTER TABLE `courses` ADD COLUMN `program_type` ENUM('Aptech', 'Arena', 'Short-term + Steam') NOT NULL DEFAULT 'Short-term + Steam';

-- AlterTable
ALTER TABLE `students` ADD COLUMN `gender` VARCHAR(20) NOT NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `program_type` ENUM('Aptech', 'Arena', 'Short-term + Steam') NULL DEFAULT 'Short-term + Steam';

-- DropTable
DROP TABLE `khoahoc`;

-- DropTable
DROP TABLE `khoahoc_lop`;

-- DropTable
DROP TABLE `lop`;

-- CreateTable
CREATE TABLE `kpi_program_config` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `program_type` ENUM('Aptech', 'Arena', 'Short-term + Steam') NOT NULL,
    `annual_target` DECIMAL(10, 2) NOT NULL,
    `monthly_target` DECIMAL(10, 2) NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `program_type`(`program_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- RedefineIndex
CREATE INDEX `consultationsessions_ibfk_1` ON `consultationsessions`(`counselor_id`);
DROP INDEX `counselor_id` ON `consultationsessions`;

-- RedefineIndex
CREATE INDEX `consultationsessions_ibfk_2` ON `consultationsessions`(`student_id`);
DROP INDEX `student_id` ON `consultationsessions`;

-- RedefineIndex
CREATE INDEX `counselorkpi_targets_ibfk_3` ON `counselorkpi_targets`(`created_by_user_id`);
DROP INDEX `created_by_user_id` ON `counselorkpi_targets`;

-- RedefineIndex
CREATE INDEX `counselorkpi_targets_ibfk_2` ON `counselorkpi_targets`(`kpi_id`);
DROP INDEX `kpi_id` ON `counselorkpi_targets`;

-- RedefineIndex
CREATE INDEX `courses_ibfk_1` ON `courses`(`category_id`);
DROP INDEX `category_id` ON `courses`;

-- RedefineIndex
CREATE INDEX `student_interested_courses_ibfk_2` ON `student_interested_courses`(`course_id`);
DROP INDEX `course_id` ON `student_interested_courses`;

-- RedefineIndex
CREATE INDEX `studentenrollments_ibfk_4` ON `studentenrollments`(`consultation_session_id`);
DROP INDEX `consultation_session_id` ON `studentenrollments`;

-- RedefineIndex
CREATE INDEX `studentenrollments_ibfk_3` ON `studentenrollments`(`counselor_id`);
DROP INDEX `counselor_id` ON `studentenrollments`;

-- RedefineIndex
CREATE INDEX `studentenrollments_ibfk_2` ON `studentenrollments`(`course_id`);
DROP INDEX `course_id` ON `studentenrollments`;

-- RedefineIndex
CREATE INDEX `students_ibfk_1` ON `students`(`assigned_counselor_id`);
DROP INDEX `assigned_counselor_id` ON `students`;

-- RedefineIndex
CREATE INDEX `studentstatushistory_ibfk_2` ON `studentstatushistory`(`changed_by_user_id`);
DROP INDEX `changed_by_user_id` ON `studentstatushistory`;

-- RedefineIndex
CREATE INDEX `studentstatushistory_ibfk_1` ON `studentstatushistory`(`student_id`);
DROP INDEX `student_id` ON `studentstatushistory`;

-- RedefineIndex
CREATE INDEX `userspecializations_ibfk_2` ON `userspecializations`(`specialization_id`);
DROP INDEX `specialization_id` ON `userspecializations`;
