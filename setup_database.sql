-- Drop existing databases to start fresh
DROP DATABASE IF EXISTS farming_app;
DROP DATABASE IF EXISTS crop_estimation;

-- Create farming_app database
CREATE DATABASE farming_app;
USE farming_app;

-- Create users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profile_image VARCHAR(255),
    user_type ENUM('regular', 'expert', 'admin') DEFAULT 'regular',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    CONSTRAINT unique_email UNIQUE (email)
);

-- Create password_resets table
CREATE TABLE password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE INDEX (token)
);

-- Create crop_estimation database
CREATE DATABASE crop_estimation;
USE crop_estimation;

-- Create users table in crop_estimation (needed for foreign key constraints)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profile_image VARCHAR(255),
    user_type ENUM('regular', 'expert', 'admin') DEFAULT 'regular',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    CONSTRAINT unique_email UNIQUE (email)
);

-- Create estimates table
CREATE TABLE estimates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    crop_name VARCHAR(255) NOT NULL,
    area FLOAT NOT NULL,
    yield FLOAT NOT NULL,
    total_estimate FLOAT NOT NULL,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create crop_estimates table for advanced crop estimation functionality
CREATE TABLE crop_estimates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    crop_name VARCHAR(50) NOT NULL,
    land_area DECIMAL(10, 2) NOT NULL,
    yield_estimate DECIMAL(10, 2) NOT NULL,
    total_production DECIMAL(10, 2) NOT NULL,
    quality_factor VARCHAR(20) NOT NULL DEFAULT 'Medium',
    confidence_level VARCHAR(20) NOT NULL DEFAULT 'Medium (±20%)',
    date_created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id INT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create community_posts table
CREATE TABLE community_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    topic_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create community_topics table
CREATE TABLE community_topics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    user_id INT NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Switch back to farming_app for pest_reports table
USE farming_app;

-- Create pest_reports table with proper structure including images field
CREATE TABLE pest_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    pest_name VARCHAR(255) NOT NULL,
    category ENUM('insect', 'disease', 'other') NOT NULL,
    date_observed DATE NOT NULL,
    description TEXT NOT NULL,
    affected_crops VARCHAR(255),
    severity ENUM('low', 'medium', 'high') NOT NULL,
    location VARCHAR(255) NOT NULL,
    latitude DOUBLE,
    longitude DOUBLE,
    treatment TEXT,
    images TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create a test user for login testing (password: password123)
USE farming_app;
INSERT INTO users (name, email, password, user_type) 
VALUES ('Test User', 'test@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'regular');

-- Insert sample pest report for testing
INSERT INTO pest_reports (pest_name, category, date_observed, description, affected_crops, severity, location) 
VALUES ('Aphids', 'insect', CURDATE(), 'Small green insects on leaves', 'Tomatoes', 'medium', 'North Field');

-- Add foreign key constraint to estimates table
USE crop_estimation;
ALTER TABLE estimates
ADD CONSTRAINT fk_user_estimate
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL; 