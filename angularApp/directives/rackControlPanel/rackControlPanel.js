(function () {'use strict';

  /**
   * @description 
   * It is derective for elements control of application. 
   */
  angular.module('rackApp').directive('rackControlPanel', rackControlPanel);
  function rackControlPanel () {
    return {
      restrict: 'E',
      templateUrl: 'angularApp/directives/rackControlPanel/rackControlPanel.html',
      controller: 'rackControlPanelController', controllerAs: 'controlls'
    };
  }

  /**
   * @description 
   * It is controller of derective for elements control. 
   */
  angular.module('rackApp').controller('rackControlPanelController', rackControlPanelController);
  function rackControlPanelController ($scope, $http, $timeout, b4wService, rackGroup3d, rackObject3d, editTarget) {

    $scope.showControlPanel = false;

    $scope.$on('loadingIsComplete', function () {
      $scope.showControlPanel = true;
    });

    $scope.$on('closeAsk', function () {
      $scope.showAsk = false;
    });

    /**
     * @type {Boolean} showAsk [Show directive of ask]
     */
    $scope.showAsk = false;

    /**
     * @type {Boolean} userSolution [Show block whith default kits]
     */
    $scope.userSolution = true;

    /**
     * @property {Object <b4wService>} b4wService
     */
    this.b4wService = b4wService;

    $scope.showConfigs    = false;
    $scope.showEditTarget = false;
    $scope.showRoomEditor = false;
    $scope.groups         = [];

    $scope.validationCheck = true;
    
    /**
     * @description 
     * Default params for addSection.
     */
    $scope.rackLength      = 200;
    $scope.rackQuantity    = 2;
    $scope.shelfLength     = 500;
    $scope.shelfQuantity   = 1;
    $scope.shelfWidth      = 'shelf-350';
    $scope.shelfHeight     = 100;

    $scope.sectionsQuantity = [
      {value: 1},
      {value: 2},
      {value: 3},
      {value: 4}
    ];

    $scope.racksQuantity = [
      {value: 2},
      {value: 3},
      {value: 4},
      {value: 5}
    ];    

    $scope.shelfsQuantity = [
      {value: 1, avalible: true},
      {value: 2, avalible: true},
      {value: 3, avalible: false},
      {value: 4, avalible: false},
      {value: 5, avalible: false},
      {value: 6, avalible: false},
      {value: 7, avalible: false},
      {value: 8, avalible: false},
      {value: 9, avalible: false},
      {value: 10, avalible: false},
      {value: 11, avalible: false},
      {value: 12, avalible: false}
    ];

    $scope.shlefsHeight = [
      {value: 100, avalible: true},
      {value: 200, avalible: false},
      {value: 300, avalible: false},
      {value: 400, avalible: false}
    ];  

    $scope.shelfsWidth = [
      {title: '350', value: 'shelf-350'},
      {title: '450', value: 'shelf-450'}
    ];

    $scope.$on('removeSection', function (event, section) {
      $scope.removeSection(section);
    });

    $http.get('data/kits.json').then(function (response) {
      $scope.kits = response.data;
    });

    $scope.pickSolution = function (solution) {
      solution === 'default' ? $scope.userSolution = true : $scope.userSolution = false;
    };

    /**
     * @description 
     * Filter-function for UI-elements.
     * @param {Object} item 
     */
    $scope.shelfFilter = function (item) {
      return item.avalible;
    };

    /**
     * @description 
     * Close all panels.
     */
    $scope.closePanel = function () {
      $scope.showConfigs    = false;
      $scope.showEditTarget = false;
      $scope.showRoomEditor = false;
      $scope.showAsk        = false;
    };

    /* ОБЪЕДЕНИТЬ */
    $scope.openConfigsMenu = function () {
      if ($scope.showConfigs) {
        $scope.showConfigs = false;
      } else {
        $scope.showConfigs = true;
        $scope.showEditTarget = false;
        $scope.showRoomEditor = false;
      }
    }; 

    /* ОБЪЕДЕНИТЬ */
    $scope.openEditTarget = function () {
      if ($scope.showEditTarget) {
        $scope.showEditTarget = false;
      } else {
        $scope.showEditTarget = true;
        $scope.showConfigs = false;
        $scope.showRoomEditor = false;
      }
    }; 

    /* ОБЪЕДЕНИТЬ */
    $scope.openRoomEditor = function () {
      if ($scope.showRoomEditor) {
        $scope.showRoomEditor = false;
      } else {
        $scope.showRoomEditor = true;
        $scope.showEditTarget = false;
        $scope.showConfigs = false;
      }
    };

    /**
     * @description
     * 
     * @param  {Object} target
     */
    $scope.pick = function (target) {
      if (target !== editTarget.target) {
        editTarget.target = target;
        editTarget.target.pick();
        $scope.openEditTarget();
      } else {
        $scope.openEditTarget();
        b4wService.outlineOff();
      }
    };

    /**
     * @description 
     * Delete all created group and 3d-object in scene.
     */
    $scope.clearAll = function () {
      editTarget.target = null;
      rackObject3d.clearAll();
      rackGroup3d.clearAll();
      b4wService.clearAll();
      $scope.showEditTarget = false;
      $scope.showConfigs = false;
      $scope.groups.length = 0;
    };

    /**
     * @description
     * Validation of inputs parametrs.
     */
    $scope.validation = function () {
      if (!$scope.showErrShelfLength && 
          !$scope.showErrRackLength && 
          $scope.shelfQuantity && 
          !$scope.showErrshelfsQuantity) {
        $scope.validationCheck = true;
      } else {
        $scope.validationCheck = false;
      }
    };

    /**
     * @description 
     * Update length of rack in creating section and validation value(rackLength).
     * @param  {Number} rackLength 
     */
    $scope.updateRackLength = function (rackLength) {
      $scope.rackLength = rackLength;
      var result = Math.floor(rackLength/30);
      $scope.shelfsQuantity.forEach(function (_shelf) {
        if (_shelf.value <= result) {
          _shelf.avalible = true;
        } else {
          _shelf.avalible = false;
        }
      });

      var rackL = String(rackLength);
      if (rackL.match(/^\d+$/)) {
        $scope.showErrRackLength = false;
        $scope.rackLength = rackLength;
        $scope.validation();
      } else {
        $scope.showErrRackLength = true;
        $scope.validation();
      }
    };

    $scope.updateRackQuantity = function (rackQuantity) {
      $scope.rackQuantity = rackQuantity;
    };

    $scope.updateShelfLength = function (shelfLength) {
      $scope.shelfLength = shelfLength;
      var shelfL = String(shelfLength);
      if (shelfL.match(/^\d+$/)) {
        $scope.showErrShelfLength = false;
        $scope.shelfLength = shelfLength;
        $scope.validation();
      } else {
        $scope.showErrShelfLength = true;
        $scope.validation();
      }
    };

    $scope.updateShelfQuantity = function (shelfQuantity) {
      if (shelfQuantity) {
        $scope.shelfQuantity = shelfQuantity;
        $scope.showErrshelfsQuantity = false;
        $scope.validation();
      } else {
        $scope.shelfQuantity = shelfQuantity;
        $scope.showErrshelfsQuantity = true;
        $scope.validation();
      }
    };

    $scope.updateShelfWidth = function (shelfWidth) {
      $scope.shelfWidth = shelfWidth;
    };

    $scope.updateShelfHeight = function (shelfHeight) {
      $scope.shelfHeight = shelfHeight;
    };

    /**
     * @description 
     * Add new sections in scene.
     */
    $scope.addSection = function () {
      var rackL    = $scope.rackLength;
      var rackQ    = $scope.rackQuantity;
      var shelfL   = $scope.shelfLength;
      var shelfQ   = $scope.shelfQuantity;
      var shelfW   = $scope.shelfWidth;
      var _group   = new rackGroup3d(rackL, rackQ, shelfL, shelfQ, shelfW);
      $scope.openConfigsMenu();
      $scope.groups.push(_group);
    };

    /**
     * @description 
     * Remove section from local collection.
     * @param  {Object} section
     */
    $scope.removeSection = function (section) {
      $scope.closePanel();
      $scope.groups.splice($scope.groups.indexOf(section), 1);
    };

    /**
     * @description 
     * 
     * @param {Number} kitNumber
     */
    $scope.addDefaultKit = function (kitNumber) {
      var kit      = $scope.kits[kitNumber-1];
      var rackL    = kit.rackLength;
      var rackQ    = kit.rackQuantity;
      var shelfL   = kit.shelfLength;
      var shelfQ   = kit.shelfQuantity;
      var shelfW   = kit.shelfWidth;
      var _group   = new rackGroup3d(rackL, rackQ, shelfL, shelfQ, shelfW);
      $scope.openConfigsMenu();
      $scope.groups.push(_group);

      $scope.$broadcast('defaultAdded', [_group, kit.shelfLevels, kit.shelfOptions]);
    };

    $scope.calulate = function () {
      alert("Извините, данный раздел находится в разработке!");
    };

    $scope.toggleAsk = function () {
      $scope.showAsk = $scope.showAsk ? false : true;
    };
  }

}());