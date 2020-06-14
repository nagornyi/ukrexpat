exports.event = require('./event');
exports.article = require('./article');
exports.user = require('./user');
var async = require('async');

/*
 * GET home page.
 */

exports.index = function(req, res, next){
  var locals = {};
  var articlesWorkTop, articlesLifeTop, articlesEducationTop, articlesOtherTop;
  var tasks = [
    // Load events
    function(callback) {
      req.collections.events.find({published: true}, {sort: {_id: 1}}).toArray(function(error, events){
        events.sort(function(a,b){
          var aparts = a.enddate.split('.');
          var bparts = b.enddate.split('.');
          return new Date(aparts[2],aparts[1]-1,aparts[0]) - new Date(bparts[2],bparts[1]-1,bparts[0]);
        });
        var rightNow = new Date();
        events = events.filter(function(item) {
          var parts = item.enddate.split('.');
          return !(new Date(parts[2],parts[1]-1,parts[0]) < rightNow);
        });
        if (error) return callback(error);
        locals.events = events.slice(0,25);
        callback();
      });
    },
    // Load articles
    function(callback) {
      req.collections.articles.find({published: true}, {sort: {_id: 1}}).toArray(function(error, articles){
        articles.sort(function(a,b){
          var aparts = a.date.split('.');
          var bparts = b.date.split('.');
          return new Date(bparts[2],bparts[1]-1,bparts[0]) - new Date(aparts[2],aparts[1]-1,aparts[0]);
        });
        if (error) return callback(error);

        var articlesWork = articles.filter(function(item) {
          return (item.category == "Робота");
        });
        var articlesLife = articles.filter(function(item) {
          return (item.category == "Життя");
        });
        var articlesEducation = articles.filter(function(item) {
          return (item.category == "Освіта");
        });
        var articlesOther = articles.filter(function(item) {
          return (item.category == "Інше");
        });

        articlesWorkTop = articlesWork.slice(0,1);
        locals.articlesWork = articlesWork.slice(1,5);

        articlesLifeTop = articlesLife.slice(0,1);
        locals.articlesLife = articlesLife.slice(1,5);

        articlesEducationTop = articlesEducation.slice(0,1);
        locals.articlesEducation = articlesEducation.slice(1,5);

        locals.articlesOther = articlesOther.slice(0,5);

        callback();
      });
    }
  ];

  async.parallel(tasks, function(error) {
    if (error) return next(error);
    locals.articlesTop = articlesLifeTop.concat(articlesWorkTop, articlesEducationTop);
    res.render('index', locals);
  });
};
