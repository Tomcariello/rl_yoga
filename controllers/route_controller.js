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
var upload = multer({dest: __dirname + '/public/images/'}); 
var fs = require('fs');

//==================================
//=====GET routes to load pages=====
//==================================
router.get('/', function(req, res) {
  res.redirect('/index');
});

router.get('/index', function(req, res) {
    models.Carousel.findAll({})
  .then(function(data) {
    var payload = {carouseldata: data}
    res.render('index', {carouseldata: payload.carouseldata});
  })
});

router.get('/about', function(req, res) {
    models.AboutMe.findOne({
    where: {id: 1}
  })
  .then(function(data) {
    var payload = {aboutmedata: data}
    res.render('about', {aboutmedata: payload.aboutmedata});
  })
});

router.get('/schedule', function (req, res) {
  res.render('schedule');
});

router.get('/videos', function (req, res) {
  //pull video data from database
  models.Videos.findAll({})
  .then(function(data) {
    var payload = {videodata: data}
    res.render('videos', {videodata: payload.videodata});
  })
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

router.get('/adminvideos', isLoggedIn, function(req, res) {
  //pull portfolio/project data from database
  models.Videos.findAll({})
  .then(function(data) {
    var payload = {videodata: data}
    res.render('adminvideos', {videodata: payload.videodata});
  })
});

router.get('/admincarousel', isLoggedIn, function(req, res) {
  //pull carousel data from database
  models.Carousel.findAll({})
  .then(function(data) {
    var payload = {carouseldata: data}
    res.render('admincarousel', {carouseldata: payload.carouseldata});
  })

});
//Delete Video Object
router.get('/deletevideos/:projectid', isLoggedIn, function(req, res) {

  var queryString = 'DELETE from videos WHERE id=' + req.params.projectid + ';';

  connection.query(queryString, function (err, result) {
    if (err) throw err;
  });
  res.redirect('../adminvideos');
})

//Delete Video Object
router.get('/deleteCarousel/:projectid', isLoggedIn, function(req, res) {

  var queryString = 'DELETE from carousels WHERE id=' + req.params.projectid + ';';

  connection.query(queryString, function (err, result) {
    if (err) throw err;
  });
  res.redirect('../admincarousel');
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
  var queryString = 'INSERT INTO messages (name, email, message, createdAt, updatedAt) VALUES ("' + req.body.fname + '", "' + req.body.email + '", "' + req.body.message + '", CURDATE(), CURDATE())';

  //Run SQL query to add data to table
  connection.query(queryString, function (err, result) {
    if (err) throw err;
  });

  //Send email to alert the admin that a message was recieved
  var mailOptions = {
      from: 'contact@tomcariello.com', // sender address
      to: 'raechel.lutz@gmail.com', // list of receivers
      subject: 'Someone left you a message', // Subject line
      text: 'Name: ' + req.body.fname + '\n Message: ' + req.body.message
  };

  sendAutomaticEmail(mailOptions);

  res.redirect('../contact');
});

//Process About Me update requests
router.post('/updateAboutMe', isLoggedIn, upload.any(), function(req, res) {
  
  //Previous settings. Used if not overwritten below.
  var bioImageToUpload = req.body.BioImage; //bio image was unchaged
  var aboutMeImageToUpload = req.body.AboutMeImage; //bio image was unchaged

  //Check if any image(s) wer uploaded
  if (typeof req.files !== "undefined") {

    if (req.files.length == 1) {

      //If 1st image uploaded was for ABOUT ME
      if (req.files[0].fieldname == "profilepicture") {
        var tempAboutMeImagePath  = req.files[0].path;
        var destinationPath = 'public/images/' + req.files[0].originalname;

        var imageSource = fs.createReadStream(tempAboutMeImagePath);
        var imageDestination = fs.createWriteStream(destinationPath);
        imageSource.pipe(imageDestination);

        aboutMeImageToUpload = "/images/" + req.files[0].originalname;
      } else if (req.files[0].fieldname == "biopicture") {  //If image uploaded for Bio
        var tempBioImagePath  = req.files[0].path;
        var destinationPath = 'public/images/' + req.files[0].originalname;

        var imageSource = fs.createReadStream(tempBioImagePath);
        var imageDestination = fs.createWriteStream(destinationPath);
        imageSource.pipe(imageDestination);
        bioImageToUpload = "/images/" + req.files[0].originalname;
      }
    } else if (req.files.length == 2){ //multiple files uploaded
        //Process AboutMe Image
        var tempAboutMeImagePath  = req.files[0].path;
        var destinationPath = 'public/images/' + req.files[0].originalname;
        var imageSource = fs.createReadStream(tempAboutMeImagePath);
        var imageDestination = fs.createWriteStream(destinationPath);
        imageSource.pipe(imageDestination);
        aboutMeImageToUpload = "/images/" + req.files[0].originalname;

        //Process Bio Image
        var tempBioImagePath  = req.files[1].path;
        var bioDestinationPath = 'public/images/' + req.files[1].originalname;
        var bioImageSource = fs.createReadStream(tempBioImagePath);
        var bioImageDestination = fs.createWriteStream(bioDestinationPath);
        bioImageSource.pipe(bioImageDestination);
        bioImageToUpload = "/images/" + req.files[1].originalname;
    }
  }

  //Create String to update MySQL
  var queryString = 'UPDATE AboutMe SET about="' + req.body.AboutMeBio + '", aboutimage="' + aboutMeImageToUpload + '", bio="' + req.body.biotext + '", bioimage="' + bioImageToUpload +  '", updatedAt=CURDATE() WHERE id=1';
  
  //Run SQL query to update data
  connection.query(queryString, function (err, result) {
    if (err) throw err;
  });
  res.redirect('../adminaboutme');
});

router.post('/newvideo', function(req, res) {

  //Parse data from form & generate query string
  var queryString = 'INSERT INTO videos (videoname, description, url, createdAt, updatedAt) VALUES ("' + req.body.NewVideoName + '", "' + req.body.NewDescription + '", "' + req.body.NewVideoURL + '", CURDATE(), CURDATE())';

  //Run SQL query to add data to table
  connection.query(queryString, function (err, result) {
    if (err) throw err;
  });

  res.redirect('../adminvideos');
});

router.post('/updatevideo', function(req, res) {

  //Parse data from form & generate query string
  var queryString = 'Update videos SET videoname="' + req.body.videoname + '", description="'+  req.body.description + '", url="' + req.body.url + '", updatedAt=CURDATE() WHERE id="' +  req.body.dbid + '"';

  //Run SQL query to add data to table
  connection.query(queryString, function (err, result) {
    if (err) throw err;
  });

  res.redirect('../adminvideos');
});

router.post('/newCarousel', function(req, res) {

  //Parse data from form & generate query string
  var queryString = 'INSERT INTO carousels (imagepath, quote, quotesource, createdAt, updatedAt) VALUES ("' + req.body.NewImage + '", "' + req.body.NewQuote + '", "' + req.body.NewSource + '", CURDATE(), CURDATE())';

  //Run SQL query to add data to table
  connection.query(queryString, function (err, result) {
    if (err) throw err;
  });

  res.redirect('../admincarousel');
});


router.post('/updateCarousel', isLoggedIn, upload.single('carouselPicture'), function(req, res) {

  var carouselImageToUpload;

  //Check if image was upload & process it
  if (typeof req.file !== "undefined") {
    var tempImagePath  = req.file.path;
    var destinationPath = 'public/images/' + req.file.originalname;

    var imageSource = fs.createReadStream(tempImagePath);
    var imageDestination = fs.createWriteStream(destinationPath);
    imageSource.pipe(imageDestination);

    carouselImageToUpload = "/images/" + req.file.originalname;
  } else {
    carouselImageToUpload = req.body.carouselImage; //carousel image was unchaged
  }

  //Parse data from form & generate query string
  var queryString = 'Update carousels SET imagepath="' + carouselImageToUpload + '", quote="'+  req.body.carouselQuote + '", quotesource="' + req.body.carouselSource + '", updatedAt=CURDATE() WHERE id="' +  req.body.dbid + '"';

  //Run SQL query to add data to table
  connection.query(queryString, function (err, result) {
    if (err) throw err;
  });

  res.redirect('../admincarousel');
});



// route middleware to make sure user is verified
function isLoggedIn(req, res, next) {
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