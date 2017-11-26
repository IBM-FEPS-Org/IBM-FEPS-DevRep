fepsApp.controller('deleteMemberController', function ($scope,$translate,$uibModalInstance,sharedDataService,$localStorage) {
	
	$scope.yesFn=function(){
		sharedDataService.broadcastEvent("deleteMember", [$uibModalInstance.memebrDeletedIndex]);
		$uibModalInstance.close('close');
	}
	
	$scope.cancel=function(){
		$uibModalInstance.close('close');
	}

    
});