const query = require('querystring');
const dbOperations = require('./dbOperations.js');

const users = {};

// Configure messages for responses
const messages = {
  200: {
    id: 'getUsers',
    message: 'This is a getUsers full response',
  },
  201: {
    id: 'create',
    message: 'Created Successfully',
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

// Add a user to the users dictionary
const addUser = (request, response) => {
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

    const responseJSON = {
      message: 'Name and age are both required.',
    };

    // confirm that the appropriate amount of data was provided
    if (!bodyParams.name || !bodyParams.age) {
      responseJSON.id = 'missingParams';
      return respondJSON(request, response, 400, responseJSON);
    }

    // if required level of data was provided, set response code to successfully created
    let responseCode = 201;

    if (users[bodyParams.name]) {
      responseCode = 204;
    } else {
      users[bodyParams.name] = {};
    }

    // set the values in the array
    users[bodyParams.name].name = bodyParams.name;
    users[bodyParams.name].age = bodyParams.age;

    // respond with successful creation
    if (responseCode === 201) {
      responseJSON.message = 'Created Successfully';
      return respondJSON(request, response, responseCode, responseJSON);
    }

    return respondJSONMeta(request, response, responseCode);
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

const getCourses = (request, response) => {
  const responseJSON = {};

  const sqlQuery = ['select', 't_courses', 'all_courses'];

  dbOperations.getDefault(sqlQuery, (result) => {
    responseJSON.queryData = result.queryData;

    respondJSON(request, response, 200, responseJSON);
  });
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

module.exports = {
  addUser,
  getUsers,
  getUsersMeta,
  getData,
  getDataMeta,
  getCourses,
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
};
