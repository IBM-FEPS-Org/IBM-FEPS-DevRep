fepsApp.filter('checkRole', function() {
    return function(role) {
    	if(role == 'Founder' || role == 'Member'){
    		return "Registered user";
    	} 	
    	else return role;
    };
});