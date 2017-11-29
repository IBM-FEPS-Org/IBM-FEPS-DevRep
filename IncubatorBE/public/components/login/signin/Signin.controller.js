fepsApp.controller('signinController', function($scope,$rootScope,$uibModalInstance,$translate,loginService,$localStorage,sharedDataService,$location) {
												      

		$scope.userName = '';
		
		$scope.password = '';
		
		$scope.errorMessage = '';
		
        $scope.closeLoginModal = function () {
            $uibModalInstance.close('close');
        }
        $scope.doSignIn = function(){
        	angular.forEach($scope.signIn.$error.required, function(field) {
    		    field.$setDirty();
    		});
    		if($scope.signIn.$valid) {
    			loginService.signIn($scope.userName,$scope.password)
            	.then(function (result) {
            		$localStorage.currentUser = result.data.user;
            		$localStorage.currentUser.token = result.data.token;
            		sharedDataService.broadcastEvent("checkCurrentUser", []);
                	$uibModalInstance.close('close');
                	
                	if($localStorage.currentUser.groups[0].id == 10 || $localStorage.currentUser.groups[0].id == 8 || $localStorage.currentUser.groups[0].id == 6||$localStorage.currentUser.groups[0].id == 9 ){
                		$location.path( 'fepsIncubator/briefCaseLanding');
                		$localStorage.isAdminstrator = false;

                	}else{
                		$location.path( 'fepsIncubator/adminPage');
						$localStorage.isAdminstrator = true;
						$rootScope.isAdminstrator = $localStorage.isAdminstrator;
                	}


            	},function (response) {
            		if(response.statusText == ""){
            			$scope.errorMessage = "systemDown";
                		console.log("signIn failed");
            		}
            		if(response.statusText == "Unauthorized"){
            			$scope.errorMessage = "Unauthorized";
            			console.log("check your credentials");
            		}
            	});
            	
    		}  	
        }

        $scope.gotoForgetPassword = function () {

            $scope.closeLoginModal();
            $location.path( 'fepsIncubator/forgetPassword');
        }
});