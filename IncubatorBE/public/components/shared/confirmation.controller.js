fepsApp.controller('confirmationController', function($scope,$rootScope,$localStorage,sharedDataService,$uibModalInstance,loginService,projectService,manageNewsService,manageUsersService,$route,$location,manageCycleService) {

	//$scope.msg = msg;
	
	var modal = $uibModalInstance.modal;
	
	$scope.confirmMsg = modal;
	
	if (modal=="deleteUser")
	{
		var message = $scope.deletedUserName;
		loginService.getUserByUsername($scope.deletedUserName)
        	.then(function (result) 
		{
        		let projects;
        		let enrollments;
        		let issues = result.data.data.clinicIssues;
        		message +=" This user: <br/>";
        		
        		if(result.data.data.projects)
    			{
        			projects = result.data.data.projects;
        			message += "Is a " + projects[0].role+ " in a project. <br/> ";
    			}
        		
        		projectService.getProject(projects[0]._id).then(function(result)
        		{
        			if((result.data.data.members.length-1) < 2 && projects[0].role != "Founder")
    				{
        				message += "The team members of this project will be less than 2 !";
    				}
        			document.getElementById("deleteUser").innerHTML = message;
        			
        		},function (response) 
        			{
	            		if(response.statusText == ""){
	            			$scope.errorMessage = "systemDown";
	                		console.log("get users by username failed");
	            		}
        			}
        		);
        		if(result.data.data.enrollments)
    			{
        			enrollments = result.data.data.enrollments;
        			message += "Enrolled in "+ enrollments.length +" Events. <br/> ";
    			}
        		if(result.data.data.clinicIssues)
    			{
        			issues = result.data.data.clinicIssues;
        			message += "Has "+ issues.length +" submitted business issues. <br/> <br/>";
    			}
        		document.getElementById("deleteUser").innerHTML = message;
    			
        		
        		
        		
        		/*console.log("events");
        		console.log(result.data.data.enrollments);
        		
        		console.log("projects");
        		console.log(result.data.data.projects);
        		
        		console.log("issues");
        		console.log(result.data.data.clinicIssues);*/
        			
        	 },function (response) {
        		if(response.statusText == ""){
        			$scope.errorMessage = "systemDown";
            		console.log("get users by username failed");
        		}
        	});
	}
	
	
	$scope.yesFn=function(){
		if (modal=="signout"){
			loginService.signOut();
			sharedDataService.broadcastEvent("checkCurrentUser", []);
			$location.path( 'fepsIncubator/home');
            $localStorage.isAdminstrator = false
            $rootScope.isAdminstrator = $localStorage.isAdminstrator;
		}
		else if (modal=="deleteNews"){
			manageNewsService.deletNews().then(function (result){
				$route.reload();	
			},function (error) {
				if(response.statusText != "ok"){
					console.log("delete news list failed");
				}
			});
		}
		else if (modal=="deleteUser")
		{
			sharedDataService.broadcastEvent("deleteUser", []);	
		}
		else if (modal=="deleteEvent"){
			sharedDataService.broadcastEvent("deleteEvent", []);	
		}
		else if (modal=="deleteSpeaker"){
			sharedDataService.broadcastEvent("deleteSpeaker", []);	
		}
		else if (modal=="deleteIssue"){
			sharedDataService.broadcastEvent("deleteIssue", []);	
		}
		else if(modal=="moveCyclePhase"){
			if ($localStorage.cycleNextPhase=='Admission')
				manageCycleService.addCycle().then(function (result){
					$localStorage.cycle._id=result.data.data.id;
					$localStorage.cycle._rev=result.data.data.rev;
				},function (error) {
					if(response.statusText != "ok"){
						console.log("Add New Cycle failed");
					}
				});
			else{
				manageCycleService.updateCycle().then(function (result){
					$localStorage.cycle._id=result.data.data.id;
					$localStorage.cycle._rev=result.data.data.rev;
					if($localStorage.cycle.currentPhase == "Closure"){
						sharedDataService.broadcastEvent("cycleClosure", []);
					}
				},function (error) {
					if(response.statusText != "ok"){
						console.log("update Cycle failed");
					}
				});
			}
				
		}
		else if(modal=="removeProject"){
			sharedDataService.broadcastEvent("removeProject", []);
		}
		else if(modal == "deleteJobModal"){
			sharedDataService.broadcastEvent("deleteJob", []);
		}
		$uibModalInstance.close('close');
	}
	
	$scope.cancel=function(){
		$uibModalInstance.close('close');
	}

	
	
});