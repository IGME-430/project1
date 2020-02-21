// Process and construct the JSON data
const parseJSON = (xhr, content) => {
  // parse response
  try {
    const obj = JSON.parse(xhr.response);
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

    if (obj.login) {
      if (obj.login === 'successful') {
        // window.open(xhr.responseURL);
        // construct the XHR request
        const xhr = new XMLHttpRequest();
        xhr.open('GET', '/getGpaInfo', true); // set headers

        xhr.setRequestHeader('Accept', 'application/json'); // configure callback

        xhr.onload = () => handleResponse(xhr, true); // send request


        xhr.send();
        return false;
      }
    }
  } catch (e) {
    return false;
  }
}; // process the request response


const handleResponse = xhr => {
  const content = null; //document.querySelector('#content');

  switch (xhr.status) {
    case 200:
      console.log('Success'); // content.innerHTML = '<b>Success</b>';

      break;

    case 201:
      console.log('Created'); // content.innerHTML = '<b>Create</b>';

      break;

    case 204:
      console.log('Updated (No Content)'); // content.innerHTML = '<b>Updated (No Content)</b>';

      break;

    case 302:
      console.log('Redirecting'); // content.innerHTML = '<b>Updated (No Content)</b>';

      break;

    case 400:
      console.log('Bad Request'); // content.innerHTML = '<b>Bad Request</b>';

      break;

    case 401:
      console.log('User Not Authorized');
      break;

    case 404:
      console.log('Resource Not Found'); // content.innerHTML = '<b>Resource Not Found</b>';

      break;

    default:
      console.log('Error code not implemented by client.'); // content.innerHTML = '<b>Error code not implemented by client.</b>';

      break;
  }

  parseJSON(xhr, content);
}; // Set up and send the POST request


const sendPost = (e, data) => {
  e.preventDefault(); // construct the XHR request

  const xhr = new XMLHttpRequest(); // define query parameter variable for completion in switch

  let formData;

  if (data['form'] === 'login-form' || data['form'] === 'register-form') {
    xhr.open('POST', '/processRequest');
  }

  switch (data['form']) {
    case 'login-form':
      // xhr.open('POST', '/login');
      // append query parameters
      formData = `username=${data['username']}&password=${data['password']}`;
      break;

    case 'register-form':
      // xhr.open('POST', '/register');
      // append query parameters
      formData = `username=${data['username']}&password=${data['password']}&email=${data['email']}`;
      break;
  } // set headers


  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('Accept', 'application/json'); // configure callback

  xhr.onload = () => handleResponse(xhr); // send request


  xhr.send(formData);
  return false;
}; // Set up and send the AJAX request


const sendAjax = (e, url) => {
  e.preventDefault(); // // get parameters from form
  // const url = document.querySelector('#urlField').value;
  // const method = document.querySelector('#methodSelect').value;
  // construct the XHR request

  const xhr = new XMLHttpRequest();
  xhr.open('GET', url); // set headers

  xhr.setRequestHeader('Accept', 'application/json'); // configure callback

  xhr.onload = () => handleResponse(xhr, true); // send request


  xhr.send();
  return false;
};

const validateEmail = email => {
  let mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

  if (email.match(mailFormat)) {
    return true;
  } else {
    alert("You have entered an invalid email address!");
    return false;
  }
};

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
    case 'login-form':
      extractedData['username'] = formElements[0].value;
      extractedData['password'] = formElements[1].value;
      break;

    case 'register-form':
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
    sendPost(e, extractedData);
  });

  const register = e => formData(registerForm, extractedData => {
    sendPost(e, extractedData);
  });

  loginForm.addEventListener('submit', login);
  registerForm.addEventListener('submit', register);
};

window.onload = init;
