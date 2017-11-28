fepsApp.controller('signupController', function ($scope, $rootScope, $location, $localStorage, $window, sharedDataService, loginService, $timeout, $uibModal, $log, usSpinnerService,$routeParams) {

    $scope.newUser = {};
    $scope.errorMessage = '';

    $scope.profileImageFile = '';
    $scope.profileImageAttachment = {};
    $scope.profileImageUploaded = false;
    $scope.noProfileImageSelected = true;
    $scope.viewMode = 1;


    $scope.init = function () {
        if (!$localStorage.sectors) {
            sharedDataService.getSectorsLookUp().then(function (response) {
                $scope.sectorArray = response.data.data;
                $localStorage.sectors = response.data.data
            }, function (error) {
                $log.error(JSON.stringify(error));
            })
        } else
            $scope.sectorArray = $localStorage.sectors;
    }
    $scope.doSignUp = function () {
        angular.forEach($scope.signUp.$error.required, function (field) {
            field.$setDirty();
        });
        if ($scope.signUp.$valid) {

            //initialize new user role
            $scope.newUser.groups = [];
            $scope.newUser.groups.push({
                "id": 8,
                "name": "Registered user"
            });

            //add uploaded file object
            if ($scope.profileImageAttachment.id)
                $scope.newUser.profilePic = $scope.profileImageAttachment;
            		$scope.newUser.joinDate = new Date(moment());
            loginService.signUp($scope.newUser)
                .then(function (result) {
                    console.log(result.data.code);
                    if (result.data.code == 'username already exist') {
                        $scope.errorMessage = "user_already_exists";
                    }
                    else if (result.data.code == 'user_is_created') {
                        $scope.errorMessage = '';
                        $localStorage.currentUser = $scope.newUser;
                        $localStorage.currentUser._id = result.data.data.id;
                        $localStorage.currentUser.token = result.data.token;
                        console.log("current user name" + $localStorage.currentUser);
                        sharedDataService.broadcastEvent("checkCurrentUser", []);
                        var modalInstance = $uibModal.open(
                            {
                                ariaDescribedBy: 'signout',
                                template: '<p class="alert alert-success SuccessMsgPopup text-center">{{"SuccessMsg" | translate}}</p>',
                                controller: function ($uibModalInstance) {
                                    $timeout(function () {
                                        var eventId = $routeParams.eventId;
                                        var jobId = $routeParams.jobId;
                                        if(eventId){
                                            $location.path('fepsIncubator/eventsDetails').search({'eventId': eventId});
                                        }else if(jobId){
                                            $location.path('fepsIncubator/jobs');
                                        }else{
                                            $location.path('fepsIncubator/briefCaseLanding');
                                        }
                                        $uibModalInstance.close('close');
                                    }, 3000);
                                },
                                size: 'md',
                                keyboard: true
                            });

                    } else
                        $scope.errorMessage = result.data.code;


                }, function (response) {

                    //response.data[0].code
                    if (response.data[0].code == "validation_error") {
                        $scope.errorMessage = ($rootScope.currentLanguage == 'en') ? response.data[0].message.en : response.data[0].message.ar
                    }

                    else if (response.statusText == "") {
                        $scope.errorMessage = "systemDown";
                        console.log("signUp failed");
                    }
                    else
                        $scope.errorMessage = response.data.code;

                });


        } else {
            $window.scrollTo(0, 0);
            $scope.errorMessage = "check your inputs";
        }
    }

    $scope.cancelSignUp = function () {
        $location.path('fepsIncubator/home');
    }


    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];
    //$scope.format2 = $scope.formats[4];
    $scope.altInputFormats = ['M!/d!/yyyy'];
    //$scope.altInputFormats2 = ['yyyy'];

    $scope.openDatePicker = function () {
        $scope.DatePickerPopup.opened = true;
    };
    $scope.openDatePicker2 = function () {
        $scope.DatePickerPopup2.opened = true;
    };

    $scope.dateOptions = {
        maxDate: moment()
    }
    $scope.dateOptions2 = {
        //maxDate: moment()
    }

    $scope.DatePickerPopup = {
        opened: false
    };
    $scope.DatePickerPopup2 = {
        opened: false
    };

    $scope.uploadProfileImage = function () {

        usSpinnerService.spin('spinner');
        sharedDataService.addFile($scope.profileImageFile).then(
            function (result) {
                $scope.profileImageUploaded = true;
                $scope.profileImageAttachment = {
                    key: result.data.attachements[0].key,
                    id: result.data._id,
                    rev: result.data._rev
                };
                $scope.imageSource = "/attachements?id=" + $scope.profileImageAttachment.id
                    + "&key=" + $scope.profileImageAttachment.key;
                usSpinnerService.stop('spinner');
            }, function (error) {
                if (error.statusText != "ok") {
                    $log.error("uploading file failed");
                }
                usSpinnerService.stop('spinner');
            });
    }

});