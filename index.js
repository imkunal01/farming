document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    initTheme();
    
    // Initialize user profile in navigation
    initNavigationProfile();
    
    // Update auth buttons based on login status
    updateAuthButtons();
    
    // Initialize onboarding
    initOnboarding();
    
    // Initialize stat counters
    initStatCounters();
    
    // Initialize scroll animations
    initScrollAnimations();
    
    initTabs();
    
    
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
        
        updateThemeIcon();
    }
    

    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }
    
   
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Set theme on HTML element
        document.documentElement.setAttribute('data-theme', newTheme);
        
        // Save to localStorage
        localStorage.setItem('theme', newTheme);
        
        // Update the theme icon
        updateThemeIcon();
        
        // Notify other components about theme change
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'theme',
            newValue: newTheme
        }));
        
        // Also trigger a custom event for theme change
        window.dispatchEvent(new CustomEvent('themechange', {
            detail: { theme: newTheme }
        }));
        
        // Update chatbot theme if it exists on this page
        const chatbotWrapper = document.getElementById('chatbot-wrapper');
        if (chatbotWrapper) {
            if (newTheme === 'dark') {
                chatbotWrapper.classList.add('dark-theme');
                
                // Apply dark theme to messages
                const userMessages = document.querySelectorAll('.user-message');
                const botMessages = document.querySelectorAll('.bot-message');
                
                userMessages.forEach(msg => {
                    msg.style.backgroundColor = '#4ecca3'; // primary-color in dark theme
                    msg.style.color = 'white';
                });
                
                botMessages.forEach(msg => {
                    // Skip typing indicator
                    if (!msg.classList.contains('typing-indicator')) {
                        msg.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                        msg.style.color = '#e6e6e6'; // text-color in dark theme
                        msg.style.border = '1px solid rgba(255, 255, 255, 0.2)';
                    }
                });
            } else {
                chatbotWrapper.classList.remove('dark-theme');
                
                // Reset messages to light theme
                const userMessages = document.querySelectorAll('.user-message');
                const botMessages = document.querySelectorAll('.bot-message');
                
                userMessages.forEach(msg => {
                    msg.style.backgroundColor = '';
                    msg.style.color = '';
                });
                
                botMessages.forEach(msg => {
                    if (!msg.classList.contains('typing-indicator')) {
                        msg.style.backgroundColor = '';
                        msg.style.color = '';
                        msg.style.border = '';
                    }
                });
            }
        }
    }
    
  
    
    function updateThemeIcon() {
        const themeIcon = document.querySelector('.theme-toggle i');
        if (themeIcon) {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            
            if (currentTheme === 'dark') {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            } else {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
            }
        }
    }
    
    // Initialize user profile in navigation
    function initNavigationProfile() {
        const profileAvatar = document.querySelector('.profile-avatar');
        const navProfileImg = document.getElementById('nav-profile-img');
        
        if (!profileAvatar && !navProfileImg) return;
        
        fetch('login.php?action=status')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.logged_in) {
                // Update profile image if available
                if (data.user.profile_image) {
                    if (navProfileImg) {
                        navProfileImg.src = data.user.profile_image;
                        navProfileImg.style.display = 'block';
                    }
                    
                    // Also update avatar icon if it exists
                    if (profileAvatar) {
                        const avatarImg = profileAvatar.querySelector('img');
                        const avatarIcon = profileAvatar.querySelector('i');
                        
                        if (avatarImg) {
                            avatarImg.src = data.user.profile_image;
                            avatarImg.style.display = 'block';
                        }
                        
                        if (avatarIcon) {
                            avatarIcon.style.display = 'none';
                        }
                    }
                }
            } else {
                // User not logged in
                if (profileAvatar) {
                    const avatarImg = profileAvatar.querySelector('img');
                    const avatarIcon = profileAvatar.querySelector('i');
                    
                    if (avatarImg) {
                        avatarImg.style.display = 'none';
                    }
                    
                    if (avatarIcon) {
                        avatarIcon.style.display = 'block';
                    }
                }
            }
        })
        .catch(error => {
            console.error('Error checking login status:', error);
        });
    }
    
    // Update the auth buttons based on login status
    function updateAuthButtons() {
        const authButtonsContainer = document.querySelector('a.btn.primary-btn.btn-sm');
        const profileIcon = document.querySelector('.user-profile-icon');
        const userMenu = document.getElementById('user-menu');
        const logoutBtn = document.getElementById('logout-btn');
        
        if (!authButtonsContainer && !profileIcon) return;
        
        // Check login status from server
        fetch('login.php?action=status')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.logged_in) {
                // User is logged in
                if (authButtonsContainer) {
                    authButtonsContainer.style.display = 'none';
                }
                
                // Show profile icon with user's image
                if (profileIcon) {
                    profileIcon.style.display = 'block';
                    
                    // Show user menu when clicking on profile icon
                    profileIcon.addEventListener('click', function(e) {
                        e.preventDefault();
                        if (userMenu) {
                            userMenu.style.display = userMenu.style.display === 'block' ? 'none' : 'block';
                        }
                    });
                    
                    // Hide menu when clicking elsewhere
                    document.addEventListener('click', function(e) {
                        if (!profileIcon.contains(e.target) && userMenu && userMenu.style.display === 'block') {
                            userMenu.style.display = 'none';
                        }
                    });
                }
                
                // Set up logout button
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', function() {
                        logoutUser();
                    });
                }
                
                if (userMenu) {
                    userMenu.style.display = 'none'; // Initialize as hidden
                }
                
                // Update header text to show logged in status
                const headerProfileImg = document.getElementById('header-profile-img');
                if (headerProfileImg && data.user && data.user.profile_image) {
                    headerProfileImg.src = data.user.profile_image;
                    headerProfileImg.style.display = 'block';
                    // Hide default icon
                    const defaultIcon = profileIcon.querySelector('i');
                    if (defaultIcon) {
                        defaultIcon.style.display = 'none';
                    }
                }
            } else {
                // User not logged in
                if (authButtonsContainer) {
                    authButtonsContainer.style.display = 'inline-flex';
                    authButtonsContainer.innerHTML = '<i class="fas fa-user-plus"></i> Login / Register';
                    authButtonsContainer.href = 'login.html';
                }
                
                if (profileIcon) {
                    profileIcon.style.display = 'none';
                }
                
                if (userMenu) {
                    userMenu.style.display = 'none';
                }
            }
        })
        .catch(error => {
            console.error('Error checking login status:', error);
        });
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
                    
                    // Show toast message
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
            toast.className = 'toast';
            
            const icon = document.createElement('i');
            icon.className = 'fas toast-icon';
            
            const msgSpan = document.createElement('span');
            msgSpan.id = 'toast-message';
            
            toast.appendChild(icon);
            toast.appendChild(msgSpan);
            document.body.appendChild(toast);
        }
        
        const toastMessage = document.getElementById('toast-message');
        const toastIcon = toast.querySelector('.toast-icon');
        
        // Set message and update icon
        if (toastMessage) {
            toastMessage.textContent = message;
        }
        
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
        
        // Set toast type and show it
        toast.className = `toast ${type} show`;
        
        // Hide toast after 3 seconds
        setTimeout(() => {
            toast.className = toast.className.replace('show', '');
        }, 3000);
    }
    
    // Initialize onboarding overlay functionality
    function initOnboarding() {
        const onboardingOverlay = document.getElementById('onboarding-overlay');
        const skipOnboarding = document.getElementById('skip-onboarding');
        const nextStep = document.getElementById('next-step');
        const prevStep = document.getElementById('prev-step');
        const steps = document.querySelectorAll('.onboarding-step');
        const dots = document.querySelectorAll('.step-dot');
        
        if (onboardingOverlay && skipOnboarding && nextStep && prevStep) {
            let currentStep = 1;
            
            // Check if onboarding was already shown
            if (localStorage.getItem('onboardingShown')) {
                onboardingOverlay.style.display = 'none';
            } else {
                onboardingOverlay.style.display = 'flex';
            }
            
            skipOnboarding.addEventListener('click', () => {
                onboardingOverlay.style.display = 'none';
                localStorage.setItem('onboardingShown', 'true');
            });
            
            nextStep.addEventListener('click', () => {
                if (currentStep < steps.length) {
                    showStep(currentStep + 1);
                } else {
                    onboardingOverlay.style.display = 'none';
                    localStorage.setItem('onboardingShown', 'true');
                }
            });
            
            prevStep.addEventListener('click', () => {
                if (currentStep > 1) {
                    showStep(currentStep - 1);
                }
            });
            
            dots.forEach(dot => {
                dot.addEventListener('click', () => {
                    const step = parseInt(dot.getAttribute('data-step'));
                    showStep(step);
                });
            });
            
            function showStep(step) {
                currentStep = step;
                
                steps.forEach(s => {
                    s.style.display = 'none';
                });
                
                dots.forEach(d => {
                    d.classList.remove('active');
                });
                
                const currentStepEl = document.querySelector(`.onboarding-step[data-step="${step}"]`);
                const currentDot = document.querySelector(`.step-dot[data-step="${step}"]`);
                
                if (currentStepEl) {
                    currentStepEl.style.display = 'block';
                }
                
                if (currentDot) {
                    currentDot.classList.add('active');
                }
                
                // Update button states
                prevStep.disabled = step === 1;
                
                if (step === steps.length) {
                    nextStep.textContent = 'Get Started';
                } else {
                    nextStep.textContent = 'Next';
                }
            }
        }
    }
    
    // Initialize stat counters with animation
    function initStatCounters() {
        const counters = document.querySelectorAll('.stat-counter');
        
        if (counters.length === 0) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = parseInt(counter.getAttribute('data-target'));
                    const duration = 2000; // ms
                    let start = 0;
                    const step = timestamp => {
                        if (!start) start = timestamp;
                        const progress = Math.min((timestamp - start) / duration, 1);
                        counter.textContent = Math.floor(progress * target);
                        if (progress < 1) {
                            window.requestAnimationFrame(step);
                        } else {
                            counter.textContent = target;
                        }
                    };
                    window.requestAnimationFrame(step);
                    observer.unobserve(counter);
                }
            });
        }, { threshold: 0.5 });
        
        counters.forEach(counter => {
            observer.observe(counter);
        });
    }
    
    // Initialize scroll animations
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        
        if (animatedElements.length === 0) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' });
        
        animatedElements.forEach(element => {
            observer.observe(element);
        });
    }
    
    // Initialize tabs functionality
    function initTabs() {
        const tabs = document.querySelectorAll('.tab');
        
        if (tabs.length === 0) return;
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.getAttribute('data-tab');
                
                // Remove active class from all tabs and content
                document.querySelectorAll('.tab').forEach(t => {
                    t.classList.remove('active');
                });
                
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                
                // Add active class to current tab and content
                tab.classList.add('active');
                const tabContentElement = document.getElementById(tabId);
                if (tabContentElement) {
                    tabContentElement.classList.add('active');
                }
            });
        });
    }
}); 