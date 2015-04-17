App.controller('PageController',['$location', '$routeParams','$scope', 'toaster',
function($location, $routeParams, $scope, toaster){
	$scope.$on('Page_ShowToaster', function(event, data) { 
		var options = data || {};
		options.timeout = data.timeout || 1500;
		options.body = (data.body && (typeof data.body === 'object') ? JSON.stringify(data.body) : data.body) || '';
		options.allowHtml = true;
		toaster.pop(options);
		$scope.$apply();
	});
	
	$scope.$on('Page_BlockUI', function(event, data) { 
		var options = data || {};
		options.message = options.message || 'Please wait...'
		$.blockUI({
		css: { 
            border: 'none', 
            padding: '15px', 
            backgroundColor: '#000000', 
            '-webkit-border-radius': '10px', 
            '-moz-border-radius': '10px', 
            opacity: .5, 
            color: '#fff' 
        },
        overlayCSS:  { 
	        backgroundColor: '#00000', 
	        opacity:         0.6, 
	        cursor:          'wait' 
	    }, 
        message:options.message
        }); 
 
        
	});
	
	$scope.$on('Page_UnBlockUI', function(event, data) { 
		$.unblockUI();	
	});
	
}]);