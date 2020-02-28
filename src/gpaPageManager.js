
const decodedURI = decodeURI(document.URL);
// Set the username of the current user
// const username = decodedURI.split('?')[1].split('&')[0].split(':')[1];
const enrollmentData = JSON.parse(decodedURI.split('?')[1].split('&')[1].split('enrollmentData:')[1]);
const courseIndices = JSON.parse(decodedURI.split('?')[1].split('&')[2].split('courseIndices:')[1]);

const setCourseDescription = () => {
  const courseId = document.querySelector('#courseId');

  Object.values(courseIndices).forEach((value) => {
    if (value.course_id === courseId.value) {
      document.querySelector('#courseDescription').innerHTML = value.course_name;
    }
  });
};

const addInputFields = (userDataReference) => {
  const enrolledForm = document.createElement('form');
  enrolledForm.id = 'courseForm';
  enrolledForm.action = '/addEnrolled';
  enrolledForm.method = 'post';

  const courseIdSelect = document.createElement('select');
  courseIdSelect.id = 'courseId';
  courseIdSelect.addEventListener('change', setCourseDescription);

  Object.values(courseIndices).forEach((value) => {
    const opt = document.createElement('option');
    opt.value = value.course_id;
    opt.innerHTML = value.course_id;

    courseIdSelect.appendChild(opt);
  });

  const courseDescription = document.createElement('label');
  courseDescription.id = 'courseDescription';
  courseDescription.innerHTML = 'test';

  const gradeSelect = document.createElement('select');
  gradeSelect.id = 'gradeSelect';

  const grades = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'];

  // for (const grade in grades) {
  Object.values(grades).forEach((value) => {
    const opt = document.createElement('option');
    opt.value = value;// grades[grade];
    opt.innerHTML = value;// grades[grade];

    gradeSelect.appendChild(opt);
  });

  const statusSelect = document.createElement('select');
  statusSelect.id = 'statusSelect';

  const statuses = ['In Progress', 'Dropped', 'Withdrawn', 'Completed'];

  // for (const status in statuses) {
  Object.values(statuses).forEach((value) => {
    const opt = document.createElement('option');
    opt.value = value;
    opt.innerHTML = value;

    statusSelect.appendChild(opt);
  });

  enrolledForm.appendChild(courseIdSelect);
  enrolledForm.appendChild(courseDescription);
  enrolledForm.appendChild(gradeSelect);
  enrolledForm.appendChild(statusSelect);

  userDataReference.appendChild(enrolledForm);
};

const addCourseHeadings = (heading) => {
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
};

const displayData = () => {
  const userDataReference = document.querySelector('#Data');

  addInputFields(userDataReference);

  const divContainer = document.createElement('div');
  divContainer.className = 'container';

  const tableTable = document.createElement('table');
  tableTable.className = 'table table-striped table-sm';

  const tHeadHead = document.createElement('thead');

  addCourseHeadings(tHeadHead);

  // for (const row in enrollmentData) {
  Object.values(enrollmentData).forEach((value) => {
    const tableRow = document.createElement('tr');

    // for (const key in enrollmentData[row]) {
    Object.values(value).forEach((subValue) => {
      const tableData = document.createElement('td');

      // tableData.innerHTML = enrollmentData[row][key];
      tableData.innerHTML = subValue;

      tableRow.appendChild(tableData);
    });

    tableTable.appendChild(tableRow);
  });

  tableTable.appendChild(tHeadHead);
  divContainer.appendChild(tableTable);
  userDataReference.appendChild(divContainer);

  setCourseDescription();
};

displayData();
