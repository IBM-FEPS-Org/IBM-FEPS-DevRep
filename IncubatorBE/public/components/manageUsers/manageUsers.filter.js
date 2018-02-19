fepsApp.filter('checkRole', function() {
    return function(role) {
    	if(role == 'Founder' || role == 'Member' || role == 'Co-Founder'){
    		return "Registered user";
    	} 	
    	else return role;
    };
});