const activitiesService = require('./activities-service');
var Promise = require('promise');

exports.createActivity = function(activity)
{
  return new Promise((resolve, reject)=>
  {
	  activitiesService.createActivity(activity).then((message)=>
	  {
	      resolve(message);
	  }, (errorMessage)=>
	  {
	      resolve(errorMessage);
	  });
  });
};

exports.updateActivity = function(activity)
{
  return new Promise((resolve, reject)=>
  {
	activitiesService.updateActivity(activity).then((message)=>
    {
      resolve(message);
    }, (errorMessage)=>
    {
      resolve(errorMessage);
    });
  });
};

exports.getActivityById = function(id)
{
  return new Promise((resolve, reject)=>{
	activitiesService.getActivityById(id).then((eventDocumentMsg)=>
    {
      resolve(eventDocumentMsg);
    }, (err)=>{
      reject(err)
    });
  });
}

exports.deleteActivity = function(id, rev){
  return new Promise((resolve, reject)=>{
	activitiesService.deleteActivity(id, rev).then((message)=>
    {
    	resolve(message);
    }, (errorMessage)=>
    {
    	resolve(errorMessage);
    });
  });
};

exports.getAllActivities = function(){
  return new Promise((resolve, reject)=>{
	activitiesService.getAllActivities().then((eventsMsg)=>
    {
      resolve(eventsMsg);
    }, (err)=>{
      reject(err);
    })
  });
}

exports.getActivitiesByIds = function(ids){
  return new Promise((resolve, reject)=>{
	activitiesService.getActivitiesByIds(ids).then((eventsMsg)=>
	{
      resolve(eventsMsg);
    }, (err)=>{
      reject(err);
    })
  });
}

