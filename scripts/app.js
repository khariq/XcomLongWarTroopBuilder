var xcomApp = angular.module('xcomApp', []);

xcomApp.factory('DataService', function($http, $q) {		
	
	function DataService() {
		var self = this;
		self.commonJson = null;
		
		self.getCommonJson = function() {
			var deferred = $q.defer();
			if (self.commonJson !== null) {
				deferred.resolve(self.commonJson);
			} else {
				$http.get('data/common.json')
					.success(function(data) {
						self.commonJson = data;
						deferred.resolve(data);
					})
					.error(function(response) { 
						deferred.reject(response);
					});
			}
			return deferred.promise;
		}
		
		var classJson = [];
		
		self.getClassJson = function(className) {
			this.getCommonJson();
			for (var i = 0; i < this.commonJson.classes.length; i++) {
				if (this.commonJson.classes[i].id === className) {
					return this.commonJson.classes[i];
				}
			}
		}

		self.getPerk = function (perkName) {
			this.getCommonJson();
			for (var i = 0; i < this.commonJson.perks.length; i++) {
				if (this.commonJson.perks[i].id === perkName) {
					return this.commonJson.perks[i];
				}
			}
		}
	}
	
	return new DataService();
		
});

xcomApp.controller('xcomController', function($scope, $http, DataService) {

	$scope.menuItems = [];
	$scope.tabs = [];
	
	$scope.ranks = [];

	$scope.build = {};

	$scope.resetBuild = function() {
		$scope.build  = {

			"hp" : 5,
			"armor" : 0,
			"mobility" : 13,
			"aim" : 65,
			"will" : 35,
			"defense" : 0,
			"damage_reduction" : 0,
			"mod" : {
				"aim" : 0,
				"mob" : 0,
				"will" : 0
			},
			"rank_ups" : {
				"health" : 0,
				"aim" : 0,
				"will_low" : 0,
				"will_high" : 0	
			}
		};
	}

	DataService.getCommonJson().then (
        // success
        function (commonJson) { //success
			$scope.menuItems = commonJson.classes;
			$scope.tabs = commonJson.tabs;
			$scope.ranks = commonJson.ranks;

		}, 
        // failure
        function (commonJson) {
		
		}
	);

	$scope.isActive = function (id) {
		return ($scope.class != null && $scope.class.id === id);
	}

	$scope.class = null;
	$scope.perks = [];
	$scope.armors = [];
	$scope.primaryWeapons = [];
	$scope.secondaryWeapons = [];
	$scope.equipment = [];

	$scope.showClass = function(id) {
		var classJson = DataService.getClassJson(id);
		$scope.class = classJson;
		
		$scope.resetBuild();

		$scope.perks = [];
		$scope.armors = [];
		$scope.primaryWeapons = [];
		$scope.secondaryWeapons = [];
		$scope.equipment = [];
		$scope.equipmentSlots = [{},{}];
		DataService.getCommonJson().then (
            // success
            function (commonJson) {

				for (var i = 0; i < classJson.spec.perks.length; i++) {
					$scope.perks[i] = [];
					for (var j = 0; j < classJson.spec.perks[i].perks.length; j++) {
						
						for (var k = 0; k < commonJson.perks.length; k++) {
							if (commonJson.perks[k].id === classJson.spec.perks[i].perks[j].id) {
								$scope.perks[i][j] = commonJson.perks[k];
								break;
							}
						}

					}
				}

				var primaryWeapons = Enumerable.From(commonJson.primary_weapons);
				for (var i = 0; i < classJson.spec.primary_weapons.length; i++) {
				    var weaponClass = Object.keys(classJson.spec.primary_weapons[i])[0];
				    var weapons = primaryWeapons.Where("$.type == '" + weaponClass + "'").Select("$.weapons").ToArray()[0];
				    if (weapons != null && weapons.length > 0) {
				    	$scope.primaryWeapons = $scope.primaryWeapons.concat(weapons);
				    }
				}

			},
            // failure
            function (commonJson) {

			}
		);
	}
	
	$scope.selectedPerks = [];

	$scope.choosePerk = function(perk, rank, btnElement) {
	
		var stat_mods = $scope.class.spec.stat_progression[rank];

		btnElement = $(btnElement);

		if ($scope.selectedPerks[rank] != null) {
			//deselect currently selected perk at this rank

			var currentPerk = $scope.selectedPerks[rank];
			$scope.build.mod.aim -= currentPerk.aim_bonus;
			$scope.build.mod.mob -= currentPerk.mobility_bonus;
			$scope.build.mod.will -= currentPerk.will_bonus;

			$scope.build.rank_ups.aim -= stat_mods.aim;
			$scope.build.rank_ups.will_low -= stat_mods.will_low;
			$scope.build.rank_ups.will_high -= stat_mods.will_high;
			$scope.build.rank_ups.health -= stat_mods.health;
		
			$scope.selectedPerks[rank] = null;

			$("input[name='" + rank + "']").each(function(checkbox) { 
				var chk = $(this);
				chk.prop("checked", false);
				chk.parent().removeClass("active");
			});

			if (perk.id == currentPerk.id) return;

		}

		$scope.build.mod.aim += perk.aim_bonus;
		$scope.build.mod.mob += perk.mobility_bonus;
		$scope.build.mod.will += perk.will_bonus;
		
		$scope.build.rank_ups.aim += stat_mods.aim;
		$scope.build.rank_ups.will_low += stat_mods.will_low;
		$scope.build.rank_ups.will_high += stat_mods.will_high;
		$scope.build.rank_ups.health += stat_mods.health;

		$scope.selectedPerks[rank] = perk;

	}

	$scope.showPerkDetails = false;
	$scope.perkInDetails = {};
	$scope.showDetails = function(perk) {
		$scope.showPerkDetails = true;
		$scope.perkInDetails = perk;
	}

	$scope.hideDetails = function() {
		$scope.showPerkDetails = false;
	}

});
