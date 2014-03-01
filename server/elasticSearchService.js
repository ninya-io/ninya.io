var Q = require('q');
var DefaultSearchParamBuilder = require('./defaultSearchParamBuilder.js');
var elasticSearch = require('elasticsearch');
var stackWhoConfig = require('./common/config.js');

var SearchService = function(){

    var defaultSearchParamBuilder = new DefaultSearchParamBuilder();

    var esClient = elasticSearch.Client({
        hosts: [
            stackWhoConfig.elasticsearchEndpoint
        ]
    });

    var search = function(searchOptions, fn){
        var deferred = Q.defer();

        var searchParams = defaultSearchParamBuilder.createSearchParam(searchOptions);

        var searchOptions = {
            index: 'production',
            type: 'user',
            size: 100,
            body: searchParams
        };

        return esClient
            .search(searchOptions)
            .then(function(response){
                return response.hits.hits.map(function(hit){
                    return hit._source;
                });
            });
    };

    return {
        search: search
    }
};

module.exports = SearchService;