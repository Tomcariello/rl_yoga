//Here is where you make the connection to the database and export and used by the O.R.M.

var mysql = require('mysql');
var connection;

//If in heroku production environment, create connection based on that information
if (process.env.JAWSDB_URL) {
	connection = mysql.createConnection(process.env.JAWSDB_URL);

	//Not sure if the below is necessary....
	// connection.config.host = process.env.host;
  // connection.config.user = process.env.username;
  // connection.config.password = process.env.password;
  // connection.config.database = process.env.database;
} else { //use local credentials
  connection = mysql.createConnection({
  	
    port: 3306,
  	host: 'localhost',
  	user: 'root',
   	password: '',
   	database: 'tomcariello'
   });
}

 connection.connect(function (err) {
 	if (err) {
 		console.error('error connecting: ' + err.stack);
 		return;
 	}
 	console.log('connected as id ' + connection.threadId);
});

module.exports = connection;