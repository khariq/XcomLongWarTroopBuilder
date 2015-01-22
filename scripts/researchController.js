
xcomApp.controller('researchController', function($scope, $http, DataService) {

	$scope.researchPath = [];

	$scope.techTree = [];

	$scope.techJson = null;

	$scope.description = {};

	$scope.addTechArrayToTreeAtLevel = function(level, techs, techJson, seenTechs) {

		for (var i = 0; i < techs.length; i++) {
			seenTechs.push(techs[i].id);
		}

		for (var i = 0; i < techs.length; i++) {
			$scope.addTechsToTreeAtLevel(level + 1, techs[i].id, techJson, seenTechs);
		}

	}

	$scope.addTechsToTreeAtLevel = function(level, parentTech, techJson, seenTechs) {

		var techs = techJson.techs.filter(function (tech) { 
			var allPrereqsSatisfied = true;
			for (var i = 0; i < tech.prereq.length; i++) {
				if ($.inArray(tech.prereq[i], seenTechs) < 0) {
					allPrereqsSatisfied = false;
					break;
				}
			};

			return tech.prereq != null && $.inArray(parentTech, tech.prereq) >= 0 && $.inArray(tech.id, seenTechs) == -1  && allPrereqsSatisfied
		});

		$scope.techTree.push( {"level" : level, "parent" : parentTech, "techs" : techs} );

		$scope.addTechArrayToTreeAtLevel(level + 1, techs, techJson, seenTechs);
	}

	$scope.researchTech = function(tech) {
		$scope.researchPath.push(tech);

	}

	$scope.techIsResearched = function(tech) {
		return ($.inArray(tech, $scope.researchPath) >= 0);
	}

	$scope.techCanBeResearched = function(tech) {

		var allPrereqsSatisfied = true;
		for (var i = 0; i < tech.prereq.length; i++) {
			if ($.inArray(tech.prereq[i], $scope.researchPath) < 0) {
				allPrereqsSatisfied = false;
				break;
			}
		};
		return allPrereqsSatisfied;

	};

	$scope.duration = function(tech) {
		return tech.duration;
	}

	$scope.descriptionVisible = false;
	$scope.showDescription = function(tech) {

		$scope.descriptionVisible = true;
		$scope.description.title = tech.title;
		$scope.description.duration = $scope.duration(tech);

		$scope.description.cost = {
			"alien_alloys" : 0,
			"elerium" : 0,
			"weapon_fragments" : 0,
			"meld" : 0,
			"other" : ""
		};
		var other = [];
		for (var i = 0; i < tech.cost.length; i++) {
			switch (tech.cost[i].item) {
				case "alien_alloys" : {
					$scope.description.cost.alien_alloys = tech.cost[i].quantity;
					break;
				}
				case "elerium" : {
					$scope.description.cost.elerium = tech.cost[i].quantity;
					break;
				}

				case "weapon_fragments" : {
					$scope.description.cost.weapon_fragments = tech.cost[i].quantity;
					break;
				}

				case "meld" : {
					$scope.description.cost.meld = tech.cost[i].quantity;
					break;
				}

				default: {
					other.push(
						tech.cost[i].quantity + " " + tech.cost[i].item 
					);
				}
			}
		}
		$scope.description.cost.other = other.join(',');

		var arr = tech.unlocks.filter(function(t) { return t.type == "research" } );
		var titles = [];
		for (var i = 0; i < arr.length; i++) {
			titles.push(arr[i].id);
		}

		$scope.description.child_techs = titles.join(',');

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

	$scope.hideDescription = function() {
		$scope.descriptionVisible = false;
	}

	DataService.getTechs().then (
        // success
        function (techJson) { //success
			
			var techs = techJson.techs.filter(function (tech) { return tech.prereq == null || tech.prereq.length == 0 });
			var seenTechs = [];

			$scope.techTree.push({ "level" : 1, "parent" : null, "techs" : techs });

			$scope.addTechArrayToTreeAtLevel(2, techs, techJson, seenTechs);

		}, 
        // failure
        function (commonJson) {
		
		}
	);

});