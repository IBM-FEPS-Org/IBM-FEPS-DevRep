fepsApp.controller('adminSideMenuController', function($scope,$localStorage,sharedDataService) {

	$scope.adminRole = $localStorage.currentUser.groups[0];



});