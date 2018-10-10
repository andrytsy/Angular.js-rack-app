(function () {'use strict';

	/**
	 * @description 
	 * Service for storing target of edit.
	 */
	angular.module('rackApp').service('editTarget', editTarget);
	function editTarget () {
		
		var target = null;
		Object.defineProperty(this, 'target', {
			get: function () {
				return target;
			},
			set: function (val) {
				target = val;
			}
		});

	}

}());