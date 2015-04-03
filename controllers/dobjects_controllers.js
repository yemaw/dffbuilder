App.controller('DObjectsIndexController',['$routeParams', '$scope', 'ParseDataService', function($routeParams, $scope, PD){
	
	document.title = Helper.CapitalizeFirstLetter($routeParams.controller);
	
	$scope.controller = $routeParams.controller;
	
	$scope.dobjects = [];
	
	var callbacks = {
		onSuccess : function(list){
			$scope.dobjects = list;	
			$scope.$apply();
		},
		onError : function(){}
	}
	
	
	$scope.filterData = function(){
		PD.getObjects($scope.filters, $scope.controller, callbacks);
	}
	
	PD.getObjects([], $scope.controller, callbacks);
}]);


App.controller('DObjectsCreateController', ['$routeParams', '$scope', 'ParseDataService', function($routeParams, $scope, PD){
	
	document.title = 'Create';
	
	$scope.controller = $routeParams.controller;
	
	$scope.fields = {};//need this for dynamic loaded form fields
	
	$scope.form_fields = configs.form_fields;
	
	$scope.saveObject = function(){
	
		var saveObject = function(){
			PD.saveObject($scope.fields, $scope.controller, {
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