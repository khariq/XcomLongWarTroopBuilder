
xcomApp.controller('researchController', function($scope, $http, DataService) {

	$scope.techTree = [];

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

			return tech.prereq != null && $.inArray(parentTech, tech.prereq) >= 0 && $.inArray(tech.id, seenTechs) == -1  && allPrereqsSatisfied;
		});

		$scope.techTree.push( {"level" : level, "parent" : parentTech, "techs" : techs} );

		$scope.addTechArrayToTreeAtLevel(level + 1, techs, techJson, seenTechs);
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