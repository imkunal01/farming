// Login Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    initTheme();
    
    // DOM Elements
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginTabs = document.querySelectorAll('.login-tab');
    const formWrappers = document.querySelectorAll('.login-form-wrapper');
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    const resetPasswordModal = document.getElementById('reset-password-modal');
    const forgotPasswordForm = document.getElementById('reset-password-form');
    const closeResetModal = document.getElementById('close-reset-modal');
    const toast = document.getElementById('toast');
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    
    // Toggle between login and register forms
    loginTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            
            // Update active tab
            loginTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show corresponding form
            formWrappers.forEach(form => {
                form.classList.remove('active');
            });
            
            if (targetTab === 'login') {
                document.getElementById('login-form').classList.add('active');
            } else if (targetTab === 'register') {
                document.getElementById('register-form').classList.add('active');
            }
        });
    });
    
    // Toggle password visibility
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', () => {
            const input = button.previousElementSibling;
            const icon = button.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
    
    // Login form submission
    const loginFormElement = document.querySelector('#login-form form');
    if (loginFormElement) {
        loginFormElement.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const rememberMe = document.getElementById('remember').checked;
            
            // Basic validation
            if (!email || !password) {
                showToast('Please fill in all fields', 'error');
                return;
            }
            
            // Create form data
            const formData = new FormData();
            formData.append('action', 'login');
            formData.append('email', email);
            formData.append('password', password);
            
            // Send login request to server
            fetch('login.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Store user data in localStorage if remember me is checked
                    if (rememberMe) {
                        localStorage.setItem('user_email', email);
                    }
                    
                    showToast('You are logged in! Redirecting...', 'success');
                    
                    // Redirect after a short delay
                    setTimeout(() => {
                        // Check if there's a redirect URL stored in session
                        // For client-side, we'll just redirect to index.html
                        window.location.href = 'index.html';
                    }, 1500);
                } else {
                    showToast(data.message || 'Login failed', 'error');
                }
            })
            .catch(error => {
                console.error('Login error:', error);
                showToast('An error occurred. Please try again.', 'error');
            });
        });
    }
    
    // Register form submission
    const registerFormElement = document.querySelector('#register-form form');
    if (registerFormElement) {
        registerFormElement.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const userType = document.getElementById('user-type').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const terms = document.getElementById('terms').checked;
            
            // Basic validation
            if (!name || !email || !userType || !password || !confirmPassword) {
                showToast('Please fill in all fields', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showToast('Passwords do not match', 'error');
                return;
            }
            
            if (!terms) {
                showToast('Please agree to the Terms of Service and Privacy Policy', 'error');
                return;
            }
            
            // Create form data
            const formData = new FormData();
            formData.append('action', 'register');
            formData.append('name', name);
            formData.append('email', email);
            formData.append('user_type', userType);
            formData.append('password', password);
            formData.append('confirm_password', confirmPassword);
            
            // Send registration request to server
            fetch('login.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast('Account created successfully! Redirecting...', 'success');
                    
                    // Redirect to dashboard after a short delay
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                } else {
                    showToast(data.message || 'Registration failed', 'error');
                }
            })
            .catch(error => {
                console.error('Registration error:', error);
                showToast('An error occurred. Please try again.', 'error');
            });
        });
    }
    
    // Handle forgot password
    if (forgotPasswordLink) {
        console.log("Forgot password link found:", forgotPasswordLink);
        forgotPasswordLink.addEventListener('click', function(e) {
            console.log("Forgot password link clicked");
            e.preventDefault();
            resetPasswordModal.classList.add('show');
        });
    } else {
        console.error("Forgot password link not found!");
    }
    
    // Close modal when clicking the X
    if (closeResetModal) {
        closeResetModal.addEventListener('click', function() {
            resetPasswordModal.classList.remove('show');
        });
    }
    
    // Close modal when clicking outside the content
    window.addEventListener('click', function(e) {
        if (e.target === resetPasswordModal) {
            resetPasswordModal.classList.remove('show');
        }
    });
    
    // Handle forgot password form submission
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('reset-email').value;
            
            if (!email) {
                showToast('Please enter your email', 'error');
                return;
            }
            
            // Show loading state
            const submitButton = forgotPasswordForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitButton.disabled = true;
            
            // Create form data
            const formData = new FormData();
            formData.append('action', 'request_reset');
            formData.append('email', email);
            
            // Send password reset request to server
            fetch('reset_password.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // For development purposes, if reset_link is returned, show it
                    if (data.reset_link) {
                        console.log('Reset link:', data.reset_link);
                        
                        // Create a reset link element to make testing easier
                        const resetLinkContainer = document.createElement('div');
                        resetLinkContainer.className = 'reset-link-container';
                        resetLinkContainer.innerHTML = `
                            <p>For testing purposes, here's your reset link:</p>
                            <a href="${data.reset_link}" target="_blank">${data.reset_link}</a>
                        `;
                        
                        // Add it after the form
                        const modal = resetPasswordModal.querySelector('.modal-content');
                        const existingLink = modal.querySelector('.reset-link-container');
                        if (existingLink) {
                            modal.removeChild(existingLink);
                        }
                        modal.appendChild(resetLinkContainer);
                    }
                    
                    showToast('Password reset link sent to your email', 'success');
                    
                    // Reset form and close modal after delay
                    setTimeout(() => {
                        resetPasswordModal.classList.remove('show');
                        forgotPasswordForm.reset();
                        submitButton.innerHTML = originalText;
                        submitButton.disabled = false;
                    }, 3000);
                } else {
                    showToast(data.message || 'Password reset failed', 'error');
                    submitButton.innerHTML = originalText;
                    submitButton.disabled = false;
                }
            })
            .catch(error => {
                console.error('Password reset error:', error);
                showToast('An error occurred. Please try again.', 'error');
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
            });
        });
    }
    
    // Theme toggle
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
    
    // Check if user is already logged in
    fetch('login.php?action=status')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.logged_in) {
                window.location.href = 'index.html';
            }
        })
        .catch(error => {
            console.error('Session check error:', error);
        });
});

// Theme functions
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Set theme on HTML element
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Save to localStorage
    localStorage.setItem('theme', newTheme);
    
    // Update the theme icon
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    if (!theme) {
        theme = document.documentElement.getAttribute('data-theme');
    }
    
    const themeIcon = document.querySelector('.theme-toggle i');
    if (themeIcon) {
        if (theme === 'dark') {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    if (toast && toastMessage) {
        toastMessage.textContent = message;
        
        // Update icon based on message type
        const toastIcon = document.querySelector('.toast-icon');
        if (toastIcon) {
            toastIcon.className = 'fas toast-icon';
            
            switch(type) {
                case 'success':
                    toastIcon.classList.add('fa-check-circle');
                    break;
                case 'error':
                    toastIcon.classList.add('fa-times-circle');
                    break;
                case 'warning':
                    toastIcon.classList.add('fa-exclamation-triangle');
                    break;
                default:
                    toastIcon.classList.add('fa-info-circle');
            }
        }
        
        // Add the appropriate class based on message type
        toast.className = `toast ${type} show`;
        
        // Hide toast after 3 seconds
        setTimeout(() => {
            toast.className = toast.className.replace('show', '');
        }, 3000);
    }
} 