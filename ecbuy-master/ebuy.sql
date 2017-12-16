-- MySQL dump 10.13  Distrib 5.5.49, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: ebuy
-- ------------------------------------------------------
-- Server version	5.5.49-0ubuntu0.14.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Mall`
--

DROP TABLE IF EXISTS `Mall`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Mall` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(20) NOT NULL,
  `Url` varchar(100) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Mall`
--

LOCK TABLES `Mall` WRITE;
/*!40000 ALTER TABLE `Mall` DISABLE KEYS */;
INSERT INTO `Mall` VALUES (1,'天猫','https://www.tmall.com/'),(2,'京东','http://www.jd.com/'),(3,'当当','http://www.dangdang.com/');
/*!40000 ALTER TABLE `Mall` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Order`
--

DROP TABLE IF EXISTS `Order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Order` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Openid` varchar(50) NOT NULL,
  `Time` datetime NOT NULL,
  `MallId` int(11) NOT NULL,
  `Details` varchar(50) DEFAULT NULL,
  `MinPrice` float NOT NULL,
  `MaxPrice` float DEFAULT NULL,
  `CurrPrice` float NOT NULL DEFAULT '0',
  PRIMARY KEY (`Id`),
  KEY `Openid` (`Openid`),
  KEY `MallId` (`MallId`),
  CONSTRAINT `Order_ibfk_1` FOREIGN KEY (`Openid`) REFERENCES `User` (`Openid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Order_ibfk_2` FOREIGN KEY (`MallId`) REFERENCES `Mall` (`Id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Order`
--

LOCK TABLES `Order` WRITE;
/*!40000 ALTER TABLE `Order` DISABLE KEYS */;
/*!40000 ALTER TABLE `Order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Participant`
--

DROP TABLE IF EXISTS `Participant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Participant` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Openid` varchar(50) NOT NULL,
  `OrderId` int(11) NOT NULL,
  `Time` datetime NOT NULL,
  `Price` float NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `Openid` (`Openid`),
  KEY `OrderId` (`OrderId`),
  CONSTRAINT `Participant_ibfk_1` FOREIGN KEY (`Openid`) REFERENCES `User` (`Openid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Participant_ibfk_2` FOREIGN KEY (`OrderId`) REFERENCES `Order` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Participant`
--

LOCK TABLES `Participant` WRITE;
/*!40000 ALTER TABLE `Participant` DISABLE KEYS */;
/*!40000 ALTER TABLE `Participant` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `User` (
  `Openid` varchar(50) NOT NULL,
  `StudentId` varchar(20) NOT NULL,
  `Weixin` varchar(20) NOT NULL,
  `Tel` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`Openid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User`
--

LOCK TABLES `User` WRITE;
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
/*!40000 ALTER TABLE `User` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2016-06-14 14:52:48
