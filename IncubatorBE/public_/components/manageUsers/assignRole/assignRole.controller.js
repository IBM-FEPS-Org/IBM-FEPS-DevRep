fepsApp.controller('assignRoleController', function ($scope, $rootScope, $translate, $uibModalInstance, $localStorage, sharedDataService, $log, userProfileService, $timeout, usSpinnerService) {

    var _getGroupsLookup = function () {

        if (!$localStorage.groups) {
            sharedDataService.getGroupsLookUp().then(function (response) {
                
                $localStorage.groups = response.data.groupsArray;
                $scope.groupsArray = angular.copy($localStorage.groups);
            }, function (error) {
                $log.error(JSON.stringify(error));
            })
        } else{
        	$scope.groupsArray = angular.copy($localStorage.groups);
        }
             
        var superAdminIndex = -1;
        	for(var i=0;i<$scope.groupsArray.length;i++){
        		if($scope.groupsArray[i].id==1 || $scope.groupsArray[i].id==6 || $scope.groupsArray[i].id==9){
        			superAdminIndex = i;
                    $scope.groupsArray.splice(superAdminIndex,1);
        			
        		}
        	}

        superAdminIndex = -1;
    }
    
    
	
    $scope.newUser = {};
    $scope.groupsArray = [];


    $scope.errorMessage = false;
    $scope.successMessage = false;
    _getGroupsLookup();
    $scope.user = $uibModalInstance.user;
    /*$scope.newUser.linkedIn = $scope.user.linkedIn;
    $scope.newUser.areaOfExpertises = $scope.user.areaOfExpertises;
    $scope.newUser.biography = $scope.user.biography;*/
    $scope.selectedGroup = -1;
    $scope.userOldGroup = $scope.user.groups[0].id;

    $scope.profileImageFile = null;
    $scope.profileImageAttachment = {};
    $scope.profileImageUploaded = false;
    $scope.noProfileImageSelected = true;
    $scope.viewMode = 1;

    $log.info(">>>>>>" + JSON.stringify($scope.user));
    if ($scope.user.profilePic) {
        $scope.profileImageUploaded = true;
        $scope.profileImageFile = $scope.user.profilePic;
        $scope.imageSource = "/attachements?id=" + $scope.user.profilePic.id
            + "&key=" + $scope.user.profilePic.key;
    }
    else {
        $scope.profileImageUploaded = true;
        $scope.imageSource = "../../img/portraitHolder.png";
    }


    if ($scope.user.groups[0].id == 2 || $scope.user.groups[0].id == 6 || $scope.user.groups[0].id == 8) {
        $scope.isMentor = false;
    }
    else {
        $scope.isMentor = true;
    }
    $scope.roleDropDown = "";


    $scope.showMentor = function () {
        console.log($scope.roleDropDown);
        //superadmin mentor supervisor
        if ($scope.selectedGroup == 2 || $scope.selectedGroup == 6 || $scope.selectedGroup == 8) {
            $scope.isMentor = false;
        }
        else {
            $scope.isMentor = true;
        }
    }


    $scope.cancelRoleAssign = function () {
        $uibModalInstance.close();
    }

    $scope.changeRole = function () {

        if ($scope.selectedGroup === $scope.user.groups[0].id) {
            //error user doesn't change the role
            $scope.errorMessage = true;
            $scope.errorCode = $translate.instant('noRoleChanged');
            return;
        } else {
            //is mentor
            if ($scope.isMentor) {
                if ($scope.user.linkedIn && $scope.user.areaOfExpertises && $scope.user.biography && $scope.profileImageFile && (typeof $scope.profileImageAttachment.id != 'undefined'))
                    _changeUserRole();
                else {
                    angular.forEach($scope.assignRole.$error.required, function (field) {
                        field.$setDirty();
                    });
//                    if ($scope.assignRole.$valid)
//                        _changeUserRole();
                }


            } else // not mentor
                _changeUserRole();

        }


    }

    $scope.uploadProfileImage = function () {

        usSpinnerService.spin('spinner');
        sharedDataService.addFile($scope.profileImageFile).then(
            function (result) {
                usSpinnerService.stop('spinner');
                $scope.profileImageUploaded = true;
                $scope.profileImageAttachment = {
                    key: result.data.attachements[0].key,
                    id: result.data._id,
                    rev: result.data._rev
                };
                $scope.imageSource = "/attachements?id=" + $scope.profileImageAttachment.id
                    + "&key=" + $scope.profileImageAttachment.key;


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

    var _changeUserRole = function () {

        var userObj = {};
        userObj._id = $scope.user._id;

        //add uploaded file object
        if ($scope.profileImageAttachment.id)
            userObj.profilePic = $scope.profileImageAttachment;

        var selected_group_name = _getItemNametById($scope.groupsArray, $scope.selectedGroup);
        userObj.groups = [{'id': $scope.selectedGroup, 'name': selected_group_name}];

        //Registered User or Founder or IT Admin, issu #208
        if(userObj.groups[0].id == 8 || userObj.groups[0].id == 6 || userObj.groups[0].id == 2  )
        {
            userObj.linkedIn ="";
            userObj.biography = "";
            userObj.areaOfExpertises = "";

        }else{
            userObj.linkedIn = $scope.user.linkedIn
            userObj.biography = $scope.user.biography;
            userObj.areaOfExpertises = $scope.user.areaOfExpertises;
        }


        usSpinnerService.spin('spinner');
        userProfileService.assignRole(userObj).then(function (success) {
            $log.info(success);
            $scope.successMessage = true;
            $scope.errorMessage = false;
            $scope.successCode = $translate.instant('userRoleUpdated');
            usSpinnerService.stop('spinner');
            $timeout(function () {
                $uibModalInstance.close('close');
                $rootScope.$broadcast('updateUsersList');
            }, 1000);

        }, function (err) {
            $scope.errorMessage = true;
            if (err.data.message)
                $scope.errorCode = err.data.message;
            else
                $scope.errorCode = err.data;

            $log.error(err);
            usSpinnerService.stop('spinner');
        });
    }


});