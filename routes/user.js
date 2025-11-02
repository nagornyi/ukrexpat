const verifyRecaptcha = require("../public/js/recaptcha");

/*
 * GET users listing.
 */

exports.list = function(req, res){
  res.send("respond with a resource");
};


/*
 * GET login page.
 */

exports.login = function(req, res, next) {
  res.render('login');
};

/*
 * GET logout route.
 */

exports.logout = function(req, res, next) {
  //req.session.destroy();
  req.session = null;
  res.redirect('login');
};


/*
 * POST authenticate route.
 */

exports.authenticate = function(req, res, next) {
  verifyRecaptcha(req.body["g-recaptcha-response"], function(success) {
    if (success) {
    if (!req.body.username || !req.body.password)
      return res.render('login', {error: "Будь-ласка введіть ім'я користувача та пароль.", alertState: "failure"});
    req.collections.users.findOne({
      username: req.body.username,
      password: req.body.password
    }, function(error, user){
      if (error) return next(error);
      if (!user) return res.render('login', {error: "Неправильна комбінація імені користувача та паролю. Доступ до цієї зони має тільки Адміністратор.", alertState: "failure"});
      req.session.user = user;
      req.session.admin = user.admin;
      res.redirect('/');
    })
    } else {
      return res.render('login', {error: "Поставте галочку у верифікаційному полі reCAPTCHA.", alertState: "failure"});
    }
  });
};
