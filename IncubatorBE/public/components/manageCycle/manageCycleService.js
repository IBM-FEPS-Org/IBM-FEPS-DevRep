fepsApp.factory('manageCycleService', function ($http, envService, $localStorage) {

    var apiUrl = envService.read('apiUrl');
    var manageCycleService = {};
    var currentDate;
   
    manageCycleService.getCycle = function(active){
    	
    	return $http({
			method: 'GET',
			url: apiUrl+'/cycles'+'?active='+active,
			headers: {"Authorization":"Bearer "+$localStorage.currentUser.token}
		 });

    };

 
    
    manageCycleService.addCycle = function(){
    	var newCycle=$localStorage.cycle;
    	currentDate=new Date().getTime();
    	newCycle.startDate= currentDate;
    	newCycle.active=true;
    	newCycle.currentPhase="Admission";
    	newCycle.admissionDate=currentDate;
    	
    	
    	console.log("addingCycle",newCycle);
    	
	    return $http({
			method: 'POST',
			url: apiUrl+'/cycles',
			data: newCycle,
			headers: {"Authorization":"Bearer "+$localStorage.currentUser.token, "Content-type" : "application/json"}
		 });
	 
	
    };

    
    manageCycleService.updateCycle = function(){
    	currentDate=new Date().getTime();
    	var updateCycle = $localStorage.cycle;
    	var phase = $localStorage.cycleNextPhase;
    	updateCycle.currentPhase = phase;
    	if (phase=="Revision")
    		updateCycle.revisionDate = currentDate;
    	else if (phase=="Incubation")
    		updateCycle.incubationDate = currentDate;
    	else if (phase=="Closure"){
    		updateCycle.closureDate = currentDate;
    		updateCycle.active = false;
    		updateCycle.endDate = currentDate;
    		//$localStorage.cycle = null;
    	}
    	
    	//console.log("updating Cycle",updateCycle);
    	//$localStorage.cycle = null;
    	//$localStorage.cycleNextPhase = null;
    	
    	//console.log ("token:",$localStorage.currentUser.token);
    	
	    return $http({
			method: 'PUT',
			url: apiUrl+'/cycles',
			data: updateCycle,
			headers: {"Authorization":"Bearer "+$localStorage.currentUser.token}
		 });
	
    	
    	
    };
    
    return manageCycleService;

});