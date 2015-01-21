
xcomApp.factory('DataService', function($http, $q) {		
	
	function DataService() {
		var self = this;
		self.commonJson = null;
		self.psionicsJson = null;
		self.geneModsJson = null;

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
	}
	
	return new DataService();
		
});
