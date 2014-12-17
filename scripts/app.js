var xcomApp = angular.module('xcomApp', []);

var commonJson = null;

function loadJson(callback) {
	$.getJSON('data/common.json', function(json) { 
		commonJson = JSON.parse(json); 
		callback(); 
	});
}