/* *
 * This class manages the database operations.
* */
const os = require('os');
const mysql = require('mysql');

const connectionPreferences = {
  ubuntulamp: {
    host: '10.0.1.5',
    user: 'igme430-admin',
    password: 'igme430-admin',
    database: 'igme430',
    port: '3306',
  },
  other: {
    host: 'kleynhans.mooo.com',
    user: 'igme430-admin',
    password: 'igme430-admin',
    database: 'igme430',
    port: '33066',
  },
};

const defaultQueries = {
  select: {
    t_users: {
      all_users: 'SELECT * FROM t_users;',
    },
  },
};

const dbConnector = (hostPreferences) => {
  const connection = mysql.createConnection({
    host: hostPreferences.host,
    user: hostPreferences.user,
    password: hostPreferences.password,
    database: hostPreferences.database,
    port: hostPreferences.port,
  });

  return connection;
};

// cb defines a callback
const openConnection = () => {
  let connection = null;

  if ((os.hostname() === 'ubuntulamp') || (os.hostname() === 'Acid-Alien')) {
    connection = dbConnector(connectionPreferences.ubuntulamp);
  } else {
    connection = dbConnector(connectionPreferences.other);
  }

  return connection;
};

const processResult = (result, fields) => {
  const data = {
    queryData: result,
    tableData: fields,
  };

  return data;
};

const getUsers = (query, callback) => {
  const con = openConnection();

  con.connect((connErr) => {
    if (connErr) {
      throw connErr;
    } else {
      con.query(
        defaultQueries[query[0]][query[1]][query[2]],
        (queryErr, result, fields) => {
          if (queryErr) {
            throw queryErr;
          } else {
            callback(processResult(result, fields));
          }


        //   if (queryErr) {
        //     throw queryErr;
        //   } else {
        //
        //     let data = {
        //       'queryData': result,
        //       'tableData': fields,
        //     };
        //
        //     return callback(data);
        //   }
        },
      );
    }
  });
};

module.exports = {
  getUsers,
};
