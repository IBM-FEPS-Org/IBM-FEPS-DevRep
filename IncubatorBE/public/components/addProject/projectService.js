fepsApp.factory('projectService', function ($http, envService, $localStorage) {

    var apiUrl = envService.read('apiUrl');
    var projectService = {};

    projectService.addProjectFeedback = function(feedBack){
    	return $http({
            method: 'PATCH',
            url: apiUrl + '/projects?operType=add_feedback',
            data: feedBack,
            headers: {"Authorization":"Bearer "+$localStorage.currentUser.token}
        });
    }
    
    projectService.saveProjectAttachments = function(incubationAttachments){
    	return $http({
            method: 'PATCH',
            url: apiUrl + '/projects?operType=incubation_attachs',
            data: incubationAttachments,
            headers: {"Authorization":"Bearer "+$localStorage.currentUser.token}
        });
    }
    
    projectService.saveProjectDocuments = function(documentationAttachments){
    	return $http({
            method: 'PATCH',
            url: apiUrl + '/projects?operType=incubation_attachs',
            data: documentationAttachments,
            headers: {"Authorization":"Bearer "+$localStorage.currentUser.token}
        });
    }
    
    projectService.addProject = function (project) {
        return $http({
            method: 'POST',
            url: apiUrl + '/projects',
            data: project,
            headers: {"Authorization":"Bearer "+$localStorage.currentUser.token}
        });
    }
    
    projectService.getProject = function (projectId) {
       return $http({
            method: 'GET',
            url: apiUrl + '/projects/'+projectId,
            headers: {"Authorization":"Bearer "+$localStorage.currentUser.token}
        });
    }
    
    projectService.updateProject = function (project) {
        return $http({
            method: 'PUT',
            url: apiUrl + '/projects',
            data: project,
            headers: {"Authorization":"Bearer "+$localStorage.currentUser.token}
        });
    }
    
    projectService.deleteProject = function (project) {
        return $http({
            method: 'delete',
            url: apiUrl + '/projects/'+project._id + "?rev=" + project._rev,
            data: project,
            headers: {"Authorization":"Bearer "+$localStorage.currentUser.token}
        });
    }

    projectService.getProjects = function (userID) {

        if(userID == -1){
            return $http({
                method: 'GET',
                url: apiUrl + '/projects/',
                headers: {"Authorization":"Bearer "+$localStorage.currentUser.token}
            });
        }else{
            return $http({
                method: 'GET',
                url: apiUrl + '/users/'+userID+'/projects',
                headers: {"Authorization":"Bearer "+$localStorage.currentUser.token}
            });
        }

    }

    projectService.changeProjectStatus = function (project) {
        return $http({
            method: 'PATCH',
            url: apiUrl + '/projects?operType=update_status',
            data: project,
            headers: {"Authorization":"Bearer "+$localStorage.currentUser.token}
        });
    }

    projectService.getCurrentActiveCycle = function () {
        return $http({
            method: 'GET',
            url: apiUrl + '/cycles?active=true',
            data: null,
            headers: {"Authorization":"Bearer "+$localStorage.currentUser.token}
        });
    }

    
    projectService.getAcceptedProjects = function (){
    	 return $http({
             method: 'GET',
             url: apiUrl + '/projects?status=5',
             headers: {"Authorization":"Bearer "+$localStorage.currentUser.token}
         });
    }
    
    return projectService;

});