const fs = require('fs'); // pull in the file system module

const normalize = fs.readFileSync(`${__dirname}/../hosted/css/default/normalize.css`);
const skeleton = fs.readFileSync(`${__dirname}/../hosted/css/default/skeleton.css`);
const loginStyle = fs.readFileSync(`${__dirname}/../hosted/css/loginStyle.css`);
const dataStyle = fs.readFileSync(`${__dirname}/../hosted/css/dataStyle.css`);

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

// Set up response to honor Login CSS request
const getLoginStyleCSS = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/css' });
  response.write(loginStyle);
  response.end();
};

// Set up response to honor Data CSS request
const getDataStyleCSS = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/css' });
  response.write(dataStyle);
  response.end();
};

module.exports = {
  getNormalizeCSS,
  getSkeletonCSS,
  getLoginStyleCSS,
  getDataStyleCSS,
};
