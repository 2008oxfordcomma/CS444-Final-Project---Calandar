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
            localStorage.setItem("currentUser", username);
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
            localStorage.setItem("currentUser", username);
            clearInputs();
            window.location.href = "./calendar.html";
        }
    }
}

function saveData() {
    let username = document.getElementById("inputUsername").value;
    if (!username) {
        return;
    }

    let dataToSave = {loginInfo: loginInfo};
    let allUserData = localStorage.getItem("allCalendarData");
    if (allUserData) {
        allUserData = JSON.parse(allUserData);
    } else {
        allUserData = {};
    }
    allUserData[username] = dataToSave;
    localStorage.setItem("allCalendarData", JSON.stringify(allUserData));
}

function loadData() {
    let username = document.getElementById("inputUsername").value;
    if (!username) {
        return false;
    }
    
    let allUserData = localStorage.getItem("allCalendarData");
    if (allUserData) {
        let data = JSON.parse(allUserData);
        if (data[username]) {
            loginInfo = data[username].loginInfo || {};
            return true;
        }
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
    document.getElementById("inputPassword").value = "";
    //document.getElementById("inputUsername").value = "";

}


function keyboardCheck(event){
    if(event.key === "Enter"){
        submit();
    }
}