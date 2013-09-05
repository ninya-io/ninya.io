{
   "language": "javascript",
   "views": {
       "by_location": {
           "map": "function(doc) { \n  if (doc.location != null){\n    emit(doc.location.toLowerCase(), doc);\n    doc.location.split(/\\W+/).forEach(function(word){ \n      emit(word.toLowerCase(), doc) \n    }); \n  } \n}"
       },
       "by_reputation": {
           "map": "function(doc) { if (doc.reputation != null) emit(doc.reputation, doc) }"
       },
       "by_location_tags": {
           "map": "function(doc) { if (doc.top_tags) { for(i=0;i<doc.top_tags.length;i++) { emit([doc.top_tags[i].tag_name, doc.location], doc); } } }"
       }
   }
}