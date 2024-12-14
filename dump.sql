CREATE DATABASE `school_database`
USE `school_database`;

DROP TABLE IF EXISTS `admin`;

CREATE TABLE
  `admin` (
    `id` varchar(36) NOT NULL DEFAULT (uuid ()),
    `username` varchar(255) NOT NULL,
    `fullName` varchar(255) NOT NULL,
    `email` varchar(255) NOT NULL,
    `phoneNumber` varchar(20) NOT NULL,
    `password` varchar(255) NOT NULL,
    `profilePicture` text,
    `role` enum ('admin') DEFAULT 'admin',
    `schoolName` varchar(255) NOT NULL,
    `schoolAddress` text NOT NULL,
    `schoolContactNumber` varchar(20) NOT NULL,
    `schoolEmail` varchar(255) NOT NULL,
    `schoolRegisterId` varchar(255) NOT NULL,
    `governmentId` varchar(255) NOT NULL,
    `schoolLogo` text,
    `agreementToTerms` tinyint (1) NOT NULL,
    `schoolEstablished` varchar(255) NOT NULL,
    `school_id` varchar(36) NOT NULL DEFAULT (uuid ()),
    PRIMARY KEY (`school_id`),
    UNIQUE KEY `username` (`username`),
    UNIQUE KEY `id` (`id`)
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `announcement`;

CREATE TABLE
  `announcement` (
    `id` int NOT NULL AUTO_INCREMENT,
    `title` varchar(255) NOT NULL,
    `description` text NOT NULL,
    `date` date NOT NULL,
    `classId` int DEFAULT NULL,
    `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `school_id` varchar(36) DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `classId` (`classId`),
    KEY `fk_school_id` (`school_id`),
    CONSTRAINT `announcement_ibfk_1` FOREIGN KEY (`classId`) REFERENCES `class` (`id`),
    CONSTRAINT `fk_school_id` FOREIGN KEY (`school_id`) REFERENCES `admin` (`school_id`) ON DELETE SET NULL
  ) ENGINE = InnoDB AUTO_INCREMENT = 3 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `assignment`;

CREATE TABLE
  `assignment` (
    `id` int NOT NULL AUTO_INCREMENT,
    `title` varchar(255) NOT NULL,
    `startDate` date NOT NULL,
    `dueDate` date NOT NULL,
    `lessonId` int NOT NULL,
    `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `school_id` varchar(36) DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `lessonId` (`lessonId`),
    KEY `fk_school_id_assignment` (`school_id`),
    CONSTRAINT `assignment_ibfk_1` FOREIGN KEY (`lessonId`) REFERENCES `lesson` (`id`),
    CONSTRAINT `fk_school_id_assignment` FOREIGN KEY (`school_id`) REFERENCES `admin` (`school_id`) ON DELETE SET NULL
  ) ENGINE = InnoDB AUTO_INCREMENT = 2 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `attendance`;

CREATE TABLE
  `attendance` (
    `id` int NOT NULL AUTO_INCREMENT,
    `date` date NOT NULL,
    `present` tinyint (1) NOT NULL,
    `studentId` varchar(255) NOT NULL,
    `lessonId` int NOT NULL,
    `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `school_id` varchar(36) DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `studentId` (`studentId`),
    KEY `lessonId` (`lessonId`),
    KEY `fk_school_id_attendance` (`school_id`),
    CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`studentId`) REFERENCES `student` (`id`),
    CONSTRAINT `attendance_ibfk_2` FOREIGN KEY (`lessonId`) REFERENCES `lesson` (`id`),
    CONSTRAINT `fk_school_id_attendance` FOREIGN KEY (`school_id`) REFERENCES `admin` (`school_id`) ON DELETE SET NULL
  ) ENGINE = InnoDB AUTO_INCREMENT = 2 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `class`;

CREATE TABLE
  `class` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `capacity` int NOT NULL,
    `supervisorId` varchar(255) DEFAULT NULL,
    `gradeId` int NOT NULL,
    `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `school_id` varchar(36) DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_class_name_per_school` (`name`, `school_id`),
    KEY `supervisorId` (`supervisorId`),
    KEY `gradeId` (`gradeId`),
    KEY `fk_school_id_class` (`school_id`),
    CONSTRAINT `class_ibfk_1` FOREIGN KEY (`supervisorId`) REFERENCES `teacher` (`id`),
    CONSTRAINT `class_ibfk_2` FOREIGN KEY (`gradeId`) REFERENCES `grade` (`id`),
    CONSTRAINT `fk_school_id_class` FOREIGN KEY (`school_id`) REFERENCES `admin` (`school_id`) ON DELETE SET NULL
  ) ENGINE = InnoDB AUTO_INCREMENT = 10 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `event`;

CREATE TABLE
  `event` (
    `id` int NOT NULL AUTO_INCREMENT,
    `title` varchar(255) NOT NULL,
    `description` text NOT NULL,
    `startDate` date NOT NULL,
    `endDate` date NOT NULL,
    `classId` int DEFAULT NULL,
    `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `school_id` varchar(36) DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `classId` (`classId`),
    KEY `fk_school_id_event` (`school_id`),
    CONSTRAINT `event_ibfk_1` FOREIGN KEY (`classId`) REFERENCES `class` (`id`),
    CONSTRAINT `fk_school_id_event` FOREIGN KEY (`school_id`) REFERENCES `admin` (`school_id`) ON DELETE SET NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `exam`;

CREATE TABLE
  `exam` (
    `id` int NOT NULL AUTO_INCREMENT,
    `title` varchar(255) NOT NULL,
    `startTime` time NOT NULL,
    `endTime` time NOT NULL,
    `lessonId` int NOT NULL,
    `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `school_id` varchar(36) DEFAULT NULL,
    `date` date NOT NULL,
    PRIMARY KEY (`id`),
    KEY `lessonId` (`lessonId`),
    KEY `fk_school_id_exam` (`school_id`),
    CONSTRAINT `exam_ibfk_1` FOREIGN KEY (`lessonId`) REFERENCES `lesson` (`id`),
    CONSTRAINT `fk_school_id_exam` FOREIGN KEY (`school_id`) REFERENCES `admin` (`school_id`) ON DELETE SET NULL
  ) ENGINE = InnoDB AUTO_INCREMENT = 5 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `grade`;

CREATE TABLE
  `grade` (
    `id` int NOT NULL AUTO_INCREMENT,
    `level` int NOT NULL,
    `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `school_id` varchar(36) DEFAULT NULL,
    `updatedAt` datetime DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_grade_level` (`level`, `school_id`),
    KEY `fk_school_id_grade` (`school_id`),
    CONSTRAINT `fk_school_id_grade` FOREIGN KEY (`school_id`) REFERENCES `admin` (`school_id`) ON DELETE CASCADE
  ) ENGINE = InnoDB AUTO_INCREMENT = 3 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `lesson`;

CREATE TABLE
  `lesson` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `teacherId` varchar(255) DEFAULT NULL,
    `classId` int NOT NULL,
    `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `school_id` varchar(36) DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `teacherId` (`teacherId`),
    KEY `classId` (`classId`),
    KEY `fk_school_id_lesson` (`school_id`),
    CONSTRAINT `lesson_ibfk_1` FOREIGN KEY (`teacherId`) REFERENCES `teacher` (`id`),
    CONSTRAINT `lesson_ibfk_2` FOREIGN KEY (`classId`) REFERENCES `class` (`id`),
    CONSTRAINT `fk_school_id_lesson` FOREIGN KEY (`school_id`) REFERENCES `admin` (`school_id`) ON DELETE SET NULL
  ) ENGINE = InnoDB AUTO_INCREMENT = 4 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `parent`;

CREATE TABLE
  `parent` (
    `id` varchar(36) NOT NULL DEFAULT (uuid ()),
    `firstName` varchar(255) NOT NULL,
    `lastName` varchar(255) NOT NULL,
    `email` varchar(255) NOT NULL,
    `phoneNumber` varchar(20) NOT NULL,
    `address` text NOT NULL,
    `studentId` varchar(255) NOT NULL,
    `school_id` varchar(36) DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `studentId` (`studentId`),
    KEY `fk_school_id_parent` (`school_id`),
    CONSTRAINT `parent_ibfk_1` FOREIGN KEY (`studentId`) REFERENCES `student` (`id`),
    CONSTRAINT `fk_school_id_parent` FOREIGN KEY (`school_id`) REFERENCES `admin` (`school_id`) ON DELETE SET NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `student`;

CREATE TABLE
  `student` (
    `id` varchar(36) NOT NULL DEFAULT (uuid ()),
    `firstName` varchar(255) NOT NULL,
    `lastName` varchar(255) NOT NULL,
    `email` varchar(255) NOT NULL,
    `phoneNumber` varchar(20) NOT NULL,
    `address` text NOT NULL,
    `dateOfBirth` date NOT NULL,
    `gender` enum ('male', 'female') NOT NULL,
    `school_id` varchar(36) DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `fk_school_id_student` (`school_id`),
    CONSTRAINT `fk_school_id_student` FOREIGN KEY (`school_id`) REFERENCES `admin` (`school_id`) ON DELETE CASCADE
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `teacher`;

CREATE TABLE
  `teacher` (
    `id` varchar(36) NOT NULL DEFAULT (uuid ()),
    `firstName` varchar(255) NOT NULL,
    `lastName` varchar(255) NOT NULL,
    `email` varchar(255) NOT NULL,
    `phoneNumber` varchar(20) NOT NULL,
    `address` text NOT NULL,
    `school_id` varchar(36) DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `fk_school_id_teacher` (`school_id`),
    CONSTRAINT `fk_school_id_teacher` FOREIGN KEY (`school_id`) REFERENCES `admin` (`school_id`) ON DELETE CASCADE
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;