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

// Handle request types
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    
    switch ($action) {
        case 'request_reset':
            handleResetRequest();
            break;
        case 'verify_token':
            verifyToken();
            break;
        case 'update_password':
            updatePassword();
            break;
        default:
            response(false, "Invalid action");
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['token'])) {
    // Show password reset form based on token
    $token = $_GET['token'];
    
    // DEBUG: If token debug parameter is set, show token info
    if (isset($_GET['debug']) && $_GET['debug'] == '1') {
        debugToken($token);
        exit;
    }
    
    if (validateToken($token)) {
        // Valid token, redirect to reset form
        header('Location: reset_form.html?token=' . $token);
        exit;
    } else {
        echo "Invalid or expired token. Please request a new password reset.";
        exit;
    }
}

// Handle password reset request
function handleResetRequest() {
    global $pdo;
    
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
            // For security, don't reveal that the email doesn't exist
            response(true, "If your email is in our system, you will receive a password reset link");
        }
        
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        $userId = $user['id'];
        
        // Generate a reset token
        $token = bin2hex(random_bytes(16));
        $expires = date('Y-m-d H:i:s', strtotime('+24 hours'));
        
        // Check if a reset token already exists for this user
        $stmt = $pdo->prepare("SELECT id FROM password_resets WHERE user_id = :user_id");
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            // Update existing token
            $stmt = $pdo->prepare("UPDATE password_resets SET token = :token, expires_at = :expires_at, updated_at = NOW() WHERE user_id = :user_id");
        } else {
            // Insert new token
            $stmt = $pdo->prepare("INSERT INTO password_resets (user_id, token, expires_at, created_at, updated_at) VALUES (:user_id, :token, :expires_at, NOW(), NOW())");
        }
        
        $stmt->bindParam(':user_id', $userId);
        $stmt->bindParam(':token', $token);
        $stmt->bindParam(':expires_at', $expires);
        $stmt->execute();
        
        // Create reset link with proper path for the application
        $resetLink = "http://" . $_SERVER['HTTP_HOST'] . "/classProjects/farming/reset_password.php?token=" . $token;
        
        // Send email via Brevo
        $emailSent = sendResetEmail($email, $resetLink);
        
        if ($emailSent) {
            // For production - uncomment this and remove the next line
            // response(true, "Password reset link has been sent to your email");
            
            // For development - shows link for testing
            response(true, "Password reset link has been sent to your email", ['reset_link' => $resetLink]);
        } else {
            response(false, "Failed to send email. Please try again later.");
        }
        
    } catch(PDOException $e) {
        response(false, "Password reset request failed: " . $e->getMessage());
    }
}

// Send reset email using Brevo
function sendResetEmail($email, $resetLink) {
    try {
        // Load Brevo configuration
        $config = include 'brevo_config.php';
        
        // Check if config loaded properly
        if (!isset($config['api_key']) || $config['api_key'] === 'YOUR_BREVO_API_KEY') {
            error_log('Brevo configuration not set up properly');
            return false;
        }
        
        // Log the sender email being used
        error_log('Using sender email: ' . $config['sender_email']);
        
        // Prepare email content
        $html_content = '
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                <h2 style="color: #27ae60;">Reset Your Password</h2>
                <p>You recently requested to reset your password. Click the button below to reset it:</p>
                <div style="text-align: center; margin: 25px 0;">
                    <a href="' . $resetLink . '" style="background-color: #27ae60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
                </div>
                <p>If you did not request a password reset, please ignore this email.</p>
                <p>This link will expire in 24 hours for security reasons.</p>
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                <p style="font-size: 12px; color: #666;">AgriGlance - Crop Monitoring System</p>
            </div>
        ';
        
        // Prepare API request data
        $data = [
            'sender' => [
                'name' => $config['sender_name'],
                'email' => $config['sender_email']
            ],
            'to' => [
                [
                    'email' => $email
                ]
            ],
            'subject' => 'Reset Your Password - AgriGlance',
            'htmlContent' => $html_content
        ];
        
        // Log the email details
        error_log('Sending reset email to: ' . $email);
        
        // Check if curl is available
        if (!function_exists('curl_init')) {
            error_log('cURL is not available. Please enable the cURL extension in PHP.');
            return false;
        }
        
        // Send request to Brevo API
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://api.sendinblue.com/v3/smtp/email');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        
        $headers = [
            'Accept: application/json',
            'Content-Type: application/json',
            'api-key: ' . $config['api_key']
        ];
        
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        
        // Check for curl errors
        if (curl_errno($ch)) {
            error_log('Curl error: ' . curl_error($ch));
            curl_close($ch);
            return false;
        }
        
        curl_close($ch);
        
        // Check response
        if ($httpCode >= 200 && $httpCode < 300) {
            $responseData = json_decode($response, true);
            if (isset($responseData['messageId'])) {
                error_log('Email sent successfully. Message ID: ' . $responseData['messageId']);
            }
            return true;
        } else {
            error_log('Brevo API error (' . $httpCode . '): ' . $response);
            return false;
        }
    } catch (Exception $e) {
        error_log('Error sending email: ' . $e->getMessage());
        return false;
    }
}

// Verify reset token
function verifyToken() {
    global $pdo;
    
    if (!isset($_POST['token'])) {
        response(false, "Token is required");
    }
    
    $token = $_POST['token'];
    
    if (validateToken($token)) {
        response(true, "Token is valid");
    } else {
        response(false, "Invalid or expired token");
    }
}

// Update password
function updatePassword() {
    global $pdo;
    
    if (!isset($_POST['token']) || !isset($_POST['password']) || !isset($_POST['confirm_password'])) {
        response(false, "Token and new password are required");
    }
    
    $token = $_POST['token'];
    $password = $_POST['password'];
    $confirmPassword = $_POST['confirm_password'];
    
    // Validate password
    if (strlen($password) < 8) {
        response(false, "Password must be at least 8 characters long");
    }
    
    if ($password !== $confirmPassword) {
        response(false, "Passwords do not match");
    }
    
    try {
        // Get user ID from token
        $stmt = $pdo->prepare("SELECT user_id FROM password_resets WHERE token = :token AND expires_at > NOW()");
        $stmt->bindParam(':token', $token);
        $stmt->execute();
        
        if ($stmt->rowCount() === 0) {
            response(false, "Invalid or expired token");
        }
        
        $resetData = $stmt->fetch(PDO::FETCH_ASSOC);
        $userId = $resetData['user_id'];
        
        // Hash new password
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        
        // Update user's password
        $stmt = $pdo->prepare("UPDATE users SET password = :password WHERE id = :id");
        $stmt->bindParam(':password', $hashedPassword);
        $stmt->bindParam(':id', $userId);
        $stmt->execute();
        
        // Delete used token
        $stmt = $pdo->prepare("DELETE FROM password_resets WHERE token = :token");
        $stmt->bindParam(':token', $token);
        $stmt->execute();
        
        response(true, "Password has been updated successfully");
    } catch(PDOException $e) {
        response(false, "Password update failed: " . $e->getMessage());
    }
}

// Validate if token exists and is not expired
function validateToken($token) {
    global $pdo;
    
    try {
        // First, log the token for debugging
        error_log("Validating token: " . substr($token, 0, 10) . "...");
        
        $stmt = $pdo->prepare("SELECT id, expires_at FROM password_resets WHERE token = :token");
        $stmt->bindParam(':token', $token);
        $stmt->execute();
        
        if ($stmt->rowCount() == 0) {
            error_log("Token not found in database");
            return false;
        }
        
        $reset = $stmt->fetch(PDO::FETCH_ASSOC);
        $expiry = strtotime($reset['expires_at']);
        $now = time();
        
        if ($now > $expiry) {
            error_log("Token expired. Expiry: " . date('Y-m-d H:i:s', $expiry) . ", Now: " . date('Y-m-d H:i:s', $now));
            return false;
        }
        
        return true;
    } catch(PDOException $e) {
        error_log("Database error in validateToken: " . $e->getMessage());
        return false;
    }
}

// Debug function to display token information
function debugToken($token) {
    global $pdo;
    
    echo "<h2>Token Debug Information</h2>";
    echo "<p>Token: " . htmlspecialchars($token) . "</p>";
    
    try {
        // Check if token exists in database
        $stmt = $pdo->prepare("SELECT * FROM password_resets WHERE token = :token");
        $stmt->bindParam(':token', $token);
        $stmt->execute();
        
        if ($stmt->rowCount() == 0) {
            echo "<p style='color:red;'>ERROR: Token not found in database</p>";
            // Show all tokens in database for comparison
            $allTokens = $pdo->query("SELECT id, user_id, token, expires_at FROM password_resets ORDER BY created_at DESC LIMIT 5");
            echo "<p>Recent tokens in database:</p>";
            echo "<ul>";
            while ($row = $allTokens->fetch(PDO::FETCH_ASSOC)) {
                echo "<li>ID: " . $row['id'] . ", User: " . $row['user_id'] . 
                     ", Token: " . substr($row['token'], 0, 10) . "..., " .
                     "Expires: " . $row['expires_at'] . "</li>";
            }
            echo "</ul>";
        } else {
            $resetData = $stmt->fetch(PDO::FETCH_ASSOC);
            echo "<p style='color:green;'>Token found in database</p>";
            echo "<ul>";
            echo "<li>ID: " . $resetData['id'] . "</li>";
            echo "<li>User ID: " . $resetData['user_id'] . "</li>";
            echo "<li>Expires At: " . $resetData['expires_at'] . "</li>";
            echo "<li>Created At: " . $resetData['created_at'] . "</li>";
            echo "</ul>";
            
            // Check if token is expired
            $expiry = strtotime($resetData['expires_at']);
            $now = time();
            if ($now > $expiry) {
                echo "<p style='color:red;'>ERROR: Token is expired</p>";
                echo "<p>Expiry time: " . date('Y-m-d H:i:s', $expiry) . "</p>";
                echo "<p>Current time: " . date('Y-m-d H:i:s', $now) . "</p>";
            } else {
                echo "<p style='color:green;'>Token is valid and not expired</p>";
                echo "<p>Expires in: " . round(($expiry - $now) / 60) . " minutes</p>";
            }
            
            // Show user information
            $stmt = $pdo->prepare("SELECT id, name, email FROM users WHERE id = :user_id");
            $stmt->bindParam(':user_id', $resetData['user_id']);
            $stmt->execute();
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            echo "<p>Associated user:</p>";
            echo "<ul>";
            echo "<li>ID: " . $user['id'] . "</li>";
            echo "<li>Name: " . $user['name'] . "</li>";
            echo "<li>Email: " . $user['email'] . "</li>";
            echo "</ul>";
            
            echo "<p><a href='reset_form.html?token=" . htmlspecialchars($token) . "'>Continue to password reset form</a></p>";
        }
    } catch (PDOException $e) {
        echo "<p style='color:red;'>Database error: " . $e->getMessage() . "</p>";
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