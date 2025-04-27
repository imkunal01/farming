// Client-side authentication check
document.addEventListener('DOMContentLoaded', function() {
    // Check if current page is login page
    const isLoginPage = window.location.pathname.endsWith('login.html');
    
    // Skip check if already on login page
    if (isLoginPage) {
        return;
    }
    
    // Check authentication status
    fetch('login.php?action=status')
        .then(response => response.json())
        .then(data => {
            if (!data.success || !data.logged_in) {
                // User is not logged in, redirect to login page
                window.location.href = 'login.html';
            }
        })
        .catch(error => {
            console.error('Auth check error:', error);
            // On error, redirect to login page as a fallback
            window.location.href = 'login.html';
        });
}); 