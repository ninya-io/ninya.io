var https = require('https');

var InMemoryUserDatabase = function(dbUrl, limit){

    var self = {};
    var data = {
            users: [],
            state: 'not started'
        };

    limit = !limit ? '' : '&limit=' + limit;

    //Build up an in memory db of all users.
    //This will be used for the lookups by the client
    https.get(dbUrl + '/test/_all_docs?include_docs=true' + limit, function(res){
        var pageData = "";
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            data.state = 'building in memory db';
            pageData += chunk;
        });

        res.on('end', function(){
            console.log('end');
            var obj = JSON.parse(pageData);
            if (obj && obj.rows){
                obj.rows.forEach(function(row){
                    data.users.push(row.doc);
                    console.log(data.users.length);
                    data.state = 'transforming';
                });
                console.log(data.users.length);
                data.state = 'ready';
            }
        });
    });

    return data;

};

module.exports = InMemoryUserDatabase;