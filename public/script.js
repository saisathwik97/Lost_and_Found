
function showLoginForm(type) {

    document.getElementById('adminLoginForm').classList.add('hidden');
    document.getElementById('studentLoginForm').classList.add('hidden');
    document.getElementById('studentRegisterForm').classList.add('hidden');
   
    document.getElementById(`${type}LoginForm`).classList.remove('hidden');
}

function showRegisterForm() {
    document.getElementById('adminLoginForm').classList.add('hidden');
    document.getElementById('studentLoginForm').classList.add('hidden');
    document.getElementById('studentRegisterForm').classList.remove('hidden');
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    
    if (input.type === 'password') {
        input.type = 'text';
        button.textContent = 'Hide';
    } else {
        input.type = 'password';
        button.textContent = 'Show';
    }
}

async function login(type) {
    const email = document.getElementById(`${type}Email`).value;
    const password = document.getElementById(`${type}Password`).value;

    if (!email || !password) {
        alert('Please enter both email and password');
        return;
    }

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ email, password, type })
        });

        const data = await response.json();
        
        if (data.success) {
             sessionStorage.setItem('userType', type);
            sessionStorage.setItem('userEmail', email);
            localStorage.setItem('userType', type);
            localStorage.setItem('userEmail', email);
          
            window.location.href = '/student-dashboard';
        } else {
            alert(data.message || 'Login failed. Please try again.');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred during login. Please try again.');
    }
}


async function register() {
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    console.log('Registration attempt:', { name, email }); 
    if (!name || !email || !password || !confirmPassword) {
        alert('Please fill in all fields');
        return;
    }
    
    if (!email.endsWith('@grietcollege.com')) {
        alert('Only @grietcollege.com email are allowed');
        return;
    }
    
  
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }
    
    try {
        console.log('Sending registration request...'); 
        
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password })
        });
        
        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Response data:', data); 
        
        if (response.ok && data.success) {
            alert('Registration successful! Please login.');
            
            document.getElementById('registerName').value = '';
            document.getElementById('registerEmail').value = '';
            document.getElementById('registerPassword').value = '';
            document.getElementById('registerConfirmPassword').value = '';
    
            showLoginForm('student');
        } else {
            alert(data.error || 'Registration failed. Please try again.');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('An error occurred during registration. Please try again.');
    }
}

window.addEventListener('load', async () => {
    try {
        const response = await fetch('/api/session', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.authenticated) {
            window.location.href = '/admin-dashboard';
        }
    } catch (error) {
        console.error('Session check error:', error);
    }
});


document.addEventListener('DOMContentLoaded', function() {
    const adminEmail = document.getElementById('adminEmail');
    const adminPassword = document.getElementById('adminPassword');
    
    if (adminEmail) {
        adminEmail.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') login('admin');
        });
    }
    
    if (adminPassword) {
        adminPassword.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') login('admin');
        });
    }
    
    const studentEmail = document.getElementById('studentEmail');
    const studentPassword = document.getElementById('studentPassword');
    
    if (studentEmail) {
        studentEmail.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') login('student');
        });
    }
    
    if (studentPassword) {
        studentPassword.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') login('student');
        });
    }

    const registerConfirmPassword = document.getElementById('registerConfirmPassword');
    
    if (registerConfirmPassword) {
        registerConfirmPassword.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') register();
        });
    }
});