angular.module('StackWho', ['ngAnimate', 'rx']);
// Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. See License.txt in the project root for license information.

;(function (undefined) {

    var objectTypes = {
        'boolean': false,
        'function': true,
        'object': true,
        'number': false,
        'string': false,
        'undefined': false
    };

    var root = (objectTypes[typeof window] && window) || this;

    /** Detect free variable `exports` */
    var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

    /** Detect free variable `module` */
    var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

    /** Detect the popular CommonJS extension `module.exports` */
    var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;

    /** Detect free variable `global` from Node.js or Browserified code and use it as `root` */
    var freeGlobal = objectTypes[typeof global] && global;
    if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
        root = freeGlobal;
    }

    // Headers
    var observable = Rx.Observable,
        observableProto = observable.prototype;

    var isFunction = function(fn){
        return typeof fn === 'function'
    };
    var rxModule = angular.module('rx', []);

    rxModule.factory('rx', function($window) {
        if(!$window.Rx) {
            throw new Error("Rx is not defined!");
        }
        return $window.Rx;
    });

    rxModule.factory('observeOnScope', function(rx) {
        return function(scope, watchExpression, objectEquality) {
            return rx.Observable.create(function (observer) {
                // Create function to handle old and new Value
                function listener (newValue, oldValue) {
                    observer.onNext({ oldValue: oldValue, newValue: newValue });
                }
            
                // Returns function which disconnects the $watch expression
                return scope.$watch(watchExpression, listener, objectEquality);
            });
        };
    });

    observableProto.safeApply = function($scope, fn){

        fn = isFunction(fn) ? fn : function(){};

        return this.doAction(function(data){
            ($scope.$$phase || $scope.$root.$$phase) ? fn(data) : $scope.$apply(function(){
                fn(data);
            });
        });
    };

    rxModule
        .config(['$provide', function($provide){
            $provide.decorator('$rootScope', ['$delegate', function($delegate){

                Object.defineProperty($delegate.constructor.prototype, '$toObservable', {
                    value: function(watchExpression, objectEquality) {
                        var scope = this;
                        return Rx.Observable.create(function (observer) {
                            // Create function to handle old and new Value
                            function listener (newValue, oldValue) {
                                observer.onNext({ oldValue: oldValue, newValue: newValue });
                            }
                        
                            // Returns function which disconnects the $watch expression
                            return scope.$watch(watchExpression, listener, objectEquality);
                        });
                    },
                    enumerable: false
                });


                return $delegate;
            }]);
        }]);



}.call(this));
var Lexer = function(){

    var self = {};

    var ALL_LETTERS_AND_DIGITS = 'a-zA-Z0-9ÀÁÂÃÄÅàáâãäåÒÓÔÕÖØòóôõöøÈÉÊËèéêëÇçÌÍÎÏìíîïÙÚÛÜùúûüÿÑñ'

    var locationRegex = new RegExp('location:(((?!answers:)[' + ALL_LETTERS_AND_DIGITS + ', ])+)', 'i'),
        answersRegex  = new RegExp('answers:(((?!location:)[' + ALL_LETTERS_AND_DIGITS + ', ])+)', 'i');

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

if(typeof module !== 'undefined'){
    module.exports = Lexer;
}

angular.module('StackWho')
  .config(['$locationProvider', function($locationProvider){
      $locationProvider.html5Mode(true);
  }])

  .controller('AppController', ['$scope', '$http', '$location', '$sce', 'config', 'ToggleButtonModel', function($scope, $http, $location, $sce, config, ToggleButtonModel) {

    'use strict';

    var lexer = new Lexer();

    var tokens = lexer.tokenize($location.search().cmd || $location.search().q || '');

    $scope.serverRendered = serverRendered;

    $scope.searchStringLocation = tokens.locations.join(',');
    $scope.searchStringTags = tokens.answerTags.join(',');

    $scope.displayUsers = [];

    $scope.$sce = $sce;

    $scope.faq = ToggleButtonModel({
        CLOSE_TEXT: 'Got it. Close the FAQ.',
        OPEN_TEXT: 'Wonder what this is? Read the FAQ.'
    });

    $scope.examples = ToggleButtonModel({
        CLOSE_TEXT: 'Close examples.',
        OPEN_TEXT: 'Check out some example queries.'
    })

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

angular.module('StackWho')

  .factory('ToggleButtonModel', [function() {

    'use strict';

    return function(initialState){

        var self = {};

        self.open = false;

        angular.extend(self, initialState);
        self.text = self.OPEN_TEXT;

        self.toggle = function(){
            self.open = !self.open;
            self.text = self.open ? self.CLOSE_TEXT : self.OPEN_TEXT;
        };

        return self;
    };

  }]);

angular
    .module('StackWho')
    .constant('config', {
        backendEndpoint: 'http://localhost:5000'
    });
