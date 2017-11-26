fepsApp.controller('confirmationController', function($scope,$rootScope,$localStorage,sharedDataService,$uibModalInstance,loginService,manageNewsService,$route,$location,manageCycleService) {

	//$scope.msg = msg;
	
	var modal = $uibModalInstance.modal;
	
	$scope.confirmMsg = modal;
	
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
		}else if (modal=="deleteEvent"){
			sharedDataService.broadcastEvent("deleteEvent", []);	
		}else if (modal=="deleteIssue"){
			sharedDataService.broadcastEvent("deleteIssue", []);	
		}else if(modal=="moveCyclePhase"){
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
				
		}else if(modal=="removeProject"){
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