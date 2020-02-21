const http = require('http');
// const https = require('https');
// const fs = require('fs');
const url = require('url');
const htmlHandler = require('./htmlResponses.js');
const responseHandler = require('./jsonResponses.js');
const authHandler = require('./authServer.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

// const options = {
//   key: fs.readFileSync(`${__dirname}/../src/key.pem`),
//   cert: fs.readFileSync(`${__dirname}/../src/cert.pem`),
// };

// define dictionary of functions for easy reference from request
const urlStruct = {
  GET: {
    '/': htmlHandler.getLogin,
    '/getGpaInfo': htmlHandler.getGpaInfo,
    '/normalize.css': htmlHandler.getNormalizeCSS,
    '/skeleton.css': htmlHandler.getSkeletonCSS,
    '/style.css': htmlHandler.getStyleCSS,
    '/bundle.js': htmlHandler.getBundle,
    '/getUsers': responseHandler.getUsers,
    '/getData': responseHandler.getData,
    '/getCourses': responseHandler.getCourses,
    '/create': responseHandler.create,
    '/updated': responseHandler.updated,
    '/badRequest': responseHandler.badRequest,
    '/notImplemented': responseHandler.notImplemented,
    notFound: responseHandler.notFound,
  },
  HEAD: {
    '/getUsers': responseHandler.getUsersMeta,
    '/create': responseHandler.createMeta,
    '/updated': responseHandler.updatedMeta,
    '/badRequest': responseHandler.badRequestMeta,
    '/notImplemented': responseHandler.notImplementedMeta,
    notFound: responseHandler.notFoundMeta,
  },
  POST: {
    // '/login': authHandler.login,
    '/processRequest': authHandler.processRequest,
    // '/addUser': responseHandler.addUser,
    notFound: responseHandler.notFound,
  },
};

const onRequest = (request, response) => {
  const parsedUrl = url.parse(request.url);

  // request.method -> GET, HEAD, POST
  // parsedUrl.pathname -> /, /style.css, /bundle.js, etc.
  if (urlStruct[request.method][parsedUrl.pathname]) {
    urlStruct[request.method][parsedUrl.pathname](request, response, parsedUrl);
  } else {
    urlStruct[request.method].notFound(request, response, parsedUrl);
  }
};

// https.createServer(options, onRequest).listen(port);
http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);
