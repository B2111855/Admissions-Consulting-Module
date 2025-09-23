-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `user_type` ENUM('admin', 'counselor', 'manager') NOT NULL,
    `is_main_consultant` BOOLEAN NULL DEFAULT false,
    `kpi_group_id` INTEGER UNSIGNED NULL,
    `employment_date` DATE NULL,
    `status` ENUM('active', 'inactive', 'on_leave') NULL DEFAULT 'active',
    `refresh_token` VARCHAR(255) NULL,
    `refresh_token_expire` DATETIME(0) NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `email`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `consultationsessions` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `counselor_id` INTEGER UNSIGNED NOT NULL,
    `student_id` INTEGER UNSIGNED NOT NULL,
    `session_date` DATETIME(0) NOT NULL,
    `duration_minutes` INTEGER NULL,
    `notes` TEXT NULL,
    `session_type` ENUM('Phone Call', 'Online Meeting', 'In-Person', 'Email', 'Chat') NOT NULL,
    `session_status` ENUM('Scheduled', 'Completed', 'Canceled', 'No Show') NOT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `counselor_id`(`counselor_id`),
    INDEX `student_id`(`student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `counselorkpi_targets` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `counselor_id` INTEGER UNSIGNED NOT NULL,
    `kpi_id` INTEGER UNSIGNED NOT NULL,
    `target_value` DECIMAL(12, 2) NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `created_by_user_id` INTEGER UNSIGNED NOT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `created_by_user_id`(`created_by_user_id`),
    INDEX `kpi_id`(`kpi_id`),
    UNIQUE INDEX `counselor_id`(`counselor_id`, `kpi_id`, `start_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `coursecategories` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,

    UNIQUE INDEX `name`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `courses` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `category_id` INTEGER UNSIGNED NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `duration_text` VARCHAR(50) NULL,
    `price` DECIMAL(10, 2) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `name`(`name`),
    INDEX `category_id`(`category_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kpi_definitions` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `unit` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `name`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_interested_courses` (
    `student_id` INTEGER UNSIGNED NOT NULL,
    `course_id` INTEGER UNSIGNED NOT NULL,
    `interest_date` DATE NOT NULL DEFAULT (curdate()),
    `notes` TEXT NULL,

    INDEX `course_id`(`course_id`),
    PRIMARY KEY (`student_id`, `course_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `studentenrollments` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `student_id` INTEGER UNSIGNED NOT NULL,
    `course_id` INTEGER UNSIGNED NOT NULL,
    `enrollment_date` DATE NOT NULL,
    `fee_paid` DECIMAL(12, 2) NOT NULL,
    `payment_status` ENUM('Pending', 'Paid', 'Partially Paid', 'Refunded') NOT NULL,
    `counselor_id` INTEGER UNSIGNED NOT NULL,
    `consultation_session_id` INTEGER UNSIGNED NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `consultation_session_id`(`consultation_session_id`),
    INDEX `counselor_id`(`counselor_id`),
    INDEX `course_id`(`course_id`),
    UNIQUE INDEX `student_id`(`student_id`, `course_id`, `enrollment_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `students` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `student_name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NULL,
    `phone_number` VARCHAR(20) NOT NULL,
    `zalo_phone` VARCHAR(20) NULL,
    `link_facebook` VARCHAR(255) NULL,
    `date_of_birth` DATE NULL,
    `current_education_level` ENUM('THPT', 'SinhVien', 'Other') NOT NULL,
    `other_education_level_description` VARCHAR(255) NULL,
    `high_school_name` VARCHAR(255) NULL,
    `city` VARCHAR(100) NULL,
    `source` ENUM('Mail', 'Fanpage', 'Zalo', 'Website', 'Friend', 'SMS', 'Banderole', 'Poster', 'Brochure', 'Google', 'Brand', 'Event', 'Other') NOT NULL,
    `other_source_description` VARCHAR(255) NULL,
    `notification_consent` ENUM('Agree', 'Disagree', 'Other') NOT NULL,
    `other_notification_consent_description` VARCHAR(255) NULL,
    `current_status` ENUM('Lead', 'Engaging', 'Registered', 'Dropped Out', 'Archived') NOT NULL DEFAULT 'Lead',
    `assigned_counselor_id` INTEGER UNSIGNED NULL,
    `status_change_date` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `registration_date` DATE NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `email`(`email`),
    UNIQUE INDEX `phone_number`(`phone_number`),
    INDEX `assigned_counselor_id`(`assigned_counselor_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `studentstatushistory` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `student_id` INTEGER UNSIGNED NOT NULL,
    `old_status` ENUM('Lead', 'Engaging', 'Registered', 'Dropped Out', 'Archived') NULL,
    `new_status` ENUM('Lead', 'Engaging', 'Registered', 'Dropped Out', 'Archived') NOT NULL,
    `change_date` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `changed_by_user_id` INTEGER UNSIGNED NOT NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `changed_by_user_id`(`changed_by_user_id`),
    INDEX `student_id`(`student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `counselorspecializations` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,

    UNIQUE INDEX `name`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `userspecializations` (
    `user_id` INTEGER UNSIGNED NOT NULL,
    `specialization_id` INTEGER UNSIGNED NOT NULL,

    INDEX `specialization_id`(`specialization_id`),
    PRIMARY KEY (`user_id`, `specialization_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `consultationsessions` ADD CONSTRAINT `consultationsessions_ibfk_1` FOREIGN KEY (`counselor_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `consultationsessions` ADD CONSTRAINT `consultationsessions_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `counselorkpi_targets` ADD CONSTRAINT `counselorkpi_targets_ibfk_1` FOREIGN KEY (`counselor_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `counselorkpi_targets` ADD CONSTRAINT `counselorkpi_targets_ibfk_2` FOREIGN KEY (`kpi_id`) REFERENCES `kpi_definitions`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `counselorkpi_targets` ADD CONSTRAINT `counselorkpi_targets_ibfk_3` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `courses` ADD CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `coursecategories`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `student_interested_courses` ADD CONSTRAINT `student_interested_courses_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `student_interested_courses` ADD CONSTRAINT `student_interested_courses_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `studentenrollments` ADD CONSTRAINT `studentenrollments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `studentenrollments` ADD CONSTRAINT `studentenrollments_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `studentenrollments` ADD CONSTRAINT `studentenrollments_ibfk_3` FOREIGN KEY (`counselor_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `studentenrollments` ADD CONSTRAINT `studentenrollments_ibfk_4` FOREIGN KEY (`consultation_session_id`) REFERENCES `consultationsessions`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`assigned_counselor_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `studentstatushistory` ADD CONSTRAINT `studentstatushistory_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `studentstatushistory` ADD CONSTRAINT `studentstatushistory_ibfk_2` FOREIGN KEY (`changed_by_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `userspecializations` ADD CONSTRAINT `userspecializations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `userspecializations` ADD CONSTRAINT `userspecializations_ibfk_2` FOREIGN KEY (`specialization_id`) REFERENCES `counselorspecializations`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
