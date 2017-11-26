fepsApp.factory('sharedDataService', function ($rootScope, envService, $http,$localStorage) {

    var apiUrl = envService.read('apiUrl');
    var sharedDataService = {};

    sharedDataService.broadcastEvent = function (event, args) {
        $rootScope.$broadcast(event, args);
    }
    
    sharedDataService.refreshUser = function () {
        return $http({
            method: 'GET',
            url: apiUrl + '/refresh-user',
            headers: {"Authorization":"Bearer "+$localStorage.currentUser.token}
        });
    }

    sharedDataService.getSectorsLookUp = function () {
        return $http({
            method: 'GET',
            url: apiUrl + '/lookups/sectors',
            headers: {}
        });
    }

    sharedDataService.getCurrentCycle = function () {
        return $http({
            method: 'GET',
            url: apiUrl + '/cycles?active=true',
            headers: {}
        });
    }

    sharedDataService.getGroupsLookUp = function () {
        return $http({
            method: 'GET',
            url: apiUrl + '/lookups/groups',
            headers: {}
        });
    }

    sharedDataService.addNewsFile = function(file){
  	  var fd = new FormData();
      file.name = file.name.replace(/[^a-zA-Z0-9.]/g , '');

      fd.append('file', file, file.name);
      //fd.enctype = "multipart/form-data";
      return $http.post(apiUrl+'/attachements/', fd, {
         transformRequest: angular.identity,
         headers: {'Content-Type': undefined}
      })
  };
    
    sharedDataService.addFile = function(file){
    	  var fd = new FormData();
        file.name = file.name.replace(/[^a-zA-Z0-9.]/g , '');

        fd.append('file', file, file.name);
        //fd.enctype = "multipart/form-data";
        return $http.post(apiUrl+'/attachements/deattached', fd, {
           transformRequest: angular.identity,
           headers: {'Content-Type': undefined}
        })
    };

    sharedDataService.getProjectStatusLookup = function () {
        return $http({
            method: 'GET',
            url: apiUrl + '/lookups/projects_status',
            headers: {}
        });
    }

    return sharedDataService;
});
