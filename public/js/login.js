// Select the login button by ID
const loginButton = document.getElementById('login');

// Add a click event listener to the login button
loginButton.addEventListener('click', (event) => {
    event.preventDefault(); // Prevent the default button click behavior

    // Get the email and password input values
    const emailInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;

    // Create a login object with email and password
    const loginData = {
        email: emailInput,
        password: passwordInput
    };

    // Send a POST request to the /api/login endpoint
    fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify(loginData),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then((response) => response.json())
    .then((data) => {
        // Check the response status and display appropriate messages
        const errorElement = document.getElementById('error');
        const successElement = document.getElementById('success');

        if (data.status === 'error') {
            // Display error message
            errorElement.style.display = 'block';
            successElement.style.display = 'none';
            errorElement.innerText = data.error;
        } else {
            // Display success message
            successElement.style.display = 'block';
            errorElement.style.display = 'none';
            successElement.innerText = data.success;
            setTimeout(() => {
                window.location.href = '/new_arrival';
            }, 500);
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        res.status(500).json({ status: 'error', error: 'An error occurred on the server.' });
    });
});