fepsApp.factory('businessClinicService', function ($rootScope, envService, $http,$localStorage) {

    var apiUrl = envService.read('apiUrl');
    var businessClinicService = {};

    businessClinicService.addIssue = function (issue) {
        return $http({
            method: 'POST',
            url: apiUrl + '/clinicissues',
            data: issue,
            headers: {"Authorization":"Bearer "+$localStorage.currentUser.token}
        });
    }
    
    businessClinicService.editIssue = function (issue) {
        return $http({
            method: 'PUT',
            url: apiUrl + '/clinicissues',
            data: issue,
            headers: {"Authorization":"Bearer "+$localStorage.currentUser.token}
        });
    }
    
    businessClinicService.deleteIssue = function (issueId) {
        return $http({
            method: 'delete',
            url: apiUrl + '/clinicissues/'+issueId ,
            headers: {"Authorization":"Bearer "+$localStorage.currentUser.token}
        });
    }
    
    businessClinicService.getIssuesbyID = function(issuesIds){
		return $http({
			method: 'GET',
			url: apiUrl+'/clinicissues?ids='+ issuesIds,
			headers:{}
		});

	};
	
	businessClinicService.getAllIssues = function(issuesIds){
		return $http({
			method: 'GET',
			url: apiUrl+'/clinicissues',
			headers:{}
		});

	};
	
    return businessClinicService;
});
