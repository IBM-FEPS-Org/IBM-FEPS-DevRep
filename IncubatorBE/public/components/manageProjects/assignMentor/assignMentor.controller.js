fepsApp.controller('assignMentorController', function ($scope, $translate, $uibModalInstance, loginService, sharedDataService, $log, userProfileService, $rootScope, usSpinnerService, $timeout) {

    $scope.searchInput = "";

    $scope.searchresult = null;

    $scope.noUsersFound = false;

    $scope.searchUsers = function () {

        angular.forEach($scope.assignMentorForm.$error.required, function (field) {
            field.$setDirty();
        });

        if ($scope.assignMentorForm.$valid) {
            loginService.getUserByUsername($scope.searchInput)
                .then(function (result) {
                    if (result.data.data && $scope.checkifMentor(result.data.data.groups)) {
                        $scope.searchresult = result.data.data;
                        $scope.searchresult.role = "member";
                        $scope.noUsersFound = false;
                    } else {
                        $scope.noUsersFound = true;
                    }

                }, function (response) {
                    if (response.statusText == "") {
                        $scope.errorMessage = "systemDown";
                        console.log("get users by username failed");
                    }
                });
        }
    }

    $scope.checkifMentor = function (groups) {
        var isMentor = false;
        for (var i = 0; i < groups.length; i++) {
            if (groups[i].id == 7) {
                isMentor = true;
                break;
            }
        }
        return isMentor;
    }

    $scope.AssignMentortoProjects = function () {

        //check if current mentor is already the assigned mentor
        if(angular.isArray($uibModalInstance.selectedProjects[0].mentors)){
            var projectMentor = $uibModalInstance.selectedProjects[0].mentors[0]._id;
            var selectedMentor = $scope.searchresult._id;
            if (projectMentor === selectedMentor) {
                $scope.sameMentorError = true;
                return;
            }
        }


        usSpinnerService.spin('spinner');
        var projects = [];
        angular.forEach($uibModalInstance.selectedProjects, function (item) {
            projects.push({"_id": item._id, "_rev": item._rev});
        });

        var mentorProjectsObject = {
            "_id": $scope.searchresult._id,
            "_rev": $scope.searchresult._rev,
            "username": $scope.searchresult.username,
            "projects": projects
        };


        userProfileService.assignMentor(mentorProjectsObject).then(function (success) {
            usSpinnerService.stop('spinner');
            if (success.data.code == 'Object_updated') {
                var msg = ($rootScope.currentLanguage == 'en') ? success.data.message.en : success.data.message.ar;
                $scope.successMessage = true;
                $scope.successCode = msg;

                $timeout(function () {
                    $uibModalInstance.close('close');
                    $rootScope.$broadcast('updateProjectList');
                }, 1000);
            } else {
                $scope.errorMessage = true;
                $scope.errorCode = ($rootScope.currentLanguage == 'en') ? success.data.en : success.data.ar;
                $log.error(success);
            }

        }, function (err) {
            usSpinnerService.stop('spinner');
            $scope.errorMessage = true;
            $scope.errorCode = err.data.code;
            $log.error(err);

        });


    }


    $scope.closeAssignMentorModal = function () {
        $uibModalInstance.close('close');
    }

});