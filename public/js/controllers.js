'use strict';

/* Controllers */
var mixDatUp = angular.module('MixDatUp.controllers', [])

mixDatUp.controller('AlcoholicDrinksCtrl', ['$scope', '$http', function ($scope, $http) {
  $http.get('recipes/recipes.json').success(function(data) {
    $scope.alcoholicDrinks = data;
	
	$scope.randomize = function(){
        var len = $scope.alcoholicDrinks.length;
        var drink = $scope.alcoholicDrinks[Math.floor((Math.random()*len-1)+0)];
		return drink;
    }
  });
}]);
