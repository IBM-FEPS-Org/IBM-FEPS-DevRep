fepsApp.controller('manageEnrollmentsController', function ($scope, $rootScope, $translate, $uibModalInstance, $localStorage, sharedDataService, $log, userProfileService, $timeout, usSpinnerService,$location,manageEventsService) {

	$scope.event = $uibModalInstance.event;
	$scope.activeTab = $uibModalInstance.tabIndex;
	$scope.rowA = "rowA";
    $scope.rowB = "rowB";
    
	$scope.enrollmentsGridOptions = {
            data: $scope.event.value.acceptedEnrollments?$scope.event.value.acceptedEnrollments:[],
            urlSync: false
            
    };
	
	$scope.enrollmentRequestsGridOptions = {
			data: $scope.event.value.pendingEnrollments?$scope.event.value.pendingEnrollments:[],
            urlSync: false
    };
	
	$scope.changeEnrollmentStatus = function(enrollment,index,status){
		usSpinnerService.spin('spinner');
		var userId = enrollment._id;
		manageEventsService.changeEventStatus($scope.event.id,userId,status).then(function (success) {
			$scope.event.value.pendingEnrollments.splice(index,1);
			if(status == 1){
				if(!$scope.event.value.acceptedEnrollments){
					$scope.event.value.acceptedEnrollments = [];
				}
				$scope.event.value.acceptedEnrollments.push(enrollment);
			}else{
				if(!$scope.event.value.rejectedEnrollments){
					$scope.event.value.rejectedEnrollments = [];
				}
				$scope.event.value.rejectedEnrollments.push(enrollment);
			}	
            usSpinnerService.stop('spinner');
        }, function (err) {
            $log.error(err);
            usSpinnerService.stop('spinner');
        })
		

	}
	
});