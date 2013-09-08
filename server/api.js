module.exports = function(app) {

    var stackWhoConfig = require('./common/config.js');
    var dbUrl = stackWhoConfig.dbEndpoint;

    var nano = require('nano')(dbUrl);
    var dbName = 'test';
    var db = nano.use(dbName);

    var ChunkFetcher = require('./chunkFetcher/chunkFetcher.js');
    var CouchDbStore = require('./chunkFetcher/couchdbStore.js');
    var InMemoryUserDatabase = require('./inMemoryUserDatabase.js');
    var userTagInterceptor = require('./interceptor/userTagInterceptor.js');
    var Lexer = require('./lexer.js');
    var UserFilter = require('./userFilter.js');
    var https = require('https');
    var unicodeEnd = '%EF%BF%B0'; //\ufff0

    var lexer = new Lexer();
    var userFilter = new UserFilter();
    var inMemoryUserDb = new InMemoryUserDatabase(dbUrl, stackWhoConfig.inMemoryDbRowLimit);

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

        var data = {
            users: []
        };

        var token = lexer.tokenize(request.query.searchString);

        var locations   = token.locations;
        var answerTags  = token.answerTags;

        data.users = userFilter.filter(inMemoryUserDb.users, locations, answerTags);

        response.json(data);
    });

    app.get('/state', function(request, response) {
        response.send(inMemoryUserDb.state);
    });

    app.get('/users', function(request, response){

        var data = {
            users: []
        };

        var token = lexer.tokenize(request.query.searchString);

        var locations   = token.locations;
        var answerTags  = token.answerTags;

        data.users = userFilter.filter(users, locations, answerTags);

        response.json(data);
    });

};