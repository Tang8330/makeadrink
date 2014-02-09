'use strict';


// Declare app level module which depends on filters, and services
angular.module('MixDatUp', [
  'ngRoute',
  'MixDatUp.filters',
  'MixDatUp.services',
  'MixDatUp.directives',
  'MixDatUp.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {templateUrl: 'partials/partial1.html', controller: 'AlcoholicDrinksCtrl'});
  $routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: ''});
  $routeProvider.otherwise({redirectTo: '/view1'});
}]);
