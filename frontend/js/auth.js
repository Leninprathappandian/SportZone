const tabLogin = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authAlert = document.getElementById('authAlert');

// Switch between Login and Register tabs
function switchAuthTab(tab) {
    clearAlert();
    if (tab === 'login') {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    } else {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    }
}

function showAlert(message, type = 'error') {
    authAlert.textContent = message;
    authAlert.className = `auth-alert ${type}`;
    authAlert.classList.remove('hidden');
}

function clearAlert() {
    authAlert.textContent = '';
    authAlert.classList.add('hidden');
}

// Handle Login submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAlert();

    const identifier = document.getElementById('loginIdentifier').value.trim();
    const password = document.getElementById('loginPassword').value;

    const submitBtn = document.getElementById('loginSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Authenticating...';

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, password })
        });

        const data = await response.json();

        if (!response.ok) {
            showAlert(data.error || 'Login failed. Please check credentials.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign In';
            return;
        }

        // Store token & user data in localStorage
        localStorage.setItem('sportzone_token', data.token);
        localStorage.setItem('sportzone_user', JSON.stringify(data.user));

        showAlert('Login successful! Redirecting to SportZone...', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 800);
    } catch (err) {
        console.error('Login error:', err);
        showAlert('Cannot connect to server. Ensure backend is running.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In';
    }
});

// Handle Register submission
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAlert();

    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;

    if (password.length < 6) {
        showAlert('Password must be at least 6 characters long.');
        return;
    }

    const submitBtn = document.getElementById('registerSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Registering...';

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            showAlert(data.error || 'Registration failed.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Account';
            return;
        }

        showAlert('Account created in database! Please sign in with your credentials.', 'success');
        registerForm.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account';

        // Switch to login tab after 1.5 seconds
        setTimeout(() => {
            switchAuthTab('login');
            document.getElementById('loginIdentifier').value = email;
        }, 1200);
    } catch (err) {
        console.error('Registration error:', err);
        showAlert('Cannot connect to server. Ensure backend is running.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account';
    }
});
