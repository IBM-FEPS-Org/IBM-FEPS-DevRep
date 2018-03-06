fepsApp.controller('manageEnrollmentsController', function ($scope, $rootScope, $translate, $uibModalInstance, $localStorage, sharedDataService, $log, userProfileService, $timeout, usSpinnerService,$location,manageEventsService) {

	$scope.event = $uibModalInstance.event;
	$scope.activeTab = $uibModalInstance.tabIndex;
	$scope.rowA = "rowA";
    $scope.rowB = "rowB";
    $scope.enrollmentsToBeDownloaded = [];
    
	$scope.enrollmentsGridOptions = {
            data: $scope.event.value.acceptedEnrollments?$scope.event.value.acceptedEnrollments:[],
            urlSync: false
            
    };
	
	$scope.enrollmentRequestsGridOptions = {
			data: $scope.event.value.pendingEnrollments?$scope.event.value.pendingEnrollments:[],
            urlSync: false
    };
	
	$scope.changeEnrollmentStatus = function(enrollment,index,status)
	{
		usSpinnerService.spin('spinner');
		var userId = enrollment._id;
		manageEventsService.changeEventStatus($scope.event.id,userId,status).then(function (success) {
			$scope.event.value.pendingEnrollments.splice(index,1);
			if(status == 1){
				if(!$scope.event.value.acceptedEnrollments){
					$scope.event.value.acceptedEnrollments = [];
				}
				$scope.event.value.acceptedEnrollments.push(enrollment);
			}else{
				if(!$scope.event.value.rejectedEnrollments){
					$scope.event.value.rejectedEnrollments = [];
				}
				$scope.event.value.rejectedEnrollments.push(enrollment);
			}	
            usSpinnerService.stop('spinner');
        }, function (err) {
            $log.error(err);
            usSpinnerService.stop('spinner');
        })
		

	}
	
	 var convertArrayOfObjectsToCSV = function (args) 
	    {  
	        var result, ctr, keys, columnDelimiter, lineDelimiter, data;

	        data = args.data || null;
	        if (data == null || !data.length) 
	        {
	            return null;
	        }

	        columnDelimiter = ',';
	        lineDelimiter = '\n';

	        keys = Object.keys(data[0]);

	        result = '';
	        result += 'sep=,' + '\r\n';
	        result += 'Name (Arabic), Name(English), Email,Phone,Faculty,University,Graduation Date' + '\r\n'
	        
	        
	        data.forEach(function(item) 
	        {
	            ctr = 0;
	            keys.forEach(function(key) 
	            {
	                if (ctr > 0) result += columnDelimiter;

	                result += item[key];
	                ctr++;
	            });
	            result += lineDelimiter;
	        });

	        return result;
	    }
	   
	 	
	 
	    	 
	    	 
		$scope.download = function ()
		{
			var data, filename, link;
			
			if($scope.event.value.acceptedEnrollments.length > 0)
			{
				for(var i=0;i<$scope.event.value.acceptedEnrollments.length;i++)
				{
					if($scope.event.value.acceptedEnrollments[i].arabicFirstName)
					{
						$scope.enrollmentsToBeDownloaded.push({"Name(Arabic)":$scope.event.value.acceptedEnrollments[i].arabicFirstName+" "+$scope.event.value.acceptedEnrollments[i].arabicSurName,
						"Name(English)":$scope.event.value.acceptedEnrollments[i].firstName+" "+$scope.event.value.acceptedEnrollments[i].surname,
						"Email": $scope.event.value.acceptedEnrollments[i].email,
						"Phone": $scope.event.value.acceptedEnrollments[i].phone,
						"Faculty": $scope.event.value.acceptedEnrollments[i].faculty,
						"University": $scope.event.value.acceptedEnrollments[i].university,
						"Graduation Date": new Date($scope.event.value.acceptedEnrollments[i].graduationYear).toString().split(' ').slice(1, 4).join('/')
						
						});
					}
					else
					{
						$scope.enrollmentsToBeDownloaded.push({"Name(Arabic)":$scope.event.value.acceptedEnrollments[i].firstName+" "+$scope.event.value.acceptedEnrollments[i].surname,
							"Name(English)":$scope.event.value.acceptedEnrollments[i].firstName+" "+$scope.event.value.acceptedEnrollments[i].surname,
							"Email": $scope.event.value.acceptedEnrollments[i].email,
							"Phone": $scope.event.value.acceptedEnrollments[i].phone,
							"Faculty": $scope.event.value.acceptedEnrollments[i].faculty,
							"University": $scope.event.value.acceptedEnrollments[i].university,
							"Graduation Date": new Date($scope.event.value.acceptedEnrollments[i].graduationYear).toString().split(' ').slice(1, 4).join('/')
							
							});
					}
					
				}
			}
			
			
			
			
	        var csv = convertArrayOfObjectsToCSV({
	            data: $scope.enrollmentsToBeDownloaded
	        });
	        if (csv == null) return;


	        filename = $scope.event.value.topic+'.csv';
	        
	        if (!csv.match(/^data:text\/csv/i)) 
	        {
	            csv = 'data:text/csv;charset=utf-8,' + csv;
	        }
	        data = encodeURI(csv);

	        link = document.createElement('a');
	        link.setAttribute('href', data);
	        link.setAttribute('download', filename);
	        link.click();
		}
	
	
});