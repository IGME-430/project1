/* *
 * This class manages the database operations.
* */
const os = require('os');
const mysql = require('mysql');

// Stored connection preferences for connection to SQL Server
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

// A set of predefined queries for standard tasks
const defaultQueries = {
  select: {
    t_users: { // Queries from the t_users table
      all_users: 'SELECT username, email '
        + 'FROM t_users;',
      user_exists: 'SELECT * '
        + 'FROM t_users '
        + 'WHERE username LIKE ? AND active = 1;',
      user_password: 'SELECT password '
        + 'FROM t_passwords '
        + 'INNER JOIN t_users '
        + 'ON t_passwords.user_id = t_users.t_id '
        + 'WHERE t_users.username = ? AND t_users.active = 1;',
    },
    t_data: { // Queries from the t_data table
      all_data: 'SELECT t_courses.course_id, t_data.grade '
        + 'FROM t_data '
        + 'INNER JOIN t_courses '
        + 'ON t_data.course_id = t_courses.t_id '
        + 'ORDER BY t_data.course_id ASC;',
      gpa_scale: 'SELECT grade_letter, numeric_value '
        + 'FROM t_gpa_scale '
        + 'WHERE active = 1;',
    },
    t_courses: { // Queries from the t_courses table
      all_courses: 'SELECT course_id, course_name, description '
        + 'FROM t_courses '
        + 'ORDER BY course_id ASC;',
      course_ids_and_names: 'SELECT course_id, course_name '
        + 'FROM t_courses '
        + 'ORDER BY course_id ASC;',
      enrolled_courses: 'SELECT t_courses.course_id, t_courses.course_name, t_data.grade, t_data.status '
        + 'FROM t_data '
        + 'INNER JOIN t_users ON '
        + 't_users.t_id = t_data.user_id '
        + 'INNER JOIN t_courses ON '
        + 't_courses.t_id = t_data.course_id '
        + 'WHERE t_users.username = ? '
        + 'ORDER BY t_courses.course_id ASC;',
    },
    t_gpa_scale: { // Queries from the t_gpa_scale table
      scale: 'SELECT grade_letter, numeric_value FROM t_gpa_scale;',
    },
    t_properties: { // Queries from the t_properties table
      grade_values: 'SELECT val FROM t_properties WHERE prop = \'grade\' ORDER BY val ASC;',
      status_values: 'SELECT val FROM t_properties WHERE prop = \'status\' ORDER BY val ASC;',
    },
    information_schema: { // Queries from the information_schema table
      grade_values: 'SELECT COLUMN_TYPE '
        + 'FROM information_schema.`COLUMNS` '
        + 'WHERE TABLE_NAME = "t_data" '
        + 'AND COLUMN_NAME = "grade";',
      status_values: 'SELECT COLUMN_TYPE '
        + 'FROM information_schema.`COLUMNS` '
        + 'WHERE TABLE_NAME = "t_data" '
        + 'AND COLUMN_NAME = "status";',
    },
  },
};

// The dbConnector sets up the connection to the SQL server
const dbConnector = (hostPreferences) => {
  const connection = mysql.createConnection({
    host: hostPreferences.host,
    user: hostPreferences.user,
    password: hostPreferences.password,
    database: hostPreferences.database,
  });

  return connection;
};

// Open the connection to the server based on what host the program is being run on
const openConnection = () => {
  let connection = null;

  if ((os.hostname() === 'ubuntulamp') || (os.hostname() === 'Acid-Alien')) {
    connection = dbConnector(connectionPreferences.other);
  } else {
    connection = dbConnector(connectionPreferences.other);
  }

  return connection;
};

// Process the query result, splitting the queryData and tableData response information
const processResult = (result, fields, callback) => {
  const data = {
    queryData: result,
    tableData: fields,
  };

  callback(data);
};

// Run a query on the server to extract user-specific data
const runQueryWithUsername = (username, fullQuery, callback) => {
  const con = openConnection();

  const responseJSON = {};

  con.connect((connErr) => {
    if (connErr) {
      throw connErr;
    } else {
      con.query(
        fullQuery,
        [username],
        (queryErr, result, fields) => {
          if (queryErr) {
            responseJSON.id = 500;
            callback(responseJSON);
          } else {
            processResult(result, fields, (data) => {
              responseJSON.id = 200;
              responseJSON.data = data;
              callback(responseJSON);
            });
          }
        },
      );
      con.end();
    }
  });
};

// Run a query on the server to get user-independent data
const runQueryWithoutUsername = (fullQuery, callback) => {
  const con = openConnection();

  const responseJSON = {};

  con.connect((connErr) => {
    if (connErr) {
      throw connErr;
    } else {
      con.query(
        fullQuery,
        (queryErr, result, fields) => {
          if (queryErr) {
            responseJSON.id = 500;
            callback(responseJSON);
          } else {
            processResult(result, fields, (data) => {
              responseJSON.id = 200;
              responseJSON.data = data;
              callback(responseJSON);
            });
          }
        },
      );
      con.end();
    }
  });
};

// Register a new user in the database
const registerUser = (username, email, callback) => {
  runQueryWithoutUsername(
    `INSERT INTO t_users(username, email) VALUES ("${username}", "${email}");`,
    callback,
  );
};

// Add a password for the newly registered user
const registerPassword = (userId, password, callback) => {
  runQueryWithoutUsername(
    `INSERT INTO t_passwords(user_id, password) VALUES ("${userId}", "${password}");`,
    callback,
  );
};

// Get the user based on username.  This is required to determine if the user exists
const getUser = (username, callback) => {
  runQueryWithUsername(
    username,
    defaultQueries.select.t_users.user_exists,
    callback,
  );
};

// Get the password associated with the username
const getPassword = (username, callback) => {
  runQueryWithUsername(
    username,
    defaultQueries.select.t_users.user_password,
    callback,
  );
};

// Get a list of all the courses the user has been or is currently enrolled in
const getEnrolledCourses = (username, callback) => {
  runQueryWithUsername(
    username,
    defaultQueries.select.t_courses.enrolled_courses,
    callback,
  );
};

// Get details about available courses
const getCourseDetails = (callback) => {
  runQueryWithoutUsername(
    defaultQueries.select.t_courses.course_ids_and_names,
    callback,
  );
};

// Get the list of predefined grade values
const getGradeValues = (callback) => {
  runQueryWithoutUsername(
    defaultQueries.select.t_properties.grade_values,
    callback,
  );
};

// Get the list of predefined status values
const getStatusValues = (callback) => {
  runQueryWithoutUsername(
    defaultQueries.select.t_properties.status_values,
    callback,
  );
};

// Get the predefined GPA scale (4.0-based scale)
const getGpaScale = (callback) => {
  runQueryWithoutUsername(
    defaultQueries.select.t_data.gpa_scale,
    callback,
  );
};

// Register a new course to an existing user
const insertEnrollment = (args, callback) => {
  const fullQuery = 'INSERT INTO t_data(user_id, course_id, grade, status) '
    + 'VALUES ( '
      + `(SELECT t_id FROM t_users WHERE username = "${args.username}"), `
      + `(SELECT t_id FROM t_courses WHERE course_id = "${args.courseId}"), `
      + `("${args.grade}"), `
      + `("${args.status}")`
    + ');';

  runQueryWithoutUsername(
    fullQuery,
    (queryData) => getEnrolledCourses(args.username, (enrollmentData) => {
      const responseJSON = queryData;
      responseJSON.enrollmentData = enrollmentData.data.queryData;
      callback(responseJSON);
    }),
  );
};

// Update information on a course that is registered to a user
const updateEnrollment = (args, callback) => {
  const fullQuery = 'UPDATE t_data '
    + 'SET '
    + `status = "${args.status}", `
    + `grade = "${args.grade}" `
    + 'WHERE ( '
    + `(user_id = (SELECT t_id FROM t_users WHERE username = "${args.username}")) AND `
    + `(course_id = (SELECT t_id FROM t_courses WHERE course_id = "${args.courseId}")) `
    + ');';

  runQueryWithoutUsername(
    fullQuery,
    (queryData) => getEnrolledCourses(args.username, (enrollmentData) => {
      const responseJSON = queryData;
      responseJSON.enrollmentData = enrollmentData.data.queryData;
      callback(responseJSON);
    }),
  );
};

// Export locally defined functions for external use
module.exports = {
  registerUser,
  registerPassword,
  getUser,
  getPassword,
  getEnrolledCourses,
  getCourseDetails,
  getGradeValues,
  getStatusValues,
  getGpaScale,
  insertEnrollment,
  updateEnrollment,
};
