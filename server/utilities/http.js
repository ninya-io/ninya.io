var zlib = require('zlib');
var Q = require("q");
var http = require("http");

//TODO: check the headers and only unzip if we are actually
//dealing with a gzipped response. Then craft a PR for q-io
var httpGetGzipedJson = function(options){
    var gunzip = zlib.createGunzip();
    var deferred = Q.defer();
    http.get(options,function(response){

        var body = '';

        response.pipe(gunzip);

        gunzip.on('data', function (data) {
            body += data;
        });

        gunzip.on('end', function() {
            deferred.resolve(JSON.parse(body));
        });

        gunzip.on('error', function(error){
            deferred.reject(error);
        })

    }).on('error',function(error){
        deferred.reject(error);
    });

    return deferred.promise;
};

exports.httpGetGzipedJson = httpGetGzipedJson;