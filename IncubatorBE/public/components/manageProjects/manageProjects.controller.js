fepsApp.controller('ManageProjectsController', function ($rootScope, $scope, $translate, $uibModal, $timeout, projectService, $log, $localStorage, usSpinnerService, $location, sharedDataService) {

    $scope.selected2 = true;
    $scope.rowA = "rowA";
    $scope.rowB = "rowB";


    $scope.$on("updateProjectList", function (event) {
        _getProjects();
        $scope.selectedProjects = [];
        $scope.selectedProjectsArr = [];
    });
    $scope.init = function () {
        $scope.selectedProjects = [];
        $scope.selectedProjectsArr = [];
        $scope.groupsArray = [];
        $scope.projectStatusArray;
        $scope.currentUser = $localStorage.currentUser;
        $scope.isReviewed = false;

        $scope.gridOptions = {
            data: [],
            urlSync: false
        };

        $scope.gridActions = {}
        _checkCurrentActiveCycle();
        _checkPermissions();
        _getProjects();
        _getGroupsLookup();
        _getProjectStatusLookup();
    }

    $scope.openAssignMentor = function () {

        for (var key in $scope.selectedProjects) {
            if ($scope.selectedProjects.hasOwnProperty(key)) {
                var val = $scope.selectedProjects[key];
                $scope.selectedProjectsArr.push(val);
            }
        }
        if ($scope.selectedProjectsArr.length > 0) {
            var assignMentorsModal = $uibModal.open(
                {
                    ariaDescribedBy: 'assign',
                    templateUrl: 'components/manageProjects/assignMentor/assignMentor.view.html',
                    controller: 'assignMentorController',
                    size: 'md',
                    keyboard: true
                });
            assignMentorsModal.selectedProjects = $scope.selectedProjectsArr;
            return assignMentorsModal;
        } else {
            var NoProjectsSelectedModal = $uibModal.open(
                {
                    ariaDescribedBy: 'assignValidation',
                    template: '<p class="alert alert-success SuccessMsgPopup text-center">Please select at least at project</p>',
                    controller: function ($uibModalInstance) {
                        $timeout(function () {
                            $uibModalInstance.close('close');
                        }, 2000);
                    },
                    size: 'md',
                    keyboard: true
                });
            return NoProjectsSelectedModal;
        }

    }

    $scope.checkAll = function () {
        if ($scope.selectedAll) {
            $scope.selectedAll = false;
        } else {
            $scope.selectedAll = true;
        }
        angular.forEach($scope.gridOptions.data, function (item, $index) {
            item.selected = $scope.selectedAll;
            $scope.getSelectedProjects($index);
        });

    };

    $scope.getSelectedProjects = function (index) {

        if ($scope.gridOptions.data[index].selected == true) {
            $scope.selectedProjects[index] = $scope.gridOptions.data[index];
        } else {
            delete $scope.selectedProjects[index];
        }

        $log.info($scope.selectedProjects);
    }


    $scope.openProfile = function (username) {
        $location.path('fepsIncubator/viewProfile').search({'username':username});
    }

    $scope.openProjectDetails = function (projectId) {
        $location.path('fepsIncubator/addProject').search({'projectId': projectId});
    }

    $scope.openFeedback = function (project) {


        var addFeedbackModal = $uibModal.open(
            {
                ariaDescribedBy: 'feedback',
                templateUrl: 'components/manageProjects/addFeedback/addFeedback.view.html',
                controller: 'addFeedbackController',
                size: 'md',
                keyboard: true
            });

        addFeedbackModal.project = project;
        return addFeedbackModal;

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

    var _getProjects = function () {

        //Check if current user is a mentor
        var userID = ($localStorage.currentUser.groups[0].id == 7) ? $localStorage.currentUser._id : -1;


        projectService.getProjects(userID).then(function (success) {
            usSpinnerService.spin('spinner');
            if(success.data.data == 0 || success.data.data == null){
                $scope.noProjects = true;
            }
            else {
                $scope.noProjects = false;
                $scope.gridOptions.data = success.data.data;
                // if (success.data.data == 'no_active_cycle') {
                //     $scope.registeredUser = true;
                //     $scope.currentErrorMessage = $translate.instant('noActiveCycle');
                //
                // } else if (success.data.data == null) {
                //     $scope.registeredUser = true;
                //     $scope.currentErrorMessage = $translate.instant('noProjects');
                // }
                // else {
                //      $scope.gridOptions.data = success.data.data;
                // }
            }
                

            usSpinnerService.stop('spinner');
        }, function (err) {
            $log.error(err);
            usSpinnerService.stop('spinner');
        })
    }

    var _getGroupsLookup = function () {

        if (!$localStorage.groups) {
            usSpinnerService.spin('spinner');
            sharedDataService.getGroupsLookUp().then(function (response) {
                $scope.groupsArray = response.data.groupsArray;
                $localStorage.groups = response.data.groupsArray;
                usSpinnerService.stop('spinner');
            }, function (error) {
                $log.error(JSON.stringify(error));
                usSpinnerService.stop('spinner');
            })
        } else
            $scope.groupsArray = $localStorage.groups;
    }

    var _getProjectStatusLookup = function () {
        if (!$localStorage.projectStatus) {
            usSpinnerService.spin('spinner');
            sharedDataService.getProjectStatusLookup().then(function (response) {
                $scope.projectStatusArray = response.data.data;
                $localStorage.projectStatus = response.data.data;
                console.log(response.data.data);
                usSpinnerService.stop('spinner');
            }, function (error) {
                $log.error(JSON.stringify(error));
                usSpinnerService.stop('spinner');
            })
        } else
            $scope.projectStatusArray = $localStorage.projectStatus;
    }

    var _checkPermissions = function () {
        switch ($scope.currentUser.groups[0].id) {
            case 1:
            case 4: { //admin and supervisor
                $scope.registeredUser = false;
                $scope.showFeedback = true;
                $scope.showScore = true;
                $scope.showAssignMentor = true;
                $scope.showAcceptReject = true;
                $scope.showSelect = true;
                break;
            }
            case 7: { //mentor
                $scope.registeredUser = false;
                $scope.showFeedback = true;
                $scope.showScore = true;
                $scope.showAssignMentor = false;
                $scope.showAcceptReject = false;
                $scope.showSelect = false;
                break;
            }
            case 2:
            case 3:
            case 5:
            case 8: { //registeredUser
                $scope.registeredUser = true;
                $scope.currentErrorMessage = $translate.instant('notAuthorized');
                $scope.showFeedback = false;
                $scope.showScore = false;
                $scope.showAssignMentor = false;
                $scope.showAcceptReject = false;
                $scope.showSelect = false;
                break;
            }
            default: {
                $scope.registeredUser = false;
                $scope.showFeedback = false;
                $scope.showScore = false;
                $scope.showAssignMentor = false;
                $scope.showAcceptReject = false;
                $scope.showSelect = false;
            }
        }

    }

    var _checkCurrentActiveCycle = function () {
        projectService.getCurrentActiveCycle().then(function (success) {
            $log.info(success);
            if (success.data.data[0].currentPhase === 'Revision')
                $scope.isReviewed = true;

        }, function (err) {
            $log.error(err);
        })

    }

});