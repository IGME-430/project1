// Process and construct the JSON data
const parseJSON = (xhr, content) => {
  // parse response
  try {
    const statusCode = xhr.status;
    const obj = JSON.parse(xhr.response);

    switch (statusCode) {
      case 302:
        // If it is a redirect request, change the window location
        let destination = ``;
        destination += `${obj.destination}?`;
        destination += `username:${obj.username}`;
        window.location.replace(destination);
        break;

      case 201:
      case 401:
      case 409:
        break;

      default:
        console.dir(obj); // if response contains message, display it

        if (obj.message) {
          const p = document.createElement('p');
          p.textContent = `Message: ${obj.message}`;
          content.appendChild(p);
        } // if response contains user info, display it


        if (obj.users) {
          const userList = document.createElement('p');
          const users = JSON.stringify(obj.users);
          userList.textContent = users;
          content.appendChild(userList);
        }

    }
  } catch (err) {
    console.log(err);
  }
}; // process the request response after xhr request


const handleResponse = xhr => {
  const content = null; //document.querySelector('#content');

  switch (xhr.status) {
    case 200:
      console.log('Success');
      break;

    case 201:
      // The request has been fulfilled and resulted in a new resource being created.
      console.log(JSON.parse(xhr.response).message);
      alert(JSON.parse(xhr.response).message);
      break;

    case 202:
      // The request has been accepted for processing, but the processing has not been completed.
      console.log('Created');
      break;

    case 204:
      console.log('Updated (No Content)');
      break;

    case 302:
      console.log('Redirecting');
      break;

    case 400:
      console.log('Bad Request');
      break;

    case 401:
      // Similar to 403 Forbidden, but specifically for use when authentication is
      // possible but has failed or not yet been provided.
      console.log(JSON.parse(xhr.response).message);
      alert(JSON.parse(xhr.response).message);
      break;

    case 404:
      // The requested resource could not be found but may be available again in the future.
      console.log('Resource Not Found');
      break;

    case 409:
      // The request could not be processed because of conflict in the request.
      console.log(JSON.parse(xhr.response).message);
      alert(JSON.parse(xhr.response).message);
      break;

    case 500:
      // A generic error message, given when no more specific message is suitable.
      console.log('The server encountered an unexpected condition which prevented it from fulfilling the request.');
      break;

    case 501:
      // The server either does not recognise the request method, or it lacks the ability
      // to fulfill the request.
      console.log('A get request for this page has not been implemented yet.  Check again later for updated content.');
      break;

    default:
      console.log('Error code not implemented by client.');
      break;
  } // If the XHR object contains a response object, run the parseJSON function


  if (xhr.response) {
    parseJSON(xhr, content);
  }
}; // Set up and send the POST request


const sendPost = (e, data) => {
  e.preventDefault(); // construct the XHR request

  const xhr = new XMLHttpRequest(); // define query parameter variable for completion in switch

  let formData;

  if (data['form'] === 'login-form' || data['form'] === 'register-form') {
    xhr.open('POST', '/processRequest');
  } // Determine the format of the data to send to the server based on the form
  // it was sent from


  if (data['form'] === 'login-form') {
    formData = `username=${data['username']}&password=${data['password']}`;
  } else if (data['form'] === 'register-form') {
    formData = `username=${data['username']}&password=${data['password']}&email=${data['email']}`;
  } // set headers


  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('Accept', 'application/json'); // configure callback

  xhr.onload = () => handleResponse(xhr); // send request


  xhr.send(formData);
  return false;
};
// Use regular expressions to perform an email address validation check
const validateEmail = email => {
  let mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

  if (email.match(mailFormat)) {
    return true;
  } else {
    alert("You have entered an invalid email address!");
    return false;
  }
}; // Check whether information is entered in the login and creation forms
// when the button is clicked.  Also check if the information meets some
// basic conditions.


const evaluateData = extractedData => {
  let returnValue = false;

  if (extractedData['form'] === 'login-form') {
    if (extractedData['username'].length > 1) {
      if (extractedData['password'].length > 0) {
        returnValue = true;
      }
    }
  } else if (extractedData['form'] === 'register-form') {
    if (extractedData['username'].length > 1) {
      if (extractedData['password'].length > 0) {
        if (validateEmail(extractedData['email'])) {
          returnValue = true;
        }
      }
    }
  }

  return returnValue;
}; // Extract the form data


const formData = (activeForm, callback) => {
  let extractedData = {
    'form': activeForm.className
  };
  const formElements = activeForm.querySelectorAll('input');

  switch (activeForm.className) {
    // A switch is used here because additional forms are expected.
    case 'login-form':
      // If we are on the login form
      extractedData['username'] = formElements[0].value;
      extractedData['password'] = formElements[1].value;
      break;

    case 'register-form':
      // If we are on the  registration form
      extractedData['username'] = formElements[0].value;
      extractedData['password'] = formElements[1].value;
      extractedData['email'] = formElements[2].value;
      break;
  }

  if (evaluateData(extractedData)) {
    callback(extractedData);
  } else {
    window.alert('The information you supplied is not valid or incorrect, please try again');
  }
}; // Initialize form elements


const init = () => {
  // Add animation to login screen
  $('.message a').click(function () {
    $('form').animate({
      height: "toggle",
      opacity: "toggle"
    }, "slow");
  }); // connect to forms

  const loginForm = document.querySelector('.login-form');
  const registerForm = document.querySelector('.register-form'); // create handlers to forms

  const login = e => formData(loginForm, extractedData => {
    document.querySelector('.login-page').style.cursor = "progress";
    sendPost(e, extractedData);
  });

  const register = e => formData(registerForm, extractedData => {
    sendPost(e, extractedData);
  });

  loginForm.addEventListener('submit', login);
  registerForm.addEventListener('submit', register);
};

window.onload = init;
