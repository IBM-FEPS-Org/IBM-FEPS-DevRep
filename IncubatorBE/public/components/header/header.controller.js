fepsApp.controller('headerController', function($scope,$location,$rootScope,$uibModal,$localStorage,sharedDataService) {
	
	$scope.user = null; 
	$scope.isUser = false;

	$scope.init = function(){

		var currentUser = $localStorage.currentUser;
		if(currentUser){
			$scope.user = $localStorage.currentUser;
			$scope.isUser = ($localStorage.currentUser.groups[0].id == 8 || $localStorage.currentUser.groups[0].id == 6 || $localStorage.currentUser.groups[0].id == 9 || $localStorage.currentUser.groups[0].id == 10) ? true : false;
		}else{
			$scope.user = null;
		}
		$rootScope.isAdminstrator = $localStorage.isAdminstrator;
	}
	
	$scope.$on("checkCurrentUser", function() {
		var currentUser = $localStorage.currentUser;
		if(currentUser){
			$scope.user = $localStorage.currentUser;
			if($scope.user.profilePic)
			{
				$scope.user.imageSource = "/attachements?id="+$scope.user.profilePic.id
					+"&key="+$scope.user.profilePic.key;
			}
			else{
				$scope.user.imageSource = "../../img/portraitHolder.png";
			}
			$scope.isUser = ($localStorage.currentUser.groups[0].id == 8 || $localStorage.currentUser.groups[0].id == 6 || $localStorage.currentUser.groups[0].id == 9 || $localStorage.currentUser.groups[0].id == 10) ? true : false;
		}else{
			$scope.user = null;
		} 
	});
		
	$scope.openLoginModal = function(){
			var modalInstance = $uibModal.open(
				{
					ariaDescribedBy:'signin',
					templateUrl:'components/login/signin/SignIn.view.html',
					controller : 'signinController',
					size: 'md',
					keyboard: true
				});

			return modalInstance;
	}
	
	
	$scope.signOut = function(){
		var modalInstance = $uibModal.open(
				{
					ariaDescribedBy:'signout',
					templateUrl:'components/shared/confirmation.view.html',
					controller : 'confirmationController',
					size: 'md',
					keyboard: true			
				});
		modalInstance.modal="signout";
	}

	$scope.goToAdmin = function () {

		$location.path('fepsIncubator/adminPage');
	}

});