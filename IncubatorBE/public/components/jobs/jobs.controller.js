fepsApp.controller('jobsController', function ($scope,$translate,usSpinnerService,manageJobsService,$log,$localStorage,$location) {


    $scope.init = function () {


        $scope.getJobs();
        $scope.currentUser = $localStorage.currentUser;

    }


    $scope.getJobs = function(){
        usSpinnerService.spin('spinner');
        manageJobsService.getJobList().then(function (success) {

            if(success.data.data == 0 || success.data.data == null){
                $scope.noJobs = true;
            }
            else {
                $scope.noJobs = false;
                $scope.jobsList = success.data.data;
                for(var i=0;i < $scope.jobsList.length;i++){
                    $scope.jobsList[i].createDate = new Date($scope.jobsList[i].createDate);
                }

            }
            usSpinnerService.stop('spinner');
        }, function (err) {
            $log.error(err);
            usSpinnerService.stop('spinner');
        })
    }
    
    $scope.gotoSignUp = function(){
		$location.path('fepsIncubator/signup').search({'jobId':"jobs"});
	}
    
    $scope.goToDetailsPage = function (jobId) {
        $location.path('fepsIncubator/jobDetails').search({'jobId': jobId});
    }
});