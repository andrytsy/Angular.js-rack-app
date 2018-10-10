(function () {'use strict';

  /**
   * @description
   * Service for storing parameters of room.
   */
  angular.module('rackApp').service('parametersOfRoom', parametersOfRoom);
  function parametersOfRoom () {

    /* Default parameters */
    var wallWidth     = 4000;
    var wallHeight    = 3000;
    var wallLength    = 4000;
    var wallMaterials = null;

    Object.defineProperties(this, {
      wallWidth:     {get: function () {return wallWidth;},     set: function (val) {wallWidth = val;}},
      wallHeight:    {get: function () {return wallHeight;},    set: function (val) {wallHeight = val;}},
      wallLength:    {get: function () {return wallLength;},    set: function (val) {wallLength = val;}},
      wallMaterials: {get: function () {return wallMaterials;}, set: function (val) {wallMaterials = val;}}
    });

  }

}());