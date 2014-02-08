'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', []).value('version', '0.1');
angular.module('myApp.services', ['ngResource']).factory('myApp.services', function($resource) {
  return $resource('recipes.json',{ }, {
    getData: {method:'GET', isArray: false}
  });
});