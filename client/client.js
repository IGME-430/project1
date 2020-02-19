// Process and construct the JSON data
const parseJSON = (xhr, content) => {
  // parse response
  try {
    const obj = JSON.parse(xhr.response);
    console.dir(obj);

    // if response contains message, display it
    if (obj.message) {
      const p = document.createElement('p');
      p.textContent = `Message: ${obj.message}`;
      content.appendChild(p);
    }

    // if response contains user info, display it
    if (obj.users) {
      const userList = document.createElement('p');
      const users = JSON.stringify(obj.users);
      userList.textContent = users;
      content.appendChild(userList);
    }
  } catch (e) {
    return false;
  }
};

// process the request response
const handleResponse = (xhr) => {
  const content = document.querySelector('#content');

  switch (xhr.status) {
    case 200:
      content.innerHTML = '<b>Success</b>';
      break;
    case 201:
      content.innerHTML = '<b>Create</b>';
      break;
    case 204:
      content.innerHTML = '<b>Updated (No Content)</b>';
      break;
    case 400:
      content.innerHTML = '<b>Bad Request</b>';
      break;
    case 404:
      content.innerHTML = '<b>Resource Not Found</b>';
      break;
    default:
      content.innerHTML = 'Error code not implemented by client.';
      break;
  }

  parseJSON(xhr, content);
};

// Set up and send the POST request
const sendPost = (e, nameForm) => {
  e.preventDefault();

  // get the form attribute values
  const nameAction = nameForm.getAttribute('action');
  const nameMethod = nameForm.getAttribute('method');

  // get the form input values
  const nameField = nameForm.querySelector('#nameField');
  const ageField = nameForm.querySelector('#ageField');

  // construct the XHR request
  const xhr = new XMLHttpRequest();
  xhr.open(nameMethod, nameAction);

  // set headers
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('Accept', 'application/json');

  // configure callback
  xhr.onload = () => handleResponse(xhr);

  // append query parameters
  const formData = `name=${nameField.value}&age=${ageField.value}`;

  // send request
  xhr.send(formData);

  return false;
};

// Set up and send the AJAX request
const sendAjax = (e) => {
  e.preventDefault();

  // get parameters from form
  const url = document.querySelector('#urlField').value;
  const method = document.querySelector('#methodSelect').value;

  // construct the XHR request
  const xhr = new XMLHttpRequest();
  xhr.open(method, url);

  // set headers
  xhr.setRequestHeader('Accept', 'application/json');

  // configure callback
  xhr.onload = () => handleResponse(xhr, true);

  // send request
  xhr.send();

  return false;
};

// Initialize form elements
const init = () => {
  // connect to forms
  const nameForm = document.querySelector('#nameForm');
  const userForm = document.querySelector('#userForm');

  // create handlers to forms
  const addUser = (e) => sendPost(e, nameForm);
  const getUser = (e) => sendAjax(e);

  // attach submit event (for clicking submit or hitting enter)
  nameForm.addEventListener('submit', addUser);
  userForm.addEventListener('submit', getUser);
};

window.onload = init;
