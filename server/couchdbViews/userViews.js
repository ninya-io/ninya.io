    {
        "language": "javascript", 
        "views": {
            "by_location": {
                "map": "function(doc) { if (doc.location != null) emit(doc.location, doc) }" 
            }, 
            "by_location_tags": {
                "map": "function(doc) { if (doc.top_tags) { for(i=0;i<doc.top_tags.length;i++) { emit([doc.top_tags[i].tag_name, doc.location], doc); } } }"
            }
        }
    }