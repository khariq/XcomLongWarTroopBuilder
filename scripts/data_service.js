
xcomApp.factory('DataService', function($http, $q) {		
	
	function DataService() {
		var self = this;
		self.commonJson = null;
		self.psionicsJson = null;
		self.geneModsJson = null;
		self.techs = null;

		// self.getCommonJson = function() {
		// 	var deferred = $q.defer();
		// 	if (self.commonJson !== null) {
		// 		deferred.resolve(self.commonJson);
		// 	} else {
		// 		$http.get('data/common.json')
		// 			.success(function(data) {
		// 				self.commonJson = data;
		// 				deferred.resolve(data);
		// 			})
		// 			.error(function(response) { 
		// 				deferred.reject(response);
		// 			});
		// 	}
		// 	return deferred.promise;
		// }

		self.getCommonJson = function() {
			if (!self.commonJson) {
				self.commonJson = $http.get('data/common.json');
			}
			return self.commonJson.then(function(response){
				return response.data;
			});
		}
		
		var classJson = [];
		
		self.getClassJson = function(className) {
			this.getCommonJson().then(function (json) {
				for (var i = 0; i < json.classes.length; i++) {
					if (json.classes[i].id === className) {
						return json.classes[i];
					}
				}
			});
		}

		self.getPsionics = function() {
			var deferred = $q.defer();
			if (self.psionicsJson !== null) {
				deferred.resolve(self.psionicsJson);
			} else {
				$http.get('data/psionics.json')
					.success(function(data) {
						self.psionicsJson = data;
						deferred.resolve(data);
					})
					.error(function(response) { 
						deferred.reject(response);
					});
			}
			return deferred.promise;
		}

		self.getGeneMods = function() {
			var deferred = $q.defer();
			if (self.geneModsJson !== null) {
				deferred.resolve(self.geneModsJson);
			} else {
				$http.get('data/gene_mods.json')
					.success(function(data) {
						self.geneModsJson = data;
						deferred.resolve(data);
					})
					.error(function(response) { 
						deferred.reject(response);
					});
			}
			return deferred.promise;
		}

		self.getTechs = function() {
			var deferred = $q.defer();
			if (self.techs !== null) {
				deferred.resolve(self.techs);
			} else {
				$http.get('data/research/techs.json')
					.success(function(data) {
						self.techs = data;
						deferred.resolve(data);
					})
					.error(function(response) { 
						deferred.reject(response);
					});
			}
			return deferred.promise;
		}
	}
	
	return new DataService();
		
});
