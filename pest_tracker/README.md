# Pest & Disease Monitor

A comprehensive pest and disease monitoring system for agricultural management. This module allows farmers to track, report, and analyze pest and disease occurrences in their fields.

## Features

### Interactive Map View
- Visualize pest and disease occurrences on an interactive map
- Color-coded markers based on severity levels
- Popup details for quick information access
- Automatic geolocation for reporting

### Detailed Reporting System
- Comprehensive reporting form for pest and disease incidents
- Categorization by pest type, crop affected, and severity
- Location tracking with coordinates and field names
- Image upload support for visual documentation
- Notes and additional information fields

### Data Management
- Sortable and filterable table view of all reports
- Search functionality across all fields
- Pagination for easy navigation of large datasets
- CRUD operations (Create, Read, Update, Delete)

### Analytics Dashboard
- Visual charts for pest distribution by type
- Severity trends over time
- Affected crop analysis
- Treatment effectiveness metrics
- Key insights and recommendations based on data

### Treatment Guide Library
- Searchable database of treatment recommendations
- Detailed treatment methods for common pests and diseases
- Prevention guidelines
- Application instructions
- Effectiveness ratings

### Alert System
- Recent high-severity notifications
- Quick access to critical reports
- Upcoming treatment reminders (planned feature)

## Technical Implementation

### Frontend
- HTML5, CSS3, and JavaScript (ES6+)
- Responsive design for all device sizes
- Dark/light theme support
- Interactive UI components
- Chart.js for data visualization
- Leaflet.js for mapping functionality

### Backend
- PHP for server-side processing
- MySQL database for data storage
- RESTful API design
- Image processing and storage
- Data validation and sanitization

### Database Schema
- `pest_reports`: Main table for report data
- `pest_report_images`: Related table for image storage
- Normalized structure for efficient data management

## Installation

1. Place the `pest_tracker` directory in your web server's document root
2. Create a MySQL database named `farming` (or update connection settings in PHP files)
3. The application will automatically create required tables on first use
4. Ensure the `uploads` directory is writable by the web server

## Usage Guide

### Reporting a New Pest/Disease
1. Navigate to the "Report New Pest/Disease" form on the right sidebar
2. Fill in all required fields (marked with *)
3. Use the map or geolocation button to set coordinates
4. Upload images if available
5. Submit the form

### Viewing Reports
- Switch between Map, Table, and Analytics views using the top buttons
- In Map view, click markers to see details and access full report
- In Table view, use filters and sorting to find specific reports
- Click the eye icon to view complete report details

### Using Analytics
- Select time period from the dropdown menu
- View charts showing distribution, trends, and impacts
- Check key insights for actionable recommendations

### Finding Treatment Information
- Use the Treatment Guide search to find specific pest solutions
- Click "View Treatment Guide" from any report detail page
- Browse prevention and treatment recommendations

## Future Enhancements

- Weather data integration
- Predictive analytics for pest outbreaks
- Mobile app for field reporting
- Community data sharing
- Integration with IoT sensors
- Automated alerts based on environmental conditions

## Credits

- Maps powered by [Leaflet.js](https://leafletjs.com/)
- Charts by [Chart.js](https://www.chartjs.org/)
- Icons from [Font Awesome](https://fontawesome.com/)
- Fonts from [Google Fonts](https://fonts.google.com/)

## License

This project is part of the Farming Management System and is licensed under the same terms.

---

© 2023 Crop Monitoring System. All rights reserved. 