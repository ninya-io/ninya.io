// var SearchService = require('../searchService.js');

// var assert = require("assert")
// describe('SearchService', function(){
//   describe('#search', function(){
//     it('should return sql', function(){
//         var service = new SearchService();
//         var sql = service.search({
//             answerTags: ['layout', 'android'],
//             locations: ['Germany', 'WI']
//         });

//         var expected = 'SELECT * FROM users WHERE (\'layout\' in (Select value->>\'tag_name\' FROM json_array_elements("user"->\'top_tags\')) OR \'android\' in (Select value->>\'tag_name\' FROM json_array_elements("user"->\'top_tags\'))) AND ("user"->>\'location\' LIKE \'%Germany%\' OR "user"->>\'location\' LIKE \'%WI%\')';

//         assert.equal(expected, sql);
//     })
//   })
// })