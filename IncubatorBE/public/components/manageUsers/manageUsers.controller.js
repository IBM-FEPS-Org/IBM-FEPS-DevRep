fepsApp.controller('ManageUsersController', function ($scope, $rootScope, $translate, $uibModal ,manageUsersService ,userProfileService, $log, sharedDataService, $localStorage, $route,$timeout, $location, usSpinnerService) {


    $scope.selected4 = true;

    $scope.rowA = "rowA";
    $scope.rowB = "rowB";
    
    $scope.deletedUserName = null;
    
    $scope.gridActions = {};
    
    $scope.searchList = [
        /*{
            "id": 1,
            "name": "ID"
        },*/

        {
            "id": 2,
            "name": "Name"
        },
        {
            "id": 3,
            "name": "Username"
        },
        {
            "id": 4,
            "name": "Email"
        },
        {
            "id": 5,
            "name": "Join Date"
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
        var element = document.getElementById('Name');
		element.value = "";
		
		if($scope.gridOptions.grid.Name)$scope.gridOptions.grid.Name = "";
		if($scope.gridOptions.grid.username)$scope.gridOptions.grid.username = "";
		if($scope.gridOptions.grid.email)$scope.gridOptions.grid.email = "";
		if($scope.gridOptions.grid.joinDate)$scope.gridOptions.grid.joinDate = "";
		
		$scope.gridOptions.grid.reloadGrid();
		
    }
    $scope.openProfile = function (user) {
        $location.path('fepsIncubator/viewProfile').search({'username':user.username});
    }

    $scope.deleteUser = function(username)
    {
		$scope.deletedUserName = username;
		  var modalInstance = $uibModal.open(
					{
						ariaDescribedBy:'deleteUser',
						templateUrl:'components/shared/confirmation.view.html',
						controller : 'confirmationController',
						size: 'md',
						scope: $scope,
						keyboard: true
					});
		  modalInstance.modal="deleteUser";

    }
    

    $rootScope.$on("deleteUser", function (event) 
    	{
    		if($scope.deletedUserName != null)
		{
    			$scope.deletedUserIndex = -1;
    			var filteredObj = $scope.gridOptions.data.find(function(item, i)
    			{
    				  if(item.username === $scope.deletedUserName)
    				  {
    					$scope.deletedUserIndex = i;
    				    return i;
    				  }
    			});
    			
    			manageUsersService.deleteUser($scope.gridOptions.data[$scope.deletedUserIndex]).then((result)=>
			{
				usSpinnerService.spin('spinner');
	            $timeout(function () {
	                $rootScope.$broadcast('updateUsersList');
	            }, 3000);

				
			}
			,(err)=>
			{
	    			reject(err);
	    		});
		}
    		
        
    });
    
   
    
    
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
    

    var _getUsers = function ()
    {
        usSpinnerService.spin('spinner');
        userProfileService.getAllUsers().then(function (success) {
        		document.getElementById("totalNoOfUsers").innerHTML = "Total No. Of Users: " + success.data.data.length;
        		for (var i=0;i<success.data.data.length;i++)
    			{
        			var Name = success.data.data[i].firstName +" " +success.data.data[i].surname;
//        			console.log(Name);
        			success.data.data[i].Name = Name;
//        			console.log(success.data.data[i].Name);
    			}
            $scope.gridOptions.data = success.data.data;
            usSpinnerService.stop('spinner');
            
        }, function (err) {
            $log.error(err);
            usSpinnerService.stop('spinner');
        });
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