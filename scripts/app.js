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
			var deferred = $q.defer();
			if (self.classJson == null || self.classJson[className] == null) {
				$http.get('data/' + className + '.json')
						.success(function(data) { 
							self.classJson[className] = data; 
							deferred.resolve(data); 
						})
						.error(function(response) { deferred.reject(response)} );
			} else {
				deferred.resolve(self.classJson[className]);
			}
		}
	}
	
	return new DataService();
		
});

xcomApp.controller('navController', function($scope, $http, DataService) {

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

	$scope.showClass = function(id) {
		DataService.getClassJson(id).then( 
			function(classJson) {
				alert(classJson);
			})
		,
		function(classJson) {

		}
	}
	
});

xcomApp.controller('classController', function($scope, $http, Data) {

	

});
