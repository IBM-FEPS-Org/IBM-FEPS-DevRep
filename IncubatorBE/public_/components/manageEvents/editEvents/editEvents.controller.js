fepsApp.controller('EditEventsController', function ($compile,$scope,$translate,$localStorage,$routeParams,$location,manageEventsService,sharedDataService,usSpinnerService) {

	/*
	 view mode flag
	 1 == add
	 2 == edit
	 3 == view only
	 */
	//$scope.eventTime = new Date();
	
	$scope.init = function () {

		

		$scope.hasImage = false;
		$scope.eventImageUploaded = false;
		$scope.eventSpeakerPicUploaded = false;

		$scope.eventImageSelected = true;
		$scope.profileImageSelected = true;

		var eventID = -1;

		var param = $location.search();
		if (param.eventId) {

			usSpinnerService.spin('spinner');

			eventID = $routeParams.eventId;
		
			manageEventsService.getEventbyID(eventID)
				.then(function (result){

					$scope.newEvent = result.data.data;

					$scope.eventSpeakerPicUploaded= true;
					$scope.eventImageUploaded = true;

					$scope.eventImageSource = "/attachements?id=" + $scope.newEvent.eventPhotoAttach.id
						+ "&key=" + $scope.newEvent.eventPhotoAttach.key;

					$scope.eventSpeakerPicSource = "/attachements?id=" + $scope.newEvent.speakers[0].profilePic.id
						+ "&key=" + $scope.newEvent.speakers[0].profilePic.key;

					$scope.eventPhoto = $scope.newEvent.eventPhotoAttach.key;

					$scope.profilePic = $scope.newEvent.speakers[0].profilePic.key;
					
					$scope.newEvent.eventDate = new Date($scope.newEvent.eventDate);
					
//					console.log(eventTimeDate);
//					console.log(eventTimeDate.getHours());
//					console.log(eventTimeDate.getMinutes());
//					
//					$scope.eventTime.setHours(eventTimeDate.getHours());
//					$scope.eventTime.setMinutes(eventTimeDate.getMinutes());
//					
//					console.log($scope.eventTime);
					
					
					var now = new Date();
					if($scope.newEvent.eventDate > now.getTime()){
						$scope.viewMode = 2;
					}else{
						$scope.viewMode = 3;
					}
					
					usSpinnerService.stop('spinner');

					

				},function (error) {
					if(error.statusText != "ok"){
						console.log("get event by id failed");
					}
				});

		}
		else{
			$scope.viewMode = 1;

			$scope.newEvent={
				topic:"",
				details:"",
				eventDate:"",
				eventPhotoAttach:"",
				speakers: [
					{name : "", bio : "", profilePic:""}
				],
				venue : "",
				type:"event"

			}
		}

    }

	$scope.addEventEntry = function () {


		angular.forEach($scope.addEvent.$error.required, function (field) {
			field.$setDirty();
		});

		if($scope.addEvent.$valid){


			if($scope.viewMode == 1)
			{
				
				
				$scope.newEvent.eventDate = $scope.newEvent.eventDate.getTime();
				
				manageEventsService.addEvent($scope.newEvent).then(function (result){

					$location.path('fepsIncubator/manageEvents');


				},function (error) {
					if(error.statusText != "ok"){
						console.log("adding new  event failed");
					}
				});
			}
			else if($scope.viewMode == 2){

				$scope.newEvent.eventDate = $scope.newEvent.eventDate.getTime();
				
				manageEventsService.updateEvent($scope.newEvent).then(function (result){


					$location.path('fepsIncubator/manageEvents');


				},function (error) {
					if(error.statusText != "ok"){
						console.log("updating event failed");
					}
				});


			}

		}


	}



	$scope.uploadEventImage = function () {

		usSpinnerService.spin('EventImageSpinner');

		sharedDataService.addFile($scope.eventPhoto).then(
			function (result) {
				usSpinnerService.stop('EventImageSpinner');

				$scope.newEvent.eventPhotoAttach = {
					key: result.data.attachements[0].key,
					id:  result.data._id,
					rev: result.data._rev
				};
				$scope.eventImageSource = "/attachements?id=" + $scope.newEvent.eventPhotoAttach.id
					+ "&key=" + $scope.newEvent.eventPhotoAttach.key;
				$scope.eventImageUploaded = true;
				$scope.eventImageSelected = true;

			}, function (error) {
				usSpinnerService.stop('spinner');
				if (error.statusText != "ok") {
					$log.error("uploading file failed");
				}

			});

	}



	$scope.uploadSpeakerProfilePic =   function () {

		usSpinnerService.spin('EventSpeakerProfilePicSpinner');

		sharedDataService.addFile($scope.profilePic).then(
			function (result) {
				usSpinnerService.stop('EventSpeakerProfilePicSpinner');

				$scope.newEvent.speakers[0].profilePic = {
					key: result.data.attachements[0].key,
					id:  result.data._id,
					rev: result.data._rev
				};
				$scope.eventSpeakerPicSource = "/attachements?id=" + $scope.newEvent.speakers[0].profilePic.id
					+ "&key=" + $scope.newEvent.speakers[0].profilePic.key;
				$scope.eventSpeakerPicUploaded = true;
				$scope.profileImageSelected = true;


			}, function (error) {
				usSpinnerService.stop('spinner');
				if (error.statusText != "ok") {
					$log.error("uploading file failed");
				}

			});


	}

	$scope.cancelEditProfilePic = function(){
		$scope.eventSpeakerPicUploaded = true;
		$scope.profileImageSelected = true;

	}


	$scope.doCancel = function(){
		$location.path( 'fepsIncubator/manageEvents').search({});
	}


	$scope.cancelEditImage = function(){
		$scope.eventImageUploaded = true;
		$scope.eventImageSelected = true;

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