fepsApp.factory('manageJobsService', function ($http, envService, $localStorage) {

    var apiUrl = envService.read('apiUrl');
    var manageJobsService = {};

	manageJobsService.getJobList = function(){
    	return $http({
			method: 'GET',
			url: apiUrl+'/recruitments',
			headers: {}
		 });
    };
	manageJobsService.getProjectByName = function(ProjectName){
		return $http({
			method: 'GET',
			url: apiUrl+'/projects?name='+ProjectName,
			headers: {"Authorization":"Bearer "+$localStorage.currentUser.token}
		});
	};
	manageJobsService.getJobbyID = function(jobID){
		return $http({
			method: 'GET',
			url: apiUrl+'/recruitments/'+jobID,
			headers: {}
		});
	};
	manageJobsService.deleteJobbyID = function (jobID) {
    	return $http({
			method: 'DELETE',
			url: apiUrl+'/recruitments/'+jobID,
			headers: {"Authorization":"Bearer "+$localStorage.currentUser.token}
		 });
    };
	manageJobsService.addJob = function(newJob){
	    return $http({
			method: 'POST',
			url: apiUrl+'/recruitments',
			data: newJob,
			headers: {"Authorization":"Bearer "+$localStorage.currentUser.token}
		 });
    };
	manageJobsService.updateJob = function(updateJob){
	    return $http({
			method: 'PUT',
			url: apiUrl+'/recruitments',
			data: updateJob,
			headers: {"Authorization":"Bearer "+$localStorage.currentUser.token}
		 });
    };
    return manageJobsService;
});
