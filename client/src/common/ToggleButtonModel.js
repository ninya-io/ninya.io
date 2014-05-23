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
