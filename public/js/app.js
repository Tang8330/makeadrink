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
  $routeProvider.when('/main', {templateUrl: 'partials/partial1.html', controller: 'AlcoholicDrinksCtrl'});
  $routeProvider.when('/about', {templateUrl: 'partials/partial2.html', controller: ''});
  $routeProvider.otherwise({redirectTo: '/main'});
}]);
