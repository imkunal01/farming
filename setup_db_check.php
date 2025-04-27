<?php
// Display errors for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Database configuration
$host = 'localhost';
$dbname = 'farming_app';
$user = 'root';
$password = '';

echo "<h1>Database Setup Check</h1>";

try {
    // Connect to database
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "<p style='color:green'>✓ Database connection successful</p>";
    
    // Check if password_resets table exists
    try {
        $tables = $pdo->query("SHOW TABLES LIKE 'password_resets'")->fetchAll();
        
        if (count($tables) == 0) {
            echo "<p style='color:red'>✗ password_resets table does not exist!</p>";
            
            // Try to create the table
            echo "<p>Attempting to create password_resets table now...</p>";
            
            $sql = file_get_contents('create_reset_table.sql');
            $pdo->exec($sql);
            
            echo "<p style='color:green'>✓ Table created successfully</p>";
        } else {
            echo "<p style='color:green'>✓ password_resets table exists</p>";
        }
        
        // Show table structure
        $columns = $pdo->query("SHOW COLUMNS FROM password_resets")->fetchAll(PDO::FETCH_ASSOC);
        echo "<h2>password_resets Table Structure:</h2>";
        echo "<table border='1' cellpadding='5'>";
        echo "<tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
        
        foreach ($columns as $column) {
            echo "<tr>";
            echo "<td>" . $column['Field'] . "</td>";
            echo "<td>" . $column['Type'] . "</td>";
            echo "<td>" . $column['Null'] . "</td>";
            echo "<td>" . $column['Key'] . "</td>";
            echo "<td>" . $column['Default'] . "</td>";
            echo "<td>" . $column['Extra'] . "</td>";
            echo "</tr>";
        }
        echo "</table>";
        
        // Test creating a reset token
        echo "<h2>Test Token Creation</h2>";
        
        // Check if users exist
        $users = $pdo->query("SELECT id, email FROM users LIMIT 1")->fetchAll(PDO::FETCH_ASSOC);
        
        if (count($users) == 0) {
            echo "<p style='color:red'>✗ No users found in database. Please create a user first.</p>";
        } else {
            $userId = $users[0]['id'];
            $userEmail = $users[0]['email'];
            
            echo "<p>Using user ID: {$userId}, Email: {$userEmail}</p>";
            
            // Generate a reset token
            $token = bin2hex(random_bytes(16));
            $expires = date('Y-m-d H:i:s', strtotime('+24 hours'));
            
            // Check if a token already exists for this user
            $stmt = $pdo->prepare("SELECT id FROM password_resets WHERE user_id = :user_id");
            $stmt->bindParam(':user_id', $userId);
            $stmt->execute();
            
            if ($stmt->rowCount() > 0) {
                // Update existing token
                $stmt = $pdo->prepare("UPDATE password_resets SET token = :token, expires_at = :expires_at, updated_at = NOW() WHERE user_id = :user_id");
                echo "<p>Updating existing token for user.</p>";
            } else {
                // Insert new token
                $stmt = $pdo->prepare("INSERT INTO password_resets (user_id, token, expires_at, created_at, updated_at) VALUES (:user_id, :token, :expires_at, NOW(), NOW())");
                echo "<p>Creating new token for user.</p>";
            }
            
            $stmt->bindParam(':user_id', $userId);
            $stmt->bindParam(':token', $token);
            $stmt->bindParam(':expires_at', $expires);
            $stmt->execute();
            
            echo "<p style='color:green'>✓ Token created/updated successfully</p>";
            
            // Create reset link
            $resetLink = "http://" . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']) . "/reset_password.php?token=" . $token;
            $debugLink = $resetLink . "&debug=1";
            
            echo "<p>Reset link: <a href='{$resetLink}' target='_blank'>{$resetLink}</a></p>";
            echo "<p>Debug link: <a href='{$debugLink}' target='_blank'>{$debugLink}</a></p>";
            
            // Display all tokens
            $allTokens = $pdo->query("SELECT id, user_id, token, expires_at FROM password_resets ORDER BY created_at DESC")->fetchAll(PDO::FETCH_ASSOC);
            
            echo "<h2>All Password Reset Tokens:</h2>";
            echo "<table border='1' cellpadding='5'>";
            echo "<tr><th>ID</th><th>User ID</th><th>Token</th><th>Expires At</th></tr>";
            
            foreach ($allTokens as $row) {
                echo "<tr>";
                echo "<td>" . $row['id'] . "</td>";
                echo "<td>" . $row['user_id'] . "</td>";
                echo "<td>" . $row['token'] . "</td>";
                echo "<td>" . $row['expires_at'] . "</td>";
                echo "</tr>";
            }
            echo "</table>";
        }
        
    } catch (PDOException $e) {
        echo "<p style='color:red'>Error checking tables: " . $e->getMessage() . "</p>";
    }
    
} catch (PDOException $e) {
    echo "<p style='color:red'>Database connection failed: " . $e->getMessage() . "</p>";
}
?> 