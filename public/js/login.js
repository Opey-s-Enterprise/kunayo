const form = document.getElementById('login-form')
form.addEventListener('submit', () =>{
    const login ={
        name: name.value,
        email: email.value,
        password: password.value
    }
    fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify(login),
        headers: {
            "content-Type": "application/json"
        }
    }) .then(res => res.json())
    .then(data => {
        if (data.status == "errror"){
            success.style.display = 'none'
            error.style.display ='block'
            error.innerText = data.error
        }
        else{
            error.style.display ='none'
            success.style.display = 'block'
            success.innerText = data.sucess
        }
    })
})