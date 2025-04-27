<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Create log file for email sending attempts
$logFile = 'email_debug.log';
file_put_contents($logFile, "=== Email Debug Log - " . date('Y-m-d H:i:s') . " ===\n", FILE_APPEND);

function logMessage($message) {
    global $logFile;
    file_put_contents($logFile, date('Y-m-d H:i:s') . " - " . $message . "\n", FILE_APPEND);
    echo $message . "<br>";
}

logMessage("Starting email debug");

// Check if cURL is working
if (!function_exists('curl_init')) {
    logMessage("ERROR: cURL is not available. This is required to use Brevo API.");
    exit;
}
logMessage("✓ cURL is available");

// Load Brevo configuration
try {
    $config = include 'brevo_config.php';
    if (!is_array($config)) {
        logMessage("ERROR: Brevo config file doesn't return an array");
        exit;
    }
    
    // Display the sender email prominently
    logMessage("<strong>Current sender email: " . $config['sender_email'] . "</strong>");
    
    // Check required config values
    if (empty($config['api_key'])) {
        logMessage("ERROR: API key is empty in config");
        exit;
    }
    if (empty($config['sender_email'])) {
        logMessage("ERROR: Sender email is empty in config");
        exit;
    }
    
    logMessage("✓ Config loaded successfully");
    logMessage("  API Key: " . substr($config['api_key'], 0, 10) . "..." . substr($config['api_key'], -5));
    logMessage("  Sender: " . $config['sender_email']);
} catch (Exception $e) {
    logMessage("ERROR refreshing config: " . $e->getMessage());
    exit;
}

// Check if we can connect to Brevo API
try {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://api.sendinblue.com/v3/account');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: application/json',
        'api-key: ' . $config['api_key']
    ]);
    
    logMessage("Checking API key validity...");
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if (curl_errno($ch)) {
        logMessage("ERROR connecting to Brevo API: " . curl_error($ch));
        exit;
    }
    
    if ($httpCode !== 200) {
        logMessage("ERROR: API key validation failed. HTTP code: " . $httpCode);
        logMessage("Response: " . $response);
        exit;
    }
    
    logMessage("✓ API key is valid");
    curl_close($ch);
} catch (Exception $e) {
    logMessage("ERROR checking API key: " . $e->getMessage());
    exit;
}

// Ask for test email address
if (isset($_POST['email'])) {
    $testEmail = $_POST['email'];
    
    // Validate email
    if (!filter_var($testEmail, FILTER_VALIDATE_EMAIL)) {
        logMessage("ERROR: Invalid email format: " . $testEmail);
    } else {
        logMessage("Sending test email to: " . $testEmail);
        
        // Create test message
        $resetLink = "http://" . $_SERVER['HTTP_HOST'] . "/classProjects/farming/reset_password.php?token=test_debug_token";
        
        $html_content = '
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                <h2 style="color: #27ae60;">Reset Your Password</h2>
                <p>This is a test email from the debugging script. If you received this, your email setup is working.</p>
                <div style="text-align: center; margin: 25px 0;">
                    <a href="' . $resetLink . '" style="background-color: #27ae60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">This would be your reset link</a>
                </div>
                <p>Debug info: Sent at ' . date('Y-m-d H:i:s') . '</p>
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
                    'email' => $testEmail
                ]
            ],
            'subject' => 'TEST - Password Reset - AgriGlance',
            'htmlContent' => $html_content
        ];
        
        // Detailed sending process
        try {
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, 'https://api.sendinblue.com/v3/smtp/email');
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            
            $headers = [
                'Accept: application/json',
                'Content-Type: application/json',
                'api-key: ' . $config['api_key']
            ];
            
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
            
            logMessage("Sending email through Brevo API...");
            $startTime = microtime(true);
            $response = curl_exec($ch);
            $endTime = microtime(true);
            
            $curlInfo = curl_getinfo($ch);
            $httpCode = $curlInfo['http_code'];
            
            if (curl_errno($ch)) {
                logMessage("ERROR in curl request: " . curl_error($ch));
                exit;
            }
            
            logMessage("API request completed in " . round(($endTime - $startTime) * 1000) . " ms");
            logMessage("HTTP response code: " . $httpCode);
            logMessage("Response body: " . $response);
            
            if ($httpCode >= 200 && $httpCode < 300) {
                $responseData = json_decode($response, true);
                if (isset($responseData['messageId'])) {
                    logMessage("✓ SUCCESS! Email sent. Message ID: " . $responseData['messageId']);
                    logMessage("");
                    logMessage("IMPORTANT: Check your spam/junk folder if you don't see the email.");
                    logMessage("Next steps:");
                    logMessage("1. If the email arrived in SPAM - add " . $config['sender_email'] . " to your contacts");
                    logMessage("2. If no email arrived at all - contact Brevo support and verify your account");
                } else {
                    logMessage("WARNING: Email sent but no message ID returned");
                }
            } else {
                logMessage("ERROR: Failed to send email. Status code " . $httpCode);
            }
            
            curl_close($ch);
        } catch (Exception $e) {
            logMessage("ERROR during email sending: " . $e->getMessage());
        }
    }
}

// Add auto-test for Brevo connectivity
logMessage("<hr>");
logMessage("<h3>Testing Brevo Service Status</h3>");

// Attempt a test request to Brevo API to check general connectivity
try {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://api.sendinblue.com/v3/smtp/statistics/events');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: application/json',
        'api-key: ' . $config['api_key']
    ]);
    
    logMessage("Testing Brevo service access...");
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if (curl_errno($ch)) {
        logMessage("⚠️ WARNING: Could not connect to Brevo API: " . curl_error($ch));
    } elseif ($httpCode !== 200) {
        logMessage("⚠️ WARNING: Brevo API returned error code: " . $httpCode);
        logMessage("Response: " . $response);
    } else {
        logMessage("✓ Brevo API access successful");
        
        // Check if the sender email is properly verified
        curl_setopt($ch, CURLOPT_URL, 'https://api.sendinblue.com/v3/senders');
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        
        if ($httpCode === 200) {
            $senders = json_decode($response, true);
            $senderVerified = false;
            
            if (isset($senders['senders']) && is_array($senders['senders'])) {
                foreach ($senders['senders'] as $sender) {
                    if ($sender['email'] === $config['sender_email']) {
                        $senderVerified = true;
                        $senderActive = $sender['active'] ?? false;
                        
                        logMessage("✓ Sender email found in your Brevo account");
                        
                        if (!$senderActive) {
                            logMessage("⚠️ WARNING: Sender email is not active. This could prevent emails from being sent.");
                        } else {
                            logMessage("✓ Sender email is active");
                        }
                        
                        break;
                    }
                }
            }
            
            if (!$senderVerified) {
                logMessage("⚠️ WARNING: Sender email '" . $config['sender_email'] . "' is not found in your verified senders list.");
                logMessage("You need to verify this email in your Brevo account before you can send emails from it.");
            }
        } else {
            logMessage("⚠️ Could not check sender verification status: " . $httpCode);
        }
    }
    
    curl_close($ch);
} catch (Exception $e) {
    logMessage("ERROR checking Brevo service: " . $e->getMessage());
}

logMessage("<hr>");
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Debug Tool</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #27ae60; }
        .container { border: 1px solid #ccc; padding: 20px; border-radius: 5px; }
        form { margin-bottom: 20px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input[type="email"] { width: 100%; padding: 8px; margin-bottom: 10px; }
        button { background-color: #27ae60; color: white; border: none; padding: 10px 15px; cursor: pointer; }
        pre { background: #f5f5f5; padding: 10px; overflow: auto; }
    </style>
</head>
<body>
    <h1>Email Debug Tool</h1>
    <div class="container">
        <h2>Test Password Reset Email</h2>
        <form method="post">
            <label for="email">Enter your email address to receive a test password reset email:</label>
            <input type="email" id="email" name="email" required placeholder="your-email@example.com">
            <button type="submit">Send Test Email</button>
        </form>
        
        <h3>Check Also:</h3>
        <ul>
            <li>Verify that your email domain (e.g., gmail.com) isn't blocked by Brevo</li>
            <li>Check that the sender email (<?= htmlspecialchars($config['sender_email']) ?>) is properly verified in Brevo</li>
            <li>Look for the test emails in your spam/junk folder</li>
            <li>Try with a different email address (e.g., Gmail if you're using Outlook)</li>
        </ul>
    </div>
</body>
</html> 