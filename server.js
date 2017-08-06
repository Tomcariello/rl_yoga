//Set up the server to use mySQL locally & Jaws once deployed on Heroku
var Sequelize = require('sequelize'),
  connection;
if (process.env.JAWSDB_URL){
  connection = new Sequelize(process.env.JAWSDB_URL);
} else{
  connection = new Sequelize('tomcariello', 'root', 'password', {
    host: 'localhost',
    dialect: 'mysql',
    port:'3306'
  })
}

var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');

var app = express();

app.use(express.static(__dirname + '/public'));
app.use(cookieParser()); 
app.use(bodyParser.urlencoded({ 
	extended: false
}));

//Handelbars configuration
var exphbs = require('express-handlebars'); 
app.engine('handlebars', exphbs({
	defaultLayout: 'main'
}));

app.set('view engine', 'handlebars');

require('./config/passportConfig.js');

//Passport configuration
require('./config/passportConfig.js')(passport);

app.use(session({ secret: 'tomtest' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

//Routes
var routes = require('./controllers/route_controller.js');
app.use('/', routes);

//Launch
var PORT = 3000;
app.listen(process.env.PORT || PORT);
