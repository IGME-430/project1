const fs = require('fs'); // pull in the file system module

const login = fs.readFileSync(`${__dirname}/../hosted/login.html`);
const gpaInfo = fs.readFileSync(`${__dirname}/../hosted/gpaInfo.html`);
const normalize = fs.readFileSync(`${__dirname}/../hosted/css/default/normalize.css`);
const skeleton = fs.readFileSync(`${__dirname}/../hosted/css/default/skeleton.css`);
const style = fs.readFileSync(`${__dirname}/../hosted/css/style.css`);
const bundle = fs.readFileSync(`${__dirname}/../hosted/bundle.js`);

// Set up response to honor index request
const getLogin = (request, response) => {
  console.log('sending login');
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(login);
  response.end();
};

// Set up response to honor index request
const getGpaInfo = (request, response) => {
  console.log('sending gpa');
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(gpaInfo);
  response.end();
};

// Set up response to honor index request
const getGpaInfoRedirect = (request, response) => {
  console.log('sending gpa redirect');
  response.writeHead(302, { 'Content-Type': 'text/html' });
  response.write(gpaInfo);
  response.end();
};

// Set up response to honor css request
const getNormalizeCSS = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/css' });
  response.write(normalize);
  response.end();
};

// Set up response to honor css request
const getSkeletonCSS = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/css' });
  response.write(skeleton);
  response.end();
};
// Set up response to honor css request
const getStyleCSS = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/css' });
  response.write(style);
  response.end();
};

// Set up response to honor bundle request
const getBundle = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'application/javascript' });
  response.write(bundle);
  response.end();
};

// Export responses
module.exports = {
  getLogin,
  getGpaInfo,
  getGpaInfoRedirect,
  getNormalizeCSS,
  getSkeletonCSS,
  getStyleCSS,
  getBundle,
};
