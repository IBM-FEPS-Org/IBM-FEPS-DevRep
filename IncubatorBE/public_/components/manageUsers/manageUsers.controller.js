fepsApp.controller('ManageUsersController', function ($scope, $rootScope, $translate, $uibModal, userProfileService, $log, sharedDataService, $localStorage, $route, $location, usSpinnerService) {


    $scope.selected4 = true;

    $scope.rowA = "rowA";
    $scope.rowB = "rowB";

    $scope.gridActions = {};
    
    $scope.searchList = [
        /*{
            "id": 1,
            "name": "ID"
        },*/

        {
            "id": 2,
            "name": "First Name"
        },
        {
            "id": 3,
            "name": "Last Name"
        },
        {
            "id": 4,
            "name": "Username"
        },
        {
            "id": 5,
            "name": "Email"
        }
    ];

    $scope.init = function () {
        $scope.isAdmin = ($localStorage.currentUser.groups[0].id == 1) ? true : false;
        $scope.selectedSearch = 1;

        _getUsers();

        _getGroupsLookup();

        $scope.gridOptions = {
            data: [],
            urlSync: false
        };

    }


    $scope.reloadGrid = function () {

    }

    $scope.openAssignRole = function (item) {

        var modalInstance = $uibModal.open(
            {
                ariaDescribedBy: 'Role',
                templateUrl: 'components/manageUsers/assignRole/assignRole.view.html',
                controller: 'assignRoleController',
                size: 'md',
                keyboard: true
            });
        //modalInstance.modal="Role";
        modalInstance.user = item;
        return modalInstance;

    }

    $scope.updateSearchBy = function (selectedSearch) {
        $scope.selectedSearch = selectedSearch;
        var element = document.getElementById('firstName');
		element.value = "";
		
		if($scope.gridOptions.grid.firstName)$scope.gridOptions.grid.firstName = "";
		if($scope.gridOptions.grid.surname)$scope.gridOptions.grid.surname = "";
		if($scope.gridOptions.grid.username)$scope.gridOptions.grid.username = "";
		if($scope.gridOptions.grid.email)$scope.gridOptions.grid.email = "";
		
		$scope.gridOptions.grid.reloadGrid();
		
    }
    $scope.openProfile = function (user) {
        $location.path('fepsIncubator/viewProfile').search({'username':user.username});
    }

    $scope.activeInactiveUser = function (item) {


        if (item.active == true) {
            item.active = false;
        }
        else if (item.active == false) {
            item.active = true;
        }
        else if (item.active == null) {
            item.active = true;
        }

    }

    $rootScope.$on("updateUsersList", function (event) {
        _getUsers();
    });

    var _getUsers = function () {
        usSpinnerService.spin('spinner');
        userProfileService.getAllUsers().then(function (success) {
            $scope.gridOptions.data = success.data.data;
            usSpinnerService.stop('spinner');
        }, function (err) {
            $log.error(err);
            usSpinnerService.stop('spinner');
        })
    }

    var _getGroupsLookup = function () {

        if (!$localStorage.groups) {
            sharedDataService.getGroupsLookUp().then(function (response) {
                $scope.groupsArray = response.data.groupsArray
                $localStorage.groups = response.data.groupsArray
            }, function (error) {
                $log.error(JSON.stringify(error));
            })
        } else
            $scope.groupsArray = $localStorage.groups;
    }

});