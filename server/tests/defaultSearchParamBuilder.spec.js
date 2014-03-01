var DefaultSearchParamBuilder = require('../defaultSearchParamBuilder.js');

var assert = require('assert');
var should = require('should');

describe('DefaultSearchParamBuilder', function(){
  describe('#createSearchParam', function(){
    it('should construct search params for multiple tags and locations', function(){
        var searchParamBuilder = new DefaultSearchParamBuilder();

        var param = searchParamBuilder.createSearchParam({
            answerTags: ['nod', 'android'],
            locations: ['Germ', 'USA']
        });

        //let's keep this in JSON notation for easier runability
        var expectedParam = {
            "sort": [{
                "answer_score": {
                    "order": "desc",
                    "mode": "sum",
                    "nested_path": "top_tags",
                    "nested_filter": {
                        "bool": {
                            "should": [{
                                "prefix": {
                                    "tag_name": "nod"
                                }
                            }, {
                                "prefix": {
                                    "tag_name": "android"
                                }
                            }]
                        }
                    }
                }
            }],
            "query": {
                "bool": {
                    "must": [{
                        "bool": {
                            "should": [{
                                "wildcard": {
                                    "location": "*germ*"
                                }
                            }, {
                                "wildcard": {
                                    "location": "*usa*"
                                }
                            }],
                            "minimum_should_match": 1
                        }
                    }, {
                        "nested": {
                            "path": "top_tags",
                            "query": {
                                "bool": {
                                    "should": [{
                                        "prefix": {
                                            "top_tags.tag_name": "nod"
                                        }
                                    }, {
                                        "prefix": {
                                            "top_tags.tag_name": "android"
                                        }
                                    }]
                                }
                            }
                        }
                    }]
                }
            }
        };

        param.should.eql(expectedParam);
    });

    it('should construct search params for multiple locations without tags', function(){
        var searchParamBuilder = new DefaultSearchParamBuilder();

        var param = searchParamBuilder.createSearchParam({
            answerTags: [],
            locations: ['Germ', 'USA']
        });

        //let's keep this in JSON notation for easier runability
        var expectedParam = {
            "sort": [{
                "reputation": {
                    "order": "desc"
                }
        }],
            "query": {
                "bool": {
                    "must": [{
                        "bool": {
                            "should": [{
                                "wildcard": {
                                    "location": "*germ*"
                                }
                            }, {
                                "wildcard": {
                                    "location": "*usa*"
                                }
                            }],
                            "minimum_should_match": 1
                        }
                    }]
                }
            }
        };

        param.should.eql(expectedParam);
    });
  })
})