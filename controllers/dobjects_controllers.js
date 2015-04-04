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
		return 'views/dobjects/' + ($routeParams.action || 'index') + '.html';
	}
	
	$scope.logout = function(){
		Parse.User.logOut();
		$scope.$apply($location.url('login'));
	}
	
}]);

App.controller('DObjectsIndexController',['$routeParams', '$scope', 'ParseDataService', function($routeParams, $scope, PD){
	
	document.title = Helper.CapitalizeFirstLetter($routeParams.collection);
	
	$scope.filters = {};
	
	$scope.collection = $routeParams.collection;
	
	$scope.fields = configs.form_fields;
	
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


App.controller('DObjectsCreateController', ['$routeParams', '$scope', 'ParseDataService', function($routeParams, $scope, PD){
	
	document.title = 'Create';
	
	$scope.collection = $routeParams.collection;
	
	$scope.fields = {};//need this for dynamic loaded form fields
	
	$scope.form_fields = configs.form_fields;
	
	$scope.saveObject = function(){
	
		var saveObject = function(){
			PD.saveObject($scope.fields, $scope.collection, {
					onSuccess:function(){
						alert('success');
					},
					onError:function(){
						alert('error');
					}
				});
		}
		
		var cover_photos = $("#cover_photos")[0];
		if (cover_photos && cover_photos.files && cover_photos.files.length > 0) {
			$scope.fields.cover_photos = [];
			async.each(cover_photos.files, function(file, callback){
				var name = file.name || 'image.jpg';	
				PD.saveFile(name, file, {
					onSuccess:function(objSaved){
						//flattern the parse file object
						var cp = {FileId:objSaved.id,url:objSaved.get('file').url()};
						$scope.fields.cover_photos.push(cp);
						callback();
					},
					onError:function(error){
						callback('Cannot upload file. '.error);
					}
				});
			},function(error){
				if(error){
					console.log(error);
				}
				saveObject();
			});
			 
		} else {
			saveObject();
		}
		
		
	}
}]);