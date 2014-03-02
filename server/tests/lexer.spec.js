var Lexer = require('../lexer.js');

var assert = require('assert');
var should = require('should');

describe('Lexer', function(){
  describe('#tokenize', function(){

    it('should handle one single location', function(){

        var lexer = new Lexer();
        var token = lexer.tokenize('location: Hannover')

        token.locations.should.eql(['hannover']);
    });
    

    it('should handle one single tag', function(){

        var lexer = new Lexer();
        var token = lexer.tokenize('answers: Java')

        token.answerTags.should.eql(['java']);
    });

    it('should handle multiple locations and tags', function(){

        var lexer = new Lexer();
        var token = lexer.tokenize('location: Hannover, Berlin answers: java, nodejs')

        token.locations.should.eql(['hannover', 'berlin']);
        token.answerTags.should.eql(['java', 'nodejs']);
    });

    it('should ignore casing', function(){

        var lexer = new Lexer();
        var token = lexer.tokenize('LOCATION: Hannover, Berlin answers: java, nodejs')

        token.locations.should.eql(['hannover', 'berlin']);
        token.answerTags.should.eql(['java', 'nodejs']);
    });


    it('should handle multiple tags and locations', function(){

        var lexer = new Lexer();
        var token = lexer.tokenize('answers: java, nodejs location: Hannover, Berlin')

        token.locations.should.eql(['hannover', 'berlin']);
        token.answerTags.should.eql(['java', 'nodejs']);
    });

    it('should ignore spacing', function(){

        var lexer = new Lexer();
        var token = lexer.tokenize('answers:java,nodejs    location:   Hannover,   Berlin')

        token.locations.should.eql(['hannover', 'berlin']);
        token.answerTags.should.eql(['java', 'nodejs']);
    });

    it('should handle umlauts', function(){

        var lexer = new Lexer();
        var token = lexer.tokenize('location: Zürich, Göttingen')

        token.locations.should.eql(['zürich', 'göttingen']);
    });

    it('should handle special chars', function(){

        var lexer = new Lexer();
        var token = lexer.tokenize('answers: c#')

        token.answerTags.should.eql(['c#']);
    });
  })
})