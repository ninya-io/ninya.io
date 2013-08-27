angular.module('myApp')
      .factory('chunkFetcher', ['$http', '$timeout', '$rootScope', '$q', function($http, $timeout, $rootScope, $q){
        
        var ChunkFetcher = function(url, key, pageSize, interceptor){
          var page = 1,
          data = [],
          errorTimeout = null,
          hold = false;
          
          var fetch = function(deferred){
            
            //we want to resolve a promise when all the data behind a given
            //command is fetched. Since we have to fetch the data in chunks,
            //this method is recursively called. It's essentialy that recursive
            //calls pass in the promise that was created when the fetch operation
            //was initiated.
            
            //So when a new fetch operation starts, we call the method without
            //passing a parameter in and create a new one here.
            if (!deferred){
              deferred = $q.defer();
            }
            
            if (hold){
              return;
            }
            
            $http({method: 'jsonp', url: url + '&pagesize=' + pageSize + '&page=' + page + '&jsonp=JSON_CALLBACK'})
              .success(function(response){
                console.log('fetched: ' + key);
                console.log(response);
                var chunk = response[key];
                
                var proceed = function(){
                  data.push.apply(data, chunk);
                  page++;
                  
                  $rootScope.$emit('fetchedData');
                  
                  if (chunk.length === 0){
                    deferred.resolve(data);
                  }
                  else {
                    fetch(deferred);  
                  }  
                };
                
                if (interceptor){
                  interceptor(chunk)
                    .then(function(transformedChunk){
                      chunk = transformedChunk;
                      proceed();
                    }, function(){
                      throw new Error('intercepting failed');
                    });
                }
                else{
                  proceed();
                }
                
              })
              .error(function(){
                
                console.log('error while fetching ' + key);
                
                //it might happen that some requests fail (SO seems to throttle our requests if
                //we exceed a certain limit). So in case a request fails, we will just wait for
                //N seconds and then continue.
                if (errorTimeout){
                  $timeout.cancel(errorTimeout);
                }
                errorTimeout = $timeout(function(){
                  console.log('retrying fetching ' + key);
                  fetch(deferred);
                }, 5000);
              });
              
              return deferred.promise;
          };
          
          var setHold = function(){
            hold = true;
          };
          
          var isPaused = function(){
            return hold;
          };
          
          var resume = function(){
            hold = false;
            return fetch();
          };
          
          var reset = function(){
            data.length = 0;
            page = 1;
            hold = false;
          };
          
          return {
            fetch: fetch,
            hold: setHold,
            reset: reset,
            resume: resume,
            isPaused: isPaused,
            data: data
          };
        };
        
        return function(url, key, pageSize, interceptor){
          var fetcher = new ChunkFetcher(url, key, pageSize, interceptor);
          return fetcher;
        };
      }])