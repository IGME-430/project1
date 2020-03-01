const fs = require('fs'); // pull in the file system module

const bundle = fs.readFileSync(`${__dirname}/../hosted/bundle.js`);
const gpaPageManager = fs.readFileSync(`${__dirname}/../src/gpaPageManager.js`);

// Return the JavaScript page manager which manages the entire GPA page (lol)
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

// Export locally defined functions for external use
module.exports = {
  getBundle,
  getGpaPageManager,
};
