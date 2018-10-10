(function () {'use strict';

  /**
   * @description 
   * Service for storing collection of busy positions.
   */
  angular.module('rackApp').service('busyPositions', busyPositions);
  function busyPositions () {
    
    /**
     * @description
     * Create new collection busy positions
     */
    this.addCollection = function (groupId) {
      this[groupId] = [];
    };

    /**
     * @description 
     * Remove busy collection
     * @param  {String} groupId 
     */
    this.removeCollection = function (groupId) {
      delete this[groupId];
    }

  }

}());