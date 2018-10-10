(function () {'use strict';

  /**
   * @description
   * Service for control of canvas, with help b4w library.
   */
  angular.module('rackApp').service('b4wService', b4wService);
  function b4wService ($q, $http, typesOfObjects3d, namesOfObjects3d, coordinates, parametersOfRoom) {

    /**
     * Connect b4w modules.
     */
    this.m_app         = b4w.require('app');
    this.m_data        = b4w.require('data');
    this.m_cfg         = b4w.require('config');
    this.m_scenes      = b4w.require('scenes');
    this.m_camera      = b4w.require('camera');
    this.m_objects     = b4w.require('objects');
    this.m_container   = b4w.require('container');
    this.m_preloader   = b4w.require('preloader');
    this.m_mouse       = b4w.require('mouse');
    this.m_math        = b4w.require('math');
    this.m_trans       = b4w.require('transform');
    this.m_material    = b4w.require('material');
    this.m_constraints = b4w.require('constraints');
    this.m_vec3        = b4w.require('vec3');
    this.m_textures    = b4w.require('textures');
    this.m_armature    = b4w.require('armature');

    /**
     * @description
     * Getting path on file of main scene.
     * @return {[type]} [description]
     */
    this.getPath = function () {
      return 'b4wData/scene.json';
    };

    /**
     * @description 
     * Loading 3d-model in scene.
     * @returns {Promise}
     */
    this.load = function (path) {
      return $q(function (resolve) {
        this.m_preloader.create_preloader({
          container_color:"#888",
          bar_color:"#222",  
          frame_color: "#ffff00",
          font_color: "#ffff00"
        });
        this.m_data.load(path, this.loadCallback.bind(this, resolve), this.preloaderCallback.bind(this));
      }.bind(this));
    };

    /**
     * @description 
     * Callback of initializaion scope drawing.
     */
    this.loadCallback = function (resolve) {
      this.m_app.enable_camera_controls();
      this.setCamLimits();
      resolve();
    };

    /**
     * @description
     * Create and start preloader.
     * @param  {Number} percentage
     */
    this.preloaderCallback = function (percentage) {
      this.m_preloader.update_preloader(percentage);
    };


    /**
     * @description
     * Preload all images of textures.
     */
    this.preloadImages = function () {
      $http.get('data/roomSettings.json').then(function (response) {
        return response.data;
      })
      .then(function (materialsCollection) {
        materialsCollection.forEach(function (item) {
          var _path     = 'img/textures/' + item.id + '.jpg';
          var _pathNorm = 'img/textures/' + item.id + '-normalmap.png'
          new Image(_path);
          new Image(_pathNorm);
        });
      })
    };

    /**
     * Preloading textures.
     */
    this.preloadImages();

    /**
     * @description 
     * Show 3d-object in scene.
     * @param  {String} objectName 
     */
    b4wService.prototype.show = function (objectName) {
      var _object = this.m_scenes.get_object_by_name(objectName);
      this.m_scenes.show_object(_object);
    };

    /**
     * @description 
     * Hide 3d-object in scene.
     * @param  {String} objectName 
     */
    b4wService.prototype.hide = function (objectName) {
      var _object = this.m_scenes.get_object_by_name(objectName);
      this.m_scenes.hide_object(_object);
    };

    /**
     * @description
     * Setting limit for camera in scene.
     */
    b4wService.prototype.setCamLimits = function() {
      var camObj = this.m_scenes.get_active_camera();
      this.m_camera.target_set_distance_limits(camObj, {'min': 2, 'max': 10});
      this.m_camera.target_set_vertical_limits(camObj, {'up': 11.5, 'down': 0.1});
      this.m_camera.target_set_horizontal_limits(camObj, {'right': 3.05, 'left': 0.1});
    };

    /**
     * @description 
     * Remove all 3d-object with type MESH.
     */
    b4wService.prototype.clearAll = function() {
      var all = this.m_scenes.get_all_objects('MESH');
      all.forEach(function (item) {
        if (item.name.match(/^bracket/) 
         || item.name.match(/^room/) 
         || item.name.match(/^floor/)
         || item.name.match(/^rail/) 
         || item.name.match(/^rack/) 
         || item.name.match(/^shelf/) 
         || item.name.match(/^shelf/)
         || item.name.match(/^bracket/)
         || item.name.match(/^hanger/)
         || item.name.match(/^hanger-mount/)
         || item.name.match(/^basket-500/)
         || item.name.match(/^basket-450/)
        ) {
          return;
        } else {
          this.m_scenes.remove_object(item);
        }
      }.bind(this));
    };

    /**
     * @description 
     * Add and load detail in scene.
     * @param {String} type 
     * @param {String} detailName 
     * @returns {Object} newObj b4w-mesh object.
     */
    b4wService.prototype.copyDetail = function(parentName, detailName) {
      var parentObject = this.m_scenes.get_object_by_name(parentName);
      var newObj = this.m_objects.copy(parentObject, detailName, true);
      this.m_scenes.append_object(newObj);

      return newObj;
    };

    /**
     * @description 
     * Create unique copy of next object: 'rail-3000'; 'rack-3000', 'shelf-350', 'shelf-450'
     * @param  {String} objectName
     * @param  {String} detailName
     * @param  {Float}  detailLength
     * @return {Object} newObj
     */
    b4wService.prototype.createDetail = function(objectName, detailName, detailLength) {
      var parentObject = this.m_scenes.get_object_by_name(objectName);
      var newObj = this.m_objects.copy(parentObject, detailName, true);
      this.m_scenes.append_object(newObj);

      if (detailLength !== null) this.setDetailLength(newObj, detailLength);

      return newObj;
    };

    /**
     * @description 
     * Setting length of detail (object 3d). 
     * Only for next object: 'rail-3000'; 'rack-3000', 'shelf-350', 'shelf-450'  
     * @param  {Object} _object
     * @param  {Float} length
     */
    b4wService.prototype.setDetailLength = function (_object, length) {
      var listNames = this.m_material.get_materials_names(_object)[0];
      // this.m_objects.set_nodemat_value(_object, [listNames, 'Length'], length);
      this.m_material.set_nodemat_value(_object, [listNames, 'Length'], length);
    };

    /**
     * @description
     * Create not unique copy of bracket-objects and append them to rack-object.
     * @param  {Object} parentObject mesh-object b4w.
     * @param  {Object} bracketName  mesh-object b4w.
     * @param  {Object} rackObject   mesh-object b4w.
     */
    b4wService.prototype.createBrackets = function (parentObject, bracketName, rackObject, shelfQuantity) {
      var all = this.m_scenes.get_all_objects('MESH');
      var brackets = all.filter(function (_object) {
        return _object.name.match(parentObject) && _object.name.match(/^bracket/);
      });

      var newBracketsArr = [];

      brackets.forEach(function (_object) {
        var prefix = _object.name.split(parentObject)[1];
        var newObj = this.m_objects.copy(_object, bracketName + prefix, false);

        this.m_scenes.append_object(newObj);
        this.m_constraints.append_stiff_trans(newObj, rackObject, coordinates.levels[_object.name]);

        var numPrefix = Number(prefix.split('.')[1]); 

        if (numPrefix > shelfQuantity) {
          this.m_scenes.hide_object(newObj);
        }

        newBracketsArr.push(newObj);
      }.bind(this));

      return newBracketsArr;
    };

    /**
     * @description 
     * Getting coordinates of object.
     * @param {String} objectName Name of object 3d in scene.
     * @return {Array} coordinates of object 3d.
     */
    b4wService.prototype.getLocalCoordinates = function (object, parent) {
      var parentPosition = this.m_trans.get_translation(parent);
      var childPosition = this.m_trans.get_translation(object);
      var coordinates = [];
      return this.m_vec3.subtract(parentPosition, childPosition, coordinates);
    };

    /**
     * @description 
     * Getting coordinates of object.
     * @param {String} objectName Name of object 3d in scene.
     * @return {Array} coordinates of object 3d.
     */
    b4wService.prototype.getCoordinates = function (objectName) {
      var _object = this.m_scenes.get_object_by_name(objectName);
      return this.m_trans.get_translation(_object);
    };

    /**
     * @description
     * Setting coordinates of object.
     * @param {Object} object     
     * @param {Array}  coordinates 
     */
    b4wService.prototype.setCoordinates = function (object, coordinates) {
      this.m_trans.set_translation_v(object, coordinates);
    };

    /**
     * @description
     * Append object(CHILD) to rail-object(PARENT).
     * @param  {Object} appendingObject 
     * @param  {Object} railObject      
     */
    b4wService.prototype.appendToParent = function (appendingObject, railObject, newCoordinates) {
      var parentPosition = this.m_trans.get_tsr(railObject);
      var childPosition  = this.m_trans.get_tsr(appendingObject);
      if (newCoordinates) {
        var b4wCoordinates = [newCoordinates[0], newCoordinates[2], newCoordinates[1]];
        // var b4wCoordinates = [newCoordinates[0], newCoordinates[1], newCoordinates[2]];
        this.m_constraints.append_stiff_trans(appendingObject, railObject, b4wCoordinates);
      } else {
        var coordinates = new Float32Array(3); 
        this.m_vec3.subtract(parentPosition, childPosition, coordinates);
        var b4wCoordinates = [-coordinates[0], coordinates[2], -coordinates[1]];
        // var b4wCoordinates = [-coordinates[0], coordinates[1], coordinates[2]];
        this.m_constraints.append_stiff_trans(appendingObject, railObject, b4wCoordinates);
      }
    };

    /**
     * @description
     * Switch off outline on at all objects.
     */
    b4wService.prototype.outlineOff = function () {
      var all = this.m_objects.get_outlining_objects();
      all.forEach(function (_object) {
        this.m_scenes.clear_outline_anim(_object);
      }.bind(this));
    };

    /**
     * @description 
     * Getting bounding box of main wall in scene.
     */
    b4wService.prototype.getBoundingBoxOfWall = function () {
      var room    = this.m_scenes.get_object_by_name('room');
      this.wallBB = this.m_trans.get_object_bounding_box(room);
    };

    /**
     * [limitObjectPosition description]
     * @param  {Object} _object object 3d.
     * @param  {Object} _group  Group of objects 3d.
     */
    b4wService.prototype.limitObjectPosition = function (_object, _group) {
      var objectBB = this.m_trans.get_object_bounding_box(_object);
      var objectPosition = this.m_trans.get_translation(_object);
      
      var min_z = _group.rackL/1000 - 0.05;
      var min_y = (_group.shelfL/1000) - 3;

      var _armature = this.m_scenes.get_object_by_name('Armature');
      var MAX_Y = this.m_armature.get_bone_tsr(_armature, 'Y')[1];
      var MAX_Z = this.m_armature.get_bone_tsr(_armature, 'Z')[2];

      if (objectBB.min_y < MAX_Y) {
        objectPosition[1] += MAX_Y - objectBB.min_y;
      } else if (objectBB.min_y > min_y) {
        objectPosition[1] += min_y - objectBB.min_y;
      }

      if (objectBB.max_z > MAX_Z) {
        objectPosition[2] -= objectBB.max_z - MAX_Z;
      } else if (objectBB.min_z < min_z) {
        objectPosition[2] += min_z - objectBB.min_z;
      }

      this.m_trans.set_translation_v(_object, objectPosition);
    };

    /**
     * @description
     * Set material of wall or floor.
     * @param {String} materialName 
     * @param {String} textureName
     */
    b4wService.prototype.setRoomMaterial = function (materialName, textureName) {
      var _object = this.m_scenes.get_object_by_name('room');
      var _path     = 'img/textures/' + materialName + '.jpg';
      var _pathNorm = 'img/textures/' + materialName + '-normalmap.png'
      this.m_textures.change_image(_object, textureName, _path);
      this.m_textures.change_image(_object, textureName+'-normal', _pathNorm);
    };

    /**
     * @description
     * Set size of room.
     * @param {Number} value
     * @param {String} type
     */
    b4wService.prototype.setRoomSize = function (value, type) {
      var _value = value/1000;
      var _armature = this.m_scenes.get_object_by_name('Armature');
      var weightNames = [];
      var axis = 0;

      /* Get names of bones by type */
      switch (type) {
        case 'width': 
          weightNames = ['X', 'ZX', 'XY', 'ZXY'];          
          axis = 0;
        break;
        case 'height':
          // weightNames = ['Z', 'ZY', 'ZX', 'ZXY'];          
          weightNames = ['Y', 'ZY', 'XY', 'ZXY'];  
          _value = -_value;        
          axis = 1;
        break;
        case 'length':
          weightNames = ['Z', 'ZY', 'ZX', 'ZXY'];          
          // weightNames = ['Y', 'ZY', 'XY', 'ZXY'];          
          axis = 2;
        break;
      }

      weightNames.forEach(function (bone) {
        var TSR = this.m_armature.get_bone_tsr(_armature, bone);
        TSR[axis] = _value;
        this.m_armature.set_bone_tsr(_armature, bone, TSR);
      }.bind(this));
    };

    /**
     * @description 
     * Remove object from scene.
     * @param  {String} objectName 
     */
    b4wService.prototype.remove = function (objectName) {
      var _object = this.m_scenes.get_object_by_name(objectName);
      this.m_scenes.remove_object(_object);
    };

    /**
     * @description
     * 
     * @param  {Object} shelfMesh Shelf object.
     * @param  {Array}  brackets  Array of 3d-object(bracket) current shelf.
     */
    b4wService.prototype.highlightShelf = function (shelfMesh) {
      this.m_scenes.apply_outline_anim(shelfMesh, 1, 1, 1);
    };

    /**
     * @description
     * Calculate and use new coordinates point of pivot. 
     * @param  {Number} length 
     * @param  {Number} height 
     */
    b4wService.prototype.updatePivotByRoom = function (length, height) {
      var length = (length/1000)/2;
      var height = (height/1000)/2;

      length = !length ? 1 : length;
      height = !height ? 1 : height;

      // var coordinates = [0.5, height, length];
      var coordinates = [0.5, -length, height];
      var camObj = this.m_scenes.get_active_camera();
      this.m_camera.target_set_pivot_translation(camObj, coordinates);
    };

    /**
     * @description 
     * Update pivot point of camera
     * @param  {Object}  event
     * @param  {Boolean} runRecursion 
     */
    b4wService.prototype.updatePivot = function (event, runRecursion) {
      var FLOOR_PLANE_NORMAL = [1, 0, 0];
      var _vec3_tmp3         = new Float32Array(3);
      var _pline_tmp         = this.m_math.create_pline();

      var camObj = this.m_scenes.get_active_camera();
      var pivot  = this.m_camera.target_get_pivot(camObj);
      var y      = this.m_mouse.get_coords_y(event);
      var x      = this.m_mouse.get_coords_x(event);
      var pline  = this.m_camera.calc_ray(camObj, x, y, _pline_tmp);
      var point  = this.m_math.line_plane_intersect(FLOOR_PLANE_NORMAL, 0, _pline_tmp, _vec3_tmp3);

      if (point[1] > parametersOfRoom.wallHeight/1000-0.5) point[1] = parametersOfRoom.wallHeight/1000 - 0.5;
      if (point[1] < 0) point[1] = 0.5;
      if (point[2] > parametersOfRoom.wallWidth/1000-0.5) point[2] = parametersOfRoom.wallWidth/1000 - 0.5;
      if (point[2] < 0) point[2] = 0.5;

      this.lastIterH  = point[1] === pivot[1] ? this.lastIterH : (point[1] < pivot[1] ? - 0.01 : + 0.01);
      this.lastIterW  = point[2] === pivot[2] ? this.lastIterW : (point[2] < pivot[2] ? - 0.01 : + 0.01);
      var newCoordH   = point[1] < pivot[1] ? pivot[1] - 0.01 : (point[1] > pivot[1] ? pivot[1] + 0.01 : pivot[1] + this.lastIterH);
      var newCoordW   = point[2] < pivot[2] ? pivot[2] - 0.01 : (point[2] > pivot[2] ? pivot[2] + 0.01 : pivot[2] + this.lastIterW);
      var coordinates = [0.5, newCoordH, newCoordW];
      // var newCoordH = point[1] < pivot[1] ? pivot[1] - 0.01 : pivot[1] + 0.01;
      // var newCoordW = point[2] < pivot[2] ? pivot[2] - 0.01 : pivot[2] + 0.01;
      // var coordinates = [0.5, point[1], point[2]];
      this.m_camera.target_set_pivot_translation(camObj, coordinates);

      if (runRecursion) {
          this.updatePivot(event);
      }
    };


    /**
     * @description
     * Rotate shelf on 180 degrees.
     */
    b4wService.prototype.flip = function (object, angle, bracketName) {
      var bracket = this.m_scenes.get_object_by_name(bracketName);
      var _coordinates = this.m_trans.get_translation(bracket);
      // _coordinates[1] = angle === 0 ? _coordinates[1]-0.013 : _coordinates[1]+0.013;
      this.m_trans.set_translation_v(object, _coordinates);
      angle === 0 ? this.m_trans.rotate_x_local(object, 3.14157) : this.m_trans.rotate_x_local(object, -3.14157);
    };

  }
}());