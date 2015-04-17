'use strict';

var Helper = {
	 CapitalizeFirstLetter : function(word){
	 	 if(word && typeof word === 'string'){
	 		 return word.charAt(0).toUpperCase()+word.slice(1);		
	 	 }
	 },
	 ParseToJSON : function(parseObj, form_fields){
		
		var jsonObj = JSON.parse(JSON.stringify(parseObj));
		for(var i=0; i<form_fields.length; i++){
			if(form_fields[i].type === 'date'){
				if(jsonObj[form_fields[i].column] && jsonObj[form_fields[i].column].iso){
					jsonObj[form_fields[i].column] = jsonObj[form_fields[i].column].iso;	
				}
				
			}
		}
		return jsonObj;
	},
	SafeScopeApply: function (scope, fn) {
	    (scope.$$phase || (scope.$root && scope.$root.$$phase)) ? fn() : scope.$apply(fn);
	}
}


var App = angular.module('app', ['ngRoute','ui.date', 'ngAnimate', 'toaster', 'flash']);

App.config(['$routeProvider',
    function($routeProvider) {
    	 $routeProvider.
	  		  when('/login', {
		          templateUrl: 'views/user/login.html'
		      }).
		      when('/404', {
		      	
		      }).
		      
		      when('/:collection/:action/:id', {
		          templateUrl: 'views/dobjects/root.html'
		      }).
		      when('/:collection/:action', {
		          templateUrl: 'views/dobjects/root.html'
		      }).
		      when('/:collection', {
		          templateUrl: 'views/dobjects/root.html'
		      }).
		      
		      otherwise({
		          redirectTo: '/404'
		      });
    }
]);

App.run(['$rootScope', '$window',
function($rootScope, $window) {
    $rootScope.safeApply = function(fn) {
        var phase = this.$root.$$phase;
        if(phase == '$apply' || phase == '$digest') {
            if(fn && (typeof(fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };
    
    $window.onerror = function(error, url, line) {
    	$rootScope.$broadcast('Page_UnBlockUI');
    	var text = error+' '+url+' at line '+line+'.';
    	$rootScope.$broadcast('Page_ShowToaster',{type:'error', title:'Javascript Error.', body:text, timeout: 3000});
    }
}]);
/*
App.service('ControllerChecker', ['$controller', function($controller) {
    return {
        exists: function(controllerName) {
            if(typeof window[controllerName] == 'function') {
                return true;
            }
            try {
                $controller(controllerName);
                return true;
            } catch (error) {
                return !(error instanceof TypeError);
            }
        }
    };
}]);
*/
