fepsApp.controller('MentorsListController', function ($scope,$translate,$localStorage,usSpinnerService,mentorListService) {

	$scope.init = function () {
		usSpinnerService.spin('spinner');
		mentorListService.getMentorList().then(function (result) {
			usSpinnerService.stop('spinner');
			$scope.mentorList = result.data;
			$scope.isData = ($scope.mentorList == null) ? true : false;
			for(i=0 ; i<$scope.mentorList.length ; i++){

				if($scope.mentorList[i].profilePic)
				{
					$scope.mentorList[i].imageSource = "/attachements?id="+$scope.mentorList[i].profilePic.id
						+"&key="+$scope.mentorList[i].profilePic.key;
				}
				else{
					$scope.mentorList[i].imageSource = "../../img/portraitHolder.png";
				}
			}


		},function (error) {
			usSpinnerService.stop('spinner');
			if(response.statusText != "ok"){
				console.log("getting mentors failed");
			}
		});
		$scope.user = $localStorage.currentUser;

		if($scope.user){
			$scope.isUser = ($localStorage.currentUser.groups[0].id == 8 || $localStorage.currentUser.groups[0].id == 6 || $localStorage.currentUser.groups[0].id == 9) ? true : false;
		}
		else{
			$scope.isUser = true;
		}
	}

	$scope.selectCard = function (event){
		angular.element(event.target).toggleClass('active');
	}

});
