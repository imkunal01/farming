<?php
// Start session if not already started
session_start();

// Database configuration
$host = 'localhost';
$dbname = 'farming_app';
$user = 'root';
$password = '';

// Connect to database
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    response(false, "Database connection failed: " . $e->getMessage());
}

// Check if it's a status check
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'status') {
    // Check if user is logged in
    if (isset($_SESSION['user_id'])) {
        response(true, "User is logged in", ['logged_in' => true]);
    } else {
        response(true, "User is not logged in", ['logged_in' => false]);
    }
}

// Process POST requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the action
    $action = $_POST['action'] ?? '';
    
    switch ($action) {
        case 'login':
            handleLogin();
            break;
        case 'register':
            handleRegistration();
            break;
        case 'reset_password':
            handlePasswordReset();
            break;
        default:
            response(false, "Invalid action");
    }
}

// Handle login
function handleLogin() {
    global $pdo;
    
    // Validate input
    if (!isset($_POST['email']) || !isset($_POST['password'])) {
        response(false, "Email and password are required");
    }
    
    $email = trim($_POST['email']);
    $password = $_POST['password'];
    
    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        response(false, "Invalid email format");
    }
    
    try {
        // Check if user exists
        $stmt = $pdo->prepare("SELECT id, name, email, password, user_type FROM users WHERE email = :email");
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        
        if ($stmt->rowCount() === 0) {
            response(false, "User not found");
        }
        
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Verify password
        if (password_verify($password, $user['password'])) {
            // Update last login
            $updateStmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = :id");
            $updateStmt->bindParam(':id', $user['id']);
            $updateStmt->execute();
            
            // Set session variables
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_name'] = $user['name'];
            $_SESSION['user_email'] = $user['email'];
            $_SESSION['user_type'] = $user['user_type'];
            
            // Return success response
            response(true, "Login successful", [
                'user_id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'user_type' => $user['user_type']
            ]);
        } else {
            response(false, "Invalid password");
        }
    } catch(PDOException $e) {
        response(false, "Login failed: " . $e->getMessage());
    }
}

// Handle registration
function handleRegistration() {
    global $pdo;
    
    // Validate input
    if (!isset($_POST['name']) || !isset($_POST['email']) || !isset($_POST['password']) || 
        !isset($_POST['confirm_password']) || !isset($_POST['user_type'])) {
        response(false, "All fields are required");
    }
    
    $name = trim($_POST['name']);
    $email = trim($_POST['email']);
    $password = $_POST['password'];
    $confirmPassword = $_POST['confirm_password'];
    $userType = $_POST['user_type'];
    
    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        response(false, "Invalid email format");
    }
    
    // Validate password
    if (strlen($password) < 8) {
        response(false, "Password must be at least 8 characters long");
    }
    
    // Check if passwords match
    if ($password !== $confirmPassword) {
        response(false, "Passwords do not match");
    }
    
    // Validate user type
    $allowedUserTypes = ['regular', 'expert', 'admin'];
    if (!in_array($userType, $allowedUserTypes)) {
        response(false, "Invalid user type");
    }
    
    try {
        // Check if email already exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = :email");
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            response(false, "Email already in use");
        }
        
        // Hash password
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        
        // Insert new user
        $stmt = $pdo->prepare("INSERT INTO users (name, email, password, user_type, created_at) VALUES (:name, :email, :password, :user_type, NOW())");
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':password', $hashedPassword);
        $stmt->bindParam(':user_type', $userType);
        $stmt->execute();
        
        $userId = $pdo->lastInsertId();
        
        // Set session variables
        $_SESSION['user_id'] = $userId;
        $_SESSION['user_name'] = $name;
        $_SESSION['user_email'] = $email;
        $_SESSION['user_type'] = $userType;
        
        // Return success response
        response(true, "Registration successful", [
            'user_id' => $userId,
            'name' => $name,
            'email' => $email,
            'user_type' => $userType
        ]);
    } catch(PDOException $e) {
        response(false, "Registration failed: " . $e->getMessage());
    }
}

// Handle password reset
function handlePasswordReset() {
    global $pdo;
    
    // Validate input
    if (!isset($_POST['email'])) {
        response(false, "Email is required");
    }
    
    $email = trim($_POST['email']);
    
    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        response(false, "Invalid email format");
    }
    
    try {
        // Check if user exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = :email");
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        
        if ($stmt->rowCount() === 0) {
            response(false, "Email not found");
        }
        
        // In a real application, you would:
        // 1. Generate a unique token
        // 2. Store it in the database with an expiration time
        // 3. Send an email with a reset link containing the token
        
        // For this example, we'll just pretend we sent an email
        response(true, "Password reset instructions sent to your email");
    } catch(PDOException $e) {
        response(false, "Password reset failed: " . $e->getMessage());
    }
}

// Helper function to send JSON response and exit
function response($success, $message, $data = []) {
    $response = [
        'success' => $success,
        'message' => $message
    ];
    
    if (!empty($data)) {
        $response = array_merge($response, $data);
    }
    
    header('Content-Type: application/json');
    echo json_encode($response);
    exit;
}
?> 