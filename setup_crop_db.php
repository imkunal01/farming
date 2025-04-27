<?php
// Database connection details
$servername = "localhost";
$username = "root";
$password = "";

// Create connection
$conn = new mysqli($servername, $username, $password);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "<h2>Setting up crop estimation database...</h2>";

// Create database
$sql = "CREATE DATABASE IF NOT EXISTS crop_estimation";
if ($conn->query($sql) === TRUE) {
    echo "<p>Database created successfully or already exists</p>";
} else {
    echo "<p>Error creating database: " . $conn->error . "</p>";
}

// Select database
$conn->select_db("crop_estimation");

// Create tables
$sql = "
CREATE TABLE IF NOT EXISTS crop_estimates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    crop_name VARCHAR(50) NOT NULL,
    land_area DECIMAL(10, 2) NOT NULL,
    yield_estimate DECIMAL(10, 2) NOT NULL,
    total_production DECIMAL(10, 2) NOT NULL,
    quality_factor VARCHAR(20) NOT NULL DEFAULT 'Medium',
    confidence_level VARCHAR(20) NOT NULL DEFAULT 'Medium (±20%)',
    date_created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id INT NULL
);

CREATE TABLE IF NOT EXISTS estimates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    crop_name VARCHAR(100) NOT NULL,
    area DECIMAL(10, 2) NOT NULL,
    yield DECIMAL(10, 2) NOT NULL,
    total_estimate DECIMAL(10, 2) NOT NULL,
    latitude DECIMAL(10, 6) NULL,
    longitude DECIMAL(10, 6) NULL,
    date_created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
";

// Execute multi-query
if ($conn->multi_query($sql)) {
    echo "<p>Tables created successfully</p>";
    
    // Clear results
    while ($conn->more_results() && $conn->next_result()) {
        // Needed to free up connection for next query
        $dummyResult = $conn->use_result();
        if ($dummyResult) {
            $dummyResult->close();
        }
    }
} else {
    echo "<p>Error creating tables: " . $conn->error . "</p>";
}

echo "<p><a href='saved_estimates.php'>Go to Saved Estimates</a></p>";

// Close connection
$conn->close();
?> 