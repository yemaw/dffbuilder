'use strict';

var App = angular.module('app', ['ngRoute']);

App.config(['$routeProvider',
    function($routeProvider) {
    	 $routeProvider.
	  		  when('/login', {
		          templateUrl: 'views/user/login.html'
		      }).
		      otherwise({
		          redirectTo: '/login'
		      });
    }
]);