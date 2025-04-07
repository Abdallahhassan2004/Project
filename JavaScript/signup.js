document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('signup-form');
    
    form.addEventListener('submit', function(event) {
      event.preventDefault(); // Always prevent default submission
      
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      const errorMsg = document.getElementById('errorMsg');
      
      // Clear previous errors
      errorMsg.textContent = '';
      
      // Password validation
      const hasMinLength = password.length >= 8;
      const hasUpperCase = /[A-Z]/.test(password);
      const hasNumber = /\d/.test(password);
      const hasSpecialChar = /[@$!%*?&#]/.test(password);
      
      // Check password requirements
      if (!hasMinLength || !hasUpperCase || !hasNumber || !hasSpecialChar) {
        errorMsg.textContent = "Password must be 8+ characters with uppercase, number, and special character (@$!%*?&#).";
        return;
      }
      
      // Check password match
      if (password !== confirmPassword) {
        errorMsg.textContent = "Passwords do not match.";
        return;
      }
      
      // If everything is valid
      alert("Signup successful! Redirecting to home page...");
      form.reset(); // Clear the form
      
      // Redirect to home page after 1 second (1000ms)
      setTimeout(function() {
        // REPLACE '/home.html' WITH YOUR ACTUAL HOME PAGE PATH
        // Example: window.location.href = 'https://www.yourwebsite.com/home';
        window.location.href = ''; 
      }, 1000);
    });
  });