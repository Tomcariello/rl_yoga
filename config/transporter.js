//Settings for email application
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'Mailgun',
    auth: {
        user: 'postmaster@sandbox89902f58ae7a477db5640f2d1d7bf401.mailgun.org', // Your email id
        pass: '8e4e16d22c3b00df73e4da7ff992fe7c' // Your password
    }
});

module.exports = transporter;
