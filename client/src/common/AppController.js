angular.module('StackWho')

  .controller('AppController', ['$scope', '$http', '$location', 'config', function($scope, $http, $location, config) {
    
    'use strict';

    var paramsToCommand = function(params){
      var command = '';

      if (params.cmd){
        command += params.cmd;
        return command;
      }

      if (params.location){
        command += 'location: ' + params.location
      }

      if(params.answers){
        command += ' answers: ' + params.answers;
      }

      return command;
    };

    $scope.searchString = paramsToCommand($location.search());
    $scope.searchStringTags = '';
    $scope.displayUsers = [];

    $scope.createQueryLink = function(){
      var cmd = $scope.searchString.replace(/\s/g, '%20');
      return encodeURIComponent('http://stackwho.herokuapp.com/#/?cmd=' + cmd);
    };

    var server = config.backendEndpoint + '/users';

    var safeApply = function (fn) {
      ($scope.$$phase || $scope.$root.$$phase) ? fn() : $scope.$apply(fn);
    };

    var queryBackend = function(){

      var searchParams = {
        searchString: $scope.searchString
      };

      var observable = Rx.Observable.fromDeferred(
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

    //This might look scary at first glance.
    //However this code deals with
    //1. throttleing user input to not hammer our API on every keystroke
    //2. not requesting data that is already there 
    //3. not getting out of order results
    Rx.Observable
    .fromScope($scope, 'searchString')
    .where(function(term){
      return term && term.length > 0;
    })
    .throttle(400)
    .distinctUntilChanged()
    .doAction(function(){
      $scope.displayUsers = [];
      $scope.loading = true;
    })
    .select(queryBackend)
    .switchLatest()
    .subscribe(function(data){
      safeApply(function(){
        $scope.loading = false;
        $scope.displayUsers = data;
      });
    });

  }]);
  
  
  


