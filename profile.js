// Profile page functionality
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements - Profile
    const profileTabs = document.querySelectorAll('.profile-tab');
    const tabContents = document.querySelectorAll('.profile-tab-content');
    const profileForm = document.getElementById('profile-form');
    const editButton = document.getElementById('edit-profile');
    const cancelButton = document.getElementById('cancel-edit');
    const profilePictureInput = document.getElementById('profile-picture-input');
    const profileImg = document.getElementById('profile-img');
    const headerProfileImg = document.getElementById('header-profile-img');
    const profileInitial = document.getElementById('profile-initial');
    const displayName = document.getElementById('display-name');
    const displayEmail = document.getElementById('display-email');
    const userTypeElement = document.getElementById('user-type');

    // DOM Elements - Settings
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    const deleteModal = document.getElementById('delete-modal');
    const closeModal = document.querySelector('.close-modal');
    const cancelDelete = document.getElementById('cancel-delete');
    const confirmDelete = document.getElementById('confirm-delete');
    const deleteConfirmInput = document.getElementById('delete-confirm');
    const exportDataBtn = document.getElementById('export-data');
    const clearDataBtn = document.getElementById('clear-data');
    const logoutBtn = document.getElementById('logout-btn');
    const changePasswordBtn = document.getElementById('change-password-btn');

    // User data (mock data for demo)
    let userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
        phone: '(555) 123-4567',
        farmName: 'Green Valley Farm',
        farmType: 'Mixed Crops',
        farmAddress: '123 Rural Road, Farmville, CA 95000',
        bio: 'I have been farming for over 10 years, specializing in sustainable agriculture practices.',
        profilePicture: '',
        userType: 'Farmer'
    };

    // Initialize the profile
    initProfile();

    // Setup event listeners
    function initProfile() {
        // Load user data
        loadUserData();

        // Theme settings
        initThemeSettings();

        // Tab navigation
        if (profileTabs.length > 0) {
            profileTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const tabId = tab.getAttribute('data-tab');
                    changeTab(tabId);
                });
            });
        }

        // Edit profile
        if (editButton) {
            editButton.addEventListener('click', enableProfileEdit);
        }

        // Cancel edit
        if (cancelButton) {
            cancelButton.addEventListener('click', cancelProfileEdit);
        }

        // Profile form submission
        if (profileForm) {
            profileForm.addEventListener('submit', saveProfileChanges);
        }

        // Profile picture upload
        if (profilePictureInput) {
            profilePictureInput.addEventListener('change', handleProfilePictureUpload);
        }

        // Theme toggle (checkbox)
        if (darkModeToggle) {
            darkModeToggle.checked = localStorage.getItem('theme') === 'dark';
            darkModeToggle.addEventListener('change', function(e) {
                const isDark = e.target.checked;
                setTheme(isDark ? 'dark' : 'light');
            });
        }

        // Theme toggle button
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', function() {
                const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                setTheme(newTheme);
            });
        }

        // Delete account
        if (deleteAccountBtn) {
            deleteAccountBtn.addEventListener('click', () => {
                if (deleteModal) deleteModal.classList.add('open');
            });
        }

        // Close modal
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                if (deleteModal) deleteModal.classList.remove('open');
            });
        }

        // Cancel delete
        if (cancelDelete) {
            cancelDelete.addEventListener('click', () => {
                if (deleteModal) deleteModal.classList.remove('open');
            });
        }

        // Confirm delete
        if (confirmDelete && deleteConfirmInput) {
            confirmDelete.addEventListener('click', () => {
                if (deleteConfirmInput.value === 'DELETE') {
                    // In a real app, this would call an API to delete the account
                    showToast('Account deleted successfully. Redirecting...', 'success');
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                } else {
                    showToast('Please type DELETE to confirm account deletion', 'error');
                }
            });
        }

        // Export data
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', exportUserData);
        }

        // Clear data
        if (clearDataBtn) {
            clearDataBtn.addEventListener('click', clearAppData);
        }

        // Logout
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logoutUser);
        }

        // Change password
        if (changePasswordBtn) {
            const changePasswordForm = document.getElementById('change-password-form');
            if (changePasswordForm) {
                changePasswordForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    const currentPassword = document.getElementById('current-password');
                    const newPassword = document.getElementById('new-password');
                    const confirmPassword = document.getElementById('confirm-password');

                    if (!currentPassword || !newPassword || !confirmPassword) return;

                    if (newPassword.value !== confirmPassword.value) {
                        showToast('New passwords do not match', 'error');
                        return;
                    }

                    // In a real app, this would verify the current password and update to the new one
                    showToast('Password updated successfully', 'success');
                    currentPassword.value = '';
                    newPassword.value = '';
                    confirmPassword.value = '';
                });
            }
        }
    }

    // Load user data
    function loadUserData() {
        // In a real app, this would fetch data from a server or localStorage
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
            userData = JSON.parse(storedUserData);
        } else {
            // Store the mock data for future use
            localStorage.setItem('userData', JSON.stringify(userData));
        }

        // Update profile information
        if (displayName) displayName.textContent = `${userData.firstName} ${userData.lastName}`;
        if (displayEmail) displayEmail.textContent = userData.email;
        if (userTypeElement) userTypeElement.textContent = userData.userType;

        // Form fields
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');

        if (nameInput) nameInput.value = `${userData.firstName} ${userData.lastName}`;
        if (emailInput) emailInput.value = userData.email;

        // Profile picture
        updateProfilePicture(userData.profilePicture);
    }

    // Initialize theme settings
    function initThemeSettings() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
    }

    // Set theme and update all related elements
    function setTheme(theme) {
        // Apply theme to document
        document.documentElement.setAttribute('data-theme', theme);
        
        // Apply dark mode class to body if needed (for backward compatibility)
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        
        // Update theme toggle button icon
        updateThemeIcon(theme);
        
        // Set checkbox state
        if (darkModeToggle) {
            darkModeToggle.checked = theme === 'dark';
        }
        
        // Save theme preference
        localStorage.setItem('theme', theme);
        
        // Dispatch storage event for other tabs to catch
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'theme',
            newValue: theme
        }));
    }

    // Update theme icon based on current theme
    function updateThemeIcon(theme) {
        if (themeToggleBtn) {
            const icon = themeToggleBtn.querySelector('i');
            if (icon) {
                if (theme === 'dark') {
                    icon.classList.remove('fa-sun');
                    icon.classList.add('fa-moon');
                } else {
                    icon.classList.remove('fa-moon');
                    icon.classList.add('fa-sun');
                }
            }
        }
    }

    // Change active tab
    function changeTab(tabId) {
        profileTabs.forEach(tab => {
            if (tab.getAttribute('data-tab') === tabId) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        tabContents.forEach(content => {
            if (content.id === `${tabId}-tab`) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
    }

    // Enable profile editing
    function enableProfileEdit() {
        const formInputs = profileForm.querySelectorAll('input, textarea');
        formInputs.forEach(input => {
            input.disabled = false;
        });

        document.getElementById('form-actions').style.display = 'flex';
        editButton.style.display = 'none';
    }

    // Cancel profile editing
    function cancelProfileEdit() {
        const formInputs = profileForm.querySelectorAll('input, textarea');
        formInputs.forEach(input => {
            input.disabled = true;
        });

        document.getElementById('form-actions').style.display = 'none';
        editButton.style.display = 'block';

        // Reset form to original values
        loadUserData();
    }

    // Save profile changes
    function saveProfileChanges(e) {
        e.preventDefault();

        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');

        if (!nameInput || !emailInput) return;

        const nameParts = nameInput.value.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');

        userData.firstName = firstName;
        userData.lastName = lastName;
        userData.email = emailInput.value;

        // Save changes to localStorage (in a real app, this would send to a server)
        localStorage.setItem('userData', JSON.stringify(userData));

        // Update display values
        if (displayName) displayName.textContent = `${firstName} ${lastName}`;
        if (displayEmail) displayEmail.textContent = emailInput.value;

        // Disable editing
        const formInputs = profileForm.querySelectorAll('input, textarea');
        formInputs.forEach(input => {
            input.disabled = true;
        });

        document.getElementById('form-actions').style.display = 'none';
        editButton.style.display = 'block';

        showToast('Profile updated successfully', 'success');
    }

    // Handle profile picture upload
    function handleProfilePictureUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const imageData = event.target.result;
            userData.profilePicture = imageData;
            
            // Save to localStorage
            localStorage.setItem('userData', JSON.stringify(userData));
            
            // Update profile images
            updateProfilePicture(imageData);
            
            showToast('Profile picture updated', 'success');
        };
        reader.readAsDataURL(file);
    }

    // Update profile picture across the site
    function updateProfilePicture(imageData) {
        // Update profile page image
        if (profileImg) {
            if (imageData) {
                profileImg.src = imageData;
                profileImg.style.display = 'block';
                if (profileInitial) profileInitial.style.display = 'none';
            } else {
                profileImg.style.display = 'none';
                if (profileInitial) {
                    profileInitial.style.display = 'flex';
                    profileInitial.textContent = getInitials(`${userData.firstName} ${userData.lastName}`);
                }
            }
        }
        
        // Update header profile image
        if (headerProfileImg) {
            if (imageData) {
                headerProfileImg.src = imageData;
                headerProfileImg.style.display = 'block';
                const headerIcon = headerProfileImg.parentElement.querySelector('i');
                if (headerIcon) headerIcon.style.display = 'none';
            } else {
                headerProfileImg.style.display = 'none';
                const headerIcon = headerProfileImg.parentElement.querySelector('i');
                if (headerIcon) headerIcon.style.display = 'block';
            }
        }
    }

    // Get initials from name
    function getInitials(name) {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }

    // Export user data
    function exportUserData() {
        const dataStr = JSON.stringify(userData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'user_data.json';
        a.click();
        
        URL.revokeObjectURL(url);
        showToast('Data exported successfully', 'success');
    }

    // Clear app data
    function clearAppData() {
        if (confirm('This will clear all app data including your profile information. Continue?')) {
            localStorage.clear();
            showToast('All data cleared. Reloading page...', 'info');
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        }
    }

    // Logout user
    function logoutUser() {
        // In a real app, this would clear session/auth data
        window.location.href = 'login.html';
    }

    // Show toast notification
    function showToast(message, type = 'info') {
        const toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        toastContainer.appendChild(toast);
        
        // Make the toast visible
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Remove the toast after a delay
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }
}); 