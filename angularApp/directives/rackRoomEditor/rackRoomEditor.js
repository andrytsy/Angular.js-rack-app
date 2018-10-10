(function () {
    
  /**
   * @description 
   * Directive setting of room properties. 
   */
  angular.module('rackApp').directive('rackRoomEditor', rackRoomEditor);
  function rackRoomEditor () {
    return {
      restrict: 'E',
      templateUrl: 'angularApp/directives/rackRoomEditor/rackRoomEditor.html',
      controller: 'rackRoomEditorController', controllerAs: 'room'
    }
  }

  /**
   * @description 
   * Controller of directive <rackRoomEditor>
   */
  angular.module('rackApp').controller('rackRoomEditorController', rackRoomEditorController);
  function rackRoomEditorController ($scope, $http, b4wService, parametersOfRoom) {

    /* Default parameters */
    Object.defineProperties($scope, {
      wallWidth:     {get: function () {return parametersOfRoom.wallWidth;},     set: function (val) {parametersOfRoom.wallWidth  = val;}},
      wallHeight:    {get: function () {return parametersOfRoom.wallHeight;},    set: function (val) {parametersOfRoom.wallHeight = val;}},
      wallLength:    {get: function () {return parametersOfRoom.wallLength;},    set: function (val) {parametersOfRoom.wallLength = val;}},
      wallMaterials: {get: function () {return parametersOfRoom.wallMaterials;}, set: function (val) {parametersOfRoom.wallMaterials = val;}}
    });

    /* Get material collection */
    $http.get('data/roomSettings.json').then(function (response) {
      $scope.wallMaterials = response.data;
    });

    /**
     * @description 
     * Set material of room (wall or floor)
     * @param {String} materialName
     * @param {String} objectName  
     */
    $scope.setMaterial = function (materialName, textureName) {
      b4wService.setRoomMaterial(materialName, textureName);
    };

    /**
     * @description
     * Set size of room (width, length, height)
     * @param {Number} value
     * @param {String} type
     */
    $scope.updateRoomData = function (value, type) {
      b4wService.setRoomSize(value, type);
      b4wService.updatePivotByRoom($scope.wallLength, $scope.wallHeight);
    };

    /**
     * @description
     * Filter by material type for wall.
     * @param  {Object}  item 
     * @return {Boolean}
     */
    $scope.isWall = function (item) {
      return item.type === 'wall' || item.type === 'all';
    };

    /**
     * @description
     * Filter by material type for floor.
     * @param  {Object}  item 
     * @return {Boolean}
     */
    $scope.isFloor = function (item) {
      return item.type === 'floor' || item.type === 'all';
    };

  }

}());