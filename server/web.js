var express = require('express');
var app = express();
var https = require('https');
var api = require('./api.js')(app);

app.use(express.logger());

app.configure(function(){
    app.use('/', express.static(__dirname + '/../client/src'));
    app.use('/libs', express.static(__dirname + '/../client/libs'));
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log('Listening on ' + port);
});