fepsApp.controller('ForgetPasswordController', function ($log, $scope,$rootScope, $location, $routeParams, loginService) {

    $scope.forgetPasswordUser = {};
    $scope.errorMessage = false;
    $scope.successMessage = false;
    $scope.changeSuccessMessage = false;
    $scope.isResetPassword = $routeParams.isResetPassword;

    $scope.doResetPassword = function () {

        angular.forEach($scope.forgetPassword.$error.required, function (field) {
            field.$setDirty();
        });

        //case request change password link

        if ($scope.forgetPassword.$valid && !$scope.isResetPassword) {
            loginService.forgetPassword($scope.forgetPasswordUser.email,$rootScope.currentLanguage)
                .then(function (result) {
                    if (result.data.type == 'Error') {
                        $scope.errorMessage = true;
                        $scope.successMessage = false;
                        $scope.errorCode = result.data.code;
                    } else {
                        $scope.successMessage = true;
                        $scope.errorMessage = false;
                        $scope.successCode = result.data.code;
                    }

                }, function (error) {

                    $scope.successMessage = false;
                    $scope.errorMessage = true;
                    $scope.successCode = error;

                });
        }
        //case reset user password
        else if ($scope.forgetPassword.$valid && $scope.isResetPassword) {

            //now reset user password
            loginService.resetPassword($scope.forgetPasswordUser.password, $scope.forgetPasswordUser.confirmPass, $routeParams.token)
                .then(function (result) {
                    if (result.data.type == 'Error') {
                        $scope.errorMessage = true;
                        $scope.successMessage = false;
                        $scope.errorCode = result.data.code;
                    } else {
                    		$scope.changeSuccessMessage = true;
                        $scope.errorMessage = false;
                        $scope.successCode = result.data.message.en;
                    }

                }, function (error) {

                    $scope.successMessage = false;
                    $scope.errorMessage = true;
                    $scope.successCode = error;

                });
        }
    }

    $scope.cancelResetPassword = function () {
        $location.path('fepsIncubator/home');
    }

});