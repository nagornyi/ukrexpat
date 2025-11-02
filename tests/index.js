var boot = require('../app').boot,
  shutdown = require('../app').shutdown,
  port = require('../app').port,
  superagent = require('superagent'),
  expect = require('expect.js');

var seedEvents = require('../db/events.json');

describe('server', function () {
  before(function () {
    boot();
  });

  describe('homepage', function(){
    it('should respond to GET',function(done){
      superagent
        .get('http://localhost:'+port)
        .end(function(res){
          expect(res.status).to.equal(200);
          done()
      })
    })
    it('should contain posts', function(done) {
      superagent
        .get('http://localhost:'+port)
        .end(function(res){
          seedEvents.forEach(function(item, index, list){
            if (item.published) {
              expect(res.text).to.contain('<h2><a href="/events/' + item.slug + '">' + item.title);
            } else {
              expect(res.text).not.to.contain('<h2><a href="/events/' + item.slug + '">' + item.title);
            }
            // console.log(item.title, res.text)
          })
          done()
      })
    });
  });

  describe('event page', function(){
    it('should display text', function(done){
      var n = seedEvents.length;
      seedEvents.forEach(function(item, index, list){
        superagent
          .get('http://localhost:'+port + '/events/' + seedEvents[index].slug)
          .end(function(res){
            if (item.published) {
              expect(res.text).to.contain(seedEvents[index].text);
            } else {
              expect(res.status).to.be(401);
            }
            // console.log(item.title)
            if (index + 1 === n ) {
              done();
            }
        })
      })
    })
  })
  after(function () {
    shutdown();
  });
});