(function () {'use strict';

	/**
	 * @description 
	 * Service for storing coordinates.
	 */
	angular.module('rackApp').service('coordinates', coordinates);
	function coordinates ($http) {

		this.levels = [];
		
		/**
     * @description
     * Data with coordinates of bracket-objects positions
     */
    $http.get('data/coordinates.json').then(function (response) {
      this.levels = response.data[0].levels;
    }.bind(this));
	}

}());