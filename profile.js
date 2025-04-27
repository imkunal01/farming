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

    // User data object
    let userData = {};

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
                    deleteAccount();
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
                    changePassword();
                });
            }
        }
    }

    // Load user data from server
    function loadUserData() {
        fetch('profile.php?action=get_profile')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    userData = data.user;
                    
                    // Update profile information
                    if (displayName) displayName.textContent = userData.name;
                    if (displayEmail) displayEmail.textContent = userData.email;
                    if (userTypeElement) userTypeElement.textContent = userData.user_type;

                    // Form fields
                    const nameInput = document.getElementById('name');
                    const emailInput = document.getElementById('email');
                    
                    if (nameInput) nameInput.value = userData.name;
                    if (emailInput) emailInput.value = userData.email;

                    // Profile picture
                    updateProfilePicture(userData.profile_image);
                } else {
                    // Handle case where user data couldn't be loaded
                    console.error('Failed to load user data:', data.message);
                    // Redirect to login if not authenticated
                    if (data.message === 'Not authenticated') {
                        window.location.href = 'login.html';
                    }
                }
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
            });
    }

    // Save profile changes to server
    function saveProfileChanges(e) {
        e.preventDefault();
        
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        
        if (!nameInput || !emailInput) return;
        
        const formData = new FormData();
        formData.append('action', 'update_profile');
        formData.append('name', nameInput.value);
        formData.append('email', emailInput.value);
        
        fetch('profile.php', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    userData = { ...userData, ...data.user };
                    
                    // Update display elements
                    if (displayName) displayName.textContent = userData.name;
                    if (displayEmail) displayEmail.textContent = userData.email;
                    
                    // Disable edit mode
                    disableProfileEdit();
                    
                    showToast('Profile updated successfully', 'success');
                } else {
                    showToast(data.message || 'Failed to update profile', 'error');
                }
            })
            .catch(error => {
                console.error('Error updating profile:', error);
                showToast('An error occurred while updating profile', 'error');
            });
    }

    // Handle profile picture upload
    function handleProfilePictureUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // Validate file type
        const fileType = file.type;
        if (!fileType.match('image.*')) {
            showToast('Please select an image file', 'error');
            return;
        }
        
        // Create form data
        const formData = new FormData();
        formData.append('action', 'upload_image');
        formData.append('profile_image', file);
        
        // Upload image to server
        fetch('profile.php', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update profile picture with the path returned from server
                    updateProfilePicture(data.profile_image);
                    showToast('Profile picture updated successfully', 'success');
                } else {
                    showToast(data.message || 'Failed to upload profile picture', 'error');
                }
            })
            .catch(error => {
                console.error('Error uploading profile picture:', error);
                showToast('An error occurred while uploading profile picture', 'error');
            });
    }
    
    // Update profile picture in UI
    function updateProfilePicture(imagePath) {
        if (imagePath && imagePath !== '') {
            // Show profile image
            if (profileImg) {
                profileImg.src = imagePath;
                profileImg.style.display = 'block';
                if (profileInitial) profileInitial.style.display = 'none';
            }
            
            // Show header profile image
            if (headerProfileImg) {
                headerProfileImg.src = imagePath;
                headerProfileImg.style.display = 'block';
            }
        } else {
            // Show initials if no profile image
            if (profileInitial && userData.name) {
                const initials = userData.name.charAt(0).toUpperCase();
                profileInitial.textContent = initials;
                profileInitial.style.display = 'flex';
                if (profileImg) profileImg.style.display = 'none';
            }
            
            // Hide header profile image
            if (headerProfileImg) {
                headerProfileImg.style.display = 'none';
            }
        }
    }

    // Change password
    function changePassword() {
        const currentPassword = document.getElementById('current-password');
        const newPassword = document.getElementById('new-password');
        const confirmPassword = document.getElementById('confirm-password');

        if (!currentPassword || !newPassword || !confirmPassword) return;

        if (newPassword.value !== confirmPassword.value) {
            showToast('New passwords do not match', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('action', 'change_password');
        formData.append('current_password', currentPassword.value);
        formData.append('new_password', newPassword.value);
        formData.append('confirm_password', confirmPassword.value);
        
        fetch('profile.php', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast('Password updated successfully', 'success');
                    // Clear form
                    currentPassword.value = '';
                    newPassword.value = '';
                    confirmPassword.value = '';
                } else {
                    showToast(data.message || 'Failed to update password', 'error');
                }
            })
            .catch(error => {
                console.error('Error changing password:', error);
                showToast('An error occurred while changing password', 'error');
            });
    }

    // Delete account
    function deleteAccount() {
        const formData = new FormData();
        formData.append('action', 'delete_account');
        formData.append('confirmation', 'DELETE');
        
        fetch('profile.php', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast('Account deleted successfully. Redirecting...', 'success');
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                } else {
                    showToast(data.message || 'Failed to delete account', 'error');
                }
            })
            .catch(error => {
                console.error('Error deleting account:', error);
                showToast('An error occurred while deleting account', 'error');
            });
    }

    // Enable profile edit mode
    function enableProfileEdit() {
        // Get form elements
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const formActions = document.getElementById('form-actions');
        
        if (!nameInput || !emailInput) return;
        
        // Enable inputs
        nameInput.disabled = false;
        emailInput.disabled = false;
        
        // Show form actions
        if (formActions) formActions.style.display = 'flex';
        
        // Hide edit button
        if (editButton) editButton.style.display = 'none';
    }
    
    // Disable profile edit mode
    function disableProfileEdit() {
        // Get form elements
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const formActions = document.getElementById('form-actions');
        
        if (!nameInput || !emailInput) return;
        
        // Disable inputs
        nameInput.disabled = true;
        emailInput.disabled = true;
        
        // Hide form actions
        if (formActions) formActions.style.display = 'none';
        
        // Show edit button
        if (editButton) editButton.style.display = 'block';
    }
    
    // Cancel profile edit
    function cancelProfileEdit() {
        // Reset form values
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        
        if (nameInput) nameInput.value = userData.name;
        if (emailInput) emailInput.value = userData.email;
        
        // Disable edit mode
        disableProfileEdit();
    }

    // Initialize theme settings
    function initThemeSettings() {
        // Set initial state of the settings toggle based on current theme
        if (darkModeToggle) {
            darkModeToggle.checked = document.documentElement.getAttribute('data-theme') === 'dark';
        }
        
        // Add listener to settings toggle
        if (darkModeToggle) {
            darkModeToggle.addEventListener('change', function(e) {
                const newTheme = e.target.checked ? 'dark' : 'light';
                setTheme(newTheme);
            });
        }

        // Add listener to floating theme button
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', function() {
                const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                setTheme(newTheme);
            });
        }
    }
    
    // Centralized function to set the theme
    function setTheme(theme) {
        // 1. Set attribute on HTML element
        document.documentElement.setAttribute('data-theme', theme);
        
        // 2. Save to localStorage
        localStorage.setItem('theme', theme);
        
        // 3. Update the floating theme toggle button icon
        const themeIcon = themeToggleBtn ? themeToggleBtn.querySelector('i') : null;
        if (themeIcon) {
            if (theme === 'dark') {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            } else {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
            }
        }
        
        // 4. Update the settings dark mode toggle checkbox
        if (darkModeToggle) {
            darkModeToggle.checked = (theme === 'dark');
        }
        
        // 5. Dispatch custom event for other components (like chatbot)
        const event = new CustomEvent('themechange', { detail: { theme: theme } });
        window.dispatchEvent(event);
    }

    // Change tab
    function changeTab(tabId) {
        // Update active tab button
        profileTabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.getAttribute('data-tab') === tabId) {
                tab.classList.add('active');
            }
        });

        // Show the correct tab content
        tabContents.forEach(content => {
            content.classList.remove('active');
            // Ensure the content ID matches the expected format (e.g., 'profile-tab')
            if (content.id === `${tabId}-tab`) { 
                content.classList.add('active');
            }
        });
    }

    // Export user data
    function exportUserData() {
        fetch('profile.php?action=get_profile')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Create file for download
                    const exportData = JSON.stringify(data.user, null, 2);
                    const blob = new Blob([exportData], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    
                    // Create download link
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'farming_app_profile_export.json';
                    document.body.appendChild(a);
                    a.click();
                    
                    // Clean up
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    
                    showToast('Profile data exported successfully', 'success');
                } else {
                    showToast(data.message || 'Failed to export data', 'error');
                }
            })
            .catch(error => {
                console.error('Error exporting profile data:', error);
                showToast('An error occurred while exporting data', 'error');
            });
    }

    // Clear app data
    function clearAppData() {
        if (confirm('This will clear all locally stored app data like theme preferences. Your profile data on the server will not be affected. Continue?')) {
            // Only clear theme and other app settings, not user data
            localStorage.removeItem('theme');
            localStorage.removeItem('chatbot_welcomed');
            
            showToast('App data cleared successfully. Refreshing...', 'success');
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        }
    }

    // Logout user
    function logoutUser() {
        // Send logout request to server
        fetch('login.php?action=logout')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Clear any stored data
                    localStorage.removeItem('user_email');
                    
                    // Show success message
                    showToast('You have been logged out successfully', 'success');
                    
                    // Redirect to login page after a short delay
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 1500);
                } else {
                    showToast(data.message || 'Failed to logout', 'error');
                }
            })
            .catch(error => {
                console.error('Error logging out:', error);
                showToast('An error occurred while logging out', 'error');
            });
    }

    // Show toast notification
    function showToast(message, type = 'info') {
        // Create toast if it doesn't exist
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            document.body.appendChild(toast);
        }
        
        // Set toast content and type
        toast.textContent = message;
        toast.className = `toast ${type}`;
        
        // Show toast
        toast.classList.add('show');
        
        // Hide toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}); 