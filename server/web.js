
var stackWhoConfig = require('./common/config.js');
var dbUrl = stackWhoConfig.dbEndpoint;

var nano = require('nano')(dbUrl);
var dbName = 'test';
var db = nano.use(dbName);

var express = require('express');
var app = express();

var ChunkFetcher = require('./chunkFetcher/chunkFetcher.js');
var CouchDbStore = require('./chunkFetcher/couchdbStore.js');
var userTagInterceptor = require('./interceptor/userTagInterceptor.js');
var https = require('https');
var unicodeEnd = '%EF%BF%B0'; //\ufff0

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

app.get('/users', function(request, response){
  var url = dbUrl,
      location = request.query.location && request.query.location.toLowerCase();

  //we should measure the performance with an temp view.
  //Since we are only dealing with a maximum of 30,000 records, it might be fine to use
  //that over a real view. This would allow us to bring back complex regex & wildcard search
  //See: http://stackoverflow.com/questions/5509911/how-do-i-create-a-like-filter-view-in-couchdb/9286307#9286307
  if (request.query.location && request.query.top_answers){
    url += '/test/_design/userViews/_view/by_location_tags?startkey=["' + request.query.top_answers + '", "' + location + '"]&endkey=["' + request.query.top_answers + '", "' + location + unicodeEnd + '"]';
  }
  else if (request.query.location){
    url += '/test/_design/userViews/_view/by_location?startkey="' + location + '"&endkey="' + location + unicodeEnd + '"';
  }
  else {
    response.send('not implemented yet');
    return;
  }
  
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
      if (obj && obj.rows){
        data.users = obj.rows.map(function(row){
          return row.value;
        });
      }


      response.json(data);
    });
  });

});

app.configure(function(){
  app.use('/', express.static(__dirname + '/../client/src'));
  app.use('/libs', express.static(__dirname + '/../client/libs'));
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log('Listening on ' + port);
});