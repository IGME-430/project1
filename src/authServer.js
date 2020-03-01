const query = require('querystring');
const dbOperations = require('./dbOperations.js');
const jsonHandler = require('./jsonResponses.js');
const htmlHandler = require('./htmlResponses.js');

const login = (request, response, bodyString, bodyParams) => {
  const responseJSON = {};

  dbOperations.getUser(bodyParams.username, (userQuery) => {
    const userCount = userQuery.data.queryData;

    if (userCount.length > 0) {
      dbOperations.getPassword(bodyParams.username, (passwordQuery) => {
        const userPassword = passwordQuery.data.queryData[0].password;

        if (userPassword === bodyParams.password) {
          htmlHandler.getGpaDataRedirect(request, response, bodyParams.username);
        } else {
          responseJSON.message = 'The supplied password is incorrect';
          jsonHandler.respondJSON(request, response, 401, responseJSON);
        }
      });
    } else {
      responseJSON.message = 'The username specified does not exist.  Please register to use this service';
      jsonHandler.respondJSON(request, response, 401, responseJSON);
    }
  });
};

const register = (request, response, bodyString, bodyParams) => {
  const responseJSON = {};

  dbOperations.getUser(bodyParams.username, (userQuery) => {
    const userCount = JSON.parse(JSON.stringify(userQuery.data.queryData)).length;

    if (userCount === 0) {
      dbOperations.registerUser(bodyParams.username, bodyParams.email, (queryResponse) => {
        dbOperations.registerPassword(
          queryResponse.data.queryData.insertId,
          bodyParams.password,
          (status) => {
            if (status.data.queryData.insertId) {
              responseJSON.message = `User ${bodyParams.username} created successfully`;
              jsonHandler.respondJSON(request, response, 201, responseJSON);
            }
          },
        );
      });
    } else {
      responseJSON.message = `User ${bodyParams.username} already exists in the database`;
      jsonHandler.respondJSON(request, response, 409, responseJSON);
    }
  });
};

const processRequest = (request, response) => {
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

    if (Object.keys(bodyParams).length === 2) {
      login(request, response, bodyString, bodyParams);
    } else if (Object.keys(bodyParams).length === 3) {
      register(request, response, bodyString, bodyParams);
    } else {
      jsonHandler.respondJSONMeta(request, response, 404, jsonHandler.messages[404]);
    }
  });
};

module.exports = {
  processRequest,
  login,
  register,
};
