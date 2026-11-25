/**
 * SportZone - Professional Authentication Controller
 * Handles tab switching, real-time validation, password strength calculation,
 * show/hide toggles, and seamless integration with existing auth APIs.
 */

// DOM Elements
const tabLogin = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authAlert = document.getElementById('authAlert');
const alertIcon = document.getElementById('alertIcon');
const alertText = document.getElementById('alertText');

// Login Elements
const loginIdentifier = document.getElementById('loginIdentifier');
const loginPassword = document.getElementById('loginPassword');
const rememberMeCheckbox = document.getElementById('rememberMeCheckbox');
const loginSubmitBtn = document.getElementById('loginSubmitBtn');
const loginIdError = document.getElementById('loginIdError');
const loginPassError = document.getElementById('loginPassError');

// Register Elements
const regUsername = document.getElementById('regUsername');
const regEmail = document.getElementById('regEmail');
const regPassword = document.getElementById('regPassword');
const regConfirmPassword = document.getElementById('regConfirmPassword');
const registerSubmitBtn = document.getElementById('registerSubmitBtn');
const regUsernameError = document.getElementById('regUsernameError');
const regEmailError = document.getElementById('regEmailError');
const regPasswordError = document.getElementById('regPasswordError');
const regConfirmError = document.getElementById('regConfirmError');

// Password Strength Elements
const strengthContainer = document.getElementById('strengthContainer');
const strengthText = document.getElementById('strengthText');
const bars = [
    document.getElementById('bar1'),
    document.getElementById('bar2'),
    document.getElementById('bar3'),
    document.getElementById('bar4')
];

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    initRememberedUser();
    checkUrlHash();
    setupLiveValidation();
});

/**
 * Switch between Login and Register tabs
 * @param {'login'|'register'} tab
 */
function switchAuthTab(tab) {
    clearAlert();
    clearFieldErrors();

    if (tab === 'login') {
        tabLogin.classList.add('active');
        tabLogin.setAttribute('aria-selected', 'true');
        tabRegister.classList.remove('active');
        tabRegister.setAttribute('aria-selected', 'false');

        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        loginForm.classList.add('fade-in');

        // Focus first field
        loginIdentifier.focus();
    } else {
        tabRegister.classList.add('active');
        tabRegister.setAttribute('aria-selected', 'true');
        tabLogin.classList.remove('active');
        tabLogin.setAttribute('aria-selected', 'false');

        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        registerForm.classList.add('fade-in');

        // Focus first field
        regUsername.focus();
    }
}

/**
 * Toggle Password Visibility
 * @param {string} inputId
 * @param {HTMLButtonElement} btn
 */
function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const eyeOpen = btn.querySelector('.eye-open');
    const eyeClosed = btn.querySelector('.eye-closed');

    if (input.type === 'password') {
        input.type = 'text';
        eyeOpen.classList.add('hidden');
        eyeClosed.classList.remove('hidden');
        btn.setAttribute('aria-label', 'Hide password');
    } else {
        input.type = 'password';
        eyeOpen.classList.remove('hidden');
        eyeClosed.classList.add('hidden');
        btn.setAttribute('aria-label', 'Show password');
    }
}

/**
 * Display alert banner
 * @param {string} message
 * @param {'error'|'success'} type
 */
function showAlert(message, type = 'error') {
    alertText.textContent = message;
    authAlert.className = `auth-alert ${type}`;

    if (type === 'error') {
        alertIcon.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
        `;
    } else {
        alertIcon.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
        `;
    }

    authAlert.classList.remove('hidden');
}

function clearAlert() {
    authAlert.className = 'auth-alert hidden';
    alertText.textContent = '';
    alertIcon.innerHTML = '';
}

function clearFieldErrors() {
    document.querySelectorAll('.field-error-hint').forEach(el => {
        el.textContent = '';
        el.classList.remove('visible');
    });
    document.querySelectorAll('.auth-input').forEach(el => {
        el.classList.remove('input-invalid');
    });
}

/**
 * Real-time Password Strength Calculator
 * @param {string} password
 */
function evaluatePasswordStrength(password) {
    if (!password) {
        bars.forEach(bar => {
            bar.className = 'meter-bar';
        });
        strengthText.textContent = 'None';
        strengthText.className = 'strength-text';
        return 0;
    }

    let score = 0;

    // Checks
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;

    // Reset bars
    bars.forEach(bar => {
        bar.className = 'meter-bar';
    });

    if (score === 1) {
        bars[0].classList.add('bar-weak');
        strengthText.textContent = 'Weak (Needs numbers or symbols)';
        strengthText.className = 'strength-text text-weak';
    } else if (score === 2) {
        bars[0].classList.add('bar-fair');
        bars[1].classList.add('bar-fair');
        strengthText.textContent = 'Fair';
        strengthText.className = 'strength-text text-fair';
    } else if (score === 3) {
        bars[0].classList.add('bar-good');
        bars[1].classList.add('bar-good');
        bars[2].classList.add('bar-good');
        strengthText.textContent = 'Good';
        strengthText.className = 'strength-text text-good';
    } else if (score >= 4) {
        bars.forEach(bar => bar.classList.add('bar-strong'));
        strengthText.textContent = 'Strong (Athlete Ready)';
        strengthText.className = 'strength-text text-strong';
    }

    return score;
}

/**
 * Setup input listeners for real-time validation
 */
function setupLiveValidation() {
    // Password strength listener
    regPassword.addEventListener('input', () => {
        evaluatePasswordStrength(regPassword.value);
        if (regConfirmPassword.value) {
            checkPasswordMatch();
        }
    });

    // Confirm password match listener
    regConfirmPassword.addEventListener('input', checkPasswordMatch);

    // Clean field errors on typing
    const inputs = [loginIdentifier, loginPassword, regUsername, regEmail, regPassword, regConfirmPassword];
    inputs.forEach(input => {
        if (!input) return;
        input.addEventListener('input', () => {
            input.classList.remove('input-invalid');
            const hint = input.closest('.input-field-group')?.querySelector('.field-error-hint');
            if (hint) {
                hint.textContent = '';
                hint.classList.remove('visible');
            }
        });
    });
}

function checkPasswordMatch() {
    const p1 = regPassword.value;
    const p2 = regConfirmPassword.value;

    if (!p2) {
        regConfirmError.textContent = '';
        regConfirmError.classList.remove('visible');
        regConfirmPassword.classList.remove('input-invalid');
        return false;
    }

    if (p1 !== p2) {
        regConfirmError.textContent = 'Passwords do not match.';
        regConfirmError.classList.add('visible');
        regConfirmPassword.classList.add('input-invalid');
        return false;
    } else {
        regConfirmError.textContent = '✓ Passwords match.';
        regConfirmError.classList.add('visible', 'valid-hint');
        regConfirmPassword.classList.remove('input-invalid');
        return true;
    }
}

/**
 * Handle URL hash for deep linking (#login or #register)
 */
function checkUrlHash() {
    const hash = window.location.hash.toLowerCase();
    if (hash === '#register') {
        switchAuthTab('register');
    } else {
        switchAuthTab('login');
    }
}

/**
 * Check if user previously checked "Remember Me"
 */
function initRememberedUser() {
    const saved = localStorage.getItem('sportzone_remembered_identifier');
    if (saved) {
        loginIdentifier.value = saved;
        rememberMeCheckbox.checked = true;
    }
}

// ==========================================
// LOGIN FORM SUBMISSION
// ==========================================
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAlert();
    clearFieldErrors();

    const identifier = loginIdentifier.value.trim();
    const password = loginPassword.value;

    let hasError = false;

    if (!identifier) {
        loginIdError.textContent = 'Please enter your email or username.';
        loginIdError.classList.add('visible');
        loginIdentifier.classList.add('input-invalid');
        hasError = true;
    }

    if (!password) {
        loginPassError.textContent = 'Please enter your password.';
        loginPassError.classList.add('visible');
        loginPassword.classList.add('input-invalid');
        hasError = true;
    }

    if (hasError) return;

    // Loading State
    setButtonLoading(loginSubmitBtn, true, 'Signing In...');

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, password })
        });

        const data = await response.json();

        if (!response.ok) {
            showAlert(data.error || 'Login failed. Please verify your credentials.');
            setButtonLoading(loginSubmitBtn, false, 'Sign In');
            return;
        }

        // Handle Remember Me
        if (rememberMeCheckbox.checked) {
            localStorage.setItem('sportzone_remembered_identifier', identifier);
        } else {
            localStorage.removeItem('sportzone_remembered_identifier');
        }

        // Store JWT token & authenticated user profile
        localStorage.setItem('sportzone_token', data.token);
        localStorage.setItem('sportzone_user', JSON.stringify(data.user));

        showAlert('Login successful! Redirecting to SportZone...', 'success');

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 700);
    } catch (err) {
        console.error('Login network error:', err);
        showAlert('Unable to connect to the authentication server. Please ensure the backend is running.');
        setButtonLoading(loginSubmitBtn, false, 'Sign In');
    }
});

// ==========================================
// REGISTRATION FORM SUBMISSION
// ==========================================
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAlert();
    clearFieldErrors();

    const username = regUsername.value.trim();
    const email = regEmail.value.trim();
    const password = regPassword.value;
    const confirmPassword = regConfirmPassword.value;

    let hasError = false;

    if (!username) {
        regUsernameError.textContent = 'Please enter a username.';
        regUsernameError.classList.add('visible');
        regUsername.classList.add('input-invalid');
        hasError = true;
    } else if (username.length < 3) {
        regUsernameError.textContent = 'Username must be at least 3 characters.';
        regUsernameError.classList.add('visible');
        regUsername.classList.add('input-invalid');
        hasError = true;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
        regEmailError.textContent = 'Please enter your email address.';
        regEmailError.classList.add('visible');
        regEmail.classList.add('input-invalid');
        hasError = true;
    } else if (!emailRegex.test(email)) {
        regEmailError.textContent = 'Please enter a valid email address.';
        regEmailError.classList.add('visible');
        regEmail.classList.add('input-invalid');
        hasError = true;
    }

    if (!password) {
        regPasswordError.textContent = 'Please enter a password.';
        regPasswordError.classList.add('visible');
        regPassword.classList.add('input-invalid');
        hasError = true;
    } else if (password.length < 6) {
        regPasswordError.textContent = 'Password must be at least 6 characters long.';
        regPasswordError.classList.add('visible');
        regPassword.classList.add('input-invalid');
        hasError = true;
    }

    if (!confirmPassword) {
        regConfirmError.textContent = 'Please confirm your password.';
        regConfirmError.classList.add('visible');
        regConfirmPassword.classList.add('input-invalid');
        hasError = true;
    } else if (password !== confirmPassword) {
        regConfirmError.textContent = 'Passwords do not match.';
        regConfirmError.classList.add('visible');
        regConfirmPassword.classList.add('input-invalid');
        hasError = true;
    }

    if (hasError) return;

    // Loading State
    setButtonLoading(registerSubmitBtn, true, 'Creating Account...');

    try {
        // Send only fields required by existing backend
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            showAlert(data.error || 'Registration failed. Please try a different username or email.');
            setButtonLoading(registerSubmitBtn, false, 'Create Account');
            return;
        }

        showAlert('Account created successfully! Please sign in with your credentials.', 'success');
        registerForm.reset();
        evaluatePasswordStrength('');
        setButtonLoading(registerSubmitBtn, false, 'Create Account');

        // Transition to login tab and prefill identifier
        setTimeout(() => {
            switchAuthTab('login');
            loginIdentifier.value = email;
            loginPassword.focus();
        }, 1200);
    } catch (err) {
        console.error('Registration network error:', err);
        showAlert('Unable to connect to the authentication server. Please ensure the backend is running.');
        setButtonLoading(registerSubmitBtn, false, 'Create Account');
    }
});

/**
 * Toggle button loading state with spinner
 * @param {HTMLButtonElement} btn
 * @param {boolean} isLoading
 * @param {string} text
 */
function setButtonLoading(btn, isLoading, text) {
    const textSpan = btn.querySelector('.btn-text');
    const spinner = btn.querySelector('.btn-spinner');

    btn.disabled = isLoading;
    if (textSpan) textSpan.textContent = text;

    if (isLoading) {
        btn.classList.add('btn-loading');
        if (spinner) spinner.classList.remove('hidden');
    } else {
        btn.classList.remove('btn-loading');
        if (spinner) spinner.classList.add('hidden');
    }
}
