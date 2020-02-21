const query = require('querystring');
const dbOperations = require('./dbOperations.js');
const jsonHandler = require('./jsonResponses.js');

const login = (request, response) => {
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

    const responseJSON = {};

    const sqlQueryDict = {
      exists: 'SELECT * FROM t_users WHERE username LIKE ? AND status = 1',
      valid: 'SELECT password '
        + 'FROM t_passwords '
        + 'INNER JOIN t_users '
        + 'ON t_passwords.user_id = t_users.t_id '
        + 'WHERE t_users.username = ? AND t_users.status = 1',
    };

    dbOperations.runQuery(sqlQueryDict.exists, bodyParams.username, (userQuery) => {
      responseJSON.userCount = userQuery.queryData;

      if (responseJSON.userCount.length > 0) {
        dbOperations.runQuery(sqlQueryDict.valid, bodyParams.username, (passwordQuery) => {
          responseJSON.userPassword = passwordQuery.queryData;

          if (responseJSON.userPassword[0].password === bodyParams.password) {
            jsonHandler.respondJSON(request, response, 200, { login: 'successful' });
          } else {
            jsonHandler.respondJSONMeta(request, response, 401, jsonHandler.messages[401]);
          }
        });
      } else {
        jsonHandler.respondJSONMeta(request, response, 404, jsonHandler.messages[404]);
      }
    });
  });
};

module.exports = {
  login,
};
