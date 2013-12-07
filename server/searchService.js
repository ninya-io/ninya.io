var pg = require('pg').native;
var Q = require('q');
var stackWhoConfig = require('./common/config.js');

var SearchService = function(){

    var search = function(searchOptions, fn){
        var deferred = Q.defer();

        var sql = 'SELECT * FROM users WHERE ';
        var sqlSuffix = ' ORDER By ("user"->>\'reputation\')::int DESC';

        var answerTagsCount = 0;
        var answerTagsSql = '';

        searchOptions.answerTags.forEach(function(tag){
            answerTagsCount++;
            var or = answerTagsCount > 1 ? ' OR ' :'';
            answerTagsSql += or + '\'{"' + tag + '"}\'::text[] <@ (json_val_arr("user"->\'top_tags\', \'tag_name\'))';
        });

        if (answerTagsSql){
            answerTagsSql = '(' + answerTagsSql + ')';
        }

        var locationCount = 0;
        var locationSql = '';
        searchOptions.locations.forEach(function(location){
            locationCount++;
            var or = locationCount > 1 ? ' OR ' :'';
            locationSql += or + 'lower("user"->>\'location\') LIKE \'%' + location + '%\'';
        });

        if(locationSql){
            locationSql = '(' + locationSql + ')';
        }

        var combinedSql = answerTagsSql && locationSql ? answerTagsSql + ' AND ' + locationSql :
                          answerTagsSql ? answerTagsSql : locationSql;

        combinedSql = combinedSql + sqlSuffix;

        pg.connect(stackWhoConfig.dbConnectionString, function(err, client, done) {
            if(err) {
                deferred.reject(err);
                return;
            }
            client.query(sql + combinedSql, function(err, result) {
                done();

                if(err) {
                    return deferred.reject(err);
                }

                var rows = result.rows.map(function(obj){
                    return obj.user;
                })

                deferred.resolve(rows);
            });
        });

        return deferred.promise;
    };

    return {
        search: search
    }
};

module.exports = SearchService;