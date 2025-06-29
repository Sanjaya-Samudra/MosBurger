
document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters long!');
        return;
    }
    
    // In a real app, you would send this data to a server
    const userData = {
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        username: formData.get('username'),
        password: password
    };
    
    // Store user data (in real app, this would be done server-side)
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if username already exists
    if (users.find(user => user.username === userData.username)) {
        alert('Username already exists!');
        return;
    }
    
    users.push(userData);
    localStorage.setItem('users', JSON.stringify(users));
    
    alert('Account created successfully! You can now login.');
    window.location.href = 'index.html';
});
