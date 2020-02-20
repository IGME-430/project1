const query = require('querystring');
<<<<<<< HEAD
const dbOperations = require('./dbOperations.js');
=======
>>>>>>> 9b60cb8484bb5afc515bad95def5e3047d816f73

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
  404: {
    id: 'notFound',
    message: 'The page you are looking for was not found.',
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
<<<<<<< HEAD
  const responseJSON = {};
  // let data = {};

  const sqlQuery = ['select', 't_users', 'all_users'];

  dbOperations.getUsers(sqlQuery, (result) => {
    // data = result;
    // console.dir(data['queryData']);
    // console.dir(data['tableData']);
    responseJSON.queryData = result.queryData;
    responseJSON.tableData = result.tableData;

    respondJSON(request, response, 200, responseJSON);
  });

  // const responseJSON = {
  //   users,
  // };

  // respondJSON(request, response, 200, responseJSON);
=======
  const responseJSON = {
    users,
  };

  respondJSON(request, response, 200, responseJSON);
>>>>>>> 9b60cb8484bb5afc515bad95def5e3047d816f73
};

const getUsersMeta = (request, response) => {
  respondJSONMeta(request, response, 200, messages[200]);
};

const create = (request, response) => {
  respondJSON(request, response, 201, messages[201]);
};

const createMeta = (request, response) => {
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

const notFound = (request, response) => {
  respondJSON(request, response, 404, messages[404]);
};

const notFoundMeta = (request, response) => {
  respondJSONMeta(request, response, 404, messages[404]);
};

module.exports = {
  addUser,
  getUsers,
  getUsersMeta,
  create,
  createMeta,
  badRequest,
  badRequestMeta,
  updated,
  updatedMeta,
  notFound,
  notFoundMeta,
};
