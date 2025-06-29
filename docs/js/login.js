
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Simple validation (in real app, this would be server-side)
    if (username === 'admin' && password === 'admin') {
        // Store login status
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', username);
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    } else {
        alert('Invalid credentials. Please use admin/admin to login.');
    }
});

// // Check if already logged in
// if (localStorage.getItem('isLoggedIn') === 'true') {
//     window.location.href = 'dashboard.html';
// }
