fepsApp.controller('ManageNewsLandingPageController', function ($scope,$translate,$location,usSpinnerService,$uibModal,manageNewsService,$localStorage) {

	  $scope.selected3 = true;


	  $scope.newsList;

	  $scope.rowA ="rowA";
	  $scope.rowB ="rowB";

	  $scope.newsGridActions = {};

	  $scope.newsGridOptions = {
              data: []
      };
	  $scope.newsPaginationOptions={
	      		totalItems  :0,
	      		itemsPerPage:10,
	      		currentPage:1
	   };

	  $scope.newsNumbersValid =true;

	  $scope.init = function () {
		 $scope.isAdmin = ($localStorage.currentUser.groups[0].id == 1 || $localStorage.currentUser.groups[0].id == 2) ? true : false;
		 usSpinnerService.spin('spinner');
		 manageNewsService.getNewsList().then(function (result){
			  usSpinnerService.stop('spinner');
			  $scope.newsList = result.data.data;
			  $scope.isData = ($scope.newsList == null) ? true : false;
			  $scope.newsGridOptions.data = $scope.newsList;
			  $scope.newsPaginationOptions.totalItems = $scope.newsList.length;
		},function (error) {
					if(response.statusText != "ok"){
						console.log("getting news list failed");
					}
		});

	  }


	  $scope.changeNewsState = function(news){
		  if (news.active=="true"||news.active==true){
			  news.active=false;
			  news.state = "inactive";
		  }
		  else if (news.active=="false"||news.active==false){  
			  news.active=true;
			  news.state = "active";
		  }
		  manageNewsService.updateNews(news).then(function (result){
			 
		  },function (error) {
			  if (news.active=="true"||news.active==true){
				  news.active=true;
				  news.state = "active";
			  }
			  else if (news.active=="false"||news.active==false){  
				  news.active=false;
				  news.state = "inactive";
			  }
			  
					if(error.statusText != "ok"){
						console.log("updating news list failed");
					}
		  });;
	  };

	  $scope.editNews = function(news){
			  $localStorage.newsInEdit = news;
			  $location.path( 'fepsIncubator/editNews');
	  };

	  $scope.addNews = function(){
		  $localStorage.newsInEdit = null;
		  $location.path( 'fepsIncubator/editNews');
	  };


	  $scope.deleteNews = function(news){
		  $localStorage.deleteNews = news;
		  var modalInstance = $uibModal.open(
					{
						ariaDescribedBy:'deleteNews',
						templateUrl:'components/shared/confirmation.view.html',
						controller : 'confirmationController',
						size: 'md',
						keyboard: true
					});
		  modalInstance.modal="deleteNews";

	  }

});
