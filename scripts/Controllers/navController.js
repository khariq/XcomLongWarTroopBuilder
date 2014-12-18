
xcomApp.controller('navController', function($scope, $http) {

    if (commonJson == null) {
        $http.get('data/common.json').success(function (data) {
            commonJson = data;
            $scope.menuItems = commonJson.classes;
			$scope.tabs = commonJson.tabs;
        });
    }
    else {
        $scope.menuItems = commonJson.classes;
		$scope.tabs = commonJson.tabs;
    }
});