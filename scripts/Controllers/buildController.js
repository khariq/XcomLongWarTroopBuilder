
xcomApp.controller('buildController', function ($scope, $http) {

    $scope.perks = [];
    $scope.ranks = [];
    $scope.selectedMenuItem = "Assault";
    if (commonJson == null) {
        $http.get('data/common.json').success(function (data) {
            commonJson = data;
            $scope.perks = commonJson.perks;
            $scope.ranks = commonJson.ranks;
        });
    }
    else {
        $scope.perks = commonJson.perks;
        $scope.ranks = commonJson.ranks;
    }

    
});

function init ($scope) {
    $scope.perks = commonJson.perks;
    $scope.ranks = commonJson.ranks;
}

