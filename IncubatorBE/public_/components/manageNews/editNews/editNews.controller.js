fepsApp.controller('EditNewsController', function ($scope,$translate,$localStorage,manageNewsService,$location,sharedDataService) {

	$scope.news=$localStorage.newsInEdit;
	
	$scope.hasImage = false;
	$scope.init = function () {
        if ($localStorage.newsInEdit==null) {
        	$scope.news={
        			active:true,
        			state:"active",
        			details:"",
        			eventURL:"",
        			headline:"",
        			storyDate:"",
        			type:"news"
        	}
        	$scope.hasImage = false;
        }else{
        	$scope.news.storyDate = new Date($scope.news.storyDate);
        	if($localStorage.newsInEdit.imageFile){
        		$scope.hasImage = true;
				$scope.news.image = null;
        	}else{
        		$scope.hasImage = false;
        	}
        	
        } 
    }
	
	
	
	$scope.submitNews = function(){
		$scope.news.state = $scope.news.active==true? "active" : "inactive";
		angular.forEach($scope.addNews.$error.required, function (field) {
	            console.log(field)
				field.$setDirty();
	        });
		 if ($scope.addNews.$valid) {
			 if ($localStorage.newsInEdit!=null){
				 if($scope.news.image){
					 sharedDataService.addNewsFile($scope.news.image).then(
								function (result1){
									$scope.news.imageFile = {
										key : result1.data.attachements[0].key,
										id:result1.data._id,
										rev:result1.data._rev
									};
									manageNewsService.updateNews($scope.news).then(function (result2){
										 $scope.news=null;
										$location.path( 'fepsIncubator/manageNews');
									},function (error) {
										if(error.statusText != "ok"){
											console.log("updating news list failed");
										}
									});
								},function (error) {
									if(error.statusText != "ok"){
										console.log("updating news list failed");
									}
								});
				 }else{
					 manageNewsService.updateNews($scope.news).then(function (result){
						 $scope.news=null;
						 $location.path( 'fepsIncubator/manageNews');
						},function (error) {
							if(error.statusText != "ok"){
								console.log("updating news list failed");
							}
						});
				 }
					
				}else {
					if($scope.news.image){
						sharedDataService.addNewsFile($scope.news.image).then(
								function (result1){
									$scope.news.imageFile = {
										key : result1.data.attachements[0].key,
										id:result1.data._id,
										rev:result1.data._rev
									};
									manageNewsService.addNews($scope.news).then(function (result2){
										$location.path( 'fepsIncubator/manageNews');
									},function (error) {
										if(error.statusText != "ok"){
											console.log("adding news list failed");
										}
									});
								},function (error) {
									if(error.statusText != "ok"){
										console.log("adding news list failed");
									}
								});
					}else{
						manageNewsService.addNews($scope.news).then(function (result2){
							$location.path( 'fepsIncubator/manageNews');
						},function (error) {
							if(error.statusText != "ok"){
								console.log("adding news list failed");
							}
						});
					}
				}
			 
		 }
	};
	
	
	$scope.doCancel = function(){
		$scope.news= null;
		$location.path( 'fepsIncubator/manageNews');
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



});