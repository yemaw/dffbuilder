'use stricts';

App.controller('UserLoginController',['$scope', '$location', '$routeParams', function($scope, $location, $routeParams){
	document.title = 'Login';
	
	if(Parse.User.current()){
		$location.url('resumes');
		return;	
	}
	
	$scope.login = function(){
		$scope.logging_in = true;
		
		Parse.User.logIn($scope.user_id, $scope.password, {
		    success: function(user) {
		    	$scope.flash_messages = [{type:'success','message':'Login success'}];
		        $scope.$apply();
		        setTimeout(function(){
		        	$scope.logging_in = false;
		        	$scope.$apply($location.url($routeParams['redirect'] || 'resumes'));
		        },1000);
		    },
		    error: function(user, error) {
		    	$scope.logging_in = false;
		    	$scope.flash_messages = [{type:'danger','message':error.message}];
		    	$scope.$apply();
		    }
		});
	}
	
}]);