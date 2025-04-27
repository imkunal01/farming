<?php
/**
 * Get Pest Reports - Backend API
 * 
 * This file handles fetching pest reports from the database
 */

// Set headers for JSON response
header('Content-Type: application/json');

// Enable CORS (for development only)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405); // Method Not Allowed
    echo json_encode([
        'success' => false,
        'message' => 'Only GET requests are allowed'
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
    
    // Build query with optional filters
    $query = "
        SELECT 
            pr.*,
            GROUP_CONCAT(pri.image_path) as images
        FROM 
            pest_reports pr
        LEFT JOIN 
            pest_report_images pri ON pr.id = pri.report_id
    ";
    
    // Initialize arrays for WHERE clauses and parameters
    $whereClauses = [];
    $params = [];
    
    // Apply filters if present
    if (isset($_GET['report_type']) && !empty($_GET['report_type'])) {
        $whereClauses[] = "pr.report_type = :reportType";
        $params[':reportType'] = $_GET['report_type'];
    }
    
    if (isset($_GET['crop']) && !empty($_GET['crop'])) {
        $whereClauses[] = "pr.crop_affected LIKE :crop";
        $params[':crop'] = '%' . $_GET['crop'] . '%';
    }
    
    if (isset($_GET['severity']) && !empty($_GET['severity'])) {
        $whereClauses[] = "pr.severity = :severity";
        $params[':severity'] = $_GET['severity'];
    }
    
    if (isset($_GET['status']) && !empty($_GET['status'])) {
        $whereClauses[] = "pr.status = :status";
        $params[':status'] = $_GET['status'];
    }
    
    // Date range filter
    if (isset($_GET['start_date']) && !empty($_GET['start_date'])) {
        $whereClauses[] = "pr.detection_date >= :startDate";
        $params[':startDate'] = $_GET['start_date'];
    }
    
    if (isset($_GET['end_date']) && !empty($_GET['end_date'])) {
        $whereClauses[] = "pr.detection_date <= :endDate";
        $params[':endDate'] = $_GET['end_date'];
    }
    
    // Search term across multiple fields
    if (isset($_GET['search']) && !empty($_GET['search'])) {
        $whereClauses[] = "(
            pr.pest_name LIKE :search OR 
            pr.crop_affected LIKE :search OR 
            pr.location_name LIKE :search OR 
            pr.notes LIKE :search
        )";
        $params[':search'] = '%' . $_GET['search'] . '%';
    }
    
    // Add WHERE clause if any filters are applied
    if (!empty($whereClauses)) {
        $query .= " WHERE " . implode(" AND ", $whereClauses);
    }
    
    // Group by to handle the GROUP_CONCAT in the SELECT
    $query .= " GROUP BY pr.id";
    
    // Add sorting
    $validSortColumns = ['detection_date', 'report_date', 'severity', 'status'];
    $sortColumn = isset($_GET['sort']) && in_array($_GET['sort'], $validSortColumns) 
        ? $_GET['sort'] 
        : 'detection_date';
    
    $sortDirection = isset($_GET['direction']) && strtolower($_GET['direction']) === 'asc' 
        ? 'ASC' 
        : 'DESC';
    
    $query .= " ORDER BY pr.$sortColumn $sortDirection";
    
    // Add pagination
    $page = isset($_GET['page']) && is_numeric($_GET['page']) ? intval($_GET['page']) : 1;
    $limit = isset($_GET['limit']) && is_numeric($_GET['limit']) ? intval($_GET['limit']) : 10;
    $offset = ($page - 1) * $limit;
    
    $query .= " LIMIT :limit OFFSET :offset";
    $params[':limit'] = $limit;
    $params[':offset'] = $offset;
    
    // Prepare and execute the query
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    
    // Fetch results
    $reports = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Process image paths into an array
        if (!empty($row['images'])) {
            $row['images'] = explode(',', $row['images']);
        } else {
            $row['images'] = [];
        }
        
        // Format date fields for consistency
        $row['detection_date'] = date('Y-m-d', strtotime($row['detection_date']));
        $row['report_date'] = date('Y-m-d H:i:s', strtotime($row['report_date']));
        
        // Convert numeric string fields to appropriate types
        $row['location_lat'] = floatval($row['location_lat']);
        $row['location_lng'] = floatval($row['location_lng']);
        if (isset($row['area_affected'])) {
            $row['area_affected'] = floatval($row['area_affected']);
        }
        
        $reports[] = $row;
    }
    
    // Get total count for pagination
    $countQuery = "SELECT COUNT(*) FROM pest_reports";
    if (!empty($whereClauses)) {
        $countQuery .= " WHERE " . implode(" AND ", $whereClauses);
    }
    
    $countStmt = $pdo->prepare($countQuery);
    
    // Remove limit and offset params from count query
    $countParams = $params;
    unset($countParams[':limit']);
    unset($countParams[':offset']);
    
    $countStmt->execute($countParams);
    $totalCount = $countStmt->fetchColumn();
    
    // Calculate pagination info
    $totalPages = ceil($totalCount / $limit);
    
    // Return success response
    echo json_encode([
        'success' => true,
        'data' => $reports,
        'pagination' => [
            'total' => $totalCount,
            'per_page' => $limit,
            'current_page' => $page,
            'last_page' => $totalPages
        ]
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