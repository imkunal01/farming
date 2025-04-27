<?php
/**
 * Save Pest Report - Backend API
 * 
 * This file handles saving new pest reports to the database
 */

// Set headers for JSON response
header('Content-Type: application/json');

// Enable CORS (for development only)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode([
        'success' => false,
        'message' => 'Only POST requests are allowed'
    ]);
    exit;
}

// Get JSON data from request body
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Validate required fields
$requiredFields = [
    'reportType', 'pestName', 'cropAffected', 'locationName',
    'locationLat', 'locationLng', 'severity', 'detectionDate'
];

$missingFields = [];
foreach ($requiredFields as $field) {
    if (!isset($data[$field]) || empty($data[$field])) {
        $missingFields[] = $field;
    }
}

if (!empty($missingFields)) {
    http_response_code(400); // Bad Request
    echo json_encode([
        'success' => false,
        'message' => 'Missing required fields',
        'missingFields' => $missingFields
    ]);
    exit;
}

// Database connection parameters
$host = 'localhost';
$dbname = 'farming';
$username = 'root';
$password = '';

try {
    // Connect to database
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Check if pest_reports table exists, create if not
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS pest_reports (
            id VARCHAR(36) PRIMARY KEY,
            report_type VARCHAR(50) NOT NULL,
            pest_name VARCHAR(100) NOT NULL,
            crop_affected VARCHAR(100) NOT NULL,
            location_name VARCHAR(100) NOT NULL,
            location_lat DECIMAL(10, 6) NOT NULL,
            location_lng DECIMAL(10, 6) NOT NULL,
            severity VARCHAR(20) NOT NULL,
            area_affected DECIMAL(10, 2),
            detection_date DATE NOT NULL,
            notes TEXT,
            status VARCHAR(20) DEFAULT 'new',
            report_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    ");
    
    // Generate a unique ID if not provided
    if (!isset($data['id'])) {
        $data['id'] = uniqid('rpt-', true);
    }
    
    // Prepare insert query
    $query = "
        INSERT INTO pest_reports (
            id, report_type, pest_name, crop_affected, location_name,
            location_lat, location_lng, severity, area_affected,
            detection_date, notes, status
        ) VALUES (
            :id, :reportType, :pestName, :cropAffected, :locationName,
            :locationLat, :locationLng, :severity, :areaAffected,
            :detectionDate, :notes, :status
        )
    ";
    
    $stmt = $pdo->prepare($query);
    
    // Bind parameters
    $params = [
        ':id' => $data['id'],
        ':reportType' => $data['reportType'],
        ':pestName' => $data['pestName'],
        ':cropAffected' => $data['cropAffected'],
        ':locationName' => $data['locationName'],
        ':locationLat' => $data['locationLat'],
        ':locationLng' => $data['locationLng'],
        ':severity' => $data['severity'],
        ':areaAffected' => isset($data['areaAffected']) ? $data['areaAffected'] : null,
        ':detectionDate' => $data['detectionDate'],
        ':notes' => isset($data['notes']) ? $data['notes'] : null,
        ':status' => isset($data['status']) ? $data['status'] : 'new'
    ];
    
    // Execute query
    $stmt->execute($params);
    
    // Handle image uploads if included
    $uploadedImages = [];
    if (isset($_FILES['images']) && !empty($_FILES['images']['name'][0])) {
        $uploadDir = 'uploads/';
        
        // Create directory if it doesn't exist
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        
        // Process each uploaded file
        $fileCount = count($_FILES['images']['name']);
        for ($i = 0; $i < $fileCount; $i++) {
            $fileName = $_FILES['images']['name'][$i];
            $tmpName = $_FILES['images']['tmp_name'][$i];
            $fileSize = $_FILES['images']['size'][$i];
            $fileError = $_FILES['images']['error'][$i];
            
            // Skip errors
            if ($fileError !== 0) continue;
            
            // Generate unique filename
            $fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
            $newFileName = $data['id'] . '-' . uniqid() . '.' . $fileExt;
            $destination = $uploadDir . $newFileName;
            
            // Move uploaded file
            if (move_uploaded_file($tmpName, $destination)) {
                $uploadedImages[] = $destination;
                
                // Save image reference to database
                $imageQuery = "
                    INSERT INTO pest_report_images (
                        report_id, image_path, uploaded_at
                    ) VALUES (
                        :reportId, :imagePath, NOW()
                    )
                ";
                
                $imageStmt = $pdo->prepare($imageQuery);
                $imageStmt->execute([
                    ':reportId' => $data['id'],
                    ':imagePath' => $destination
                ]);
            }
        }
    }
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Report saved successfully',
        'reportId' => $data['id'],
        'uploadedImages' => $uploadedImages
    ]);
    
} catch (PDOException $e) {
    // Handle database errors
    http_response_code(500); // Internal Server Error
    echo json_encode([
        'success' => false,
        'message' => 'Database error',
        'error' => $e->getMessage()
    ]);
    
} catch (Exception $e) {
    // Handle other errors
    http_response_code(500); // Internal Server Error
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred',
        'error' => $e->getMessage()
    ]);
}
?> 