var itemsPerPage = 4;

/*
 * GET articles page.
 */

exports.index = function(req, res, next){
  req.collections.articles.find({published: true}, {sort: {_id: 1}}).toArray(function(error, articles){
    articles.sort(function(a,b){
      var aparts = a.date.split('.');
      var bparts = b.date.split('.');
      return new Date(bparts[2],bparts[1]-1,bparts[0]) - new Date(aparts[2],aparts[1]-1,aparts[0]);
    });
    if (error) return next(error);
    var maxPages = Math.ceil(articles.length / itemsPerPage);
    var allTags = [];
    var i;
    for (i = 0; i < articles.length; i++) { 
      var tags =  articles[i].tags.split(',');
      tags.forEach(function (item) { allTags.push(item.trim().toLowerCase()); });
    }
    var uniqueTags = [...new Set(allTags)].sort(Intl.Collator().compare);
    res.render('articles', { articles: articles.slice(0, itemsPerPage), uniqueTags: uniqueTags, maxPages: maxPages, title: "Всі Статті"});
  })
};

/*
 * GET articles page filtered by category.
 */

exports.indexCat = function(req, res, next){
  if (!req.params.category) return next(new Error('No article category.'));
  req.collections.articles.find({published: true, category: req.params.category}, {sort: {_id: 1}}).toArray(function(error, articles){
    articles.sort(function(a,b){
      var aparts = a.date.split('.');
      var bparts = b.date.split('.');
      return new Date(bparts[2],bparts[1]-1,bparts[0]) - new Date(aparts[2],aparts[1]-1,aparts[0]);
    });
    if (error) return next(error);
    var maxPages = Math.ceil(articles.length / itemsPerPage);
    var allTags = [];
    var i;
    for (i = 0; i < articles.length; i++) { 
      var tags =  articles[i].tags.split(',');
      tags.forEach(function (item) { allTags.push(item.trim().toLowerCase()); });
    }
    var uniqueTags = [...new Set(allTags)].sort(Intl.Collator().compare);
    res.render('articles', { articles: articles.slice(0, itemsPerPage), uniqueTags: uniqueTags, maxPages: maxPages, title: "Категорія: "+req.params.category, category: req.params.category});
  })
};

/*
 * GET articles page filtered by tag.
 */

exports.indexTag = function(req, res, next){
  if (!req.params.tag) return next(new Error('No article tag.'));
  var regex = new RegExp([".*", req.params.tag, ".*"].join(""), "i");
  req.collections.articles.find({published: true, tags: regex}, {sort: {_id: 1}}).toArray(function(error, articles){
    articles.sort(function(a,b){
      var aparts = a.date.split('.');
      var bparts = b.date.split('.');
      return new Date(bparts[2],bparts[1]-1,bparts[0]) - new Date(aparts[2],aparts[1]-1,aparts[0]);
    });
    if (error) return next(error);
    var maxPages = Math.ceil(articles.length / itemsPerPage);
    var allTags = [];
    var i;
    for (i = 0; i < articles.length; i++) { 
      var tags =  articles[i].tags.split(',');
      tags.forEach(function (item) { allTags.push(item.trim().toLowerCase()); });
    }
    var uniqueTags = [...new Set(allTags)].sort(Intl.Collator().compare);
    res.render('articles', { articles: articles.slice(0, itemsPerPage), maxPages: maxPages, uniqueTags: uniqueTags, title: "Статті", tag: req.params.tag});
  })
};

/*
 * GET article page.
 */

exports.show = function(req, res, next) {
  if (!req.params.slug) return next(new Error('No article slug.'));
  req.collections.articles.findOne({slug: req.params.slug}, function(error, article) {
    if (error || !article) return next(error);
    if (!article.published && !req.session.admin) return res.render('401');
    var showdown = require('showdown');
    article.text = new showdown.Converter({headerLevelStart: 4, simplifiedAutoLink: true, simpleLineBreaks: true}).makeHtml(article.text);
    res.render('article', article);
  });
};

/*
 * GET a page with articles.
 */

exports.page = function(req, res, next) {
  if (!req.params.page) return next(new Error('No page.'));
  var page = req.params.page;
  var start = (page - 1) * itemsPerPage;
  var end = page * itemsPerPage; 
  req.collections.articles.find({published: true}, {sort: {_id: 1}}).toArray(function(error, articles){
    articles.sort(function(a,b){
      var aparts = a.date.split('.');
      var bparts = b.date.split('.');
      return new Date(bparts[2],bparts[1]-1,bparts[0]) - new Date(aparts[2],aparts[1]-1,aparts[0]);
    });
    if (error) return next(error);
    res.render('includes/gridArticles.jade', {articles: articles.slice(start, end), layout: false});
  });
};

/*
 * GET a page with articles filtered by a tag.
 */

exports.pageTag = function(req, res, next) {
  if (!req.params.page) return next(new Error('No page.'));
  if (!req.params.tag) return next(new Error('No tag.'));
  var page = req.params.page;
  var start = (page - 1) * itemsPerPage;
  var end = page * itemsPerPage;   
  var regex = new RegExp([".*", req.params.tag, ".*"].join(""), "i");
  req.collections.articles.find({published: true, tags: regex}, {sort: {_id: 1}}).toArray(function(error, articles){
    articles.sort(function(a,b){
      var aparts = a.date.split('.');
      var bparts = b.date.split('.');
      return new Date(bparts[2],bparts[1]-1,bparts[0]) - new Date(aparts[2],aparts[1]-1,aparts[0]);
    });
    if (error) return next(error);
    res.render('includes/gridArticles.jade', {articles: articles.slice(start, end), layout: false, tag: req.params.tag});
  });
};

/*
 * GET a page with articles filtered by a category.
 */

exports.pageCat = function(req, res, next) {
  if (!req.params.page) return next(new Error('No page.'));
  if (!req.params.category) return next(new Error('No category.'));
  var page = req.params.page;
  var start = (page - 1) * itemsPerPage;
  var end = page * itemsPerPage;     
  req.collections.articles.find({published: true, category: req.params.category}, {sort: {_id: 1}}).toArray(function(error, articles){
    articles.sort(function(a,b){
      var aparts = a.date.split('.');
      var bparts = b.date.split('.');
      return new Date(bparts[2],bparts[1]-1,bparts[0]) - new Date(aparts[2],aparts[1]-1,aparts[0]);
    });
    if (error) return next(error);
    res.render('includes/gridArticles.jade', {articles: articles.slice(start, end), layout: false, category: req.params.category});
  });
};

/*
 * GET articles API.
 */

exports.list = function(req, res, next) {
  req.collections.articles.find({}).toArray(function(error, articles) {
    if (error) return next(error);
    res.send({articles:articles});
  });
};


/*
 * POST article API.
 */

exports.add = function(req, res, next) {
  if (!req.body.article) return next(new Error('No article payload.'));
  var article = req.body.article;
  article.published = false;
  req.collections.articles.insert(article, function(error, articleResponse) {
    if (error) return next(error);
    res.send(articleResponse);
  });
};


/*
 * PUT article API.
 */

exports.edit = function(req, res, next) {
  if (!req.params.id) return next(new Error('No article ID.'));
  req.collections.articles.updateById(req.params.id, {$set: req.body.article}, function(error, count) {
    if (error) return next(error);
    res.send({affectedCount: count});
  });
};

/*
 * GET article EDIT page.
 */

exports.change = function(req, res, next) {
  if (!req.params.slug) return next(new Error('No article slug.'));
  req.collections.articles.findOne({slug: req.params.slug}, function(error, article) {
    if (error) return next(error);
    res.render('changeArticle', article);
  });
};

/*
 * DELETE article API.
 */

exports.delete = function(req, res, next) {
  if (!req.params.id) return next(new Error('No article ID.'));
  req.collections.articles.removeById(req.params.id, function(error, count) {
    if (error) return next(error);
    res.send({affectedCount: count});
  });
};


/*
 * GET article POST page.
 */

exports.post = function(req, res, next) {
  if (!req.body.title)
  res.render('postArticle', {title: '', category: '', tags: '', author: '', image: '', text: ''});
};

/*
 * POST article POST page.
 */

exports.postEvent = function(req, res, next) {
      if (!req.body.title || !req.body.category || !req.body.tags || !req.body.author || !req.body.image || !req.body.text ) {
        if (req.body.title){ title=req.body.title; } else { title=''; }
        if (req.body.category){ category=req.body.category; } else { category=''; }
        if (req.body.tags){ tags=req.body.tags; } else { tags=''; }
        if (req.body.author){ author=req.body.author; } else { author=''; }
        if (req.body.image){ image=req.body.image; } else { image=''; }
        if (req.body.text){ text=req.body.text; } else { text=''; }
        return res.render('postArticle', 
        { error: "Будь-ласка, заповніть всі необхідні поля нижче.", alertState: "failure",
        title: title, category: category, tags: tags, author: author, image: image, text: text});
      }
      var currentDate = new Date();
      var day = currentDate.getDate();
      var month = currentDate.getMonth() + 1;
      var year = currentDate.getFullYear();
      var article = {
        title: req.body.title,
        slug: (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase(),
        date: day + "." + month + "." + year,
        published: true,
        category: req.body.category,
        tags: req.body.tags,
        author: req.body.author,
        image: req.body.image,
        text: req.body.text        
      };
      req.collections.articles.insert(article, function(error, articleResponse) {
        if (error) return next(error);
        res.render('postArticle', {error: "Дякуємо, ви щойно додали нову статтю.", alertState: "success",
        title: '', category: '', tags: '', author: '', image: '', text: ''});
      });
};

/*
 * POST article CHANGE page.
 */

exports.changeEvent = function(req, res, next) {
    if (!req.body.title || !req.body.category || !req.body.tags || !req.body.author || !req.body.image || !req.body.text ) {    
      if (req.body.title){ title=req.body.title; } else { title=''; }
      if (req.body.category){ category=req.body.category; } else { category=''; }
      if (req.body.tags){ tags=req.body.tags; } else { tags=''; }
      if (req.body.author){ author=req.body.author; } else { author=''; }
      if (req.body.image){ image=req.body.image; } else { image=''; }
      if (req.body.text){ text=req.body.text; } else { text=''; }
      return res.render('changeArticle', 
      { error: "Будь-ласка, заповніть всі необхідні поля нижче.", alertState: "failure",
      title: title, category: category, tags: tags, author: author, image: image, text: text});
    }
    var article = {
      title: req.body.title,
      slug: req.body.slug,
      date: req.body.date,
      published: JSON.parse(req.body.published),
      category: req.body.category,
      tags: req.body.tags,
      author: req.body.author,
      image: req.body.image,
      text: req.body.text
    };
    req.collections.articles.updateById(req.body.id, article, function(error, count) {
      if (error) return next(error);
      req.collections.articles.findOne({slug: req.body.slug}, function(error, article) {
        if (error) return next(error);
        res.render('changeArticle', article);
      });
    });
};

/*
 * GET adminArticle page.
 */

exports.admin = function(req, res, next) {
  req.collections.articles.find({},{sort: {_id: 1}}).toArray(function(error, articles) {
    articles.sort(function(a,b){
      var aparts = a.date.split('.');
      var bparts = b.date.split('.');
      return new Date(bparts[2],bparts[1]-1,bparts[0]) - new Date(aparts[2],aparts[1]-1,aparts[0]);
    });
    if (error) return next(error);
    var maxPages = Math.ceil(articles.length / itemsPerPage);
    res.render('adminArticle', {articles: articles.slice(0, itemsPerPage), maxPages: maxPages});
  });
};

/*
 * GET admin page with articles.
 */

exports.pageAdmin = function(req, res, next) {
  if (!req.params.page) return next(new Error('No page.'));
  var page = req.params.page;
  var start = (page - 1) * itemsPerPage;
  var end = page * itemsPerPage;  
  req.collections.articles.find({}, {sort: {_id: 1}}).toArray(function(error, articles){
    articles.sort(function(a,b){
      var aparts = a.date.split('.');
      var bparts = b.date.split('.');
      return new Date(bparts[2],bparts[1]-1,bparts[0]) - new Date(aparts[2],aparts[1]-1,aparts[0]);
    });
    if (error) return next(error);
    res.render('includes/gridArticlesAdmin.jade', {articles: articles.slice(start, end), layout: false});
  });
};
