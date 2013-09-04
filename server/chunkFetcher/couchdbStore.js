var stackWhoConfig = require('../common/config.js');
var nano = require('nano')(stackWhoConfig.dbEndpoint);
var dbName = 'test';
var db = nano.use(dbName);

var CouchDbStore = function(){
    var self = {};
    var data = [];
    var length = 0;
    var counter = 0;

    self.getAll = function(){
        return [];
    };

    self.getLength = function(){
        return length;
    };

    self.append = function(chunk){
        data.push.apply(data, chunk);
        length += chunk.length;

        var test = nano.use(dbName);

        chunk.forEach(function(entity){
            test.insert(entity, entity.user_id + '', function(error, body, header){
                if (error) {
                  console.log('error while writing to db', error.message);
                  return;
                }
                counter++;
                console.log(counter + '. entry written at' + new Date());
            });
        });
    };

    return self;
};

module.exports = CouchDbStore;