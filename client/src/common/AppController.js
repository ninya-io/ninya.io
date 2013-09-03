angular.module('StackWho')

  .controller('AppController', ['$scope', '$http', 'config', function($scope, $http, config) {
    
    'use strict';

    $scope.searchString = '';
    $scope.searchStringTags = '';
    $scope.displayUsers = [];

    var server = config.backendEndpoint + '/users';

    var safeApply = function (fn) {
      ($scope.$$phase || $scope.$root.$$phase) ? fn() : $scope.$apply(fn);
    };

    var queryBackend = function(){

      var searchParams = {};

      if ($scope.searchString){
        searchParams.location = $scope.searchString;
      }

      if ($scope.searchStringTags){
        searchParams.top_answers = $scope.searchStringTags;
      }

      var observable = Rx.Observable.fromDeferred(
        $http({
          url: server,
          method: 'GET',
          params: searchParams
      }))
      .select(function(response){
        return response.data.users;
      });

      safeApply();

      return observable;
    };

    //This might look scary at first glance.
    //However this code deals with
    //1. throttleing user input to not hammer our API on every keystroke
    //2. not requesting data that is already there 
    //3. not getting out of order results
    Rx.Observable.merge(
      Rx.Observable.fromScope($scope, 'searchString'),
      Rx.Observable.fromScope($scope, 'searchStringTags')
    )
    .throttle(400)
    .select(function(){
      return {
        searchString: $scope.searchString,
        searchStringTags: $scope.searchStringTags
      };
    })
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
  
  
  


