fepsApp.controller('jobDetailsController', function ($uibModal,$scope,$translate,$routeParams,$location,$localStorage,usSpinnerService,manageEventsService,$route,sharedDataService) {

	var jobID = -1;

	var param = $location.search();


	$scope.init = function () {

		if (param.jobId) {

			usSpinnerService.spin('spinner');



			manageEventsService.getEventbyID(param.jobId)
				.then(function (result) {
					$scope.job = result.data.data;
					usSpinnerService.stop('spinner');

				}, function (error) {
					if (error.statusText != "ok") {
						console.log("get event by id failed");
					}
				});

		}
		else {

		}
	}

	$scope.goToListingPage = function () {

		$location.path('fepsIncubator/jobs');

	}

	
});