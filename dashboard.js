// Global variables
let map;
let currentMarker = null;
let darkModeLayer;
let lightModeLayer;
let currentMapTheme; // Use a specific variable for map theme state
let temperatureChart = null; // Store chart instance

// OpenWeatherMap API key - **IMPORTANT: Replace with your actual API key**
// For the presentation, you can leave this placeholder, but mention it needs a real key.
const apiKey = 'e6c1cb62d21ed1af51cf11a3086afc55'; // Placeholder

// Initialize the dashboard once DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('map')) { // Only init map if the element exists
        initMap();
        getUrlParameters();
        loadLastLocation(); // Try loading last location first
        if (!currentMarker) { // If no marker from params or localStorage, try user location
             getUserLocation();
        }
         setupClearLocationButton(); // Setup button listener
    }
    // Removed setupThemeListener - Handled by app.js
});

// Listen for theme changes from app.js
window.addEventListener('themechange', (event) => {
    const newTheme = event.detail.theme;
    if (map) {
        setMapTheme(newTheme);
    }
    if (temperatureChart) {
        updateChartColors(temperatureChart, newTheme);
    }
});


// Initialize map
function initMap() {
    map = L.map('map', {
        zoomControl: false, // Added later
        attributionControl: false // Added later
    }).setView([20, 0], 2); // Default view

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.control.attribution({
        position: 'bottomright',
        prefix: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Define tile layers
    lightModeLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '' // Attribution is handled by the control
    });

    darkModeLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '© <a href="https://carto.com/attributions">CARTO</a>'
    });

    // Get initial theme from document attribute (set by app.js)
    currentMapTheme = document.documentElement.getAttribute('data-theme') || 'light';
    setMapTheme(currentMapTheme);

    // Map click event listener
    map.on('click', function (e) {
        const { lat, lng } = e.latlng;
        addMarker(lat, lng);
        map.setView([lat, lng], map.getZoom() < 10 ? 10 : map.getZoom()); // Zoom in if needed
    });

     // Map move animation helper
     map.on('movestart', () => {
         document.getElementById('map').style.transition = 'transform 0.3s ease-out';
     });
     map.on('moveend', () => {
         document.getElementById('map').style.transition = ''; // Reset after move
     });
}


// Removed setupThemeListener function


// Switch map theme based on current website theme
function setMapTheme(theme) {
    if (!map) return; // Don't run if map isn't initialized

    currentMapTheme = theme; // Update the map theme state

    if (theme === 'dark') {
        if (map.hasLayer(lightModeLayer)) map.removeLayer(lightModeLayer);
        if (!map.hasLayer(darkModeLayer)) darkModeLayer.addTo(map);
    } else {
        if (map.hasLayer(darkModeLayer)) map.removeLayer(darkModeLayer);
        if (!map.hasLayer(lightModeLayer)) lightModeLayer.addTo(map);
    }

    // Update existing marker style if needed
    if (currentMarker) {
        updateMarkerStyle();
    }

     // Invalidate map size slightly after theme change to fix potential tile issues
     setTimeout(() => {
         map.invalidateSize();
     }, 150);
}

// Update marker style based on theme
function updateMarkerStyle() {
    if (!currentMarker || !currentMapTheme) return;

    const iconHtml = `<div class="marker-pin ${currentMapTheme}"><i class="fas fa-map-marker-alt"></i></div>`;
    const customIcon = L.divIcon({
        className: 'custom-marker', // Keep a base class
        html: iconHtml,
        iconSize: [30, 42],
        iconAnchor: [15, 42] // Bottom center of the pin
    });

    currentMarker.setIcon(customIcon);
}

// Get location from URL parameters
function getUrlParameters() {
    const params = new URLSearchParams(window.location.search);
    const lat = parseFloat(params.get('lat'));
    const lng = parseFloat(params.get('lng'));

    if (!isNaN(lat) && !isNaN(lng) && map) {
         console.log("Setting location from URL params:", lat, lng);
        map.setView([lat, lng], 12);
        addMarker(lat, lng);
    }
}

// Add marker to map and fetch weather data
function addMarker(lat, lng) {
    if (!map) return;

    if (currentMarker) {
        map.removeLayer(currentMarker);
    }

    // Create the icon using the current theme
    const iconHtml = `<div class="marker-pin ${currentMapTheme}"><i class="fas fa-map-marker-alt"></i></div>`;
    const customIcon = L.divIcon({
        className: 'custom-marker',
        html: iconHtml,
        iconSize: [30, 42],
        iconAnchor: [15, 42]
    });

    currentMarker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

    // Add a pop-up
    const popupContent = `
        <div class="popup-content">
            <h4><i class="fas fa-map-pin"></i> Location</h4>
            <p>Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}</p>
        </div>
    `;
    currentMarker.bindPopup(popupContent).openPopup();

    // Fetch weather data for the new marker
    fetchWeatherData(lat, lng);
     fetchWeatherForecast(lat, lng); // Fetch forecast as well

    // Save location to localStorage
    localStorage.setItem('lastLocation', JSON.stringify({ lat, lng }));

    // Add a visual pulse effect (optional but nice)
    const pulseCircle = L.circleMarker([lat, lng], {
        color: 'var(--accent-color)', // Use CSS variable
        fillColor: 'var(--accent-color)',
        fillOpacity: 0.4,
        radius: 0,
        weight: 1
    }).addTo(map);

    let radius = 0;
    const interval = setInterval(() => {
        radius += 1;
        pulseCircle.setRadius(radius);
        pulseCircle.setStyle({ fillOpacity: Math.max(0, 0.4 - radius / 50) });
        if (radius > 25) {
            clearInterval(interval);
            map.removeLayer(pulseCircle);
        }
    }, 25);
}


// Fetch current weather data
async function fetchWeatherData(lat, lng) {
    const weatherContainer = document.getElementById('weather-data');
    if (!weatherContainer) return;

     if (apiKey === 'YOUR_OPENWEATHERMAP_API_KEY') {
         weatherContainer.innerHTML = `<p class="error"><i class="fas fa-exclamation-triangle"></i> API Key Needed</p><p>Please set your OpenWeatherMap API key in dashboard.js</p>`;
         return;
     }


    // Basic coordinate validation
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        weatherContainer.innerHTML = `<p class="error">Invalid coordinates selected.</p>`;
        return;
    }

    // Show loading state
    weatherContainer.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Fetching current weather...</p>
        </div>`;

    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`;
    console.log("Fetching weather data from:", apiUrl);

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!response.ok) {
             // Handle specific errors like 401 (invalid key) or 429 (rate limit)
             let errorMsg = `Failed (${response.status})`;
             if (data.message) {
                 errorMsg += `: ${data.message}`;
             }
              if (response.status === 401) {
                  errorMsg = "Invalid API Key. Please check dashboard.js.";
              } else if (response.status === 429) {
                  errorMsg = "API rate limit exceeded. Please try again later.";
              }
             throw new Error(errorMsg);
        }


        console.log("Weather data received:", data);
        displayWeatherData(data);
         // Call recommendations function if it exists (defined in dashboard.html inline script)
         if (window.generateCropRecommendations) {
             window.generateCropRecommendations(data);
         }

    } catch (error) {
        console.error("Weather API Error:", error);
        weatherContainer.innerHTML = `<p class="error"><i class="fas fa-exclamation-circle"></i> Error: ${error.message}</p>`;
         // Hide recommendations on error
         const recommendationsSection = document.getElementById('crop-recommendations');
         if (recommendationsSection) recommendationsSection.style.display = 'none';
    }
}


// Display current weather data
function displayWeatherData(data) {
    const container = document.getElementById('weather-data');
    if (!container || !data || !data.weather || !data.main) {
         container.innerHTML = `<p class="error">Could not display weather data.</p>`;
         return; // Exit if essential data is missing
    }

    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

    // Handle potential missing rain data gracefully
    const rainfall = data.rain && data.rain['1h'] ? `${data.rain['1h']} mm/hr` :
                     (data.rain && data.rain['3h'] ? `${(data.rain['3h'] / 3).toFixed(1)} mm/hr (avg)` : "0 mm/hr");


    // Determine temperature class
    const tempClass = data.main.temp > 30 ? 'temp-hot' :
                      data.main.temp < 10 ? 'temp-cold' : 'temp-moderate';

    const html = `
        <div class="weather-main">
            <div class="weather-icon-container">
                <img src="${iconUrl}" alt="${data.weather[0].description}" class="weather-icon" title="${data.weather[0].description}">
            </div>
            <div class="weather-summary">
                 <h3>${data.name ? data.name : 'Selected Location'}</h3>
                <p class="temperature ${tempClass}">${Math.round(data.main.temp)}°C</p>
                <p class="feels-like">Feels like: ${Math.round(data.main.feels_like)}°C</p>
                <p class="weather-desc">${data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1)}</p>
            </div>
        </div>
        <div class="weather-details">
            <div class="weather-info-item">
                <i class="fas fa-tint"></i>
                <span>Humidity: ${data.main.humidity}%</span>
            </div>
            <div class="weather-info-item">
                <i class="fas fa-wind"></i>
                <span>Wind: ${data.wind.speed.toFixed(1)} m/s ${getWindDirection(data.wind.deg)}</span>
            </div>
            <div class="weather-info-item">
                <i class="fas fa-compress-arrows-alt"></i>
                <span>Pressure: ${data.main.pressure} hPa</span>
            </div>
            <div class="weather-info-item">
                 <i class="fas fa-cloud-rain"></i>
                 <span>Rain (1h): ${rainfall}</span>
             </div>
             <div class="weather-info-item">
                 <i class="fas fa-eye"></i>
                 <span>Visibility: ${(data.visibility / 1000).toFixed(1)} km</span>
             </div>
             <div class="weather-info-item">
                  <i class="fas fa-sun"></i>
                  <span>Sunrise: ${formatTime(data.sys.sunrise, data.timezone)}</span>
              </div>
              <div class="weather-info-item">
                  <i class="fas fa-moon"></i>
                  <span>Sunset: ${formatTime(data.sys.sunset, data.timezone)}</span>
              </div>
        </div>
    `;
    container.innerHTML = html;
}

// Helper to format time from UNIX timestamp + timezone offset
 function formatTime(unixTimestamp, timezoneOffsetSeconds) {
     if (!unixTimestamp) return 'N/A';
     // Create date object in UTC, then add the timezone offset
     const date = new Date((unixTimestamp + timezoneOffsetSeconds) * 1000);
     return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
 }

 // Helper to get wind direction
 function getWindDirection(degrees) {
     if (degrees === undefined) return '';
     const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
     const index = Math.round(degrees / 22.5) % 16;
     return directions[index];
 }



// Try to get user's current location via browser API
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                 console.log("Geolocation success:", latitude, longitude);
                 // Only set view and marker if no location is already set
                 if (!currentMarker && map) {
                     map.setView([latitude, longitude], 10); // Zoom in a bit more for user location
                     addMarker(latitude, longitude);
                 }
            },
            error => {
                console.warn("Geolocation error:", error.message);
                 // Don't show an error to the user, just don't center the map
            },
             { timeout: 8000 } // Add a timeout
        );
    } else {
         console.warn("Geolocation is not supported by this browser.");
    }
}

// Load last marker location from localStorage
function loadLastLocation() {
    const lastLocation = localStorage.getItem('lastLocation');
    if (lastLocation && map) {
        try {
            const { lat, lng } = JSON.parse(lastLocation);
             console.log("Loading last location:", lat, lng);
             if (!isNaN(lat) && !isNaN(lng)) {
                 // Check if URL params already set a location; if so, they take precedence
                 const params = new URLSearchParams(window.location.search);
                 if (!params.has('lat') && !params.has('lng')) {
                      map.setView([lat, lng], 12);
                      addMarker(lat, lng);
                 }
             } else {
                  localStorage.removeItem('lastLocation'); // Clear invalid data
             }
        } catch (e) {
            console.error("Error parsing lastLocation from localStorage", e);
            localStorage.removeItem('lastLocation'); // Clear corrupted data
        }
    }
}


// Setup clear location button listener
function setupClearLocationButton() {
     const clearBtn = document.getElementById('clear-last-location');
     if (clearBtn) {
         clearBtn.addEventListener('click', function() {
             localStorage.removeItem('lastLocation');
             if (currentMarker && map) {
                 map.removeLayer(currentMarker);
                 currentMarker = null;
             }
             // Reset related UI sections
             const weatherContainer = document.getElementById('weather-data');
             const forecastContainer = document.getElementById('weather-forecast');
             const chartsContainer = document.getElementById('weather-charts');
              const recommendationsSection = document.getElementById('crop-recommendations');

             if (weatherContainer) weatherContainer.innerHTML = `<p class="placeholder-text">Select a location on the map</p>`;
             if (forecastContainer) forecastContainer.style.display = 'none';
             if (chartsContainer) chartsContainer.style.display = 'none';
              if (recommendationsSection) recommendationsSection.style.display = 'none';

             // Optionally, reset map view to default
             // map.setView([20, 0], 2);
             showToast('Cleared saved location.', 'info'); // Use a toast function if available
         });
     }
 }

// Fetch 5-day weather forecast
async function fetchWeatherForecast(lat, lng) {
    const forecastSection = document.getElementById('weather-forecast');
    const forecastContent = forecastSection ? forecastSection.querySelector('.forecast-container') : null;
     const chartsSection = document.getElementById('weather-charts'); // Get charts section too

     if (!forecastSection || !forecastContent || !chartsSection) return; // Ensure elements exist

      if (apiKey === 'YOUR_OPENWEATHERMAP_API_KEY') {
          forecastContent.innerHTML = `<p class="error">API Key needed for forecast.</p>`;
          forecastSection.style.display = 'block'; // Show the section with the error
          chartsSection.style.display = 'none'; // Hide charts if forecast fails
          return;
      }


    // Show loading state for forecast
     forecastContent.innerHTML = `<div class="loading-container"><div class="loading-spinner small"></div><p>Loading forecast...</p></div>`;
     forecastSection.style.display = 'block'; // Show section while loading
     chartsSection.style.display = 'none'; // Hide charts while loading forecast


    try {
        const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`;
        console.log("Fetching forecast data from:", apiUrl);

        const response = await fetch(apiUrl);
         const data = await response.json();

        if (!response.ok) {
             let errorMsg = `Forecast Failed (${response.status})`;
             if (data.message) errorMsg += `: ${data.message}`;
             if (response.status === 401) errorMsg = "Invalid API Key for Forecast";
             throw new Error(errorMsg);
        }

        console.log("Forecast data received:", data);

        // Process and display forecast data
        displayForecast(data);

        // Create and display temperature chart
        createTemperatureChart(data);

        // Ensure sections are visible
        forecastSection.style.display = 'block';
        chartsSection.style.display = 'block'; // Show charts section only on success

    } catch (error) {
        console.error("Forecast API Error:", error);
        forecastContent.innerHTML = `<p class="error"><i class="fas fa-exclamation-circle"></i> Forecast Error: ${error.message}</p>`;
        forecastSection.style.display = 'block'; // Keep section visible to show error
         chartsSection.style.display = 'none'; // Hide charts on error
    }
}


// Display 5-day forecast
function displayForecast(data) {
    const forecastContainer = document.querySelector('.forecast-container');
    if (!forecastContainer || !data || !data.list) {
         if (forecastContainer) forecastContainer.innerHTML = '<p class="error">Could not display forecast.</p>';
         return;
    };
    forecastContainer.innerHTML = ''; // Clear previous or loading content

    // Group forecast by day, selecting the item closest to midday (e.g., 12:00 or 15:00)
    const dailyForecasts = {};
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayKey = date.toLocaleDateString('en-CA'); // YYYY-MM-DD format for reliable keys

        // If day doesn't exist OR this item is closer to midday (13:30) than the existing one
        if (!dailyForecasts[dayKey] || Math.abs(date.getHours() - 13.5) < Math.abs(new Date(dailyForecasts[dayKey].dt * 1000).getHours() - 13.5)) {
            dailyForecasts[dayKey] = item;
        }
    });

    // Convert to array, sort by date, and take first 5 days
     const forecasts = Object.values(dailyForecasts)
         .sort((a, b) => a.dt - b.dt)
         .slice(0, 5);


    // Create forecast items
    forecasts.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        const iconUrl = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`;
        const description = forecast.weather[0].description;

        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
            <div class="forecast-day">${day}</div>
            <img src="${iconUrl}" alt="${description}" class="forecast-icon" title="${description}">
            <div class="forecast-temp-range">
                 <span class="temp-max" title="Max Temp">${Math.round(forecast.main.temp_max)}°</span> /
                 <span class="temp-min" title="Min Temp">${Math.round(forecast.main.temp_min)}°</span>
            </div>
             <div class="forecast-desc">${description.charAt(0).toUpperCase() + description.slice(1)}</div>
             <div class="forecast-pop" title="Probability of Precipitation">
                 <i class="fas fa-tint"></i> ${Math.round(forecast.pop * 100)}%
             </div>
        `;
        forecastContainer.appendChild(forecastItem);
    });
}


// Create temperature chart for the next 24 hours
function createTemperatureChart(data) {
    const chartCanvas = document.getElementById('temperatureChart');
     if (!chartCanvas || !data || !data.list) return; // Ensure canvas and data exist

    const ctx = chartCanvas.getContext('2d');

    // Extract data for the next 24 hours (approx 8 data points)
    const next24HoursData = data.list.slice(0, 8);
    const labels = next24HoursData.map(item => {
        const date = new Date(item.dt * 1000);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
    });
    const temperatures = next24HoursData.map(item => Math.round(item.main.temp));
    const humidity = next24HoursData.map(item => item.main.humidity);
    const pop = next24HoursData.map(item => Math.round(item.pop * 100)); // Probability of Precipitation


    // Get current theme for chart colors
    const theme = document.documentElement.getAttribute('data-theme') || 'light';

    // Destroy existing chart instance if it exists
    if (temperatureChart) {
        temperatureChart.destroy();
    }

    // Create the new chart
    temperatureChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Temp (°C)',
                    data: temperatures,
                    borderColor: 'rgba(231, 76, 60, 0.8)', // Red
                    backgroundColor: 'rgba(231, 76, 60, 0.2)',
                    yAxisID: 'y', // Assign to the left Y axis
                    tension: 0.3,
                    fill: true,
                    pointRadius: 3,
                    pointHoverRadius: 5
                },
                {
                    label: 'Humidity (%)',
                    data: humidity,
                    borderColor: 'rgba(52, 152, 219, 0.8)', // Blue
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    yAxisID: 'y1', // Assign to the right Y axis
                    tension: 0.3,
                    fill: false, // Don't fill humidity
                     pointRadius: 3,
                     pointHoverRadius: 5
                },
                 {
                     label: 'Precip (%)', // Probability of Precipitation
                     data: pop,
                     borderColor: 'rgba(46, 204, 113, 0.8)', // Green
                     backgroundColor: 'rgba(46, 204, 113, 0.2)',
                     yAxisID: 'y1', // Also on the right Y axis
                     tension: 0.3,
                     fill: false,
                     pointRadius: 3,
                     pointHoverRadius: 5,
                     stepped: true // Show PoP as steps might be clearer
                 }
            ]
        },
        options: {
             responsive: true,
             maintainAspectRatio: false, // Allow chart to resize height independently
             interaction: { // Improved tooltip interaction
                 mode: 'index',
                 intersect: false,
             },
             plugins: {
                 legend: {
                     position: 'top',
                     labels: { // Updated dynamically by updateChartColors
                         // color: textColor
                     }
                 },
                 tooltip: {
                     mode: 'index',
                     intersect: false,
                     backgroundColor: theme === 'dark' ? 'rgba(50, 50, 50, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                     titleColor: theme === 'dark' ? '#eee' : '#333',
                     bodyColor: theme === 'dark' ? '#eee' : '#333',
                     borderColor: theme === 'dark' ? '#555' : '#ddd',
                     borderWidth: 1
                 }
             },
             scales: {
                 x: {
                     title: {
                         display: true,
                         text: 'Time (Next 24 Hours)'
                     },
                     ticks: { // Updated dynamically
                         // color: textColor
                     },
                     grid: { // Updated dynamically
                         // color: gridColor
                     }
                 },
                 y: { // Left Y Axis (Temperature)
                     type: 'linear',
                     display: true,
                     position: 'left',
                     title: {
                         display: true,
                         text: 'Temperature (°C)',
                         // color: 'rgba(231, 76, 60, 0.8)' // Match color
                     },
                     ticks: { // Updated dynamically
                         // color: textColor
                     },
                     grid: {
                         drawOnChartArea: true // Main grid lines
                     }
                 },
                 y1: { // Right Y Axis (Humidity & PoP)
                     type: 'linear',
                     display: true,
                     position: 'right',
                     min: 0, // Ensure % axis starts at 0
                     max: 100, // Max % is 100
                     title: {
                         display: true,
                         text: 'Humidity / Precip (%)',
                         // color: 'rgba(52, 152, 219, 0.8)' // Match color
                     },
                     ticks: { // Updated dynamically
                         // color: textColor
                     },
                     grid: {
                         drawOnChartArea: false, // Only draw grid lines for the main Y axis (left)
                     }
                 }
             }
         }
    });
    // Apply initial colors based on the current theme
     updateChartColors(temperatureChart, theme);
}


// Update chart colors based on theme
 function updateChartColors(chart, theme) {
     if (!chart) return;
     const textColor = theme === 'dark' ? '#e6e6e6' : '#333';
     const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
     const tooltipBg = theme === 'dark' ? 'rgba(50, 50, 50, 0.8)' : 'rgba(255, 255, 255, 0.9)';
      const tooltipBorder = theme === 'dark' ? '#555' : '#ddd';

     // Update colors
     chart.options.plugins.legend.labels.color = textColor;
     chart.options.scales.x.ticks.color = textColor;
     chart.options.scales.x.grid.color = gridColor;
      chart.options.scales.x.title.color = textColor; // Update title color too
     chart.options.scales.y.ticks.color = textColor;
     chart.options.scales.y.grid.color = gridColor;
      chart.options.scales.y.title.color = textColor;
     chart.options.scales.y1.ticks.color = textColor;
      chart.options.scales.y1.title.color = textColor;

      // Update tooltip colors
      chart.options.plugins.tooltip.backgroundColor = tooltipBg;
      chart.options.plugins.tooltip.titleColor = textColor;
      chart.options.plugins.tooltip.bodyColor = textColor;
      chart.options.plugins.tooltip.borderColor = tooltipBorder;


     chart.update();
 }


// Toast notification function (can be moved to app.js if needed universally)
 function showToast(message, type = 'info') {
     const toastId = 'dashboard-toast';
     let toast = document.getElementById(toastId);
     if (!toast) {
         toast = document.createElement('div');
         toast.id = toastId;
         toast.className = 'toast'; // Use a generic class potentially styled in styles.css
         document.body.appendChild(toast);
     }
     toast.textContent = message;
     toast.className = `toast ${type} show`; // Add type and show classes
     setTimeout(() => {
         toast.classList.remove('show');
     }, 3000);
 }

// Removed initCommunityChat function
