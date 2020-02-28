const fs = require('fs'); // pull in the file system module

const login = fs.readFileSync(`${__dirname}/../hosted/login.html`);
const gpaData = fs.readFileSync(`${__dirname}/../hosted/gpaData.html`);

// Set up response to honor index request
const getLogin = (request, response) => {
  console.log('sending login');
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(login);
  response.end();
};

// Set up response to honor index request
const getGpaData = (request, response) => {
  console.log('sending gpa');
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(gpaData);
  response.end();
};

// Set up response to honor index request
const getGpaDataRedirect = (request, response, params) => {
  let newParams = JSON.parse(params);
  newParams.destination = '/gpaData';
  newParams = JSON.stringify(newParams);
  // params = JSON.stringify(newParams);
  console.log('sending gpa redirect');
  response.writeHead(302, { 'Content-Type': 'text/html' });
  response.write(JSON.stringify(newParams));
  response.end();
};

// Export responses
module.exports = {
  getLogin,
  getGpaData,
  getGpaDataRedirect,
};
