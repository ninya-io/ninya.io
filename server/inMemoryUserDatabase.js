var https = require('https');

var InMemoryUserDatabase = function(dbUrl, limit){

    var self = {};
    var users = [],
        state = 'not started';

    limit = !limit ? '' : '&limit=' + limit;

    //Build up an in memory db of all users.
    //This will be used for the lookups by the client
    https.get(dbUrl + '/test/_all_docs?include_docs=true' + limit, function(res){
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

    return {
        users: users,
        state: state
    };

};

module.exports = InMemoryUserDatabase;