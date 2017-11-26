fepsApp.factory('mentorListService', function($http,envService) {
	
	var apiUrl = envService.read('apiUrl');
	var mentorListService = {};
	
	mentorListService.getMentorList = function (){
		
		return $http({
			method: 'GET',
			url: apiUrl+'/users?groups=7',
			headers: {}
		 });	
	}

    return mentorListService;

});