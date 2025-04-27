<?php
/**
 * Delete Pest Report - Backend API
 * 
 * This file handles deleting pest reports from the database
 */

// Set headers for JSON response
header('Content-Type: application/json');

// Enable CORS (for development only)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, POST');
header('Access-Control-Allow-Headers: Content-Type');

// Allow both DELETE and POST (with _method=DELETE parameter) for browser compatibility
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST' && isset($_POST['_method']) && $_POST['_method'] === 'DELETE') {
    $method = 'DELETE';
}

if ($method !== 'DELETE') {
    http_response_code(405); // Method Not Allowed
    echo json_encode([
        'success' => false,
        'message' => 'Only DELETE requests are allowed'
    ]);
    exit;
}

// Get report ID from URL parameter or request body
$reportId = '';
if (isset($_GET['id'])) {
    $reportId = $_GET['id'];
} else {
    // Try to get from request body for DELETE requests
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    if (isset($data['id'])) {
        $reportId = $data['id'];
    }
}

if (empty($reportId)) {
    http_response_code(400); // Bad Request
    echo json_encode([
        'success' => false,
        'message' => 'Report ID is required'
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
    
    // Start a transaction to ensure atomicity
    $pdo->beginTransaction();
    
    // First, get the image paths to delete the files
    $imagesQuery = "SELECT image_path FROM pest_report_images WHERE report_id = :reportId";
    $imagesStmt = $pdo->prepare($imagesQuery);
    $imagesStmt->execute([':reportId' => $reportId]);
    $images = $imagesStmt->fetchAll(PDO::FETCH_COLUMN);
    
    // Delete image files
    foreach ($images as $imagePath) {
        if (file_exists($imagePath)) {
            unlink($imagePath);
        }
    }
    
    // Delete image records from database
    $deleteImagesQuery = "DELETE FROM pest_report_images WHERE report_id = :reportId";
    $deleteImagesStmt = $pdo->prepare($deleteImagesQuery);
    $deleteImagesStmt->execute([':reportId' => $reportId]);
    
    // Delete the report
    $deleteReportQuery = "DELETE FROM pest_reports WHERE id = :reportId";
    $deleteReportStmt = $pdo->prepare($deleteReportQuery);
    $deleteReportStmt->execute([':reportId' => $reportId]);
    
    // Check if any rows were affected
    $rowCount = $deleteReportStmt->rowCount();
    
    // Commit the transaction
    $pdo->commit();
    
    if ($rowCount > 0) {
        // Return success response
        echo json_encode([
            'success' => true,
            'message' => 'Report deleted successfully',
            'reportId' => $reportId
        ]);
    } else {
        // Report not found
        http_response_code(404); // Not Found
        echo json_encode([
            'success' => false,
            'message' => 'Report not found',
            'reportId' => $reportId
        ]);
    }
    
} catch (PDOException $e) {
    // Roll back the transaction on error
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    // Handle database errors
    http_response_code(500); // Internal Server Error
    echo json_encode([
        'success' => false,
        'message' => 'Database error',
        'error' => $e->getMessage()
    ]);
    
} catch (Exception $e) {
    // Roll back the transaction on error
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    // Handle other errors
    http_response_code(500); // Internal Server Error
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred',
        'error' => $e->getMessage()
    ]);
}
?> 