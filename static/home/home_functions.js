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

// function valid_email(email) {
//     reg_expression = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
//     valid = email.match(reg_expression)
    
//     if(!valid){
//         return False
//     }
//     return True
// }

function validate_form() {
    let password = document.forms["register_form"]["reg_password"].value;
    let re_enter = document.forms["register_form"]["re-enter"].value;
    // let email = document.forms["register_form"]["reg_email"].value;

    // email_validation = valid_email(email);
    // if(!email_validation){
    //     const email_warning = document.getElementById("email_warning");
    //     email_warning.style.display = "block"
    //     return False;
    // }
    // if password is weak, but passwords match, show weak warning, else show both
    if(password.length < 5 && password == re_enter){
        const password_warning = document.getElementById("password_warning");
        password_warning.style.display = "block"
        document.getElementById("match_warning").style.display = "none"
        return false;
    }else if(password.length < 5 && password != re_enter){
        const password_warning = document.getElementById("password_warning");
        password_warning.style.display = "block"
        const match = document.getElementById("match_warning");
        match.style.display = "block"
        return false
    }
    // if passwords don't match, but password strong, show match warning, else show both
    if(password != re_enter && password.length >= 5){
        const match = document.getElementById("match_warning");
        match.style.display = "block"
        document.getElementById("password_warning").style.display = "none"
        return false;
    }else if(password != re_enter && password.length < 5){
        const password_warning = document.getElementById("password_warning");
        password_warning.style.display = "block"
        const match = document.getElementById("match_warning");
        match.style.display = "block"
        return false
    }

    return true
}

