App.controller('DObjectsRootController',['$location', '$routeParams','$scope','$rootScope', 'ParseDataService', 'FormsStructureService',
function($location, $routeParams, $scope, $rootScope, PD, FSS){
	
	if(!Parse.User.current()){
		$rootScope.safeApply($location.url('login'));
		$rootScope.$broadcast('Page_ShowToaster',{type:'warning',body:'Please login first to access this page.',timeout:3000});
		return;
	}
	
	$scope.collection = $routeParams.collection;
	
	$scope.username = Parse.User.current().get('username');
	
	$scope.forms = FSS.getForms();
	
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
		$rootScope.safeApply($location.url('login'));
		$rootScope.$broadcast('Page_ShowToaster',{type:'success',body:'Successfully logout.'});
	}
	
}]);

App.controller('DObjectsIndexController',
['$routeParams', '$scope', 'ParseDataService', 'flash','FormsStructureService',
function($routeParams, $scope, PD, flash, FSS){
	
	document.title = FSS.getFormName($routeParams.collection);
	
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
['$routeParams', '$location', '$scope','$rootScope', 'ParseDataService', 'flash','FormsStructureService',
function($routeParams, $location, $scope, $rootScope, PD, flash, FSS){
	
	document.title = 'Create in '+FSS.getFormName($routeParams.collection);
	
	$scope.collection = $routeParams.collection;
	
	$scope.fields = {};//need this for dynamic loaded form fields
	
	$scope.form_fields = FSS.getFormFields($scope.collection);
	
	$scope.saveObject = function(){
		$rootScope.$broadcast('Page_BlockUI');
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
						$rootScope.$broadcast('Page_ShowToaster',{type:'error',title:'File upload errror.', body:error});
					}
					$scope.fields[_field] = _files;
					callback(null);
				});	
			} else {
				callback(null);
			}
		},function(error){
			
			if(error){
				$rootScope.$broadcast('Page_ShowToaster',{type:'error',title:'Data processing errror.', body:error});
			}
			//$scope.fields's file field are updated with parse file object's data. now ready to save to parse
			PD.saveObject($scope.fields, $scope.collection, {
				onSuccess:function(obj){
					obj = Helper.ParseToJSON(obj, $scope.form_fields);
					$rootScope.safeApply($location.url($scope.collection+'/show/'+obj.objectId));
					$rootScope.$broadcast('Page_ShowToaster',{type:'success',body:'Successfuly created'});
					$rootScope.$broadcast('Page_UnBlockUI');
				},
				onError:function(error){
					$rootScope.$broadcast('Page_ShowToaster',{type:'error',title:'Object saving errror.', body:error});
					$rootScope.$broadcast('Page_UnBlockUI');
				}
			});
		});
		
	}
}]);

App.controller('DObjectsEditController',
['$routeParams','$location', '$window', '$scope', '$rootScope', 'ParseDataService', 'flash', 'FormsStructureService',
function($routeParams, $location, $window, $scope, $rootScope, PD, flash, FSS){
	
	document.title = 'Edit a '+FSS.getFormName($routeParams.collection);
	
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
	$scope.removeFile = function(field, file){
		
		for(var index in $scope.fields[field]){
			var obj = $scope.fields[field][index];
			if(file.FileId === obj.FileId){
				$scope.fields[field].splice(index, 1);
			}
		}
		
	}
	$scope.saveObject = function(){
		$rootScope.$broadcast('Page_BlockUI');
		
		var scope_fields = angular.toJson($scope.fields); //$hashKey issue
		scope_fields = JSON.parse(scope_fields);
		var scope_files_edit = angular.toJson($scope.files_edit);
		scope_files_edit = JSON.parse(scope_files_edit);
		
		async.eachSeries($scope.form_fields,function(form_field,callback){
			var _field = form_field.column;
			var field = scope_files_edit[_field] || scope_fields[_field];
			if(!field){
				callback(null);
				return;
			}
			
			if( ['image','images','file','files'].indexOf(form_field.type) >= 0 && $scope.files_edit[_field] ){//is file field ?
				var _files = []; 
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
						$rootScope.$broadcast('Page_ShowToaster',{type:'error',title:'File upload errror.', body:error});
					}
					
					scope_fields[_field] = scope_fields[_field] || [];//#really need?
					scope_fields[_field] = scope_fields[_field].concat(_files);
					
					callback(null);
				});	
			} else if( form_field.type === 'date' ){// && (typeof $scope.fields[_field] === 'string')
				scope_fields[_field] = new Date(scope_fields[_field]);
				callback(null);
			} else {
				callback(null);
			}
		},function(error){
			
			if(error){
				$rootScope.$broadcast('Page_ShowToaster',{type:'error',title:'Data processing errror.', body:error});
			}
			
			PD.updateObject(scope_fields, $scope.form_fields, $scope.collection, {
				onSuccess:function(obj){
					obj = Helper.ParseToJSON(obj, $scope.form_fields);
					$rootScope.safeApply($scope, $location.url($scope.collection+'/show/'+obj.objectId));
					$rootScope.$broadcast('Page_ShowToaster',{type:'success',body:'Successfuly saved.'});
					$rootScope.$broadcast('Page_UnBlockUI');
				},
				onError:function(error){
					$rootScope.$broadcast('Page_ShowToaster',{type:'error',title:'Error saving', body:error});
					$rootScope.$broadcast('Page_UnBlockUI');
				}
			});
		});
	}
	
	$scope.deleteObject = function(){
		$rootScope.$broadcast('Page_BlockUI');
		if($window.confirm('Are you sure you want to delete?')){
			PD.deleteObject($scope.fields.objectId,$scope.collection,{
				onSuccess:function(obj){
					$rootScope.safeApply($scope, $location.url($scope.collection));
					$rootScope.$broadcast('Page_ShowToaster',{type:'success',body:'Successfully deleted.'});
					$rootScope.$broadcast('Page_UnBlockUI');
				},
				onError:function(error){
					$rootScope.$broadcast('Page_ShowToaster',{type:'error',title:'Error deleting object.', body:error});
					$rootScope.$broadcast('Page_UnBlockUI');
				}
			});	
		}
	}
}]);


App.controller('DObjectsShowController',
['$routeParams', '$scope', 'ParseDataService', 'flash', 'FormsStructureService',
function($routeParams, $scope, PD, flash, FSS){
	
	document.title = FSS.getFormName($routeParams.collection);
	
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
	document.title = 'Forms Settings';
	$scope.forms = FSS.getForms();
}]);


App.service('FormsStructureService',[function(){
	
	return {
		_forms : forms,
		getForms:function(){
			return this._forms;
		},
		getForm:function(collection){
			for(var index in this._forms){
				if(this._forms[index].collection && this._forms[index].collection === collection){
					return this._forms[index];		
				}
			}
		},
		getFormName:function(collection){
			return this.getForm(collection).name;
		},
		getFormFields:function(collection){
			return this.getForm(collection).form_fields;
		},
		getDefaultCollection : function(){
			return 'bookmarks';
		}
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