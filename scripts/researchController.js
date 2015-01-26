
xcomApp.controller('researchController', function($scope, $http, DataService) {

	$scope.researchPath = [];

	$scope.researchedTechIds = [];

	$scope.allTechs = [];

	$scope.allUnlocks = [];

	$scope.techTree = [];

	$scope.techJson = null;

	$scope.description = {};

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
				$scope.bom.other = $scope.bom.other + ", " + query[i].quantity + " " + query[i].id;
			}
		}

	}

	$scope.techIsResearched = function(tech) {
		
		var isResearched = ($.inArray(tech.id, $scope.researchedTechIds) >= 0);

		return isResearched;
	}

	$scope.techCanBeResearched = function(tech) {

		var allPrereqsSatisfied = true;
		for (var i = 0; i < tech.prereq.length; i++) {
			if ($.inArray(tech.prereq[i], $scope.researchedTechIds) <0) {
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

	$scope.availableAtLevel = function (level) {
		var techs = ($scope.techTree.filter(function (t) { return t.level == level; }))[0].techs;
		var i = 0;
		for (var j = 0; j < techs.length; j++) {
			if ($scope.techCanBeResearched(techs[j]) && !$scope.techIsResearched(techs[j])) {
				i++;
			}
		}
		return i;
	}

	$scope.unavailableAtLevel = function (level) {
		var techs = ($scope.techTree.filter(function (t) { return t.level == level; }))[0].techs;
		var i = 0;
		for (var j = 0; j < techs.length; j++) {
			if (!$scope.techCanBeResearched(techs[j]) && $scope.techIsResearched(techs[j]) == false ) {
				i++;
			}
		}
		return i;
	}

	$scope.duration = function(tech) {

		var multiplier = 30 / $scope.baseSettings.scientists;
		var d = tech.duration;
		d *= multiplier;

		multiplier = (0.2 * $scope.baseSettings.labs) + (0.1 * $scope.baseSettings.adjacencies);

		d *= (1 - multiplier);

		return d;
	}

	$scope.descriptionVisible = false;
	$scope.showDescription = function(tech) {

		$scope.descriptionVisible = true;
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

	}

	$scope.hideDescription = function() {
		$scope.descriptionVisible = false;
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