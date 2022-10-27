function show_login() {
    const form = document.getElementById("login_form");
    const sign_in_form = document.getElementById("register_form");
    const display = form.style.display

    if(display == "none"){
        form.style.display = "block"
        sign_in_form.style.display = "none"
    }
}

function show_signup() {
    const form = document.getElementById("register_form");
    const login_form = document.getElementById("login_form");

    const display = form.style.display

    if(display == "none"){
        form.style.display = "block"
        login_form.style.display = "none"
    }
}

