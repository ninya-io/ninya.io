var Lexer = function(){

    var self = {};

    var locationRegex = /location:(((?!answers:)[-A-Za-z0-9, ])+)/,
        answersRegex  = /answers:(((?!location:)[-A-Za-z0-9, ])+)/;

    self.tokenize = function(str){

        var locationMatch = str.match(locationRegex);
        var answerTagsMatch = str.match(answersRegex);

        var token = {
            locations: [],
            answerTags: []
        };

        var sanitize = function(word){
            return word && word.trim().toLowerCase();
        };

        var empty = function(word){
            return word && word.length > 0;
        };

        token.locations     =   locationMatch && locationMatch.length > 1 && 
                                locationMatch[1]
                                .split(',')
                                .map(sanitize)
                                .filter(empty) || [];

        token.answerTags   =   answerTagsMatch && answerTagsMatch.length > 1 && 
                                answerTagsMatch[1]
                                .split(',')
                                .map(sanitize)
                                .filter(empty) || [];

        return token;
    };

    return self;
};

module.exports = Lexer;
