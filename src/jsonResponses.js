const query = require('querystring');
const dbOperations = require('./dbOperations.js');

// Configure messages for responses
const messages = {
  200: {
    id: 'getUsers',
    message: 'This is a getUsers full response',
  },
  201: {
    id: 'created',
    message: 'Created Successfully',
  },
  202: {
    id: 'Accepted',
    message: 'The request has been accepted for processing',
  },
  204: {
    id: 'updated',
    message: '',
  },
  400: {
    id: 'badRequest',
    message: 'Name and age are both required',
  },
  401: {
    id: 'unauthorized',
    message: 'Password supplied is incorrect.  You are not authorized to access this data.',
  },
  404: {
    id: 'notFound',
    message: 'The page you are looking for was not found.',
  },
  409: {
    id: 'conflict',
    message: 'The specified username already exists.',
  },
  500: {
    id: 'serverError',
    message: 'The server encountered an unexpected condition which prevented it from fulfilling the request.',
  },
  501: {
    id: 'notImplemented',
    message: 'A get request for this page has not been implemented yet.  Check again later for updated content.',
  },
};

// Send a response that contains JSON-formatted data
const respondJSON = (request, response, status, object) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify(object));
  response.end();
};

// Send a response that contains JSON-formatted metadata
const respondJSONMeta = (request, response, status) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end();
};

// const processEnrollment = (request, response, bodyParams) => {
const processEnrollment = (request, response, bodyParams) => {
  const responseJSON = {};

  // confirm that the appropriate amount of data was provided
  if (!bodyParams.username || !bodyParams.courseId || !bodyParams.grade || !bodyParams.status) {
    responseJSON.id = 'missingParams';
    respondJSON(request, response, 400, messages[400].message);
  }

  dbOperations.insertEnrollment(bodyParams, (callback) => {
    if (callback.id === 200) {
      responseJSON.message = 'Created Successfully';
      responseJSON.data = JSON.parse(JSON.stringify(callback.enrollmentData));
      respondJSON(request, response, 201, responseJSON);
    } else if (callback.id === 500) {
      respondJSON(request, response, 500, messages[500].message);
    }
  });
};

const updateEnrollment = (request, response, bodyParams) => {
  const responseJSON = {};

  // confirm that the appropriate amount of data was provided
  if (!bodyParams.username || !bodyParams.courseId || !bodyParams.grade || !bodyParams.status) {
    responseJSON.id = 'missingParams';
    respondJSON(request, response, 400, messages[400].message);
  }

  dbOperations.updateEnrollment(bodyParams, (callback) => {
    if (callback.id === 200) {
      responseJSON.message = 'Updated Successfully';
      responseJSON.data = JSON.parse(JSON.stringify(callback.enrollmentData));
      respondJSONMeta(request, response, 204);
    } else if (callback.id === 500) {
      respondJSON(request, response, 500, messages[500].message);
    }
  });
};

// Add enrollment
const processUserData = (request, response) => {
  const res = response;
  const body = [];

  // if the request contains erroneous information, response with 400 status
  request.on('error', (err) => {
    console.dir(err);
    res.statusCode = 400;
    res.end();
  });

  // if the request contains data, add it to the body array
  request.on('data', (chunk) => {
    body.push(chunk);
  });

  // once all the data has been received
  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    const bodyParams = query.parse(bodyString);

    if (bodyParams.form === 'container enrolled-form') {
      if (bodyParams.operation === 'insertData') {
        processEnrollment(request, response, bodyParams);
      } else if (bodyParams.operation === 'updateData') {
        updateEnrollment(request, response, bodyParams);
      }
    } else {
      respondJSON(request, response, 400, messages[400]);
    }
  });
};

// return the users object
const getUsers = (request, response) => {
  const responseJSON = {};

  const sqlQuery = ['select', 't_users', 'all_users'];

  dbOperations.getDefault(sqlQuery, (result) => {
    responseJSON.queryData = result.queryData;

    respondJSON(request, response, 200, responseJSON);
  });
};

const getUsersMeta = (request, response) => {
  respondJSONMeta(request, response, 200, messages[200]);
};

const getData = (request, response) => {
  const responseJSON = {};

  const sqlQuery = ['select', 't_data', 'all_data'];

  dbOperations.getDefault(sqlQuery, (result) => {
    responseJSON.queryData = result.queryData;

    respondJSON(request, response, 200, responseJSON);
  });
};

const getDataMeta = (request, response) => {
  respondJSONMeta(request, response, 200, messages[200]);
};

const getCoursesMeta = (request, response) => {
  respondJSONMeta(request, response, 200, messages[200]);
};

const created = (request, response) => {
  respondJSON(request, response, 201, messages[201]);
};

const createdMeta = (request, response) => {
  respondJSONMeta(request, response, 201, messages[201]);
};

const updated = (request, response) => {
  respondJSON(request, response, 204, messages[204]);
};

const updatedMeta = (request, response) => {
  respondJSONMeta(request, response, 204, messages[204]);
};

const badRequest = (request, response, parsedUrl) => {
  let returnValue;

  if (!parsedUrl.properties.valid || parsedUrl.properties.valid !== 'true') {
    returnValue = respondJSON(request, response, 400, messages[400]);
  } else {
    returnValue = respondJSON(request, response, 200, messages[200]);
  }

  return returnValue;
};

const badRequestMeta = (request, response) => {
  respondJSONMeta(request, response, 400, messages[400]);
};

const notFound = (request, response, attribute) => {
  let message = '';

  if (attribute === 'user') {
    message = 'The specified user does not exist';
  } else {
    message = messages[404].message;
  }

  respondJSON(request, response, 404, message);
};

const notFoundMeta = (request, response, attribute) => {
  let message = '';

  if (attribute === 'user') {
    message = 'The specified user does not exist';
  } else {
    message = messages[404].message;
  }

  respondJSONMeta(request, response, 404, message);
};

const getCourseDetails = (request, response) => {
  const responseJSON = {};

  dbOperations.getCourseDetails((result) => {
    responseJSON.queryData = result.data.queryData;
    responseJSON.message = 'courseDetails';

    respondJSON(request, response, 200, responseJSON);
  });
};

const getEnrollmentDetails = (request, response) => {
  const responseJSON = {};

  dbOperations.getEnrolledCourses(request.headers.authorization, (result) => {
    responseJSON.queryData = result.data.queryData;
    responseJSON.message = 'enrollmentDetails';

    respondJSON(request, response, 200, responseJSON);
  });
};

const enumToArray = (enumResponse) => {
  let inProgress = enumResponse.data.queryData[0].COLUMN_TYPE;
  inProgress = inProgress.substring(inProgress.indexOf('(') + 1, inProgress.indexOf(')'));
  inProgress = inProgress.replace(/'/g, '').split(',');

  return inProgress;
};

const getGradeValues = (request, response) => {
  const responseJSON = {};

  dbOperations.getGradeValues((result) => {
    responseJSON.queryData = enumToArray(result);
    responseJSON.message = 'grades';

    respondJSON(request, response, 200, responseJSON);
  });
};

const getStatusValues = (request, response) => {
  const responseJSON = {};

  dbOperations.getStatusValues((result) => {
    responseJSON.queryData = enumToArray(result);
    responseJSON.message = 'statuses';

    respondJSON(request, response, 200, responseJSON);
  });
};

const getGpaScale = (request, response) => {
  const responseJSON = {};

  dbOperations.getGpaScale((result) => {
    responseJSON.queryData = result.data.queryData;
    responseJSON.message = 'gpaScale';

    respondJSON(request, response, 200, responseJSON);
  });
};


module.exports = {
  processUserData,
  getUsers,
  getUsersMeta,
  getData,
  getDataMeta,
  getCoursesMeta,
  created,
  createdMeta,
  badRequest,
  badRequestMeta,
  updated,
  updatedMeta,
  notFound,
  notFoundMeta,
  respondJSON,
  respondJSONMeta,
  getCourseDetails,
  getEnrollmentDetails,
  getGradeValues,
  getStatusValues,
  getGpaScale,
};
