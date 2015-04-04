'use strict';

var Helper = {
	 CapitalizeFirstLetter : function(word){
	 	 if(word && typeof word === 'string'){
	 		 return word.charAt(0).toUpperCase()+word.slice(1);		
	 	 }
	 }
}


var App = angular.module('app', ['ngRoute','ui.date','flash']);

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

App.service('ParseDataService',[function(){
	
	
	this.getObject = function(objectId, table_class, callbacks){
		
		var pObject = Parse.Object.extend(table_class);
		var query = new Parse.Query(pObject);
		query.get(objectId, {
		    success: function(objGot) {
		    	callbacks && callbacks.onSuccess && typeof callbacks.onSuccess === 'function' && callbacks.onSuccess(objGot);
		    },
		    error: function(object, error) {
		    	callbacks && callbacks.onError && typeof callbacks.onError === 'function' && callbacks.onError(error);
		    }
		});

	}
	

	this.saveObject = function(objIn, table_class, callbacks){
		var pObject = new Parse.Object(table_class);
		
 		for(var key in objIn){
 			if(objIn.hasOwnProperty(key)){
 				pObject.set(key, objIn[key]);
 				if(typeof objIn[key] === 'string'){
 					pObject.set('search_'+key, objIn[key].toLowerCase());	
 				}
 			}
			
		}
		
		pObject.save(null, {
			success: function(objSaved) {
				callbacks && callbacks.onSuccess && typeof callbacks.onSuccess === 'function' && callbacks.onSuccess(objSaved);
			},
			error: function(obj, error) {
				callbacks && callbacks.onError && typeof callbacks.onError === 'function' && callbacks.onError(error);
			}
		});
	}
	
	this.saveFile = function(name, file, callbacks){
		var parseFile = new Parse.File(name, file);
		
	  	parseFile.save().then(function(objSaved) {
	  		
	  		var pObject = new Parse.Object('Files');
	  		
	  		pObject.set('file', objSaved);
	  		pObject.set('url', objSaved.url());
	  		
	  		
	  		pObject.save(null, {
				success: function(objSaved) {
					callbacks && callbacks.onSuccess && typeof callbacks.onSuccess === 'function' && callbacks.onSuccess(objSaved);		
				},
				error: function(obj, error) {
					callbacks && callbacks.onError && typeof callbacks.onError === 'function' && callbacks.onError(error);		
				}
			});
			
	    }, function(error) {
	  	    callbacks && callbacks.onError && typeof callbacks.onError === 'function' && callbacks.onError(error);
	    });
	}
	
	this.getObjects = function(conditions, table_class, callbacks){
		conditions = conditions || [];
		
		var query = new Parse.Query(table_class);
		query.descending('createdAt');
		for(var key in conditions){
			if(conditions[key]){
				query.contains('search_'+key, conditions[key].toLowerCase());
			}
		}
		
		query.find({
		    success: function(results) {
		        callbacks.onSuccess(results);
		    },
		    error: function(error) {
		        callbacks.onError(error.code, error.message);
		    }
		});
	}
}]);


Parse.initialize("", ""); 


var configs = {
	form_fields:[
		{
			"column":"cover_photos",
			"label":"Photo",
			"type":"images",
		},
		{
			"column":"father_name",
			"label":"Father Name",
			"type":"textbox",
			"rules":{
				"min":"2",
				"max":"20"
			},
			"show_in_index":true,
		},
		{
			"column":"mother_name",
			"label":"Mother Name",
			"type":"textbox",
			"rules":{
				"min":"2",
				"max":"20"
			},
			"show_in_index":true,
		},
		{
			"column":"gender",
			"label":"Gender",
			"type":"radio",
			"options":["Male","Female"],
			"show_in_index":true,
		},
		{
			"column":"dob",
			"label":"Date of Birth",
			"type":"date",
		}
	]	
	
}