fepsApp.controller('BriefCaseLandingPageController', function ($scope,$translate,$localStorage,usSpinnerService,projectService,sharedDataService,$uibModal,$location,manageEventsService,businessClinicService) {

	$scope.isAdmission = true;
	$scope.rowA = "rowA";
    $scope.rowB = "rowB";
	
	$scope.init = function () {
		
		$scope.isCollapsed = true;
		//$scope.isCollapsed3 = true;
		
		$scope.enrollmentsGridOptions = {
                data: [],
                urlSync: false
        };
		
		$scope.issuesGridOptions = {
				data: [],
                urlSync: false	
		};
		
		sharedDataService.getCurrentCycle().then(function (response) {
			if(response.data.data){
				$scope.isUser = ($localStorage.currentUser.groups[0].id == 8 || $localStorage.currentUser.groups[0].id == 6 || $localStorage.currentUser.groups[0].id == 9) ? true : false;
				$scope.cycle = response.data.data[0];
				if($scope.cycle.currentPhase == "Admission"){
                    $scope.isAdmission = true;
                }else{
                    $scope.isAdmission = false;
                }
				
	        	if($localStorage.currentUser.projects && $localStorage.currentUser.projects[0].cycle == $scope.cycle._id){
	        			$scope.currentRole = $localStorage.currentUser.projects[0].role;
		        		usSpinnerService.spin('spinner');
		        		projectService.getProject($localStorage.currentUser.projects[0]._id)
		            	.then(function (result) {
		            		usSpinnerService.stop('spinner');
		            		$scope.project = result.data.data;
		            		$scope.project.foundingDate = new Date($scope.project.foundingDate);
		            	},function (response) {
		            		if(response.statusText == ""){
		            			usSpinnerService.stop('spinner');
		            			$scope.errorMessage = "systemDown";
		                		console.log("get project failed");
		            		}
		            	});	
		        		_getProjectStatusLookup();
	        	}else{
	        		usSpinnerService.stop('spinner');
	        		$scope.project = null;
	        	}      
			}else{
				$scope.isAdmission = false;
			} 	
        }, function (error) {
            $log.error(JSON.stringify(error));
        })
        
    }
	
	$scope.viewBusinessIssuesDetails = function () {
		if($localStorage.currentUser.clinicIssues && $localStorage.currentUser.clinicIssues.length > 0){
			$scope.issuesGridOptions.data = $localStorage.currentUser.clinicIssues;
			var issuesIds = "";
			for(var i=0;i<$localStorage.currentUser.clinicIssues.length;i++){
				issuesIds = issuesIds +$localStorage.currentUser.clinicIssues[i]+","
			}
			issuesIds = issuesIds.substring(0, issuesIds.length - 1);
	
			businessClinicService.getIssuesbyID(issuesIds).then(function (success) {
	            var issuesDetails = success.data.data;
	            for(var x=0;x<$scope.issuesGridOptions.data.length;x++){
	            	for(var i=0;i<issuesDetails.length;i++){
	            		if($scope.issuesGridOptions.data[x] == issuesDetails[i]._id){
	            			$scope.issuesGridOptions.data[x] = {};
	            			$scope.issuesGridOptions.data[x].id = issuesDetails[i]._id;
	            			$scope.issuesGridOptions.data[x].title = issuesDetails[i].title;
	    	            	$scope.issuesGridOptions.data[x].summary = issuesDetails[i].summary;
	    	            	$scope.issuesGridOptions.data[x].date = issuesDetails[i].date;
	    	            	$scope.issuesGridOptions.data[x].status = issuesDetails[i].status;
	            		}
	            	}
	            }
	            usSpinnerService.stop('spinner');
	        }, function (err) {
	            $log.error(err);
	            usSpinnerService.stop('spinner');
	        })
		}
	}
	
	$scope.openIssueDetails = function (issueId) {
        $location.path('fepsIncubator/addIssue').search({'issueId': issueId});
    }
	
	var removedIssueId =-1;
	var removedIssueIndex =-1;
	
	$scope.openRemoveIssueModal = function(issueId,issueIndex){
		removedIssueId = issueId;
		removedIssueIndex = issueIndex;
		var modalInstance = $uibModal.open(
				{
					ariaDescribedBy:'deleteIssue',
					templateUrl:'components/shared/confirmation.view.html',
					controller : 'confirmationController',
					size: 'md',
					keyboard: true
				});
	  modalInstance.modal="deleteIssue";
	}
	
	$scope.$on("deleteIssue", function() {
		if(removedIssueId != -1){
			businessClinicService.deleteIssue(removedIssueId)
	    	.then(function (result) {
	    		sharedDataService.refreshUser().then(function(refreshUserResult){
	    	        $localStorage.currentUser = refreshUserResult.data.user;
	                $localStorage.currentUser.token = refreshUserResult.data.token;
	                
	                $scope.issuesGridOptions.data.splice(removedIssueIndex,1);
	                removedIssueId =-1;
	                removedIssueIndex = -1;
	    	    }).then(function(){
	    	        if(response.statusText == ""){
	                    $scope.errorMessage = "systemDown";
	                    console.log("refreshing user failed");
	                }
	    	    });
	    	},function (response) {
	    		if(response || response.statusText == ""){
	                $scope.errorMessage = "systemDown";
	                console.log("removing project failed");
	            }
	    	});
			
		}
	});
	
	
	$scope.viewEventsDetails = function () {
		sharedDataService.refreshUser().then(function(refreshUserResult){
	        $localStorage.currentUser = refreshUserResult.data.user;
            $localStorage.currentUser.token = refreshUserResult.data.token;
            $scope.enrollmentsGridOptions.data = $localStorage.currentUser.enrollments;
            if($localStorage.currentUser.enrollments){
    			var eventIds = "";
    			for(var i=0;i<$localStorage.currentUser.enrollments.length;i++){
    				eventIds = eventIds +$localStorage.currentUser.enrollments[i].eventId +","
    			}
    			eventIds = eventIds.substring(0, eventIds.length - 1);
    			manageEventsService.getEventsbyID(eventIds).then(function (success) {
    	            var enrollmentDetails = success.data.data;
    	            for(var i=0;i<enrollmentDetails.length;i++){
    	            	for(var x=0;x<enrollmentDetails.length;x++){
    	            		if($scope.enrollmentsGridOptions.data[x].eventId == enrollmentDetails[i]._id){
    	            			$scope.enrollmentsGridOptions.data[x].topic = enrollmentDetails[i].topic;
    	    	            	$scope.enrollmentsGridOptions.data[x].venue = enrollmentDetails[i].venue;
    	    	            	$scope.enrollmentsGridOptions.data[x].eventDate = enrollmentDetails[i].eventDate;
    	    	            	$scope.enrollmentsGridOptions.data[x].guestSpeaker = enrollmentDetails[i].speakers[0].name;
    	    	            	$scope.enrollmentsGridOptions.data[x].isEventDatePassed = $scope.enrollmentsGridOptions.data[x].eventDate < new Date().getTime();
    	            		}
    	            	}
    	            	
    	            }
    	            usSpinnerService.stop('spinner');
    	        }, function (err) {
    	            $log.error(err);
    	            usSpinnerService.stop('spinner');
    	        })
    		}
	    }).then(function(){
	        if(response.statusText == ""){
                $scope.errorMessage = "systemDown";
                console.log("refreshing user failed");
            }
	    });
    }
	
	$scope.openEventDetails = function (eventId) {
        $location.path('fepsIncubator/eventsDetails').search({'eventId': eventId,'editMode':'false'});
    }
	
	$scope.cancelEnrollment = function(index){
		var eventId = $localStorage.currentUser.enrollments[index].eventId;
		usSpinnerService.spin('spinner');
		manageEventsService.cancelEnrollment(eventId).then(function (success) {
			$localStorage.currentUser.token = success.headers('authorization');
    	    sharedDataService.refreshUser().then(function(refreshUserResult){
    	        $localStorage.currentUser = refreshUserResult.data.user;
                $localStorage.currentUser.token = refreshUserResult.data.token;
                $scope.enrollmentsGridOptions.data.splice(index,1);
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
	
	$scope.openRemoveProjectModal = function(){
		var modalInstance = $uibModal.open(
				{
					ariaDescribedBy:'removeProject',
					templateUrl:'components/shared/confirmation.view.html',
					controller : 'confirmationController',
					size: 'md',
					keyboard: true
				});
	  modalInstance.modal="removeProject";
	}
	
	$scope.selectTab = function (event){
	    angular.element(event.target).parent().toggleClass('active');
	}
	
	var _getProjectStatusLookup = function () {

        if (!$localStorage.projectStatus) {
            usSpinnerService.spin('spinner');
            sharedDataService.getProjectStatusLookup().then(function (response) {
                $scope.projectStatusArray = response.data.data;
                $localStorage.projectStatus = response.data.data;
                usSpinnerService.stop('spinner');
            }, function (error) {
                $log.error(JSON.stringify(error));
                usSpinnerService.stop('spinner');
            })
        } else
            $scope.projectStatusArray = $localStorage.projectStatus;
    }
	
	 $scope.getItemNametById = function (array, id) {
	        if (array && id) {
	            return array.filter(function (item) {
	                return (item.id === id);
	            })[0].name;
	        }
	    }
	
	$scope.$on("removeProject", function() {
		if($scope.project){
			projectService.deleteProject($scope.project)
	    	.then(function (result) {
	    		sharedDataService.refreshUser().then(function(refreshUserResult){
	    	        $localStorage.currentUser = refreshUserResult.data.user;
	                $localStorage.currentUser.token = refreshUserResult.data.token;
	                delete $localStorage.currentUser.projects;
		    		$scope.project = null; 
	    	    }).then(function(){
	    	        if(response.statusText == ""){
	                    $scope.errorMessage = "systemDown";
	                    console.log("refreshing user failed");
	                }
	    	    });
	    	},function (response) {
	    		if(response || response.statusText == ""){
                    $scope.errorMessage = "systemDown";
                    console.log("removing project failed");
                }
	    	});
		}
	});
	
	



});