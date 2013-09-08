var _ = require('lodash');

var UserFilter = function(){

    var self = {};


    var createFindByLocation = function(locations){
        return function(user){

            if (!user.location){
                return false;
            }

            var matchesLocation =   _.any(locations, function(location){
                                        return user.location.toLowerCase().indexOf(location) > -1;
                                    });

            return matchesLocation;
        };
    };

    var createFindByTopAnswers = function(tags){
        return function(user){

            if (!user.top_tags){
                return false;
            }

            var matchesTopAnswers =     _.any(user.top_tags, function(userTag){
                                            return _.any(tags, function(tag){
                                                return userTag.tag_name.toLowerCase().indexOf(tag) > -1;
                                            });
                                        });
            return matchesTopAnswers;
        };
    };

    self.filter = function(users, locations, answerTags){

        if (_.all([locations, answerTags], function(col){ return !col || col.length === 0; })){
            return [];
        }

        var filter = [];

        if (locations.length > 0){
            filter.push(createFindByLocation(locations));
        }

        if (answerTags.length > 0){
            filter.push(createFindByTopAnswers(answerTags));
        }

        var matches =   users.filter(function(user){
                            return _.all(filter, function(fn){
                                return fn(user);
                            });
                        });

        return matches;

    };

    return self;

};

module.exports = UserFilter;