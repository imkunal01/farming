# AgriGlance: Smart Farming Platform

![AgriGlance Logo](MyLogo.png)

## Project Overview

AgriGlance is a comprehensive web-based platform designed to revolutionize modern farming through technology integration. This all-in-one solution helps farmers monitor crops, track weather conditions, estimate yields, manage pests, and optimize crop rotations through an intuitive interface with AI-powered insights.

## Table of Contents

- [Key Features](#key-features)
- [Technical Architecture](#technical-architecture)
- [Module Breakdown](#module-breakdown)
  - [Weather Dashboard](#weather-dashboard)
  - [Crop Estimation](#crop-estimation)
  - [Pest Tracker](#pest-tracker)
  - [Crop Rotation Planner](#crop-rotation-planner)
  - [User Management](#user-management)
  - [AI Farming Assistant](#ai-farming-assistant)
- [Technology Stack](#technology-stack)
- [Installation & Setup](#installation--setup)
- [Database Structure](#database-structure)
- [Future Enhancements](#future-enhancements)
- [Contributors](#contributors)

## Key Features

### 🌦️ Weather Dashboard
- Real-time weather monitoring for specific farm locations
- Temperature, rainfall, humidity, and wind tracking
- Historical weather data visualization
- Weather alerts and notifications

### 📊 Crop Estimation
- Calculate expected crop yields based on input parameters
- Track and compare historical yield data
- Export estimates for planning and reporting
- Visual representation of yield projections

### 🐛 Pest Tracker
- Document and monitor pest sightings with location data
- Community-based pest alerts system
- Treatment recommendations and scheduling
- Historical pest activity tracking

### 🔄 Crop Rotation Planner
- Create optimal crop rotation schedules
- Compatibility analysis between different crops
- Season-based planting recommendations
- Soil health optimization strategies

### 👤 User Management
- Secure authentication system
- Personalized user profiles
- Preference settings and customization
- Data export capabilities

### 🤖 AI Farming Assistant
- Natural language chatbot for agricultural queries
- Instant farming advice and recommendations
- Contextual help for platform features
- Growing knowledge base of farming solutions

## Technical Architecture

AgriGlance employs a modular web architecture with:

- **Frontend**: HTML5, CSS3, JavaScript with responsive design
- **Backend**: PHP for server-side processing
- **Database**: MySQL for structured data storage
- **API Integration**: OpenWeatherMap API for weather data
- **Authentication**: Secure login system with password reset functionality
- **Local Storage**: For client-side data persistence
- **Email Service**: Brevo integration for transactional emails

The application follows a component-based structure, allowing for easy maintenance and scalability. Each module operates semi-independently while sharing core resources and user data.

## Module Breakdown

### Weather Dashboard

The weather dashboard provides location-specific weather information crucial for farming decisions:

- Temperature monitoring with min/max ranges
- Precipitation tracking and forecasting
- Humidity levels and wind conditions
- Visual charts for data pattern recognition
- Weather advisories based on crop conditions

**Implementation Details:**
- Uses OpenWeatherMap API for data retrieval
- Implements geolocation for farm-specific weather
- Visualizes data through interactive charts
- Stores location preferences for quick access

### Crop Estimation

The crop estimation module helps farmers project yields and plan harvests:

- Input-based yield calculation algorithms
- Area and crop type customization
- Historical comparison tools
- Economic value estimation

**Implementation Details:**
- Mathematical models for yield prediction
- Database storage of estimates for comparison
- CSV export functionality
- Visual representation through charts

### Pest Tracker

The pest tracking system allows monitoring and managing pest issues:

- Pest sighting documentation with image upload
- Geolocation for mapping infestation patterns
- Community alerts for regional pest activity
- Treatment tracking and scheduling

**Implementation Details:**
- Image upload and storage system
- Interactive maps for visualization
- Community-based reporting system
- Treatment effectiveness tracking

### Crop Rotation Planner

The crop rotation module assists in planning sustainable farming practices:

- Drag-and-drop planner interface
- Crop compatibility database
- Season-specific recommendations
- Soil health improvement suggestions

**Implementation Details:**
- Interactive planning calendar
- Crop database with compatibility matrices
- Visual indicators for optimal combinations
- Plan export and sharing capabilities

### User Management

The user management system provides secure access and personalization:

- Registration and authentication
- Profile customization
- Preference settings
- Account security features

**Implementation Details:**
- Secure password hashing
- Email verification system
- Profile image management
- Dark/light theme preferences

### AI Farming Assistant

The AI chatbot provides instant guidance for farming questions:

- Natural language processing capabilities
- Context-aware responses
- Quick-reply suggestions
- Growing knowledge base

**Implementation Details:**
- JavaScript-based chatbot interface
- Pre-programmed responses for common queries
- Contextual understanding of farming terminology
- Feedback mechanism for improvement

## Technology Stack

### Frontend
- HTML5 for structure
- CSS3 with responsive design principles
- JavaScript for interactive elements
- Font Awesome for iconography
- Google Fonts for typography

### Backend
- PHP 7.4+ for server-side logic
- RESTful API architecture for data exchange
- JSON for data formatting
- Brevo API for email services

### Database
- MySQL 5.7+ for relational data storage
- Optimized schemas for performance
- Foreign key relationships for data integrity

### Development Tools
- Version control with Git
- Local development environment setup
- Cross-browser testing methodologies

## Installation & Setup

### Prerequisites
- PHP 7.4 or higher
- MySQL 5.7 or higher
- Web server (Apache, Nginx, etc.)
- Modern web browser

### Installation Steps
1. Clone the repository to your web server document root
2. Create the database using the provided SQL script:
   ```
   mysql -u root < setup_database.sql
   ```
3. Configure web server to serve the application
4. Set up Brevo API credentials for password reset functionality
5. Access the application via web browser

### Default Test Account
- Email: test@example.com
- Password: password123

## Database Structure

The application utilizes two primary databases:

### farming_app
- **users**: User accounts and authentication
  - id, name, email, password, profile_image, user_type, created_at, last_login

### crop_estimation
- **estimates**: Crop yield estimates
  - id, crop_name, area, yield, total_estimate, latitude, longitude, user_id
- **users**: User reference table
- **community_posts**: Community forum content
- **community_topics**: Forum categorization
- **pest_reports**: Pest sighting documentation

## Future Enhancements

### Planned Features
- Mobile application for field use
- Integration with IoT sensors for real-time data
- Machine learning for more accurate yield predictions
- Marketplace for connecting farmers with buyers
- Weather pattern analysis for climate change adaptation
- Advanced soil analysis recommendations

### Technical Improvements
- Migration to React.js frontend for improved interactivity
- Implementing GraphQL for more efficient data queries
- Containerization with Docker for easier deployment
- Expanded API integrations for additional data sources
- Progressive Web App capabilities for offline access

## Contributors

The AgriGlance platform was developed as a collaborative project by a dedicated team of developers passionate about agricultural technology and sustainable farming practices. The team continues to enhance and expand the platform's capabilities based on user feedback and emerging agricultural technologies. 