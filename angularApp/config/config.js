(function () {'use strict';

    angular.module('rackApp', ["ngRoute"]).config(function($routeProvider) {
        $routeProvider
        .when("/", {
            templateUrl : "index.html"
        })
        .when("/rack_app/angularApp/directives/rackLogin/rackLogin.php", {
            templateUrl : "index.html"
        });
    });

})();