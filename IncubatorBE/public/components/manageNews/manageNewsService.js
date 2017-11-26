fepsApp.factory('manageNewsService', function ($http, envService, $localStorage) {

    var apiUrl = envService.read('apiUrl');
    var manageNewsService = {};


    manageNewsService.getNewsList = function(){
    	return $http({
			method: 'GET',
			url: apiUrl+'/news',
			headers: {}
		 });

    };

    manageNewsService.deletNews = function () {
    	var deleteNews = $localStorage.deleteNews;
    	$localStorage.deleteNews= null;

    	return $http({
			method: 'DELETE',
			url: apiUrl+'/news/'+deleteNews._id+'?_rev='+deleteNews._rev,
			headers: {"Authorization":"Bearer "+$localStorage.currentUser.token}
		 });



    };

    manageNewsService.addNews = function(newNews){	
	    return $http({
			method: 'POST',
			url: apiUrl+'/news',
			data: newNews,
			headers: {"Authorization":"Bearer "+$localStorage.currentUser.token}
		 });

    };


    manageNewsService.updateNews = function(updateNews){
    	console.log($localStorage.currentUser.token);
    	$localStorage.newsInEdit= null;
	    return $http({
			method: 'PUT',
			url: apiUrl+'/news',
			data: updateNews,
			headers: {"Authorization":"Bearer "+$localStorage.currentUser.token}
		 });
    };
    return manageNewsService;

});
