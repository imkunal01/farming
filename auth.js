// User Authentication Management
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginModal = document.getElementById('login-modal');
    const loginModalClose = document.getElementById('login-modal-close');
    const loginLinks = document.querySelectorAll('.login-link');
    const logoutLinks = document.querySelectorAll('.logout-link');
    const authTabs = document.querySelectorAll('.auth-tab');
    const userMenus = document.querySelectorAll('.user-menu');
    const googleBtn = document.querySelector('.google-btn');
    
    // Current user state
    let currentUser = null;
    
    // Check login status on page load
    checkLoginStatus();
    
    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;
            
            if (!email || !password) {
                showMessage(loginForm, 'Please fill in all fields', 'error');
                return;
            }
            
            // Send login request
            fetch('login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=login&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    currentUser = data.user;
                    updateUIForLoggedInUser();
                    closeLoginModal();
                    showToast('Logged in successfully');
                } else {
                    showMessage(loginForm, data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Login error:', error);
                showMessage(loginForm, 'An error occurred. Please try again.', 'error');
            });
        });
    }
    
    // Registration form submission
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('register-name').value.trim();
            const email = document.getElementById('register-email').value.trim();
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm').value;
            
            if (!name || !email || !password || !confirmPassword) {
                showMessage(registerForm, 'Please fill in all fields', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showMessage(registerForm, 'Passwords do not match', 'error');
                return;
            }
            
            // Send registration request
            fetch('login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=register&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&confirm_password=${encodeURIComponent(confirmPassword)}`
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    currentUser = data.user;
                    updateUIForLoggedInUser();
                    closeLoginModal();
                    showToast('Account created successfully');
                } else {
                    showMessage(registerForm, data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Registration error:', error);
                showMessage(registerForm, 'An error occurred. Please try again.', 'error');
            });
        });
    }
    
    // Google authentication
    if (googleBtn) {
        googleBtn.addEventListener('click', function() {
            // In a real implementation, this would use the Google Identity Services SDK
            // For this demo, we'll simulate with a success response
            simulateGoogleLogin();
        });
    }
    
    // Auth tab switching
    if (authTabs && authTabs.length > 0) {
        authTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                authTabs.forEach(t => t.classList.remove('active'));
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // Show corresponding form
                const tabName = tab.dataset.tab;
                if (tabName === 'login') {
                    loginForm.style.display = 'block';
                    registerForm.style.display = 'none';
                } else if (tabName === 'register') {
                    loginForm.style.display = 'none';
                    registerForm.style.display = 'block';
                }
            });
        });
    }
    
    // Login links
    if (loginLinks && loginLinks.length > 0) {
        loginLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = 'login.html';
            });
        });
    }
    
    // Login modal close
    if (loginModalClose) {
        loginModalClose.addEventListener('click', closeLoginModal);
    }
    
    // Logout links
    if (logoutLinks && logoutLinks.length > 0) {
        logoutLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                logout();
            });
        });
    }
    
    // Check login status
    function checkLoginStatus() {
        fetch('login.php?action=status')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.logged_in) {
                currentUser = data.user;
                updateUIForLoggedInUser();
            } else {
                updateUIForLoggedOutUser();
            }
        })
        .catch(error => {
            console.error('Error checking login status:', error);
        });
    }
    
    // Logout function
    function logout() {
        fetch('login.php?action=logout')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                currentUser = null;
                updateUIForLoggedOutUser();
                showToast('Logged out successfully');
            }
        })
        .catch(error => {
            console.error('Logout error:', error);
        });
    }
    
    // Open login modal
    function openLoginModal() {
        if (loginModal) {
            loginModal.classList.add('open');
        }
    }
    
    // Close login modal
    function closeLoginModal() {
        if (loginModal) {
            loginModal.classList.remove('open');
            
            // Clear form fields and error messages
            if (loginForm) {
                loginForm.reset();
                const errorMsg = loginForm.querySelector('.error-message');
                if (errorMsg) errorMsg.remove();
            }
            
            if (registerForm) {
                registerForm.reset();
                const errorMsg = registerForm.querySelector('.error-message');
                if (errorMsg) errorMsg.remove();
            }
        }
    }
    
    // Show message in form
    function showMessage(form, message, type) {
        // Remove any existing messages
        const existingMsg = form.querySelector('.message');
        if (existingMsg) existingMsg.remove();
        
        // Create message element
        const msgElement = document.createElement('div');
        msgElement.className = `message ${type}-message`;
        msgElement.textContent = message;
        
        // Add to form before the first button
        const submitBtn = form.querySelector('button[type="submit"]').parentElement;
        form.insertBefore(msgElement, submitBtn);
        
        // Auto-remove after a delay
        setTimeout(() => {
            if (msgElement.parentNode === form) {
                msgElement.remove();
            }
        }, 5000);
    }
    
    // Show toast notification
    function showToast(message) {
        // Check if toast container exists, if not create it
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        
        // Add to container
        toastContainer.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }
    
    // Update UI for logged in user
    function updateUIForLoggedInUser() {
        if (!currentUser) return;
        
        // Update login buttons to show user info
        loginLinks.forEach(link => {
            const parent = link.parentElement;
            
            // Create user menu button if it doesn't exist
            if (!parent.querySelector('.user-menu-btn')) {
                link.style.display = 'none';
                
                const userBtn = document.createElement('div');
                userBtn.className = 'user-menu-btn';
                userBtn.innerHTML = `
                    <div class="user-avatar">
                        ${currentUser.profile_image ? 
                            `<img src="${currentUser.profile_image}" alt="${currentUser.name}">` : 
                            `<span>${currentUser.name.charAt(0)}</span>`}
                    </div>
                    <span class="user-name">${currentUser.name}</span>
                    <i class="fas fa-chevron-down"></i>
                `;
                
                // Create dropdown menu
                const dropdown = document.createElement('div');
                dropdown.className = 'user-dropdown';
                dropdown.innerHTML = `
                    <ul>
                        <li><a href="profile.html"><i class="fas fa-user"></i> My Profile</a></li>
                        <li><a href="profile.html#settings-tab"><i class="fas fa-cog"></i> Settings</a></li>
                        <li class="divider"></li>
                        <li><a href="#" class="logout-link"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
                    </ul>
                `;
                
                userBtn.appendChild(dropdown);
                parent.appendChild(userBtn);
                
                // Handle dropdown toggle
                userBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    dropdown.classList.toggle('show');
                });
                
                // Add logout functionality to the new logout link
                dropdown.querySelector('.logout-link').addEventListener('click', function(e) {
                    e.preventDefault();
                    logout();
                });
                
                // Close dropdown when clicking elsewhere
                document.addEventListener('click', function() {
                    dropdown.classList.remove('show');
                });
            }
        });
        
        // Enable community chat input if present
        const chatInput = document.querySelector('#community-chat-form input');
        if (chatInput) {
            chatInput.disabled = false;
            chatInput.placeholder = 'Type your message...';
            
            const chatBtn = document.querySelector('#community-chat-form button');
            if (chatBtn) {
                chatBtn.textContent = 'Send';
                chatBtn.classList.remove('login-link');
                chatBtn.classList.add('send-btn');
            }
        }
        
        // Update any other UI elements that need to know about login status
        document.body.classList.add('user-logged-in');
        document.body.dataset.userType = currentUser.user_type;
    }
    
    // Update UI for logged out user
    function updateUIForLoggedOutUser() {
        // Show login links
        loginLinks.forEach(link => {
            link.style.display = 'inline-flex';
            
            // Remove user menu if it exists
            const parent = link.parentElement;
            const userMenu = parent.querySelector('.user-menu-btn');
            if (userMenu) {
                parent.removeChild(userMenu);
            }
        });
        
        // Disable community chat input if present
        const chatInput = document.querySelector('#community-chat-form input');
        if (chatInput) {
            chatInput.disabled = true;
            chatInput.placeholder = 'Type your message (sign in to participate)...';
            
            const chatBtn = document.querySelector('#community-chat-form button');
            if (chatBtn) {
                chatBtn.textContent = 'Sign In';
                chatBtn.classList.add('login-link');
                chatBtn.classList.remove('send-btn');
                
                // Re-add event listener for login
                chatBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    openLoginModal();
                });
            }
        }
        
        // Update any other UI elements that need to know about logout
        document.body.classList.remove('user-logged-in');
        document.body.removeAttribute('data-user-type');
    }
    
    // Simulate Google login (in real app, would use Google Identity Services)
    function simulateGoogleLogin() {
        const mockGoogleUser = {
            name: 'Google User',
            email: 'google.user@example.com',
            profile_image: 'https://ui-avatars.com/api/?name=Google+User&background=random'
        };
        
        fetch('login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=google_auth&name=${encodeURIComponent(mockGoogleUser.name)}&email=${encodeURIComponent(mockGoogleUser.email)}&profile_image=${encodeURIComponent(mockGoogleUser.profile_image)}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                currentUser = data.user;
                updateUIForLoggedInUser();
                closeLoginModal();
                showToast('Logged in with Google successfully');
            } else {
                showMessage(loginForm, data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Google login error:', error);
            showMessage(loginForm, 'An error occurred. Please try again.', 'error');
        });
    }
}); 