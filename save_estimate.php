<?php
// Set headers for JSON response
header('Content-Type: application/json');

// Allow Cross-Origin Resource Sharing (CORS)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// If it's a preflight OPTIONS request, just return
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Only POST requests are allowed']);
    exit();
}

try {
    // Get JSON data from request body
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    // Validate data
    if (!$data || !isset($data['crop']) || !isset($data['area']) || !isset($data['yield']) || !isset($data['total'])) {
        echo json_encode(['success' => false, 'message' => 'Invalid data received']);
        exit();
    }
    
    // Database connection details
    $servername = "localhost";
    $username = "root";
    $password = "";
    $dbname = "crop_estimation";
    
    // Create connection
    $conn = new mysqli($servername, $username, $password, $dbname);
    
    // Check connection
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    // Prepare and bind the SQL statement
    $stmt = $conn->prepare("INSERT INTO crop_estimates (crop_name, land_area, yield_estimate, total_production, quality_factor, confidence_level, date_created) VALUES (?, ?, ?, ?, ?, ?, NOW())");
    $stmt->bind_param("sddsss", $crop, $area, $yield, $total, $quality, $confidence);
    
    // Set parameters and execute
    $crop = $data['crop'];
    $area = floatval($data['area']);
    $yield = floatval($data['yield']);
    $total = floatval($data['total']);
    $quality = $data['quality'] ?? 'Medium';
    $confidence = $data['confidence'] ?? 'Medium (±20%)';
    
    $stmt->execute();
    
    // If successful, return success response
    if ($stmt->affected_rows > 0) {
        echo json_encode(['success' => true, 'message' => 'Estimate saved successfully', 'id' => $conn->insert_id]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to save estimate']);
    }
    
    $stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?> 