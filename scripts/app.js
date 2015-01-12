
// props Dmitry Mina from Stack Overflow: http://stackoverflow.com/questions/16709373/angularjs-how-to-call-controller-function-from-outside-of-controller-component
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

$(document).ready(function(){

	if (location.search != null && location.search.length > 0) {
		var controller = angular.element($('#xcomController')).scope();
		var _class = getParameterByName("class");
		controller.showClass(_class);
		controller.$apply();
	}
});

var xcomApp = angular.module('xcomApp', []);

xcomApp.factory('DataService', function($http, $q) {		
	
	function DataService() {
		var self = this;
		self.commonJson = null;
		self.psionicsJson = null;
		self.geneModsJson = null;

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

		self.getPsionics = function() {
			var deferred = $q.defer();
			if (self.psionicsJson !== null) {
				deferred.resolve(self.psionicsJson);
			} else {
				$http.get('data/psionics.json')
					.success(function(data) {
						self.psionicsJson = data;
						deferred.resolve(data);
					})
					.error(function(response) { 
						deferred.reject(response);
					});
			}
			return deferred.promise;
		}

		self.getGeneMods = function() {
			var deferred = $q.defer();
			if (self.geneModsJson !== null) {
				deferred.resolve(self.geneModsJson);
			} else {
				$http.get('data/gene_mods.json')
					.success(function(data) {
						self.geneModsJson = data;
						deferred.resolve(data);
					})
					.error(function(response) { 
						deferred.reject(response);
					});
			}
			return deferred.promise;
		}
	}
	
	return new DataService();
		
});

xcomApp.controller('xcomController', function($scope, $http, DataService) {

	$scope.menuItems = [];
	$scope.tabs = [];
	
	$scope.ranks = [];

	$scope.build = {};
	$scope.showPerkDetails = false;
	$scope.perkInDetails = {};
	
	$scope.class = null;
	$scope.perks = [];
	$scope.armors = [];
	$scope.primaryWeapons = [];
	$scope.secondaryWeapons = [];
	$scope.equipment = [];	
	$scope.visibleTab = "perks";
	$scope.icons = [];
	$scope.description = '';
	$scope.displayDescription = false;

	$scope.psionicRanks = [];
	$scope.psionicsPerks = [];

	$scope.geneMods = [];
	
	$scope.selectedPerks = [];
	$scope.selectedGeneMods = [];
	$scope.selectedPsionicPerks = [];
	$scope.selectedPrimaryWeapon = null;
	$scope.selectedSecondaryWeapon = null;
	$scope.equipmentSlotOne = null;
	$scope.equipmentSlotTwo = null
	$scope.selectedClass = null;
	$scope.selectedArmor = null;
		
	$scope.linkText = '';

	$scope.buildLink = function() {

		var link = "";
		link += "class=" + encodeURIComponent($scope.selectedClass);
		
		link += "&perks=";
		var perks = "";
		for (var i = 0; i < $scope.selectedPerks.length; i++) {
			if ($scope.selectedPerks[i] != null) {
				perks += $scope.selectedPerks[i].id + ",";
			}
		}
		link += encodeURIComponent(perks.replace(/^,|,$/g,''));

		link += "&psionics=";
		perks = "";
		for (var i = 0; i < $scope.selectedPsionicPerks.length; i++) {
			if ($scope.selectedPsionicPerks[i] != null) {
				perks += $scope.selectedPsionicPerks[i].id + ",";
			}
		}
		link += encodeURIComponent(perks.replace(/^,|,$/g,''));

		link += "&geneMods=";
		perks = "";
		for (var i = 0; i < $scope.selectedGeneMods.length; i++) {
			if ($scope.selectedGeneMods[i] != null) {
				perks += $scope.selectedGeneMods[i].id + ",";
			}
		}		
		link += encodeURIComponent(perks.replace(/^,|,$/g,''));

		if ($scope.selectedPrimaryWeapon != null) {
			link += "&primaryWeapon=" + encodeURIComponent($scope.selectedPrimaryWeapon.id);
		}

		if ($scope.selectedSecondaryWeapon != null) {
			link += "&secondaryWeapon=" + encodeURIComponent($scope.selectedSecondaryWeapon.id);
		}

		if ($scope.selectedArmor != null) {
			link += "&selectedArmor=" + encodeURIComponent($scope.selectedArmor.id);
		}

		if ($scope.equipmentSlotOne != null) {
			link += "&equipmentSlotOne=" + encodeURIComponent($scope.equipmentSlotOne.id);
		}

		if ($scope.equipmentSlotTwo != null) {
			link += "&equipmentSlotTwo=" + encodeURIComponent($scope.equipmentSlotTwo.id);
		}

		var tinyUrl = "http://localhost?" + link;
		
		$scope.linkText = tinyUrl;		       
	}

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
			},
			"damage_bonus" : 0
		};

		$scope.selectedClass = null;
		$scope.selectedGeneMods = [];
		$scope.selectedPsionicPerks = [];
		$scope.selectedPrimaryWeapon = null;
		$scope.selectedSecondaryWeapon = null;
		$scope.icons = [];

	}

	DataService.getCommonJson().then (
        // success
        function (commonJson) { //success
			$scope.menuItems = commonJson.classes;
			$scope.tabs = commonJson.tabs;
			$scope.ranks = commonJson.ranks;
			$scope.armors = commonJson.armors;
		}, 
        // failure
        function (commonJson) {
		
		}
	);

	DataService.getPsionics().then (
		function(psionicsJson) {
			
			$scope.psionicsPerks = psionicsJson.psionics;
		},
		function (psionicsJson) {

		}
	);

	DataService.getGeneMods().then (
		function(json) {
			$scope.geneMods = json.gene_mods;
		},
		function(json) {

		}
	);

	$scope.isActive = function (id) {
		return ($scope.class != null && $scope.class.id === id);
	}

	$scope.showClass = function(id) {
		$scope.resetBuild();

		var classJson = DataService.getClassJson(id);
		
		$scope.class = classJson;
		$scope.selectedClass = id;

		DataService.getCommonJson().then (
            // success
            function (commonJson) {

				for (var i = 0; i < classJson.spec.perks.length; i++) {
					$scope.perks[i] = [];
					for (var j = 0; j < classJson.spec.perks[i].perks.length; j++) {
						
						for (var k = 0; k < commonJson.perks.length; k++) {							
							if (commonJson.perks[k].id === classJson.spec.perks[i].perks[j].id) {

								$scope.perks[i][j] = commonJson.perks[k];

								if (i == 0) {
									$scope.choosePerk(commonJson.perks[k], i, null);
								}

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

				var secondaryWeapons = Enumerable.From(commonJson.secondary_weapons);
				for (var i = 0; i < classJson.spec.secondary_weapons.length; i++) {
				    var weaponClass = Object.keys(classJson.spec.secondary_weapons[i])[0];
				    var weapons = secondaryWeapons.Where("$.type == '" + weaponClass + "'").Select("$.weapons").ToArray()[0];
				    if (weapons != null && weapons.length > 0) {
				    	$scope.secondaryWeapons = $scope.secondaryWeapons.concat(weapons);
				    }
				}

				var equipment = Enumerable.From(commonJson.items);
				$scope.equipment = equipment.Where("$.classes === '' || $.classes.indexOf('" + id + "') > 0").Select("$").ToArray();

			},
            // failure
            function (commonJson) {

			}
		);
	}
	
	$scope.choosePerk = function(perk, rank, btnElement) {
	
		var stat_mods = $scope.class.spec.stat_progression[rank];

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

			$scope.icons = $scope.icons.filter(
				function(icon) { 
					return icon.id !== currentPerk.id; 
				});

			if (perk.id == currentPerk.id) return;

		}

		$scope.build.mod.aim += perk.aim_bonus;
		$scope.build.mod.mob += perk.mobility_bonus;
		$scope.build.mod.will += perk.will_bonus;
		$scope.build.damage_bonus += perk.damage_bonus;

		$scope.build.rank_ups.aim += stat_mods.aim;
		$scope.build.rank_ups.will_low += stat_mods.will_low;
		$scope.build.rank_ups.will_high += stat_mods.will_high;
		$scope.build.rank_ups.health += stat_mods.health;

		$scope.icons.push(
			{
		 		id: perk.id,
		 		img_url: perk.img_src,
		 		title: perk.title,
		 		description: perk.description
		 	}
		 );

		$scope.selectedPerks[rank] = perk;

	}
	
	$scope.choosePsiPerk = function(perk, rank, btnElement) {

		if ($scope.selectedPsionicPerks[rank] != null) {

			var currentPerk = $scope.selectedPsionicPerks[rank];

			$("input[name='psi" + rank + "']").each(function(checkbox) { 
				var chk = $(this);
				chk.prop("checked", false);
				chk.parent().removeClass("active");
			});

			$scope.icons = $scope.icons.filter(
				function(icon) { 
					return icon.id !== currentPerk.id; 
				});

			$scope.selectedPsionicPerks[rank] = null;

			if (perk.id == currentPerk.id) return;
		}

		$scope.icons.push(
			{
		 		id: perk.id,
		 		img_url: perk.img_src,
		 		title: perk.title,
		 		description: perk.description
		 	}
		 );

		$scope.selectedPsionicPerks[rank] = perk;

	}

	$scope.chooseGeneMod = function(perk, rank, btnElement) {

		var currentPerk = $scope.icons.filter(
				function(icon) { 
					return icon.id === perk.id; 
				});

		if (currentPerk != null && currentPerk.length > 0) {

			$scope.icons = $scope.icons.filter(
					function(icon) { 
						return icon.id !== perk.id; 
					});
			return;

		};

		$scope.icons.push(
			{
		 		id: perk.id,
		 		img_url: perk.img_src,
		 		title: perk.title,
		 		description: perk.description
		 	}
		 );

	}

	$scope.showDetails = function(perk) {
		$scope.showPerkDetails = true;
		$scope.perkInDetails = perk;
	}

	$scope.hideDetails = function() {
		$scope.showPerkDetails = false;
	}

	$scope.showTab = function(tabName) {
		$scope.visibleTab = tabName;
	}

	$scope.showDescription = function(description) {
		$scope.description = description;
		$scope.displayDescription = true;
	}

	$scope.hideDescription = function() {
		$scope.displayDescription = false;
	}

});
