const eventsService = require('./events-service');
var Promise = require('promise');

exports.createEvent = function(event){
  return new Promise((resolve, reject)=>{
    eventsService.createEvent(event).then((message)=>{
      resolve(message);
    }, (errorMessage)=>{
      resolve(errorMessage);
    });
  });
};

exports.updateEvent = function(event){
  return new Promise((resolve, reject)=>{
    eventsService.updateEvent(event).then((message)=>{
      resolve(message);
    }, (errorMessage)=>{
      resolve(errorMessage);
    });
  });
};

exports.getEventById = function(id){
  return new Promise((resolve, reject)=>{
    eventsService.getEventById(id).then((eventDocumentMsg)=>{
      resolve(eventDocumentMsg);
    }, (err)=>{
      reject(err)
    });
  });
}

exports.deleteEvent = function(id, rev){
  return new Promise((resolve, reject)=>{
    eventsService.deleteEvent(id, rev).then((message)=>{
      resolve(message);
    }, (errorMessage)=>{
      resolve(errorMessage);
    });
  });
};

exports.getAllEvents = function(){
  return new Promise((resolve, reject)=>{
    eventsService.getAllEvents().then((eventsMsg)=>{
      resolve(eventsMsg);
    }, (err)=>{
      reject(err);
    })
  });
}

exports.getEventsByIds = function(ids){
  return new Promise((resolve, reject)=>{
    eventsService.getEventsByIds(ids).then((eventsMsg)=>{
      resolve(eventsMsg);
    }, (err)=>{
      reject(err);
    })
  });
}
exports.enroll = function(userObj, eventId){

  return new Promise((resolve, reject)=>{
    eventsService.enroll(userObj, eventId).then((message)=>{
      resolve(message);
    }, (errorMessage)=>{
      reject(errorMessage);
    });
  });
}


exports.unenroll = function(userId, eventId){
  return new Promise((resolve, reject)=>{
    eventsService.unenroll(userId, eventId).then((message)=>{
      resolve(message);
    }, (errorMessage)=>{
      reject(errorMessage);
    });
  });
}

exports.unenrollAll = function(userId)
{
	  return new Promise((resolve, reject)=>{
	    eventsService.unenrollAll(userId).then((message)=>{
	      resolve(message);
	    }, (errorMessage)=>{
	      reject(errorMessage);
	    });
	  });
}


exports.updateEnrollStatus = function(userId, eventId, status){
  return new Promise((resolve, reject)=>{
    eventsService.updateEnrollStatus(userId, eventId, status).then((message)=>{
      resolve(message);
    }, (errorMessage)=>{
      resolve(errorMessage);
    });
  });
}
