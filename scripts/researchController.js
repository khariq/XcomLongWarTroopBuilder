
xcomApp.controller('researchController', function($scope, $http, DataService) {

	$scope.researchPath = [];

	$scope.researchedTechIds = [];

	$scope.availableTechs = [];

	$scope.allTechs = [];

	$scope.allUnlocks = [];

	$scope.techTree = [];

	$scope.techJson = null;

	$scope.description = {};

	$scope.filter_autopsies = false;
	$scope.filter_interrogations = false;
	$scope.filter_ufo = false;
	$scope.filter_xenology = true;
	$scope.filter_materials = true;
	$scope.filter_armor = true;
	$scope.filter_laser = true;
	$scope.filter_plasma = true;
	$scope.filter_name_search = "";
	$scope.filter_unlocks_item_search = "";
	$scope.filter_input_item_search = "";
	
	$scope.applyFilters = function (array) {

		if ($scope.filter_name_search != "") {

			array = $scope.allTechs.filter(function (tech) { return tech.name.toLowerCase().indexOf($scope.filter_name_search.toLowerCase()) > -1; });

		} else if ($scope.filter_unlocks_item_search != "") {

			array = $scope.allTechs.filter(function (tech) {
				if (tech.unlocks != null) {
					var a = $.grep(tech.unlocks, function (unlock) { return unlock.id.toLowerCase().indexOf($scope.filter_unlocks_item_search.toLowerCase()) >= 0; });
					if (a != null && a.length > 0) {
						return true;
					}
				} else {
					return false;
				}
				return false;
			});

		} else if ($scope.filter_input_item_search != "") {

			array = $scope.allTechs.filter(function (tech) {
				if (tech.costs != null) {
					var a = $.grep(tech.costs, function (cost) { return cost.id.toLowerCase().indexOf($scope.filter_input_item_search.toLowerCase()) >= 0; });
					if (a != null && a.length > 0) {
						return true;
					}
				} else {
					return false;
				}
				return false;
			});
		} else {

			if ($scope.filter_autopsies == false) {
				array = array.filter(function (tech) { return tech.type != "Alien Autopsies" });
			}

			if ($scope.filter_interrogations == false) {
				array = array.filter(function (tech) { return tech.type != "Alien Interrogations" });
			}

			if ($scope.filter_ufo == false) {
				array = array.filter(function (tech) { return tech.type != "UFO Analysis" });
			}

			if ($scope.filter_xenology == false) {
				array = array.filter(function (tech) { return tech.type != "Xenology" });
			}

			if ($scope.filter_materials == false) {
				array = array.filter(function (tech) { return tech.type != "Materials and Aerospace" });
			}

			if ($scope.filter_armor == false) {
				array = array.filter(function (tech) { return tech.type != "Armor and SHIVs" });
			}

			if ($scope.filter_laser == false) {
				array = array.filter(function (tech) { return tech.type != "Laser and Gauss Weapons" });
			}

			if ($scope.filter_plasma == false) {
				array = array.filter(function (tech) { return tech.type != "Plasma Weapons" });
			}
		}

		return array;

	}

	$scope.baseSettings = {
		'scientists' : 10,
		'labs' : 0,
		'adjacencies' : 0
	}
	
	$scope.bom = {
		"duration" : 0,
		"alien_alloys" : 0,
		"other" : "",
		"elerium" : 0,
		"weapon_fragments" : 0,
		"meld" : 0
	}

	$scope.resetBillOfMaterials = function() {
		$scope.bom = {
			"duration" : 0,
			"alien_alloys" : 0,
			"other" : "",
			"elerium" : 0,
			"weapon_fragments" : 0,
			"meld" : 0
		};
	}

	$scope.researchTech = function(tech) {

		if ($scope.techCanBeResearched(tech) == false) {
			for (var i = 0; i < tech.prereq.length; i++) {
				var result = $.grep($scope.allTechs, function (e) { return e.id == tech.prereq[i]; });
				if (result != null) {
					$scope.researchTech(result[0]);
				}
			}
		}

		var result = $.grep($scope.researchPath, function (e) { return e.id == tech.id; } );
		if (result == null || result.length == 0) {
			$scope.researchPath.push(tech);
		}

		$scope.researchedTechIds.push(tech.id);

		$scope.availableTechs = [];

		for (var i = 0; i < $scope.allTechs.length; i++) {
			var next_tech = $scope.allTechs[i];
			if ($scope.techIsResearched(next_tech) == false && $scope.techCanBeResearched(next_tech)) {
				$scope.availableTechs.push(next_tech);
			}
		}

		$scope.bom.duration += $scope.duration(tech);
		
		var query = tech.costs.filter(function(c) { return c.id == "alien_alloys" });
		if (query.length > 0) {
			$scope.bom.alien_alloys += query[0].quantity;
		}

		query = tech.costs.filter(function(c) { return c.id == "elerium" });
		if (query.length > 0) {
			$scope.bom.elerium += query[0].quantity;
		}

		query = tech.costs.filter(function(c) { return c.id == "weapon_fragments" });
		if (query.length > 0) {
			$scope.bom.weapon_fragments += query[0].quantity;
		}

		query = tech.costs.filter(function(c) { return c.id == "meld" });
		if (query.length > 0) {
			$scope.bom.meld += query[0].quantity;
		}

		query = tech.costs.filter(function(c) { return c.id != "meld" && c.id != "weapon_fragments" && c.id != "elerium" && c.id != "alien_alloys" });
		if (query.length > 0) {
			for (var i = 0; i < query.length; i++) {
				if ($scope.bom.other != null && $scope.bom.other.length > 0) {
					$scope.bom.other += ", ";
				}
				$scope.bom.other += +query[i].quantity + " " + query[i].id;
			}
		}
		$scope.filter_name_search = ""
	}

	$scope.removeTech = function (tech) {

	}

	$scope.techIsResearched = function(tech) {
		
		var isResearched = ($.inArray(tech.id, $scope.researchedTechIds) >= 0);

		return isResearched;
	}

	$scope.techCanBeResearched = function(tech) {

		var allPrereqsSatisfied = true;
		for (var i = 0; i < tech.prereq.length; i++) {
			if ($.inArray(tech.prereq[i], $scope.researchedTechIds) <0) {
				if (tech.prereq[i] == $scope.hoverTech)
					continue;
				allPrereqsSatisfied = false;
				break;
			}
		};
		return allPrereqsSatisfied && !$scope.techIsResearched(tech);

	};

	$scope.researchedAtLevel = function (level) {
		var techs = ($scope.techTree.filter(function (t) { return t.level == level; }))[0].techs;
		var i = 0;
		for (var j = 0; j < techs.length; j++) {
			if ($scope.techIsResearched(techs[j])) {
				i++;
			}
		}
		return i;
	}

	$scope.durationLabMultipler = function () {
		return 1 - (multiplier = (0.2 * $scope.baseSettings.labs) + (0.1 * $scope.baseSettings.adjacencies));
	}

	$scope.scientistDurtionMultiplier = function () {
		return 30 / $scope.baseSettings.scientists;
	}

	$scope.duration = function(tech) {

		var multiplier =  $scope.scientistDurtionMultiplier();

		var d = tech.duration;
		d *= multiplier;

		multiplier = (0.2 * $scope.baseSettings.labs) + (0.1 * $scope.baseSettings.adjacencies);

		d *= $scope.durationLabMultipler();

		return Math.round(d);
	}

	$scope.descriptionVisible = false;
	$scope.showDescription = function(tech) {

		$scope.descriptionVisible = true;
		$scope.hoverTech = tech.id;
		$scope.description.name = tech.name;
		$scope.description.duration = $scope.duration(tech);

		$scope.description.costs = {
			"alien_alloys" : 0,
			"elerium" : 0,
			"weapon_fragments" : 0,
			"meld" : 0,
			"other" : ""
		};
		var other = [];
		if (tech.costs != null) {
			for (var i = 0; i < tech.costs.length; i++) {

				switch (tech.costs[i].id) {
					case "alien_alloys" : {
						$scope.description.costs.alien_alloys = tech.costs[i].quantity;
						break;
					}
					case "elerium" : {
						$scope.description.costs.elerium = tech.costs[i].quantity;
						break;
					}

					case "weapon_fragments" : {
						$scope.description.costs.weapon_fragments = tech.costs[i].quantity;
						break;
					}

					case "meld" : {
						$scope.description.costs.meld = tech.costs[i].quantity;
						break;
					}

					default: {
						other.push(
							tech.costs[i].quantity + " " + tech.costs[i].id 
						);
					}
				}
			}
		}

		$scope.description.costs.other = other.join(',');

		if (tech.unlocks != null) {
			var arr = tech.unlocks.filter(function(t) { return t.type == "research" } );
			var titles = [];
			for (var i = 0; i < arr.length; i++) {
				titles.push(arr[i].id);
			}

			$scope.description.child_techs = titles.join('\n');

			arr = tech.unlocks.filter(function(t) { return t.type == "foundry" } )
			titles = [];
			for (var i = 0; i < arr.length; i++) {
				titles.push(arr[i].id);
			}
			$scope.description.foundry = titles.join(', ');

			arr = tech.unlocks.filter(function(t) { return t.type !== "research" && t.type !== "foundry" && t.type !== "council_request" } );
			titles = [];
			for (var i = 0; i < arr.length; i++) {
				titles.push(arr[i].id);
			}
			$scope.description.other_unlocks = titles.join(', ');

			arr = tech.unlocks.filter(function(t) { return t.type == "council_request" } );
			titles = [];
			for (var i = 0; i < arr.length; i++) {
				titles.push(arr[i].id);
			}
			$scope.description.council_requests = titles.join(', ');
		}

		$scope.unlockedTechs = [];
		var ids = tech.unlocks.filter(function (u) { return u.type == "research" });
		$scope.unlockedTechs = $scope.allTechs.filter(function (t) {
			for (var i = 0; i < ids.length; i++) {
				if (ids[i].id == t.id) {
					return true;
				}
			}
			return false;
		});

		$scope.unlockedFoundry = tech.unlocks.filter(function (f) { return f.type == "foundry"; });
		$scope.unlockedLoadout = tech.unlocks.filter(function (f) { return f.type == "loadout"; });
		$scope.unlockedFacility = tech.unlocks.filter(function (f) { return f.type == "facility"; });
		$scope.unlockedOther = tech.unlocks.filter(function (f) { return f.type == "other"; });
	}

	$scope.hideDescription = function() {
		$scope.descriptionVisible = false;
		$scope.unlockedTechs = [];
		$scope.unlockedFoundry = [];
	}

	$scope.researchPlan = function () {
		return $scope.researchedTechIds.join(' => ');
	}
	
	$scope.addTechArrayToTreeAtLevel = function (level, techs, techJson, seenTechs) {

		for (var i = 0; i < techs.length; i++) {
			seenTechs.push(techs[i].id);
		}

		for (var i = 0; i < techs.length; i++) {
			$scope.addTechsToTreeAtLevel(level, techs[i].id, techJson, seenTechs);
		}

	}

	$scope.addTechsToTreeAtLevel = function (level, parentTech, techJson, seenTechs) {

		var techs = techJson.techs.filter(function (tech) {
			var allPrereqsSatisfied = true;
			for (var i = 0; i < tech.prereq.length; i++) {
				if ($.inArray(tech.prereq[i], seenTechs) < 0) {
					allPrereqsSatisfied = false;
					break;
				}
			};

			return tech.prereq != null && $.inArray(parentTech, tech.prereq) >= 0 && $.inArray(tech.id, seenTechs) == -1 && allPrereqsSatisfied
		});

		$scope.techTree.push({ "level": level, "parent": parentTech, "techs": techs });

		$scope.addTechArrayToTreeAtLevel(level + 1, techs, techJson, seenTechs);
	}

	DataService.getTechs().then (
        // success
        function (techJson) { //success
			
			var techs = techJson.techs.filter(function (tech) { return tech.prereq == null || tech.prereq.length == 0 });
			var seenTechs = [];

			$scope.availableTechs = techs;

			$scope.techTree.push({ "level" : 1, "parent" : null, "techs" : techs });

			$scope.allTechs = techJson.techs;

			$scope.addTechArrayToTreeAtLevel(2, techs, techJson, seenTechs);

			$scope.techTree = $scope.techTree.filter(function (t) { return t.techs.length > 0; });

			var levels = [];
			levels.push( $scope.techTree.filter(function (l) { return l.level == 1; } ) );
			levels.push( $scope.techTree.filter(function (l) { return l.level == 2; } ) );
			levels.push( $scope.techTree.filter(function (l) { return l.level == 3; } ) );
			levels.push( $scope.techTree.filter(function (l) { return l.level == 4; } ) );
			levels.push( $scope.techTree.filter(function (l) { return l.level == 5; } ) );
			levels.push( $scope.techTree.filter(function (l) { return l.level == 6; } ) );

			for (var i = 0; i < levels.length; i++){
				var l = [];
				for (var j = 0; j < levels[i].length; j++) {
					l = l.concat(levels[i][j].techs);
				}
				levels[i] = { "level" : i, "techs" : l };
			}

			$scope.techTree = levels;
			
			
			for (var i = 0; i < $scope.allTechs.length; i++) {
				if ($scope.allTechs[i].unlocks != null) {
					for (var j = 0; j < $scope.allTechs[i].unlocks.length; j++) {
						if ($scope.allTechs[i].unlocks[j] != '-' && $scope.allTechs[i].unlocks[j].type != 'research') {
							var dupe = $scope.allUnlocks.filter(function (u) { return u.id == $scope.allTechs[i].unlocks[j].id });
							if (dupe == null || dupe.length == 0) {
								$scope.allUnlocks.push({ 'tech': $scope.allTechs[i].name, 'type': $scope.allTechs[i].unlocks[j].type, 'id': $scope.allTechs[i].unlocks[j].id, 'opt': $scope.allTechs[i].unlocks[j].id + ' => ' + $scope.allTechs[i].name });
							}
						}
					}
				}
			}

		}, 
        // failure
        function (commonJson) {
		
		}
	);

});