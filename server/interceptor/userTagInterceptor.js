var Q = require('q');
var ChunkFetcher = require('../chunkFetcher/chunkFetcher.js');

var userTagInterceptor = function(users){
  return Q.all(users.map(function(user){
    return new ChunkFetcher({
            url: 'http://api.stackoverflow.com/1.1/users/' + user.user_id + '/top-answer-tags?',
            key: 'top_tags',
            pageSize: 30,
            maxLength: 30
        })
        .fetch()
        .then(function(userTags){
            console.log('fetched ' + userTags.length + ' tags for user ' + user.user_id + ' at ' + new Date())
            user.top_tags = userTags;
            return user;
        });
  }));
};

module.exports = userTagInterceptor;