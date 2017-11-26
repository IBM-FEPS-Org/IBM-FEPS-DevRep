fepsApp.controller('NewsEventsListController', function ($scope,manageNewsService,manageEventsService, usSpinnerService, $localStorage,$location) {

	$scope.init = function () {
		usSpinnerService.spin('spinner');
		manageNewsService.getNewsList().then(function (result) {
			usSpinnerService.stop('spinner');
			$scope.newsList = result.data.data;
			$scope.isData = ($scope.newsList == null) ? true : false;
			for(var i=0;i<$scope.newsList.length;i++){
				if($scope.newsList[i].imageFile){
					$scope.newsList[i].imageFile.key = $scope.newsList[i].imageFile.key.replace('&' , '%26');
					$scope.newsList[i].imageSource = "/attachements?id="+$scope.newsList[i].imageFile.id
						+"&key="+$scope.newsList[i].imageFile.key
				}else{
					$scope.newsList[i].imageSource = "../../../img/news-img-small.png";
				}
			}
		},function (error) {
			usSpinnerService.stop('spinner');
			if(response.statusText != "ok"){
				console.log("getting news list failed");
			}
		});

		manageEventsService.getAllEvents().then(function (result) {
			usSpinnerService.stop('spinner');
			$scope.eventList = result.data.data;
			console.log($scope.eventList);
			$scope.isData2 = ($scope.eventList == null) ? true : false;
			for(var i=0;i<$scope.eventList.length;i++){
				if($scope.eventList[i].value.eventPhotoAttach){
					$scope.eventList[i].value.eventPhotoAttach.key = $scope.eventList[i].value.eventPhotoAttach.key.replace('&' , '%26');
					$scope.eventList[i].imageSource = "/attachements?id="+$scope.eventList[i].value.eventPhotoAttach.id
						+"&key="+$scope.eventList[i].value.eventPhotoAttach.key
				}else{
					$scope.eventList[i].imageSource = "../../../img/news-img-small.png";
				}
			}
		},function (error) {
			usSpinnerService.stop('spinner');
			if(response.statusText != "ok"){
				console.log("getting events list failed");
			}
		});



	}
	$scope.viewNewsDetails = function(news){
		$localStorage.newsInView = news;
		$location.path( 'fepsIncubator/newsDetails');
	}

	$scope.viewEventDetails = function(eventId){
		$location.path('fepsIncubator/eventsDetails').search({'eventId': eventId});
	}
});