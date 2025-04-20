// Crop Rotation Planner JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Initialize variables
    let currentYear = 1;
    let yearCount = 4; // Default 4 years
    const cropGroups = {
        'legumes': ['peas', 'beans', 'lentils'],
        'root': ['potatoes', 'carrots', 'beets'],
        'leafy': ['lettuce', 'spinach', 'kale'],
        'fruit': ['tomatoes', 'peppers', 'strawberries'],
        'grains': ['wheat', 'corn', 'rice']
    };
    
    // Seasonal crops data
    const seasonalCrops = {
        'spring': ['peas', 'potatoes', 'lettuce', 'spinach', 'carrots'],
        'summer': ['tomatoes', 'peppers', 'corn', 'beans', 'strawberries'],
        'fall': ['kale', 'spinach', 'lettuce', 'beets', 'carrots'],
        'winter': ['wheat', 'rice', 'kale']
    };
    
    // Compatibility matrix (simplified for demo)
    const cropCompatibility = {
        'legumes': {
            'after': ['fruit', 'leafy'],
            'before': ['root', 'fruit'],
            'nutrients': { 'nitrogen': 5, 'phosphorus': 2, 'potassium': 3 }
        },
        'root': {
            'after': ['legumes', 'leafy'],
            'before': ['leafy', 'fruit'],
            'nutrients': { 'nitrogen': 2, 'phosphorus': 4, 'potassium': 5 }
        },
        'leafy': {
            'after': ['root', 'legumes'],
            'before': ['legumes', 'fruit'],
            'nutrients': { 'nitrogen': 4, 'phosphorus': 3, 'potassium': 4 }
        },
        'fruit': {
            'after': ['legumes', 'root'],
            'before': ['leafy', 'grains'],
            'nutrients': { 'nitrogen': 3, 'phosphorus': 5, 'potassium': 4 }
        },
        'grains': {
            'after': ['legumes', 'root'],
            'before': ['legumes', 'root'],
            'nutrients': { 'nitrogen': 3, 'phosphorus': 3, 'potassium': 2 }
        }
    };
    
    // Suggested crop rotations by soil type and year
    const suggestedRotations = {
        'clay': {
            'year1': {
                'spring': 'peas',
                'summer': 'corn',
                'fall': 'kale',
                'winter': 'wheat'
            },
            'year2': {
                'spring': 'potatoes',
                'summer': 'tomatoes',
                'fall': 'spinach',
                'winter': ''
            },
            'year3': {
                'spring': 'beans',
                'summer': 'peppers',
                'fall': 'lettuce',
                'winter': ''
            },
            'year4': {
                'spring': 'carrots',
                'summer': 'corn',
                'fall': 'lentils',
                'winter': 'wheat'
            }
        },
        'sandy': {
            'year1': {
                'spring': 'carrots',
                'summer': 'beans',
                'fall': 'spinach',
                'winter': ''
            },
            'year2': {
                'spring': 'peas',
                'summer': 'tomatoes',
                'fall': 'lettuce',
                'winter': ''
            },
            'year3': {
                'spring': 'potatoes',
                'summer': 'peppers',
                'fall': 'kale',
                'winter': ''
            },
            'year4': {
                'spring': 'beans',
                'summer': 'corn',
                'fall': 'beets',
                'winter': 'rice'
            }
        },
        'loamy': {
            'year1': {
                'spring': 'peas',
                'summer': 'tomatoes',
                'fall': 'spinach',
                'winter': 'wheat'
            },
            'year2': {
                'spring': 'potatoes',
                'summer': 'corn',
                'fall': 'kale',
                'winter': ''
            },
            'year3': {
                'spring': 'beans',
                'summer': 'peppers',
                'fall': 'lettuce',
                'winter': 'rice'
            },
            'year4': {
                'spring': 'carrots',
                'summer': 'strawberries',
                'fall': 'lentils',
                'winter': ''
            }
        },
        'silty': {
            'year1': {
                'spring': 'potatoes',
                'summer': 'peppers',
                'fall': 'kale',
                'winter': ''
            },
            'year2': {
                'spring': 'beans',
                'summer': 'corn',
                'fall': 'spinach',
                'winter': 'wheat'
            },
            'year3': {
                'spring': 'carrots',
                'summer': 'tomatoes',
                'fall': 'lettuce',
                'winter': ''
            },
            'year4': {
                'spring': 'peas',
                'summer': 'strawberries',
                'fall': 'beets',
                'winter': 'rice'
            }
        },
        'peaty': {
            'year1': {
                'spring': 'carrots',
                'summer': 'corn',
                'fall': 'kale',
                'winter': ''
            },
            'year2': {
                'spring': 'peas',
                'summer': 'peppers',
                'fall': 'spinach',
                'winter': 'wheat'
            },
            'year3': {
                'spring': 'potatoes',
                'summer': 'tomatoes',
                'fall': 'lettuce',
                'winter': ''
            },
            'year4': {
                'spring': 'beans',
                'summer': 'strawberries',
                'fall': 'beets',
                'winter': 'rice'
            }
        },
        'chalky': {
            'year1': {
                'spring': 'peas',
                'summer': 'tomatoes',
                'fall': 'spinach',
                'winter': ''
            },
            'year2': {
                'spring': 'beans',
                'summer': 'corn',
                'fall': 'lettuce',
                'winter': 'wheat'
            },
            'year3': {
                'spring': 'carrots',
                'summer': 'peppers',
                'fall': 'kale',
                'winter': ''
            },
            'year4': {
                'spring': 'potatoes',
                'summer': 'strawberries',
                'fall': 'beets',
                'winter': 'rice'
            }
        }
    };
    
    // Get crop type from crop name
    const getCropType = (cropName) => {
        for (const [type, crops] of Object.entries(cropGroups)) {
            if (crops.includes(cropName)) {
                return type;
            }
        }
        return null;
    };
    
    // DOM Elements
    const addYearBtn = document.getElementById('add-year');
    const rotationYears = document.querySelector('.rotation-years');
    const yearTabs = document.querySelectorAll('.year-tab');
    const saveBtn = document.getElementById('save-plan');
    const printBtn = document.getElementById('print-plan');
    const exportBtn = document.getElementById('export-plan');
    const clearBtn = document.getElementById('clear-plan');
    const addFieldBtn = document.getElementById('add-field');
    const soilTypeSelect = document.getElementById('soil-type');
    const suggestRotationBtn = document.getElementById('suggest-rotation');
    const suggestAllSeasonsBtn = document.getElementById('suggest-all-seasons');
    
    // Create seasonal suggestion buttons
    document.querySelectorAll('.season-header .season-label').forEach(label => {
        const season = label.textContent.toLowerCase();
        const suggestBtn = document.createElement('button');
        suggestBtn.className = 'suggest-season-btn';
        suggestBtn.title = `Suggest ${season} crops`;
        suggestBtn.innerHTML = '<i class="fas fa-lightbulb"></i>';
        suggestBtn.dataset.season = season;
        suggestBtn.addEventListener('click', () => suggestSeasonalCrops(season));
        label.appendChild(suggestBtn);
    });
    
    // Function to suggest seasonal crops
    function suggestSeasonalCrops(season) {
        if (!seasonalCrops[season]) {
            alert(`No crop suggestions available for ${season}.`);
            return;
        }
        
        // Find all slots for this season across all years
        const seasonSlots = document.querySelectorAll(`.season-slot[data-season="${season}"]`);
        
        seasonSlots.forEach(slot => {
            const yearNum = parseInt(slot.dataset.year);
            const selectElement = slot.querySelector('.crop-select');
            
            if (selectElement) {
                // Get a random crop from seasonal options
                const seasonOptions = seasonalCrops[season];
                
                // Try to avoid the same crop in consecutive years for the same season
                let availableCrops = [...seasonOptions];
                
                // If we're past year 1, check what was in the previous year
                if (yearNum > 1) {
                    const prevYearSlot = document.querySelector(`.season-slot[data-season="${season}"][data-year="${yearNum-1}"]`);
                    if (prevYearSlot) {
                        const prevYearCrop = prevYearSlot.querySelector('.crop-select').value;
                        // Remove the previous year's crop from options if possible
                        if (prevYearCrop && availableCrops.length > 1) {
                            availableCrops = availableCrops.filter(crop => crop !== prevYearCrop);
                        }
                    }
                }
                
                const randomCrop = availableCrops[Math.floor(Math.random() * availableCrops.length)];
                
                // Set the value
                selectElement.value = randomCrop;
            }
        });
        
        // Update recommendations
        updateRecommendations();
        
        showSeasonalSuggestionMessage(season);
    }
    
    // Function to show seasonal suggestion message
    function showSeasonalSuggestionMessage(season) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message success';
        messageElement.innerHTML = `<i class="fas fa-check-circle"></i> Applied ${season} crop suggestions.`;
        
        const rotationPlan = document.querySelector('.rotation-plan');
        rotationPlan.insertBefore(messageElement, rotationPlan.firstChild);
        
        // Remove message after 3 seconds
        setTimeout(() => {
            messageElement.remove();
        }, 3000);
    }
    
    // Add event listener for suggest rotation button
    suggestRotationBtn.addEventListener('click', () => {
        const soilType = soilTypeSelect.value;
        applySuggestedRotation(soilType);
    });
    
    // Function to apply suggested rotation based on soil type
    function applySuggestedRotation(soilType) {
        if (!suggestedRotations[soilType]) {
            alert('No suggested rotation found for this soil type.');
            return;
        }
        
        // Apply for all years (up to 4 by default)
        for (let year = 1; year <= yearCount; year++) {
            const yearKey = `year${year}`;
            if (suggestedRotations[soilType][yearKey]) {
                const seasons = ['spring', 'summer', 'fall', 'winter'];
                seasons.forEach(season => {
                    const selector = `.season-slot[data-year="${year}"][data-season="${season}"] .crop-select`;
                    const selectElement = document.querySelector(selector);
                    if (selectElement && suggestedRotations[soilType][yearKey][season]) {
                        selectElement.value = suggestedRotations[soilType][yearKey][season];
                    }
                });
            }
        }
        
        // Update recommendations after applying suggested rotation
        updateRecommendations();
    }
    
    // Add year button event listener
    addYearBtn.addEventListener('click', () => {
        yearCount++;
        
        // Create new year tab
        const newYearTab = document.createElement('button');
        newYearTab.className = 'year-tab';
        newYearTab.dataset.year = yearCount;
        newYearTab.textContent = `Year ${yearCount}`;
        
        // Insert before the add button
        rotationYears.insertBefore(newYearTab, addYearBtn);
        
        // Create season crops container for the new year
        const seasonContainer = document.querySelector('.season-planner');
        const yearCropsDiv = document.createElement('div');
        yearCropsDiv.className = 'season-crops';
        yearCropsDiv.id = `year-${yearCount}-crops`;
        yearCropsDiv.style.display = 'none'; // Hide initially
        
        // Create season slots
        const seasons = ['spring', 'summer', 'fall', 'winter'];
        seasons.forEach(season => {
            const seasonSlot = document.createElement('div');
            seasonSlot.className = `season-slot ${season}-slot`;
            seasonSlot.dataset.season = season;
            seasonSlot.dataset.year = yearCount;
            
            const cropSelector = document.createElement('div');
            cropSelector.className = 'crop-selector';
            
            const select = document.createElement('select');
            select.className = 'crop-select';
            select.innerHTML = `
                <option value="">Select Crop</option>
                <optgroup label="Legumes">
                    <option value="peas">Peas</option>
                    <option value="beans">Beans</option>
                    <option value="lentils">Lentils</option>
                </optgroup>
                <optgroup label="Root Vegetables">
                    <option value="potatoes">Potatoes</option>
                    <option value="carrots">Carrots</option>
                    <option value="beets">Beets</option>
                </optgroup>
                <optgroup label="Leafy Greens">
                    <option value="lettuce">Lettuce</option>
                    <option value="spinach">Spinach</option>
                    <option value="kale">Kale</option>
                </optgroup>
                <optgroup label="Grains">
                    <option value="wheat">Wheat</option>
                    <option value="corn">Corn</option>
                    <option value="rice">Rice</option>
                </optgroup>
                <optgroup label="Fruits">
                    <option value="tomatoes">Tomatoes</option>
                    <option value="peppers">Peppers</option>
                    <option value="strawberries">Strawberries</option>
                </optgroup>
            `;
            
            // Add event listener to crop select
            select.addEventListener('change', updateRecommendations);
            
            cropSelector.appendChild(select);
            seasonSlot.appendChild(cropSelector);
            yearCropsDiv.appendChild(seasonSlot);
        });
        
        seasonContainer.appendChild(yearCropsDiv);
        
        // Add event listener to the new year tab
        newYearTab.addEventListener('click', () => {
            switchYear(yearCount);
        });
    });
    
    // Year tab event listeners
    yearTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const year = parseInt(this.dataset.year);
            switchYear(year);
        });
    });
    
    // Switch between years
    function switchYear(year) {
        // Update active tab
        document.querySelectorAll('.year-tab').forEach(tab => {
            tab.classList.remove('active');
            if (parseInt(tab.dataset.year) === year) {
                tab.classList.add('active');
            }
        });
        
        // Hide all year crop divs
        document.querySelectorAll('.season-crops').forEach(div => {
            div.style.display = 'none';
        });
        
        // Show selected year
        const yearCrops = document.getElementById(`year-${year}-crops`);
        if (yearCrops) {
            yearCrops.style.display = 'grid';
        }
        
        currentYear = year;
    }
    
    // Function to validate field input
    function validateFieldInput() {
        const fieldName = document.getElementById('field-name').value.trim();
        const fieldSize = document.getElementById('field-size').value;
        const fieldNameError = document.getElementById('field-name-error');
        const fieldSizeError = document.getElementById('field-size-error');
        let isValid = true;
        
        // Reset error messages
        fieldNameError.textContent = '';
        fieldSizeError.textContent = '';
        
        if (!fieldName) {
            fieldNameError.textContent = 'Field name is required';
            isValid = false;
        }
        
        if (!fieldSize) {
            fieldSizeError.textContent = 'Field size is required';
            isValid = false;
        } else if (parseFloat(fieldSize) <= 0) {
            fieldSizeError.textContent = 'Field size must be greater than 0';
            isValid = false;
        }
        
        return isValid;
    }
    
    // Add field button
    addFieldBtn.addEventListener('click', () => {
        if (!validateFieldInput()) {
            return;
        }
        
        const fieldName = document.getElementById('field-name').value.trim();
        const fieldSize = document.getElementById('field-size').value;
        const soilType = document.getElementById('soil-type').value;
        
        // Create a field object
        const field = {
            name: fieldName,
            size: parseFloat(fieldSize),
            soil: soilType,
            date: new Date()
        };
        
        // Store field info in local storage (temporary solution)
        const fields = JSON.parse(localStorage.getItem('crop_planner_fields') || '[]');
        fields.push(field);
        localStorage.setItem('crop_planner_fields', JSON.stringify(fields));
        
        // Clear form
        document.getElementById('field-name').value = '';
        document.getElementById('field-size').value = '';
        
        // Update UI to show the field was added
        showFieldAddedMessage(fieldName);
        
        // Suggest rotation based on soil type
        if (confirm(`Would you like to apply the suggested rotation for ${soilType} soil?`)) {
            applySuggestedRotation(soilType);
        }
    });
    
    // Function to show field added message
    function showFieldAddedMessage(fieldName) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message success';
        messageElement.innerHTML = `<i class="fas fa-check-circle"></i> Field "${fieldName}" added successfully!`;
        
        const fieldInfo = document.querySelector('.field-info');
        fieldInfo.appendChild(messageElement);
        
        // Remove message after 3 seconds
        setTimeout(() => {
            messageElement.remove();
        }, 3000);
        
        // Update the saved fields display
        displaySavedFields();
    }
    
    // Function to display saved fields
    function displaySavedFields() {
        const fieldsContainer = document.getElementById('saved-fields-container');
        const savedFields = JSON.parse(localStorage.getItem('crop_planner_fields') || '[]');
        
        if (savedFields.length === 0) {
            fieldsContainer.innerHTML = '<p class="no-fields-message">No fields added yet.</p>';
            return;
        }
        
        // Clear container
        fieldsContainer.innerHTML = '';
        
        // Add each field
        savedFields.forEach((field, index) => {
            const fieldItem = document.createElement('div');
            fieldItem.className = 'field-item';
            
            const fieldDate = new Date(field.date);
            const formattedDate = `${fieldDate.getMonth() + 1}/${fieldDate.getDate()}/${fieldDate.getFullYear()}`;
            
            fieldItem.innerHTML = `
                <div class="field-item-details">
                    <div class="field-name">${field.name} (${field.size} acres)</div>
                    <div class="field-meta">Soil type: ${field.soil}</div>
                </div>
                <div class="field-actions">
                    <button class="use-field-btn" title="Use this field" data-index="${index}">
                        <i class="fas fa-arrow-right"></i> Use
                    </button>
                    <button class="delete-field-btn" title="Delete this field" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            fieldsContainer.appendChild(fieldItem);
        });
        
        // Add event listeners to use field buttons
        document.querySelectorAll('.use-field-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                useField(index);
            });
        });
        
        // Add event listeners to delete field buttons
        document.querySelectorAll('.delete-field-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                deleteField(index);
            });
        });
    }
    
    // Add event listeners to all crop selects
    document.querySelectorAll('.crop-select').forEach(select => {
        select.addEventListener('change', updateRecommendations);
    });
    
    // Update recommendations based on selected crops
    function updateRecommendations() {
        const selectedCrops = [];
        
        // Get all selected crops
        document.querySelectorAll('.crop-select').forEach(select => {
            if (select.value) {
                const year = parseInt(select.closest('.season-slot').dataset.year);
                const season = select.closest('.season-slot').dataset.season;
                selectedCrops.push({
                    crop: select.value,
                    type: getCropType(select.value),
                    year: year,
                    season: season
                });
            }
        });
        
        // If no crops selected, hide recommendations
        if (selectedCrops.length === 0) {
            document.querySelector('.recommendation-placeholder').style.display = 'block';
            document.getElementById('recommendation-details').style.display = 'none';
            return;
        }
        
        // Show recommendation details
        document.querySelector('.recommendation-placeholder').style.display = 'none';
        document.getElementById('recommendation-details').style.display = 'block';
        
        // Calculate compatibility score
        let compatibilityScore = calculateCompatibilityScore(selectedCrops);
        
        // Update compatibility meter
        const scoreFill = document.querySelector('.score-fill');
        const scoreValue = document.querySelector('.score-value');
        scoreFill.style.width = `${compatibilityScore}%`;
        scoreValue.textContent = `${compatibilityScore}%`;
        
        // Update color based on score
        if (compatibilityScore < 50) {
            scoreFill.style.backgroundColor = 'var(--accent-red)';
        } else if (compatibilityScore < 75) {
            scoreFill.style.backgroundColor = 'var(--accent-yellow)';
        } else {
            scoreFill.style.backgroundColor = 'var(--accent-green)';
        }
        
        // Generate suggestions
        generateSuggestions(selectedCrops);
        
        // Update nutrient chart
        updateNutrientChart(selectedCrops);
    }
    
    // Calculate compatibility score based on crop succession
    function calculateCompatibilityScore(crops) {
        if (crops.length <= 1) return 100; // Only one crop is always compatible
        
        let successionsChecked = 0;
        let goodSuccessions = 0;
        
        // Check each crop against the next year's crops in the same season
        for (let i = 0; i < crops.length; i++) {
            for (let j = 0; j < crops.length; j++) {
                if (crops[i].year < crops[j].year && crops[i].season === crops[j].season) {
                    successionsChecked++;
                    if (isGoodSuccession(crops[i].type, crops[j].type)) {
                        goodSuccessions++;
                    }
                }
            }
        }
        
        return successionsChecked > 0 
            ? Math.round((goodSuccessions / successionsChecked) * 100) 
            : 100;
    }
    
    // Check if crop succession is good
    function isGoodSuccession(crop1Type, crop2Type) {
        return cropCompatibility[crop1Type]?.before.includes(crop2Type) || 
               cropCompatibility[crop2Type]?.after.includes(crop1Type);
    }
    
    // Generate suggestions for crop rotation
    function generateSuggestions(crops) {
        const suggestionsList = document.getElementById('suggestions-list');
        suggestionsList.innerHTML = '';
        
        if (crops.length === 0) {
            const listItem = document.createElement('li');
            listItem.textContent = 'Start by selecting crops for your rotation plan.';
            suggestionsList.appendChild(listItem);
            return;
        }
        
        // Check for empty seasons
        const seasons = ['spring', 'summer', 'fall', 'winter'];
        const missingSeasons = [];
        
        for (let year = 1; year <= yearCount; year++) {
            for (const season of seasons) {
                const hasCrop = crops.some(crop => crop.year === year && crop.season === season);
                if (!hasCrop && (season !== 'winter' || year < 3)) { // Winter is optional for later years
                    missingSeasons.push({ year, season });
                }
            }
        }
        
        if (missingSeasons.length > 0) {
            const listItem = document.createElement('li');
            listItem.innerHTML = '<span class="suggestion-highlight">Fill empty seasons:</span> '
                + missingSeasons.slice(0, 3).map(s => `Year ${s.year} ${capitalize(s.season)}`).join(', ')
                + (missingSeasons.length > 3 ? ` and ${missingSeasons.length - 3} more...` : '');
            suggestionsList.appendChild(listItem);
        }
        
        // Check for bad successions
        const badSuccessions = [];
        for (let i = 0; i < crops.length; i++) {
            for (let j = 0; j < crops.length; j++) {
                if (crops[i].year < crops[j].year && 
                    crops[i].season === crops[j].season && 
                    !isGoodSuccession(crops[i].type, crops[j].type)) {
                    badSuccessions.push({
                        year1: crops[i].year,
                        year2: crops[j].year,
                        season: crops[i].season,
                        crop1: crops[i].crop,
                        crop2: crops[j].crop
                    });
                }
            }
        }
        
        if (badSuccessions.length > 0) {
            for (const succ of badSuccessions.slice(0, 2)) {
                const listItem = document.createElement('li');
                listItem.innerHTML = `<span class="suggestion-highlight">Avoid succession:</span> `
                    + `${capitalize(succ.crop1)} (Year ${succ.year1}) followed by `
                    + `${capitalize(succ.crop2)} (Year ${succ.year2}) in ${capitalize(succ.season)}`;
                suggestionsList.appendChild(listItem);
            }
            if (badSuccessions.length > 2) {
                const listItem = document.createElement('li');
                listItem.textContent = `${badSuccessions.length - 2} more incompatible successions detected.`;
                suggestionsList.appendChild(listItem);
            }
        }
        
        // Add general suggestions
        if (crops.length > 0) {
            // Check for crop diversity
            const uniqueCropTypes = new Set(crops.map(c => c.type));
            if (uniqueCropTypes.size < 3 && crops.length >= 4) {
                const listItem = document.createElement('li');
                listItem.innerHTML = '<span class="suggestion-highlight">Increase diversity:</span> Try to include at least 3-4 different crop families in your rotation.';
                suggestionsList.appendChild(listItem);
            }
            
            // Check for legumes
            const hasLegumes = crops.some(crop => crop.type === 'legumes');
            if (!hasLegumes) {
                const listItem = document.createElement('li');
                listItem.innerHTML = '<span class="suggestion-highlight">Add nitrogen fixers:</span> Include legumes (peas, beans, lentils) in your rotation to improve soil fertility.';
                suggestionsList.appendChild(listItem);
            }
        }
        
        if (suggestionsList.children.length === 0) {
            const listItem = document.createElement('li');
            listItem.innerHTML = '<span class="suggestion-highlight">Great plan!</span> Your crop rotation looks well balanced.';
            suggestionsList.appendChild(listItem);
        }
    }
    
    // Update nutrient chart based on selected crops
    function updateNutrientChart(crops) {
        // Get average nutrient values for the selected crops by year
        const yearNutrients = {};
        const years = [...new Set(crops.map(c => c.year))].sort((a, b) => a - b);
        
        for (const year of years) {
            const yearCrops = crops.filter(c => c.year === year);
            yearNutrients[year] = {
                nitrogen: 0,
                phosphorus: 0,
                potassium: 0
            };
            
            for (const crop of yearCrops) {
                if (crop.type && cropCompatibility[crop.type]) {
                    yearNutrients[year].nitrogen += cropCompatibility[crop.type].nutrients.nitrogen;
                    yearNutrients[year].phosphorus += cropCompatibility[crop.type].nutrients.phosphorus;
                    yearNutrients[year].potassium += cropCompatibility[crop.type].nutrients.potassium;
                }
            }
            
            // Average values if there are crops
            if (yearCrops.length > 0) {
                yearNutrients[year].nitrogen = Math.round(yearNutrients[year].nitrogen / yearCrops.length);
                yearNutrients[year].phosphorus = Math.round(yearNutrients[year].phosphorus / yearCrops.length);
                yearNutrients[year].potassium = Math.round(yearNutrients[year].potassium / yearCrops.length);
            }
        }
        
        // Chart data preparation
        const labels = years.map(y => `Year ${y}`);
        const nitrogenData = years.map(y => yearNutrients[y].nitrogen);
        const phosphorusData = years.map(y => yearNutrients[y].phosphorus);
        const potassiumData = years.map(y => yearNutrients[y].potassium);
        
        // Get the canvas element
        const ctx = document.getElementById('nutrientChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (window.nutrientChart) {
            window.nutrientChart.destroy();
        }
        
        // Create the chart
        window.nutrientChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Nitrogen (N)', 'Phosphorus (P)', 'Potassium (K)'],
                datasets: years.map((year, index) => ({
                    label: `Year ${year}`,
                    data: [
                        yearNutrients[year].nitrogen,
                        yearNutrients[year].phosphorus,
                        yearNutrients[year].potassium
                    ],
                    backgroundColor: `rgba(${70 + index * 50}, ${120 + index * 30}, ${200 - index * 30}, 0.2)`,
                    borderColor: `rgba(${70 + index * 50}, ${120 + index * 30}, ${200 - index * 30}, 1)`,
                    borderWidth: 2,
                    pointBackgroundColor: `rgba(${70 + index * 50}, ${120 + index * 30}, ${200 - index * 30}, 1)`
                }))
            },
            options: {
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 5,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.raw || 0;
                                const maxValue = 5;
                                return `${label}: ${value}/${maxValue}`;
                            }
                        }
                    }
                },
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
    
    // Save button event listener
    saveBtn.addEventListener('click', () => {
        const fieldName = document.getElementById('field-name').value.trim();
        if (!fieldName) {
            alert('Please enter a field name before saving the plan.');
            return;
        }
        
        const selectedCrops = [];
        document.querySelectorAll('.crop-select').forEach(select => {
            if (select.value) {
                const year = parseInt(select.closest('.season-slot').dataset.year);
                const season = select.closest('.season-slot').dataset.season;
                selectedCrops.push({
                    crop: select.value,
                    type: getCropType(select.value),
                    year: year,
                    season: season
                });
            }
        });
        
        if (selectedCrops.length === 0) {
            alert('Please select at least one crop before saving the plan.');
            return;
        }
        
        const plan = {
            id: Date.now(),
            date: new Date(),
            fieldName: fieldName,
            fieldSize: document.getElementById('field-size').value,
            soilType: document.getElementById('soil-type').value,
            crops: selectedCrops,
            years: yearCount
        };
        
        // Save to local storage
        const savedPlans = JSON.parse(localStorage.getItem('crop_rotation_plans') || '[]');
        savedPlans.push(plan);
        localStorage.setItem('crop_rotation_plans', JSON.stringify(savedPlans));
        
        alert('Plan saved successfully!');
        displaySavedPlans();
    });
    
    // Print button event listener
    printBtn.addEventListener('click', () => {
        window.print();
    });
    
    // Export button event listener
    exportBtn.addEventListener('click', () => {
        alert('Export functionality will be implemented in the future.');
    });
    
    // Clear button event listener
    clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear the current plan? This cannot be undone.')) {
            document.querySelectorAll('.crop-select').forEach(select => {
                select.value = '';
            });
            document.getElementById('field-name').value = '';
            document.getElementById('field-size').value = '';
            document.getElementById('soil-type').value = 'loamy';
            document.querySelector('.recommendation-placeholder').style.display = 'block';
            document.getElementById('recommendation-details').style.display = 'none';
        }
    });
    
    // Display saved plans
    function displaySavedPlans() {
        const plansContainer = document.getElementById('plans-container');
        const savedPlans = JSON.parse(localStorage.getItem('crop_rotation_plans') || '[]');
        
        if (savedPlans.length === 0) {
            plansContainer.innerHTML = '<p class="no-plans-message">You haven\'t saved any plans yet.</p>';
            return;
        }
        
        // Clear container
        plansContainer.innerHTML = '';
        
        // Sort plans by date (newest first)
        savedPlans.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Add each plan
        savedPlans.forEach((plan, index) => {
            const planCard = document.createElement('div');
            planCard.className = 'plan-card';
            
            const planDate = new Date(plan.date);
            const formattedDate = `${planDate.getMonth() + 1}/${planDate.getDate()}/${planDate.getFullYear()}`;
            
            // Create crop summary
            const cropsByYear = {};
            plan.crops.forEach(crop => {
                if (!cropsByYear[crop.year]) {
                    cropsByYear[crop.year] = [];
                }
                cropsByYear[crop.year].push(`${capitalize(crop.season)}: ${capitalize(crop.crop)}`);
            });
            
            let cropSummary = '';
            for (const [year, crops] of Object.entries(cropsByYear)) {
                cropSummary += `<div><strong>Year ${year}:</strong> ${crops.join(', ')}</div>`;
            }
            
            planCard.innerHTML = `
                <div class="plan-title">${plan.fieldName} (${plan.fieldSize} acres)</div>
                <div class="plan-meta">
                    <span><i class="fas fa-calendar"></i> ${formattedDate}</span>
                    <span><i class="fas fa-layer-group"></i> ${plan.soilType} soil</span>
                </div>
                <div class="plan-preview">
                    ${cropSummary}
                </div>
                <div class="plan-actions">
                    <button class="btn small-btn secondary-btn load-btn" data-index="${index}">
                        <i class="fas fa-folder-open"></i> Load
                    </button>
                    <button class="btn small-btn warning-btn delete-btn" data-index="${index}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            
            plansContainer.appendChild(planCard);
        });
        
        // Add event listeners to load and delete buttons
        document.querySelectorAll('.load-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                loadPlan(parseInt(btn.dataset.index));
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                deletePlan(parseInt(btn.dataset.index));
            });
        });
    }
    
    // Load a saved plan
    function loadPlan(index) {
        const savedPlans = JSON.parse(localStorage.getItem('crop_rotation_plans') || '[]');
        if (index >= 0 && index < savedPlans.length) {
            const plan = savedPlans[index];
            
            // Clear current plan
            document.querySelectorAll('.crop-select').forEach(select => {
                select.value = '';
            });
            
            // Set field information
            document.getElementById('field-name').value = plan.fieldName;
            document.getElementById('field-size').value = plan.fieldSize;
            document.getElementById('soil-type').value = plan.soilType;
            
            // If plan has more years than current UI, add more years
            while (yearCount < plan.years) {
                addYearBtn.click();
            }
            
            // Apply crop selections
            plan.crops.forEach(crop => {
                const selector = `.season-slot[data-year="${crop.year}"][data-season="${crop.season}"] .crop-select`;
                const selectElement = document.querySelector(selector);
                if (selectElement) {
                    selectElement.value = crop.crop;
                }
            });
            
            // Switch to year 1
            switchYear(1);
            
            // Update recommendations
            updateRecommendations();
            
            alert(`Plan "${plan.fieldName}" loaded successfully!`);
        }
    }
    
    // Delete a saved plan
    function deletePlan(index) {
        if (confirm('Are you sure you want to delete this plan? This cannot be undone.')) {
            const savedPlans = JSON.parse(localStorage.getItem('crop_rotation_plans') || '[]');
            if (index >= 0 && index < savedPlans.length) {
                savedPlans.splice(index, 1);
                localStorage.setItem('crop_rotation_plans', JSON.stringify(savedPlans));
                displaySavedPlans();
                alert('Plan deleted successfully.');
            }
        }
    }
    
    // Initialize the page
    displaySavedFields();
    displaySavedPlans();
    switchYear(1);
    
    // Helper function to capitalize first letter
    function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    // Add event listener for suggest all seasons button
    suggestAllSeasonsBtn.addEventListener('click', () => {
        const seasons = ['spring', 'summer', 'fall', 'winter'];
        seasons.forEach(season => {
            suggestSeasonalCrops(season);
        });
        
        // Show a summary message
        const messageElement = document.createElement('div');
        messageElement.className = 'message success';
        messageElement.innerHTML = `<i class="fas fa-check-circle"></i> Applied crop suggestions for all seasons.`;
        
        const rotationPlan = document.querySelector('.rotation-plan');
        rotationPlan.insertBefore(messageElement, rotationPlan.firstChild);
        
        // Remove message after 4 seconds
        setTimeout(() => {
            messageElement.remove();
        }, 4000);
    });
    
    // Function to use a saved field for the current plan
    function useField(index) {
        const savedFields = JSON.parse(localStorage.getItem('crop_planner_fields') || '[]');
        if (index >= 0 && index < savedFields.length) {
            const field = savedFields[index];
            
            // Populate field info in the form
            document.getElementById('field-name').value = field.name;
            document.getElementById('field-size').value = field.size;
            document.getElementById('soil-type').value = field.soil;
            
            // Show message
            const messageElement = document.createElement('div');
            messageElement.className = 'message success';
            messageElement.innerHTML = `<i class="fas fa-check-circle"></i> Field "${field.name}" loaded. Would you like to see suggested crops for ${field.soil} soil?`;
            
            const fieldInfo = document.querySelector('.field-info');
            fieldInfo.appendChild(messageElement);
            
            // Add buttons to the message
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'message-actions';
            buttonContainer.style.marginTop = '10px';
            
            const suggestBtn = document.createElement('button');
            suggestBtn.className = 'btn primary-btn btn-sm';
            suggestBtn.innerHTML = '<i class="fas fa-lightbulb"></i> Suggest Rotation';
            suggestBtn.addEventListener('click', () => {
                applySuggestedRotation(field.soil);
                messageElement.remove();
            });
            
            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'btn secondary-btn btn-sm';
            cancelBtn.textContent = 'No Thanks';
            cancelBtn.style.marginLeft = '10px';
            cancelBtn.addEventListener('click', () => {
                messageElement.remove();
            });
            
            buttonContainer.appendChild(suggestBtn);
            buttonContainer.appendChild(cancelBtn);
            messageElement.appendChild(buttonContainer);
            
            // Remove message after 10 seconds if not interacted with
            setTimeout(() => {
                if (document.body.contains(messageElement)) {
                    messageElement.remove();
                }
            }, 10000);
        }
    }
    
    // Function to delete a saved field
    function deleteField(index) {
        if (confirm('Are you sure you want to delete this field? This cannot be undone.')) {
            const savedFields = JSON.parse(localStorage.getItem('crop_planner_fields') || '[]');
            if (index >= 0 && index < savedFields.length) {
                savedFields.splice(index, 1);
                localStorage.setItem('crop_planner_fields', JSON.stringify(savedFields));
                displaySavedFields();
                alert('Field deleted successfully.');
            }
        }
    }
}); 