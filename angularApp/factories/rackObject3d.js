(function () {'use strict';

  /**
   * It is factory of 3d-objects.
   */
  angular.module('rackApp').factory('rackObject3d', rackObject3d);
  function rackObject3d (
    $timeout, 
    b4wService, 
    typesOfObjects3d, 
    namesOfObjects3d, 
    busyPositions, 
    parametersOfRoom, 
    coordinates
  ) {
    
    /**
     * @description 
     * Registry of all instanses constructor.
     * @type {Array}
     */
    var registry = [];

    _Object3d.getAll = function () {
      return registry;
    };

    /**
     * @description
     * Clear local registry.
     */
    _Object3d.clearAll = function () {
      registry.length = 0;
    };

    /**
     * @description 
     * Get object by ID.
     * @param  {String} id 
     * @return {Array}
     */
    _Object3d.getById = function (id) {
      return registry.filter(function (item) {
        return item.id === id;
      });
    };

    /**
     * @description 
     * Get objects by type in group.
     * @param  {Strung} type    Object type.
     * @param  {String} groupId 
     * @return {Array}
     */
    _Object3d.getByTypeInGroup = function (type, groupId) {
      return registry.filter(function (item) {
        return item.type === type && item.groupId === groupId;
      });
    };

    /**
     * @constructor
     * @param {Object} data
     */
    function _Object3d(group, type, length) {
      this.group      = group;
      this.groupId    = group.id;
      this.type       = type;
      this.length     = length;
      this.id         = this.getUniqId();
      this.parentName = this.getParentName();
      this.mesh       = b4wService.copyDetail(this.parentName, this.id);

      /* Create brackets for rack and set rack position */
      if (this.type === typesOfObjects3d.RACK) {
        this.title = this.group.rackL + 'мм №' + this.number;
        this.rackInPosition();
      }

      /* Set position shelf */
      if (this.type === typesOfObjects3d.SHELF) {
        this.setShelfLevel(this.getShelfLevel());
        this.title = this.group.shelfW.split('-')[1] + 'мм №' + this.getShelfLevel();
        this.createBrackets();
        this.createHanger();
      }

      /* Append object to rail (parrent object) */
      if (this.type !== typesOfObjects3d.RAIL) {
        this.appendToRail();
      }

      /* Set position for parent object */
      if (this.type === typesOfObjects3d.RAIL) {
        setTimeout(function() {
          var heigth = (parametersOfRoom.wallHeight/1000)/2;
          var length = (parametersOfRoom.wallLength/1000)/2;
          b4wService.m_trans.set_translation_v(this.mesh, [0, -length, heigth]);
        }.bind(this), 200);
      }

      registry.push(this);
    }

    /**
     * @description 
     * Remove object from register and scene.
     * @param  {Object} item 
     */
    _Object3d.prototype.remove = function () {
      /* Delete brackets on shelf */
      if (this.type === typesOfObjects3d.SHELF) {
        this.brackets.forEach(function (bracket) {
          b4wService.remove(bracket.name);
        });
        this.hangerMount.forEach(function (mount) {
          b4wService.remove(mount.name);
        });
        b4wService.remove(this.hanger.name);
        if (this.basket) {
          b4wService.remove(this.basket.name);
        }
      }

      /* Clear busy positions */
      busyPositions[this.groupId].splice(busyPositions[this.groupId].indexOf(this.shelfLevel), 1);

      /* Delete 3d-object in scene */
      b4wService.remove(this.mesh.name);

      /* Delete instance in local collection */
      registry.splice(registry.indexOf(this), 1);
    };

    /**
     * @description 
     * Create unique name(ID) for object.
     * @return {String} ID
     */
    _Object3d.prototype.getUniqId = function () {
      var name = this.groupId + '_' + this.type + '-';
      var id = _Object3d.getByTypeInGroup(this.type, this.groupId).length + 1;
      this.number = id;
      return name + String(id);
    };

    /**
     * @description
     * Getting of name parent object.
     * @return {String} name of parent object
     */
    _Object3d.prototype.getParentName = function () {
      switch (this.type) {
        case typesOfObjects3d.RACK: 
          return this.group.rackName;
        break;

        case typesOfObjects3d.RAIL:
          return this.group.railName;
        break;

        case typesOfObjects3d.SHELF:
          return this.group.shelfW === namesOfObjects3d.SHELF_350 ? this.group.shelfName350 : this.group.shelfName450;
        break;

        case typesOfObjects3d.BRACKET:
          return this.group.shelfW === namesOfObjects3d.SHELF_350 ? this.group.bracketName350 : this.group.bracketName450;
        break;
      }
    };

    /**
     * @description 
     * Get bracket name by shelf length.
     * @return {String} namesOfObjects3d.BRACKET_350 || BRACKET_450
     */
    _Object3d.prototype.getBracketName = function () {
      return this.group.shelfW === namesOfObjects3d.SHELF_350 ? namesOfObjects3d.BRACKET_350 : namesOfObjects3d.BRACKET_450;
    };

    /**
     * @description 
     * Creating brackets for rack-object.
     */
    _Object3d.prototype.createBrackets = function () {
      this.brackets = [];
      this.hangerMount = [];
      for (var i = 1; i <= this.group.rackQ; i++) {
        var bracketName = this.id + '_' + this.getBracketName() + '-' + i;
        var bracketMesh = b4wService.copyDetail(this.group.getBracketName(), bracketName);

        var mountName = bracketName + '_mount';
        var mountMesh = b4wService.copyDetail(this.group.mountName, mountName);
        b4wService.hide(mountMesh.name);
        b4wService.appendToParent(mountMesh, bracketMesh, [0, 0, 0]);

        var _length   = this.group.shelfL;
        var coorector = i - 1;
        var offset    = _length/(this.group.rackQ - 1);
        bracketMesh.currentOffset = coorector === 0 ? this.levelCoords[1]-0.005 : -((offset/1000)*coorector)+0.025;
        b4wService.appendToParent(bracketMesh, this.mesh, [0, -bracketMesh.currentOffset, 0]);

        this.brackets.push(bracketMesh);
        this.hangerMount.push(mountMesh);
      };
    };

    _Object3d.prototype.updateBrackets = function (newLength) {
      var bracket = this.brackets[this.brackets.length-1];

      b4wService.m_constraints.remove(bracket);

      var splited = bracket.name.split('-');
      var i = splited[splited.length-1];
      var coorector = i - 1;
      var offset    = newLength/(this.group.rackQ - 1);

      bracket.currentOffset = coorector === 0 ? this.levelCoords[1]-0.005 : -((offset/1000)*coorector)+0.025;
      // b4wService.appendToParent(bracket, this.mesh, [0, bracket.currentOffset, 0]);
      b4wService.appendToParent(bracket, this.mesh, [0, -bracket.currentOffset, 0]);
    };

    /**
     * @description 
     * 
     */
    _Object3d.prototype.createHanger = function () {
      var hangerName = this.id + '_hanger';
      this.hanger = b4wService.copyDetail(this.group.hangerName, hangerName);
      b4wService.hide(this.hanger.name);
      b4wService.appendToParent(this.hanger, this.mesh, [0, 0, 0]);
    };

    /**
     * @description 
     * Set position for objects with type "rack". 
     */
    _Object3d.prototype.rackInPosition = function () {
      var _length   = this.group.shelfL;
      var prefix    = this.id.split(this.type + '-')[1];
      var coorector = Number(prefix) - 1;
      var offset    = _length/(this.group.rackQ - 1);

      if (coorector !== 0) {
        var currentOffset   = -((offset/1000)*coorector)+0.025;
        var currentPosition = b4wService.m_trans.get_translation(this.mesh);
        b4wService.m_trans.set_translation_v(this.mesh, [currentPosition[0], -currentOffset, currentPosition[2]]);
      }
    };

    /**
     * @description
     * Get current shelf level. If current shelf level undefined then get level from id.
     */
    _Object3d.prototype.getShelfLevel = function () {
      return this.shelfLevel || this.id.split(this.type + '-')[1];
    };

    /**
     * @description 
     * Set shelf level.
     * @param {String} level Current shelf level.
     */
    _Object3d.prototype.setShelfLevel = function (level) {
      level = +level;

      /* Check next position. If next position is busy add or deduct to current level 1 */
      busyPositions[this.groupId].forEach(function (position, index) {
        if (position === level) {
          level > this.shelfLevel ? level = level + 1 : level = level - 1;
        }
      }.bind(this));

      /* Checking value of level on coincidence with last element in collection */
      if (level === busyPositions[this.groupId][busyPositions[this.groupId].length-1]) level = this.shelfLevel;
      
      /* Delete old position */
      if (this.shelfLevel) {
        busyPositions[this.groupId].splice(busyPositions[this.groupId].indexOf(this.shelfLevel), 1);
      }

      var rackLength = _Object3d.getByTypeInGroup(typesOfObjects3d.RACK, this.groupId)[0].length;
      var maxLevel   = Math.floor(rackLength/30);

      /* Check for valid value of level */
      if (level < 1)  level = this.shelfLevel;
      if (level > maxLevel) level = this.shelfLevel;

      /* Add new positon to collection of busy positions */
      busyPositions[this.groupId].push(level);

      this.shelfInPosition(level, this.shelfLevel);
      this.shelfLevel = level;
    };

    /**
     * @description 
     * Set position for objects with type "shelf". 
     * @param {String} newLevel New shelf level.
     * @param {String} oldLevel Old shelf level.
     */
    _Object3d.prototype.shelfInPosition = function (newLevel, oldLevel) {
      var _flip = false; 
      if (angular.isDefined(this.angle) && this.angle !== 0) {
        _flip = true;
        this.flipShelf();
      }

      if (!oldLevel) oldLevel = newLevel; 
      /* local coordinates of child object */
      this.levelCoords = coordinates.levels['level.'+newLevel];
      var _rail        = _Object3d.getByTypeInGroup(typesOfObjects3d.RAIL, this.groupId)[0];

      /* Moving shelf to new position */
      b4wService.m_constraints.remove(this.mesh);
      b4wService.appendToParent(this.mesh, _rail.mesh, this.levelCoords);

      if (_flip) this.flipShelf();

      /* Highlight outline of shelf and brackets */
      b4wService.highlightShelf(this.mesh);
    };

    /**
     * @description 
     * Append object to rail (parent object).
     */
    _Object3d.prototype.appendToRail = function () {
      var _rail = _Object3d.getByTypeInGroup(typesOfObjects3d.RAIL, this.groupId)[0];
      b4wService.appendToParent(this.mesh, _rail.mesh);
    };

    /**
     * @description
     * Flip shelf on 180 degrees.
     */
    _Object3d.prototype.flipShelf = function () {
      var _rail = _Object3d.getByTypeInGroup(typesOfObjects3d.RAIL, this.groupId)[0];
      var _bracketName = this.brackets[this.brackets.length-1].name;

      // this.brackets.forEach(function (_bracket) {
      //   b4wService.m_constraints.remove(_bracket);
      // });

      if (angular.isUndefined(this.angle) || this.angle === 0) {
        this.angle = 180;
        b4wService.m_constraints.remove(this.hanger);
        var length = this.length/1000 - 0.025;
        b4wService.appendToParent(this.hanger, this.mesh, [0, length, 0]);

        if (this.basket) {
          b4wService.m_constraints.remove(this.basket);
          b4wService.appendToParent(this.basket, this.mesh, [0, 0, 0]);
        }

      } else {
        this.angle = 0;
        b4wService.m_constraints.remove(this.hanger);
        b4wService.appendToParent(this.hanger, this.mesh, [0, 0, 0]);

        if (this.basket) {
          var length = this.length/1000 - 0.025;
          b4wService.m_constraints.remove(this.basket);
          b4wService.appendToParent(this.basket, this.mesh, [0, length, 0]);
        }
      }

      b4wService.m_constraints.remove(this.mesh);
      b4wService.flip(this.mesh, this.angle, _bracketName);
      b4wService.appendToParent(this.mesh, _rail.mesh);

      // this.brackets.forEach(function (_bracket) {
      //   b4wService.appendToParent(_bracket, this.mesh);
      // }.bind(this));

    };

    /**
     * @description 
     * 
     */
    _Object3d.prototype.showHung = function () {
      this.hung = true;
      b4wService.show(this.hanger.name);
      this.hangerMount.forEach(function (mount) {
        b4wService.show(mount.name);
      });
    };

    /**
     * @description 
     * 
     */
    _Object3d.prototype.hideHung = function () {
      this.hung = false;
      b4wService.hide(this.hanger.name);
      this.hangerMount.forEach(function (mount) {
        b4wService.hide(mount.name);
      });
    };

    /**
     * @description 
     * Enable outlining of object.
     */
    _Object3d.prototype.pick = function () {
      b4wService.m_scenes.set_outline_color([1, 1, 1]);
      b4wService.m_scenes.apply_outline_anim(this.mesh, 1.2, 1.2, 0);
      if (this.basket) {
        b4wService.m_scenes.apply_outline_anim(this.basket, 1.2, 1.2, 0);
      }
    }

    /**
     * @description 
     * Disable outlining of object.
     */
    _Object3d.prototype.unpick = function () {
      b4wService.m_scenes.clear_outline_anim(this.mesh);
    };

    /**
     * @description 
     * Create new basket for shelf.
     */
    _Object3d.prototype.createBasket = function () {
      var basketName = this.id + '_basket';
      if (this.group.shelfW === namesOfObjects3d.SHELF_350) {
        this.basket = b4wService.copyDetail(this.group.basketName450, basketName);
        b4wService.appendToParent(this.basket, this.mesh, [0, 0, 0]);
      } else {
        this.basket = b4wService.copyDetail(this.group.basketName500, basketName);
        b4wService.appendToParent(this.basket, this.mesh, [0, 0, 0]);
      }
    };

    return _Object3d;
  }

}());