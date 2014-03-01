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
};