fepsApp.controller('changePasswordController', function ($log, $scope, $location,$localStorage,$timeout, $routeParams,$uibModal, loginService) {

    $scope.forgetPasswordUser = {};
    $scope.errorMessage = false;
    $scope.successMessage = false;

    $scope.doChangePassword = function () {

        angular.forEach($scope.changePasswordForm.$error.required, function (field) {
            field.$setDirty();
        });


            if ($scope.changePasswordForm.$valid) {
                loginService.changePassword($scope.forgetPasswordUser.oldpassword,$scope.forgetPasswordUser.password, $scope.forgetPasswordUser.confirmPass)
                    .then(function (result) {
                        if (result.data.type == 'Error') {
                            $scope.errorMessage = true;
                            $scope.successMessage = false;
                            $scope.errorCode = result.data.message.code;


                        } else {
                            $scope.successMessage = true;
                            $scope.errorMessage = false;
                            $scope.successCode = result.data.message.code;
                            var modalInstance = $uibModal.open(
                            {
                                ariaDescribedBy: 'changePassword',
                                template: '<p class="alert alert-success SuccessMsgPopup text-center">{{ "resetـpassword_success" | translate}}</p>',
                                controller: function ($uibModalInstance) {
                                    $timeout(function () {
                                        $location.path('fepsIncubator/home');
                                        $uibModalInstance.close('close');
                                    }, 3000);
                                },
                                size: 'md',
                                keyboard: true
                            });

                        }

                    }, function (error) {

                        $scope.successMessage = false;
                        $scope.errorMessage = true;
                        $scope.successCode = error;
                        $scope.errorCode = error.data.message.code;
                    });
            }
    }

    $scope.cancelchangePassword = function () {
        $location.path('fepsIncubator/home');
    }

});