<?php
// Database connection
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "crop_estimation";

// Connect to database
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get estimates
$sql = "SELECT * FROM crop_estimates ORDER BY date_created DESC";
$result = $conn->query($sql);

// Close connection
$conn->close();
?>
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Saved Crop Estimates | AgriGlance</title>
    <link rel="stylesheet" href="styles.css">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <!-- Theme Toggle Button -->
    <button class="theme-toggle" id="theme-toggle" aria-label="Toggle dark mode">
        <i class="fas fa-moon"></i>
    </button>
    
    <div class="container">
        <header>
            <div class="back-button" onclick="history.back()">
                <i class="fas fa-arrow-left"></i>
            </div>
            <h1><i class="fas fa-seedling"></i> AgriGlance</h1>
            <nav>
                <a href="index.html"><i class="fas fa-home"></i> Home</a>
                <a href="dashboard.html"><i class="fas fa-map-marker-alt"></i> Weather Dashboard</a>
                <a href="main.html"><i class="fas fa-calculator"></i> Crop Estimation</a>
                <a href="pest_tracker/index.html"><i class="fas fa-bug"></i> Pest Tracker</a>
                <a href="crop_planner/index.html"><i class="fas fa-sync-alt"></i> Crop Rotation</a>
                <a href="profile.html"><i class="fas fa-user-circle"></i> Profile</a>
            </nav>
            <div class="user-profile-icon">
                <a href="profile.html" title="View Profile">
                    <div class="profile-avatar">
                        <i class="fas fa-user"></i>
                        <img id="header-profile-img" src="" alt="Profile" style="display: none;">
                    </div>
                </a>
            </div>
        </header>

        <main>
            <section class="saved-estimates">
                <h2><i class="fas fa-history"></i> Saved Crop Estimates</h2>
                
                <?php if ($result && $result->num_rows > 0): ?>
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Crop</th>
                                    <th>Area (ha)</th>
                                    <th>Yield (t/ha)</th>
                                    <th>Total (t)</th>
                                    <th>Quality</th>
                                    <th>Confidence</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php while($row = $result->fetch_assoc()): ?>
                                    <tr>
                                        <td><?php echo htmlspecialchars($row['crop_name']); ?></td>
                                        <td><?php echo htmlspecialchars($row['land_area']); ?></td>
                                        <td><?php echo htmlspecialchars($row['yield_estimate']); ?></td>
                                        <td><?php echo htmlspecialchars($row['total_production']); ?></td>
                                        <td><?php echo htmlspecialchars($row['quality_factor']); ?></td>
                                        <td><?php echo htmlspecialchars($row['confidence_level']); ?></td>
                                        <td><?php echo date('Y-m-d', strtotime($row['date_created'])); ?></td>
                                    </tr>
                                <?php endwhile; ?>
                            </tbody>
                        </table>
                    </div>
                <?php else: ?>
                    <div class="empty-state">
                        <i class="fas fa-clipboard-list"></i>
                        <p>No saved estimates found. Create your first crop estimate to see it here.</p>
                        <a href="main.html" class="btn primary-btn"><i class="fas fa-plus"></i> Create Estimate</a>
                    </div>
                <?php endif; ?>
            </section>
        </main>
        
        <footer>
            <p>&copy; 2023 AgriGlance. All rights reserved.</p>
        </footer>
    </div>
    
    <!-- Theme Toggle JavaScript -->
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const themeToggle = document.getElementById('theme-toggle');
            const themeIcon = themeToggle.querySelector('i');
            
            // Check for saved theme preference or use device preference
            const savedTheme = localStorage.getItem('theme') || 
                (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
            
            // Apply saved theme
            document.documentElement.setAttribute('data-theme', savedTheme);
            updateIcon(savedTheme);
            
            // Toggle theme
            themeToggle.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                updateIcon(newTheme);
            });
            
            // Update icon based on theme
            function updateIcon(theme) {
                if (theme === 'dark') {
                    themeIcon.classList.remove('fa-moon');
                    themeIcon.classList.add('fa-sun');
                } else {
                    themeIcon.classList.remove('fa-sun');
                    themeIcon.classList.add('fa-moon');
                }
            }
        });
    </script>
</body>
</html> 