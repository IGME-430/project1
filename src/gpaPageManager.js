// Set the document cursor as in progress
document.querySelector('.gpa-data').style.cursor = 'progress';

// Decode the URL
const decodedURI = decodeURI(document.URL);
const username = decodedURI.split('?')[1].split(':')[1];

// Create global variables
let enrollmentData = {};
let courseIndices = {};
let grades = {};
let statuses = {};
let gpaScale = {};
const studentGpa = {
  numericValue: 0,
  letterGrades: [],
};

// The pointerBusy dictionary keeps a list of all elements that are performing some
// kind of operation.  The busy indicator of the mouse is bound to this dictionary.
// Any process that runs is added to the dictionary and set to true.  While any entries
// in this dictionary have a true status, the busy indicator of the mouse runs.
const pointersBusy = {};

// Determine whether the system is busy with a process
const noLongerBusy = () => {
  let returnValue = true;

  Object.values(pointersBusy).forEach((value) => {
    if (value === true) {
      returnValue = false;
    }
  });

  return returnValue;
};

// Populate the course ids into the form
const populateCourseIds = (element) => {
  Object.values(courseIndices).forEach((value) => {
    const opt = document.createElement('option');
    opt.value = value.course_id;
    opt.innerHTML = value.course_id;

    element.appendChild(opt);
  });
};

// Populate the predefined grade options into the form
const populateGrades = (element) => {
  Object.values(grades).forEach((value) => {
    const opt = document.createElement('option');
    opt.value = value.val;
    opt.innerHTML = value.val;

    element.appendChild(opt);
  });
};

// Populate the predefined status options into the form
const populateStatuses = (element) => {
  Object.values(statuses).forEach((value) => {
    const opt = document.createElement('option');
    opt.value = value.val;
    opt.innerHTML = value.val;

    element.appendChild(opt);
  });
};

// Update the course description based on the course id selected
const setCourseDescription = () => {
  const courseId = document.querySelector('#course-id');

  Object.values(courseIndices).forEach((value) => {
    if (value.course_id === courseId.value) {
      document.querySelector('#course-description').innerHTML = value.course_name;
    }
  });
};

// Convert a grade letter to a GPA numeric value on the 4.0 scale
const convertToNumber = (gradeLetter) => {
  let letterValue = 0;

  for (let i = 0; i < gpaScale.length; i++) {
    if (gpaScale[i].grade_letter === gradeLetter) {
      letterValue = gpaScale[i].numeric_value;
      break;
    }
  }

  return letterValue;
};

// Calculate the user GPA based on data in the form using the predefined 4.0 GPA scale
const calculateGpa = () => {
  let cumulativeValue = 0;

  studentGpa.letterGrades = [];

  // Extract the letter grades from all the current courses enrolled for
  Object.values(enrollmentData).forEach((value) => {
    if (value.status === 'Completed') {
      studentGpa.letterGrades.push(value.grade);
    }
  });

  // Calculate the GPA using the conversion scale
  for (let i = 0; i < studentGpa.letterGrades.length; i++) {
    if (studentGpa.letterGrades[i] !== 'S') {
      cumulativeValue += convertToNumber(studentGpa.letterGrades[i]);
    } else {
      cumulativeValue += 4;
    }
  }

  studentGpa.numericValue = cumulativeValue / studentGpa.letterGrades.length;

  // Place the calculated GPA on the form
  document.querySelector('#gpa-indicator').innerHTML = `- GPA ${studentGpa.numericValue.toFixed(2)}`;
};

// Populate the table with the current courses enrolled for
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

  // Due to the ESLint no use before define rule and the 204 update code requirement
  // we cannot force a form update after the data is updated.  This timeout allows
  // the server some time to complete the update process before re-querying the database
  setTimeout(calculateGpa, 1000);
};

// Add the table headings
const addTableHeadings = (tableTable) => {
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

    // The response messages contain an index in the message field to inform
    // the client which process was just performed.  Based on this return
    // message different relating functions need to be run in order to update
    // the client form.  Each switch option updates the values associated
    // with the actual case value.
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
            addTableHeadings(document.querySelector('#enrollment-table'));
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
          case 'gpaScale': {
            gpaScale = obj.queryData;
            pointersBusy.gpaScale = false;

            break;
          }
          default:
            break;
        }

        break;
      case 201: {
        // Update the enrollment data after a new course was added or an
        // existing course was updated.
        enrollmentData = obj.data;
        populateEnrollment();
        addTableHeadings(document.querySelector('#enrollment-table'));
        pointersBusy.enrollmentDetails = false;

        break;
      }
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

// This function contains the ajax commands to request specific types of
// information from the server.  All these functions are related to SQL query
// operations.
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
    case 'gpaScale':
      pointersBusy.gpaScale = true;
      sendAjax('/getGpaScale');
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

// This function determines whether information changed in the table and what
// should be done with it
const evaluateData = (extractedData) => {
  let returnValue = '';

  // Due to ESLint, I cannot use normal loops and Object.values().forEach don't allow
  // the use of a break statement to get out of a loop.  This set of bool values
  // is my way of determining what should be done during each operation based
  // on what was changed in the values
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

// Add the input value fields to the form
const addInputFields = (userDataReference) => {
  const enrolledForm = document.createElement('form');
  enrolledForm.className = 'container enrolled-form';
  enrolledForm.id = 'enrolled-form';
  enrolledForm.method = 'post';

  const courseIdSelect = document.createElement('select');
  courseIdSelect.id = 'course-id';
  courseIdSelect.addEventListener('change', setCourseDescription);

  const gpaIndicator = document.createElement('label');
  gpaIndicator.id = 'gpa-indicator';

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

        // Due to the ESLint no use before define rule and the 204 update code requirement
        // we cannot force a form update after the data is updated.  This timeout allows
        // the server some time to complete the update process before re-querying the database
        setTimeout(() => updateDictionary('enrollmentDetails', () => {}), 1000);
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
  enrolledForm.appendChild(gpaIndicator);
  enrolledForm.appendChild(userIndicator);
  enrolledForm.appendChild(courseDescription);
  enrolledForm.appendChild(gradeSelect);
  enrolledForm.appendChild(statusSelect);
  enrolledForm.appendChild(exitButton);
  enrolledForm.appendChild(submitButton);

  userDataReference.appendChild(enrolledForm);
};

// Display the data associated with the current user on the form
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

// Run queries to update the local copies of all the relevant data in the database.
updateDictionary('courseDetails', () => {
  updateDictionary('enrollmentDetails', () => {
    updateDictionary('grades', () => {
      updateDictionary('statuses', () => {
        updateDictionary('gpaScale', () => {
          displayData();
        });
      });
    });
  });
});
