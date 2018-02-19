fepsApp.controller('addMemberController', function ($scope,$translate,$uibModalInstance,sharedDataService,loginService,$localStorage) {


    $scope.searchInput = "";
    
    $scope.searchresult = null;

    $scope.noUsersFound = false;
    
    $scope.userDuplicate = false;
    
    $scope.addedUser = {};
    
    $scope.roles = [
        {
            "id": 1,
            "Role": "Co-Founder"
        },
        {
            "id": 2,
            "Role": "Member"
        }
    ];
    
    $scope.projectMembers = $uibModalInstance.projectMembers;
    $scope.deletedMembers = $uibModalInstance.deletedMembers;
    $scope.$watch('searchInput', function(newValue, oldValue) {
    	$scope.noUsersFound = false;
    });
    $scope.selectedRole = "";
    $scope.addedUser.role = $scope.roles[1].Role;
    $scope.updateRole = function (selected) 
    {
        $scope.selectedRole = $scope.roles[selected-1].Role;
		if($scope.addedUser)
		{
			$scope.addedUser.role = $scope.roles[selected-1].Role;
		}
    }
    
    $scope.searchUsers = function(){
    
    	angular.forEach($scope.addMemebrForm.$error.required, function(field) {
    		field.$setDirty();
		});
    	
    	if($scope.addMemebrForm.$valid){
    		var foundInDeleted = -1;
    		if($scope.deletedMembers.length >0)
    		{
    			for(var i=0;i<$scope.deletedMembers.length;i++)
    			{
        			if($scope.deletedMembers[i].username == $scope.searchInput)
        			{
        				foundInDeleted = i;
        				break;
        			}
        		}
    		}
    		if(foundInDeleted != -1)
    		{
    			
    			$scope.addedUser = 
    			{
    				firstName : $scope.deletedMembers[foundInDeleted].firstName,
    				surName: $scope.deletedMembers[foundInDeleted].surname,
    				_id : $scope.deletedMembers[foundInDeleted]._id,
    				username: $scope.deletedMembers[foundInDeleted].username,
        			email : $scope.deletedMembers[foundInDeleted].email,
        			role : $scope.selectedRole
			};
    			$scope.deletedMembers.splice(i,1);
    			return;
    		}
    		if($scope.searchInput != $localStorage.currentUser.username){
    			sharedDataService.getCurrentCycle().then(function (response) {
    	    		$scope.cycle = response.data.data[0];
    				loginService.getUserByUsername($scope.searchInput)
                	.then(function (result) {
                		if(result.data.data){
                			if(result.data.data.projects && result.data.data.projects[0].cycle == $scope.cycle._id){
                				$scope.noUsersFound = true;
                			}else if(result.data.data.groups[0].id == 1){
                				$scope.noUsersFound = true;
                			}else{
                				$scope.userDuplicate = $scope.checkMemberDuplication(result.data.data._id);
                				if(!$scope.userDuplicate){
                					$scope.addedUser = {
                            				firstName : result.data.data.firstName,
                            				surName: result.data.data.surname,
                            				_id : result.data.data._id,
                            				username: result.data.data.username,
                                			email : result.data.data.email,
                                			role : $scope.selectedRole
                    				};
                    				$scope.noUsersFound = false;
                				}
                        	}	
                		}else{
                			$scope.noUsersFound = true;
                		}
                	},function (response) {
                		if(response.statusText == ""){
                			$scope.errorMessage = "systemDown";
                    		console.log("get users by username failed");
                		}
                	});
    			}, function (error) {
    	            $log.error(JSON.stringify(error));
    	        })		
    		}else{
    			$scope.noUsersFound = true;
    		}
    	}
    }
    
    $scope.checkMemberDuplication = function(addedMemebrId){
    	for(var i=0;i<$scope.projectMembers.length;i++){
    		if($scope.projectMembers[i]._id == addedMemebrId){
    			return true;
    		}
    	}
    }
    
    $scope.addMemebrtoProject= function(){
	    	
	    	sharedDataService.broadcastEvent("addMembertoProject", {addedMemebr: $scope.addedUser});
	    	$scope.addedUser = null;
	    	$scope.searchInput = null;
	    	$scope.addMemebrForm.$setPristine();
    }
    
    
    $scope.closeaddMemberModal = function () {
        $uibModalInstance.close('close');
    }
});