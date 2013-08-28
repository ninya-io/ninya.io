var InMemoryStore = function(){
    var self = {};
    var data = [];

    self.getAll = function(){
        return data;
    };

    self.getLength = function(){
        return data.length;
    };

    self.append = function(chunk){
        data.push.apply(data, chunk);
    };

    return self;
};

module.exports = InMemoryStore;