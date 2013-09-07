
var stackWhoConfig = require('./common/config.js');
var dbUrl = stackWhoConfig.dbEndpoint;

var nano = require('nano')(dbUrl);
var dbName = 'test';
var db = nano.use(dbName);

var _ = require('lodash');

var express = require('express');
var app = express();

var ChunkFetcher = require('./chunkFetcher/chunkFetcher.js');
var CouchDbStore = require('./chunkFetcher/couchdbStore.js');
var userTagInterceptor = require('./interceptor/userTagInterceptor.js');
var https = require('https');
var unicodeEnd = '%EF%BF%B0'; //\ufff0

var users = [];
var state = 'booting';

//it's lame to have that here. We should find a different solution
var designDoc =     {
                       "language": "javascript",
                       "views": {
                           "by_location": {
                               "map": "function(doc) { \n  if (doc.location != null){\n    emit(doc.location.toLowerCase(), doc);\n    doc.location.split(/\\W+/).forEach(function(word){ \n      emit(word.toLowerCase(), doc) \n    }); \n  } \n}"
                           },
                           "by_reputation": {
                               "map": "function(doc) { if (doc.reputation != null) emit(doc.reputation, doc) }"
                           },
                           "by_location_tags": {
                               "map": "function(doc) { if (doc.top_tags) { for(i=0;i<doc.top_tags.length;i++) { emit([doc.top_tags[i].tag_name, doc.location], doc); } } }"
                           }
                       }
                    };

app.use(express.logger());

var isValid = function(request, response){
  if (request.query.pw !== stackWhoConfig.adminPassword){
    response.send('wrong password');
    return false;
  }
  return true;
};

app.get('/rebuildIndex', function(request, response) {

  if(!isValid(request, response)){
    return;
  }

  response.send('rebuilding index...');

  // clean up the database we created previously
    nano.db.destroy(dbName, function() {
      // create a new database
      nano.db.create(dbName, function() {

        //add the design document containing our views
        db.insert(designDoc, '_design/userViews');

        new ChunkFetcher({
          url: 'http://api.stackoverflow.com/1.1/users?',
          key: 'users',
          pageSize: 100,
          maxLength: 20000,
          interceptor: userTagInterceptor,
          store: CouchDbStore
        })
        .fetch()
        .then(function(users){
          console.log(users);
        });
      });
    });
});

app.get('/resumeIndexBuild', function(request, response) {

  if(!isValid(request, response)){
    return;
  }

  //get the user where we left off
  var url = dbUrl + '/test/_design/userViews/_view/by_reputation?limit=1';

  https.get(url, function(res) {
    var pageData = "";
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      pageData += chunk;
    });

    res.on('end', function(){

      var obj = JSON.parse(pageData);
      var data = {
        users: []
      };
      if (obj && obj.rows && obj.rows.length === 1){
        var user = obj.rows[0].value;
        response.send('resuming index build at user ' + user.user_id + '(' + user.reputation +  ')...');

        new ChunkFetcher({
          url: 'http://api.stackoverflow.com/1.1/users?&max=' + user.reputation,
          key: 'users',
          pageSize: 100,
          maxLength: 20000,
          interceptor: userTagInterceptor,
          store: CouchDbStore
        })
        .fetch()
        .then(function(users){
          console.log(users);
        });
      }
      else{
        response.send('nothing to resume run rebuildIndex instead');
      }
    });
  });
});

var createFindByLocation = function(locations){
  return function(user){

    if (!user.location){
      return false;
    }

    var matchesLocation = _.any(locations, function(location){
      return user.location.toLowerCase().indexOf(location) > -1;
    });

    return matchesLocation;
  };
};

var createFindByTopAnswers = function(tags){
  return function(user){

    if (!user.top_tags){
      return false;
    }

    var matchesTopAnswers =  _.any(user.top_tags, function(userTag){
                                return _.any(tags, function(tag){
                                  return userTag.tag_name.toLowerCase().indexOf(tag) > -1;
                                });
                              });
    return matchesTopAnswers;
  };
};

var locationRegex = /location:(([a-z]|[A-Z]|[0-9]| |,)+)/,
    answersRegex  = /answers:(([a-z]|[A-Z]|[0-9]| |,)+)/;

app.get('/users', function(request, response){

  var data = {
    users: []
  };

  var locationMatch = request.query.searchString.match(locationRegex);
  var answerTagsMatch = request.query.searchString.match(answersRegex);

  var sanitize = function(word){
    return word && word.trim().toLowerCase();
  };

  var empty = function(word){
    return word && word.length > 0;
  };

  var locations   = locationMatch && locationMatch.length > 1 && 
                    locationMatch[1]
                      .split(',')
                      .map(sanitize)
                      .filter(empty) || [];

  var answerTags  = answerTagsMatch && answerTagsMatch.length > 1 && 
                    answerTagsMatch[1]
                      .split(',')
                      .map(sanitize)
                      .filter(empty) || [];

  if (_.all([locations, answerTags], function(col){ return !col || col.length === 0; })){
    response.json(data);
    return;
  }

  var filter = [];

  if (locations.length > 0){
    filter.push(createFindByLocation(locations));
  }

  if (answerTags.length > 0){
    filter.push(createFindByTopAnswers(answerTags));
  }

  var matches = users.filter(function(user){
                  return _.all(filter, function(fn){
                    return fn(user);
                  });
                });

  data.users = matches;

  response.json(data);
});

https.get(dbUrl + '/test/_all_docs?include_docs=true', function(res){
  var pageData = "";
  res.setEncoding('utf8');
  res.on('data', function (chunk) {
    state = 'building in memory db';
    pageData += chunk;
  });

  res.on('end', function(){
    console.log('end');
    var obj = JSON.parse(pageData);
    if (obj && obj.rows){
      obj.rows.forEach(function(row){
        users.push(row.doc);
        console.log(users.length);
        state = 'transforming';
      });
      console.log(users.length);
      state = 'ready';
    }
  });
});

app.get('/state', function(request, response) {
  response.send(state);
});

app.configure(function(){
  app.use('/', express.static(__dirname + '/../client/src'));
  app.use('/libs', express.static(__dirname + '/../client/libs'));
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log('Listening on ' + port);
});