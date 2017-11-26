fepsApp.controller('manageClinicController', function ($scope,$translate,$uibModal,$localStorage,usSpinnerService,businessClinicService,$location) {


	$scope.rowA = "rowA";
    $scope.rowB = "rowB";
    $scope.noIssues = false;
    
    
	$scope.init = function () {
        
		$scope.isAdmin = ($localStorage.currentUser.groups[0].id == 1 || $localStorage.currentUser.groups[0].id == 5) ? true : false;
        
        $scope.unresolvedIssuesGridOptions = {
                data: [],
                urlSync: false
        };
        $scope.resolvedIssuesGridOptions = {
                data: [],
                urlSync: false
        };
        
        $scope.getAllIssues();
    }
	
	$scope.openIssueDetails = function (issueId) {
        $location.path('fepsIncubator/addIssue').search({'issueId': issueId});
    }
	
	$scope.getAllIssues = function(){			
		usSpinnerService.spin('spinner');
		businessClinicService.getAllIssues().then(function (success) {
			
			if(success.data.data == 0 || success.data.data == null){
                $scope.noIssues = true;
            }
            else {
                $scope.noIssues = false;
                for(var i =0;i<success.data.data.length;i++){
                	if(success.data.data[i].status == 'open'){
                		$scope.unresolvedIssuesGridOptions.data.push(success.data.data[i]);
                	}
                	else{
                		$scope.resolvedIssuesGridOptions.data.push(success.data.data[i]);
                	}
                }
            }
            usSpinnerService.stop('spinner');
        }, function (err) {
            $log.error(err);
            usSpinnerService.stop('spinner');
        })
	}

});