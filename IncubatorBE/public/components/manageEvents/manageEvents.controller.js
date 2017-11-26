fepsApp.controller('manageEventsController', function ($scope,$translate,$uibModal,$localStorage,manageEventsService,$location,$route,usSpinnerService,$window) {

	$scope.rowA = "rowA";
    $scope.rowB = "rowB";
    
    $scope.deletedEventIndex = -1;
    
	$scope.init = function () {
        
		$scope.isAdmin = ($localStorage.currentUser.groups[0].id == 1 || $localStorage.currentUser.groups[0].id == 3) ? true : false;
        
        $scope.eventsGridOptions = {
                data: [],
                urlSync: false
        };
        
        $scope.getEvents();
    }
	
	
	$scope.getEvents = function(){			
		usSpinnerService.spin('spinner');
		manageEventsService.getAllEvents().then(function (success) {
			
			if(success.data.data == 0 || success.data.data == null){
                $scope.noEvents = true;
            }
            else {
                $scope.noEvents = false;
                $scope.eventsGridOptions.data = success.data.data;
                for(var i =0;i<$scope.eventsGridOptions.data.length;i++){
                	if(!$scope.eventsGridOptions.data[i].value.acceptedEnrollments){
                		$scope.eventsGridOptions.data[i].value.acceptedEnrollments = [];
                	}
                	if(!$scope.eventsGridOptions.data[i].value.pendingEnrollments){
                		$scope.eventsGridOptions.data[i].value.pendingEnrollments = [];
                	}
                }
            }
            usSpinnerService.stop('spinner');
        }, function (err) {
            $log.error(err);
            usSpinnerService.stop('spinner');
        })
	}
	
	$scope.openEventDetails = function (eventId) {
        $location.path('fepsIncubator/addEditEvents').search({'eventId': eventId});
    }
	$scope.addEvent = function () {
        $location.path('fepsIncubator/addEditEvents');
    }
	
	$scope.viewEnrollmentRequests = function(event,tabIndex){
		var modalInstance = $uibModal.open(
	            {
	                ariaDescribedBy: 'Role',
	                templateUrl: 'components/manageEvents/manageEnrollments/manageEnrollments.view.html',
	                controller: 'manageEnrollmentsController',
	                size: 'lg',
	                keyboard: true
	            });
	        modalInstance.event = event;
	        modalInstance.tabIndex = tabIndex;
	        return modalInstance;
	}
	
	$scope.deleteEvent = function(index){
		$scope.deletedEventIndex = index;
		  var modalInstance = $uibModal.open(
					{
						ariaDescribedBy:'deleteEvent',
						templateUrl:'components/shared/confirmation.view.html',
						controller : 'confirmationController',
						size: 'md',
						keyboard: true
					});
		  modalInstance.modal="deleteEvent";

	  }
	
	$scope.$on("deleteEvent", function() {
		if($scope.deletedEventIndex != -1){
			manageEventsService.deleteEvent($scope.eventsGridOptions.data[$scope.deletedEventIndex].id)
	    	.then(function (result) {
	    		$scope.eventsGridOptions.data.splice($scope.deletedEventIndex,1);
	    		if($scope.eventsGridOptions.data.length == 0){
	    			$scope.noEvents = true;
	    		}else{
	    			$scope.noEvents = false;
	    		}
	    	},function (response) {
	    		if(response || response.statusText == ""){
                    $scope.errorMessage = "systemDown";
                    console.log("deleting Event failed");
                }
	    	});
		}
	});

});