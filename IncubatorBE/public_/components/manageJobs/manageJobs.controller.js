fepsApp.controller('manageJobsController', function ($scope,$translate,$uibModal,$localStorage,manageJobsService,$location,$route,usSpinnerService,$window)
{


	$scope.selected6 = true;

	$scope.adminRole = $localStorage.currentUser.groups[0];

	$scope.rowA = "rowA";
	$scope.rowB = "rowB";

	$scope.deletedJobindex = -1;
	
	$scope.systemRoles = [
	    {"id": 1, "name" : "Super Admin"},
	    {"id": 2, "name" : "IT Admin"},
	    {"id": 3, "name" : "Supervisor Event"},
	    {"id": 4, "name" : "Supervisor Project"},
	    {"id": 5, "name" : "Supervisor clinic"},
	    {"id": 6, "name" : "Founder"},
	    {"id": 7, "name" : "Mentor"},
	    {"id": 8, "name" : "Registered user"}
	];


	$scope.init = function () {

		$scope.isAdmin = ($localStorage.currentUser.groups[0].id == 1 || $localStorage.currentUser.groups[0].id == 2) ? true : false;
		$scope.jobsGridOptions = {
			data: [],
			urlSync: false
		};
		$scope.getJobs();

	}


	$scope.getJobs = function(){
		usSpinnerService.spin('spinner');
		manageJobsService.getJobList().then(function (success) {

			if(success.data.data == 0 || success.data.data == null){
				$scope.noJobs = true;
			}
			else {
				$scope.noJobs = false;
				$scope.jobsGridOptions.data = success.data.data;
			}
			usSpinnerService.stop('spinner');
		}, function (err) {
			$log.error(err);
			usSpinnerService.stop('spinner');
		})
	}


	$scope.deleteJobbyIndex = function(index){
		$scope.deletedJobindex = index;
		var modalInstance = $uibModal.open(
			{
				ariaDescribedBy:'deleteJobModal',
				templateUrl:'components/shared/confirmation.view.html',
				controller : 'confirmationController',
				size: 'md',
				keyboard: true
			});
		modalInstance.modal="deleteJobModal";

	}

	$scope.$on("deleteJob", function() {
		if($scope.deletedJobindex != -1){
			manageJobsService.deleteJobbyID($scope.jobsGridOptions.data[$scope.deletedJobindex]._id)
				.then(function (result) {
					//$scope.jobsGridOptions.data.splice($scope.deletedJobindex,1);
					$scope.jobsGridOptions.data = result.data.data;
					$scope.getJobs();
					if($scope.jobsGridOptions.data.length == 0){
						$scope.noJobs = true;
					}else{
						$scope.noJobs = false;
					}
				},function (response) {
					if(response || response.statusText == ""){
						$scope.errorMessage = "systemDown";
						console.log("deleting Job failed");
					}
				});
		}
	});


	$scope.openJobDetails = function (jobId) {
		$location.path('fepsIncubator/addEditJobs').search({'jobId': jobId});
	}
	$scope.addJob = function () {
		$location.path('fepsIncubator/addEditJobs');
	}


		


});