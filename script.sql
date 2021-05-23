SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;


-- --------------------------------------------------------

--
-- Table structure for table `clicks_log`
--

CREATE TABLE `clicks_log` (
  `idCLICKS_LOG` int(11) NOT NULL,
  `browser` varchar(45) DEFAULT NULL,
  `os` varchar(45) DEFAULT NULL,
  `idUrl` int(11) DEFAULT NULL,
  `inserted_at` date NOT NULL DEFAULT '1970-01-01'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `urls`
--

CREATE TABLE `urls` (
  `idURLs` int(11) NOT NULL,
  `url` varchar(255) DEFAULT NULL,
  `urlConverted` varchar(50) DEFAULT NULL,
  `idUser` int(11) DEFAULT NULL,
  `createdAt` date NOT NULL DEFAULT '1970-01-01'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `idUSERS` int(11) NOT NULL,
  `username` varchar(45) DEFAULT NULL,
  `password` varchar(150) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `clicks_log`
--
ALTER TABLE `clicks_log`
  ADD PRIMARY KEY (`idCLICKS_LOG`),
  ADD KEY `idUrl` (`idUrl`);

--
-- Indexes for table `urls`
--
ALTER TABLE `urls`
  ADD PRIMARY KEY (`idURLs`),
  ADD KEY `idUser` (`idUser`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`idUSERS`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `clicks_log`
--
ALTER TABLE `clicks_log`
  MODIFY `idCLICKS_LOG` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=84;
--
-- AUTO_INCREMENT for table `urls`
--
ALTER TABLE `urls`
  MODIFY `idURLs` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;
--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `idUSERS` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `clicks_log`
--
ALTER TABLE `clicks_log`
  ADD CONSTRAINT `clicks_log_ibfk_1` FOREIGN KEY (`idUrl`) REFERENCES `urls` (`idurls`);

--
-- Constraints for table `urls`
--
ALTER TABLE `urls`
  ADD CONSTRAINT `urls_ibfk_1` FOREIGN KEY (`idUser`) REFERENCES `users` (`idusers`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
