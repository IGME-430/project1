document.querySelector('.gpa-data').style.cursor = 'progress';

const decodedURI = decodeURI(document.URL);
const username = decodedURI.split('?')[1].split(':')[1];

let enrollmentData = {};
let courseIndices = {};
let grades = {};
let statuses = {};
const pointersBusy = {};

const noLongerBusy = () => {
  let returnValue = true;

  Object.values(pointersBusy).forEach((value) => {
    if (value === true) {
      returnValue = false;
    }
  });

  return returnValue;
};

const populateCourseIds = (element) => {
  Object.values(courseIndices).forEach((value) => {
    const opt = document.createElement('option');
    opt.value = value.course_id;
    opt.innerHTML = value.course_id;

    element.appendChild(opt);
  });
};

const populateGrades = (element) => {
  Object.values(grades).forEach((value) => {
    const opt = document.createElement('option');
    opt.value = value;
    opt.innerHTML = value;

    element.appendChild(opt);
  });
};

const populateStatuses = (element) => {
  Object.values(statuses).forEach((value) => {
    const opt = document.createElement('option');
    opt.value = value;
    opt.innerHTML = value;

    element.appendChild(opt);
  });
};

const setCourseDescription = () => {
  const courseId = document.querySelector('#course-id');

  Object.values(courseIndices).forEach((value) => {
    if (value.course_id === courseId.value) {
      document.querySelector('#course-description').innerHTML = value.course_name;
    }
  });
};

const populateEnrollment = () => {
  const tableTable = document.querySelector('#enrollment-table');

  if (tableTable.children.length > 0) {
    tableTable.innerHTML = '';
  }

  // for (const row in enrollmentData) {
  Object.values(enrollmentData).forEach((value) => {
    const tableRow = document.createElement('tr');

    // for (const key in enrollmentData[row]) {
    Object.values(value).forEach((subValue) => {
      const tableData = document.createElement('td');

      tableData.innerHTML = subValue;

      tableRow.appendChild(tableData);
    });

    tableTable.appendChild(tableRow);
  });
};

const addCourseHeadings = (tableTable) => {
  const heading = document.createElement('thead');

  const headId = document.createElement('th');
  headId.innerHTML = 'Course ID';
  const headName = document.createElement('th');
  headName.innerHTML = 'Course Name';
  const headGrade = document.createElement('th');
  headGrade.innerHTML = 'Grade';
  const headStatus = document.createElement('th');
  headStatus.innerHTML = 'Course Status';

  heading.appendChild(headId);
  heading.appendChild(headName);
  heading.appendChild(headGrade);
  heading.appendChild(headStatus);

  tableTable.appendChild(heading);
};

// Process and construct the JSON data
const parseJSON = (xhr, content) => {
  // parse response
  try {
    const statusCode = xhr.status;
    const obj = JSON.parse(xhr.response);
    let message = '';

    if (obj.message) {
      message = obj.message;
    }

    switch (statusCode) {
      case 200:
        switch (message) {
          case 'courseDetails': {
            courseIndices = obj.queryData;

            const idHolder = document.querySelector('#course-id');
            idHolder.addEventListener('change', setCourseDescription);
            populateCourseIds(idHolder);
            setCourseDescription();
            pointersBusy.courseDetails = false;

            break;
          }
          case 'enrollmentDetails': {
            enrollmentData = obj.queryData;

            populateEnrollment();
            const tableHolder = document.querySelector('#enrollment-table');
            addCourseHeadings(tableHolder);
            pointersBusy.enrollmentDetails = false;

            break;
          }
          case 'grades': {
            grades = obj.queryData;

            const gradeHolder = document.querySelector('#grade-select');
            populateGrades(gradeHolder);
            pointersBusy.grades = false;

            break;
          }
          case 'statuses': {
            statuses = obj.queryData;

            const statusHolder = document.querySelector('#status-select');
            populateStatuses(statusHolder);
            pointersBusy.statuses = false;

            break;
          }
          default:
            break;
        }

        break;
      case 201:
        enrollmentData = obj.data;
        populateEnrollment();
        addCourseHeadings(document.querySelector('#enrollment-table'));

        break;
      case 302:
      case 401:
      case 409:
        break;
      default:
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
    }
  } catch (err) {
    console.log(err);
  }

  if (noLongerBusy()) {
    document.querySelector('.gpa-data').style.cursor = 'default';
  }
};

// process the request response
const handleResponse = (xhr) => {
  const content = null;// document.querySelector('#content');

  switch (xhr.status) {
    case 200:
      console.log('Success');
      break;
    case 201: // The request has been fulfilled and resulted in a new resource being created.
      console.log(JSON.parse(xhr.response).message);
      alert(JSON.parse(xhr.response).message);
      break;
    case 202: // The request has been accepted for processing,
      console.log('Created'); // but the processing has not been completed.
      break;
    case 204:
      alert('Your data has been updated');
      console.log('Updated (No Content)');
      break;
    case 302:
      console.log('Redirecting');
      break;
    case 400:
      console.log('Bad Request');
      break;
    case 401: // Similar to 403 Forbidden, but
      console.log(JSON.parse(xhr.response).message); // specifically for use when
      alert(JSON.parse(xhr.response).message); // authentication is possible
      break; // but has failed or not yet been provided.
    case 404:
      console.log('Resource Not Found');
      break;
    case 409: // The request could not be processed because of conflict in the request.
      console.log(JSON.parse(xhr.response).message);
      alert(JSON.parse(xhr.response).message);
      break;
    case 500:
      console.log('The server encountered an unexpected condition which prevented it from fulfilling the request.');
      break;
    case 501:
      console.log('A get request for this page has not been implemented yet.  Check again later for updated content.');
      break;
    default:
      console.log('Error code not implemented by client.');
      break;
  }

  if (xhr.response) {
    parseJSON(xhr, content);
  }
};

// Set up and send the AJAX request
const sendAjax = (url, userId) => {
  // e.preventDefault();

  // construct the XHR request
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url);

  // set headers
  xhr.setRequestHeader('Accept', 'application/json');

  if (userId) {
    xhr.setRequestHeader('Authorization', userId);
  }

  // configure callback
  xhr.onload = () => handleResponse(xhr, true);

  // send request
  xhr.send();

  return false;
};

const updateDictionary = (type, callback) => {
  switch (type) {
    case 'courseDetails':
      pointersBusy.courseDetails = true;
      sendAjax('/getCourseDetails');
      callback();

      break;
    case 'enrollmentDetails':
      pointersBusy.enrollmentDetails = true;
      sendAjax('/getEnrollmentDetails', username);
      callback();

      break;
    case 'grades':
      pointersBusy.grades = true;
      sendAjax('/getGradeValues');
      callback();

      break;
    case 'statuses':
      pointersBusy.statuses = true;
      sendAjax('/getStatusValues');
      callback();

      break;
    default:
      break;
  }
};

// Set up and send the POST request
const sendPost = (e, data) => {
  e.preventDefault();

  // construct the XHR request
  const xhr = new XMLHttpRequest();

  // define query parameter variable for completion in switch
  let formData = '';
  formData += `form=${data.form}`;
  formData += `&username=${username}`;
  formData += `&courseId=${data.courseId}`;
  formData += `&grade=${encodeURIComponent(data.grade)}`;
  formData += `&status=${data.status}`;
  formData += `&operation=${data.operation}`;

  xhr.open('POST', '/processUserData');

  // set headers
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('Accept', 'application/json');

  // configure callback
  xhr.onload = () => handleResponse(xhr);

  // send request
  xhr.send(formData);

  return false;
};

const evaluateData = (extractedData) => {
  let returnValue = '';

  let validData = false;
  let alerted = false;
  let insertData = false;
  let updateData = false;
  let continueLoop = true;

  if (enrollmentData.length > 0) {
    Object.values(enrollmentData).forEach((value) => {
      if (continueLoop) {
        if (extractedData.courseId === value.course_id) {
          if ((extractedData.status !== value.status) || (extractedData.grade !== value.grade)) {
            continueLoop = false;
            updateData = true;
            validData = true;
          } else if (!alerted) {
            alert(`You have already added the course "${value.course_name}" with the status "${value.status}"`);
            alerted = true;
            continueLoop = false;
            validData = false;
          }
        } else {
          validData = true;
          insertData = true;
        }
      }
    });
  } else {
    validData = true;
    insertData = true;
    continueLoop = false;
  }

  if ((validData) && (updateData)) {
    returnValue = 'updateData';
  } else if ((validData) && (insertData)) {
    returnValue = 'insertData';
  } else if (!validData) {
    returnValue = 'invalidData';
  }

  return returnValue;
};

// Extract the form data
const formData = (activeForm, successCallback) => {
  const extractedData = {
    form: activeForm.className,
  };

  const formElements = activeForm.querySelectorAll('select');

  extractedData.courseId = formElements[0].value;
  extractedData.grade = formElements[1].value;
  extractedData.status = formElements[2].value;

  const dataState = evaluateData(extractedData);

  if ((dataState === 'updateData') || (dataState === 'insertData')) {
    extractedData.operation = dataState;
    successCallback(extractedData);
  }
};

const addInputFields = (userDataReference) => {
  const enrolledForm = document.createElement('form');
  enrolledForm.className = 'container enrolled-form';
  enrolledForm.id = 'enrolled-form';
  enrolledForm.method = 'post';

  const courseIdSelect = document.createElement('select');
  courseIdSelect.id = 'course-id';
  courseIdSelect.addEventListener('change', setCourseDescription);

  const userIndicator = document.createElement('label');
  userIndicator.id = 'user-indicator';
  userIndicator.innerHTML = username;

  const courseDescription = document.createElement('label');
  courseDescription.id = 'course-description';
  courseDescription.innerHTML = '';

  const gradeSelect = document.createElement('select');
  gradeSelect.id = 'grade-select';

  const statusSelect = document.createElement('select');
  statusSelect.id = 'status-select';

  const submitEnrollment = (e) => {
    e.preventDefault();
    formData(
      enrolledForm,
      (successData) => {
        document.querySelector('.gpa-data').style.cursor = 'progress';
        sendPost(e, successData);
        updateDictionary('enrollmentDetails', () => {});
      },
    );
  };

  const exitProgram = (e) => {
    e.preventDefault();
    window.location.replace('/');
  };

  const submitButton = document.createElement('input');
  submitButton.id = 'submit-button';
  submitButton.type = 'submit';
  submitButton.value = 'Process';
  submitButton.addEventListener('click', submitEnrollment);

  const exitButton = document.createElement('input');
  exitButton.id = 'exit-button';
  exitButton.type = 'submit';
  exitButton.value = 'Exit';
  exitButton.addEventListener('click', exitProgram);

  enrolledForm.appendChild(courseIdSelect);
  enrolledForm.appendChild(userIndicator);
  enrolledForm.appendChild(courseDescription);
  enrolledForm.appendChild(gradeSelect);
  enrolledForm.appendChild(statusSelect);
  enrolledForm.appendChild(exitButton);
  enrolledForm.appendChild(submitButton);

  userDataReference.appendChild(enrolledForm);
};

const displayData = () => {
  const userDataReference = document.querySelector('#data');

  addInputFields(userDataReference);

  const divContainer = document.createElement('div');
  divContainer.className = 'container';

  const tableTable = document.createElement('table');
  tableTable.className = 'table table-striped table-sm';
  tableTable.id = 'enrollment-table';

  divContainer.appendChild(tableTable);
  userDataReference.appendChild(divContainer);

  setCourseDescription();
};

updateDictionary('courseDetails', () => {
  updateDictionary('enrollmentDetails', () => {
    updateDictionary('grades', () => {
      updateDictionary('statuses', () => {
        displayData();
      });
    });
  });
});
