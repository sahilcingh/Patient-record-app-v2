// frontend/js/auth.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const doctorIdInput = document.getElementById('doctorId');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    const btnText = document.getElementById('btn-text');
    const btnSpinner = document.getElementById('btn-spinner');

    // Security Check: If they are already logged in, send them straight to the dashboard
    if (localStorage.getItem('doctorToken')) {
        window.location.href = 'home.html';
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            
            // Trigger the loading spinner UI
            loginBtn.disabled = true;
            btnText.classList.add('hidden');
            btnSpinner.classList.remove('hidden');

            try {
                // Send the credentials to the Node.js backend
                const response = await fetch('http://localhost:5000/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        doctorId: doctorIdInput.value,
                        password: passwordInput.value
                    })
                });

                const data = await response.json();

                if (data.success) {
                    // Success! Save the token and doctor details to the browser's local storage
                    localStorage.setItem('doctorToken', data.token);
                    localStorage.setItem('doctorName', data.doctorName);
                    localStorage.setItem('dbName', data.dbName);
                    
                    // Redirect to the dashboard
                    window.location.href = 'home.html';
                } else {
                    // Login failed (e.g., wrong password)
                    alert(data.message);
                    
                    // Reset the button UI
                    loginBtn.disabled = false;
                    btnText.classList.remove('hidden');
                    btnSpinner.classList.add('hidden');
                }

            } catch (error) {
                console.error("Login request failed:", error);
                alert("Failed to connect to the server. Please ensure the backend is running.");
                
                // Reset the button UI
                loginBtn.disabled = false;
                btnText.classList.remove('hidden');
                btnSpinner.classList.add('hidden');
            }
        });
    }
});