(function () {'use strict';
	
	/**
	 * @description 
	 * Directive of aks a question.
	 */
	angular.module('rackApp').directive('rackAsk', rackAsk);
	function rackAsk () {
		return {
			restrict: 'E',
			templateUrl: 'angularApp/directives/rackAsk/rackAsk.html',
			controller: 'rackAskController', controllerAs: 'ask'
		};
	}

	/**
	 * @description 
	 * Cotrroller of directive.
	 */
	angular.module('rackApp').controller('rackAskController', rackAskController);
	function rackAskController ($scope, rackServer, b4wService) {

		/**
		 * @description 
		 * Send question on server.
		 */
		$scope.sendQuestion = function () {
			$("#askForm").submit(function() {
				$.ajax({
					type: "POST",
					url: "php/mail.php",
					data: $(this).serialize()
				}).done(function (status) {
					console.log("status",status);
					$(this).find("input").val("");
					$("#registration").trigger("reset");
					$scope.close(true);
				});
				return false;
			});
		};

		/**
		 * @description 
		 * Close ask form.
		 */
		$scope.close = function (registrationComplete) {
			$scope.$emit("closeAsk");
			if (registrationComplete) {
				$scope.$digest();
			// 	alert("Спасибо, за Ваш вопрос! Мы ответим Вам в ближайшее время!");
			};
		};

		/**
		 * @description
		 * Disable controlls at 3d-scene.
		 */
		$scope.disableControlls = function () {
			b4wService.m_app.disable_camera_controls();
		};

		/**
		 * @description
		 * Enable controlls at 3d-scene.
		 */
		$scope.enableControlls = function () {
			b4wService.m_app.enable_camera_controls();
		};

	}
})();