(function () {'use strict';
	
	/**
	 * @description
	 * Directive calulate of kit price.  
	 */
	angular.module('rackApp').directive('rackCalculate', rackCalculate);
	function rackCalculate () {
		return {
			restrict: 'E',
			templateUrl: 'angularApp/directives/rackCalculate/rackCalculate.html',
			controller: 'rackCalculateController', controllerAs: 'calc'
		};
	}

	/**
	 * @description
	 * Controller of directive.  
	 */
	angular.module('rackApp').controller('rackCalculateController', rackCalculateController);
	function rackCalculateController ($scope) {

		$scope.calulate = function () {
			alert("Извините, данный раздел находится в разработке!");
		};

	}
})();