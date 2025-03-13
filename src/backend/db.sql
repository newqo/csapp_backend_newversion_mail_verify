CREATE TABLE if not exists `role` (
  `id_role` int(11) NOT NULL AUTO_INCREMENT,
  `role_description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
INSERT INTO `role` (`role_description`) VALUES
  ('user'),
  ('admin');

CREATE TABLE if not exists `user` (
  `username` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` int(11) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `Isverify` BOOLEAN DEFAULT false,
  `verifyToken` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`username`),
  FOREIGN KEY (`role`) REFERENCES role(`id_role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;