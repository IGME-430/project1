const fs = require('fs'); // pull in the file system module

const bundle = fs.readFileSync(`${__dirname}/../hosted/bundle.js`);
// const vueMaster = fs.readFileSync(`${__dirname}/../hosted/vueMaster.js`);
const gpaPageManager = fs.readFileSync(`${__dirname}/../src/gpaPageManager.js`);

// Return the vue components
const getGpaPageManager = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'application/javascript' });
  response.write(gpaPageManager);
  response.end();
};

// Set up response to honor bundle request
const getBundle = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'application/javascript' });
  response.write(bundle);
  response.end();
};

// // Return the JavaScript Vue master
// const getVueMaster = (request, response) => {
//   response.writeHead(200, { 'Content-Type': 'application/javascript' });
//   response.write(vueMaster);
//   response.end();
// };

module.exports = {
  getBundle,
  // getVueMaster,
  getGpaPageManager,
};
