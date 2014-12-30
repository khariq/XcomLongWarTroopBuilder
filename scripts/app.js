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
	
	DataService.getCommonJson().then (
		function(commonJson) { //success
			$scope.menuItems = commonJson.classes;
			$scope.tabs = commonJson.tabs;

		},
		function(commonJson) {
		
		}
	);

	$scope.isActive = function (id) {
		return ($scope.class != null && $scope.class.id === id);
	}

	$scope.class = null;
	$scope.perks = [];

	$scope.showClass = function(id) {
		var classJson = DataService.getClassJson(id);
		$scope.class = classJson;

		$scope.perks = [];
		DataService.getCommonJson().then (
			function(commonJson) { 
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
			},
			function(commonJson) {

			}
		);
	}
	


});

xcomApp.controller('classController', function($scope, $http, Data) {

	

});
