
xcomApp.controller('researchController', function($scope, $http, DataService) {

	$scope.researchPath = [];

	$scope.researchedTechIds = [];

	$scope.allTechs = [];

	$scope.techTree = [];

	$scope.techJson = null;

	$scope.description = {};
	
	$scope.researchTech = function(tech) {

		if ($scope.techCanBeResearched(tech) == false) {
			for (var i = 0; i < tech.prereq.length; i++) {
				var result = $.grep($scope.allTechs, function (e) { return e.id == tech.prereq[i]; });
				if (result != null) {
					$scope.researchTech(result[0]);
				}
			}
		}

		$scope.researchPath.push(tech);

		$scope.researchedTechIds.push(tech.id);

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

	$scope.duration = function(tech) {
		return tech.duration;
	}

	$scope.descriptionVisible = false;
	$scope.showDescription = function(tech) {

		$scope.descriptionVisible = true;
		$scope.description.title = tech.title;
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
							tech.costs[i].quantity + " " + tech.costs[i].item 
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


			$scope.techTree = $scope.techTree.sort(function (a, b) {
				return (parseInt(a.level) - parseInt(b.level));
			});
			
		}, 
        // failure
        function (commonJson) {
		
		}
	);

});