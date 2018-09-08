fepsApp.controller('eventsDetailsController', function ($uibModal,$scope,$translate,$routeParams,$location,$localStorage,usSpinnerService,manageEventsService,$route,sharedDataService) {

	var eventID = -1;

	var param = $location.search();
	$scope.agendaAttachment = {};
	$scope.agendaUploaded = false;
	$scope.hasFees = false;
	$scope.providesCertificate = false;
	
	$scope.init = function () 
	{
		$scope.agendaAttachment = {};
		$scope.agendaUploaded = false;
		$scope.enableEnrollment = true;
		if (param.eventId) 
		{

			usSpinnerService.spin('spinner');

			eventID = $routeParams.eventId;
			$scope.viewMode = 3;

			manageEventsService.getEventbyID(eventID)
				.then(function (result) {

					$scope.currentEvent = result.data.data;
					
					$scope.eventImageSource = "/attachements?id=" + $scope.currentEvent.eventPhotoAttach.id
						+ "&key=" + $scope.currentEvent.eventPhotoAttach.key;

					
					$scope.loggedIn = $localStorage.currentUser ? true : false;

					$scope.isEnrolled  = $scope.checkIFEnrolled($scope.currentEvent);
					
					
					var now = new Date();
					
					$scope.isEventDatePassed  = $scope.currentEvent.eventEnrollDeadline < now.getTime();
					
					if($scope.currentEvent.emailRecipients && $scope.currentEvent.emailRecipients == "students" )
					{
						if($localStorage.currentUser && new Date($localStorage.currentUser.graduationYear) < new Date(now.getTime()))
						{
							$scope.enableEnrollment = false;
						}
						
					}
					else if($scope.currentEvent.emailRecipients  && $scope.currentEvent.emailRecipients == "graduates" )
					{
						if($localStorage.currentUser && new Date($localStorage.currentUser.graduationYear) > new Date(now.getTime()))
						{
							$scope.enableEnrollment = false;
						}
					}
					
					if($scope.currentEvent.agendaAttachment && $scope.currentEvent.agendaAttachment.id)
					{
            			$scope.agendaUploaded = true;
						$scope.agendaAttachment = 
						{
								key : $scope.currentEvent.agendaAttachment.key,
								id: $scope.currentEvent.agendaAttachment.id,
								rev:$scope.currentEvent.agendaAttachment.rev
						};
            		}
					
					if($scope.currentEvent.fees && $scope.currentEvent.fees != "")
					{
						$scope.hasFees = true;
					}
					
					if($scope.currentEvent.certificate == "true")
					{
						$scope.providesCertificate = true;
					}
					
					usSpinnerService.stop('spinner');


				}, function (error) {
					if (error.statusText != "ok") {
						console.log("get event by id failed");
					}
				});

		}
	}

	$scope.checkIFEnrolled = function(event){
		var isEnrolled = false;
		if(!$localStorage.currentUser) return isEnrolled;
		
		var userId = $localStorage.currentUser._id;
		
		if(event.acceptedEnrollments){
			for(var i=0;i<event.acceptedEnrollments.length;i++){
				var enrollmentUserId = event.acceptedEnrollments[i]._id;
				if(enrollmentUserId == userId){
					isEnrolled = true;
					break;
				}
			}
		}
		
		if(isEnrolled) return isEnrolled;
		
		if(event.pendingEnrollments){
			for(var i=0;i<event.pendingEnrollments.length;i++){
				var enrollmentUserId = event.pendingEnrollments[i]._id;
				if(enrollmentUserId == userId){
					isEnrolled = true;
					break;
				}
			}
		}
		
		if(isEnrolled) return isEnrolled;
		
		if(event.rejectedEnrollments){
			for(var i=0;i<event.rejectedEnrollments.length;i++){
				var enrollmentUserId = event.rejectedEnrollments[i]._id;
				if(enrollmentUserId == userId){
					isEnrolled = true;
					break;
				}
			}
		}
		
		return isEnrolled;
		
	}
	
	$scope.enroll = function(){
		usSpinnerService.spin('spinner');
		manageEventsService.enroll($scope.currentEvent._id).then(function (success) {
    	    $localStorage.currentUser.token = success.headers('authorization');
    	    sharedDataService.refreshUser().then(function(refreshUserResult){
    	        $localStorage.currentUser = refreshUserResult.data.user;
                $localStorage.currentUser.token = refreshUserResult.data.token;
                $route.reload();
                usSpinnerService.stop('spinner');
    	    }).then(function(){
    	        if(response.statusText == ""){
                    $scope.errorMessage = "systemDown";
                    console.log("refreshing user failed");
                }
    	    });
        }, function (err) {
            $log.error(err);
            usSpinnerService.stop('spinner');
        })
			
	}
	
	$scope.cancelEnrollment = function(){
		usSpinnerService.spin('spinner');
		manageEventsService.cancelEnrollment($scope.currentEvent._id).then(function (success) {
			$localStorage.currentUser.token = success.headers('authorization');
    	    sharedDataService.refreshUser().then(function(refreshUserResult){
    	        $localStorage.currentUser = refreshUserResult.data.user;
                $localStorage.currentUser.token = refreshUserResult.data.token;
                $route.reload();
                usSpinnerService.stop('spinner');
    	    }).then(function(){
    	        if(response.statusText == ""){
                    $scope.errorMessage = "systemDown";
                    console.log("refreshing user failed");
                }
    	    });
        }, function (err) {
            $log.error(err);
            usSpinnerService.stop('spinner');
        })
	}
	
//	$scope.signUptoEnroll = function(){
//		$location.path('fepsIncubator/signup').search({'from': 'events',"eventId":$scope.currentEvent._id});
//	}
//	
	$scope.signUptoEnroll = function(){
		var modalInstance = $uibModal.open(
                {
                    ariaDescribedBy: 'signUpToEnroll',
                    template: '<div class=" text-center" id="signUptoEnrollModal"> <p class="text-center">{{"signUptoEnrollMsg" | translate}}</p> <button class="btn btn-success" ng-click="gotoSignUp()">{{"signUptoEnrollbtn" | translate}}</button></div>',
                    controller: function ($uibModalInstance,$scope) {
                    	$scope.gotoSignUp = function(){
                    		$uibModalInstance.close('close');
                    		$location.path('fepsIncubator/signup').search({'eventId':$scope.currentEvent._id});
                    	}
                        
                    },
                    size: 'md',
                    keyboard: true
                });
	};
	
});