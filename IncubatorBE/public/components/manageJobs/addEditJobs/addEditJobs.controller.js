fepsApp.controller('addEditJobsController', function ($scope,$translate,$localStorage,manageJobsService,manageEventsService,usSpinnerService,$location,sharedDataService) {


	/*
	 view mode flag
	 1 == add
	 2 == edit
	 3 == view only
	 */

	$scope.init = function () {

		var jobID = -1;
		var param = $location.search();
		if (param.jobId) {
			usSpinnerService.spin('spinner');
			jobID = param.jobId;
			manageEventsService.getEventbyID(jobID)
				.then(function (result){
					$scope.newJob = result.data.data;
					$scope.newJob.createDate = new Date($scope.newJob.createDate);
					$scope.viewMode = 2;
					usSpinnerService.stop('spinner');
				},function (error) {
					usSpinnerService.stop('spinner');
					if(error.statusText != "ok"){
						console.log("get job by id failed");
					}
				});
		}
		else{
			$scope.viewMode = 1;

			$scope.newJob={

				jobTitle : "",
				projectName : "",
				skills : [],
				jobOwnerMail : "",
				active : false,
				isLinked : false,
				createDate : new Date()
			}
		}

	}

	$scope.addJobEntry = function () {


		angular.forEach($scope.addJob.$error.required, function (field) {
			field.$setDirty();
		});

		if($scope.addJob.$valid){


			if($scope.viewMode == 1)
			{
				manageJobsService.addJob($scope.newJob).then(function (result){
					$location.path('fepsIncubator/manageJobs');
				},function (error) {
					if(error.statusText != "ok"){
						console.log("adding new  event failed");
					}
				});
			}
			else if($scope.viewMode == 2){

				$scope.newJob.createDate = $scope.newJob.createDate.getTime();
				manageJobsService.updateJob($scope.newJob).then(function (result){
					$location.path('fepsIncubator/manageJobs');
				},function (error) {
					if(error.statusText != "ok"){
						console.log("updating Job failed");
					}
				});
			}
		}
	}

	$scope.noProjectFound=false;

	$scope.jobOwnerMailDisable=true;

	$scope.jobProjectSearch = function() {

			console.log( addJob.projectName.length );


			manageJobsService.getProjectByName($scope.newJob.projectName).then(function (result){

					if(result.data.data){
						if(result.data.data[0].startupName == $scope.newJob.projectName){

							$scope.newJob.jobOwnerMail=result.data.data[0].members[0].email;
							$scope.noProjectFound=false;
							$scope.jobOwnerMailDisable=false;

						}
					}
                    else{
						$scope.noProjectFound=true;
						$scope.jobOwnerMailDisable=true;
					}
			},function (error) {
				if(error.statusText != "ok"){

				}
			});

	}

	$scope.doCancel = function(){
		$location.path( 'fepsIncubator/manageJobs').search({});
	}


	$scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
	$scope.format = $scope.formats[0];
	$scope.altInputFormats = ['M!/d!/yyyy'];


	$scope.openDatePicker = function() {
		$scope.DatePickerPopup.opened = true;

	};

	$scope.DatePickerPopup = {
		opened: false
	};
	$scope.dateOptions = {
		minDate: new Date(),
		showWeeks: false
	};



});