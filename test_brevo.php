<?php
// Set error reporting to maximum
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Testing Brevo password reset email sending...<br>";

// Load Brevo configuration
$config = include 'brevo_config.php';

echo "Loaded config:<br>";
echo "API Key: " . substr($config['api_key'], 0, 10) . "...<br>";
echo "Sender Email: " . $config['sender_email'] . "<br>";
echo "Sender Name: " . $config['sender_name'] . "<br><br>";

// Enter your actual email here to test receiving the reset email
$email = 'enter-your-email@gmail.com'; // Replace with your real email address

// Add debug output for API key
echo "Using API key (last 10 chars): " . substr($config['api_key'], -10) . "<br><br>";

// Create test reset link
$resetLink = "http://localhost/classProjects/farming/reset_password.php?token=test_token_123";

// Prepare email content - Same as in reset_password.php
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

echo "Preparing to send password reset email to: " . $email . "<br>";

// Check if curl is available
if (!function_exists('curl_init')) {
    die('cURL is not available. Please enable the cURL extension in PHP.');
}

// Send request to Brevo API
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://api.sendinblue.com/v3/smtp/email');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_VERBOSE, true);

$headers = [
    'Accept: application/json',
    'Content-Type: application/json',
    'api-key: ' . $config['api_key']
];

curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

echo "Sending request to Brevo API...<br>";
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

// Check for curl errors
if (curl_errno($ch)) {
    echo "<strong>Curl error:</strong> " . curl_error($ch) . "<br>";
} else {
    echo "<strong>Response HTTP Code:</strong> " . $httpCode . "<br>";
    echo "<strong>Response Body:</strong> " . $response . "<br>";
}

curl_close($ch);

// Interpret response
if ($httpCode >= 200 && $httpCode < 300) {
    echo "<strong style='color:green'>Success! Password reset email was sent.</strong>";
} else {
    echo "<strong style='color:red'>Failed to send password reset email. Check the response for details.</strong>";
}
?> 