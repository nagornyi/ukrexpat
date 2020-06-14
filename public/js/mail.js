var api_key = 'mykey';
var domain = 'forum.ukrexpat.com';
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});

module.exports = mailgun;
