fepsApp.controller('homeController', function ($scope,$translate,$filter,$window,$localStorage,manageNewsService,sharedDataService,manageEventsService,$location) {

    $scope.currentUser = $localStorage.currentUser;

    $scope.date = new Date();
    
    $scope.isAdmission = true;
	$scope.isUser = true;
	
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    $scope.init = function(){
         $scope.currentUser = $localStorage.currentUser;
         if($scope.currentUser){
             $scope.user = $localStorage.currentUser;
             $scope.isUser = ($localStorage.currentUser.groups[0].id == 8 || $localStorage.currentUser.groups[0].id == 6 || $localStorage.currentUser.groups[0].id == 9 || $localStorage.currentUser.groups[0].id == 10) ? true : false;
             
             sharedDataService.getCurrentCycle().then(function (response) {
                 if(response.data.data){
                     $scope.cycle = response.data.data[0];
                     if($scope.cycle.currentPhase == "Admission"){
                         $scope.isAdmission = true;
                     }else{
                         $scope.isAdmission = false;
                     } 
                 }else{
                     $scope.isAdmission = false;
                 }
                 
             },function (error) {
                 $log.error(JSON.stringify(error));
             });
             
         }else{
             $scope.user = null;
         }
         
         $scope.applyNow = function ()
         {
        	 	if($localStorage.currentUser)
    	 		{
        	 		$location.path("/fepsIncubator/briefCaseLanding");
    	 		}
        	 	else{
        	 		$location.path("fepsIncubator/signup");
        	 	}
         };
        
        
        manageNewsService.getNewsList().then(function (result) {
            $scope.newsList = result.data.data;
            for(var i=0;i< $scope.newsList.length;i++){

                $scope.newsList[i].storyDate = new Date($scope.newsList[i].storyDate);
                $scope.newsList[i].month = monthNames[$scope.newsList[i].storyDate.getMonth()];
                $scope.newsList[i].date = $scope.newsList[i].storyDate.getDate();
                
            }

        },function (error) {
            if(response.statusText != "ok"){
                console.log("getting news list failed");
            }
        });
        manageEventsService.getAllEvents().then(function (result) 
        {
        	
			$scope.eventList = result.data.data;
			$scope.eventsList = [];
			for(var i=0;i<$scope.eventList.length;i++)
			{
				
				
				if( new Date($scope.eventList[i].value.eventStartDate) >= new Date())
				{
					$scope.eventList[i].storyDate = new Date($scope.eventList[i].value.eventStartDate);
					$scope.eventList[i].month = monthNames[$scope.eventList[i].storyDate.getMonth()];
	                $scope.eventList[i].date = $scope.eventList[i].storyDate.getDate();
	                
	                $scope.eventsList.push($scope.eventList[i]);
				}
			}
		},function (error) {
			if(response.statusText != "ok"){
				console.log("getting events list failed");
			}
		});
        
    }

    
    $scope.viewNewsDetails = function(news)
    {
		$localStorage.newsInView = news;
		console.log($localStorage.newsInView);
		$location.path( 'fepsIncubator/eventsDetails').search({eventId: news.id});
	}
    
    $scope.$on("checkCurrentUser", function() {
        $scope.currentUser = $localStorage.currentUser;
        if($scope.currentUser){
            $scope.user = $localStorage.currentUser;
            $scope.isUser = ($localStorage.currentUser.groups[0].id == 8 || $localStorage.currentUser.groups[0].id == 6 || $localStorage.currentUser.groups[0].id == 9 || $localStorage.currentUser.groups[0].id == 10) ? true : false;
            
            sharedDataService.getCurrentCycle().then(function (response) {
                if(response.data.data){
                    $scope.cycle = response.data.data[0];
                    if($scope.cycle.currentPhase == "Admission"){
                        $scope.isAdmission = true;
                    }else{
                        $scope.isAdmission = false;
                    } 
                }else{
                    $scope.isAdmission = false;
                }
                
            },function (error) {
                $log.error(JSON.stringify(error));
            });
            
        }else{
            $scope.user = null;
        }
    });

	$window.scrollTo(0, 0);
    $scope.active = 0;
    $scope.myInterval = 3000;
    $scope.noWrapSlides = false;
    var slides = $scope.slides = [
        {image:'../../img/top-section-bg.png',id:'0',title:'aboutusVision', text:'aboutusVisionText',href:'fepsIncubator/aboutus#visionSection'},
        {image:'../../img/top-section-bg2.png',id:'1',title:'aboutusMission',text:'aboutusMissionText',href:'fepsIncubator/aboutus#missionSection'},
        {image:'../../img/top-section-bg4.jpeg',id:'2',title:'aboutusTeam',text:'aboutusTeamText',href:'fepsIncubator/aboutus#teamSection'}];


    $scope.newsInterval = 3000;
    $scope.noWrapNews = false;



});