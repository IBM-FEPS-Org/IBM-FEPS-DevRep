fepsApp.controller('adminPageController', function ($scope,$translate,$uibModal,$localStorage) {


	$scope.selected0 = true;


	$scope.adminRole = $localStorage.currentUser.groups[0];
	
	$scope.systemRoles = [
	    {"id": 1, "name" : "Super Admin"},
	    {"id": 2, "name" : "IT Admin"},
	    {"id": 3, "name" : "Supervisor Event"},
	    {"id": 4, "name" : "Supervisor Project"},
	    {"id": 5, "name" : "Supervisor clinic"},
	    {"id": 6, "name" : "Founder"},
	    {"id": 7, "name" : "Mentor"},
	    {"id": 8, "name" : "Registered user"}
	  ];
		
		
	



});