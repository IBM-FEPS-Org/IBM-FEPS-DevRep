fepsApp.controller('ManageProjectsController', function ($rootScope, $scope, $translate, $uibModal, $timeout, projectService, $log, $localStorage, usSpinnerService, $location, sharedDataService,userProfileService) {

    $scope.selected2 = true;
    $scope.rowA = "rowA";
    $scope.rowB = "rowB";

    var chartData = [];
    var genderChartData = [];
    var ageChartData = [];
    var facultyData = [];
    $scope.$on("updateProjectList", function (event) {
        _getProjects();
        
        $scope.selectedProjects = [];
        $scope.selectedProjectsArr = [];
    });
    
   
    
    $scope.filterList = [
        /*{
            "id": 1,
            "name": "ID"
        },*/

        {
            "id": 1,
            "name": "Sector"
        },
        {
            "id": 2,
            "name": "Submission Date"
        },
        {
            "id": 3,
            "name": "Age Of Founder"
        },
        {
            "id": 4,
            "name": "Gender Of Founder"
        }
    ];
    
    $scope.init = function () 
    {
    	
        $scope.selectedProjects = [];
        $scope.selectedProjectsArr = [];
        $scope.groupsArray = [];
        $scope.projectStatusArray;
        $scope.currentUser = $localStorage.currentUser;
        $scope.isReviewed = false;
        $scope.selectedFilter = 1;
        $scope.gridOptions = {
            data: [],
            urlSync: false
        };

        $scope.gridActions = {}
        _checkCurrentActiveCycle();
        _checkPermissions();
        if (!$localStorage.sectors)
        {
            sharedDataService.getSectorsLookUp().then(function (response)
            {
                $scope.sectorArray = response.data.data;
                $localStorage.sectors = response.data.data
            }, function (error) {
                $log.error(JSON.stringify(error));
            })
        }
        else
        {
            $scope.sectorArray = $localStorage.sectors;
        }
        _getProjects();
        _getGroupsLookup();
        _getProjectStatusLookup();
        
        var userGroup = $localStorage.currentUser.groups[0].id;
        $scope.isSuperAdmin = false;
        if (userGroup == 1) 
        {
        	$scope.isSuperAdmin = true;
		}
        	
        
        
    }

    $scope.openAssignMentor = function () {

        for (var key in $scope.selectedProjects) {
            if ($scope.selectedProjects.hasOwnProperty(key)) {
                var val = $scope.selectedProjects[key];
                $scope.selectedProjectsArr.push(val);
            }
        }
        if ($scope.selectedProjectsArr.length > 0) {
            var assignMentorsModal = $uibModal.open(
                {
                    ariaDescribedBy: 'assign',
                    templateUrl: 'components/manageProjects/assignMentor/assignMentor.view.html',
                    controller: 'assignMentorController',
                    size: 'md',
                    keyboard: true
                });
            assignMentorsModal.selectedProjects = $scope.selectedProjectsArr;
            return assignMentorsModal;
        } else {
            var NoProjectsSelectedModal = $uibModal.open(
                {
                    ariaDescribedBy: 'assignValidation',
                    template: '<p class="alert alert-success SuccessMsgPopup text-center">Please select at least at project</p>',
                    controller: function ($uibModalInstance) {
                        $timeout(function () {
                            $uibModalInstance.close('close');
                        }, 2000);
                    },
                    size: 'md',
                    keyboard: true
                });
            return NoProjectsSelectedModal;
        }

    }

    $scope.checkAll = function () {
        if ($scope.selectedAll) {
            $scope.selectedAll = false;
        } else {
            $scope.selectedAll = true;
        }
        angular.forEach($scope.gridOptions.data, function (item, $index) {
            item.selected = $scope.selectedAll;
            $scope.getSelectedProjects($index);
        });

    };

    $scope.getSelectedProjects = function (index) 
    {

        if ($scope.gridOptions.data[index].selected == true) {
            $scope.selectedProjects[index] = $scope.gridOptions.data[index];
        } else {
            delete $scope.selectedProjects[index];
        }

        $log.info($scope.selectedProjects);
    }


    $scope.openProfile = function (username) 
    {
        $location.path('fepsIncubator/viewProfile').search({'username':username});
    }

    $scope.openProjectDetails = function (projectId) 
    {
        $location.path('fepsIncubator/addProject').search({'projectId': projectId});
    }

    $scope.openFeedback = function (project) 
    {


        var addFeedbackModal = $uibModal.open(
            {
                ariaDescribedBy: 'feedback',
                templateUrl: 'components/manageProjects/addFeedback/addFeedback.view.html',
                controller: 'addFeedbackController',
                size: 'md',
                keyboard: true
            });

        addFeedbackModal.project = project;
        return addFeedbackModal;

    }

    $scope.getItemNametById = function (array, id)
    {
        if (array && id) {
            return array.filter(function (item) {
                return (item.id === id);
            })[0].name;
        }
        /*else{
           $log.error("getItemNametById::id="+id);
        }*/

    }

    $scope.changeProjectStatus = function (project, status) 
    {
        usSpinnerService.spin('spinner');
        var projectObj = {"_id": project._id, "status": status};

        projectService.changeProjectStatus(projectObj).then(function (success) 
        {
            usSpinnerService.stop('spinner');
            if (success.data.code == 'Object_updated') 
            {
                $scope.$broadcast('updateProjectList');
            } 
            else 
            {
                $scope.errorMessage = true;
                $scope.errorCode = ($rootScope.currentLanguage == 'en') ? success.data.en : success.data.ar;
                $log.error(success);
            }

        }, function (err) {
            usSpinnerService.stop('spinner');
            $scope.errorMessage = true;
            $scope.errorCode = ($rootScope.currentLanguage == 'en') ? success.data.en : success.data.ar;
            $log.error(err);

        });
    }

    var _getProjects = function () 
    {

        //Check if current user is a mentor
        var userID = ($localStorage.currentUser.groups[0].id == 7) ? $localStorage.currentUser._id : -1;


        projectService.getProjects(userID).then(function (success)
        {
            usSpinnerService.spin('spinner');
            if(success.data.data == 0 || success.data.data == null)
            {
                $scope.noProjects = true;
            }
            else
            {
                $scope.noProjects = false;
                $scope.gridOptions.data = success.data.data;
               
                document.getElementById("totalNoOfProjects").innerHTML = "Total No. Of Projects: " + $scope.gridOptions.data.length;
                getProjectsCountPerGender();
                _GenerateDataChart("Sector");
                
                // if (success.data.data == 'no_active_cycle') {
                //     $scope.registeredUser = true;
                //     $scope.currentErrorMessage = $translate.instant('noActiveCycle');
                //
                // } else if (success.data.data == null) {
                //     $scope.registeredUser = true;
                //     $scope.currentErrorMessage = $translate.instant('noProjects');
                // }
                // else {
                //      $scope.gridOptions.data = success.data.data;
                // }
            }

            usSpinnerService.stop('spinner');
        }, function (err) {
            $log.error(err);
            usSpinnerService.stop('spinner');
        })
    }
    
    /*var _getEmails = function() 
    {
    	var promises = [];
    	 for (var i = 0; i < $scope.gridOptions.data.length; i++) 
         {
				for (var j = 0; j < $scope.gridOptions.data[i].members.length; j++) 
				{
					if ($scope.gridOptions.data[i].members[j].email)
					{
						emails.push($scope.gridOptions.data[i].members[j].email);
						
					}
					
					
				}
		}
    	 console.log(emails);
	}*/

    var _getGroupsLookup = function () 
    {

        if (!$localStorage.groups)
        {
            usSpinnerService.spin('spinner');
            sharedDataService.getGroupsLookUp().then(function (response)
            {
                $scope.groupsArray = response.data.groupsArray;
                $localStorage.groups = response.data.groupsArray;
                usSpinnerService.stop('spinner');
            }, function (error) 
            {
                $log.error(JSON.stringify(error));
                usSpinnerService.stop('spinner');
            })
        } 
        else
            $scope.groupsArray = $localStorage.groups;
    }

    var _getProjectStatusLookup = function ()
    {
        if (!$localStorage.projectStatus) 
        {
            usSpinnerService.spin('spinner');
            sharedDataService.getProjectStatusLookup().then(function (response)
            {
                $scope.projectStatusArray = response.data.data;
                $localStorage.projectStatus = response.data.data;
                console.log(response.data.data);
                usSpinnerService.stop('spinner');
            }, function (error) {
                $log.error(JSON.stringify(error));
                usSpinnerService.stop('spinner');
            })
        }
        else
            $scope.projectStatusArray = $localStorage.projectStatus;
    }

    var _checkPermissions = function ()
    {
        switch ($scope.currentUser.groups[0].id) 
        {
            case 1:
            case 4: { //admin and supervisor
                $scope.registeredUser = false;
                $scope.showFeedback = true;
                $scope.showScore = true;
                $scope.showAssignMentor = true;
                $scope.showAcceptReject = true;
                $scope.showSelect = true;
                break;
            }
            case 7: { //mentor
                $scope.registeredUser = false;
                $scope.showFeedback = true;
                $scope.showScore = true;
                $scope.showAssignMentor = false;
                $scope.showAcceptReject = false;
                $scope.showSelect = false;
                break;
            }
            case 2:
            case 3:
            case 5:
            case 8: { //registeredUser
                $scope.registeredUser = true;
                $scope.currentErrorMessage = $translate.instant('notAuthorized');
                $scope.showFeedback = false;
                $scope.showScore = false;
                $scope.showAssignMentor = false;
                $scope.showAcceptReject = false;
                $scope.showSelect = false;
                break;
            }
            default: {
                $scope.registeredUser = false;
                $scope.showFeedback = false;
                $scope.showScore = false;
                $scope.showAssignMentor = false;
                $scope.showAcceptReject = false;
                $scope.showSelect = false;
            }
        }

    }

    var _checkCurrentActiveCycle = function () 
    {
        projectService.getCurrentActiveCycle().then(function (success) {
            $log.info(success);
            if (success.data.data[0].currentPhase === 'Revision')
                $scope.isReviewed = true;

        }, function (err) {
            $log.error(err);
        })

    }

    var _GenerateDataChart = function (selectedFilter) 
    {
    	var xaxis = [];
    	var counts = [];
    	
    	var xaxisTitle = "";
    	var chartType = "";
    	
    	var trace1 = {};
    	var layout = {};
    	if(selectedFilter == "Sector")
    	{
    		xaxisTile = "Project Sector";
    		xaxis = $scope.sectorArray;
    		chartData = [];
    		chartType = 'bar';
    		var index = 0;
    		for (var i = 0; i < xaxis.length; i++) 
        	{
        		if (getProjectsCountPerSector(xaxis[i].id) > 0 ) 
        		{
        			chartData.push({});
        			chartData[index].xaxis = xaxis[i].name;
        			chartData[index].count = getProjectsCountPerSector(xaxis[i].id);
        			index++;
        		}
        		
        		
        		
    		}
        	
        	CHART = document.getElementById('chart');
        	chartData.sort(function(a,b)
    		{
    		  // Turn your strings into dates, and then subtract them
    		  // to get a value that is either negative, positive, or zero.
    		  return b.count - a.count;
    		});

        	xaxis = chartData.map(a => a.xaxis);
        	counts = chartData.map(a => a.count);
        	trace1 = 
        	{
        	  x: xaxis, 
        	  y: counts, 
        	  line: {color: 'rgb(151,32,100)'}, 
        	  marker: {color: 'rgb(23, 21, 71)'},
        	  hoverlabel: {bgcolor: 'rgb(151,32,100)'},
        	  mode: 'lines+markers',
        	  type: chartType,
        	  labels: xaxis,
        	  values: counts
        	};
        	layout =
        	{
        	    	xaxis: { title: xaxisTitle,
        	    		    tickangle:45,
        	    	        tickfont:
    	    	    	        {
    	    	    	            family:'Calibri',
    	    	    	            size: 12,
    	    	    	            color:'rgb(23, 21, 71)'
    	    	    	        },
        	    	        autorange:'true'
        	    			},
        	    	yaxis: { title: 'No. Of Projects',
    		    	        tickfont:
    			    	        {
    			    	            family:'Calibri',
    			    	            size: 12,
    			    	            color:'rgb(23, 21, 71)'
    			    	        },
    		    	        autorange:'true'
        	    	
        	    			},
        	    			autosize: 'true',
        	    		    hovermode: 'closest'
            };
        	
    	}
    	else if (selectedFilter == "Submission Date") 
    	{
    		xaxis = [];
    		chartData = [];
    		xaxisTile = "Submission Date";
    		chartType = 'scatter'
    		for (var i = 0; i < $scope.gridOptions.data.length; i++) 
            {
        		var tempDate = new Date($scope.gridOptions.data[i].submissionDate);
        		tempDate = tempDate.toDateString();
                if (xaxis.indexOf(tempDate) == -1) 
                {
                    xaxis.push(tempDate);
                }
            }
        	for (var i = 0; i < xaxis.length; i++) 
        	{
        		chartData.push({});
        		chartData[i].xaxis = GetFormattedDate(xaxis[i]);
        		chartData[i].count = getProjectsCountPerDate(xaxis[i]);
    		}
        	
        	chartData.sort(function(a,b)
    		{
    		  // Turn your strings into dates, and then subtract them
    		  // to get a value that is either negative, positive, or zero.
    		  return new Date(a.xaxis) - new Date(b.xaxis);
    		});

        	xaxis = chartData.map(a => a.xaxis);
        	counts = chartData.map(a => a.count);
        	trace1 = 
        	{
        	  x: xaxis, 
        	  y: counts, 
        	  line: {color: 'rgb(151,32,100)'}, 
        	  marker: {color: 'rgb(23, 21, 71)'},
        	  hoverlabel: {bgcolor: 'rgb(151,32,100)'},
        	  mode: 'lines+markers',
        	  type: chartType
        	};
        	layout =
        	{
        	    	xaxis: { title: xaxisTitle,
        	    		    tickangle:45,
        	    	        tickfont:
    	    	    	        {
    	    	    	            family:'Calibri',
    	    	    	            size: 12,
    	    	    	            color:'rgb(23, 21, 71)'
    	    	    	        },
        	    	        autorange:'true'
        	    			},
        	    	yaxis: { title: 'No. Of Projects',
    		    	        tickfont:
    			    	        {
    			    	            family:'Calibri',
    			    	            size: 12,
    			    	            color:'rgb(23, 21, 71)'
    			    	        },
    		    	        autorange:'true'
        	    	
        	    			}
            };
		}
    	else if (selectedFilter == "Age Of Founder")
    	{
    		Array.prototype.contains = function(v) {
    		    for(var i = 0; i < this.length; i++) {
    		        if(this[i] === v) return true;
    		    }
    		    return false;
    		};

    		Array.prototype.unique = function() {
    		    var arr = [];
    		    for(var i = 0; i < this.length; i++) {
    		        if(!arr.includes(this[i])) {
    		            arr.push(this[i]);
    		        }
    		    }
    		    return arr; 
    		}
    		xaxis = ageChartData;
    		xaxisTile = "Age of Founder";
    		chartType = 'histogram';
    		chartData = [];
    		var max = xaxis.reduce(function(a, b) 
    		{
    		    return Math.max(a, b);
    		});
    		var min = xaxis.reduce(function(a, b) 
    		{
    		    return Math.min(a, b);
    		});
    		var newXaxis = xaxis.unique();
    		for (var i = 0; i < newXaxis.length; i++) 
    		{
    			chartData.push({});
    			chartData[i].xaxis = newXaxis[i];
        		chartData[i].count = getProjectsCountPerAge(newXaxis[i]);
			}
    		xaxis.sort();
    		
        	trace1 = 
        	{
        	  hoverlabel: {bgcolor: 'rgb(255,255,255)'},
        	  x: xaxis,
        	  autobinx: false, 
        	  autobiny: true,
        	  hoverinfo: 'y',
        	  marker: {color: 'rgb(49, 48, 76)', 
        		    line: {
        		        color: 'rgb(151, 32, 100)', 
        		        width: 1.5
        		      }},
        		       
        	  type: chartType,
        	  xbins: {
        		  end: max-0.5, 
        		  size: 3, 
        		  start: min-0.5
        		  }
        	};
        	layout =
        	{
    		    bargroupgap: 0.14,
    		    xaxis: {
    		        autorange: true, 
    		        type: 'linear',
    		        range: [min,max],
    		        nticks: 15,
    		        dtick: 1,
    		        title: 'Age of Founder Ranges'
    		      }, 
    		    yaxis: {
    		        autorange: true,
    		        
    		        title: 'No. Of Projects'
    		      }
            };
    		
		}
    	else if (selectedFilter == "Gender Of Founder")
    	{
    		xaxis = [];
    		chartData = [];
    		xaxisTile = "Gender of Founder";
    		chartType = 'pie';
    		xaxis = ['Female Founders' , 'Male Founders'];
    		for (var i = 0; i < xaxis.length; i++) 
        	{
        		chartData.push({});
        		chartData[i].xaxis = xaxis[i];
        		if (xaxis[i] == 'Female Founders') 
        		{
        			chartData[i].count = genderChartData[0];
				}
        		else
    			{
        			chartData[i].count = genderChartData[1];
    			}
        		console.log(chartData[i].xaxis);
        		console.log(chartData[i].count);
    		}
    		console.log(chartData);
    		xaxis = chartData.map(a => a.xaxis);
        	counts = chartData.map(a => a.count);
        	trace1 = 
        	{
        	  hoverlabel: {bgcolor: 'rgb(255,255,255)'},
        	  textinfo: 'label+percent',
        	  textposition: 'inside',
        	  textfont: {color: 'rgb(255, 255, 255)'},
        	  type: chartType,
        	  labels: xaxis,
        	  values: counts,
        	  marker: {
        		    colors: ['rgb(151, 32, 100)', 'rgb(23, 21, 71)', 'rgb(65, 182, 196)', 'rgb(44, 127, 184)', 'rgb(8, 104, 172)', 'rgb(37, 52, 148)'], 
        		    line: 
        		    {
        		        color: 'rgb(255, 255, 255)', 
        		        width: 2
        		    }
        		  }
        	};
        	layout =
        	{
    			autosize: 'true',
    		    hovermode: 'closest',
    		    paper_bgcolor: 'rgb(209, 208, 218)'
            };
    		
		}
    	
    	
    	
    	
    	
    	var data = [trace1];
    	
    	(function() {
        	var d3 = Plotly.d3;

        	var WIDTH_IN_PERCENT_OF_PARENT = 100,
        	    HEIGHT_IN_PERCENT_OF_PARENT = 90;
        	console.log( document.getElementById("chart"));
        	var x = document.getElementById("chart").parentElement.nodeName;
        	
        	console.log($("#chart").parent().width());
        	var gd3 = d3.selectAll(".responsive-plot")
        	    .style({
        	        width: 55 + 'vmax',
        	        'margin-left': 2 + '%',

        	        height: HEIGHT_IN_PERCENT_OF_PARENT + 'vh',
        	        'margin-top': (100 - HEIGHT_IN_PERCENT_OF_PARENT) / 2 + 'vh'
        	    });

        	var gd = gd3.node();
        	
        	Plotly.newPlot( gd, { 
        		
        		data: data,
        		layout: layout 
        		
        	});
        	
        	
        	window.onresize = function() 
        	{
        	    Plotly.Plots.resize(gd);
        	};

        	
        })();
		
		

    	
    	
    	
    	
    	
    	
    	
    }
    
    
    var convertArrayOfObjectsToCSV = function (args) 
    {  
        var result, ctr, keys, columnDelimiter, lineDelimiter, data;

        data = args.data || null;
        if (data == null || !data.length) {
            return null;
        }

        columnDelimiter = ',';
        lineDelimiter = '\n';

        keys = Object.keys(data[0]);

        result = '';
        result += 'sep=,' + '\r\n';
        if ($scope.selectedFilter == 1) 
        {
        	result += 'Sector,No Of Projects' + '\r\n';
		}
        else if($scope.selectedFilter == 2)
    	{
        	result += 'Submission Date,No Of Projects' + '\r\n';
    	}
        else if($scope.selectedFilter == 3)
    	{
        	result += 'Age Of Founder,No Of Projects' + '\r\n';
    	}
        else if($scope.selectedFilter == 4)
    	{
        	result += 'Gender Of Founder,No Of Projects' + '\r\n';
    	}
        
        data.forEach(function(item) {
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
        var csv = convertArrayOfObjectsToCSV({
            data: chartData
        });
        if (csv == null) return;

        
        if ($scope.selectedFilter == 1) 
        {
        	filename = 'Data Analysis By Sector.csv';
		}
        else if($scope.selectedFilter == 2)
    	{
        	filename = 'Data Analysis By Submission Date.csv';
    	}
        else if($scope.selectedFilter == 3)
    	{
        	filename = 'Data Analysis By Age of Founder.csv';
    	}
        else if($scope.selectedFilter == 4)
    	{
        	filename = 'Data Analysis By Gender of Founder.csv';
        }

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
	

    
    
    
    
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    	  "Jul", "Augus", "Sep", "Oct", "Nov", "Dec"
    	];
    var GetFormattedDate = function (date) {
        date = new Date(date);
        var month = date.getMonth();
        var day = date.getDate();
        var year = date.getFullYear();
        return day + "-" + monthNames[month] + "-" + year;
    }
    
    var getProjectsCountPerDate = function (date) 
    {
        var count = 0;
        for (var i = 0; i < $scope.gridOptions.data.length; i++) 
        {
        	var tempDate = new Date($scope.gridOptions.data[i].submissionDate);
    		tempDate = tempDate.toDateString();
            if (tempDate == date) 
            {
                count++;
            }
        }
        return count;
    }
    var getProjectsCountPerAge = function (age) 
    {
        var count = 0;
        for (var i = 0; i < ageChartData.length; i++) 
        {
        
            if (ageChartData[i] == age) 
            {
                count++;
            }
        }
        return count;
    }
    
    var getGenderCount = function (group) 
    {
        var count = 0;
        for (var i = 0; i < $scope.gridOptions.data.length; i++) 
        {
            if ($scope.gridOptions.data[i].group == group) {
                count++;
            }
        }
        return count;
    }
    
    var getProjectsCountPerSector = function(sector) 
    {
    	
    
    	var count = 0;
        for (var i = 0; i < $scope.gridOptions.data.length; i++) 
        {
        	/*console.log($scope.gridOptions.data[i].sector);
        	console.log("--");
        	console.log(sector);*/
            if ($scope.gridOptions.data[i].sector == sector) 
            {
                count++;
            }
        }
        return count;
		
	}
    
    var getProjectsCountPerGender = function() 
    {
    	
    	var femaleCount = 0 ;
    	var maleCount = 0 ;
    	var count = 0;
    	genderChartData.push(femaleCount);
    	genderChartData.push(maleCount);
    	userProfileService.getAllUsers().then(function (success) 
    	{
    		for (var i = 0; i < success.data.data.length; i++) 
    		{
    			for (var j = 0; j < $scope.gridOptions.data.length; j++) 
    		    {
    				if ($scope.gridOptions.data[j].members == success.data.data[i].username)
    				{
    					if (success.data.data[i].gender === "f") 
	            		{
    						genderChartData[0] += 1;
    						
    						ageChartData.push(_calculateAge(new Date(success.data.data[i].birthdate)));
    						
	    					break;
	    				}
    					else
						{
    						genderChartData[1] += 1;
    						ageChartData.push(_calculateAge(new Date(success.data.data[i].birthdate)));
    						break;
						}
    					
					}
        			
				}
    		}
    		
    		
        }, function (err) {
            $log.error(err)
        })
       
		
	}
    
    var getProjectsCountPerGender = function() 
    {
    	userProfileService.getAllUsers().then(function (success) 
    	{
    		for (var i = 0; i < success.data.data.length; i++) 
    		{
    			for (var j = 0; j < $scope.gridOptions.data.length; j++) 
    		    {
    				if ($scope.gridOptions.data[j].members == success.data.data[i].username)
    				{
    					facultyData.push({"startup":$scope.gridOptions.data[j].startupName,"faculty":success.data.data[i].faculty,"major":success.data.data[i].major});
    					
					}
        			
				}
    		}
    		
    		
        }, function (err) {
            $log.error(err)
        })
       
		
	}
    
    var _calculateAge = function (birthday) { // birthday is a date
        var ageDifMs = Date.now() - birthday.getTime();
        var ageDate = new Date(ageDifMs); // miliseconds from epoch
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }
    
    $scope.updateFilterBy = function (selectedFilter) 
    {
        $scope.selectedFilter = selectedFilter;
        _GenerateDataChart($scope.filterList[$scope.selectedFilter-1].name);
		
    }
    
    
    
    
});