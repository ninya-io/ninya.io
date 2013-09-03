angular.module('StackWho')

  .controller('AppController', ['$scope', '$http', 'config', function($scope, $http, config) {
    
    'use strict';

    $scope.searchString = '';
    $scope.searchStringTags = '';
    $scope.displayUsers = [];
    
    var updateList = function(){
      $scope.displayUsers = [];

      var server = config.backendEndpoint + '/users';

      var searchParams = {};

      if ($scope.searchString){
        searchParams.location = $scope.searchString;
      }

      if ($scope.searchStringTags){
        searchParams.top_answers = $scope.searchStringTags;
      }

      $http({
          url: server,
          method: 'GET',
          params: searchParams
        })
        .then(function(response){
          $scope.displayUsers = response.data.users;
        });
    };
  
    //we should throttle the user input
    $scope.$watch('searchString', function(term){
      updateList();
    });

    $scope.$watch('searchStringTags', function(term){
      updateList();
    });

  }]);
  
  
  


