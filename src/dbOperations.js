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

const openConnection = () => {
  let connection = null;

  if (os.hostname() === 'ubuntulamp') {
    connection = dbConnector(connectionPreferences.ubuntulamp);
  } else {
    connection = dbConnector(connectionPreferences.other);
  }

  return connection;
};

const getUsers = () => {
  const con = openConnection();

  const data = {
    queryData: {},
    tableData: {},
  };

  con.connect((connErr) => {
    if (connErr) throw connErr;
    con.query(
      defaultQueries.select.t_users.all_users,
      (queryErr, result, fields) => {
        if (queryErr) throw queryErr;
        data.queryData = result;
        data.tableData = fields;
        // console.log(result);
        // console.log(fields);
      },
    );
    // console.log("Connected");
  });

  return data;
};

module.exports = {
  getUsers,
};
