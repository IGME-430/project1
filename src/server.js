const http = require('http');
const url = require('url');
const htmlHandler = require('./htmlResponses.js');
const jsonResponseHandler = require('./jsonResponses.js');
const jsResponseHandler = require('./jsResponses.js');
const cssResponseHandler = require('./cssResponses.js');
const authHandler = require('./authServer.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

// define dictionary of functions for easy reference from request
const urlStruct = {
  GET: {
    '/': htmlHandler.getLogin,
    '/gpaData': htmlHandler.getGpaData,
    '/normalize.css': cssResponseHandler.getNormalizeCSS,
    '/skeleton.css': cssResponseHandler.getSkeletonCSS,
    '/loginStyle.css': cssResponseHandler.getLoginStyleCSS,
    '/dataStyle.css': cssResponseHandler.getDataStyleCSS,
    '/gpaPageManager.js': jsResponseHandler.getGpaPageManager,
    '/bundle.js': jsResponseHandler.getBundle,
    '/getUsers': jsonResponseHandler.getUsers,
    '/getData': jsonResponseHandler.getData,
    '/created': jsonResponseHandler.created,
    '/updated': jsonResponseHandler.updated,
    '/badRequest': jsonResponseHandler.badRequest,
    '/notImplemented': jsonResponseHandler.notImplemented,
    '/getCourseDetails': jsonResponseHandler.getCourseDetails,
    '/getEnrollmentDetails': jsonResponseHandler.getEnrollmentDetails,
    '/getGradeValues': jsonResponseHandler.getGradeValues,
    '/getStatusValues': jsonResponseHandler.getStatusValues,
    notFound: jsonResponseHandler.notFound,
  },
  HEAD: {
    '/getUsers': jsonResponseHandler.getUsersMeta,
    '/create': jsonResponseHandler.createMeta,
    '/updated': jsonResponseHandler.updatedMeta,
    '/badRequest': jsonResponseHandler.badRequestMeta,
    '/notImplemented': jsonResponseHandler.notImplementedMeta,
    notFound: jsonResponseHandler.notFoundMeta,
  },
  POST: {
    '/processRequest': authHandler.processRequest,
    '/processUserData': jsonResponseHandler.processUserData,
    // '/gpaData': htmlHandler.getGpaData,
    notFound: jsonResponseHandler.notFound,
  },
};

const onRequest = (request, response) => {
  const parsedUrl = url.parse(request.url);

  // request.method -> GET, HEAD, POST
  // parsedUrl.pathname -> /, /loginStyle.css, /bundle.js, etc.
  if (urlStruct[request.method][parsedUrl.pathname]) {
    urlStruct[request.method][parsedUrl.pathname](request, response, parsedUrl);
  } else {
    urlStruct[request.method].notFound(request, response, parsedUrl);
  }
};

// https.createServer(options, onRequest).listen(port);
http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);
