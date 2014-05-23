module.exports = function(app) {

    var stackWhoConfig = require('./common/config.js');

    var Lexer = require('./lexer.js');
    var ElasticSearchService = require('./elasticSearchService.js');
    var https = require('https');

    var lexer = new Lexer();
    var searchService = new ElasticSearchService();

    app.get('/users', function(request, response){

        var data = {
            users: []
        };

        var token = lexer.tokenize(request.query.searchString);

        if (token.answerTags.length === 0 && token.locations.length === 0){
            response.json(data);
            return;
        }

        searchService
            .search(token)
            .then(function(users){
                data.users = users;
                response.json(data);
            });
    });


    app.get('/', function(request, response){

        var isProduction = process.env.NODE_ENV === 'production';

        if (request.query.q){
            var token = lexer.tokenize(request.query.q);

            searchService
                .search(token)
                .then(function(users){
                    response.render('index', {
                        users: users,
                        locations: token.locations.join(', '),
                        hasLocations: token.locations.length > 0,
                        skills: token.answerTags.join(', '),
                        hasSkills: token.answerTags.length > 0,
                        serverRendered: users.length > 0,
                        isProduction: isProduction
                    });
                });
        }
        else {
            response.render('index', {
                users: [],
                serverRendered: false,
                hasLocations: false,
                hasSkills: false,
                isProduction: isProduction
            })
        }

    });
};
