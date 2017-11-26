fepsApp.factory('manageEventsService', function ($http, envService, $localStorage) {

    var apiUrl = envService.read('apiUrl');
    var manageEventsService = {};

    
    
    manageEventsService.getAllEvents = function(){
     	return $http({
		 	method: 'GET',
		 	url: apiUrl+'/events',
		 	headers:{}
		  });
    
     };
     
     
     manageEventsService.enroll = function(eventId){
       	return $http({
  		 	method: 'POST',
  		 	url: apiUrl+'/events/'+eventId+'/requests',
  		 	headers:{"Authorization":"Bearer "+$localStorage.currentUser.token}
  		  });
      };
       
       manageEventsService.cancelEnrollment = function(eventId){
          	return $http({
     		 	method: 'DELETE',
     		 	url: apiUrl+'/events/'+eventId+'/requests',
     		 	headers:{"Authorization":"Bearer "+$localStorage.currentUser.token}
     		  });
       };
     
     
     manageEventsService.changeEventStatus = function(eventId,userId,newStatus){
      	return $http({
 		 	method: 'patch',
 		 	url: apiUrl+'/events/'+eventId+'/requests?userId='+userId,
 		 	data: {status : newStatus},
 		 	headers:{"Authorization":"Bearer "+$localStorage.currentUser.token}
 		  });
     
      };
	manageEventsService.getEventbyID = function(eventId){
		return $http({
			method: 'GET',
			url: apiUrl+'/events/'+ eventId,
			headers:{}
		});

	};
	
	manageEventsService.getEventsbyID = function(eventIds){
		return $http({
			method: 'GET',
			url: apiUrl+'/events?ids='+ eventIds,
			headers:{}
		});

	};
     manageEventsService.deleteEvent = function (eventId) {
     	return $http({
		 	method: 'DELETE',
		 	url: apiUrl+'/events/'+eventId,
		 	headers: {"Authorization":"Bearer "+$localStorage.currentUser.token}
		  });
     };
    
	manageEventsService.addEvent = function(newEvent){
	    return $http({
			method: 'POST',
			url: apiUrl+'/events',
			data: newEvent,
			headers: {"Authorization":"Bearer "+$localStorage.currentUser.token}
		 });

    };
	manageEventsService.updateEvent = function(event){
		return $http({
			method: 'PUT',
			url: apiUrl+'/events',
			data: event,
			headers: {"Authorization":"Bearer "+$localStorage.currentUser.token}
		});

	};
    //
    //
    // manageNewsService.updateNews = function(updateNews){
    // 	console.log($localStorage.currentUser.token);
    // 	$localStorage.newsInEdit= null;
	 //    return $http({
		// 	method: 'PUT',
		// 	url: apiUrl+'/news',
		// 	data: updateNews,
		// 	headers: {"Authorization":"Bearer "+$localStorage.currentUser.token}
		//  });
    // };
    return manageEventsService;

});
