// const newsModel = require('./news-model');
var Promise = require('promise');
const pino = require('../fepsApp-BE').pino;
const messages = require('../fepsApp-BE').messages;
const ErrorMessage = require('../fepsApp-BE').ErrorMessage;
const Message = require('../fepsApp-BE').Message;
const ModelUtil = require('../fepsApp-BE').ModelUtil;
const MailUtil = require('../fepsApp-BE').mailUtil;
const CONSTANTS = require('../fepsApp-BE').constants;
const ObjectUtil = require('../fepsApp-BE').objectUtil;
const attachementService = require('../attachments/attachment-service');
const utils = require('../fepsApp-BE').utils;
const userService = require('../users/users-service');

exports.createActivity = function(activity)
{
  return new Promise((resolve, reject)=>{
    const funcName = "createActivity";
    pino.debug({fnction : __filename+ ">" + funcName}, "creating activities.");
    activity.type = CONSTANTS.documents.type.activities;
    ModelUtil.insertDoc(activity).then((result)=>
    {
      let message = new Message(Message.OBJECT_CREATED, result, messages.businessMessages.activity_created_succes);
      pino.debug({fnction : __filename+ ">" + funcName, result :result}, "activity created");
      let attachIds = [];
    
      if(activity.photos)
      {
        for (var i = 0; i < activity.photos.length; i++) 
        {
        	if (activity.photos[i].id) 
	      	{
        		attachIds.push(activity.photos[i].id);
	      	}
        }
      }

      attachementService.attachAttachments(attachIds, false).then((attachResult)=>
      {
        pino.debug({fnction : __filename+ ">" + funcName, result :result}, "Attachment is attached");
      }, (err)=>{
        return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
      });
   
      resolve(message);
    }, (err)=>{
      return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
    });
  });
};

exports.deleteActivity = function(id, rev)
{
  return new Promise((resolve, reject)=>{
    const funcName = "deleteActivity";
    pino.debug({fnction : __filename+ ">" + funcName}, "remove activity.");
    ModelUtil.findById(id).then((freshActivity)=>
    {
        ModelUtil.deleteDoc(id, rev).then((result)=>
        {
	        let message = new Message(Message.OBJECT_REMOVED, result, messages.businessMessages.activity_removed_success);
	        pino.debug({fnction : __filename+ ">" + funcName, result :result}, "remove activity");
	        let attachs = [];
	        if(freshActivity.photos && freshActivity.photos.length > 0)
	        {
				for (var i = 0; i < freshActivity.photos.length; i++) 
				{
				   attachs.push(freshActivity.photos[i]);
				}
	          	attachementService.removeAttachements(attachs).then((attachsResult)=>
		        {
		          pino.debug({fnction : __filename+ ">" + funcName, result :attachsResult}, "remove attachs");
		          resolve();
		        }, (err)=>{
		          return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
		        });
	        }
	      
	        resolve(message);
	
	        //TODO
	        //Need to handle anything is connected to event
	        // for (var i = 0; freshEvent.enrollments && i < freshEvent.enrollments.length; i++) {
	        //
	        // }
	        // freshEvent.enrollments.map((enroll)=>{
	        //
	        // });
        

        
	      }, (err)=>{
	        return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
	      });
        console.log("hhhh");
        message = new Message(Message.GETTING_DATA, result,'');
        pino.debug({fnction : __filename+ ">" + funcName, result :result}, "getting data");
        resolve(message);
    }, (err)=>{
      return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
    });

  });
};

exports.getActivityById = function(id)
{
  return new Promise((resolve, reject)=>
  {
    const funcName = 'getActivityById';
    ModelUtil.findById(id).then((activityDocument)=>
    {
      let message = new Message(Message.GETTING_DATA, activityDocument,'');
      pino.debug({fnction : __filename+ ">" + funcName, result :activityDocument}, "getting data");
      resolve(message);
    }, (err)=>{
      return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
    });
  });
};

exports.getActivitiesByIds = function(ids)
{
  return new Promise((resolve, reject)=>{
    const funcName = 'getActivitiesByIds';
    const query = {
      "_id" : {
        '$in' : ids
      }
    };
    ModelUtil.findByQuery(query).then((activityDocuments)=>{
      let message = new Message(Message.GETTING_DATA, activityDocuments,'');
      pino.debug({fnction : __filename+ ">" + funcName, result :activityDocuments}, "getting data");
      resolve(message);
    }, (err)=>{
      return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
    });
  });
};


exports.getAllActivities = function(){
  return new Promise((resolve, reject)=>{
    let funcName = "getAllActivities";
    //create activities-view,activitiesDoc
    ModelUtil.findByview("activitiesDoc","activities-view").then((activitiesDocs)=>{
      let message = new Message(Message.GETTING_DATA, activitiesDocs.rows, null);
      resolve(message);
    }, (err)=>{
      return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
    });
  })
};

exports.updateActivity = function(activityObj){
  return new Promise((resolve, reject)=>{
    ModelUtil.findById(activityObj._id).then((freshActivityObj)=>
    {
      let newAttachs = [];
      let oldAttachs = [];
      
      for (var i = 0; i < freshActivityObj.photos.length; i++) 
      {
    	  if(activityObj.photos[i] && freshActivityObj.photos[i] && activityObj.photos[i].id != freshActivityObj.photos[i].id)
    	  {
        	  oldAttachs.push(freshActivityObj.photos[i]);
        	  newAttachs.push(activityObj.photos[i]);
          }
      }
      
    
      let {newItems, excludedItems} = ObjectUtil.getTwoArraysDifferentiation(oldAttachs, newAttachs, 'id');
      
      
      let promises = [];
      
      if(newItems[0] != '')
      {
    	  promises.push(attachementService.removeAttachements(newItems));
      }
      if(excludedItems.length != 0)
      {

    	  promises.push(attachementService.attachAttachments(excludedItems, true));
      }
      
      
      ModelUtil.insertDoc(activityObj).then((result)=>
      {
    	 
    	  if(promises != [])
    	  {
    		  Promise.all(promises).then((results)=>
    		  {
                  let message = new Message(Message.UPDATE_OBJECT, results, messages.businessMessages.activity_updated_success);
                  resolve(message);
              }, (err)=>
              {
    	            reject(err);
    	      });
    	  }
    	  else
    	  {
    		  resolve();
    	  }
    	  
      }, (err)=>{
        return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
      });

    }, (err)=>{
      return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
    })
  });
}


