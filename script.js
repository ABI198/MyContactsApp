
let firstName = document.getElementById('firstname');
let surname = document.getElementById('surname');
let email = document.getElementById('email');
let submitButton = document.getElementById('submitButton');
let editButton = document.getElementById('editButton');
let form = document.querySelector('form');
let alerts = document.querySelectorAll('.alertControl');
let [successAdd, successEdit, successDelete, problem, editMode, editAndDeleteOverlap] = alerts;
let userTableBody = document.querySelector('tbody');
let userRecordsController = document.querySelector('tbody'); //For deleting user record operations
let body = document.querySelector('body'); //For controlling mouse events

let alertDisplayingTime = 2000; //Time for displaying the active alert
let alertDisappearingTime = 500; //Time for disappearing the active alert

let previousEmail = null;

let users = [];

eventListenersRun();


//Functions
//---------------------------------------------------------------------------------------------------------------------

function eventListenersRun(){
    //window.addEventListener('load', whenPageIsLoaded);
    form.addEventListener('submit', whenFormIsSubmitted);
    window.addEventListener('beforeunload', whenWindowIsAboutToBeClosed);
    userRecordsController.addEventListener('click', whenUserRecordsControllerisClicked);
    editButton.addEventListener('click', whenEditButtonIsClicked);
}

function checkInputValues(){
    if(firstName.value !== '' && surname.value !== '' && email.value !== ''){
        setAllAlerts(successAdd);
        clearInputs();
        let user = {firstName : firstName.value, surname : surname.value, email : email.value};
        if(addUserToTable(user)){
            users.push(user);
        }
    }
    else{
        setAllAlerts(problem);
    }
}

function addUserToTable(user){
    var newUser = createUserElement(user);
    userTableBody.appendChild(newUser);
    return newUser !== null;
}

function createUserElement(user){
    let tr = document.createElement('tr');
    tr.innerHTML = `<td>${user.firstName}</td>
    <td>${user.surname}</td>
    <td>${user.email}</td>
    <td class="pl-4">
        <i title="Edit" class="myButton fas fa-edit ml-2 text-success"></i>
        <i title="Delete" class="myButton fas fa-trash-alt text-danger"></i>
    </td>`;
    return tr;
}

function clearInputs(){
    setTimeout(() => {
        firstName.value = '';
        surname.value = '';
        email.value = '';
    }, alertDisplayingTime + alertDisappearingTime); //Clear All Inputs after alert disappers
}

function setAllAlerts(activeAlertElement){
    alerts.forEach((value) => {
        if(activeAlertElement === value) 
            smoothDisplayNone(value);
        else
            value.style.display = 'none';
    });
}

//Alert smooth display:none animation
function smoothDisplayNone(selectedElement){
    selectedElement.style.display = 'block';
    selectedElement.classList.add('animationDisplayBlock'); 
    selectedElement.classList.remove('animationDisplayNone');
    disableKeyboardAndMouseEvents(); 
    
    setTimeout(() => {
        selectedElement.classList.remove('animationDisplayBlock'); 
        selectedElement.classList.add('animationDisplayNone');
    }, alertDisplayingTime); //Time for displaying the current alert
 
    setTimeout(() => {
        selectedElement.style.display = 'none';
        enableKeyboardAndMouseEvents();
    }, alertDisplayingTime + alertDisappearingTime); //2500(Alert Displaying Time + Animation Time=>500msec)   
}

function disableKeyboardAndMouseEvents(){
    disableMouseEvents();
    disableKeyboardEvents();
}

function enableKeyboardAndMouseEvents(){
    enableMouseEvents();
    enableKeyboardEvents();
}

function disableKeyboardEvents(){
    document.onkeydown = function (e) {
        return false; //Disable Keyboard Events
    }
}

function enableKeyboardEvents(){
    document.onkeydown = function (e) {
        return true; //Enable Keyboard Events
    }
}

function disableMouseEvents(){
    body.style.pointerEvents = 'none'; //Disable Mouse Events
}

function enableMouseEvents(){
    body.style.pointerEvents = 'auto'; //Enable Mouse Events
}


function loadDataToTableFromLocalStorage(){
    //When the window is loaded data will be taken from Local Storage and written into the table.
    users = JSON.parse(localStorage.getItem('users'));
    if(users !== null){
        users.forEach((user) => {
            addUserToTable(user);
        });
    }
}

function loadUsersToLocalStorage(){
    //When the window is about to be closed data will be written to local storage
    localStorage.setItem('users', JSON.stringify(users));
}

function deleteRequestedUser(e){
    if(e.target.classList.contains('fa-trash-alt')){ 
        if(editButton.classList.contains('d-none')){
            let deletedUserRecord = e.target.parentElement.parentElement; //grandparent of related delete icon (<tr>)
            removeUserRecordFromLocalStorage(e.target);
            deletedUserRecord.remove();
            setAllAlerts(successDelete);
        }
        else
            setAllAlerts(editAndDeleteOverlap);
    }  
}

function fillTextBoxesByRequestedUserInfo(selectedIcon){
    let selectedUserMail = getSelectedUserUniqueEmail(selectedIcon);
    let selectedUser = findUserByMail(selectedUserMail);
    firstName.value = selectedUser.firstName;
    surname.value = selectedUser.surname;
    email.value = selectedUser.email;
    previousEmail = selectedUser.email;
}

function findUserByMail(userMail){
    return users.find(user => user.email === userMail);
}

function removeUserRecordFromLocalStorage(selectedIcon){
    let userEmail = getSelectedUserUniqueEmail(selectedIcon);
    removeUserFromObjectArray(users, userEmail);
}

function getSelectedUserUniqueEmail(selectedIcon){
    return selectedIcon.parentElement.previousElementSibling.innerText;
}

function removeUserFromObjectArray(users, info){
    let objIndex = 0;
    users.forEach((user, index) => {
        if(user.email === info)         
            objIndex = index;
    });
    users.splice(objIndex, 1); //Delete the object placed to objIndex
}

function editRequestedUser(e){
    if(e.target.classList.contains('fa-edit')){
        showEditButton(); //Edit Button -> Enable, Submit Button -> Disable
        setAllAlerts(editMode);
        setTimeout(() => {
            disableKeyboardEnter(); //We need to ensure that this function should run after setAllAlerts() completes
        },alertDisplayingTime + alertDisappearingTime + 10);
        fillTextBoxesByRequestedUserInfo(e.target);
    }
}

function disableKeyboardEnter(){
    document.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            return false;
        }     
    });
}

function enableKeyboardEnter(){
    document.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            return true;
        }     
    });
}

function showEditButton(){
    enableButton(editButton);
    disableButton(submitButton);
}

function showSubmitButton(){
    enableButton(submitButton);
    disableButton(editButton);
}

function enableButton(buttonType){
    buttonType.classList.add('d-block');
    buttonType.classList.remove('d-none');
}

function disableButton(buttonType){
    buttonType.classList.remove('d-block');
    buttonType.classList.add('d-none');
}

function addNewInfoToSelectedUser(){
    let editedtr = getEditedtr();
    editedtr.cells[0].innerText = firstName.value;
    editedtr.cells[1].innerText = surname.value;
    editedtr.cells[2].innerText = email.value;
    editValuesInUserArray(firstName.value, surname.value, previousEmail, email.value);
    previousEmail = email.value;
    setAllAlerts(successEdit);
    setTimeout(() => {
        showSubmitButton();
    }, alertDisplayingTime + alertDisappearingTime);
    clearInputs();
}

function getEditedtr(){
    let trList = document.querySelectorAll('tbody tr');
    for(tr of trList){
        //previousEmail -> We have to keep email value that is before editing.
        if(tr.cells[2].innerText === previousEmail) 
            return tr; 
    }
}

function editValuesInUserArray(firstName, surname, email, newEmail){
    users.forEach((user) => {
        if(user.email === email)
        {
            user.firstName = firstName;
            user.surname = surname;
            user.email = newEmail;
        }
    });
}


//Event Handlers
//---------------------------------------------------------------------------------------------------------------------
function whenPageIsLoaded(e){
    loadDataToTableFromLocalStorage();
}

function whenFormIsSubmitted(e){
    checkInputValues();
    e.preventDefault(); //Because of 'Submit' event
}

function whenWindowIsAboutToBeClosed(e){
    loadUsersToLocalStorage();
}

function whenUserRecordsControllerisClicked(e){
    deleteRequestedUser(e);
    editRequestedUser(e);
}

function whenEditButtonIsClicked(e){
    addNewInfoToSelectedUser(e);
}