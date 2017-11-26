fepsApp.controller('ManageCycleController', function ($scope,$translate,$uibModal,$localStorage,manageCycleService,$interval, $filter) {

	$scope.selected1 = true;


	$scope.cycle={};
	
	$scope.flagIsCycle = false;
	
	$scope.init = function () {
		
		 $scope.isAdmin = ($localStorage.currentUser.groups[0].id == 1 || $localStorage.currentUser.groups[0].id == 4) ? true : false;
		 
		 
		  $scope.findCycle = manageCycleService.getCycle(true).then(function (result){
			  $scope.cycle = result.data.data[0];
			  if ($scope.cycle!=null){
				  $localStorage.cycle = $scope.cycle;
				  $scope.flagIsCycle=true;
				  $scope.currentPhase=$scope.cycle.currentPhase;
			  }
				  
			  else
				  $scope.flagIsCycle=false; 
				},function (error) {
					if(response.statusText != "ok"){
						console.log("getting Cycle failed");
					}
			});
		  
	  };
	
	$scope.addCycle=function(){
		var currentDate = new Date().getTime();
		$scope.flagIsCycle = true;
		$scope.cycle.currentPhase = 'Start';
		$scope.currentPhase = 'Start';
		$localStorage.cycle = $scope.cycle;
	}
	
	$scope.movePhase = function(phase){	
		
		$localStorage.cycle = $scope.cycle;
		$localStorage.cycleNextPhase = phase;
		
		var modalInstance = $uibModal.open(
			{
				ariaDescribedBy:'movePhase',
				templateUrl:'components/shared/confirmation.view.html',
				controller : 'confirmationController',
				size: 'md',
				keyboard: true
			});
		  modalInstance.modal="moveCyclePhase";
	};
	
	
	$scope.$on("cycleClosure", function() {
		$scope.flagIsCycle = false;
		$localStorage.cycle = null;
		$scope.cycle = {};
	});
	
	


});