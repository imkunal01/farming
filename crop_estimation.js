document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const cropForm = document.getElementById('crop-form');
    const resultContainer = document.getElementById('result-container');
    const recalculateBtn = document.getElementById('recalculate-btn');
    const saveResultBtn = document.getElementById('save-result-btn');
    
    // Result elements
    const resultCrop = document.getElementById('result-crop');
    const resultArea = document.getElementById('result-area');
    const resultYield = document.getElementById('result-yield');
    const resultTotal = document.getElementById('result-total');
    const resultQuality = document.getElementById('result-quality');
    const resultConfidence = document.getElementById('result-confidence');
    
    // Base yield data for different crops in tons/hectare (average values)
    const cropBaseYield = {
        'wheat': 3.5,
        'rice': 4.2,
        'maize': 5.5,
        'barley': 3.0,
        'sugarcane': 70.0,
        'cotton': 1.8,
        'soybean': 2.8,
        'potato': 25.0,
        'tomato': 35.0,
        'onion': 40.0,
        'garlic': 20.0,
        'ginger': 15.0,
        'chilli': 10.0,
        'beans': 12.0,
        'cucumber': 18.0
    };
    
    // Soil type impact factors
    const soilFactors = {
        'wheat': { 'loamy': 1.2, 'sandy': 0.8, 'clay': 0.9, 'silt': 1.1, 'chalky': 0.85, 'peaty': 0.9 },
        'rice': { 'loamy': 1.0, 'sandy': 0.7, 'clay': 1.2, 'silt': 1.1, 'chalky': 0.7, 'peaty': 0.9 },
        'maize': { 'loamy': 1.2, 'sandy': 0.9, 'clay': 0.8, 'silt': 1.1, 'chalky': 0.8, 'peaty': 1.0 },
        'barley': { 'loamy': 1.1, 'sandy': 0.9, 'clay': 0.8, 'silt': 1.0, 'chalky': 0.9, 'peaty': 0.9 },
        'sugarcane': { 'loamy': 1.2, 'sandy': 0.8, 'clay': 1.0, 'silt': 1.1, 'chalky': 0.7, 'peaty': 1.0 },
        'cotton': { 'loamy': 1.2, 'sandy': 0.9, 'clay': 0.9, 'silt': 1.1, 'chalky': 0.8, 'peaty': 0.8 },
        'soybean': { 'loamy': 1.2, 'sandy': 0.8, 'clay': 0.9, 'silt': 1.1, 'chalky': 0.8, 'peaty': 1.0 },
        'potato': { 'loamy': 1.3, 'sandy': 1.1, 'clay': 0.7, 'silt': 1.0, 'chalky': 0.8, 'peaty': 1.2 },
        'tomato': { 'loamy': 1.2, 'sandy': 0.9, 'clay': 0.8, 'silt': 1.0, 'chalky': 0.8, 'peaty': 1.1 },
        'onion': { 'loamy': 1.2, 'sandy': 1.0, 'clay': 0.8, 'silt': 1.1, 'chalky': 0.9, 'peaty': 1.1 }
    };
    
    // Irrigation method impact factors
    const irrigationFactors = {
        'drip': 1.3,
        'sprinkler': 1.2,
        'flood': 1.0,
        'furrow': 1.1,
        'rainFed': 0.8
    };
    
    // Pest pressure impact factors
    const pestFactors = {
        'none': 1.0,
        'low': 0.9,
        'medium': 0.75,
        'high': 0.5
    };
    
    // Fertilizer application impact factors
    const fertilizerFactors = {
        'none': 0.7,
        'low': 0.9,
        'medium': 1.1,
        'high': 1.3
    };
    
    // Season suitability factors for each crop
    const seasonFactors = {
        'wheat': { 'winter': 1.2, 'spring': 1.0, 'summer': 0.7, 'autumn': 1.1 },
        'rice': { 'winter': 0.6, 'spring': 0.9, 'summer': 1.3, 'autumn': 0.8 },
        'maize': { 'winter': 0.6, 'spring': 1.1, 'summer': 1.3, 'autumn': 0.9 },
        'barley': { 'winter': 1.2, 'spring': 1.1, 'summer': 0.8, 'autumn': 1.0 },
        'sugarcane': { 'winter': 0.8, 'spring': 1.1, 'summer': 1.3, 'autumn': 1.0 },
        'cotton': { 'winter': 0.5, 'spring': 1.0, 'summer': 1.3, 'autumn': 0.9 },
        'soybean': { 'winter': 0.6, 'spring': 1.1, 'summer': 1.2, 'autumn': 0.9 },
        'potato': { 'winter': 0.8, 'spring': 1.2, 'summer': 1.1, 'autumn': 1.0 },
        'tomato': { 'winter': 0.6, 'spring': 1.1, 'summer': 1.3, 'autumn': 0.9 },
        'onion': { 'winter': 1.0, 'spring': 1.2, 'summer': 0.9, 'autumn': 1.1 }
    };
    
    // Experience impact factor
    function getExperienceFactor(years) {
        if (years < 2) return 0.9;
        if (years < 5) return 1.0;
        if (years < 10) return 1.1;
        if (years < 20) return 1.15;
        return 1.2;
    }
    
    // Initialize form
    initForm();
    
    function initForm() {
        // Handle form submission
        if (cropForm) {
            cropForm.addEventListener('submit', function(e) {
                e.preventDefault();
                calculateEstimate();
            });
        }
        
        // Handle recalculate button
        if (recalculateBtn) {
            recalculateBtn.addEventListener('click', function() {
                resultContainer.style.display = 'none';
                cropForm.style.display = 'block';
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
        
        // Handle save result button
        if (saveResultBtn) {
            saveResultBtn.addEventListener('click', function() {
                saveResult();
            });
        }
    }
    
    // Calculate crop yield estimate
    function calculateEstimate() {
        // Get form values
        const cropType = document.getElementById('crop-type').value;
        const landArea = parseFloat(document.getElementById('land-area').value);
        const soilType = document.getElementById('soil-type').value;
        const irrigation = document.getElementById('irrigation').value;
        const pestPressure = document.getElementById('pest-factor').value;
        const fertilizer = document.getElementById('fertilizer').value;
        const season = document.getElementById('season').value;
        const experience = parseInt(document.getElementById('experience').value);
        
        // Calculate base yield
        let baseYield = cropBaseYield[cropType] || 0;
        
        // Apply soil factor
        const soilFactor = soilFactors[cropType]?.[soilType] || 1.0;
        
        // Apply irrigation factor
        const irrigationFactor = irrigationFactors[irrigation] || 1.0;
        
        // Apply pest pressure factor
        const pestFactor = pestFactors[pestPressure] || 1.0;
        
        // Apply fertilizer factor
        const fertilizerFactor = fertilizerFactors[fertilizer] || 1.0;
        
        // Apply season factor
        const seasonFactor = seasonFactors[cropType]?.[season] || 1.0;
        
        // Apply experience factor
        const experienceFactor = getExperienceFactor(experience);
        
        // Calculate final yield estimate
        const yieldEstimate = baseYield * soilFactor * irrigationFactor * pestFactor * fertilizerFactor * seasonFactor * experienceFactor;
        
        // Calculate total production
        const totalProduction = yieldEstimate * landArea;
        
        // Determine quality factor
        let qualityFactor = "Medium";
        if (fertilizerFactor > 1.1 && pestFactor > 0.8 && soilFactor > 1.0) {
            qualityFactor = "High";
        } else if (fertilizerFactor < 0.9 || pestFactor < 0.7) {
            qualityFactor = "Low";
        }
        
        // Determine confidence level
        let confidenceLevel = "Medium (±20%)";
        if (experience > 10 && seasonFactor > 1.0) {
            confidenceLevel = "High (±10%)";
        } else if (experience < 3 || seasonFactor < 0.8) {
            confidenceLevel = "Low (±30%)";
        }
        
        // Display results
        displayResults({
            crop: cropType,
            area: landArea,
            yield: yieldEstimate.toFixed(2),
            total: totalProduction.toFixed(2),
            quality: qualityFactor,
            confidence: confidenceLevel
        });
        
        // Hide form and show results
        cropForm.style.display = 'none';
        resultContainer.style.display = 'block';
        
        // Scroll to results
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Display results
    function displayResults(results) {
        // Format crop name for display
        const cropName = results.crop.charAt(0).toUpperCase() + results.crop.slice(1);
        
        // Update result elements
        resultCrop.textContent = cropName;
        resultArea.textContent = results.area;
        resultYield.textContent = results.yield;
        resultTotal.textContent = results.total;
        resultQuality.textContent = results.quality;
        resultConfidence.textContent = results.confidence;
        
        // Add animation effect
        resultContainer.classList.add('animate');
        setTimeout(() => {
            resultContainer.classList.remove('animate');
        }, 1000);
    }
    
    // Save result
    function saveResult() {
        // Get current results
        const results = {
            crop: resultCrop.textContent,
            area: resultArea.textContent,
            yield: resultYield.textContent,
            total: resultTotal.textContent,
            quality: resultQuality.textContent,
            confidence: resultConfidence.textContent,
            date: new Date().toISOString()
        };
        
        // Get saved results from localStorage
        let savedResults = JSON.parse(localStorage.getItem('cropEstimates') || '[]');
        
        // Add current result
        savedResults.push(results);
        
        // Save back to localStorage
        localStorage.setItem('cropEstimates', JSON.stringify(savedResults));
        
        // Show success message
        showToast('Estimate saved successfully!', 'success');
        
        // Optional: Save to server using AJAX
        sendResultToServer(results);
    }
    
    // Send result to server (optional)
    function sendResultToServer(results) {
        // You can implement this function to send data to your server
        // using fetch or XMLHttpRequest if you want to store results in a database
        
        // Example using fetch:
        fetch('save_estimate.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(results),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Result saved to server successfully');
            } else {
                console.error('Failed to save result to server');
            }
        })
        .catch(error => {
            console.error('Error saving result to server:', error);
        });
    }
    
    // Show toast notification
    function showToast(message, type = 'info') {
        // Create toast element if it doesn't exist
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        
        // Set toast content and type
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        
        // Hide toast after 3 seconds
        setTimeout(() => {
            toast.className = toast.className.replace('show', '');
        }, 3000);
    }
}); 