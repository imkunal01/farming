# Crop Monitoring System

A comprehensive web application for farmers to monitor crops, estimate yields, track pests, and plan crop rotations.

## Features

- **Weather Dashboard**: Get real-time weather data for your farm locations
- **Crop Estimation**: Calculate and track expected crop yields
- **Pest Tracker**: Monitor and report pest sightings
- **Crop Rotation Planner**: Plan optimal crop rotations
- **User Authentication**: Secure login and user management
- **Profile Management**: User profiles with customization options
- **Dark/Light Theme**: Choose your preferred theme

## Setup Instructions

### Prerequisites

- PHP 7.4 or higher
- MySQL 5.7 or higher
- Web server (Apache, Nginx, etc.)
- Modern web browser

### Installation

1. Clone this repository to your web server's document root
2. Create the necessary databases using the provided SQL script:
   ```
   mysql -u root < setup_database.sql
   ```
3. Configure your web server to serve the application
4. Access the application via your web browser

### Default Login

A test user is created during setup:
- Email: test@example.com
- Password: password123

## Database Structure

The application uses two main databases:

### farming_app

- **users**: User accounts and authentication
  - id, name, email, password, profile_image, user_type, created_at, last_login

### crop_estimation

- **estimates**: Crop yield estimates
  - id, crop_name, area, yield, total_estimate, latitude, longitude, user_id
- **users**: User accounts (reference table)
- **community_posts**: Community forum posts
- **community_topics**: Community forum topics
- **pest_reports**: Pest sighting reports

## Technologies Used

- PHP for backend logic
- MySQL for data storage
- JavaScript for interactive features
- HTML5 and CSS3 for structure and styling
- LocalStorage for client-side data persistence

## Usage Instructions

1. Register a new account or use the default test account
2. Navigate through the different modules using the navigation menu
3. Update your profile information and settings on the profile page
4. Use the Crop Estimation tool to calculate expected yields
5. Report pest sightings using the Pest Tracker
6. Plan your crop rotations with the Crop Rotation Planner
7. Check weather forecasts on the Weather Dashboard

## File Structure

- **index.html**: Main landing page
- **dashboard.html**: Weather monitoring dashboard
- **main.html**: Crop estimation interface
- **login.html**: User authentication page
- **profile.html**: User profile management
- **styles.css**: Main stylesheet
- **login.css**: Login page specific styles
- **profile.css**: Profile page specific styles
- **chatbot.js**: Floating AI chatbot functionality
- **index.js**: Homepage and shared functionality
- **login.js**: Authentication handling
- **profile.js**: Profile management functionality
- **dashboard.js**: Weather monitoring functionality
- **setup_database.sql**: Database setup script
- **crop_estimation.sql**: Crop estimation database schema
- **pest_tracker/**: Pest tracking module
- **crop_planner/**: Crop rotation planning module

## Screenshots


## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [OpenWeatherMap API](https://openweathermap.org/api) for weather data

## Password Reset Setup Guide

This document explains how to set up the password reset functionality with Brevo email service.

### Prerequisites

1. PHP 7.2 or higher
2. cURL extension enabled in PHP
3. A Brevo account (free tier available at [brevo.com](https://www.brevo.com))

### Setup Instructions

1. **Create a Brevo Account**
   - Go to [Brevo's website](https://www.brevo.com/)
   - Sign up for a free account
   - Verify your email address

2. **Set Up a Verified Sender**
   - In Brevo dashboard, go to Settings → Senders
   - Add a new sender with your email address
   - Verify the sender email

3. **Get Your API Key**
   - Go to Settings → API Keys
   - Generate a new API key with appropriate permissions
   - Copy the API key

4. **Update Configuration**
   - Open `brevo_config.php`
   - Replace `YOUR_BREVO_API_KEY` with your actual API key
   - Update the sender email and name

```php
return [
    'api_key' => 'your-actual-api-key',
    'sender_email' => 'your-verified-email@example.com',
    'sender_name' => 'AgriGlance Support'
];
```

### Testing the Password Reset

1. Go to the login page
2. Click "Forgot Password"
3. Enter a valid email address
4. Check your email for the password reset link
5. Click the link and set a new password

### Troubleshooting

- **No emails received**: Check your spam folder
- **Error in sending**: Verify API key and sender email are correct
- **PHP errors**: Make sure cURL extension is enabled in php.ini
- **Reset link not working**: Check that your database has the password_resets table

### Switching to Production Mode

When you're ready to go live:

1. In `reset_password.php`, uncomment the production response line:
```php
// For production - uncomment this and remove the next line
response(true, "Password reset link has been sent to your email");
// Comment out or remove this development line
// response(true, "Password reset link has been sent to your email", ['reset_link' => $resetLink]);
```

2. Ensure your API key is secured and not committed to public repositories

### Free Tier Limits

The Brevo free plan includes:
- 300 emails per day
- No credit card required
- Unlimited contacts

For more information, visit [Brevo Pricing](https://www.brevo.com/pricing/).