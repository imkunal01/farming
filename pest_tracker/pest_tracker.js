/**
 * Pest & Disease Monitor - Main JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the pest monitoring dashboard
    initPestMonitor();
});

// Global variables
let map;
let markers = [];
let currentReports = [];
let currentPage = 1;
let reportsPerPage = 10;
let sortColumn = 'date';
let sortDirection = 'desc';

/**
 * Initialize the pest monitoring system
 */
function initPestMonitor() {
    // Initialize map view (default)
    initMap();
    
    // Setup view toggle functionality
    setupViewToggle();
    
    // Setup form handlers
    setupFormHandlers();
    
    // Load initial data
    loadReportData();
    
    // Setup modal functionality
    setupModals();
    
    // Setup pagination and table sorting
    setupTableControls();
    
    // Setup treatment guide search
    setupTreatmentSearch();
    
    // Set current date as default in the date field
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('detection-date').value = today;
}

/**
 * Initialize the Leaflet map
 */
function initMap() {
    // Create map centered on a default location (can be adjusted based on user's location)
    map = L.map('pest-map').setView([37.7749, -122.4194], 10);
    
    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);
    
    // Add click event to map for selecting coordinates
    map.on('click', function(e) {
        const lat = e.latlng.lat.toFixed(6);
        const lng = e.latlng.lng.toFixed(6);
        
        document.getElementById('location-lat').value = lat;
        document.getElementById('location-lng').value = lng;
    });
    
    // Get user's current location button
    document.getElementById('get-location').addEventListener('click', function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                const lat = position.coords.latitude.toFixed(6);
                const lng = position.coords.longitude.toFixed(6);
                
                document.getElementById('location-lat').value = lat;
                document.getElementById('location-lng').value = lng;
                
                // Center map on user's location
                map.setView([lat, lng], 15);
                
                // Add a temporary marker
                L.marker([lat, lng]).addTo(map)
                    .bindPopup('Your current location')
                    .openPopup();
            }, function(error) {
                showAlert('Could not get your location: ' + error.message, 'error');
            });
        } else {
            showAlert('Geolocation is not supported by your browser', 'error');
        }
    });
}

/**
 * Setup view toggle between map, table and analytics
 */
function setupViewToggle() {
    const viewButtons = document.querySelectorAll('.view-btn');
    const viewContents = document.querySelectorAll('.view-content');
    
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const viewType = this.getAttribute('data-view');
            
            // Update active button
            viewButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Show appropriate content
            viewContents.forEach(content => {
                if (content.classList.contains(viewType + '-view')) {
                    content.style.display = 'block';
                    
                    // Refresh map if switching to map view
                    if (viewType === 'map') {
            setTimeout(() => {
                            map.invalidateSize();
            }, 100);
        }
                } else {
                    content.style.display = 'none';
                }
            });
        });
    });
}

/**
 * Setup form handlers
 */
function setupFormHandlers() {
    // Pest report form submission
    const reportForm = document.getElementById('pest-report-form');
    
    reportForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Collect form data
        const reportData = {
            id: generateUniqueId(),
            reportType: document.getElementById('report-type').value,
            pestName: document.getElementById('pest-name').value,
            cropAffected: document.getElementById('crop-affected').value,
            locationName: document.getElementById('location-name').value,
            locationLat: document.getElementById('location-lat').value,
            locationLng: document.getElementById('location-lng').value,
            severity: document.getElementById('severity').value,
            areaAffected: document.getElementById('area-affected').value,
            detectionDate: document.getElementById('detection-date').value,
            notes: document.getElementById('notes').value,
            status: 'new',
            reportDate: new Date().toISOString().split('T')[0]
        };
        
        // For demo purposes, just add to local storage
        saveReport(reportData);
        
        // Reset form
        reportForm.reset();
        
        // Set current date as default in the date field again
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('detection-date').value = today;
        
        // Show success message
        showAlert('Pest report submitted successfully!', 'success');
        
        // Reload data to show new report
        loadReportData();
    });
}

/**
 * Save report to local storage (for demo purposes)
 */
function saveReport(reportData) {
    // Get existing reports from local storage
    let reports = JSON.parse(localStorage.getItem('pestReports')) || [];
    
    // Add new report
    reports.push(reportData);
    
    // Save back to local storage
    localStorage.setItem('pestReports', JSON.stringify(reports));
}

/**
 * Load report data from local storage (for demo)
 */
function loadReportData() {
    // Get reports from local storage
    const reports = JSON.parse(localStorage.getItem('pestReports')) || [];
    
    // If no reports exist yet, create some demo data
    if (reports.length === 0) {
        createDemoReports();
        return loadReportData(); // Reload after creating demo data
    }
    
    // Store current reports
    currentReports = reports;
    
    // Update map markers
    updateMapMarkers(reports);
    
    // Update table view
    updateTableView(reports);
    
    // Update alerts sidebar
    updateAlerts(reports);
}

/**
 * Create demo reports for initial viewing
 */
function createDemoReports() {
    const demoReports = [
        {
            id: 'demo-1',
            reportType: 'insect',
            pestName: 'Aphids',
            cropAffected: 'Corn',
            locationName: 'North Field',
            locationLat: '37.7749',
            locationLng: '-122.4294',
            severity: 'medium',
            areaAffected: '5.2',
            detectionDate: '2023-06-15',
            notes: 'Found clusters on young plants. Some leaf curling observed.',
            status: 'treating',
            reportDate: '2023-06-15'
        },
        {
            id: 'demo-2',
            reportType: 'disease',
            pestName: 'Powdery Mildew',
            cropAffected: 'Wheat',
            locationName: 'East Field',
            locationLat: '37.7649',
            locationLng: '-122.4194',
            severity: 'high',
            areaAffected: '10.5',
            detectionDate: '2023-06-10',
            notes: 'White powdery spots on leaves and stems. Spreading rapidly in humid conditions.',
            status: 'investigating',
            reportDate: '2023-06-10'
        },
        {
            id: 'demo-3',
            reportType: 'weed',
            pestName: 'Bindweed',
            cropAffected: 'Soybean',
            locationName: 'South Field',
            locationLat: '37.7649',
            locationLng: '-122.4094',
            severity: 'low',
            areaAffected: '2.3',
            detectionDate: '2023-06-05',
            notes: 'Climbing vines beginning to emerge at field edges.',
            status: 'monitoring',
            reportDate: '2023-06-05'
        },
        {
            id: 'demo-4',
            reportType: 'disease',
            pestName: 'Late Blight',
            cropAffected: 'Potato',
            locationName: 'West Field',
            locationLat: '37.7849',
            locationLng: '-122.4394',
            severity: 'critical',
            areaAffected: '8.7',
            detectionDate: '2023-06-02',
            notes: 'Dark water-soaked spots on leaves. Some tubers showing brown rot.',
            status: 'treating',
            reportDate: '2023-06-02'
        }
    ];
    
    // Save demo reports to local storage
    localStorage.setItem('pestReports', JSON.stringify(demoReports));
}

/**
 * Update map markers based on report data
 */
function updateMapMarkers(reports) {
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    // Add new markers
    reports.forEach(report => {
        // Skip if missing coordinates
        if (!report.locationLat || !report.locationLng) return;
        
        // Create marker with custom color based on severity
        const markerIcon = createSeverityMarker(report.severity);
        
        const marker = L.marker([report.locationLat, report.locationLng], {icon: markerIcon}).addTo(map);
        
        // Create popup content
        const popupContent = `
            <div class="map-popup">
                <h4>${report.pestName}</h4>
                <p><strong>Location:</strong> ${report.locationName}</p>
                <p><strong>Crop:</strong> ${report.cropAffected}</p>
                <p><strong>Severity:</strong> <span class="severity-label severity-${report.severity}">${capitalizeFirst(report.severity)}</span></p>
                <p><strong>Status:</strong> <span class="status-label status-${report.status}">${formatStatus(report.status)}</span></p>
                <p><strong>Detected:</strong> ${formatDate(report.detectionDate)}</p>
                <button class="btn primary-btn btn-sm view-details-btn" data-report-id="${report.id}">View Details</button>
            </div>
        `;
        
        marker.bindPopup(popupContent);
        
        // Add click event for details button within popup
        marker.on('popupopen', function() {
            const detailsBtn = document.querySelector(`.view-details-btn[data-report-id="${report.id}"]`);
            if (detailsBtn) {
                detailsBtn.addEventListener('click', function() {
                    openReportDetailModal(report.id);
                });
            }
        });
        
        markers.push(marker);
    });
    
    // If there are markers, fit the map to show all markers
    if (markers.length > 0) {
        const group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
    }
}

/**
 * Create a custom marker icon based on severity level
 */
function createSeverityMarker(severity) {
    let color;
    
    switch (severity) {
        case 'low':
            color = '#27ae60'; // Green
            break;
        case 'medium':
            color = '#f39c12'; // Orange
            break;
        case 'high':
            color = '#e74c3c'; // Red
            break;
        case 'critical':
            color = '#8e44ad'; // Purple
            break;
        default:
            color = '#3498db'; // Blue
    }
    
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white;"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
    });
}

/**
 * Update table view with filtered reports
 */
function updateTableView(reports) {
    const tableBody = document.getElementById('reports-table-body');
    tableBody.innerHTML = '';
    
    // Apply filters and sorting
    const filteredReports = applyFilters(reports);
    const sortedReports = applySorting(filteredReports);
    
    // Calculate pagination
    const totalPages = Math.ceil(sortedReports.length / reportsPerPage);
    const startIndex = (currentPage - 1) * reportsPerPage;
    const endIndex = Math.min(startIndex + reportsPerPage, sortedReports.length);
    
    // Display current page of reports
    for (let i = startIndex; i < endIndex; i++) {
        const report = sortedReports[i];
        const row = document.createElement('tr');
        
        // Add severity class to row
        row.classList.add('severity-' + report.severity);
        
        // Format date for display
        const formattedDate = formatDate(report.detectionDate);
        
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${report.locationName}</td>
            <td>${capitalizeFirst(report.pestName)}</td>
            <td>${report.cropAffected}</td>
            <td><span class="severity-badge ${report.severity}">${capitalizeFirst(report.severity)}</span></td>
            <td>${formatStatus(report.status)}</td>
            <td class="actions">
                <button class="action-btn view-report" data-id="${report.id}" title="View on Map"><i class="fas fa-eye"></i></button>
                <button class="action-btn edit-report" data-id="${report.id}" title="Edit Report"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-report" data-id="${report.id}" title="Delete Report"><i class="fas fa-trash"></i></button>
            </td>
        `;
        
        tableBody.appendChild(row);
    }
    
    // Set up action buttons
    setupActionButtons();
    
    // Update pagination controls
    updatePagination(totalPages);
}

/**
 * Setup action buttons in the table
 */
function setupActionButtons() {
    // View report on map button
    const viewButtons = document.querySelectorAll('.view-report');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const reportId = this.getAttribute('data-id');
            const report = findReportById(reportId);
            
            if (report) {
                // Switch to map view
                document.querySelector('.view-btn[data-view="map"]').click();
                
                // Center map on report location
                const lat = parseFloat(report.locationLat);
                const lng = parseFloat(report.locationLng);
                
                if (!isNaN(lat) && !isNaN(lng)) {
                    map.setView([lat, lng], 15);
                    
                    // Find the marker and open its popup
                    markers.forEach(marker => {
                        const markerPos = marker.getLatLng();
                        if (markerPos.lat === lat && markerPos.lng === lng) {
                            marker.openPopup();
                        }
                    });
                }
            }
        });
    });
    
    // Edit report button
    const editButtons = document.querySelectorAll('.edit-report');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const reportId = this.getAttribute('data-id');
            openReportDetailModal(reportId);
        });
    });
    
    // Delete report button
    const deleteButtons = document.querySelectorAll('.delete-report');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const reportId = this.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
                deleteReport(reportId);
                showAlert('Report deleted successfully', 'success');
                loadReportData(); // Reload data after deletion
            }
        });
    });
}

/**
 * Find a report by its ID
 */
function findReportById(reportId) {
    return currentReports.find(report => report.id === reportId);
}

/**
 * Delete a report by ID
 */
function deleteReport(reportId) {
    // Get existing reports
    let reports = JSON.parse(localStorage.getItem('pestReports')) || [];
    
    // Filter out the report to delete
    reports = reports.filter(report => report.id !== reportId);
    
    // Save back to local storage
    localStorage.setItem('pestReports', JSON.stringify(reports));
    
    // Update current reports
    currentReports = reports;
    
    // Reload data to reflect changes
    loadReportData();
}

/**
 * Apply filters to reports data
 */
function applyFilters(reports) {
    const typeFilter = document.getElementById('filter-pest-type').value;
    const cropFilter = document.getElementById('filter-crop').value;
    const severityFilter = document.getElementById('filter-severity').value;
    const searchTerm = document.getElementById('report-search').value.toLowerCase();
    
    return reports.filter(report => {
        // Apply pest type filter
        if (typeFilter && report.reportType !== typeFilter) return false;
        
        // Apply crop filter
        if (cropFilter && !report.cropAffected.toLowerCase().includes(cropFilter.toLowerCase())) return false;
        
        // Apply severity filter
        if (severityFilter && report.severity !== severityFilter) return false;
        
        // Apply search term
        if (searchTerm) {
            const searchFields = [
                report.pestName,
                report.cropAffected,
                report.locationName,
                report.notes
            ].map(field => (field || '').toLowerCase());
            
            return searchFields.some(field => field.includes(searchTerm));
        }
        
        return true;
    });
}

/**
 * Apply sorting to reports data
 */
function applySorting(reports) {
    return [...reports].sort((a, b) => {
        let compareValueA, compareValueB;
        
        // Determine values to compare based on sort column
        switch (sortColumn) {
            case 'date':
                compareValueA = new Date(a.detectionDate);
                compareValueB = new Date(b.detectionDate);
                break;
            case 'location':
                compareValueA = a.locationName.toLowerCase();
                compareValueB = b.locationName.toLowerCase();
                break;
            case 'pest':
                compareValueA = a.pestName.toLowerCase();
                compareValueB = b.pestName.toLowerCase();
                break;
            case 'crop':
                compareValueA = a.cropAffected.toLowerCase();
                compareValueB = b.cropAffected.toLowerCase();
                break;
            case 'severity':
                // Severity order: critical > high > medium > low
                const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                compareValueA = severityOrder[a.severity] || 0;
                compareValueB = severityOrder[b.severity] || 0;
                break;
            case 'status':
                compareValueA = a.status.toLowerCase();
                compareValueB = b.status.toLowerCase();
                break;
            default:
                compareValueA = a[sortColumn];
                compareValueB = b[sortColumn];
        }
        
        // Apply sort direction
        let result = 0;
        if (compareValueA < compareValueB) result = -1;
        if (compareValueA > compareValueB) result = 1;
        
        return sortDirection === 'asc' ? result : -result;
    });
}

/**
 * Update pagination controls
 */
function updatePagination(totalPages) {
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');
    
    // Update page info text
    pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;
    
    // Update button states
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;
    
    // Add event listeners
    prevBtn.onclick = function() {
        if (currentPage > 1) {
            currentPage--;
            updateTableView(currentReports);
        }
    };
    
    nextBtn.onclick = function() {
        if (currentPage < totalPages) {
            currentPage++;
            updateTableView(currentReports);
        }
    };
}

/**
 * Set up table controls (sorting, filtering, search)
 */
function setupTableControls() {
    // Setup column sorting
    const sortableHeaders = document.querySelectorAll('.reports-table th');
    sortableHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const column = this.textContent.trim().toLowerCase().split(' ')[0];
            
            // Toggle sort direction if same column
            if (sortColumn === column) {
                sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                sortColumn = column;
                sortDirection = 'asc';
            }
            
            // Update table
            updateTableView(currentReports);
            
            // Update sort icons (you could add this feature)
        });
    });
    
    // Setup filters
    const filters = [
        document.getElementById('filter-pest-type'),
        document.getElementById('filter-crop'),
        document.getElementById('filter-severity')
    ];
    
    filters.forEach(filter => {
        if (filter) {
            filter.addEventListener('change', function() {
                currentPage = 1; // Reset to first page
                updateTableView(currentReports);
            });
        }
    });
    
    // Setup search
    const searchInput = document.getElementById('report-search');
    const searchButton = searchInput.nextElementSibling;
    
    const performSearch = function() {
        currentPage = 1; // Reset to first page
        updateTableView(currentReports);
    };
    
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

/**
 * Setup modal functionality
 */
function setupModals() {
    // Get modal elements
    const reportModal = document.getElementById('report-detail-modal');
    const treatmentModal = document.getElementById('treatment-modal');
    
    // Get close buttons
    const closeButtons = document.querySelectorAll('.close-modal');
    
    // Add close functionality
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            reportModal.style.display = 'none';
            treatmentModal.style.display = 'none';
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === reportModal) {
            reportModal.style.display = 'none';
        }
        if (event.target === treatmentModal) {
            treatmentModal.style.display = 'none';
        }
    });
    
    // Setup report delete button
    document.getElementById('delete-report-btn').addEventListener('click', function() {
        const reportId = this.getAttribute('data-report-id');
        deleteReport(reportId);
        reportModal.style.display = 'none';
    });
    
    // Setup report edit button (not implemented in this demo)
    document.getElementById('edit-report-btn').addEventListener('click', function() {
        const reportId = this.getAttribute('data-report-id');
        showAlert('Edit functionality is not implemented in this demo', 'info');
    });
}

/**
 * Open report detail modal for a specific report
 */
function openReportDetailModal(reportId) {
    // Find report data
    const report = currentReports.find(r => r.id === reportId);
    
    if (!report) {
        showAlert('Report not found', 'error');
        return;
    }
    
    // Populate modal content
    const modalContent = document.getElementById('report-detail-content');
    
    modalContent.innerHTML = `
        <div class="report-detail-section">
            <h3>Basic Information</h3>
            <div class="report-info-grid">
                <div class="report-info-item">
                    <div class="report-info-label">Pest/Disease Type</div>
                    <div class="report-info-value">${capitalizeFirst(report.reportType)}</div>
                </div>
                <div class="report-info-item">
                    <div class="report-info-label">Name</div>
                    <div class="report-info-value">${report.pestName}</div>
                </div>
                <div class="report-info-item">
                    <div class="report-info-label">Affected Crop</div>
                    <div class="report-info-value">${report.cropAffected}</div>
                </div>
                <div class="report-info-item">
                    <div class="report-info-label">Severity</div>
                    <div class="report-info-value">
                        <span class="severity-label severity-${report.severity}">${capitalizeFirst(report.severity)}</span>
                    </div>
                </div>
                <div class="report-info-item">
                    <div class="report-info-label">Status</div>
                    <div class="report-info-value">
                        <span class="status-label status-${report.status}">${formatStatus(report.status)}</span>
                    </div>
                </div>
                <div class="report-info-item">
                    <div class="report-info-label">Detection Date</div>
                    <div class="report-info-value">${formatDate(report.detectionDate)}</div>
                </div>
            </div>
        </div>
        
        <div class="report-detail-section">
            <h3>Location Details</h3>
            <div class="report-info-grid">
                <div class="report-info-item">
                    <div class="report-info-label">Location Name</div>
                    <div class="report-info-value">${report.locationName}</div>
                </div>
                <div class="report-info-item">
                    <div class="report-info-label">Area Affected</div>
                    <div class="report-info-value">${report.areaAffected} acres</div>
                </div>
                <div class="report-info-item">
                    <div class="report-info-label">Coordinates</div>
                    <div class="report-info-value">${report.locationLat}, ${report.locationLng}</div>
                </div>
            </div>
        </div>
        
        <div class="report-detail-section">
            <h3>Additional Notes</h3>
            <p>${report.notes || 'No additional notes provided.'}</p>
        </div>
        
        <div class="report-detail-section">
            <h3>Treatment Recommendations</h3>
            <button id="view-treatment-btn" class="btn primary-btn" data-pest="${report.pestName}">
                View Treatment Guide
            </button>
            </div>
        `;
    
    // Add event listener to treatment button
    document.getElementById('view-treatment-btn').addEventListener('click', function() {
        const pestName = this.getAttribute('data-pest');
        openTreatmentModal(pestName);
    });
    
    // Set report ID on delete and edit buttons
    document.getElementById('delete-report-btn').setAttribute('data-report-id', reportId);
    document.getElementById('edit-report-btn').setAttribute('data-report-id', reportId);
    
    // Show modal
    document.getElementById('report-detail-modal').style.display = 'block';
}

/**
 * Open treatment guide modal for a specific pest
 */
function openTreatmentModal(pestName) {
    // Simulate fetching treatment information
    const treatment = getTreatmentInfo(pestName);
    
    // Populate modal content
    const modalContent = document.getElementById('treatment-modal-content');
    
    modalContent.innerHTML = `
        <h2>Treatment Guide: ${treatment.name}</h2>
        
        <div class="treatment-section">
            <h3>About</h3>
            <p>${treatment.description}</p>
        </div>
        
        <div class="treatment-section">
            <h3>Common Symptoms</h3>
            <ul>
                ${treatment.symptoms.map(symptom => `<li>${symptom}</li>`).join('')}
                </ul>
        </div>
        
        <div class="treatment-section">
            <h3>Treatment Methods</h3>
            <div class="treatment-methods">
                ${treatment.methods.map(method => `
                    <div class="treatment-method">
                        <h4>${method.name}</h4>
                        <p>${method.description}</p>
                        ${method.application ? `<p><strong>Application:</strong> ${method.application}</p>` : ''}
                        ${method.effectiveness ? `<p><strong>Effectiveness:</strong> ${method.effectiveness}</p>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="treatment-section">
            <h3>Prevention</h3>
            <ul>
                ${treatment.prevention.map(item => `<li>${item}</li>`).join('')}
                </ul>
        </div>
    `;
    
    // Show modal
    document.getElementById('treatment-modal').style.display = 'block';
}

/**
 * Get treatment information for a pest (demo data)
 */
function getTreatmentInfo(pestName) {
    // In a real application, this would come from a database or API
    const treatments = {
        'Aphids': {
            name: 'Aphids',
            description: 'Aphids are small sap-sucking insects that can cause significant damage to crops by transmitting plant viruses and causing leaf curl, stunting, and reduced yield.',
            symptoms: [
                'Curled or distorted leaves',
                'Yellowing foliage',
                'Stunted growth',
                'Sticky residue on leaves (honeydew)',
                'Black sooty mold growing on honeydew',
                'Visible small insects on new growth or undersides of leaves'
            ],
            methods: [
                {
                    name: 'Biological Control',
                    description: 'Use natural predators such as ladybugs, lacewings, and parasitic wasps to control aphid populations.',
                    application: 'Release beneficial insects early when aphid populations are first detected.',
                    effectiveness: 'High for long-term management, requires time to establish'
                },
                {
                    name: 'Insecticidal Soap',
                    description: 'Mild insecticide that breaks down the outer layer of aphids causing dehydration and death.',
                    application: 'Spray directly on aphids, ensuring coverage of undersides of leaves. Apply weekly until infestation is controlled.',
                    effectiveness: 'Moderate to high for small infestations, requires direct contact'
                },
                {
                    name: 'Neem Oil',
                    description: 'Natural insecticide that disrupts feeding and reproduction in aphids.',
                    application: 'Mix 2-4 tablespoons per gallon of water and spray foliage thoroughly, including undersides of leaves.',
                    effectiveness: 'Moderate, best used preventatively or for light infestations'
                },
                {
                    name: 'Systemic Insecticides',
                    description: 'Chemical insecticides that are absorbed by the plant and kill aphids when they feed.',
                    application: 'Apply according to product instructions, typically as a soil drench or foliar spray.',
                    effectiveness: 'High, but may impact beneficial insects and pollinators'
                }
            ],
            prevention: [
                'Monitor crops regularly for early detection',
                'Maintain healthy plants with proper water and nutrients',
                'Plant aphid-repelling companions like garlic, onions, or chives',
                'Use reflective mulches to confuse aphids',
                'Remove heavily infested plant parts',
                'Control ant populations as they protect aphids from predators',
                'Avoid excessive nitrogen fertilization which promotes lush growth attractive to aphids'
            ]
        },
        'Powdery Mildew': {
            name: 'Powdery Mildew',
            description: 'Powdery mildew is a fungal disease that affects a wide range of plants, characterized by a white to gray powdery growth on leaves, stems, and sometimes fruit.',
            symptoms: [
                'White to gray powdery spots on leaves and stems',
                'Yellowing or browning of infected tissues',
                'Distorted or stunted growth',
                'Premature leaf drop',
                'Reduced yield and quality of fruit or flowers'
            ],
            methods: [
                {
                    name: 'Fungicides with Sulfur',
                    description: 'Sulfur-based fungicides prevent spore germination and inhibit fungal growth.',
                    application: 'Apply at first sign of infection, typically every 7-14 days. Do not apply when temperatures exceed 90°F (32°C).',
                    effectiveness: 'High as preventative, moderate as curative'
                },
                {
                    name: 'Potassium Bicarbonate',
                    description: 'Organic fungicide that alters pH on leaf surface, destroying the powdery mildew spores.',
                    application: 'Mix 1 tablespoon per gallon of water with a few drops of liquid soap. Spray thoroughly on all plant surfaces.',
                    effectiveness: 'Moderate to high, especially on early infections'
                },
                {
                    name: 'Milk Spray',
                    description: 'Natural fungicide using diluted milk (1:10 ratio of milk to water).',
                    application: 'Spray on infected plants every 7-10 days, preferably in morning so it can dry completely.',
                    effectiveness: 'Low to moderate, best for light infections'
                },
                {
                    name: 'Synthetic Fungicides',
                    description: 'Chemical fungicides specifically designed to control powdery mildew.',
                    application: 'Follow product instructions precisely, typically applied every 7-14 days.',
                    effectiveness: 'High, but may require rotation to prevent resistance'
                }
            ],
            prevention: [
                'Plant resistant varieties when available',
                'Ensure proper spacing between plants for good air circulation',
                'Avoid overhead watering to keep foliage dry',
                'Water at the base of plants, preferably in the morning',
                'Remove and destroy infected plant parts promptly',
                'Avoid excessive nitrogen fertilization',
                'Clean tools and equipment after working with infected plants',
                'Practice crop rotation with non-susceptible plants'
            ]
        },
        'Late Blight': {
            name: 'Late Blight',
            description: 'Late blight is a devastating plant disease caused by the water mold Phytophthora infestans. It affects potatoes and tomatoes primarily, capable of destroying entire crops rapidly in favorable conditions.',
            symptoms: [
                'Dark, water-soaked spots on leaves, often with pale green borders',
                'White fuzzy growth on undersides of leaves in humid conditions',
                'Dark lesions on stems',
                'Firm, brown spots on potatoes or tomato fruits that may become soft',
                'Rapid wilting and death of foliage in wet conditions',
                'Distinctive unpleasant odor from infected tissue'
            ],
            methods: [
                {
                    name: 'Copper Fungicides',
                    description: 'Broad-spectrum fungicide that prevents infection by destroying spores before they can germinate.',
                    application: 'Apply every 5-7 days during wet weather or when disease threatens. Must be applied before infection occurs.',
                    effectiveness: 'Moderate as preventative only, not curative'
                },
                {
                    name: 'Chlorothalonil',
                    description: 'Protective fungicide that prevents spore germination.',
                    application: 'Apply every 5-10 days when conditions favor disease. Complete coverage is essential.',
                    effectiveness: 'High as preventative, not effective on existing infections'
                },
                {
                    name: 'Systemic Fungicides',
                    description: 'Chemical fungicides that move through plant tissues to protect uninfected parts and sometimes suppress existing infections.',
                    application: 'Apply according to product instructions, typically every 7-14 days.',
                    effectiveness: 'High, especially combination products with both protective and systemic activities'
                },
                {
                    name: 'Crop Removal',
                    description: 'Complete removal and destruction of infected plants to prevent spread.',
                    application: 'Remove all infected plant material, bag it, and remove from garden. Do not compost.',
                    effectiveness: 'Necessary for limiting spread, but not a treatment'
                }
            ],
            prevention: [
                'Plant resistant varieties',
                'Purchase certified disease-free seed potatoes',
                'Avoid overhead irrigation; use drip irrigation instead',
                'Increase plant spacing to improve air circulation',
                'Rotate crops with non-host plants for at least 2-3 years',
                'Remove volunteer potatoes and tomatoes',
                'Apply preventative fungicides before disease appears',
                'Destroy all infected plant material; never compost it',
                'Clean tools and equipment after use on infected plants',
                'Hill potato plants well to protect tubers from spores'
            ]
        }
    };
    
    // Return treatment info or a default if not found
    return treatments[pestName] || {
        name: pestName,
        description: `Information for ${pestName} is currently being compiled.`,
        symptoms: ['Symptoms vary depending on crop and conditions.'],
        methods: [
            {
                name: 'Consult an Expert',
                description: 'For the most accurate treatment recommendations, consult with a local agricultural extension service or pest management specialist.',
                application: 'Contact your local agricultural extension office for specific guidance.',
                effectiveness: 'Varies based on implementation of recommendations'
            }
        ],
        prevention: [
            'Regular monitoring for early detection',
            'Maintain plant health through proper nutrition and irrigation',
            'Practice crop rotation',
            'Remove potentially infected plant debris',
            'Use resistant varieties when available'
        ]
    };
}

/**
 * Setup treatment guide search
 */
function setupTreatmentSearch() {
    const searchInput = document.getElementById('treatment-search');
    const searchButton = searchInput.nextElementSibling;
    
    const performSearch = function() {
        const searchTerm = searchInput.value.trim();
        
        if (!searchTerm) return;
        
        // Simulate a search
        const results = [
            { name: 'Aphids', type: 'insect', crops: 'Various' },
            { name: 'Powdery Mildew', type: 'disease', crops: 'Various' },
            { name: 'Late Blight', type: 'disease', crops: 'Potato, Tomato' }
        ].filter(item => 
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.crops.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        // Display results
        const container = document.getElementById('treatment-guides');
        
        if (results.length === 0) {
            container.innerHTML = `
                <div class="guide-preview">
                    <p>No treatment guides found for "${searchTerm}". Try a different search term.</p>
                </div>
            `;
        } else {
            container.innerHTML = results.map(result => `
                <div class="guide-preview">
                    <h4>${result.name}</h4>
                    <p>Type: ${capitalizeFirst(result.type)}</p>
                    <p>Common in: ${result.crops}</p>
                    <button class="btn primary-btn btn-sm view-treatment-btn" data-pest="${result.name}">
                        View Guide
                    </button>
                </div>
            `).join('');
            
            // Add event listeners to buttons
            document.querySelectorAll('.view-treatment-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const pestName = this.getAttribute('data-pest');
                    openTreatmentModal(pestName);
                });
            });
        }
    };
    
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

/**
 * Update alerts in the sidebar based on recent high-severity reports
 */
function updateAlerts(reports) {
    const container = document.getElementById('alerts-container');
    
    // Filter to recent high-severity reports (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const alertReports = reports.filter(report => {
        const reportDate = new Date(report.detectionDate);
        return reportDate >= thirtyDaysAgo && ['high', 'critical'].includes(report.severity);
    });
    
    // Sort by date (newest first)
    alertReports.sort((a, b) => new Date(b.detectionDate) - new Date(a.detectionDate));
    
    // Take top 5 alerts
    const recentAlerts = alertReports.slice(0, 5);
    
    if (recentAlerts.length === 0) {
        container.innerHTML = '<p class="no-alerts-message">No recent alerts in your area.</p>';
    } else {
        container.innerHTML = recentAlerts.map(alert => `
            <div class="alert-item ${alert.severity}">
                <div class="alert-header">
                    <span class="alert-title">${alert.pestName} on ${alert.cropAffected}</span>
                    <span class="alert-date">${formatDate(alert.detectionDate)}</span>
                </div>
                <p class="alert-message">
                    <strong>${capitalizeFirst(alert.severity)} severity</strong> detected at ${alert.locationName}.
                    <a href="#" class="alert-details-link" data-report-id="${alert.id}">Details</a>
                </p>
            </div>
        `).join('');
        
        // Add event listeners to detail links
        document.querySelectorAll('.alert-details-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const reportId = this.getAttribute('data-report-id');
                openReportDetailModal(reportId);
            });
        });
    }
}

/**
 * Display an alert message to the user
 */
function showAlert(message, type = 'info') {
    // Create alert element
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type}`;
    alertElement.innerHTML = `
        <span class="alert-message">${message}</span>
        <button class="alert-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add to page
    document.body.appendChild(alertElement);
    
    // Add close button functionality
    alertElement.querySelector('.alert-close').addEventListener('click', function() {
        alertElement.remove();
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (document.body.contains(alertElement)) {
            alertElement.remove();
        }
    }, 5000);
}

/**
 * Utility function to generate a unique ID
 */
function generateUniqueId() {
    return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

/**
 * Utility function to format a date string
 */
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

/**
 * Utility function to format month and year
 */
function formatMonthYear(yearMonth) {
    const [year, month] = yearMonth.split('-');
    return new Date(year, month - 1).toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
}

/**
 * Utility function to format status text
 */
function formatStatus(status) {
    switch (status) {
        case 'new': return 'New';
        case 'investigating': return 'Investigating';
        case 'treating': return 'Treating';
        case 'resolved': return 'Resolved';
        case 'monitoring': return 'Monitoring';
        default: return capitalizeFirst(status);
    }
}

/**
 * Utility function to capitalize first letter
 */
function capitalizeFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
} 