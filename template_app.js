var TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY || 'mykey'
var TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET || 'mykey'

var express = require('express'),  
  routes = require('./routes'),
  http = require('http'),
  path = require('path'),
  mongoskin = require('mongoskin'),
  dbUrl = process.env.MONGOHQ_URL || 'mongodb://@localhost:27017/blog',
  db = mongoskin.db(dbUrl, {safe: true}),
  collections = {
    events: db.collection('events'),
    articles: db.collection('articles'),
    users: db.collection('users')
  }
  bodyParser = require('body-parser'),
  cookieSession = require('cookie-session'),
  everyauth = require('everyauth'),
  morgan = require('morgan'),
  cookieParser = require('cookie-parser'),
  methodOverride = require('method-override'),
  errorHandler = require('errorhandler'),
  favicon = require('serve-favicon');

everyauth.debug = true;
everyauth.twitter
  .consumerKey(TWITTER_CONSUMER_KEY)
  .consumerSecret(TWITTER_CONSUMER_SECRET)
  .findOrCreateUser( function (session, accessToken, accessTokenSecret, twitterUserMetadata) {
    var promise = this.Promise();
    process.nextTick(function(){
        if (twitterUserMetadata.screen_name === 'myusername') {
          session.user = twitterUserMetadata;
          session.admin = true;
        }
        promise.fulfill(twitterUserMetadata);
    })
    return promise;
    // return twitterUserMetadata
  })
  .redirectPath('/admin');

//we need it because otherwise the session will be kept alive
everyauth.everymodule.handleLogout(routes.user.logout);

everyauth.everymodule.findUserById( function (user, callback) {
  callback(user)
});

var app = express();
app.locals.appTitle = "Портал Українських Експатів";
app.locals.appVersion = 22;

app.use(function(req, res, next) {
  if (!collections.events || ! collections.users || ! collections.articles) return next(new Error("No collections."))
  req.collections = collections;
  return next();
});

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(favicon(path.join(__dirname,'public','favicon.ico')));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser('3CCC4ACD-6ED1-4844-9217-82131BDCB239'));
app.use(cookieSession({
  //domain: 'ukrexpat.com',
  secret: '2C44774A-D649-4D44-9535-46E296EF984F',
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use(everyauth.middleware());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride());
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  if (req.session && req.session.admin)
    res.locals.admin = true;
  next();
});

//authorization
var authorize = function(req, res, next) {
  if (req.session && req.session.admin)
    return next();
  else
    return res.render('401');
};

// development only
if ('development' == app.get('env')) {
  app.use(errorHandler());
}

//PAGES&ROUTES
app.get('/', routes.index);
app.get('/events', routes.event.index);
app.get('/events/country/:country', routes.event.indexCountry);
app.get('/articles', routes.article.index);
app.get('/articles/category/:category', routes.article.indexCat);
app.get('/articles/tag/:tag', routes.article.indexTag);
// app.get('/news', function(req, res, next) {
//   res.render('news');
// });
app.get('/tos', function(req, res, next) {
  res.render('tos');
});
app.get('/login', routes.user.login);
app.post('/login', routes.user.authenticate); //if you use everyauth, this /logout route is overwriting by everyauth automatically, therefore we use custom/additional handleLogout
app.get('/logout', routes.user.logout);
app.get('/admin', authorize, routes.event.admin);
app.get('/adminArticle', authorize, routes.article.admin);

//EVENTS
app.get('/post', routes.event.post);
app.post('/post', routes.event.postEvent);
app.get('/change/:slug', authorize, routes.event.change);
app.post('/change', authorize, routes.event.changeEvent);
app.get('/events/:slug', routes.event.show);
app.get('/eventsPage/:page', routes.event.page);
app.get('/eventsPage/:page/country/:country', routes.event.pageCountry);
app.get('/eventsPageAdmin/:page', authorize, routes.event.pageAdmin);

//ARTICLES
app.get('/postArticle', authorize, routes.article.post);
app.post('/postArticle', authorize, routes.article.postEvent);
app.get('/changeArticle/:slug', authorize, routes.article.change);
app.post('/changeArticle', authorize, routes.article.changeEvent);
app.get('/articles/:slug', routes.article.show);
app.get('/articlesPage/:page', routes.article.page);
app.get('/articlesPage/:page/tag/:tag', routes.article.pageTag);
app.get('/articlesPage/:page/category/:category', routes.article.pageCat);
app.get('/articlesPageAdmin/:page', routes.article.pageAdmin);

//REST API ROUTES
app.all('/api', authorize);

app.get('/api/events', routes.event.list)
app.post('/api/events', routes.event.add);
app.put('/api/events/:id', routes.event.edit);
app.delete('/api/events/:id', routes.event.delete);

app.get('/api/articles', routes.article.list)
app.post('/api/articles', routes.article.add);
app.put('/api/articles/:id', routes.article.edit);
app.delete('/api/articles/:id', routes.article.delete);

app.all('*', function(req, res) {
  res.render('404');
})

var server = http.createServer(app);
var boot = function () {
  server.listen(app.get('port'), function(){
    console.info('Express server listening on port ' + app.get('port'));
  });
}
var shutdown = function() {
  server.close();
}
if (require.main === module) {
  boot();
}
else {
  console.info('Running app as a module')
  exports.boot = boot;
  exports.shutdown = shutdown;
  exports.port = app.get('port');
}
