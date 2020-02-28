// Process and construct the JSON data
const parseJSON = (xhr, content) => {
  // parse response
  try {
    const statusCode = xhr.status;
    const obj = JSON.parse(xhr.response);

    if (statusCode !== 302) {
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
    } else {
      let tempData = JSON.parse(obj);
      window.location.replace(
        `${tempData['destination']}?username:${tempData['arguments'].username}&
enrollmentData:${JSON.stringify(tempData.enrollmentData.data[0])}&
courseIndices:${JSON.stringify(tempData.courseIndices.data[0])}`
      );
    }
  } catch (e) {
    return false;
  }
};

// process the request response
const handleResponse = (xhr) => {
  const content = null;//document.querySelector('#content');

  switch (xhr.status) {
    case 200:
      console.log('Success');
      // content.innerHTML = '<b>Success</b>';
      break;
    case 201:
      console.log('Created');
      // content.innerHTML = '<b>Create</b>';
      break;
    case 204:
      console.log('Updated (No Content)');
      // content.innerHTML = '<b>Updated (No Content)</b>';
      break;
    case 302:
      console.log('Redirecting');
      // content.innerHTML = '<b>Updated (No Content)</b>';
      break;
    case 400:
      console.log('Bad Request');
      // content.innerHTML = '<b>Bad Request</b>';
      break;
    case 401:
      console.log('User Not Authorized');
      break;
    case 404:
      console.log('Resource Not Found');
      // content.innerHTML = '<b>Resource Not Found</b>';
      break;
    default:
      console.log('Error code not implemented by client.');
      // content.innerHTML = '<b>Error code not implemented by client.</b>';
      break;
  }

  parseJSON(xhr, content);
};

// Set up and send the POST request
const sendPost = (e, data) => {
  e.preventDefault();

  // construct the XHR request
  const xhr = new XMLHttpRequest();

  // define query parameter variable for completion in switch
  let formData;

  if ((data['form'] === 'login-form') || (data['form'] === 'register-form')) {
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
  }

  // set headers
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('Accept', 'application/json');

  // configure callback
  xhr.onload = () => handleResponse(xhr);

  // send request
  xhr.send(formData);

  return false;
};

// Set up and send the AJAX request
const sendAjax = (e, url) => {
  e.preventDefault();

  // // get parameters from form
  // const url = document.querySelector('#urlField').value;
  // const method = document.querySelector('#methodSelect').value;

  // construct the XHR request
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url);

  // set headers
  xhr.setRequestHeader('Accept', 'application/json');

  // configure callback
  xhr.onload = () => handleResponse(xhr, true);

  // send request
  xhr.send();

  return false;
};