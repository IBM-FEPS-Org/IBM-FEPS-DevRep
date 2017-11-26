var fepsApp = angular.module('fepsApp',['ngRoute','pascalprecht.translate','ngStorage','ngAnimate','ui.bootstrap','environment','ngFileUpload','dataGrid','pagination','datePicker','angularSpinner'])
    .run(function( $rootScope  , $translate,envService,$localStorage) {
        
    	envService.set('development');
    	//'ngAnimate', 'ngSanitize',
    	
    	if(!$localStorage.currentLanguage){
    		$localStorage.currentLanguage = 'en';
    		$localStorage.currentPageDirection = 'ltr';
    	}
    	$rootScope.currentLanguage = $localStorage.currentLanguage;
    	$rootScope.currentPageDirection = $localStorage.currentPageDirection;


        $rootScope.isNavCollapsed = true;
        $translate.use($rootScope.currentLanguage);

        $rootScope.switchLanguage = function(){
            if($rootScope.currentLanguage == 'en'){
                $rootScope.currentLanguage = 'ar';
                $rootScope.currentPageDirection = 'rtl';
            }else{
                $rootScope.currentLanguage = 'en';
                $rootScope.currentPageDirection = 'ltr';  
            }
            $localStorage.currentLanguage = $rootScope.currentLanguage;
    		$localStorage.currentPageDirection = $rootScope.currentPageDirection;
            $translate.use($rootScope.currentLanguage);
        }
    })

