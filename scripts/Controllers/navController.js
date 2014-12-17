
xcomApp.controller('navController', function($scope) {
	$.getJSON('data/common.json', function(json) { 
		commonJson = JSON.parse(json); 
		
		$scope.menuItems = commonJson.classes;
	});
});