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
var aws = require('aws-sdk');

//amazon S3 configuration
var S3_BUCKET = process.env.S3_BUCKET;
var S3_accessKeyId = process.env.AWS_ACCESS_KEY_ID
var S3_secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

//==================================
//=====GET routes to load pages=====
//==================================
router.get('/', function(req, res) {
  res.redirect('/index');
});

router.get('/index', function(req, res) {
    models.Carousel.findAll({})
  .then(function(data) {
    var payload = {dynamicData: data}

    //Add administrator credential to the created object
    if (req.user) {
      payload.dynamicData["administrator"] = true;
    }
    
    res.render('index', {dynamicData: payload.dynamicData});
  })
});

router.get('/about', function(req, res) {
    models.AboutMe.findOne({
    where: {id: 1}
  })
  .then(function(data) {
    var payload = {dynamicData: data}

    //decode About data for proper rendering
    var decodeAbout = decodeURIComponent(payload.dynamicData.about);
    payload.dynamicData.about = decodeAbout;

    //decode Bio data for proper rendering
    var decodeBio = decodeURIComponent(payload.dynamicData.bio);
    payload.dynamicData.bio = decodeBio;

    //Add administrator credential to the created object
    if (req.user) {
      payload.dynamicData["administrator"] = true;
    }

    res.render('about', {dynamicData: payload.dynamicData});
  })
});

router.get('/videos', function (req, res) {
  //pull video data from database
  models.Videos.findAll({})
  .then(function(data) {
    var payload = {dynamicData: data}

    //Add administrator credential to the created object
    if (req.user) {
      payload.dynamicData["administrator"] = true;
    }

    res.render('videos', {dynamicData: payload.dynamicData});
  })
});

router.get('/schedule', function (req, res) {
  //res.render('schedule');

  models.Schedule.findOne({
    where: {id: 1}
  })
  .then(function(data) {
    var payload = {dynamicData: data}

    //decode data for proper rendering
    var decodeSchedule = decodeURIComponent(payload.dynamicData.scheduletext);
    payload.dynamicData.scheduletext = decodeSchedule;

    //Add administrator credential to the created object
    if (req.user) {
      payload.dynamicData["administrator"] = true;
    }

    res.render('schedule', {dynamicData: payload.dynamicData});
  })
});

router.get('/contact', function(req, res) {

  var payload = {
    dynamicData: {
      administrator: false,
      messageSent: false
    }
  }

  //Add messageSent credential to the created object
  if (req.session.messageSent) {
    payload.dynamicData.messageSent = true;
    req.session.messageSent = false;
  }
    
  //Add administrator credential to the created object
  if (req.user) {
    payload.dynamicData.administrator = true;
  }
  res.render('contact', {dynamicData: payload.dynamicData});
});

router.get('/register', function(req, res) {
  res.render('register');
});

router.get('/login', function(req, res) {
  res.render('login');
});

// router.post('/updateimage', function(req, res) {
  
//   console.log(req.data);

//   // if (typeof req.file !== "undefined") {

//     //Process file being uploaded
//     // var fileName = req.data.originalname;
//     // var fileType = req.data.mimetype;

//     // var tempImagePath  = req.data.path; //temporary path to file uploaded
//     // var destinationPath = 'public/images/' + fileName; //path to heroku structure images folder
//     // var imageSource = fs.createReadStream(tempImagePath);
//     // var imageDestination = fs.createWriteStream(destinationPath);
//     // imageSource.pipe(imageDestination);
//     // scheduleImageToUpload = "/images/" + req.data.originalname;

//     //Create Amazon S3 specific object
//     var s3 = new aws.S3();

//     var params = {
//       Bucket: S3_BUCKET,
//       Key: "fileName", //This is what S3 will use to store the data uploaded.
//       Body: req.data, //the actual *file* being uploaded
//       ContentType: "req.data.mimetype", //type of file being uploaded
//       ACL: 'public-read', //Set permissions so everyone can see the image
//       accessKeyId: S3_accessKeyId,
//       secretAccessKey: S3_secretAccessKey
//      }

//     s3.upload( params, function(err, data) {
//       if (err) {
//         console.log("err is " + err);
//       } else {
//         console.log('Database updated');
//         res.status(200).json(req);
//       }
//     })
//   // }
// });

//============================================
//=====GET PROTECTED routes to load pages=====
//============================================
router.get('/adminportal', isLoggedIn, function(req, res) {
  res.render('adminportal');
});

router.get('/viewmessages', isLoggedIn, function(req, res) {
  //Pull message data from database
  models.messages.findAll({})
  .then(function(data) {
    var payload = {dynamicData: data}
    payload.dynamicData["administrator"] = true;
    res.render('viewmessages', {dynamicData: payload.dynamicData});
  })
});

router.get('/adminaboutme', isLoggedIn, function(req, res) {
  //Pull about me data from database
  models.AboutMe.findOne({
    where: {id: 1}
  })
  .then(function(data) {
    var payload = {dynamicData: data};
    payload.dynamicData["administrator"] = true;
    res.render('adminaboutme', {dynamicData: payload.dynamicData});
  })
});

router.get('/adminvideos', isLoggedIn, function(req, res) {
  models.Videos.findAll({})
  .then(function(data) {
    var payload = {dynamicData: data}
    payload.dynamicData["administrator"] = true;
    res.render('adminvideos', {dynamicData: payload.dynamicData});
  })
});

router.get('/admincarousel', isLoggedIn, function(req, res) {
  models.Carousel.findAll({})
  .then(function(data) {
    var payload = {dynamicData: data}
    payload.dynamicData["administrator"] = true;
    res.render('admincarousel', {dynamicData: payload.dynamicData});
  })

});

router.get('/adminschedule', isLoggedIn, function(req, res) {
    models.Schedule.findOne({
    where: {id: 1}
  })
  .then(function(data) {
    var payload = {dynamicData: data};
    payload.dynamicData["administrator"] = true;
    res.render('adminschedule', {dynamicData: payload.dynamicData});
  })
});

//Delete Video Object
router.get('/deletevideos/:projectid', isLoggedIn, function(req, res) {

  var queryString = 'DELETE from Videos WHERE id=' + req.params.projectid + ';';

  connection.query(queryString, function (err, result) {
    if (err) throw err;
  });
  res.redirect('../adminvideos');
})

//Delete Message
router.get('/deletemessage/:projectid', isLoggedIn, function(req, res) {

  var queryString = 'DELETE from messages WHERE id=' + req.params.projectid + ';';

  connection.query(queryString, function (err, result) {
    if (err) throw err;
  });
  res.redirect('../viewmessages');
})

//Delete Carousel Object
router.get('/deleteCarousel/:projectid', isLoggedIn, function(req, res) {

  var queryString = 'DELETE from Carousels WHERE id=' + req.params.projectid + ';';

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
      to: 'tomcariello@gmail.com', // list of receivers
      subject: 'Someone left you a message', // Subject line
      text: 'Name: ' + req.body.fname + '\n Message: ' + req.body.message
  };

  sendAutomaticEmail(mailOptions);
  req.session.messageSent = true;

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

      //If image uploaded was for ABOUT ME
      if (req.files[0].fieldname == "profilepicture") {
        //Add vars to contain name & destination
        var tempAboutMeImagePath  = req.files[0].path;
        var destinationPath = 'public/images/' + req.files[0].originalname;

        //create file path & destination
        var imageSource = fs.createReadStream(tempAboutMeImagePath);
        var imageDestination = fs.createWriteStream(destinationPath);

        //save image to destination
        imageSource.pipe(imageDestination);

        //Save path to image to store in database
        aboutMeImageToUpload = "/images/" + req.files[0].originalname;


        //Upload image to amazon S3

        //Save path to image on AS3 to store in database


        
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


//Process Schedule update requests
router.post('/updateschedule', isLoggedIn, upload.single('schedulepicture'), function(req, res) {
  var scheduleImageToUpload;

  //Check if image was upload & process it
  if (typeof req.file !== "undefined") {

    //Process file being uploaded
    var fileName = req.file.originalname;
    var fileType = req.file.mimetype;

    var tempImagePath  = req.file.path; //temporary path to file uploaded
    var destinationPath = 'public/images/' + fileName; //path to heroku structure images folder
    var imageSource = fs.createReadStream(tempImagePath);
    var imageDestination = fs.createWriteStream(destinationPath);
    imageSource.pipe(imageDestination);
    scheduleImageToUpload = "/images/" + req.file.originalname;

    //Create Amazon S3 specific object
    var s3 = new aws.S3();

    //Create "stream" of the file
    var stream = fs.createReadStream(req.file.path)
   
    //This uploads the file but the file cannot be viewed.
    var params = {
      Bucket: S3_BUCKET,
      Key: fileName, //This is what S3 will use to store the data uploaded.
      Body: stream, //the actual *file* being uploaded
      ContentType: req.file.mimetype, //type of file being uploaded
      ACL: 'public-read', //Set permissions so everyone can see the image
      processData: false,
      accessKeyId: S3_accessKeyId,
      secretAccessKey: S3_secretAccessKey
     }

    s3.upload( params, function(err, data) {
      if (err) {
        console.log("err is " + err);
      }

      //Get S3 filepath & set it to scheduleImageToUpload
      scheduleImageToUpload = data.Location

      console.log(scheduleImageToUpload);

      //Create String to update MySQL
      var queryString = 'UPDATE Schedule SET scheduletext="' + req.body.ScheduleText + '", scheduleimage="' + scheduleImageToUpload + '", updatedAt=CURDATE() WHERE id=1';
  
      //Run SQL query to update data
      connection.query(queryString, function (err, result) {
        if (err) throw err;
      });
      
      res.redirect('../adminschedule');
    });

  } else {
    scheduleImageToUpload = req.body.scheduleimage; //schedule image was unchanged
  }

});


router.post('/newvideo', isLoggedIn, function(req, res) {

  //Parse data from form & generate query string
  var queryString = 'INSERT INTO Videos (videoname, description, url, createdAt, updatedAt) VALUES ("' + req.body.NewVideoName + '", "' + req.body.NewDescription + '", "' + req.body.NewVideoURL + '", CURDATE(), CURDATE())';

  //Run SQL query to add data to table
  connection.query(queryString, function (err, result) {
    if (err) throw err;
  });

  res.redirect('../adminvideos');
});

router.post('/updatevideo', isLoggedIn, function(req, res) {

  //Parse data from form & generate query string
  var queryString = 'Update Videos SET videoname="' + req.body.videoname + '", description="'+  req.body.description + '", url="' + req.body.url + '", updatedAt=CURDATE() WHERE id="' +  req.body.dbid + '"';

  //Run SQL query to add data to table
  connection.query(queryString, function (err, result) {
    if (err) throw err;
  });

  res.redirect('../adminvideos');
});

router.post('/newCarousel', isLoggedIn, upload.single('carouselPicture'), function(req, res) {

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
    carouselImageToUpload = req.body.carouselImage; //carousel image was unchanged
  }
  //Parse data from form & generate query string
  var queryString = 'INSERT INTO Carousels (imagepath, quote, quotesource, createdAt, updatedAt) VALUES ("' + carouselImageToUpload + '", "' + req.body.NewQuote + '", "' + req.body.NewSource + '", CURDATE(), CURDATE())';

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
  var queryString = 'Update Carousels SET imagepath="' + carouselImageToUpload + '", quote="'+  req.body.carouselQuote + '", quotesource="' + req.body.carouselSource + '", updatedAt=CURDATE() WHERE id="' +  req.body.dbid + '"';

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
    if(error){
        console.log(error);
    } else {
        console.log('Message sent: ' + info.response);
    };
  });
}


module.exports = router;