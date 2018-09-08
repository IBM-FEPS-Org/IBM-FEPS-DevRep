fepsApp.controller('EditEventsController', function ($compile,$scope,$translate,$uibModal,$localStorage,$routeParams,$location,manageEventsService,sharedDataService,usSpinnerService) {

	/*
	 view mode flag
	 1 == add
	 2 == edit
	 3 == view only
	 */
	//$scope.eventTime = new Date();
	$scope.speakers = [];
	$scope.deletedSpeakerIndex = -1;
	$scope.editedSpeakerIndex = -1;

	$scope.agendaFile = '';
	$scope.agendaAttachment = {};
	$scope.agendaUploaded = false;
	$scope.noAgendaSelected = true;
	$scope.agendaFileNameNotValid = false;
	
	$scope.emailRecipients = ["students","graduates","both"];
	
	$scope.init = function () 
	{

		

		$scope.hasImage = false;
		$scope.eventImageUploaded = false;
		$scope.eventSpeakerPicUploaded = false;
		$scope.editedSpeakerIndex = -1;
		$scope.eventImageSelected = true;
		$scope.minDate = new Date();
		$scope.agendaFile = '';
		$scope.agendaAttachment = {};
		$scope.agendaUploaded = false;
		$scope.noAgendaSelected = true;
		$scope.agendaFileNameNotValid = false;

		$scope.speakers = [];
		
		var eventID = -1;

		var param = $location.search();
		if (param.eventId) 
		{

			usSpinnerService.spin('spinner');

			eventID = $routeParams.eventId;
		
			manageEventsService.getEventbyID(eventID)
				.then(function (result){

					$scope.newEvent = result.data.data;
					$scope.eventImageUploaded = true;

					$scope.eventImageSource = "/attachements?id=" + $scope.newEvent.eventPhotoAttach.id
						+ "&key=" + $scope.newEvent.eventPhotoAttach.key;


					$scope.eventPhoto = $scope.newEvent.eventPhotoAttach.key;
					$scope.newEvent.eventStartDate = new Date($scope.newEvent.eventStartDate);
					$scope.newEvent.eventEndDate = new Date($scope.newEvent.eventEndDate);
					$scope.newEvent.eventEnrollDeadline = new Date($scope.newEvent.eventEnrollDeadline);
					if($scope.newEvent.speakers)
					{

						$scope.speakers = angular.copy($scope.newEvent.speakers);
						
						for (var i = 0; i < $scope.newEvent.speakers.length; i++) 
						{
							if($scope.speakers[i].profilePic)
							{
								$scope.speakers[i].eventSpeakerPicSource = "/attachements?id=" + $scope.newEvent.speakers[i].profilePic.id
								+ "&key=" + $scope.newEvent.speakers[i].profilePic.key;
								$scope.speakers[i].eventSpeakerPicUploaded= true;
							}
							
						}
					}
					if($scope.newEvent.agendaAttachment && $scope.newEvent.agendaAttachment.id)
					{
            			$scope.agendaUploaded = true;
						$scope.agendaAttachment = 
						{
								key : $scope.newEvent.agendaAttachment.key,
								id: $scope.newEvent.agendaAttachment.id,
								rev:$scope.newEvent.agendaAttachment.rev
						};
						$scope.agendaFile = $scope.newEvent.agendaAttachment.key;
            		}
					
					
					var now = new Date();
					if($scope.newEvent.eventEndDate > now.getTime()){
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
				eventStartDate:"",
				eventEndDate:"",
				eventEnrollDeadline:"",
				eventPhotoAttach:"",
				venue : "",
				NoOfPlaces:"",
				certificate:"false",
				type:"event",
				emailRecipients:""
				
				

			}
		}

    }

	
    $scope.uploadAgendaFile = function()
    {
        var english = /^[A-Za-z0-9-\s_\.]*$/;
        if (english.test($scope.agendaFile.name))
        {
            $scope.agendaFileNameNotValid = false;
        }
        else
        {
            $scope.agendaFileNameNotValid = true;
        }
        if(!$scope.agendaFileNameNotValid)
        {
            sharedDataService.addFile($scope.agendaFile).then(
            		
                    function (result)
                    {
                    	console.log(result);
                            $scope.agendaUploaded = true;
                            $scope.agendaAttachment = 
                            {
                                    key : result.data.attachements[0].key,
                                    id:result.data._id,
                                    rev:result.data._rev
                            };
                    },function (error) {
                        if(error.statusText != "ok"){
                            console.log("Uploading agenda file failed");
                        }
            }); 
        }
	}
	$scope.addEventEntry = function () 
	{


		angular.forEach($scope.addEvent.$error.required, function (field) {
			field.$setDirty();
		});

		if($scope.addEvent.$valid){


			if($scope.viewMode == 1)
			{
				$scope.newEvent.eventStartDate = $scope.newEvent.eventStartDate.getTime();
				$scope.newEvent.eventEndDate = $scope.newEvent.eventEndDate.getTime();
				$scope.newEvent.eventEnrollDeadline = $scope.newEvent.eventEnrollDeadline.getTime();
				$scope.newEvent.speakers = $scope.speakers;
				$scope.newEvent.agendaAttachment = $scope.agendaAttachment;
				manageEventsService.addEvent($scope.newEvent).then(function (result){

					$location.path('fepsIncubator/manageEvents');


				},function (error) {
					if(error.statusText != "ok"){
						console.log("adding new  event failed");
					}
				});
			}
			else if($scope.viewMode == 2){

				$scope.newEvent.eventStartDate = $scope.newEvent.eventStartDate.getTime();
				$scope.newEvent.eventEndDate = $scope.newEvent.eventEndDate.getTime();
				$scope.newEvent.eventEnrollDeadline = $scope.newEvent.eventEnrollDeadline.getTime();
				$scope.newEvent.speakers = $scope.speakers;
				$scope.newEvent.agendaAttachment = $scope.agendaAttachment;
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
	
	

	$scope.openAddSpeaker = function () 
	{
        var modalInstance = $uibModal.open(
            {
                ariaDescribedBy:'addspeaker',
                templateUrl:'components/manageEvents/editEvents/addSpeaker/addSpeaker.view.html',
                controller : 'addSpeakerController',
                size: 'md',
                keyboard: true
            });
        modalInstance.eventSpeakers = $scope.newEvent.speakers;
        modalInstance.deletedSpeakers = $scope.deletedSpeakers;
        return modalInstance;

    }

	$scope.deleteSpeaker = function(index)
	{
		$scope.deletedSpeakerIndex = index;
		  var modalInstance = $uibModal.open(
					{
						ariaDescribedBy:'deleteSpeaker',
						templateUrl:'components/shared/confirmation.view.html',
						controller : 'confirmationController',
						size: 'md',
						keyboard: true
					});
		  modalInstance.modal="deleteSpeaker";

	 }
	
	$scope.$on("deleteSpeaker", function() {
		if($scope.deletedSpeakerIndex != -1)
		{
			$scope.speakers.splice($scope.deletedSpeakerIndex,1);
		}
	});
	
	
	
	$scope.editSpeaker = function (index) 
	{
		$scope.editedSpeakerIndex = index;
        var modalInstance = $uibModal.open(
            {
                ariaDescribedBy:'editSpeaker',
                templateUrl:'components/manageEvents/editEvents/editSpeaker/editSpeaker.view.html',
                controller : 'editSpeakerController',
                size: 'md',
                keyboard: true
            });
        modalInstance.speaker = $scope.speakers[index];
        return modalInstance;

    }
	
	$scope.$on('editSpeakerEvent', function(event, data)
    {
		if(data.editedSpeaker.profilePic != "")
		{
			data.editedSpeaker.eventSpeakerPicSource = "/attachements?id=" + data.editedSpeaker.profilePic.id
			+ "&key=" + data.editedSpeaker.profilePic.key;
			data.editedSpeaker.eventSpeakerPicUploaded = true;
		}
		else 
		{
			data.editedSpeaker.eventSpeakerPicUploaded = false;
		}
	
		$scope.speakers[$scope.editedSpeakerIndex] = data.editedSpeaker;
		
		
		
    });
	
	$scope.$on('addSpeakertoEvent', function(event, data)
    {
		if(!$scope.speakers)
		{
			$scope.speakers[0]= data.addedSpeaker;
		}
		else
		{
			
			if(data.addedSpeaker.profilePic != "")
			{
				data.addedSpeaker.eventSpeakerPicSource = "/attachements?id=" + data.addedSpeaker.profilePic.id
				+ "&key=" + data.addedSpeaker.profilePic.key;
				data.addedSpeaker.eventSpeakerPicUploaded = true;
			}
			else 
			{
				data.addedSpeaker.eventSpeakerPicUploaded = false;
			}
			
			$scope.speakers.push(data.addedSpeaker);
		}
		
		
    });
	
	

	$scope.uploadEventImage = function () 
	{

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
	$scope.openDatePicker2 = function() {
		$scope.DatePickerPopup2.opened = true;

	};
	$scope.openDatePicker3 = function() {
		$scope.DatePickerPopup3.opened = true;

	};

	$scope.DatePickerPopup = {
		opened: false
	};
	$scope.DatePickerPopup2 = 
	{
	        opened: false
    };
	$scope.DatePickerPopup3 = 
	{
	        opened: false
    };
	
	
	$scope.dateOptions = 
	{
		initDate: new Date(),
		minDate: new Date(),
		showWeeks: false
	};
	

});