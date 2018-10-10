(function () {'use strict';

  /**
   * @description 
   * It is main derective of application. 
   */
  angular.module('rackApp').directive('rackMain', rackMain);
  function rackMain () {
    return {
      restrict: 'E',
      templateUrl: 'angularApp/directives/rackMain/rackMain.html',
      controller: 'rackMainController', controllerAs: 'main'
    };
  }

  /**
   * @description 
   * It is controller of main directive. 
   */
  angular.module('rackApp').controller('rackMainController', rackMainController);
  function rackMainController ($scope) {
    $scope.authorization = false;
    
    $scope.$on('signIn', function () {
      $scope.authorization = true;
      $scope.$broadcast('start');
    });
  }

}());