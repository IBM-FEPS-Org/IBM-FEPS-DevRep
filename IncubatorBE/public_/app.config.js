fepsApp.config(function($routeProvider,$locationProvider,$translateProvider,appLabelsAr,appLabelsEn,appConstants,envServiceProvider,$qProvider,usSpinnerConfigProvider) {
    
	usSpinnerConfigProvider.setDefaults({color: 'gray'});

	var successededAuthentication = function (result,view,$location,sharedDataService,$localStorage,privillageLevel,$route) {
		console.log("Authentication succeeded");

		$localStorage.currentUser.token = result.data.token;

		if(view == "viewProfile" || view == "updateProfile" || view == "addProject" || view == "addEditEvents" || view == "addIssue"){
			$location.path( 'fepsIncubator/'+view);
		}else{
			if($localStorage.currentUser.groups[0].id == 1){

				$location.path( 'fepsIncubator/'+view);
			}
			else if($localStorage.currentUser.groups[0].id == 8 || $localStorage.currentUser.groups[0].id == 6 || $localStorage.currentUser.groups[0].id == 9){
				if(privillageLevel == "admin"){
					$location.path( 'fepsIncubator/home');
				}else{
					$location.path( 'fepsIncubator/'+view);
				}
			}else{
				if(privillageLevel == "user"){
					$location.path( 'fepsIncubator/adminPage');
				}else{
					$location.path( 'fepsIncubator/'+view);
				}
			}             
		}		
	};
	
	var failedAuthentication = function(error,route,$location,sharedDataService,$localStorage){
    	console.log("Authentication failed");
    	if($localStorage.currentUser){
    		$localStorage.currentUser = null;
    		sharedDataService.broadcastEvent("checkCurrentUser", []);
    		$location.path( 'fepsIncubator/signin').search({'error': 'please Login'});
    	}else{
    		$location.path( 'fepsIncubator/'+route);
    	}
    }
	
	var checkprivilages = function(loginService, $location,sharedDataService,$localStorage,view,privillageLevel){
		loginService.isAuthenticated().then((result)=>{
	        successededAuthentication(result, view,$location,sharedDataService,$localStorage,privillageLevel);
		},(err)=>{
	        failedAuthentication(err, "signin",$location,sharedDataService,$localStorage);
	    });
	}
		
	// routing to different pages in the application
	var rootContext = appConstants.rootContext;
	$routeProvider
	/////public access routes ///
	.when(rootContext+'/home', {
		templateUrl : 'components/home/home.view.html',
		controller  : 'homeController',
	})
	.when(rootContext+'/aboutus', {
		templateUrl : 'components/common/aboutus/aboutus.view.html',
		controller  : 'aboutusController',
	})
	.when(rootContext+'/contactus', {
		templateUrl : 'components/common/contactus/contactus.view.html',
		controller  : 'contactusController',
	})
	.when(rootContext+'/termsAndConditions', {
		templateUrl : 'components/common/termsAndConditions/termsAndConditions.view.html',
		controller  : 'termsAndConditionsController',
	})
	.when(rootContext+'/services', {
		templateUrl : 'components/common/services/services.view.html',
		controller  : 'servicesController',
	})
	.when(rootContext+'/jobs', {
		templateUrl : 'components/jobs/jobs.view.html',
		controller  : 'jobsController',
	})
	.when(rootContext+'/jobDetails', {
		templateUrl : 'components/jobs/jobDetails/jobDetails.view.html',
		controller  : 'jobDetailsController',
	})
    .when(rootContext+'/newsList', {
		templateUrl : 'components/NewsEvents/NewsEventsList/NewsEventsList.view.html',
		controller  : 'NewsEventsListController',
	})
	.when(rootContext+'/newsDetails', {
		templateUrl : 'components/NewsEvents/NewsEventsDetails/NewsEventsDetails.view.html',
		controller  : 'NewsEventsDetailsController',
	})
	.when(rootContext+'/eventsDetails', {
		templateUrl : 'components/NewsEvents/eventsDetails/eventsDetails.view.html',
		controller  : 'eventsDetailsController',
	})
	.when(rootContext+'/signin', {
		templateUrl : 'components/login/signinPage/SignInPage.view.html',
		controller  : 'signinPageController',
	})
	.when(rootContext+'/signup', {
		templateUrl : 'components/login/signup/Signup.view.html',
		controller  : 'signupController',
    })
        .when(rootContext+'/advisoryBoardList', {
		templateUrl : 'components/advisoryBoardList/advisoryBoardList/advisoryBoardList.view.html',
		controller  : 'NewsEventsListController',
	})
	.when(rootContext+'/advisoryBoardDetails', {
		templateUrl : 'components/advisoryBoardList/advisoryBoardDetails/advisoryBoardDetails.view.html',
		controller  : 'NewsEventsDetailsController',
	})
	.when(rootContext+'/mentorsList', {
		templateUrl : 'components/mentorsList/mentorsList.view.html',
		controller  : 'MentorsListController',
	})
	.when(rootContext+'/howtoapply', {
		templateUrl : 'components/common/howtoapply/howToApply.view.html',
		controller  : 'howToApplyController',
	})
	.when(rootContext+'/forgetPassword', {
		templateUrl : 'components/login/forgetPassword/ForgetPassword.view.html',
		controller  : 'ForgetPasswordController',
	})
	.when(rootContext+'/changePassword', {
		templateUrl : 'components/login/changePassword/changePassword.view.html',
		controller  : 'changePasswordController',
	})
    .when(rootContext+'/projectsList', {
		templateUrl : 'components/projectsList/projectsList.view.html',
		controller  : 'ProjectsListController',
    })


	.when(rootContext+'/resetPassword', {
		templateUrl : 'components/login/forgetPassword/ForgetPassword.view.html',
		controller  : 'ForgetPasswordController',
        resolve: {
            initParams: function($route){
                var params = $route.current.params;
                params.isResetPassword =  true;
            }
        }

	})
	/////users access routes ///
	.when(rootContext+'/addProject', {
		templateUrl : 'components/addProject/addProject.view.html',
		controller  : 'addProjectController',
		resolve: {
			checkUserPrivilages: function(loginService, $location,sharedDataService,$localStorage){
				checkprivilages(loginService, $location,sharedDataService,$localStorage,"addProject","user");
            }
        }
	})
	.when(rootContext+'/addIssue', {
		templateUrl : 'components/businessClinic/addIssue/addIssue.view.html',
		controller  : 'addIssueController',
		resolve: {
			checkUserPrivilages: function(loginService, $location,sharedDataService,$localStorage){
				checkprivilages(loginService, $location,sharedDataService,$localStorage,"addIssue","user");
            }
        }
	})
	.when(rootContext+'/briefCaseLanding', {
		templateUrl : 'components/briefCase/briefCaseLandingPage/briefCaseLandingPage.view.html',
		controller  : 'BriefCaseLandingPageController',
		resolve: {
			checkUserPrivilages: function(loginService, $location,sharedDataService,$localStorage){
				checkprivilages(loginService, $location,sharedDataService,$localStorage,"briefCaseLanding","user");
            }
        }
	})
	.when(rootContext+'/briefCaseeventDetails', {
		templateUrl : 'components/briefCase/eventDetailsFromBriefCase/eventDetailsFromBriefCase.view.html',
		controller  : 'EventDetailsFromBriefCaseController',
		resolve: {
			checkUserPrivilages: function(loginService, $location,sharedDataService,$localStorage){
				checkprivilages(loginService, $location,sharedDataService,$localStorage,"briefCaseeventDetails","user");
            }
        }
	})
	.when(rootContext+'/viewProfile', {
		templateUrl : 'components/userProfile/userProfileView.html',
		controller  : 'userProfileController',
		resolve: {
			checkUserPrivilages: function(loginService, $location,sharedDataService,$localStorage){
				checkprivilages(loginService, $location,sharedDataService,$localStorage,"viewProfile","user");
            }
        }
	})
	.when(rootContext+'/updateProfile', {
		templateUrl : 'components/userProfile/userProfileUpdate.html',
		controller  : 'userProfileController',
        resolve: {
        	checkUserPrivilages: function(loginService, $location,sharedDataService,$localStorage){
        		checkprivilages(loginService, $location,sharedDataService,$localStorage,"updateProfile","user");
            }
        }
	})
	/////admins access routes ///
	.when(rootContext+'/adminPage', {
		templateUrl : 'components/adminPage/adminPage.view.html',
		controller  : 'adminPageController',
		resolve: {
            checkUserprivilages: function(loginService, $location,sharedDataService,$localStorage){
            	checkprivilages(loginService, $location,sharedDataService,$localStorage,"adminPage","admin");
            },

        }
	})
	.when(rootContext+'/manageNews', {
		templateUrl : 'components/manageNews/manageNewsLandingPage/manageNewsLandingPage.view.html',
		controller  : 'ManageNewsLandingPageController',
		resolve: {
			checkUserprivilages: function(loginService, $location,sharedDataService,$localStorage){
				checkprivilages(loginService, $location,sharedDataService,$localStorage,"manageNews","admin");
            }
        }
	})
	.when(rootContext+'/editNews', {
        templateUrl: 'components/manageNews/editNews/editNews.view.html',
        controller: 'EditNewsController',
        resolve: {
        	checkUserprivilages: function(loginService, $location,sharedDataService,$localStorage){
        		checkprivilages(loginService, $location,sharedDataService,$localStorage,"editNews","admin");
            }
        }
    })
	.when(rootContext+'/addEditEvents', {
		templateUrl : 'components/manageEvents/editEvents/editEvents.view.html',
		controller  : 'EditEventsController',
		resolve: {
			checkUserprivilages: function(loginService, $location,sharedDataService,$localStorage){
				checkprivilages(loginService, $location,sharedDataService,$localStorage,"addEditEvents","admin");
			}
		}
	})
	.when(rootContext+'/addEditJobs', {
		templateUrl : 'components/manageJobs/addEditJobs/addEditJobs.view.html',
		controller  : 'addEditJobsController',
		resolve: {
			checkUserprivilages: function(loginService, $location,sharedDataService,$localStorage){
				checkprivilages(loginService, $location,sharedDataService,$localStorage,"addEditJobs","admin");
			}
		}
	})
	.when(rootContext+'/manageCycle', {
		templateUrl : 'components/manageCycle/manageCycle.view.html',
		controller  : 'ManageCycleController',
		resolve: {
			checkUserprivilages: function(loginService, $location,sharedDataService,$localStorage){
				checkprivilages(loginService, $location,sharedDataService,$localStorage,"manageCycle","admin");
            }
        }
	})
	.when(rootContext+'/manageProjects', {
		templateUrl : 'components/manageProjects/manageProjects.view.html',
		controller  : 'ManageProjectsController',
		resolve: {
			checkUserprivilages: function(loginService, $location,sharedDataService,$localStorage){
				checkprivilages(loginService, $location,sharedDataService,$localStorage,"manageProjects","admin");
            }
        }
	})
	.when(rootContext+'/manageUsers', {
		templateUrl : 'components/manageUsers/manageUsers.view.html',
		controller  : 'ManageUsersController',
		resolve: {
			checkUserprivilages: function(loginService, $location,sharedDataService,$localStorage){
				checkprivilages(loginService, $location,sharedDataService,$localStorage,"manageUsers","admin");
            }
        }
	})
	.when(rootContext+'/manageEvents', {
		templateUrl : 'components/manageEvents/manageEvents.view.html',
		controller  : 'manageEventsController',
		resolve: {
			checkUserprivilages: function(loginService, $location,sharedDataService,$localStorage){
				checkprivilages(loginService, $location,sharedDataService,$localStorage,"manageEvents","admin");
			}
		}
	})
	.when(rootContext+'/manageJobs', {
		templateUrl : 'components/manageJobs/manageJobs.view.html',
		controller  : 'manageJobsController',
		resolve: {
			checkUserprivilages: function(loginService, $location,sharedDataService,$localStorage){
				checkprivilages(loginService, $location,sharedDataService,$localStorage,"manageJobs","admin");
			}
		}
	})
	.when(rootContext+'/manageClinic', {
		templateUrl : 'components/businessClinic/manageClinic/manageClinic.view.html',
		controller  : 'manageClinicController',
		resolve: {
			checkUserprivilages: function(loginService, $location,sharedDataService,$localStorage){
				checkprivilages(loginService, $location,sharedDataService,$localStorage,"manageClinic","admin");
			}
		}
	})
	.otherwise( {
                redirectTo: rootContext + "/home"
            });

	$locationProvider.html5Mode({
    		  enabled: true,
    		  requireBase: false
    });

	//language translation
	$translateProvider.translations('en', appLabelsEn);
	
	$translateProvider.translations('ar', appLabelsAr);

	$translateProvider.preferredLanguage('en');




    //environmental variables
	  envServiceProvider.config({
          vars: {
              development: {
                  apiUrl: '',
              },
              test: {
                  apiUrl: '',  
              },
              production: {
                  apiUrl: '',
              },
              defaults: {
                  apiUrl: '',
              }
          }
      });
	  
	  $qProvider.errorOnUnhandledRejections(false);

});