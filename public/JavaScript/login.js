document.addEventListener('DOMContentLoaded', function() {
  
    
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Reset error message
        errorMsg.textContent = '';
        
        // Validate email format
        const email = loginEmail.value.trim();
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        
        if (!emailPattern.test(email)) {
            showError("Please enter a valid email address.");
            return;
        }
        
        // Validate password (minimum 6 characters)
        const password = loginPassword.value;
        if (password.length < 6) {
            showError("Password must be at least 6 characters long.");
            return;
        }
        
        // If validation passes
        handleSuccessfulLogin();
    });
    
    function showError(message) {
        errorMsg.textContent = message;
        errorMsg.style.display = 'block';
    }
    
    function handleSuccessfulLogin() {
        // Display success message
        errorMsg.textContent = '';
        errorMsg.style.display = 'none';
        
        
        setTimeout(() => {
            window.location.href = '/dashboard.html'; // Update this path
        }, 1500);
        
    }
});