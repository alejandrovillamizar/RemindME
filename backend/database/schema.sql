CREATE DATABASE IF NOT EXISTS remindme
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE remindme;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categories (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(80) NOT NULL,
  color CHAR(7) NOT NULL DEFAULT '#8B5CF6',
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_name (name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS reminders (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  category_id BIGINT UNSIGNED NULL,
  title VARCHAR(160) NOT NULL,
  description VARCHAR(2000) NULL,
  due_at DATETIME NULL,
  priority ENUM('Alta', 'Media', 'Baja') NOT NULL DEFAULT 'Media',
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_reminders_user_due (user_id, due_at),
  KEY idx_reminders_user_completed (user_id, completed),
  CONSTRAINT fk_reminders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_reminders_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT IGNORE INTO categories (name, color) VALUES
  ('Personal', '#8B5CF6'),
  ('Trabajo', '#0EA5E9'),
  ('Estudio', '#F59E0B'),
  ('Salud', '#10B981'),
  ('Otros', '#64748B');