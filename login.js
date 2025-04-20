// Login Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    initTheme();
    
    // DOM Elements
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginTabs = document.querySelectorAll('.login-tab');
    const formWrappers = document.querySelectorAll('.login-form-wrapper');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const forgotPasswordModal = document.getElementById('forgotPasswordModal');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const modalClose = document.querySelector('.modal-close');
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
    const loginFormElement = document.getElementById('login-form').querySelector('form');
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
                
                showToast('Login successful! Redirecting...', 'success');
                
                // Redirect to dashboard after a short delay
                setTimeout(() => {
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
    
    // Register form submission
    const registerFormElement = document.getElementById('register-form').querySelector('form');
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
    
    // Handle forgot password
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        resetPasswordModal.style.display = 'flex';
    });
    
    // Close modal when clicking the X
    if (modalClose) {
        modalClose.addEventListener('click', function() {
            forgotPasswordModal.style.display = 'none';
        });
    }
    
    // Close modal when clicking outside the content
    window.addEventListener('click', function(e) {
        if (e.target === forgotPasswordModal) {
            forgotPasswordModal.style.display = 'none';
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
            
            // Create form data
            const formData = new FormData();
            formData.append('action', 'reset_password');
            formData.append('email', email);
            
            // Send password reset request to server
            fetch('login.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast('Password reset link sent to your email', 'success');
                    resetPasswordModal.style.display = 'none';
                } else {
                    showToast(data.message || 'Password reset failed', 'error');
                }
            })
            .catch(error => {
                console.error('Password reset error:', error);
                showToast('An error occurred. Please try again.', 'error');
            });
        });
    }
    
    // Theme toggle
    const themeToggleBtn = document.querySelector('.theme-toggle');
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
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Update data-theme attribute on the HTML element
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Save theme preference to localStorage
    localStorage.setItem('theme', newTheme);
    
    // Update theme icon
    updateThemeIcon(newTheme);
    
    // Notify other components about theme change
    // This helps components like the chatbot know when the theme has changed
    window.dispatchEvent(new StorageEvent('storage', {
        key: 'theme',
        newValue: newTheme
    }));
    
    // Also trigger a custom event for theme change
    window.dispatchEvent(new CustomEvent('themechange', {
        detail: { theme: newTheme }
    }));
}

function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('.theme-toggle i');
    if (themeIcon) {
        if (theme === 'light') {
            themeIcon.className = 'fas fa-moon';
        } else {
            themeIcon.className = 'fas fa-sun';
        }
    }
}

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    const toastMessage = document.getElementById('toast-message');
    const toastIcon = toast.querySelector('.toast-icon');
    
    if (toastMessage) {
        toastMessage.textContent = message;
    }
    
    // Set appropriate icon and color
    if (toastIcon) {
        if (type === 'success') {
            toastIcon.className = 'fas fa-check-circle toast-icon';
            toast.className = 'toast show success';
        } else if (type === 'error') {
            toastIcon.className = 'fas fa-exclamation-circle toast-icon';
            toast.className = 'toast show error';
        } else if (type === 'warning') {
            toastIcon.className = 'fas fa-exclamation-triangle toast-icon';
            toast.className = 'toast show warning';
        } else if (type === 'info') {
            toastIcon.className = 'fas fa-info-circle toast-icon';
            toast.className = 'toast show info';
        }
    } else {
        toast.className = 'toast show ' + type;
    }
    
    // Auto-hide toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
} 