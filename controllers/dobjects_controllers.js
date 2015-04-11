App.controller('DObjectsRootController',['$location', '$routeParams','$scope', 'ParseDataService', 
function($location, $routeParams, $scope, PD){
	
	if(!Parse.User.current()){
		$location.url('login');
		if(!$scope.$$phase) {
			$scope.$apply();  
		}
		return;
	}
	
	$scope.collection = $routeParams.collection;
	
	$scope.username = Parse.User.current().get('username');
	
	$scope.forms = [{
		name:'Resumes',
		collection:'resumes'
	},{
		name:'Blah',
		collection:'blah'
	},{
		name:'Others',
		collection:'others'
	}];
	
	$scope.getActionTemplateUrl = function(){
		var path;
		switch ($routeParams.collection){
			case 'settings':
				path = 'views/dobjects/settings.html';
				break;
			default :
				path = 'views/dobjects/' + ($routeParams.action || 'index') + '.html';
				break;
		}
		return path;
	}
	
	$scope.logout = function(){
		Parse.User.logOut();
		$scope.$apply($location.url('login'));
	}
	
}]);

App.controller('DObjectsIndexController',
['$routeParams', '$scope', 'ParseDataService', 'flash','FormsStructureService',
function($routeParams, $scope, PD, flash, FSS){
	
	document.title = Helper.CapitalizeFirstLetter($routeParams.collection);
	
	$scope.filters = {};
	
	$scope.collection = $routeParams.collection;
	
	$scope.fields = FSS.getFormFields($scope.collection);
	
	$scope.dobjects = [];
	
	var callbacks = {
		onSuccess : function(list){
			$scope.dobjects = list;	
			$scope.$apply();
		},
		onError : function(){}
	}
	
	
	$scope.filterData = function(){
		
		PD.getObjects($scope.filters, $scope.collection, callbacks);
	}
	
	PD.getObjects([], $scope.collection, callbacks);
}]);


App.controller('DObjectsCreateController', 
['$routeParams', '$location', '$scope', 'ParseDataService', 'flash','FormsStructureService',
function($routeParams, $location, $scope, PD, flash, FSS){
	
	document.title = 'Create';
	
	$scope.collection = $routeParams.collection;
	
	$scope.fields = {};//need this for dynamic loaded form fields
	
	$scope.form_fields = FSS.getFormFields($scope.collection);
	
	$scope.saveObject = function(){
		
		async.eachSeries($scope.form_fields,function(form_field,callback){
			var _field = form_field.column;
			var field = $scope.fields[_field];
			if(!field){
				callback(null);
				return;
			}
			/*var form_field;
			for(var i = 0; i< $scope.form_fields.length; i++){
				if($scope.form_fields[i].column === _field){
					form_field = $scope.form_fields[i];
					break;
				}
			}*/
			
			//var type = (form_field && form_field.type ) ? form_field.type : '';
			
			if(['image','images','file','files'].indexOf(form_field.type) >= 0){//is file field ?
				var _files = [];
				async.each($scope.fields[_field], function(file, callback){//loop and upload all files.
					var name = file.name || 'image.jpg';//
					
					PD.saveFile(name, file, {
						onSuccess:function(objSaved){
							objSaved = Helper.ParseToJSON(objSaved, $scope.form_fields);
							var f = {FileId:objSaved.objectId,url:objSaved['file'].url};//flattern the parse file object
							_files.push(f);
							callback();
						},
						onError:function(error){
							callback('Cannot upload file. '.error);
						}
					});
				},function(error){
					if(error){
						alert('a file upload error');
						console.log(error);
					}
					$scope.fields[_field] = _files;
					callback(null);
				});	
			} else {
				callback(null);
			}
		},function(error){
			if(error){
				alert('files upload error');
				console.log(error);
			}
			//$scope.fields's file field are updated with parse file object's data. now ready to save to parse
			PD.saveObject($scope.fields, $scope.collection, {
				onSuccess:function(obj){
					obj = Helper.ParseToJSON(obj, $scope.form_fields);
					Helper.SafeScopeApply($scope, $location.url($scope.collection+'/show/'+obj.objectId));
				},
				onError:function(){
					alert('error');
				}
			});
		});
		
	}
}]);

App.controller('DObjectsEditController',
['$routeParams','$location', '$window', '$scope', 'ParseDataService', 'flash', 'FormsStructureService',
function($routeParams, $location, $window, $scope, PD, flash, FSS){
	
	document.title = Helper.CapitalizeFirstLetter($routeParams.collection);
	
	$scope.collection = $routeParams.collection;
	
	$scope.fields = {};//need this for dynamic loaded form fields
	$scope.files_edit = {}; //for file type fields new uploads
	
	$scope.form_fields = FSS.getFormFields($scope.collection);
	
	PD.getObject($routeParams.id, $scope.collection, {
		onSuccess:function(objGot){
			$scope.fields = Helper.ParseToJSON(objGot, $scope.form_fields);
			$scope.$apply();
		},
		onError:function(error){
			alert('Object retrieve error.');
			console.log(error);
		}
	});
	
	$scope.saveObject = function(){
		async.eachSeries($scope.form_fields,function(form_field,callback){
			var _field = form_field.column;
			var field = $scope.fields[_field];
			if(!field){
				callback(null);
				return;
			}
			
			if( ['image','images','file','files'].indexOf(form_field.type) >= 100 && $scope.files_edit[_field] ){//is file field ?
				var _files = []; console.log('aeiou');
				async.each($scope.files_edit[_field], function(file, callback){//loop and upload all new files.notice, data is taken from different field `files_edit`
					var name = file.name || 'image.jpg';//
					
					PD.saveFile(name, file, {
						onSuccess:function(objSaved){
							objSaved = Helper.ParseToJSON(objSaved, $scope.form_fields);
							var f = {FileId:objSaved.objectId,url:objSaved['file'].url};//flattern the parse file object
							_files.push(f);
							callback();
						},
						onError:function(error){
							callback('Cannot upload file. '.error);
						}
					});
				},function(error){
					if(error){
						alert('a file upload error');
						console.log(error);
					}
					
					
					$scope.fields[_field] = $scope.fields[_field] || [];//#really need?
					$scope.fields[_field] = $scope.fields[_field].concat(_files);
					//console.log($scope.fields[_field]);
					callback(null);
				});	
			} else if( form_field.type === 'date' ){// && (typeof $scope.fields[_field] === 'string')
				$scope.fields[_field] = new Date($scope.fields[_field]);
				callback(null);
			} else {
				callback(null);
			}
		},function(error){
			if(error){
				alert('files upload error');
				console.log(error);
			}
			$scope.fields = angular.toJson($scope.fields);
			
			//$scope.fields's file field are updated with parse file object's data. now ready to save to parse
			PD.saveObject($scope.fields, $scope.collection, {
				onSuccess:function(obj){
					obj = Helper.ParseToJSON(obj, $scope.form_fields);
					Helper.SafeScopeApply($scope, $location.url($scope.collection+'/show/'+obj.objectId));
				},
				onError:function(error){
					console.log(error);
					alert('error');
				}
			});
		});
	}
	
	$scope.deleteObject = function(){
		if($window.confirm('Are you sure you want to delete?')){
			PD.deleteObject($scope.fields.objectId,$scope.collection,{
				onSuccess:function(obj){
					Helper.SafeScopeApply($scope, $location.url($scope.collection));
				},
				onError:function(error){
					console.log(error);
					alert('error');
				}
			});	
		}
	}
}]);


App.controller('DObjectsShowController',
['$routeParams', '$scope', 'ParseDataService', 'flash', 'FormsStructureService',
function($routeParams, $scope, PD, flash, FSS){
	
	document.title = Helper.CapitalizeFirstLetter($routeParams.collection);
	
	$scope.collection = $routeParams.collection;
	
	$scope.fields = {};//need this for dynamic loaded form fields
	
	$scope.form_fields = FSS.getFormFields($scope.collection);
	
	PD.getObject($routeParams.id, $scope.collection, {
		onSuccess:function(objGot){
			$scope.fields = Helper.ParseToJSON(objGot, $scope.form_fields);
			$scope.$apply();
		},
		onError:function(error){
			alert('Object retrieve error.');
			console.log(error);
		}
	});
}]);


App.controller('DObjectsSettingsController',
['$scope','FormsStructureService',
function($scope, FSS){
	$scope.forms_fields = {};
	$scope.forms_fields['resumes'] = FSS.getFormFields('resumes');//#tmp get list of forms
	
}]);


App.service('FormsStructureService',[function(){
	this.getFormFields = function(form_name){
		return forms[form_name].form_fields;
	}
	
	
}]);

App.directive('appFilereader', function($q) {
    var slice = Array.prototype.slice;

    return {
        restrict: 'A',
        require: '?ngModel',
        link: function(scope, element, attrs, ngModel) {
                if (!ngModel) return;

                ngModel.$render = function() {};

                element.bind('change', function(e) {
                    var element = e.target;
                    if (element.multiple) ngModel.$setViewValue(element.files);
                    else ngModel.$setViewValue(element.files.length ? element.files[0] : null);
					/*
                    $q.all(slice.call(element.files, 0).map(readFile))
                        .then(function(values) {
                            if (element.multiple) ngModel.$setViewValue(values);
                            else ngModel.$setViewValue(values.length ? values[0] : null);
                        });

                    function readFile(file) {
                    	
                        var deferred = $q.defer();

                        var reader = new FileReader();
                        reader.onload = function(e) {
                            deferred.resolve(e.target.result);
                        };
                        reader.onerror = function(e) {
                            deferred.reject(e);
                        };
                        reader.readAsDataURL(file);

                        return deferred.promise;
                    }*/

                }); //change

            } //link
    }; //return
});