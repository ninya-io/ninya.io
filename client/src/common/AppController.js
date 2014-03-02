angular.module('StackWho')

  .controller('AppController', ['$scope', '$http', '$location', 'config', function($scope, $http, $location, config) {
    
    'use strict';

    // TODO: We use this on the backend as well. It's time to move this into a common lib
    // and come up with a proper build process
    var Lexer = function(){

        var self = {};

        var locationRegex = /location:(((?!answers:)[-A-Za-z0-9, ])+)/i,
            answersRegex  = /answers:(((?!location:)[-A-Za-z0-9, ])+)/i;

        self.tokenize = function(str){

            var locationMatch = str.match(locationRegex);
            var answerTagsMatch = str.match(answersRegex);

            var token = {
                locations: [],
                answerTags: []
            };

            var sanitize = function(word){
                return word && word.trim().toLowerCase();
            };

            var empty = function(word){
                return word && word.length > 0;
            };

            token.locations     =   locationMatch && locationMatch.length > 1 && 
                                    locationMatch[1]
                                    .split(',')
                                    .map(sanitize)
                                    .filter(empty) || [];

            token.answerTags   =   answerTagsMatch && answerTagsMatch.length > 1 && 
                                    answerTagsMatch[1]
                                    .split(',')
                                    .map(sanitize)
                                    .filter(empty) || [];

            return token;
        };

        return self;
    };

    var lexer = new Lexer();

    var tokens = lexer.tokenize($location.search().cmd || '');

    $scope.searchStringLocation = tokens.locations.join(',');
    $scope.searchStringTags = tokens.answerTags.join(',');

    $scope.displayUsers = [];

    $scope.createQueryLink = function(){
      var cmd = createQueryCommand().replace(/\s/g, '%20');
      return encodeURIComponent('http://www.ninya.io/#/?cmd=' + cmd);
    };

    var server = config.backendEndpoint + '/users';

    var safeApply = function (fn) {
      ($scope.$$phase || $scope.$root.$$phase) ? fn() : $scope.$apply(fn);
    };

    var queryBackend = function(searchCommand){

      var searchParams = {
        searchString: searchCommand
      };

      var observable = Rx.Observable.fromPromise(
        $http({
          url: server,
          method: 'GET',
          params: searchParams
      }))
      .select(function(response){
        return response.data.users;
      });

      return observable;
    };

    var createQueryCommand = function(){
      var cmd = '';
      if ($scope.searchStringLocation.length > 0){
        cmd += 'location: ' + $scope.searchStringLocation;
      }

      if ($scope.searchStringTags.length > 0){
        cmd += ' answers: ' + $scope.searchStringTags;
      }
      return cmd;
    };

    //This might look scary at first glance.
    //However this code deals with
    //1. throttleing user input to not hammer our API on every keystroke
    //2. not requesting data that is already there 
    //3. not getting out of order results

    Rx.Observable.merge(
      $scope.$toObservable('searchStringLocation'),
      $scope.$toObservable('searchStringTags')
    )
    .where(function(data){
      return $scope.searchStringLocation.length > 0 || $scope.searchStringTags.length > 0;
    })
    .select(createQueryCommand)
    .throttle(400)
    .distinctUntilChanged()
    .doAction(function(){
      $scope.displayUsers = [];
      $scope.loading = true;
    })
    .select(queryBackend)
    .switchLatest()
    .safeApply($scope, function(data){
        $scope.loading = false;
        $scope.displayUsers = data;
    })
    .subscribe();
  }]);
  
  
  


