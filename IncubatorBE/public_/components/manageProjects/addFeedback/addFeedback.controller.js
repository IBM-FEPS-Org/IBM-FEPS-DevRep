fepsApp.controller('addFeedbackController', function ($scope, $translate, $uibModalInstance) {

    var project = $uibModalInstance.project;
    if(project.feedback && project.feedback.length >1)
        $scope.feedBack = project.feedback;
    else
        $scope.feedBack = $translate.instant('noFeedback');

    $scope.closeModal = function () {
        $uibModalInstance.close('close');
    }
});