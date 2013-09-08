var express = require('express');
var app = express();

var api = require('./api.js')(app);

app.use(express.logger());

var startKeepAlive = function (){
    setInterval(function() {
        https.get('https://stackwho.herokuapp.com', function(res) {
            res.on('data', function(chunk) {
                try {
                    console.log("HEROKU KEEP ALIVE RESPONSE: " + chunk);
                } catch (err) {
                    console.log(err.message);
                }
            });
        }).on('error', function(err) {
            console.log("Error: " + err.message);
        });
    }, 20 * 60 * 1000); // load every 20 minutes
};

startKeepAlive();

app.configure(function(){
    app.use('/', express.static(__dirname + '/../client/src'));
    app.use('/libs', express.static(__dirname + '/../client/libs'));
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log('Listening on ' + port);
});