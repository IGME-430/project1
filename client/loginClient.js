// Use regular expressions to perform an email address validation check
const validateEmail = (email) => {

  let mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

  if (email.match(mailFormat)) {
    return (true);
  }
  else {
    alert("You have entered an invalid email address!")

    return (false);
  }
};

// Check whether information is entered in the login and creation forms
// when the button is clicked.  Also check if the information meets some
// basic conditions.
const evaluateData = (extractedData) => {

  let returnValue = false;

  if (extractedData['form'] === 'login-form') {
    if (extractedData['username'].length > 1) {
      if (extractedData['password'].length > 0) {
        returnValue = true;
      }
    }
  }
  else if (extractedData['form'] === 'register-form') {
    if (extractedData['username'].length > 1) {
      if (extractedData['password'].length > 0) {
        if (validateEmail(extractedData['email'])) {
          returnValue = true;
        }
      }
    }
  }

  return returnValue;
};

// Extract the form data
const formData = (activeForm, callback) => {

  let extractedData = {
    'form': activeForm.className,
  };

  const formElements = activeForm.querySelectorAll('input');

  switch (activeForm.className) { // A switch is used here because additional forms are expected.
    case 'login-form': // If we are on the login form
      extractedData['username'] = formElements[0].value;
      extractedData['password'] = formElements[1].value;

      break;
    case 'register-form': // If we are on the  registration form
      extractedData['username'] = formElements[0].value;
      extractedData['password'] = formElements[1].value;
      extractedData['email'] = formElements[2].value;

      break;
  }

  if (evaluateData(extractedData)) {
    callback(extractedData);
  }
  else {
    window.alert('The information you supplied is not valid or incorrect, please try again');
  }
};

// Initialize form elements
const init = () => {

  // Add animation to login screen
  $('.message a').click(function(){
    $('form').animate({height: "toggle", opacity: "toggle"}, "slow");
  });

  // connect to forms
  const loginForm = document.querySelector('.login-form');
  const registerForm = document.querySelector('.register-form');

  // create handlers to forms
  const login = (e) => formData(loginForm, (extractedData) => {
    document.querySelector('.login-page').style.cursor = "progress";
    sendPost(e, extractedData);
  });
  const register = (e) => formData(registerForm, (extractedData) => {sendPost(e, extractedData)});

  loginForm.addEventListener('submit', login);
  registerForm.addEventListener('submit', register);

};

window.onload = init;
