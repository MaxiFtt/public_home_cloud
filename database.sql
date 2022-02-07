DROP DATABASE IF EXISTS GAuth_files;
CREATE DATABASE GAuth_files;
USE GAuth_files;
SET NAMES utf8;
CREATE TABLE users (
	google_id VARCHAR(25) NOT NULL,
	name VARCHAR(50) NOT NULL,
	email VARCHAR(60) NOT NULL,
	email_verified VARCHAR(5) NOT NULL,
	PRIMARY KEY(google_id)
) ENGINE = InnoDB;

CREATE TABLE folders (
	id INT(11) NOT NULL AUTO_INCREMENT,
	owner VARCHAR(25),
	folder_name VARCHAR(40) NOT NULL,
	folder_type VARCHAR(40) NOT NULL DEFAULT "child", /*root, child*/
	contained_by INT(11),
	PRIMARY KEY(id),
	CONSTRAINT fk_folders_contained_by FOREIGN KEY(contained_by) REFERENCES  folders(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE TABLE files (
	id INT(11) NOT NULL AUTO_INCREMENT,
	owner VARCHAR(25),
	file_name VARCHAR(150) NOT NULL,
	path_name VARCHAR(180) NOT NULL,
	file_type VARCHAR(100) NOT NULL,
	public BOOL NOT NULL,
	contained_by INT(11),
	PRIMARY KEY(id),
	CONSTRAINT fk_user_id FOREIGN KEY(owner) REFERENCES users(google_id) ON DELETE RESTRICT ON UPDATE CASCADE,
	CONSTRAINT fk_files_contained_by FOREIGN KEY(contained_by) REFERENCES folders(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB;

