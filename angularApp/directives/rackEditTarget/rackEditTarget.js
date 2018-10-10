(function () {'use strict';

	angular.module('rackApp').directive('rackEditTarget', rackEditTarget);
	function rackEditTarget () {
		return {
			restrict: 'E',
			templateUrl: 'angularApp/directives/rackEditTarget/rackEditTarget.html',
			controller: 'rackEditTargetController', controllerAs: 'rackEditTargetController'
		}
	}

	angular.module('rackApp').controller('rackEditTargetController', rackEditTargetController);
	function rackEditTargetController ($scope, $timeout, editTarget, typesOfObjects3d, rackGroup3d, b4wService, parametersOfRoom) {

		/* Target of editing */
		$scope.target = editTarget.target;
		if ($scope.target) $scope.target.pick();

		$scope.$watch(function(){return editTarget.target;}, function(target) {
			if (target && $scope.target !== target) {
				$scope.target = target;
				this.getShelfs();
				this.getRacks();
				this.getRail();
				$scope.getKitCoordinates();
			}
		}.bind(this));

		/* Input value of kit offset */
		$scope.kitOffset = 0;

		$scope.rackOffset = 0;

		$scope.showShelfs = false;
		$scope.showRacks = false;
		$scope.showMoveKit = false;
		$scope.showCoordinates = false;

		$scope.$on('$destroy', function () {
			$scope.showShelfs = false;
			$scope.showRacks = false;
			$scope.showMoveKit = false;
			$scope.showCoordinates = false;
			$scope.target.objects3d.forEach(function (_object) {
				if (_object.editMode) _object.editMode = false;
			});
		});

		$scope.$on('defaultAdded', function (event, target) {
			editTarget.target = target[0];
			$scope.target = target[0];
			var shelfLevels = target[1];
			var shelfOptions = target[2];

			this.getShelfs();
			this.getRacks();
			$scope.rail = $scope.target.objects3d.filter(function (rail) {
				return rail.type === typesOfObjects3d.RAIL;
			})[0];

			$scope.shelfs.forEach(function (_shelf) {
				var level = shelfLevels[_shelf.number];

				if (level !== null) {
					$scope.shelfDown(_shelf, level);
				};

				if (shelfOptions[_shelf.number]) {
					if (Object.keys(shelfOptions[_shelf.number])[0] === 'flip') $scope.shelfFlip(_shelf);
					if (Object.keys(shelfOptions[_shelf.number])[0] === 'basket') $scope.addBasket(_shelf);
					if (Object.keys(shelfOptions[_shelf.number])[0] === 'hung') $scope.shelfHung(_shelf);
				}
			});
		}.bind(this));

		/**
		 * @description
		 * Remove section and all 3d-objects in section.
		 */
		$scope.sectionDelete = function () {
			$scope.$emit('removeSection', $scope.target);
			$scope.target.remove();
		}

		/* Get shelfs collection */
		this.getShelfs = function () {
			return $scope.shelfs = $scope.target.objects3d.filter(function (shelf) {
				return shelf.type === typesOfObjects3d.SHELF;
			});
		};
		
		if ($scope.target) this.getShelfs();

		/* Racks collection */
		this.getRacks = function () {
			return $scope.racks = $scope.target.objects3d.filter(function (rack) {
				return rack.type === typesOfObjects3d.RACK;
			});		
		};

		if ($scope.target) this.getRacks();

		if ($scope.target) {
			$scope.rail = $scope.target.objects3d.filter(function (rail) {
				return rail.type === typesOfObjects3d.RAIL;
			})[0];		
		}

		this.getRail = function () {
			return $scope.rail = $scope.target.objects3d.filter(function (rail) {
					return rail.type === typesOfObjects3d.RAIL;
			})[0];
		};

		if ($scope.target) this.getRail();

		/**
		 * @description 
		 * Show/hide UI blocks.
		 */
		$scope.toggleShelfs = function () {
			if ($scope.showShelfs) {
				$scope.showShelfs = false;
			} else {
				$scope.showShelfs = true;
			}
		};
		$scope.toggleRacks = function () {
			if ($scope.showRacks) {
				$scope.showRacks = false;
			} else {
				$scope.showRacks = true;
			}
		};
		$scope.toggleBlockMoveKit = function () {
			if ($scope.showMoveKit) {
				$scope.showMoveKit = false;
			} else {
				$scope.showMoveKit = true;
			}
		};
		$scope.toggleBlockCoordinates = function () {
			if ($scope.showCoordinates) {
				$scope.showCoordinates = false;
			} else {
				$scope.showCoordinates = true;
			}
		};

		//////////////////////////////////////////////////////////////
		/////////////////         SHELVES          ///////////////////
		//////////////////////////////////////////////////////////////

		/**
		 * @description
		 * Getting current position of kit.
		 */
		$scope.getKitCoordinates = function () {
			var coord = b4wService.getCoordinates($scope.rail.mesh.name);
			var roomWidth = parametersOfRoom.wallWidth/1000;
			var roomHeight = parametersOfRoom.wallHeight/1000;
			$scope.kitHight = Math.floor((roomHeight - coord[1])*1000);
			$scope.kitWidth = Math.floor((coord[1]   - $scope.target.rackL/1000)*1000);
			$scope.kitLeft  = Math.floor((roomWidth  - coord[2])*1000);
			$scope.kitRight = Math.floor((coord[2]   - $scope.target.railL/1000)*1000);
		}.bind(this);

		/**
		 * Get current position of kit.
		 */
		if ($scope.target) $scope.getKitCoordinates();

		/* Listener of section moving */
		$scope.$on('updateCoordinates' , function () {
			if ($scope.target) {
				$scope.getKitCoordinates();
				$scope.$digest();
			}
		});

		/**
		 * @description
		 * Update position of all section.
		 */
		$scope.updatePosition = function (type) {
			switch (type) {
				case 'top':
					var offset = $scope.kitOffset/1000;
					var coordinates = b4wService.getCoordinates($scope.rail.mesh.name);
					coordinates[1] = coordinates[1] + offset;
					b4wService.setCoordinates($scope.rail.mesh, coordinates);
				break;

				case 'bottom':
					var offset = $scope.kitOffset/1000;
					var coordinates = b4wService.getCoordinates($scope.rail.mesh.name);
					coordinates[1] = coordinates[1] - offset;
					b4wService.setCoordinates($scope.rail.mesh, coordinates);
				break;

				case 'left':
					var offset = $scope.kitOffset/1000;
					var coordinates = b4wService.getCoordinates($scope.rail.mesh.name);
					coordinates[2] = coordinates[2] + offset;
					b4wService.setCoordinates($scope.rail.mesh, coordinates);
				break;

				case 'right':
					var offset = $scope.kitOffset/1000;
					var coordinates = b4wService.getCoordinates($scope.rail.mesh.name);
					coordinates[2] = coordinates[2] - offset;
					b4wService.setCoordinates($scope.rail.mesh, coordinates);
				break;
			}

			$timeout(function () {
				$scope.getKitCoordinates();
				$scope.kitOffset = 0;
			}, 100);
		};

		/**
		 * @description
		 * Add new shelf in sections
		 */
		$scope.addShelf = function () {
			$scope.target.addObjects3d(typesOfObjects3d.SHELF, 1, $scope.target.shelfL);
			this.getShelfs();
		}.bind(this);

		/**
		 * @description 
		 * Show block with buttons of item
		 * @param  {Object} item 
		 */
		$scope.editOpen = function (item) {
			item.pick();
			item.editMode  = true;
		};

		/**
		 * @description 
		 * Hide block with buttons of item
		 * @param  {Object} item 
		 */
		$scope.editClose = function (item) {
			item.unpick();
			item.editMode  = false;
		};

		/**
		 * @description 
		 * Change position of shelf to down.
		 * @param  {Object} shelf 
		 */
		$scope.shelfUp = function (shelf, level) {
			var _level = level ? level : Number(shelf.getShelfLevel()) - 1;
			shelf.setShelfLevel(String(_level));
		};

		/**
		 * @description 
		 * Change position of shelf to down.
		 * @param  {Object} shelf 
		 */
		$scope.shelfDown = function (shelf, level) {
			var _level = level ? level : Number(shelf.getShelfLevel()) + 1;
			shelf.setShelfLevel(String(_level));
		};

		/**
		 * @description 
		 * Delete shelf in section.
		 * @param  {Object} shelf 
		 */
		$scope.shelfDelete = function (shelf) {
			$scope.target.objects3d.splice($scope.target.objects3d.indexOf(shelf), 1);
			$scope.shelfs.splice($scope.shelfs.indexOf(shelf), 1);
			shelf.remove();
		};

		/**
		 * @description
		 * Flip shelf on 180.
		 * @param  {Object} shelf 
		 */
		$scope.shelfFlip = function (shelf) {
			shelf.flipShelf();
		};

		/**
		 * @description
		 * Show/Hide hung of shelf
		 * @param  {Object} shelf 
		 */
		$scope.shelfHung = function (shelf) {
			shelf.hung ? shelf.hideHung() : shelf.showHung();
		};

		/**
		 * @description 
		 * 
		 * @param  {[type]} rack [description]
		 */
		$scope.updateAvalibleRack = function (rack) {
			$scope.avalibleRack = rack;
		};

		/**
		 * @description 
		 * 
		 * @param  {Object} shelf Editing shelf
		 */
		$scope.shelfCrop = function (shelf) {
			var coordinates = b4wService.getLocalCoordinates($scope.avalibleRack.mesh, $scope.rail.mesh);
			var length = Math.floor(-coordinates[1]*1000+25);
			shelf.length = length;
			shelf.updateBrackets(length);

			var shelfL = -1 + (2/1500 * length);
			b4wService.setDetailLength(shelf.mesh, shelfL);

			var hangerL = -1 + (2/3000 * length);
			b4wService.setDetailLength(shelf.hanger, hangerL);
		};

		/**
		 * @description 
		 * 
		 * @param  {Object} shelf Editing shelf
		 */
		$scope.addBasket = function (shelf) {
			shelf.createBasket();

			var offset  = (shelf.length-545)/1000;
			var offset2 = shelf.length-545;
			var targetRack = $scope.racks.filter(function (_rack) {
				return _rack.number === $scope.racks.length-1;
			})[0];
			
			b4wService.m_constraints.remove(shelf.basket);
			b4wService.appendToParent(shelf.basket, shelf.mesh, [0, offset, 0]);

			// $scope.rackOffset = offset2;
			// $scope.movementRack(targetRack);

			// b4wService.m_constraints.remove(targetRack.mesh);
			// b4wService.appendToParent(targetRack.mesh, $scope.rail.mesh, [0, 0, offset]);

			$scope.avalibleRack = targetRack;
			$scope.shelfCrop(shelf);
		};


		//////////////////////////////////////////////////////////////
		/////////////////          RACKS           ///////////////////
		//////////////////////////////////////////////////////////////

		/**
		 * @description
		 * 
		 */
		$scope.addRack = function () {
			var newRack = $scope.target.addObjects3d(typesOfObjects3d.RACK, 1, $scope.target.rackL);
			this.getRacks();
			$scope.rackOffset = $scope.target.railL/$scope.target.rackQ;
			$scope.movementRack($scope.racks[$scope.racks.length-1]);
			return newRack[0];
		}.bind(this);

		/**
		 * @description 
		 * 
		 * @param  {Object} rack 
		 */
		$scope.removeRack = function (rack) {
			/* Delete brackets */
			$scope.shelfs.forEach(function (_shelf) {
				_shelf.brackets.forEach(function (_bracket) {
					var splited = _bracket.name.split('-');
					var number = splited[splited.length-1];

					if (rack.number == number) {
						b4wService.m_scenes.remove_object(_bracket);
					}
				});
			});

			$scope.target.objects3d.splice($scope.target.objects3d.indexOf(rack), 1);
			$scope.racks.splice($scope.racks.indexOf(rack), 1);
			rack.remove();
		};

		/**
		 * @description 
		 * 
		 * @param  {[type]} offset [description]
		 */
		$scope.updateRackOffset = function (offset) {
			$scope.rackOffset = offset;
		};
		

		/**
		 * @description 
		 * 
		 * @param  {Object} rack      
		 */
		$scope.movementRack = function (rack) {
			var offset = $scope.rackOffset/1000;
			var coordinates = [0, offset, 0];
			b4wService.m_constraints.remove(rack.mesh);
			b4wService.appendToParent(rack.mesh, $scope.rail.mesh, coordinates);
			$scope.rackOffset = 0;

			/* Update brackets position */
			$scope.shelfs.forEach(function (_shelf) {
				_shelf.brackets.forEach(function (_bracket) {
					var splited = _bracket.name.split('-');
					var number = Number(splited[splited.length-1]);

					if (rack.number === number) {
						_bracket.currentOffset = -offset/1000;
						b4wService.m_constraints.remove(_bracket);
						b4wService.appendToParent(_bracket, _shelf.mesh, coordinates);
					}
				});
			});
		};

	}

}());