const query = require('querystring');
const dbOperations = require('./dbOperations.js');
const jsonHandler = require('./jsonResponses.js');
const htmlHandler = require('./htmlResponses.js');

// Log a user into the system
const login = (request, response, bodyString, bodyParams) => {
  const responseJSON = {};

  // Check if a user with this username exists in the database
  dbOperations.getUser(bodyParams.username, (userQuery) => {
    const userCount = userQuery.data.queryData;

    // If the user exists, start authentication process
    if (userCount.length > 0) {
      // Get the current password for this user from the database
      dbOperations.getPassword(bodyParams.username, (passwordQuery) => {
        const userPassword = passwordQuery.data.queryData[0].password;

        // Test if the entered password matches the stored password
        if (userPassword === bodyParams.password) {
          // If the passwords match, redirect the user to the data page
          htmlHandler.getGpaDataRedirect(request, response, bodyParams.username);
        } else {
          // If the passwords don't match, inform the user
          responseJSON.message = 'The supplied password is incorrect';
          jsonHandler.respondJSON(request, response, 401, responseJSON);
        }
      });
    } else {
      // If the user doesn't exist in the database, inform them
      responseJSON.message = 'The username specified does not exist.  Please register to use this service';
      jsonHandler.respondJSON(request, response, 401, responseJSON);
    }
  });
};

// Register a new user to the program.  This includes username and password
const register = (request, response, bodyString, bodyParams) => {
  const responseJSON = {};

  // Check if a user with this username exists in the database
  dbOperations.getUser(bodyParams.username, (userQuery) => {
    const userCount = JSON.parse(JSON.stringify(userQuery.data.queryData)).length;

    // If the user doesn't exist, add them as a new user
    if (userCount === 0) {
      // Register the user
      dbOperations.registerUser(bodyParams.username, bodyParams.email, (queryResponse) => {
        // Register the password for the user
        dbOperations.registerPassword(
          queryResponse.data.queryData.insertId,
          bodyParams.password,
          (status) => {
            if (status.data.queryData.insertId) { // Inform the user that they were created.
              responseJSON.message = `User ${bodyParams.username} created successfully`;
              jsonHandler.respondJSON(request, response, 201, responseJSON);
            }
          },
        );
      });
    } else { // If the user exists, inform the user
      responseJSON.message = `User ${bodyParams.username} already exists in the database`;
      jsonHandler.respondJSON(request, response, 409, responseJSON);
    }
  });
};

// Determine which form is being submitted from to determine whether we are
// logging a user in, or creating a new user.  Then run the associated function.
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

// Export locally defined functions for external use
module.exports = {
  processRequest,
  login,
  register,
};
