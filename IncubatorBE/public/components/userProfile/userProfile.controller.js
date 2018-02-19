fepsApp.controller('userProfileController', function ($scope, $window, $rootScope, $location, $localStorage, $log, sharedDataService, userProfileService, $timeout, $uibModal, $routeParams, usSpinnerService) {


    $scope.initView = function () {
        _initPublicParam();
    };

    var _showFields = function (){
    	if ($localStorage.currentUser.groups[0].id==7)
    		return true;
    	else if ($localStorage.currentUser.groups[0].id==3)
    		return true;
    	else if ($localStorage.currentUser.groups[0].id==4)
    		return true;
    	else if ($localStorage.currentUser.groups[0].id==5)
    		return true;
    	else if ($localStorage.currentUser.groups[0].id==1)
    		return true;
    	else
    		return false
    }
    
    $scope.showMore = _showFields();
 
    $scope.initUpdate = function () {
        _initPublicParam();

        //$scope.newUser = $scope.currentUser;

        $scope.profileImageFile = '';
        $scope.profileImageAttachment = {};
        $scope.profileImageUploaded = false;
        $scope.noProfileImageSelected = true;
        $scope.viewMode = 1;
        _checkMentor();

    };

    $scope.goToUpdateProfile = function () {
        $location.path('fepsIncubator/updateProfile');
    }
    $scope.cancelEditProfile = function () {
        $location.path('fepsIncubator/viewProfile');
    }


    $scope.goToChangePassword = function () {
        $location.path('fepsIncubator/changePassword');
    }

    $scope.updateProfile = function () {
        $log.info($scope.newUser);
        angular.forEach($scope.signUp.$error.required, function (field) {
            field.$setDirty();
        });
        
        var error = $scope.signUp.$error;
        angular.forEach(error, function(field)
        {
        	console.log(field);
        });
        
        if ($scope.signUp.$valid) {
            $scope.errorMessage = false;

            //add uploaded file object
            if ($scope.profileImageAttachment.id)
                $scope.currentUser.profilePic = $scope.profileImageAttachment;

            usSpinnerService.spin('spinner');
            userProfileService.updateProfile($scope.currentUser).then(function (success) {
            	$localStorage.currentUser.token = success.headers('authorization');
            	if(success.data.length > 0 &&success.data[0].type == "Error"){
            		$scope.errorMessage = success.data[0].message.en;
            		usSpinnerService.stop('spinner');
            	}
            	else
            	{
            	    $localStorage.currentUser._id = success.data.data.id;
                    $localStorage.currentUser._rev = success.data.data.rev;
                    
                    if ($scope.profileImageAttachment.id)
                        $localStorage.currentUser.profilePic = $scope.profileImageAttachment;
                    $scope.currentUser = $localStorage.currentUser;

                    var modalInstance = $uibModal.open(
                            {
                                scope: $scope,
                                ariaDescribedBy: 'signout',
                                template: '<p class="alert alert-success SuccessMsgPopup text-center">{{"profileUpdateSuccess" | translate}}</p>',
                                controller: function ($uibModalInstance) {
                                    $timeout(function () {
                                        $location.path('fepsIncubator/viewProfile');
                                        $uibModalInstance.close('close');
                                    }, 3000);
                                },
                                size: 'md',
                                keyboard: true,
                            });

                    
                    sharedDataService.broadcastEvent("checkCurrentUser", []);
                    usSpinnerService.stop('spinner');
            	}
            }, function (error) {
                $log.error(JSON.stringify(error));
                if (error.data.message)
                    $scope.errorMessage = error.data.message;
                else
                    $scope.errorMessage = error.data;
                usSpinnerService.stop('spinner');
            });

        }
        else {
            $window.scrollTo(0, 0);
        }


    }

    $scope.cancelEditImage = function(){
    	$scope.profileImageUploaded = true
    	$scope.signUp.profileImageFile.$setPristine();
    }
    $scope.uploadProfileImage = function () {

        usSpinnerService.spin('spinner');
        sharedDataService.addFile($scope.profileImageFile).then
        (
            function (result) 
            {
            	console.log("stopping");
                usSpinnerService.stop('spinner');
                $scope.profileImageUploaded = true;
                $scope.profileImageAttachment = 
                {
                    key: result.data.attachements[0].key,
                    id: result.data._id,
                    rev: result.data._rev
                };
                $scope.imageSource = "/attachements?id=" + $scope.profileImageAttachment.id
                    + "&key=" + $scope.profileImageAttachment.key;

                $localStorage.currentUser.profilePic = $scope.profileImageAttachment;

            }, function (error) {
                usSpinnerService.stop('spinner');
                if (error.statusText != "ok") {
                    $log.error("uploading file failed");
                }

            });
    }

    var _getItemNametById = function (array, id) {
        return array.filter(function (item) {
            return (item.id === id);
        })[0].name;
    }

    var _initPublicParam = function () {
        $scope.sectorArray;
        $scope.userSectorName;
        $scope.errorMessage = false;
        $scope.successMessage = false;

        $scope.hasImage = false;

        var param = $location.search();
        
        if (param.username) {
            $scope.editEnabled = false;
            userProfileService.getUserByUsername($routeParams.username).then(function (success) {
            	
                $scope.currentUser = success.data.data;
                $scope.currentUser.birthdate = ($scope.currentUser.birthdate) ? new Date($scope.currentUser.birthdate) : "";
                $scope.currentUser.graduationYear = ($scope.currentUser.graduationYear) ? new Date($scope.currentUser.graduationYear) : "";
                $scope.dateOptions.initDate = $scope.currentUser.birthdate;
                $scope.dateOptions2.initDate = $scope.currentUser.graduationYear;
                if ($scope.currentUser.profilePic) {
                    $scope.profileImageUploaded = true;
                    $scope.imageSource = "/attachements?id=" + $scope.currentUser.profilePic.id
                        + "&key=" + $scope.currentUser.profilePic.key;
                }
                else {
                    $scope.profileImageUploaded = true;
                    $scope.imageSource = "../../img/portraitHolder.png";
                }
            }, function (err) {
                $log.error(err)
            })

        } else {

            userProfileService.getUserByUsername($localStorage.currentUser.username).then(function (success) {
                $scope.currentUser = success.data.data;
                $localStorage.currentUser = success.data.data;
                $localStorage.currentUser.token = success.headers('authorization');
                $scope.currentUser.birthdate = ($scope.currentUser.birthdate) ? new Date($scope.currentUser.birthdate) : "";
                $scope.currentUser.graduationYear = ($scope.currentUser.graduationYear) ? new Date($scope.currentUser.graduationYear) : "";
                $scope.dateOptions.initDate = $scope.currentUser.birthdate;
                $scope.dateOptions2.initDate = $scope.currentUser.graduationYear;
                $scope.editEnabled = true;
                if ($scope.currentUser.profilePic) {
                    $scope.profileImageUploaded = true;
                    $scope.imageSource = "/attachements?id=" + $scope.currentUser.profilePic.id
                        + "&key=" + $scope.currentUser.profilePic.key;
                }
                else {
                    $scope.profileImageUploaded = true;
                    $scope.imageSource = "../../img/portraitHolder.png";
                }
            }, function (err) {
                $log.error(err)
            })


        }


        $scope.openDatePicker = function () {
            $scope.DatePickerPopup.opened = true;
        };
        $scope.openDatePicker2 = function () {
            $scope.DatePickerPopup2.opened = true;
        };

        $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
        $scope.format = $scope.formats[0];
        $scope.altInputFormats = ['M!/d!/yyyy'];

        $scope.dateOptions = {
            maxDate: moment(),
        }
        $scope.dateOptions2 = {
            //maxDate: moment(),
        }

        $scope.DatePickerPopup = {
            opened: false
        };
        $scope.DatePickerPopup2 = {
            opened: false
        };

        _getSectores();


    }


    var _getSectores = function () {

        if (!$localStorage.sectors) {
            sharedDataService.getSectorsLookUp().then(function (response) {
                $scope.sectorArray = response.data.data;
                $localStorage.sectors = response.data.data
                $scope.userSectorName = ($scope.currentUser.sector) ? _getItemNametById($scope.sectorArray, $scope.currentUser.sector) : null;
            }, function (error) {
                $log.error(JSON.stringify(error));
            })
        } else {
            $scope.sectorArray = $localStorage.sectors;
            if ($scope.currentUser)
                $scope.userSectorName = ($scope.currentUser.sector) ? _getItemNametById($scope.sectorArray, $scope.currentUser.sector) : null;
        }

    }

    var _checkMentor = function () {
        if ($localStorage.currentUser.groups[0]) {
            var group = $localStorage.currentUser.groups[0].id;
            //superadmin mentor supervisor
            if (group == 2 || group == 6 || group == 8 || group == 9)
                $scope.isMentor = false;

            else
                $scope.isMentor = true;
        }

    }

});