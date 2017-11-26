fepsApp.controller('signinPageController', function($scope,$translate, $rootScope,loginService,$localStorage,sharedDataService,$location) {
												      
		var param = $location.search();
		
		if (param.error) {
			$scope.error = param.error;
		}
		
		$scope.userName = '';
		
		$scope.password = '';
		
		$scope.errorMessage = '';
		
        $scope.doSignIn = function(){
        	angular.forEach($scope.signIn.$error.required, function(field) {
    		    field.$setDirty();
    		});
    		if($scope.signIn.$valid) {
    			loginService.signIn($scope.userName,$scope.password)
            	.then(function (result) {
            		$localStorage.currentUser = result.data.user;
            		$localStorage.currentUser.token = result.data.token;
            		console.log("current user name"+$localStorage.currentUser);
            		sharedDataService.broadcastEvent("checkCurrentUser", []);
            		if($localStorage.currentUser.groups[0].id == 8 || $localStorage.currentUser.groups[0].id == 6){
                		$location.path( 'fepsIncubator/briefCaseLanding');
                	}else{
                		$location.path( 'fepsIncubator/adminPage');
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

            // $scope.closeLoginModal();
            $location.path( 'fepsIncubator/forgetPassword');
        }
});