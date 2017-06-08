var express = require('express');
var bcrypt = require('bcrypt');
var router = express.Router();
var models = require('../models');
var bodyParser = require('body-parser');
var connection = require('../config/connection.js');
var passport = require('passport');
var nodemailer = require('nodemailer');
var transporter = require('../config/transporter.js');
var sequelizeConnection = models.sequelize;
var multer  = require('multer');
// var upload = multer({ dest: '../public/images/' });
var upload = multer({dest: __dirname + '/public/images/'});
var fs = require('fs');

//==================================
//=====GET routes to load pages=====
//==================================
router.get('/', function(req, res) {
  res.redirect('/index');
});

router.get('/index', function(req, res) {
    models.AboutMe.findOne({
    where: {id: 1}
  })
  .then(function(data) {
    var payload = {aboutmedata: data}
    res.render('index', {aboutmedata: payload.aboutmedata});
  })

});

router.get('/bio', function (req, res) {
   models.Bio.findOne({
     where: {id: 1}
   })
  .then(function(data) {
    var payload = {biodata: data}
    return res.render('bio', {biodata: payload.biodata});
  })
  // res.render('bio');
});

router.get('/schedule', function (req, res) {
  res.render('schedule');
});

router.get('/videos', function (req, res) {
  res.render('videos');
});


router.get('/contact', function(req, res) {
  res.render('contact');
});

router.get('/register', function(req, res) {
  res.render('register');
  // res.redirect('/index');
});

router.get('/login', function(req, res) {
  res.render('login');
});

//============================================
//=====GET PROTECTED routes to load pages=====
//============================================
router.get('/adminportal', isLoggedIn, function(req, res) {
  res.render('adminportal');
});

router.get('/viewmessages', isLoggedIn, function(req, res) {
  //Pull message data from database
  models.Messages.findAll({})
  .then(function(data) {
    var payload = {messagedata: data}
    res.render('viewmessages', {messagedata: payload.messagedata});
  })
});

router.get('/adminaboutme', isLoggedIn, function(req, res) {
  //Pull about me data from database
  models.AboutMe.findOne({
    where: {id: 1}
  })
  .then(function(data) {
    var payload = {aboutmedata: data}
    res.render('adminaboutme', {aboutmedata: payload.aboutmedata});
  })
});

router.get('/adminbio', isLoggedIn, function(req, res) {
  //Pull about me data from database
  models.Bio.findOne({
    where: {id: 1}
  })
  .then(function(data) {
    var payload = {biodata: data}
    res.render('adminbio', {biodata: payload.biodata});
  })
});

router.get('/adminportfolio', isLoggedIn, function(req, res) {
  //pull portfolio/project data from database
  models.Project.findAll({})
  .then(function(data) {
    var payload = {projectdata: data}
    res.render('adminportfolio', {projectdata: payload.projectdata});
  })
});

//Delete Portfolio Project
router.get('/deleteportfolioproject/:projectid', isLoggedIn, function(req, res) {

  var queryString = 'DELETE from projects WHERE id=' + req.params.projectid + ';';

  connection.query(queryString, function (err, result) {
    if (err) throw err;
  });
  res.redirect('../adminportfolio');
})

//===============================================
//=====POST routes to record to the database=====
//===============================================

//Process registration requests using Passport
router.post('/register', passport.authenticate('local-signup', {
  successRedirect: ('../adminportal'), //if authenticated, proceed to adminportal page
  failureRedirect: ('login') //if failed, redirect to login page (consider options here!!)
}));

//Process login requests with Passport
router.post('/login', passport.authenticate('local-login', {
  successRedirect: ('../adminportal'), //if login successful, proceed to adminportal page
  failureRedirect: ('login') //if failed, redirect to login page (consider options here!!)
}));

router.post('/contact/message', function(req, res) {
  //Parse data from form & generate query string
  var queryString = 'INSERT INTO Messages (name, email, message, createdAt, updatedAt) VALUES ("' + req.body.fname + '", "' + req.body.email + '", "' + req.body.message + '", CURDATE(), CURDATE())';

  //Run SQL query to add data to table
  connection.query(queryString, function (err, result) {
    if (err) throw err;
  });

  //Send email to alert the admin that a message was recieved
  var mailOptions = {
      from: 'contact@tomcariello.com', // sender address
      to: 'tomcariello@gmail.com', // list of receivers
      subject: 'Someone left you a message', // Subject line
      text: 'Name: ' + req.body.fname + '\n Message: ' + req.body.message
  };

  sendAutomaticEmail(mailOptions);

  res.redirect('../contact');
});

//Process portfolio update requests
router.post('/updateportfolio', isLoggedIn, function(req, res) {
  //Create String to update MySQL
  var queryString = 'UPDATE Projects SET ProjectName="' + req.body.ProjectName + '", ProjectBlurb="' + req.body.ProjectBlurb + '", ProjectURL="' + req.body.ProjectURL + '", GithubURL="' + req.body.GithubURL + '", ProjectIMG="' + req.body.ProjectIMG + '", updatedAt=CURDATE() WHERE id="' + req.body.dbid + '"';
  
  //Run SQL query to update data
  connection.query(queryString, function (err, result) {
    if (err) throw err;
  });
  res.redirect('../adminportfolio');
});

//Process new portfolio object requests
router.post('/newportfolio', isLoggedIn, function(req, res) {
  //Create String to update MySQL
  var queryString = 'INSERT INTO Projects (ProjectName, ProjectBlurb, ProjectURL, GithubURL, ProjectIMG, createdAt, updatedAt) VALUES ("' + req.body.NewProjectName + '", "' + req.body.NewProjectBlurb + '", "' + req.body.NewProjectURL + '", "' + req.body.NewGithubURL + '", "' + req.body.NewProjectIMG + '", CURDATE(), CURDATE())';  
  //Run SQL query to update data
  connection.query(queryString, function (err, result) {
    if (err) throw err;
  });
  res.redirect('../adminportfolio');
});

//Process About Me update requests
router.post('/updateAboutMe', isLoggedIn, upload.single('profilepicture'), function(req, res) {
  var profileImageToUpload;

  //Check if image was upload & process it
  if (typeof req.file !== "undefined") {
    var tempImagePath  = req.file.path;
    var destinationPath = 'public/images/' + req.file.originalname;

    var imageSource = fs.createReadStream(tempImagePath);
    var imageDestination = fs.createWriteStream(destinationPath);
    imageSource.pipe(imageDestination);

    profileImageToUpload = "/images/" + req.file.originalname;
  } else {
    profileImageToUpload = req.body.AboutMeImage;  
  }

  //Create String to update MySQL
  var queryString = 'UPDATE AboutMe SET bio="' + req.body.AboutMeBio + '", image="' + profileImageToUpload + '", updatedAt=CURDATE() WHERE id=1';
  
  //Run SQL query to update data
  connection.query(queryString, function (err, result) {
    if (err) throw err;
  });
  res.redirect('../adminaboutme');
});

//Process Bio update requests
router.post('/updatebio', isLoggedIn, upload.single('profilepicture'), function(req, res) {
  var profileImageToUpload;

  //Check if image was upload & process it
  if (typeof req.file !== "undefined") {
    var tempImagePath  = req.file.path;
    var destinationPath = 'public/images/' + req.file.originalname;

    var imageSource = fs.createReadStream(tempImagePath);
    var imageDestination = fs.createWriteStream(destinationPath);
    imageSource.pipe(imageDestination);

    profileImageToUpload = "/images/" + req.file.originalname;
  } else {
    profileImageToUpload = req.body.BioImage;  
  }

  //Create String to update MySQL
  var queryString = 'UPDATE bio SET bio="' + req.body.Bio + '", image="' + profileImageToUpload + '", updatedAt=CURDATE() WHERE id=1';
  
  //Run SQL query to update data
  connection.query(queryString, function (err, result) {
    if (err) throw err;
  });
  res.redirect('../adminbio');
});





// route middleware to make sure user is verified
function isLoggedIn(req, res, next) {
  console.log('checking user login status');

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page
  res.redirect('/');
}


function sendAutomaticEmail(mailOptions, req, res) {
  transporter.sendMail(mailOptions, function(error, info){
    console.log(mailOptions);
    if(error){
        console.log(error);
    } else {
        console.log('Message sent: ' + info.response);
    };
  });
}



module.exports = router;