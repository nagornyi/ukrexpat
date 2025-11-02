// Helper function to make API call to recaptcha and check response
function verifyRecaptcha(key, callback) {
    require('https').get("https://www.google.com/recaptcha/api/siteverify?secret=" + "mykey" + "&response=" + key, function(res) {
      var data = "";
      res.on('data', function (chunk) {
        data += chunk.toString();
      });
      res.on('end', function() {
        try {
          var parsedData = JSON.parse(data);
          console.log(parsedData);
          callback(parsedData.success);
        } catch (e) {
          callback(false);
        }
      });
    });
  }

module.exports = verifyRecaptcha;
