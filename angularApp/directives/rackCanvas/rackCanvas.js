(function () {'use strict';

  /**
   * @description 
   * It is derective for control canvas element or scope drawing. 
   */
  angular.module('rackApp').directive('rackCanvas', rackCanvas);
  function rackCanvas () {
    return {
      restrict: 'E',
      templateUrl: 'angularApp/directives/rackCanvas/rackCanvas.html',
      controller: 'rackCanvasController', controllerAs: 'controlls'
    };
  }

  /**
   * @description 
   * It is controller of derective for scope drawing. 
   */
  angular.module('rackApp').controller('rackCanvasController', rackCanvasController);
  function rackCanvasController ($scope, b4wService, rackGroup3d) {
    //Куда бы это поместить.
    var message="Правый клик запрещен!";
    function clickIE4(){
      if (event.button==2){
        return false;
      }
    }

    function clickNS4(e){
      if (document.layers||document.getElementById && !document.all){
        if (e.which===2||e.which===3){
          return false;
        }
      }
    }

    if (document.layers){
      document.captureEvents(Event.MOUSEDOWN);
      document.onmousedown=clickNS4;
    } else if (document.all&&!document.getElementById){
      document.onmousedown=clickIE4;
    }

    document.oncontextmenu=new Function("return false");



    /**
     * @property {Object|null} activeObject
     */
    this.activeObject = null;

    /**
     * @property {Boolean} dragMode 
     */
    this.dragMode = false;

    /**
     * b4w modules.
     */
    this.m_app       = b4wService.m_app;
    this.m_data      = b4wService.m_data;
    this.m_camera    = b4wService.m_camera;
    this.m_scenes    = b4wService.m_scenes;
    this.m_container = b4wService.m_container;
    this.m_mouse     = b4wService.m_mouse;
    this.m_objects   = b4wService.m_objects;
    this.m_math      = b4wService.m_math;
    this.m_trans     = b4wService.m_trans;
    this.m_cfg       = b4wService.m_cfg;

    var _vec3_tmp = new Float32Array(3);
    var _vec3_tmp3 = new Float32Array(3);
    var _pline_tmp = this.m_math.create_pline();
    var FLOOR_PLANE_NORMAL = [1, 0, 0];

    /**
     * @description
     * Configs 3d-application.
     * @type {Object}
     */
    this.initConfig = {
      canvas_container_id: 'main_canvas_container',
      alpha: true,
      enable_selectable: true,
      background_color: new Float32Array([1,1,1]), 
      prevent_caching: false,
      autoresize: true,
      show_fps: true,
      quality: this.m_cfg.P_ULTRA
    };

    /**
     * @description 
     * Initialization of scope drawing 3d application.
     */
    this.init = function () {
      this.m_app.init(angular.extend(this.initConfig, {
        callback: function (canvasElement) {
          b4wService.load(b4wService.getPath())
          .then(function () {
            b4wService.getBoundingBoxOfWall();
            $scope.$emit('loadingIsComplete');
          }.bind(this));
          this.listenersActivation(canvasElement);
        }.bind(this)
      }));
    };

    /**
     * @description 
     * Activate listeners of events on canvas element.
     * @param {String} canvasElement DOM element canvas
     */
    this.listenersActivation = function (canvasElement) {
      canvasElement.addEventListener('mousedown',  this.eventCanvasDown.bind(this));
      canvasElement.addEventListener('touchstart', this.eventCanvasDown.bind(this));

      canvasElement.addEventListener('mouseup',  this.eventCanvasUp.bind(this));
      canvasElement.addEventListener('touchend', this.eventCanvasUp.bind(this));

      canvasElement.addEventListener('mousemove', this.eventCanvasMove.bind(this));
      canvasElement.addEventListener('touchmove', this.eventCanvasMove.bind(this));
    };

    /**
     * @description
     * 
     * @param  {Object} event
     */
    this.eventCanvasDown = function (event) {
      if (event.which === 1) {
        this.dragMode = true;

        if (event.preventDefault) {
          event.preventDefault();
        }

        var y = this.m_mouse.get_coords_y(event);
        var x = this.m_mouse.get_coords_x(event);
        this.activeObject = this.m_scenes.pick_object(x, y);

        if (this.activeObject) {
          var groupId = this.activeObject.name.split('_')[0];
          var _group  = rackGroup3d.getById(groupId);

          _group.objects3d.forEach(function (_object) {
            this.m_scenes.set_outline_color([1, 1, 1]);
            this.m_scenes.apply_outline_anim(_object.mesh, 1.2, 1.2, 0);
          }.bind(this));
        }
      }
    };

    this.eventCanvasUp = function (event) {
      this.dragMode = false;
      this.activeObject = null;
      b4wService.outlineOff();
      if (!this.enabledCameraControls) {
        this.m_app.enable_camera_controls();
        this.enabledCameraControls = true;
      }
    };

    /**
     * @description 
     * Move details by wall.
     */
    this.eventCanvasMove = function (event) {
      if (this.dragMode && this.activeObject && event.which === 1) {
        if (this.enabledCameraControls) {
          this.m_app.disable_camera_controls();
          this.enabledCameraControls = false;
        }

        var _camObj = this.m_scenes.get_active_camera();
        var y = this.m_mouse.get_coords_y(event);
        var x = this.m_mouse.get_coords_x(event);

        var groupId = this.activeObject.name.split('_')[0];
        var _group  = rackGroup3d.getById(groupId);
        var _rail   = _group.getRail();

        var pline = this.m_camera.calc_ray(_camObj, x, y, _pline_tmp);
        var camera_ray = this.m_math.get_pline_directional_vec(pline, _vec3_tmp);
        var point = this.m_math.line_plane_intersect(FLOOR_PLANE_NORMAL, 0, _pline_tmp, _vec3_tmp3);
        this.m_trans.set_translation_v(_rail.mesh, point);

        var groupId = _rail.mesh.name.split('_')[0];
        var _group  = rackGroup3d.getById(groupId);
        b4wService.limitObjectPosition(_rail.mesh, _group);
        /* Broadcast about change of position */
        $scope.$broadcast('updateCoordinates');
      }

      /* Update pivot point */
      if (event.which === 3) {
        b4wService.updatePivot(event, true);
      }
    };

    /**
     * @description 
     * Event listener of start 3d application.
     */
    $scope.$on('start', function() {
      this.init();
    }.bind(this));

  }
}());