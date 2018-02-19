fepsApp.controller('advisoryBoardListController', function ($scope, $rootScope, $translate, $uibModal) {

	$scope.openBio = function (item) 
	{
		console.log(item);
        var modalInstance = $uibModal.open(
        {
            ariaDescribedBy: 'ShortBio',
            templateUrl: 'components/advisoryBoardList/advisoryBoardDetails/advisoryBoardDetails.view.html',
            controller: 'advisoryBoardDetailsController',
            size: 'md'
        });
        modalInstance.member = item;
        return modalInstance;

    }



});