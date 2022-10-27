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
    let password = document.forms["myForm"]["fname"].value;
    let re_enter = document.forms["myForm"]["fname"].value;
    let email = document.forms["myForm"]["fname"].value;
}

