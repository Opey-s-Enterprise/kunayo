const agreeCheckbox = document.getElementById('agree');
const signupButton = document.getElementById('signup-btn');
const termsLink = document.getElementById('terms-link');
const termsPopup = document.getElementById('terms-popup');
const closePopupButton = document.getElementById('close-popup');
const form = document.getElementById('signup-form');
const error = document.getElementById('error'); // Declare the error element
const success = document.getElementById('success'); // Declare the success element

agreeCheckbox.addEventListener('change', function () {
    signupButton.disabled = !this.checked;
});

// Show the terms pop-up when the link is clicked
termsLink.addEventListener('click', function (e) {
    e.preventDefault();
    termsPopup.style.display = 'block';
});

// Close the terms pop-up when the close button is clicked
closePopupButton.addEventListener('click', function () {
    termsPopup.style.display = 'none';
});

form.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent the default form submission

    const signup = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };

    fetch('/api/signup', {
        method: 'POST',
        body: JSON.stringify(signup),
        headers: {
            "Content-Type": "application/json" // Fix typo in "Content-Type"
        }
    })
    .then(res => res.json())
    .then(data => {
        if (data.status == "error") { // Fix the comparison operator
            success.style.display = 'none';
            error.style.display = 'block';
            error.innerText = data.error;
        } else {
            error.style.display = 'none';
            success.style.display = 'block';
            success.innerText = data.success; // Correct the typo in "success"
        }
    })
    .catch(error => {
        console.error('Fetch error:', error);
    });
});
