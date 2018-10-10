(function () {'use strict';
	
	angular.module('rackApp').directive('rackLogin', rackLogin);
	function rackLogin () {
		return {
			restrict: 'E',
			templateUrl: 'angularApp/directives/rackLogin/rackLogin.html',
			controller: 'rackLoginController', controllerAs: 'loginForm'
		};
	}

	angular.module('rackApp').controller('rackLoginController', rackLoginController);
	function rackLoginController ($scope, $timeout, $location) {

		$scope.$emit('signIn');

		// $scope.showAuthorization = true;
		// $scope.showRegistration = false;

		/**
		 * @type {Boolean} showError [Trigger for block of error]
		 */
		// $scope.showError = false;

		/**
		 * @description 
		 * Check of login and password before authorization.
		 * @param  {String} login    
		 * @param  {String} password 
		 */
		// $scope.signIn = function (login, password) {
		// 	if (login === "Demo" && password === "Demo") {
		// 		$scope.$emit('signIn');
		// 	} else {
		// 		$scope.showPreloader = true; 
		// 		$("#authorization").submit(function() {
		// 			$.ajax({
		// 				type: "POST",
		// 				url: "php/auth.php",
		// 				data: $(this).serialize()
		// 			}).done(function (authorization) {
		// 				if (authorization === 'true') {
		// 					$timeout(function () {
		// 						$scope.showError = false;
		// 						$scope.showPreloader = false; 
		// 					}, 0);
		// 				} else {
		// 					$scope.showPreloader = false; 
		// 					$scope.showError = true;
		// 					$scope.$digest();
		// 				}
		// 			});
		// 			return false;
		// 		});
		// 	}
		// };

		/**
		 * @description 
		 * Show registration form.
		 */
		$scope.runRegistration = function () {
			if ($location.path().match('registration')) {
				$scope.showRegistration = true;
				$scope.showAuthorization = false;
				$scope.showError = false;
			} else {
				alert("Извините, данный раздел находится в разработке!");
			}
		};

		/**
		 * @description 
		 * Show registration form.
		 */
		$scope.runAuthorization = function () {
			$scope.showRegistration = false;
			$scope.showAuthorization = true;
			$scope.showError = false;
		};

		$scope.userRegistration = function () {
			$("#registration").submit(function() {
				$.ajax({
					type: "POST",
					url: "php/registr.php",
					data: $(this).serialize()
				}).done(function (response) {
					$(this).find("input").val("");
					alert("Спасибо за регистрацию!");
					$("#registration").trigger("reset");
					$scope.runAuthorization();
					$scope.$digest();
				});
				return false;
			});
		};

	}
})();