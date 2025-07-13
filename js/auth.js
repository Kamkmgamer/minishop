// js/auth.js

// Auth Form elements (auth.html)
const showLoginBtn = document.getElementById('show-login');
const showRegisterBtn = document.getElementById('show-register');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

// Login form inputs
const loginUsernameInput = document.getElementById('login-username');
const loginPasswordInput = document.getElementById('login-password');

// Register form inputs
const registerUsernameInput = document.getElementById('register-username');
const registerPasswordInput = document.getElementById('register-password');
const registerConfirmPasswordInput = document.getElementById('register-confirm-password');

// Auth links in header (all pages)
const authLinksContainer = document.getElementById('auth-links');

// Helper to get all users from localStorage
function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

// Helper to save all users to localStorage
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// Helper to get current logged in user
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

// Helper to set current logged in user
function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    updateAuthLinks(); // Update header links on login/logout
}

// Helper to remove current logged in user
function clearCurrentUser() {
    localStorage.removeItem('currentUser');
    updateAuthLinks(); // Update header links on login/logout
}

// Function to handle registration
function handleRegister(event) {
    event.preventDefault();

    const username = registerUsernameInput.value.trim();
    const password = registerPasswordInput.value.trim();
    const confirmPassword = registerConfirmPasswordInput.value.trim();

    if (!username || !password || !confirmPassword) {
        window.showCustomModal("Error", "All fields are required.");
        return;
    }

    if (password !== confirmPassword) {
        window.showCustomModal("Error", "Passwords do not match.");
        return;
    }

    let users = getUsers();
    if (users.some(user => user.username === username)) {
        window.showCustomModal("Error", "Username already exists. Please choose a different one.");
        return;
    }

    const newUser = {
        id: Date.now(),
        username: username,
        password: password,
        orders: []
    };

    users.push(newUser);
    saveUsers(users);

    setCurrentUser(newUser); // Auto-login the new user

    // Redirect to home page after registration confirmation
    window.showCustomModal("Success!", "Registration successful! You are now logged in.", () => {
        window.location.href = 'index.html';
    });
}

// Function to handle login
function handleLogin(event) {
    event.preventDefault();

    const username = loginUsernameInput.value.trim();
    const password = loginPasswordInput.value.trim();

    if (!username || !password) {
        window.showCustomModal("Error", "Username and password are required.");
        return;
    }

    const users = getUsers();
    const foundUser = users.find(user => user.username === username && user.password === password);

    if (foundUser) {
        setCurrentUser(foundUser);
        // Redirect to home page after login confirmation
        window.showCustomModal("Success!", `Welcome back, ${foundUser.username}!`, () => {
            window.location.href = 'index.html';
        });
    } else {
        window.showCustomModal("Error", "Invalid username or password.");
    }
}

// Function to handle logout
function handleLogout() {
    clearCurrentUser();
    // Redirect to home page after logout confirmation
    if (window.showCustomModal) {
        window.showCustomModal("Logged Out", "You have been successfully logged out.", () => {
            window.location.href = 'index.html';
        });
    } else {
        alert("You have been successfully logged out.");
        window.location.href = 'index.html';
    }
}

// Function to update header auth links based on login status
function updateAuthLinks() {
    const currentUser = getCurrentUser();
    if (authLinksContainer) {
        authLinksContainer.innerHTML = '';
        if (currentUser) {
            const profileLink = document.createElement('a');
            profileLink.href = 'profile.html';
            profileLink.textContent = `Hi, ${currentUser.username.split(' ')[0]}!`;
            authLinksContainer.appendChild(profileLink);
        } else {
            const loginLink = document.createElement('a');
            loginLink.href = 'auth.html';
            loginLink.textContent = 'Login / Register';
            authLinksContainer.appendChild(loginLink);
        }
    }
}

// Event Listeners for auth.html forms
document.addEventListener('DOMContentLoaded', () => {
    // Only if on auth.html
    if (loginForm && registerForm) {
        showLoginBtn.addEventListener('click', () => {
            showLoginBtn.classList.add('active');
            showRegisterBtn.classList.remove('active');
            loginForm.classList.add('active');
            registerForm.classList.remove('active');
        });

        showRegisterBtn.addEventListener('click', () => {
            showRegisterBtn.classList.add('active');
            showLoginBtn.classList.remove('active');
            registerForm.classList.add('active');
            loginForm.classList.remove('active');
        });

        loginForm.addEventListener('submit', handleLogin);
        registerForm.addEventListener('submit', handleRegister);
    }

    // Call this on all pages to update header links
    updateAuthLinks();
});

// Make helper functions globally accessible
window.getCurrentUser = getCurrentUser;
window.setCurrentUser = setCurrentUser;
window.getUsers = getUsers;
window.saveUsers = saveUsers;
window.handleLogout = handleLogout; // Ensure this is exposed for profile.js