(function () {'use strict';

  /**
   * @description 
   * It is factory 3d-objects grouped to sections.
   */
  angular.module('rackApp').factory('rackGroup3d', rackGroup3d);
  function rackGroup3d (b4wService, rackObject3d, typesOfObjects3d, namesOfObjects3d, busyPositions) {

    var registry = [];

    /**
     * @return {Array}
     */
    _Group.getAll = function () {
      return registry;
    };

    /**
     * @description 
     * Getting instanse of constructor by id.
     * @param  {String} id
     * @return {Object} instanse of constructor _Group
     */
    _Group.getById = function (id) {
      return registry.filter(function (item) {
        return item.id === id;
      })[0];
    };

    /**
     * @description
     * Clear local registry.
     */
    _Group.clearAll = function () {
      registry.length = 0;
    };

    /**
     * @constructor
     * @param  {Number} rackL  rack length
     * @param  {Number} rackQ  rack quantity
     * @param  {Number} shelfL shelf length  
     * @param  {Number} shelfQ shelf quantity
     * @param  {Number} shelfW shelf width
     */
    function _Group (rackL, rackQ, shelfL, shelfQ, shelfW) {
      this.id        = this.getUniqId();
      this.name      = this.getName();
      this.rackL     = rackL;
      this.rackQ     = rackQ;
      this.shelfL    = shelfL;
      this.shelfQ    = shelfQ;
      this.shelfW    = shelfW;
      this.railL     = this.shelfL;

      this.rackName  = null;
      this.shelfName = null;
      this.railName  = null;

      this.objects3d = [];

      busyPositions.addCollection(this.id);

      this.createMainDetail();
      this.createObjects3d();

      this.groupPosition = null;

      registry.push(this);
    }

    /**
     * @description
     * Remove group.
     */
    _Group.prototype.remove = function () {
      /* Array of objects second stage removing */
      var secondStage = [];

      /* First stage remove objects of owner group */
      this.objects3d.forEach(function (_Object) {
        if (_Object.type !== typesOfObjects3d.RACK) {
          _Object.remove();
        } else {
          secondStage.push(_Object);
        }
      });

      /* Second stage removing */
      secondStage.forEach(function (_Object) {
        _Object.remove();
      });

      /* Remove main object */
      b4wService.remove(this.railName);
      b4wService.remove(this.rackName);
      b4wService.remove(this.shelfName350);
      b4wService.remove(this.shelfName450);
      b4wService.remove(this.bracketName350);
      b4wService.remove(this.bracketName450);
      b4wService.remove(this.hangerName);
      b4wService.remove(this.mountName);

      /* Remove collection of busy positions */
      busyPositions.removeCollection(this.id);

      /* Remove instance from local registry */
      registry.splice(registry.indexOf(this), 1);
    };

    /**
     * @description 
     * Get unqiue id. 
     * @return {String} ID
     */
    _Group.prototype.getUniqId = function () {
      var name = 'group-';

      if (registry.length) {
        var id = +registry[registry.length-1].id.split('group-')[1] + 1;
      } else {
        var id = registry.length + 1;
      }

      return name + String(id);
    };

    /**
     * @description 
     * Get name of group.
     * @return {String} name
     */
    _Group.prototype.getName = function () {
      var name = 'Комплект ';

      if (registry.length) {
        var id = +registry[registry.length-1].id.split('group-')[1] + 1;
      } else {
        var id = registry.length + 1;
      }

      return name + String(id);
    };

    /**
     * @description
     * 
     * @return {String} bracket name 'bracket-350' or 'bracket-450';
     */
    _Group.prototype.getBracketName = function () {
      return this.shelfW === namesOfObjects3d.SHELF_350 ? this.bracketName350 : this.bracketName450;
    }

    _Group.prototype.getRail = function () {
      return this.objects3d.filter(function (item) {
        return item.type === typesOfObjects3d.RAIL;
      })[0];
    };

    /**
     * @description
     * Outlining on for all 3d-objects in group.
     */
    _Group.prototype.pick = function () {
      this.objects3d.forEach(function (_object) {
        b4wService.m_scenes.set_outline_color([1, 1, 1]);
        b4wService.m_scenes.apply_outline_anim(_object.mesh, 1.2, 1.2, 1);
      }.bind(this));
    };

    /**
     * @description
     * Outlining off for all 3d-objects in group.
     */
    _Group.prototype.unpick = function () {
      this.objects3d.forEach(function (_object) {
        b4wService.m_scenes.clear_outline_anim(_object.mesh);
      }.bind(this));
    };

    /**
     * @description 
     * Creating main datails of group.
     */
    _Group.prototype.createMainDetail = function () {
      /* Create RAIL */
      this.railName = this.id + '_' + namesOfObjects3d.RAIL;
      var _railL    = this.convertingLength(typesOfObjects3d.RAIL, this.railL);
      b4wService.createDetail(namesOfObjects3d.RAIL, this.railName, _railL);

      /* Create RACK */
      this.rackName = this.id + '_' + namesOfObjects3d.RACK;
      var _rackL    = this.convertingLength(typesOfObjects3d.RACK, this.rackL);
      var newRack   = b4wService.createDetail(namesOfObjects3d.RACK, this.rackName, _rackL);

      /* Create SHELF 350 */
      var _shelfL       = this.convertingLength(typesOfObjects3d.SHELF, this.shelfL);
      this.shelfName350 = this.id + '_' + namesOfObjects3d.SHELF_350;
      b4wService.createDetail(this.shelfW, this.shelfName350, _shelfL);
      /* Create SHELF 450 */
      this.shelfName450 = this.id + '_' + namesOfObjects3d.SHELF_450;
      b4wService.createDetail(this.shelfW, this.shelfName450, _shelfL);

      /* Create BRACKET 350 */
      this.bracketName350 = this.id + '_' + namesOfObjects3d.BRACKET_350;
      b4wService.createDetail(namesOfObjects3d.BRACKET_350, this.bracketName350, null);
      /* Create BRACKET 450 */
      this.bracketName450 = this.id + '_' + namesOfObjects3d.BRACKET_450;
      b4wService.createDetail(namesOfObjects3d.BRACKET_450, this.bracketName450, null);

      /* Create HANGER */
      this.hangerName = this.id + '_' + namesOfObjects3d.HANGER;
      b4wService.createDetail(namesOfObjects3d.HANGER, this.hangerName, _railL);
      /* Create MOUNT */
      this.mountName  = this.id + '_' + namesOfObjects3d.MOUNT;
      b4wService.createDetail(namesOfObjects3d.MOUNT, this.mountName, null);

      /* Create BASKET 450 */
      this.basketName450  = this.id + '_' + namesOfObjects3d.BASKET_450;
      b4wService.createDetail(namesOfObjects3d.BASKET_450, this.basketName450, null);
      /* Create BASKET 500 */
      this.basketName500  = this.id + '_' + namesOfObjects3d.BASKET_500;
      b4wService.createDetail(namesOfObjects3d.BASKET_500, this.basketName500, null);
    };

    /**
     * @description 
     * Create not unique copy of main objects. 
     */
    _Group.prototype.createObjects3d = function () {
      this.addObjects3d(typesOfObjects3d.RAIL, 1, this.railL);
      this.addObjects3d(typesOfObjects3d.RACK, this.rackQ, this.rackL);
      this.addObjects3d(typesOfObjects3d.SHELF, this.shelfQ, this.shelfL);
    };

    /**
     * @description 
     * 
     * @param {String} type
     * @param {Number} quantity
     * @param {} length
     */
    _Group.prototype.addObjects3d = function (type, quantity, length) {
      var _newObjects = [];
      for (var i = 0; i < quantity; i++) {
        var instance = new rackObject3d(this, type, length);
        
        /* Find non-removable rack */        
        if (type === typesOfObjects3d.RACK && quantity > 1 && (i===0 || i===quantity-1)) {
          instance.immortal = true;
        }
        this.objects3d.push(instance);
        _newObjects.push(instance);
      }
      return _newObjects;
    };

    /**
     * @description 
     * 
     * @param  {String} type
     * @param  {Number} length
     * @return {Float}
     */
    _Group.prototype.convertingLength = function (type, length) {
      switch (type) {
        case typesOfObjects3d.RACK:
          return -1 + (2/3000 * length);
        break;
        case typesOfObjects3d.RAIL:
          return -1 + (2/3000 * length);
        break;
        case typesOfObjects3d.SHELF:
          return -1 + (2/1500 * length);
        break;
      }
    };

    return _Group;
  }

}());