CREATE TABLE estimates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    crop_name VARCHAR(255) NOT NULL,
    area FLOAT NOT NULL,
    yield FLOAT NOT NULL,
    total_estimate FLOAT NOT NULL,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    user_id INT
);

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

CREATE TABLE community_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    topic_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

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
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    treatment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Add foreign key constraint to estimates table
ALTER TABLE estimates
ADD CONSTRAINT fk_user_estimate
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
