'use stricts';

App.controller('UserLoginController',['$scope', '$rootScope', '$location', '$routeParams', 'FormsStructureService',
function($scope, $rootScope, $location, $routeParams, FSS){
	document.title = 'Login';
	
	if(Parse.User.current()){
		$location.url(FSS.getDefaultCollection());
		return;	
	}
	$scope.logging_in = true;
	$scope.login = function(){
		$scope.logging_in = true;
		
		Parse.User.logIn($scope.user_id, $scope.password, {
		    success: function(user) {
		    	$scope.logging_in = false;
	        	$scope.$apply($location.url($routeParams['redirect'] || FSS.getDefaultCollection()));
		        $rootScope.$broadcast('Page_ShowToaster',{type:'success', body:'Successfuly logged in.'});
		    },
		    error: function(user, error) {
		    	$scope.logging_in = false;
		    	$rootScope.$broadcast('Page_ShowToaster',{type:'error', body:error.message, timeout:3000});
		    	$scope.$apply();
		    }
		});
	}
	
}]);