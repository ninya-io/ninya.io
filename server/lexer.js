var Lexer = function(){

    var self = {};

    var ALL_LETTERS_AND_DIGITS = 'a-zA-Z0-9ÀÁÂÃÄÅàáâãäåÒÓÔÕÖØòóôõöøÈÉÊËèéêëÇçÌÍÎÏìíîïÙÚÛÜùúûüÿÑñ'

    var locationRegex = new RegExp('location:(((?!answers:)[' + ALL_LETTERS_AND_DIGITS + ', ])+)', 'i'),
        answersRegex  = new RegExp('answers:(((?!location:)[' + ALL_LETTERS_AND_DIGITS + ', ])+)', 'i');

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
