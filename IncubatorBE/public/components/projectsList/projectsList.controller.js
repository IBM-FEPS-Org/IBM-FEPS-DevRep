fepsApp.controller('ProjectsListController', function ($rootScope, $scope, $translate, $uibModal, $timeout, projectService, $log, $localStorage, usSpinnerService, $location, sharedDataService) {


    $scope.rowA = "rowA";
    $scope.rowB = "rowB";

    $scope.$on("updateProjectList",function(e,a){
        _getProjects();
        $scope.selectedProjects = [];
        $scope.selectedProjectsArr = [];
    });
    $scope.init = function () {
        $scope.selectedProjects = [];
        $scope.selectedProjectsArr = [];
        $scope.groupsArray = [];
        $scope.projectStatusArray = [];
        $scope.currentUser = $localStorage.currentUser;
        $scope.noAcceptedProjects = false;

        $scope.gridOptions = {
            data: [],
            urlSync: true
        };

        $scope.gridActions = {

        }

        _getProjects();
        _getProjectStatusLookup();
        
    }

    var _getProjectStatusLookup = function () {

        if (!$localStorage.projectStatus) {
            usSpinnerService.spin('spinner');
            sharedDataService.getProjectStatusLookup().then(function (response) {
                $scope.projectStatusArray = response.data.data;
                $localStorage.projectStatus = response.data.data;
                usSpinnerService.stop('spinner');
            }, function (error) {
                $log.error(JSON.stringify(error));
                usSpinnerService.stop('spinner');
            })
        } else
            $scope.projectStatusArray = $localStorage.projectStatus;
    }

    var _getProjects = function () {        
        usSpinnerService.spin('spinner');
        // console.log("sss");
        projectService.getAcceptedProjects().then(function (success) {
            $scope.gridOptions.data = success.data.data;

            if(!$scope.gridOptions.data ||  $scope.gridOptions.data.length == 0){
                $scope.noAcceptedProjects = true;
            }
            else{
                $scope.noAcceptedProjects = false;
            }
            usSpinnerService.stop('spinner');
        }, function (err) {
            $log.error(err);
            usSpinnerService.stop('spinner');
        })
        
        
    }
    
    
    $scope.getItemNametById = function (array, id) {
        if (array && id) {
            return array.filter(function (item) {
                return (item.id === id);
            })[0].name;
        }
        /*else{
           $log.error("getItemNametById::id="+id);
        }*/

    }

    $scope.changeProjectStatus = function (project, status) {
        usSpinnerService.spin('spinner');
        var projectObj = {"_id": project._id, "status": status};

        projectService.changeProjectStatus(projectObj).then(function (success) {
            usSpinnerService.stop('spinner');
            if (success.data.code == 'Object_updated') {
                $scope.$broadcast('updateProjectList');
            } else {
                $scope.errorMessage = true;
                $scope.errorCode = ($rootScope.currentLanguage == 'en') ? success.data.en : success.data.ar;
                $log.error(success);
            }

        }, function (err) {
            usSpinnerService.stop('spinner');
            $scope.errorMessage = true;
            $scope.errorCode = ($rootScope.currentLanguage == 'en') ? success.data.en : success.data.ar;
            $log.error(err);

        });
    }

  

});