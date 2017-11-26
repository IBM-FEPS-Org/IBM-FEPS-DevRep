fepsApp.controller('addProjectController', function ($scope,$translate,$uibModal,$location,usSpinnerService, $localStorage,$window,sharedDataService,$timeout,projectService,$routeParams) {

	$scope.project = {};

	$scope.afiliationFile = '';
	$scope.afiliationAttachment = {};
	$scope.afiliationUploaded = false;
	$scope.noAfiliationSelected = true;


	$scope.prototypeFile = '';
	$scope.prototypeAttachment = {};
	$scope.prototypeUploaded = false;
	$scope.noPrototypeSelected = true;
	$scope.prototypeFileNameNotValid = false;
	$scope.affiliationRequired = true;
	$scope.afiliationFileNameNotValid = false;


	$scope.incubationFile = '';
    $scope.incubationAttachments = [];
    $scope.noIncubationSelected = true;
    $scope.noAttachmentsUploaded = false;
    $scope.incubationFileNameNotValid = false;

	$scope.rowA ="rowA";
	$scope.rowB ="rowB";
	$scope.maxSizeforallAttach = 0;
	$scope.projIncubAllAttachMaxSizeRest = '10000KB';

	$scope.attchementArrayNames = [];

	$scope.cycle = {};

	$scope.date = new Date();
	/*
	 view mode flag
	 1 == add
	 2 == edit
	 3 == view only
	 */
	$scope.viewMode = 1;

	$scope.showFeedBack = false;
	$scope.disableFeedBack =false;
	$scope.disableComment =false;
	

	$scope.showIncubationAttchaments = false;
	$scope.allowIncubationAttchaments = false;

	$scope.founderUser = {};

    $scope.members =[];

    $scope.deletedMembers = [];

    $scope.membersNumbersValid =true;

    $scope.memebrsGridActions = {};

    $scope.memebrsGridOptions = {data: []};


	$scope.projIncubAllAttachMaxSize = false;

    $scope.paginationOptions={
         		totalItems  :0,
         		itemsPerPage:10,
         		currentPage:1
    };

    $scope.init = function () {

        $scope.deletedMembers = [];

    	$scope.afiliationFile = '';
    	$scope.afiliationAttachment = {};
    	$scope.afiliationUploaded = false;
    	$scope.noAfiliationSelected = true;
    	$scope.prototypeFile = '';
    	$scope.prototypeAttachment = {};
    	$scope.prototypeUploaded = false;
    	$scope.noPrototypeSelected = true;

    	$scope.affiliationRequired = true;
    	
    	$scope.prototypeFileNameNotValid = false;
        $scope.afiliationFileNameNotValid = false;

    	sharedDataService.getCurrentCycle().then(function (response) {
    		$scope.cycle = response.data.data[0];
    		var projectId = -1;

    		var param = $location.search();
    		if (param.projectId) {
    			projectId = $routeParams.projectId;
    			$scope.viewMode = 3;
    			$scope.affiliationRequired = false;
    		}else if($localStorage.currentUser.projects && $localStorage.currentUser.projects[0].cycle == $scope.cycle._id){
    		        projectId = $localStorage.currentUser.projects[0]._id;
                    $scope.viewMode = 1;
					if($localStorage.currentUser.groups[0].id == 1){
						$location.path( 'fepsIncubator/adminPage');
					}
    		}
    		else{
				if($localStorage.currentUser.groups[0].id == 1){
					$location.path( 'fepsIncubator/adminPage');
				}
			}
        	if(projectId != -1){
        		projectService.getProject(projectId)
            	.then(function (result) {
            		$scope.project = result.data.data;
            		//console.log($scope.project);
					if($scope.project.incubationAttachments.length == 0){
						$scope.maxSizeforallAttach = 0;
					}
					else{
						for(i=0;i<$scope.project.incubationAttachments.length ;i++ ){
							$scope.maxSizeforallAttach = $scope.maxSizeforallAttach + $scope.project.incubationAttachments[i].size/1000;
						}
					}
					//console.log($scope.maxSizeforallAttach);
            		if($scope.project.afiliationAttachment && $scope.project.afiliationAttachment.id){
            			$scope.afiliationUploaded = true;
						$scope.afiliationAttachment = {
								key : $scope.project.afiliationAttachment.key,
								id:$scope.project.afiliationAttachment.id,
								rev:$scope.project.afiliationAttachment.rev
						};
            		}
            		if($scope.project.prototypeAttachment && $scope.project.prototypeAttachment.id){
            			$scope.prototypeUploaded = true;
						$scope.prototypeAttachment = {
								key : $scope.project.prototypeAttachment.key,
								id:$scope.project.prototypeAttachment.id,
								rev:$scope.project.prototypeAttachment.rev
						};
            		}
            		if($scope.project.incubationAttachments && $scope.project.incubationAttachments.length>0){
            		    $scope.incubationAttachments = $scope.project.incubationAttachments;
            		}
            		$scope.project.foundingDate = new Date($scope.project.foundingDate);
            		if($scope.viewMode == 1){
            			if($scope.cycle.currentPhase == "Admission" && $localStorage.currentUser.projects[0].role == "Founder"){
                			$scope.viewMode = 2;
                			$scope.affiliationRequired = false;
                		}else{
                			$scope.viewMode = 3;
                			$scope.affiliationRequired = false;
                		}
            		}
                	$scope.members = angular.copy($scope.project.members);
                	$scope.memebrsGridOptions.data = $scope.members;
                    $scope.paginationOptions.totalItems = $scope.members.length;

                	for(var i=0;i<$scope.members.length;i++){
                		if($scope.members[i].role == "Founder"){
                			$scope.founderUser = $scope.members[i];
                		}
                	}

                	//check to view feed back and score sections
                    if($scope.cycle.currentPhase == "Revision" &&
                            ($localStorage.currentUser.groups[0].id == 1
                             || $localStorage.currentUser.groups[0].id == 4
                             || $localStorage.currentUser.groups[0].id == 7)){
                           $scope.showFeedBack = true;
                           var role = $localStorage.currentUser.groups[0].id;
                           var projectStatus = $scope.project.status;
                           console.log(projectStatus); 
                           if(role == 1 || role == 4){
                               $scope.disableComment = false;
                               if($scope.project.score && $scope.project.score != ""){
                                   $scope.disableFeedBack = true; 
                               }else{
                                   $scope.disableFeedBack = false; 
                               }
                           }else{
                               $scope.disableComment = true;
                               if(projectStatus == 2){
                                   $scope.disableFeedBack = false;
                               }else{
                                   $scope.disableFeedBack = true; 
                               }
                           }
                           
                           
                         
                               
                            
                    }else{
                           $scope.showFeedBack = false;
                    }
                    //check to view incubation attachment sections
                    if($scope.cycle.currentPhase == "Incubation" && $scope.project.status == 5 &&
                             ($localStorage.currentUser.groups[0].id == 1
                                     || $localStorage.currentUser.groups[0].id == 4
                                     || $localStorage.currentUser.groups[0].id == 6
                                     || $localStorage.currentUser.groups[0].id == 9
                                     || $localStorage.currentUser.groups[0].id == 7)){
                             $scope.showIncubationAttchaments = true;
                             if($localStorage.currentUser.groups[0].id == 6){
                                 $scope.allowIncubationAttchaments = true;
                             }else{
                                 $scope.allowIncubationAttchaments = false;
                             }

                    }else{
                             $scope.showIncubationAttchaments = false;
                             $scope.allowIncubationAttchaments = false;
                    }

            	},function (response) {
            		console.log(response);
            		if(response.statusText == ""){
            			$scope.errorMessage = "systemDown";
                		console.log("get project failed");
            		}
            	});

        	}else{
        		$scope.founderUser = {
        				firstName : $localStorage.currentUser.firstName,
        				surName: $localStorage.currentUser.surname,
        				_id : $localStorage.currentUser._id,
        				username: $localStorage.currentUser.username,
            			email : $localStorage.currentUser.email,
            			role : "Founder"
            	}
        		$scope.viewMode = 1;
            	$scope.members.push($scope.founderUser);

            	$scope.memebrsGridOptions.data = $scope.members;
                $scope.paginationOptions.totalItems = $scope.members.length;
        	}
        }, function (error) {
            $log.error(JSON.stringify(error));
        })

        if (!$localStorage.sectors) {
            sharedDataService.getSectorsLookUp().then(function (response) {
                $scope.sectorArray = response.data.data;
                $localStorage.sectors = response.data.data
            }, function (error) {
                $log.error(JSON.stringify(error));
            })
        } else{
            $scope.sectorArray = $localStorage.sectors;
        }


    }

    $scope.uploadAfiliationFile = function(){
        var english = /^[A-Za-z0-9-\s_\.]*$/;
        if (english.test($scope.afiliationFile.name)){
            $scope.afiliationFileNameNotValid = false;
        }else{
            $scope.afiliationFileNameNotValid = true;
        }
        if(!$scope.afiliationFileNameNotValid){
            sharedDataService.addFile($scope.afiliationFile).then(
                    function (result){
                            $scope.afiliationUploaded = true;
                            $scope.afiliationAttachment = {
                                    key : result.data.attachements[0].key,
                                    id:result.data._id,
                                    rev:result.data._rev
                            };
                    },function (error) {
                        if(error.statusText != "ok"){
                            console.log("uploading Afiliation file failed");
                        }
            });
        }
    }

    $scope.uploadPrototypeFile = function(){
        var english = /^[A-Za-z0-9-\s_\.]*$/;
        if (english.test($scope.prototypeFile.name)){
            $scope.prototypeFileNameNotValid = false;
        }else{
            $scope.prototypeFileNameNotValid = true;
        }
        if(!$scope.prototypeFileNameNotValid){
            sharedDataService.addFile($scope.prototypeFile).then(
                    function (result){
                            $scope.prototypeUploaded = true;
                            $scope.prototypeAttachment = {
                                    key : result.data.attachements[0].key,
                                    id:result.data._id,
                                    rev:result.data._rev
                            };
                    },function (error) {
                        if(error.statusText != "ok"){
                            console.log("uploading Prototype file failed");
                        }
            }); 
        }
	}

    $scope.uploadIncubationFile = function(){
        
        var english = /^[A-Za-z0-9-\s_\.]*$/;
        if (english.test($scope.incubationFile.name)){
            $scope.incubationFileNameNotValid = false;
        }else{
            $scope.incubationFileNameNotValid = true;
        }
        
		if($scope.incubationFile.type.indexOf('image/') !== -1) {
			$scope.maxSizeforallAttach = $scope.maxSizeforallAttach + $scope.incubationFile.$ngfOrigSize / 1000;
		}
		else{
			$scope.maxSizeforallAttach = $scope.maxSizeforallAttach + $scope.incubationFile.size / 1000;
		}
		if($scope.maxSizeforallAttach < 10000 && !$scope.incubationFileNameNotValid){

			usSpinnerService.spin('spinner2');
			//remove any spetial character or any not english chracters from file name before upload



			sharedDataService.addFile($scope.incubationFile).then(
				function (result){


					//console.log($scope.incubationFile);
					if($scope.incubationFile.type.indexOf('image/') !== -1){
						var incubationAttachment = {
							key : result.data.attachements[0].key,
							id:result.data._id,
							rev:result.data._rev,
							size:$scope.incubationFile.$ngfOrigSize
						};
						//console.log('File type =  image');
						//console.log("File Size:"+ $scope.incubationFile.$ngfOrigSize/1000);
						//console.log("All Files Size:"+ $scope.maxSizeforallAttach);
						$scope.noAttachmentsUploaded = false;
						usSpinnerService.stop('spinner2');


					}
					else{
						var incubationAttachment = {
							key : result.data.attachements[0].key,
							id:result.data._id,
							rev:result.data._rev,
							size:$scope.incubationFile.size
						};
						// console.log('File type not =  image');
						// console.log("File Size:"+ $scope.incubationFile.size/1000);
						// console.log("All Files Size:"+ $scope.maxSizeforallAttach);
						$scope.noAttachmentsUploaded = false;
						usSpinnerService.stop('spinner2');
					}
					$scope.incubationAttachments.push(incubationAttachment);
					$scope.projIncubAllAttachMaxSizeRest = 10000 - $scope.maxSizeforallAttach+'KB';
					$scope.projIncubAllAttachMaxSizeRestNum = 10000 - $scope.maxSizeforallAttach;
					//console.log("eli fadel Size:"+ $scope.projIncubAllAttachMaxSizeRest);

				},function (error) {
					if(error.statusText != "ok"){
						console.log("uploading Afiliation file failed");
					}
					usSpinnerService.stop('spinner2');
				});
		}
		else{
		    if($scope.maxSizeforallAttach > 10000){
		        $scope.projIncubAllAttachMaxSize = true;
		    }
		}


    }

    $scope.deleteIncubationAttachment = function(index){


		$scope.maxSizeforallAttach = $scope.maxSizeforallAttach - $scope.incubationAttachments[index].size/1000;
		$scope.projIncubAllAttachMaxSizeRestNum = $scope.projIncubAllAttachMaxSizeRestNum + $scope.incubationAttachments[index].size;
		$scope.projIncubAllAttachMaxSizeRest =$scope.projIncubAllAttachMaxSizeRestNum+'KB';

		if($scope.maxSizeforallAttach < 10000) {
			$scope.projIncubAllAttachMaxSize = false;
		}
		if($scope.incubationAttachments.length == 0){
			$scope.maxSizeforallAttach = 0;
		}

        $scope.incubationAttachments.splice(index,1);

    }

    $scope.openAddMember = function () {
        var modalInstance = $uibModal.open(
            {
                ariaDescribedBy:'addmember2',
                templateUrl:'components/addProject/addMember/addMember.view.html',
                controller : 'addMemberController',
                size: 'md',
                keyboard: true
            });
        modalInstance.projectMembers = $scope.members;
        modalInstance.deletedMembers = $scope.deletedMembers;
        return modalInstance;

    }


    $scope.cancelAddProject = function(){
        if($scope.showFeedBack || $scope.showIncubationAttchaments){
            $location.path('fepsIncubator/adminPage');
        }else{
            $location.path('fepsIncubator/home');
        }
    }

    $scope.$watch('project.legallyRegistered', function(newValue, oldValue) {
    	if(newValue == 'yes'){
    		$scope.project.unregisterationReason = "";
    	  }
    });

    $scope.$on('addMembertoProject', function(event, data)
    {
    	$scope.members.push(data.addedMemebr);
    });

    $scope.deleteMember= function(memebrDeletedIndex){
        var modalInstance = $uibModal.open(
                {
                    ariaDescribedBy:'deleteMember',
                    templateUrl:'components/addProject/deleteMember/deleteMember.view.html',
                    controller : 'deleteMemberController',
                    size: 'md',
                    keyboard: true
                });
        modalInstance.memebrDeletedIndex = memebrDeletedIndex;
        return modalInstance;

    }

    $scope.$on('deleteMember', function(event, data)
    {
        $scope.deletedMembers.push($scope.members[data[0]]);
        $scope.members.splice(data[0],1);
    });

    $scope.saveProject = function(){

    	angular.forEach($scope.addProjectForm.$error.required, function(field) {
    	    field.$setDirty();
		});

    	if($scope.members.length<3 || $scope.members.length>6){
    		$scope.membersNumbersValid = false;
    	}else{
    		$scope.membersNumbersValid = true;
    	}
		if($scope.addProjectForm.$valid && $scope.membersNumbersValid) {
			if($scope.showFeedBack){
			    $scope.addFeedBack();
			}else if($scope.showIncubationAttchaments){
				$scope.saveIncubationAttchaments();
			}else{
			    if($scope.viewMode == 1 ){  //&& $scope.afiliationUploaded
			        $scope.addProject();
	            }else if($scope.viewMode == 2){
	                $scope.updateProject();
	            }else{
	                $window.scrollTo(0, 0);
	            }
			}
		} else{
			$window.scrollTo(0, 0);
		}
    }

    $scope.saveIncubationAttchaments = function(){
        var incubationAttachmentsObject = {
                "_id": $scope.project._id,
                "incubationAttachments" : $scope.incubationAttachments,
        }
        projectService.saveProjectAttachments(incubationAttachmentsObject)
        .then(function (result) {
            var modalInstance = $uibModal.open(
                    {
                        ariaDescribedBy: 'addProject',
                        template: '<p class="alert alert-success SuccessMsgPopup text-center">{{"projectAttchamentsSavedSuccessMsg" | translate}}</p>',
                        controller: function ($uibModalInstance) {
                            $timeout(function () {
                                $location.path('fepsIncubator/home');
                                $uibModalInstance.close('close');
                            }, 3000);
                        },
                        size: 'md',
                        keyboard: true
           });
        },function (response) {
            if(response.statusText == ""){
                $scope.errorMessage = "systemDown";
                console.log("save project incubation attachements failed");
            }
        });

    };

    $scope.addFeedBack = function(){
        var feedBackObject = {
                "_id": $scope.project._id,
                "feedback" : $scope.project.feedback,
                "score" : $scope.project.score,
								"comment" : $scope.project.comment
        }
        projectService.addProjectFeedback(feedBackObject)
        .then(function (result) {
            var modalInstance = $uibModal.open(
                    {
                        ariaDescribedBy: 'addProject',
                        template: '<p class="alert alert-success SuccessMsgPopup text-center">{{"projectFeedBackAddedSuccessMsg" | translate}}</p>',
                        controller: function ($uibModalInstance) {
                            $timeout(function () {
                                $location.path('fepsIncubator/adminPage');
                                $uibModalInstance.close('close');
                            }, 3000);
                        },
                        size: 'md',
                        keyboard: true
           });
        },function (response) {
            if(response.statusText == ""){
                $scope.errorMessage = "systemDown";
                console.log("add project feedback failed");
            }
        });

    }

    $scope.addProject = function(){
		$scope.project.members = $scope.members;
		$scope.project.score = 0;
		$scope.project.feedback ="";
		$scope.project.afiliationAttachment = $scope.afiliationAttachment;
		$scope.project.prototypeAttachment = $scope.prototypeAttachment;
		$scope.project.incubationAttachments = $scope.incubationAttachments;
		projectService.addProject($scope.project)
    	.then(function (result) {
    	    $localStorage.currentUser.token = result.headers('authorization');
    	    sharedDataService.refreshUser().then(function(refreshUserResult){
    	        $localStorage.currentUser = refreshUserResult.data.user;
                $localStorage.currentUser.token = refreshUserResult.data.token;
    	           var modalInstance = $uibModal.open(
    	                    {
    	                        ariaDescribedBy: 'addProject',
    	                        template: '<p class="alert alert-success SuccessMsgPopup text-center">{{"projectAddedSuccessMsg" | translate}}</p>',
    	                        controller: function ($uibModalInstance) {
    	                            $timeout(function () {
    	                                $location.path('fepsIncubator/home');
    	                                $uibModalInstance.close('close');
    	                            }, 3000);
    	                        },
    	                        size: 'md',
    	                        keyboard: true
    	           });
    	    }).then(function(){
    	        if(response.statusText == ""){
                    $scope.errorMessage = "systemDown";
                    console.log("refreshing user failed");
                }
    	    });
    	},function (response) {
    		if(response.statusText == ""){
    			$scope.errorMessage = "systemDown";
        		console.log("add project failed");
    		}
    	});
    }

    $scope.updateProject = function(){
    	$scope.project.members = $scope.members;
    	$scope.project.afiliationAttachment = $scope.afiliationAttachment;
    	$scope.project.prototypeAttachment = $scope.prototypeAttachment;
    	$scope.project.incubationAttachments = $scope.incubationAttachments;
		projectService.updateProject($scope.project)
    	.then(function (result) {
        	$localStorage.currentUser.token = result.headers('authorization');
    		var modalInstance = $uibModal.open(
                    {
                        ariaDescribedBy: 'addProject',
                        template: '<p class="alert alert-success SuccessMsgPopup text-center">{{"projectUpdatedSuccessMsg" | translate}}</p>',
                        controller: function ($uibModalInstance) {
                            $timeout(function () {
                                $location.path('fepsIncubator/home');
                                $uibModalInstance.close('close');
                            }, 3000);
                        },
                        size: 'md',
                        keyboard: true
           });
    	},function (response) {
    		if(response.statusText == ""){
    			$scope.errorMessage = "systemDown";
        		console.log("update project failed");
    		}
    	});
    }
	$scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
	$scope.format = $scope.formats[0];
	$scope.altInputFormats = ['M!/d!/yyyy'];
	sharedDataService.getCurrentCycle().then(function (result){
			//console.log( result.data.data[0].admissionDate);
			$scope.cycleAddmissionPhaseDate = result.data.data[0].admissionDate;
			$scope.dateOptions = {
				maxDate: new Date($scope.cycleAddmissionPhaseDate),
				showWeeks: false
			};
	},function (response) {
		console.log(response);
	});

	$scope.openDatePicker = function() {
		$scope.DatePickerPopup.opened = true;
	};

	$scope.DatePickerPopup = {
		opened: false
	};


});
