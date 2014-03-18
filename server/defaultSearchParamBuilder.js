var DefaultSearchParamBuilder = function(){

    /*
    EXAMPLE SEARCH

    {
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
                                "_ninya_location_lowercase": "*germ*"
                            }
                        }, {
                            "wildcard": {
                                "_ninya_location_lowercase": "*usa*"
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
    }

    */


    var createSearchParam = function(searchOptions){

        var searchParam = {
            query: {
                bool: {
                    must: []
                }
            }
        };

        var sort = [],
            tagFilter = [],
            locationFilter = [];

        searchOptions.answerTags.forEach(function(tag){
            sort.push({
                prefix: {
                    tag_name: tag.toLowerCase()
                }
            });

            tagFilter.push({
                prefix: {
                    'top_tags.tag_name': tag.toLowerCase()
                }
            });
        });

        if (sort.length > 0) {
            searchParam.sort = [{
                answer_score: {
                    order: 'desc',
                    mode: 'sum',
                    nested_path: 'top_tags',
                    nested_filter: {
                        bool: {
                            should: sort
                        }
                    }
                }
            }]
        }
        else {
            searchParam.sort = [{
                reputation: {
                    order: 'desc'
                }
            }]
        }

        searchOptions.locations.forEach(function(tag){
            locationFilter.push({
                wildcard: {
                    _ninya_location_lowercase: '*' +  tag.toLowerCase() + '*'
                }
            });
        });

        if (locationFilter.length > 0) {
            searchParam.query.bool.must.push({
                bool: {
                    should: locationFilter,
                    minimum_should_match: 1
                }
            })
        }

        if (tagFilter.length > 0) {
            searchParam.query.bool.must.push({
                nested: {
                    path: 'top_tags',
                    query: {
                        bool: {
                            should: tagFilter
                        }
                    }
                }
            })
        }

        return searchParam;
    };

    return {
        createSearchParam: createSearchParam
    }
};

module.exports = DefaultSearchParamBuilder;