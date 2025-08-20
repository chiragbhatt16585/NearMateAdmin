-- MySQL dump 10.13  Distrib 9.4.0, for macos15.4 (arm64)
--
-- Host: 127.0.0.1    Database: nearmateadmin
-- ------------------------------------------------------
-- Server version	8.0.43

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
-- Table structure for table `AuditLog`
--

DROP TABLE IF EXISTS `AuditLog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `AuditLog` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `actorId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entityType` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entityId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `metadata` json DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `AuditLog`
--

LOCK TABLES `AuditLog` WRITE;
/*!40000 ALTER TABLE `AuditLog` DISABLE KEYS */;
/*!40000 ALTER TABLE `AuditLog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Booking`
--

DROP TABLE IF EXISTS `Booking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Booking` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `providerId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `categoryId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `scheduledFor` datetime(3) DEFAULT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'requested',
  `address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lat` double DEFAULT NULL,
  `lng` double DEFAULT NULL,
  `priceQuoted` int DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Booking_userId_fkey` (`userId`),
  KEY `Booking_providerId_fkey` (`providerId`),
  KEY `Booking_categoryId_fkey` (`categoryId`),
  CONSTRAINT `Booking_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `ServiceCategory` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Booking_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `ServiceProvider` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Booking_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Booking`
--

LOCK TABLES `Booking` WRITE;
/*!40000 ALTER TABLE `Booking` DISABLE KEYS */;
/*!40000 ALTER TABLE `Booking` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Boost`
--

DROP TABLE IF EXISTS `Boost`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Boost` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `providerId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `startAt` datetime(3) NOT NULL,
  `endAt` datetime(3) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `Boost_providerId_fkey` (`providerId`),
  CONSTRAINT `Boost_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `ServiceProvider` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Boost`
--

LOCK TABLES `Boost` WRITE;
/*!40000 ALTER TABLE `Boost` DISABLE KEYS */;
/*!40000 ALTER TABLE `Boost` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ChatMessage`
--

DROP TABLE IF EXISTS `ChatMessage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ChatMessage` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bookingId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `senderUserId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `ChatMessage_bookingId_fkey` (`bookingId`),
  CONSTRAINT `ChatMessage_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ChatMessage`
--

LOCK TABLES `ChatMessage` WRITE;
/*!40000 ALTER TABLE `ChatMessage` DISABLE KEYS */;
/*!40000 ALTER TABLE `ChatMessage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Item`
--

DROP TABLE IF EXISTS `Item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Item` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Item`
--

LOCK TABLES `Item` WRITE;
/*!40000 ALTER TABLE `Item` DISABLE KEYS */;
/*!40000 ALTER TABLE `Item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Partner`
--

DROP TABLE IF EXISTS `Partner`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Partner` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `loginId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Partner_phone_key` (`phone`),
  UNIQUE KEY `Partner_email_key` (`email`),
  UNIQUE KEY `loginId` (`loginId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Partner`
--

LOCK TABLES `Partner` WRITE;
/*!40000 ALTER TABLE `Partner` DISABLE KEYS */;
INSERT INTO `Partner` VALUES ('1a44b107-9de0-4b36-a422-0e564f386cfe','John Doe','9990001111','john@example.com','active','2025-08-19 13:50:12.704','2025-08-19 13:51:28.540','JD000001'),('618c60d3-f337-4264-926c-534eb613e77a','Jane Roe','9990002222','jane@example.com','active','2025-08-19 13:50:12.725','2025-08-19 13:51:23.847','JR000001'),('9b049d31-0698-417e-b66c-65f7647019d2','Chirag Bhatt','9930793707','chiragbhatt16585@gmail.com','active','2025-08-19 13:51:47.945','2025-08-19 13:51:47.945',NULL),('fea3c3f2-3b66-4ae1-b24a-b60b470ee41c','Jenis Bhatt','80063309','jenisbhatt3990@gmail.com','active','2025-08-19 14:05:25.639','2025-08-19 14:05:25.639',NULL);
/*!40000 ALTER TABLE `Partner` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PartnerBank`
--

DROP TABLE IF EXISTS `PartnerBank`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PartnerBank` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `partnerId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `accountName` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `accountNo` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ifsc` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bankName` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `PartnerBank_partnerId_key` (`partnerId`),
  CONSTRAINT `PartnerBank_partnerId_fkey` FOREIGN KEY (`partnerId`) REFERENCES `Partner` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PartnerBank`
--

LOCK TABLES `PartnerBank` WRITE;
/*!40000 ALTER TABLE `PartnerBank` DISABLE KEYS */;
INSERT INTO `PartnerBank` VALUES ('02643418-8d12-443c-930f-46eea5044ebc','1a44b107-9de0-4b36-a422-0e564f386cfe','John Doe','1234567890','HDFC0001234','HDFC Bank','2025-08-19 13:50:12.720','2025-08-19 13:50:12.720'),('9a9523bd-b872-42b6-b234-fcf554de13e0','618c60d3-f337-4264-926c-534eb613e77a','Jane Roe','9876543210','SBIN0005678','State Bank of India','2025-08-19 13:50:12.731','2025-08-19 13:50:12.731');
/*!40000 ALTER TABLE `PartnerBank` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PartnerCategory`
--

DROP TABLE IF EXISTS `PartnerCategory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PartnerCategory` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `partnerId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `serviceCategoryId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `PartnerCategory_partnerId_fkey` (`partnerId`),
  KEY `PartnerCategory_serviceCategoryId_fkey` (`serviceCategoryId`),
  CONSTRAINT `PartnerCategory_partnerId_fkey` FOREIGN KEY (`partnerId`) REFERENCES `Partner` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `PartnerCategory_serviceCategoryId_fkey` FOREIGN KEY (`serviceCategoryId`) REFERENCES `ServiceCategory` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PartnerCategory`
--

LOCK TABLES `PartnerCategory` WRITE;
/*!40000 ALTER TABLE `PartnerCategory` DISABLE KEYS */;
INSERT INTO `PartnerCategory` VALUES ('0c66a67e-4de9-41f4-aebd-6f35b4f80fca','fea3c3f2-3b66-4ae1-b24a-b60b470ee41c','6cd23159-7d03-11f0-9cdd-0ea6e67bf632'),('95b4bc91-42a2-4297-b516-e61dd0d2aedc','618c60d3-f337-4264-926c-534eb613e77a','6cd21805-7d03-11f0-9cdd-0ea6e67bf632'),('cd9df48b-3913-4397-bfc3-17e4ca67071e','618c60d3-f337-4264-926c-534eb613e77a','6cd225a5-7d03-11f0-9cdd-0ea6e67bf632'),('d054520d-db57-48ac-a05d-61f26757d905','1a44b107-9de0-4b36-a422-0e564f386cfe','6cd220a7-7d03-11f0-9cdd-0ea6e67bf632'),('fdd2d9b5-3d17-42f7-aec0-70adfc2bbb36','9b049d31-0698-417e-b66c-65f7647019d2','6cd22d50-7d03-11f0-9cdd-0ea6e67bf632');
/*!40000 ALTER TABLE `PartnerCategory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PartnerKyc`
--

DROP TABLE IF EXISTS `PartnerKyc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PartnerKyc` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `partnerId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `idType` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `idNumber` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `PartnerKyc_partnerId_key` (`partnerId`),
  CONSTRAINT `PartnerKyc_partnerId_fkey` FOREIGN KEY (`partnerId`) REFERENCES `Partner` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PartnerKyc`
--

LOCK TABLES `PartnerKyc` WRITE;
/*!40000 ALTER TABLE `PartnerKyc` DISABLE KEYS */;
INSERT INTO `PartnerKyc` VALUES ('062eaa9d-2097-4c95-9503-de29febfdc17','1a44b107-9de0-4b36-a422-0e564f386cfe','Aadhar Card','XXXXXXXXX','verified','2025-08-19 13:50:12.714','2025-08-19 13:50:12.714'),('f1b9cd4e-b584-4240-8ede-e26d5d9c7c89','618c60d3-f337-4264-926c-534eb613e77a','Pan Card','XXXXXXX','pending','2025-08-19 13:50:12.728','2025-08-19 13:50:12.728');
/*!40000 ALTER TABLE `PartnerKyc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Payment`
--

DROP TABLE IF EXISTS `Payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Payment` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bookingId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` int NOT NULL,
  `currency` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'INR',
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `providerRef` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Payment_bookingId_key` (`bookingId`),
  CONSTRAINT `Payment_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Payment`
--

LOCK TABLES `Payment` WRITE;
/*!40000 ALTER TABLE `Payment` DISABLE KEYS */;
/*!40000 ALTER TABLE `Payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ProviderService`
--

DROP TABLE IF EXISTS `ProviderService`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ProviderService` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `providerId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `categoryId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `priceMin` int DEFAULT NULL,
  `priceMax` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ProviderService_providerId_fkey` (`providerId`),
  KEY `ProviderService_categoryId_fkey` (`categoryId`),
  CONSTRAINT `ProviderService_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `ServiceCategory` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `ProviderService_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `ServiceProvider` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ProviderService`
--

LOCK TABLES `ProviderService` WRITE;
/*!40000 ALTER TABLE `ProviderService` DISABLE KEYS */;
/*!40000 ALTER TABLE `ProviderService` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `RefreshToken`
--

DROP TABLE IF EXISTS `RefreshToken`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `RefreshToken` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hashedToken` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userAgent` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `revokedAt` datetime(3) DEFAULT NULL,
  `expiresAt` datetime(3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `RefreshToken_userId_fkey` (`userId`),
  CONSTRAINT `RefreshToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `RefreshToken`
--

LOCK TABLES `RefreshToken` WRITE;
/*!40000 ALTER TABLE `RefreshToken` DISABLE KEYS */;
/*!40000 ALTER TABLE `RefreshToken` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Review`
--

DROP TABLE IF EXISTS `Review`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Review` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bookingId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` int NOT NULL,
  `comment` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Review_bookingId_key` (`bookingId`),
  CONSTRAINT `Review_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Review`
--

LOCK TABLES `Review` WRITE;
/*!40000 ALTER TABLE `Review` DISABLE KEYS */;
/*!40000 ALTER TABLE `Review` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ServiceCategory`
--

DROP TABLE IF EXISTS `ServiceCategory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ServiceCategory` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `key` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `popular` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ServiceCategory_key_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ServiceCategory`
--

LOCK TABLES `ServiceCategory` WRITE;
/*!40000 ALTER TABLE `ServiceCategory` DISABLE KEYS */;
INSERT INTO `ServiceCategory` VALUES ('6cd1ed55-7d03-11f0-9cdd-0ea6e67bf632','plumber','Plumber','🛠️','#E9EEF9',0,'2025-08-19 13:50:11.255','2025-08-19 13:50:11.255'),('6cd21805-7d03-11f0-9cdd-0ea6e67bf632','electrician','Electrician','🔌','#F4ECF7',0,'2025-08-19 13:50:11.255','2025-08-19 13:50:11.255'),('6cd220a7-7d03-11f0-9cdd-0ea6e67bf632','carpenter','Carpenter','🪚','#F0F5F2',0,'2025-08-19 13:50:11.255','2025-08-19 13:50:11.255'),('6cd225a5-7d03-11f0-9cdd-0ea6e67bf632','ac','AC Repair','❄️','#ECF6FB',0,'2025-08-19 13:50:11.255','2025-08-19 13:50:11.255'),('6cd22c03-7d03-11f0-9cdd-0ea6e67bf632','salon','Salon at Home','💇‍♀️','#FEF3F2',0,'2025-08-19 13:50:11.255','2025-08-19 13:50:11.255'),('6cd22d50-7d03-11f0-9cdd-0ea6e67bf632','tutor','Tutor','📚','#F8F1E7',0,'2025-08-19 13:50:11.255','2025-08-19 13:50:11.255'),('6cd22eb6-7d03-11f0-9cdd-0ea6e67bf632','cleaning','Cleaning','🧹','#F3F6EE',0,'2025-08-19 13:50:11.255','2025-08-19 13:50:11.255'),('6cd23016-7d03-11f0-9cdd-0ea6e67bf632','pest','Pest Control','🐜','#FDF6E7',0,'2025-08-19 13:50:11.255','2025-08-19 13:50:11.255'),('6cd23159-7d03-11f0-9cdd-0ea6e67bf632','painting','Painting','🎨','#EAF7F3',0,'2025-08-19 13:50:11.255','2025-08-19 13:50:11.255'),('6cd23296-7d03-11f0-9cdd-0ea6e67bf632','appliances','Appliance Repair','🧺','#F0F0FF',0,'2025-08-19 13:50:11.255','2025-08-19 13:50:11.255'),('6cd233e6-7d03-11f0-9cdd-0ea6e67bf632','moving','Packers & Movers','📦','#FFF0F0',0,'2025-08-19 13:50:11.255','2025-08-19 13:50:11.255'),('6cd2353c-7d03-11f0-9cdd-0ea6e67bf632','gardening','Gardening','🌿','#EAF6EA',0,'2025-08-19 13:50:11.255','2025-08-19 13:50:11.255'),('6cd23668-7d03-11f0-9cdd-0ea6e67bf632','carwash','Car Wash','🚗','#EAF3FB',0,'2025-08-19 13:50:11.255','2025-08-19 13:50:11.255'),('6cd237b2-7d03-11f0-9cdd-0ea6e67bf632','laptop','Laptop Repair','💻','#F2F2F2',0,'2025-08-19 13:50:11.255','2025-08-19 13:50:11.255');
/*!40000 ALTER TABLE `ServiceCategory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ServiceProvider`
--

DROP TABLE IF EXISTS `ServiceProvider`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ServiceProvider` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `displayName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bio` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ratingAvg` double NOT NULL DEFAULT '0',
  `ratingCount` int NOT NULL DEFAULT '0',
  `isVerified` tinyint(1) NOT NULL DEFAULT '0',
  `serviceRadiusKm` double NOT NULL DEFAULT '5',
  `lat` double DEFAULT NULL,
  `lng` double DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ServiceProvider_userId_key` (`userId`),
  CONSTRAINT `ServiceProvider_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ServiceProvider`
--

LOCK TABLES `ServiceProvider` WRITE;
/*!40000 ALTER TABLE `ServiceProvider` DISABLE KEYS */;
/*!40000 ALTER TABLE `ServiceProvider` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Subscription`
--

DROP TABLE IF EXISTS `Subscription`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Subscription` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `providerId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `plan` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `expiresAt` datetime(3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Subscription_providerId_fkey` (`providerId`),
  CONSTRAINT `Subscription_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `ServiceProvider` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Subscription`
--

LOCK TABLES `Subscription` WRITE;
/*!40000 ALTER TABLE `Subscription` DISABLE KEYS */;
/*!40000 ALTER TABLE `Subscription` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `User` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hashedPassword` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'admin',
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User`
--

LOCK TABLES `User` WRITE;
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
INSERT INTO `User` VALUES ('db4121a6-707b-4289-83d9-5df53886a00a','admin@nearmate.local','Administrator','$2b$10$2YomOn8P10qmUbIeilbVB.1DPjDWHXL22wNe6vYhhktRDc7wp6Au6','admin','active','2025-08-19 13:50:12.690','2025-08-19 13:50:12.690');
/*!40000 ALTER TABLE `User` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `UserProfile`
--

DROP TABLE IF EXISTS `UserProfile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `UserProfile` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lat` double DEFAULT NULL,
  `lng` double DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UserProfile_userId_key` (`userId`),
  CONSTRAINT `UserProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `UserProfile`
--

LOCK TABLES `UserProfile` WRITE;
/*!40000 ALTER TABLE `UserProfile` DISABLE KEYS */;
/*!40000 ALTER TABLE `UserProfile` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-19 19:39:54
