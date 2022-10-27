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

function valid_email(email) {
    reg_expression = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    valid = email.match(reg_expression)
    
    if(!valid){
        return False
    }
    return True
}

function validate_form() {
    let password = document.forms["register_form"]["reg_password"].value;
    let re_enter = document.forms["register_form"]["re-enter"].value;
    let email = document.forms["register_form"]["reg_email"].value;

    email_validation = valid_email(email);
    if(!email_validation){
        const email_warning = document.getElementById("email_warning");
        email_warning.style.display = "block"
        return False;
    }
    if(password.length < 8){
        const password_warning = document.getElementById("password_warning");
        password_warning.style.display = "block"
        return False;
    }
    if(password != re_enter){
        const match = document.getElementById("match_warning");
        match.style.display = "block"
        return False;
    }

    return True
}

