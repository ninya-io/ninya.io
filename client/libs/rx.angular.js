Rx.Observable.fromScope = function(scope, expression){
    return Rx.Observable.create(function (observer) {
            return scope.$watch(expression, function(value){
                observer.onNext(value);
            });
        });
};

Rx.Observable.fromDeferred = function (deferred) {
            var subject = new Rx.AsyncSubject();
            deferred.then(function (obj) {
                subject.onNext(obj);
                subject.onCompleted();
            }, function(error){
                subject.onError(error);
            });
            return subject;
        };