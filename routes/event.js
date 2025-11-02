const verifyRecaptcha = require("../public/js/recaptcha");
const mailgun = require("../public/js/mail");
var itemsPerPage = 5;

/*
 * GET events page.
 */

exports.index = function(req, res, next){
  // filter = {
  //   published: true,
  //   country: (req.query.country ? req.query.country : undefined)
  // };
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
    if (error) return next(error);
    var maxPages = Math.ceil(events.length / itemsPerPage);
    var allCountries = [];
    var i;
    for (i = 0; i < events.length; i++) {       
      allCountries.push(events[i].country);
    }
    var uniqueCountries = [...new Set(allCountries)].sort(Intl.Collator().compare);
    res.render('events', { events: events.slice(0, itemsPerPage), maxPages: maxPages, uniqueCountries: uniqueCountries, title: "Всі заходи"});
  })
};

/*
 * GET events page filtered by country.
 */

exports.indexCountry = function(req, res, next){
  if (!req.params.country) return next(new Error('No country provided.'));
  req.collections.events.find({published: true, country: req.params.country}, {sort: {_id: 1}}).toArray(function(error, events){
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
    if (error) return next(error);
    var maxPages = Math.ceil(events.length / itemsPerPage);
    var allCountries = [];
    var i;
    for (i = 0; i < events.length; i++) {       
      allCountries.push(events[i].country);
    }
    var uniqueCountries = [...new Set(allCountries)].sort(Intl.Collator().compare);
    res.render('events', { events: events.slice(0, itemsPerPage), maxPages: maxPages, uniqueCountries: uniqueCountries, title: "Заходи", country: req.params.country});
  })
};

/*
 * GET event page.
 */

exports.show = function(req, res, next) {
  if (!req.params.slug) return next(new Error('No event slug.'));
  req.collections.events.findOne({slug: req.params.slug}, function(error, event) {
    if (error || !event) return next(error);
    if (!event.published && !req.session.admin) return res.render('401');
    var showdown = require('showdown');
    event.text = new showdown.Converter({headerLevelStart: 4, simplifiedAutoLink: true, simpleLineBreaks: true}).makeHtml(event.text);
    res.render('event', event);
  });
};

/*
 * GET a page with events.
 */

exports.page = function(req, res, next) {
  if (!req.params.page) return next(new Error('No page.'));
  var page = req.params.page;
  var start = (page - 1) * itemsPerPage;
  var end = page * itemsPerPage;  
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
    if (error) return next(error);
    res.render('includes/gridEvents.jade', {events: events.slice(start, end), layout: false});
  });
};

/*
 * GET a page with events filtered by a country.
 */

exports.pageCountry = function(req, res, next) {
  if (!req.params.page) return next(new Error('No page.'));
  if (!req.params.country) return next(new Error('No country.'));
  var page = req.params.page;
  var start = (page - 1) * itemsPerPage;
  var end = page * itemsPerPage;  
  req.collections.events.find({published: true, country: req.params.country}, {sort: {_id: 1}}).toArray(function(error, events){
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
    if (error) return next(error);
    res.render('includes/gridEvents.jade', {events: events.slice(start, end), layout: false, country: req.params.country});
  });
};

/*
 * GET events API.
 */

exports.list = function(req, res, next) {
  req.collections.events.find({}).toArray(function(error, events) {
    if (error) return next(error);
    res.send({events:events});
  });
};


/*
 * POST event API.
 */

exports.add = function(req, res, next) {
  if (!req.body.event) return next(new Error('No event payload.'));
  var event = req.body.event;
  event.published = false;
  req.collections.events.insert(event, function(error, eventResponse) {
    if (error) return next(error);
    res.send(eventResponse);
  });
};


/*
 * PUT event API.
 */

exports.edit = function(req, res, next) {
  if (!req.params.id) return next(new Error('No event ID.'));
  req.collections.events.updateById(req.params.id, {$set: req.body.event}, function(error, count) {
    if (error) return next(error);
    res.send({affectedCount: count});
  });
};

/*
 * GET event EDIT page.
 */

exports.change = function(req, res, next) {
  if (!req.params.slug) return next(new Error('No event slug.'));
  req.collections.events.findOne({slug: req.params.slug}, function(error, event) {
    if (error) return next(error);
    res.render('change', event);
  });
};

/*
 * DELETE event API.
 */

exports.delete = function(req, res, next) {
  if (!req.params.id) return next(new Error('No event ID.'));
  req.collections.events.removeById(req.params.id, function(error, count) {
    if (error) return next(error);
    res.send({affectedCount: count});
  });
};


/*
 * GET event POST page.
 */

exports.post = function(req, res, next) {
  if (!req.body.title)
  res.render('post', {title: '', startdate: '', enddate: '', starttime: '', endtime: '', country: '', place: '', text: ''});
};

/*
 * POST event POST page.
 */

exports.postEvent = function(req, res, next) {
  verifyRecaptcha(req.body["g-recaptcha-response"], function(success) {
    if (success) {
      if (!req.body.title || !req.body.startdate || !req.body.enddate || !req.body.country || !req.body.place || !req.body.text) {
        if (req.body.title){ title=req.body.title; } else { title=''; }
        if (req.body.startdate){ startdate=req.body.startdate; } else { startdate=''; }
        if (req.body.enddate){ enddate=req.body.enddate; } else { enddate=''; }
        if (req.body.starttime){ starttime=req.body.starttime; } else { starttime=''; }
        if (req.body.endtime){ endtime=req.body.endtime; } else { endtime=''; }
        if (req.body.country){ country=req.body.country; } else { country=''; }
        if (req.body.place){ place=req.body.place; } else { place=''; }        
        if (req.body.text){ text=req.body.text; } else { text=''; }
        return res.render('post', 
        { error: "Будь-ласка, заповніть всі необхідні поля нижче.", alertState: "failure",
        title: title, startdate: startdate, enddate: enddate, starttime: starttime, endtime: endtime, country: country, place: place, text: text});
      }
      var event = {
        title: req.body.title,
        slug: (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase(),
        country: req.body.country,
        place: req.body.place,
        startdate: req.body.startdate,
        enddate: req.body.enddate,
        starttime: req.body.starttime,
        endtime: req.body.endtime,
        text: req.body.text,
        published: false
      };
      req.collections.events.insert(event, function(error, eventResponse) {
        if (error) return next(error);
        res.render('post', {error: "Дякуємо, ви щойно додали новий анонс. Він буде опублікований на сайті після перевірки Адміністрацією.", alertState: "success",
        title: '', startdate: '', enddate: '', starttime: '', endtime: '', country: '', place: '', text: ''});
      });
      var data = {
        from: 'Ukrexpat Watchdog <watchdog@ukrexpat.com>',
        to: 'myusername@mymail.com',
        subject: 'New Event Submission Notification',
        text: `You've got a new event submission with a title '${req.body.title}', please review it on https://ukrexpat.com/events page.`
      };
      mailgun.messages().send(data, function (error, body) {
        //console.log(body);
      });
    } else {
        if (req.body.title){ title=req.body.title; } else { title=''; }
        if (req.body.startdate){ startdate=req.body.startdate; } else { startdate=''; }
        if (req.body.enddate){ enddate=req.body.enddate; } else { enddate=''; }
        if (req.body.starttime){ starttime=req.body.starttime; } else { starttime=''; }
        if (req.body.endtime){ endtime=req.body.endtime; } else { endtime=''; }
        if (req.body.country){ country=req.body.country; } else { country=''; }
        if (req.body.place){ place=req.body.place; } else { place=''; }        
        if (req.body.text){ text=req.body.text; } else { text=''; }
        return res.render('post', 
        { error: "Поставте галочку у верифікаційному полі reCAPTCHA.", alertState: "failure",
        title: title, startdate: startdate, enddate: enddate, starttime: starttime, endtime: endtime, country: country, place: place, text: text});
    }
  });
};

/*
 * POST event CHANGE page.
 */

exports.changeEvent = function(req, res, next) {
    if (!req.body.title || !req.body.startdate || !req.body.enddate || !req.body.country || !req.body.place || !req.body.text) {
      if (req.body.title){ title=req.body.title; } else { title=''; }      
      if (req.body.startdate){ startdate=req.body.startdate; } else { startdate=''; }
      if (req.body.enddate){ enddate=req.body.enddate; } else { enddate=''; }
      if (req.body.starttime){ starttime=req.body.starttime; } else { starttime=''; }
      if (req.body.endtime){ endtime=req.body.endtime; } else { endtime=''; }
      if (req.body.country){ country=req.body.country; } else { country=''; }
      if (req.body.place){ place=req.body.place; } else { place=''; }        
      if (req.body.text){ text=req.body.text; } else { text=''; }
      return res.render('change', 
      { error: "Будь-ласка, заповніть всі необхідні поля нижче.", alertState: "failure",
      title: title, startdate: startdate, enddate: enddate, starttime: starttime, endtime: endtime, country: country, place: place, text: text});
    }
    var event = {
      title: req.body.title,
      slug: req.body.slug,
      country: req.body.country,
      place: req.body.place,
      startdate: req.body.startdate,
      enddate: req.body.enddate,
      starttime: req.body.starttime,
      endtime: req.body.endtime,
      text: req.body.text,
      published: JSON.parse(req.body.published)
    };
    req.collections.events.updateById(req.body.id, event, function(error, count) {
      if (error) return next(error);
      req.collections.events.findOne({slug: req.body.slug}, function(error, event) {
        if (error) return next(error);
        res.render('change', event);
      });
    });
};

/*
 * GET admin page.
 */

exports.admin = function(req, res, next) {
  req.collections.events.find({},{sort: {_id: 1}}).toArray(function(error, events) {
    events.sort(function(a,b){
      var aparts = a.enddate.split('.');
      var bparts = b.enddate.split('.');
      return new Date(aparts[2],aparts[1]-1,aparts[0]) - new Date(bparts[2],bparts[1]-1,bparts[0]);
    });
    if (error) return next(error);
    var maxPages = Math.ceil(events.length / itemsPerPage);
    res.render('admin', {events: events.slice(0, itemsPerPage), maxPages: maxPages});
  });
};

/*
 * GET admin page with events.
 */

exports.pageAdmin = function(req, res, next) {
  if (!req.params.page) return next(new Error('No page.'));
  var page = req.params.page;
  var start = (page - 1) * itemsPerPage;
  var end = page * itemsPerPage;  
  req.collections.events.find({},{sort: {_id: 1}}).toArray(function(error, events) {
    events.sort(function(a,b){
      var aparts = a.enddate.split('.');
      var bparts = b.enddate.split('.');
      return new Date(aparts[2],aparts[1]-1,aparts[0]) - new Date(bparts[2],bparts[1]-1,bparts[0]);
    });
    if (error) return next(error);
    res.render('includes/gridEventsAdmin.jade', {events: events.slice(start, end), layout: false});
  });
};
