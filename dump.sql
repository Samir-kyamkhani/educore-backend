-- MySQL dump 10.13  Distrib 8.0.40, for Linux (x86_64)
--
-- Host: 127.0.0.1    Database: school_database
-- ------------------------------------------------------
-- Server version	9.1.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `school_database`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `school_database` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `school_database`;

--
-- Table structure for table `admin`
--

DROP TABLE IF EXISTS `admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `username` varchar(255) NOT NULL,
  `fullName` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phoneNumber` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  `profilePicture` text,
  `role` enum('admin') DEFAULT 'admin',
  `schoolName` varchar(255) NOT NULL,
  `schoolAddress` text NOT NULL,
  `schoolContactNumber` varchar(20) NOT NULL,
  `schoolEmail` varchar(255) NOT NULL,
  `schoolRegisterId` varchar(255) NOT NULL,
  `governmentId` varchar(255) NOT NULL,
  `schoolLogo` text,
  `agreementToTerms` tinyint(1) NOT NULL,
  `schoolEstablished` varchar(255) NOT NULL,
  `school_id` varchar(36) NOT NULL DEFAULT (uuid()),
  PRIMARY KEY (`school_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin`
--

LOCK TABLES `admin` WRITE;
/*!40000 ALTER TABLE `admin` DISABLE KEYS */;
INSERT INTO `admin` VALUES ('9b4ca50e-ba0d-11ef-b6b1-0242ac120002','Samir_Khan','Samir khan','samir@example.com','0214578963','$2b$10$.StEbjIDUu9p05tQfxstL.Etd6P9miVPmoRj6y9edXjPgR1.ne1Dm','/home/samir-kayamkhani/Desktop/Code/Crm-server/src/controllers/public/profilePicture/1721669701656-1734175307331-596431977.jpg','admin','sih school','jhotwara','85520147962','admin@gmail.com','455789T','123578865000','/home/samir-kayamkhani/Desktop/Code/Crm-server/src/controllers/public/schoolLogo/1721669701656-1734175307302-175597898.jpg',1,'2023-01-01 00:00:00.000','9b4ca52d-ba0d-11ef-b6b1-0242ac120002');
/*!40000 ALTER TABLE `admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `announcement`
--

DROP TABLE IF EXISTS `announcement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `announcement` (
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `announcement`
--

LOCK TABLES `announcement` WRITE;
/*!40000 ALTER TABLE `announcement` DISABLE KEYS */;
INSERT INTO `announcement` VALUES (5,'Updated Holiday Announcement','School will remain closed on 26th Dec as well.','2024-12-26',NULL,'2024-12-14 11:55:22','9b4ca52d-ba0d-11ef-b6b1-0242ac120002');
/*!40000 ALTER TABLE `announcement` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assignment`
--

DROP TABLE IF EXISTS `assignment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assignment` (
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assignment`
--

LOCK TABLES `assignment` WRITE;
/*!40000 ALTER TABLE `assignment` DISABLE KEYS */;
INSERT INTO `assignment` VALUES (4,'Do From Home Alif by pe te','2023-12-16','2023-12-25',9,'2024-12-14 11:49:09','9b4ca52d-ba0d-11ef-b6b1-0242ac120002');
/*!40000 ALTER TABLE `assignment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `present` tinyint(1) NOT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance`
--

LOCK TABLES `attendance` WRITE;
/*!40000 ALTER TABLE `attendance` DISABLE KEYS */;
INSERT INTO `attendance` VALUES (4,'2024-12-15',1,'e67ec403-ba0e-11ef-b6b1-0242ac120002',9,'2024-12-14 11:53:41','9b4ca52d-ba0d-11ef-b6b1-0242ac120002');
/*!40000 ALTER TABLE `attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class`
--

DROP TABLE IF EXISTS `class`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `class` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `capacity` int NOT NULL,
  `supervisorId` varchar(255) DEFAULT NULL,
  `gradeId` int NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `school_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_class_name_per_school` (`name`,`school_id`),
  KEY `supervisorId` (`supervisorId`),
  KEY `gradeId` (`gradeId`),
  KEY `fk_school_id_class` (`school_id`),
  CONSTRAINT `class_ibfk_1` FOREIGN KEY (`supervisorId`) REFERENCES `teacher` (`id`),
  CONSTRAINT `class_ibfk_2` FOREIGN KEY (`gradeId`) REFERENCES `grade` (`id`),
  CONSTRAINT `fk_school_id_class` FOREIGN KEY (`school_id`) REFERENCES `admin` (`school_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class`
--

LOCK TABLES `class` WRITE;
/*!40000 ALTER TABLE `class` DISABLE KEYS */;
INSERT INTO `class` VALUES (10,'nursury class',30,NULL,12,'2024-12-14 11:43:30','9b4ca52d-ba0d-11ef-b6b1-0242ac120002');
/*!40000 ALTER TABLE `class` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event`
--

DROP TABLE IF EXISTS `event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event` (
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event`
--

LOCK TABLES `event` WRITE;
/*!40000 ALTER TABLE `event` DISABLE KEYS */;
INSERT INTO `event` VALUES (3,'Updated Event Title','Updated event description','2024-06-25','2024-06-27',NULL,'2024-12-14 11:54:29','9b4ca52d-ba0d-11ef-b6b1-0242ac120002');
/*!40000 ALTER TABLE `event` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exam`
--

DROP TABLE IF EXISTS `exam`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exam` (
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam`
--

LOCK TABLES `exam` WRITE;
/*!40000 ALTER TABLE `exam` DISABLE KEYS */;
INSERT INTO `exam` VALUES (5,'Test Exam','09:00:00','11:00:00',9,'2024-12-14 11:47:47','9b4ca52d-ba0d-11ef-b6b1-0242ac120002','2024-06-15');
/*!40000 ALTER TABLE `exam` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grade`
--

DROP TABLE IF EXISTS `grade`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grade` (
  `id` int NOT NULL AUTO_INCREMENT,
  `level` int NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `school_id` varchar(36) DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_grade_level` (`level`,`school_id`),
  KEY `fk_school_id_grade` (`school_id`),
  CONSTRAINT `fk_school_id_grade` FOREIGN KEY (`school_id`) REFERENCES `admin` (`school_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grade`
--

LOCK TABLES `grade` WRITE;
/*!40000 ALTER TABLE `grade` DISABLE KEYS */;
INSERT INTO `grade` VALUES (12,6,'2024-12-14 11:40:42','9b4ca52d-ba0d-11ef-b6b1-0242ac120002','2024-12-14 11:40:54');
/*!40000 ALTER TABLE `grade` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lesson`
--

DROP TABLE IF EXISTS `lesson`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lesson` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `day` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') NOT NULL,
  `startTime` time NOT NULL,
  `endTime` time NOT NULL,
  `subjectId` int NOT NULL,
  `classId` int NOT NULL,
  `teacherId` varchar(255) NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `school_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `subjectId` (`subjectId`),
  KEY `classId` (`classId`),
  KEY `teacherId` (`teacherId`),
  KEY `fk_school_id_lesson` (`school_id`),
  CONSTRAINT `fk_school_id_lesson` FOREIGN KEY (`school_id`) REFERENCES `admin` (`school_id`) ON DELETE SET NULL,
  CONSTRAINT `lesson_ibfk_1` FOREIGN KEY (`subjectId`) REFERENCES `subject` (`id`),
  CONSTRAINT `lesson_ibfk_2` FOREIGN KEY (`classId`) REFERENCES `class` (`id`),
  CONSTRAINT `lesson_ibfk_3` FOREIGN KEY (`teacherId`) REFERENCES `teacher` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lesson`
--

LOCK TABLES `lesson` WRITE;
/*!40000 ALTER TABLE `lesson` DISABLE KEYS */;
INSERT INTO `lesson` VALUES (9,'ALIF BY PE TE','Friday','09:00:00','10:30:00',7,10,'807213d9-ba0e-11ef-b6b1-0242ac120002','2024-12-14 11:46:35','9b4ca52d-ba0d-11ef-b6b1-0242ac120002');
/*!40000 ALTER TABLE `lesson` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parent`
--

DROP TABLE IF EXISTS `parent`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `parent` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `surname` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) NOT NULL,
  `address` text NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `role` enum('parent') DEFAULT 'parent',
  `school_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_parent_school_id` (`school_id`),
  CONSTRAINT `fk_parent_school_id` FOREIGN KEY (`school_id`) REFERENCES `admin` (`school_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parent`
--

LOCK TABLES `parent` WRITE;
/*!40000 ALTER TABLE `parent` DISABLE KEYS */;
INSERT INTO `parent` VALUES ('b0cfc34a-ba0e-11ef-b6b1-0242ac120002','janedoe123','$2b$10$LcdUQnlHWNMjUCjjUENoluGFRMVCcEc72gKRuLMs3slNUt6GFu/Iq','Jane','Doe','janedoe@example.com','+11234567890','456 Elm Street, Metropolis, USA','2024-12-14 11:29:33','parent','9b4ca52d-ba0d-11ef-b6b1-0242ac120002');
/*!40000 ALTER TABLE `parent` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `result`
--

DROP TABLE IF EXISTS `result`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `result` (
  `id` int NOT NULL AUTO_INCREMENT,
  `score` varchar(10) NOT NULL,
  `examId` int DEFAULT NULL,
  `assignmentId` int DEFAULT NULL,
  `studentId` varchar(255) NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `school_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `examId` (`examId`),
  KEY `assignmentId` (`assignmentId`),
  KEY `studentId` (`studentId`),
  KEY `fk_school_id_result` (`school_id`),
  CONSTRAINT `fk_school_id_result` FOREIGN KEY (`school_id`) REFERENCES `admin` (`school_id`) ON DELETE SET NULL,
  CONSTRAINT `result_ibfk_1` FOREIGN KEY (`examId`) REFERENCES `exam` (`id`),
  CONSTRAINT `result_ibfk_2` FOREIGN KEY (`assignmentId`) REFERENCES `assignment` (`id`),
  CONSTRAINT `result_ibfk_3` FOREIGN KEY (`studentId`) REFERENCES `student` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `result`
--

LOCK TABLES `result` WRITE;
/*!40000 ALTER TABLE `result` DISABLE KEYS */;
INSERT INTO `result` VALUES (3,'50',5,NULL,'e67ec403-ba0e-11ef-b6b1-0242ac120002','2024-12-14 11:51:26','9b4ca52d-ba0d-11ef-b6b1-0242ac120002');
/*!40000 ALTER TABLE `result` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student`
--

DROP TABLE IF EXISTS `student`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `surname` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text NOT NULL,
  `profile` varchar(255) DEFAULT NULL,
  `bloodType` varchar(3) NOT NULL,
  `sex` enum('male','female') NOT NULL,
  `birthday` date NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `parentId` varchar(255) DEFAULT NULL,
  `classId` int DEFAULT NULL,
  `gradeId` int DEFAULT NULL,
  `role` enum('student') DEFAULT 'student',
  `school_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone` (`phone`),
  KEY `parentId` (`parentId`),
  KEY `classId` (`classId`),
  KEY `gradeId` (`gradeId`),
  KEY `fk_student_school_id` (`school_id`),
  CONSTRAINT `fk_student_school_id` FOREIGN KEY (`school_id`) REFERENCES `admin` (`school_id`) ON DELETE SET NULL,
  CONSTRAINT `student_ibfk_1` FOREIGN KEY (`parentId`) REFERENCES `parent` (`id`),
  CONSTRAINT `student_ibfk_2` FOREIGN KEY (`classId`) REFERENCES `class` (`id`),
  CONSTRAINT `student_ibfk_3` FOREIGN KEY (`gradeId`) REFERENCES `grade` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student`
--

LOCK TABLES `student` WRITE;
/*!40000 ALTER TABLE `student` DISABLE KEYS */;
INSERT INTO `student` VALUES ('e67ec403-ba0e-11ef-b6b1-0242ac120002','newUsername','$2b$10$7ZOT2Fnev5nmjQN5dXkXkOZE1RICt0Gvnp3CBhPv.IzejrFEXevDS','John','Doe','newemail@example.com','1234567890','123 New Address','/home/samir-kayamkhani/Desktop/Code/Crm-server/src/controllers/public/profile/1721669701656-1734175862990-243327358.jpg','O+','male','2002-01-01','2024-12-14 11:31:03','b0cfc34a-ba0e-11ef-b6b1-0242ac120002',NULL,NULL,'student','9b4ca52d-ba0d-11ef-b6b1-0242ac120002');
/*!40000 ALTER TABLE `student` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subject`
--

DROP TABLE IF EXISTS `subject`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subject` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `school_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_name_school` (`name`,`school_id`),
  KEY `fk_school_id_subject` (`school_id`),
  CONSTRAINT `fk_school_id_subject` FOREIGN KEY (`school_id`) REFERENCES `admin` (`school_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subject`
--

LOCK TABLES `subject` WRITE;
/*!40000 ALTER TABLE `subject` DISABLE KEYS */;
INSERT INTO `subject` VALUES (7,'Urdu','2024-12-14 11:44:51','9b4ca52d-ba0d-11ef-b6b1-0242ac120002');
/*!40000 ALTER TABLE `subject` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teacher`
--

DROP TABLE IF EXISTS `teacher`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teacher` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `surname` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `address` text NOT NULL,
  `bloodType` varchar(3) NOT NULL,
  `sex` enum('male','female') NOT NULL,
  `birthday` date NOT NULL,
  `createdAt` date NOT NULL,
  `role` enum('teacher') DEFAULT 'teacher',
  `profile` varchar(255) DEFAULT NULL,
  `school_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone` (`phone`),
  KEY `fk_teacher_school_id` (`school_id`),
  CONSTRAINT `fk_teacher_school_id` FOREIGN KEY (`school_id`) REFERENCES `admin` (`school_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teacher`
--

LOCK TABLES `teacher` WRITE;
/*!40000 ALTER TABLE `teacher` DISABLE KEYS */;
INSERT INTO `teacher` VALUES ('807213d9-ba0e-11ef-b6b1-0242ac120002','john_doe','$2b$10$7wSlXhKUBzZKTl9Y6BE67e46aXDWc84.BRHs1m43KcCCOIZJ1NKk6','John','Doe','johndoe04@example.com','+1234567890','123 Main St, Springfield, IL 62701','O+','male','2000-01-01','2024-12-14','teacher','/home/samir-kayamkhani/Desktop/Code/Crm-server/src/controllers/public/profile/1721669701656-1734175738546-278005915.jpg','9b4ca52d-ba0d-11ef-b6b1-0242ac120002');
/*!40000 ALTER TABLE `teacher` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-12-14 17:34:35
