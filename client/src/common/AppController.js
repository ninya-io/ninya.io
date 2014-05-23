angular.module('StackWho')
  .config(['$locationProvider', function($locationProvider){
      $locationProvider.html5Mode(true);
  }])

  .controller('AppController', ['$scope', '$http', '$location', '$sce', 'config', function($scope, $http, $location, $sce, config) {

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

    var tokens = lexer.tokenize($location.search().cmd || $location.search().q || '');

    $scope.serverRendered = serverRendered;

    $scope.searchStringLocation = tokens.locations.join(',');
    $scope.searchStringTags = tokens.answerTags.join(',');

    $scope.displayUsers = [];

    $scope.$sce = $sce;

    $scope.faq = {
        text: '',
        open: false,
        CLOSE_TEXT: 'Got it. Close the FAQ.',
        OPEN_TEXT: 'Wonder what this is? Read the FAQ.'
    };
    $scope.faq.text = $scope.faq.OPEN_TEXT;

    $scope.toggleFaq = function(){
        $scope.faq.open = !$scope.faq.open;
        $scope.faq.text = $scope.faq.open ? $scope.faq.CLOSE_TEXT : $scope.faq.OPEN_TEXT;
    };


    $scope.examples = {
        text: '',
        open: false,
        CLOSE_TEXT: 'Close the Examples.',
        OPEN_TEXT: 'Check out some example queries.'
    };
    $scope.examples.text = $scope.examples.OPEN_TEXT;

    $scope.toggleExamples = function(){
        $scope.examples.open = !$scope.examples.open;
        $scope.examples.text = $scope.examples.open ? $scope.examples.CLOSE_TEXT : $scope.examples.OPEN_TEXT;
    };

    $scope.createQueryLink = function(){
      var cmd = createQueryCommand().replace(/\s/g, '%20');
      return encodeURIComponent('http://www.ninya.io/?q=' + cmd);
    };

    // since the site operates under stackwho.herokuapp.com and ninya.io we need to use origin except when we are on localhost
    // because then we either want to use localhost or one of the production backends
    var host = location.origin.indexOf('ninya.io') > -1 || location.origin.indexOf('stackwho.herokuapp.com') > -1
               ? location.origin : config.backendEndpoint;

    var server = host + '/users';

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

    var inputObservable = Rx.Observable.merge(
      $scope.$toObservable('searchStringLocation'),
      $scope.$toObservable('searchStringTags')
    );

    inputObservable
        // the first two notifications are always NON-user initiated. They simply
        // exist from the initial state of such boxes (either with values or empty)
        // This gives us a somewhat robust hook to tell when a search *IS* user
        // initiated so that we can set `serverRendered` to false.
        .skip(2)
        .subscribe(function(){
            $scope.serverRendered = false;
        })

    inputObservable
        .where(function(data){
          return !$scope.serverRendered && ($scope.searchStringLocation.length > 0 || $scope.searchStringTags.length > 0);
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
