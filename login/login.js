boolLogin = true;
loginInfo = {};

function swapper() {
    clearErrorMessageIfExist();
    const switcher = document.getElementById("switcher");
    const button = document.getElementById("submitButton");

    //swaps states between login and signup
    if (boolLogin) {
        boolLogin = false;
        switcher.textContent = "Have an account? Click Here";
        button.textContent = "Sign Up"

    } else {
        boolLogin = true;
        switcher.textContent = "Don't have an account? Click Here";
        button.textContent = "Login"
    }
}



// THIS ALL WOULD BE BACKEND
function submit() {
    let username = document.getElementById("inputUsername").value;
    let password = document.getElementById("inputPassword").value;

    loadData();

    if (boolLogin) {
        if (loginInfo[username] && loginInfo[username] === password) {
            window.location.href = "./calendar.html";
        } else {
            createErrorMessage("Invalid username or password");
        }
    } else {
        if (loginInfo[username]) {
            createErrorMessage("Username already exists");
        } else {
            loginInfo[username] = password;
            saveData();
            clearInputs();
            window.location.href = "./calendar.html";
        }
    }
}

function saveData() {
    let dataToSave = { loginInfo: loginInfo };
    localStorage.setItem("loginData", JSON.stringify(dataToSave));
}

function loadData() {
    let savedData = localStorage.getItem("loginData");
    if (savedData) {
        let data = JSON.parse(savedData);
        loginInfo = data.loginInfo || {};
        return true;
    }
    return false;
}

function createErrorMessage(message){

    clearInputs();

    let mockForm = document.getElementsByClassName("form")[0];

    clearErrorMessageIfExist();

    let errorP = document.createElement("p");               //create new paragraph
    errorP.setAttribute("id", "error");                     //sets id = "error"      
    errorP.textContent = message;                           //change text content
    mockForm.appendChild(errorP);                           //add to bottom of form

}

function clearErrorMessageIfExist(){
    let mockForm = document.getElementsByClassName("form")[0];
    if (document.getElementById("error")) {
        mockForm.removeChild(document.getElementById("error"));
    }
}
function clearInputs() {
    document.getElementById("inputUsername").value = "";
    document.getElementById("inputPassword").value = "";
}
