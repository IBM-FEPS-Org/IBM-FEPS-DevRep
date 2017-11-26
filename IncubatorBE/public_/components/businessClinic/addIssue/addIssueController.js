fepsApp.controller('addIssueController', function ($scope,$translate,$uibModal,$location,usSpinnerService, $localStorage,$window,sharedDataService,$timeout,businessClinicService,$routeParams) {

	$scope.issue = {};
	
	$scope.showResponse = false;
	$scope.editResponse = false;
	
	/*
	 view mode flag
	 1 == add
	 2 == edit
	 3 == view only
	 */
	$scope.viewMode = 1;
	
	$scope.init = function () {
		
		var issueId = -1;

		var param = $location.search();
		if (param.issueId) {
			businessClinicService.getIssuesbyID([param.issueId])
			.then(function (result){
				$scope.issue = result.data.data[0];
				if($scope.issue.status == 'resolved'){
					$scope.viewMode = 3;
					$scope.showResponse = true;
					$scope.editResponse = false;
				}else{
					if($localStorage.currentUser.groups[0].id == 1 || $localStorage.currentUser.groups[0].id == 5){
						$scope.viewMode = 3;
						$scope.showResponse = true;
						$scope.editResponse = true;
					}else{
						$scope.viewMode = 2;
						$scope.showResponse = false;
						$scope.editResponse = false;
					}
				}
				usSpinnerService.stop('spinner');
			},function (error) {
				if(error.statusText != "ok"){
					console.log("get issue by id failed");
				}
			});
		}else{
			$scope.viewMode = 1;
			$scope.user = {
    				firstName : $localStorage.currentUser.firstName,
    				surName: $localStorage.currentUser.surname,
    				_id : $localStorage.currentUser._id,
    				username: $localStorage.currentUser.username,
        			email : $localStorage.currentUser.email,
        	}
			
			$scope.issue.date = new Date();
			$scope.issue.user = $scope.user;
			$scope.issue.status = "open";
		}
		
		
		
	};
	
    $scope.saveIssue = function(){
    	angular.forEach($scope.addIssueForm.$error.required, function(field) {
    	    field.$setDirty();
		});
		if($scope.addIssueForm.$valid) {
			if($scope.editResponse){
				$scope.resolveIssue();
			}else{
			    if($scope.viewMode == 1 ){  
			        $scope.addIssue();
	            }else if($scope.viewMode == 2){
	                $scope.editIssue();
	            }else {
	            	//$window.scrollTo(0, 0);
	            }
			}
		} else{
			//$window.scrollTo(0, 0);
		}
    }
    
    $scope.resolveIssue = function(){
    	$scope.issue.status = 'resolved';
    	businessClinicService.editIssue($scope.issue).then(function (result){	
    		$localStorage.currentUser.token = result.headers('authorization');
    	    sharedDataService.refreshUser().then(function(refreshUserResult){
    	        $localStorage.currentUser = refreshUserResult.data.user;
                $localStorage.currentUser.token = refreshUserResult.data.token;
    	           var modalInstance = $uibModal.open(
    	                    {
    	                        ariaDescribedBy: 'resolveIssue',
    	                        template: '<p class="alert alert-success SuccessMsgPopup text-center">{{"issueResolvedSuccessMsg" | translate}}</p>',
    	                        controller: function ($uibModalInstance) {
    	                            $timeout(function () {
    	                            	$location.path('fepsIncubator/manageClinic');
    	                                $uibModalInstance.close('close');
    	                            }, 3000);
    	                        },
    	                        size: 'md',
    	                        keyboard: true
    	           }); 		
    	    });     

    	},function (error) {
			if(error.statusText != "ok"){
				console.log("adding new  event failed");
			}
		});   	
    }
    
    $scope.editIssue = function(){
    	businessClinicService.editIssue($scope.issue).then(function (result){	
    		$localStorage.currentUser.token = result.headers('authorization');
    	    sharedDataService.refreshUser().then(function(refreshUserResult){
    	        $localStorage.currentUser = refreshUserResult.data.user;
                $localStorage.currentUser.token = refreshUserResult.data.token;
    	           var modalInstance = $uibModal.open(
    	                    {
    	                        ariaDescribedBy: 'editIssue',
    	                        template: '<p class="alert alert-success SuccessMsgPopup text-center">{{"issueEditedSuccessMsg" | translate}}</p>',
    	                        controller: function ($uibModalInstance) {
    	                            $timeout(function () {
    	                            	$location.path('fepsIncubator/briefCaseLanding');
    	                                $uibModalInstance.close('close');
    	                            }, 3000);
    	                        },
    	                        size: 'md',
    	                        keyboard: true
    	           }); 		
    	    });     

    	},function (error) {
			if(error.statusText != "ok"){
				console.log("adding new  event failed");
			}
		});   	
    }
    
    $scope.addIssue = function(){
    	businessClinicService.addIssue($scope.issue).then(function (result){	
    		$localStorage.currentUser.token = result.headers('authorization');
    	    sharedDataService.refreshUser().then(function(refreshUserResult){
    	        $localStorage.currentUser = refreshUserResult.data.user;
                $localStorage.currentUser.token = refreshUserResult.data.token;
    	           var modalInstance = $uibModal.open(
    	                    {
    	                        ariaDescribedBy: 'addProject',
    	                        template: '<p class="alert alert-success SuccessMsgPopup text-center">{{"issueAddedSuccessMsg" | translate}}</p>',
    	                        controller: function ($uibModalInstance) {
    	                            $timeout(function () {
    	                            	$location.path('fepsIncubator/briefCaseLanding');
    	                                $uibModalInstance.close('close');
    	                            }, 3000);
    	                        },
    	                        size: 'md',
    	                        keyboard: true
    	           }); 		
    	    });     

    	},function (error) {
			if(error.statusText != "ok"){
				console.log("adding new  event failed");
			}
		});   	
    }
    
    $scope.cancelsaveIssue = function(){
        if($scope.showResponse){
            $location.path('fepsIncubator/manageClinic');
        }else{
            $location.path('fepsIncubator/briefCaseLanding');
        }
    }
	
	

});