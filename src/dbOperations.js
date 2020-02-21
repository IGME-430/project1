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
  },
  other: {
    host: 'us-cdbr-iron-east-04.cleardb.net',
    user: 'bcffdfd87debd6',
    password: 'bc7e6d6d',
    database: 'heroku_3db47b740946390',
  },
};

const defaultQueries = {
  select: {
    t_users: {
      all_users: 'SELECT username, email FROM t_users;',
    },
    t_data: {
      all_data: 'SELECT t_courses.course_id, t_data.grade ' +
        'FROM t_data ' +
        'INNER JOIN t_courses ' +
        'ON t_data.course_id = t_courses.t_id ' +
        'ORDER BY t_data.course_id ASC;',
    },
    t_courses: {
      all_courses: 'SELECT course_id, course_name, description FROM t_courses',
    },
  },
};

const dbConnector = (hostPreferences) => {
  const connection = mysql.createConnection({
    host: hostPreferences.host,
    user: hostPreferences.user,
    password: hostPreferences.password,
    database: hostPreferences.database,
  });

  return connection;
};

// cb defines a callback
const openConnection = () => {
  let connection = null;

  if ((os.hostname() === 'ubuntulamp') || (os.hostname() === 'Acid-Alien')) {
    connection = dbConnector(connectionPreferences.other);
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

const getDefault = (queryParams, callback) => {
  const con = openConnection();

  con.connect((connErr) => {
    if (connErr) {
      throw connErr;
    } else {
      con.query(
        defaultQueries[queryParams[0]][queryParams[1]][queryParams[2]],
        (queryErr, result, fields) => {
          if (queryErr) {
            throw queryErr;
          } else {
            callback(processResult(result, fields));
          }
        },
      );
      con.end();
    }
  });
};

const runQuery = (fullQuery, username, callback) => {
  const con = openConnection();

  con.connect((connErr) => {
    if (connErr) {
      throw connErr;
    } else {
      con.query(
        fullQuery,
        [username],
        (queryErr, result, fields) => {
          if (queryErr) {
            throw queryErr;
          } else {
            callback(processResult(result, fields));
          }
        },
      );
      con.end();
    }
  });
};

const insertUser = (fullQuery, args, callback) => {
  const con = openConnection();

  const values = [[args.username, args.email]];

  con.connect((connErr) => {
    if (connErr) {
      throw connErr;
    } else {
      con.query(
        fullQuery,
        [values],
        (queryErr, result, fields) => {
          if (queryErr) {
            throw queryErr;
          } else {
            callback(processResult(result, fields));
          }
        },
      );
      con.end();
    }
  });
};

const insertPassword = (fullQuery, args, callback) => {
  const con = openConnection();

  const values = [[args.userid, args.password]];

  con.connect((connErr) => {
    if (connErr) {
      throw connErr;
    } else {
      con.query(
        fullQuery,
        [values],
        (queryErr, result, fields) => {
          if (queryErr) {
            throw queryErr;
          } else {
            callback(processResult(result, fields));
          }
        },
      );
      con.end();
    }
  });
};

module.exports = {
  getDefault,
  runQuery,
  insertUser,
  insertPassword,
};
