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

exports.createEvent = function(event){
  return new Promise((resolve, reject)=>{
    const funcName = "createEvent";
    pino.debug({fnction : __filename+ ">" + funcName}, "creating events.");
    event.type = CONSTANTS.documents.type.events;
    ModelUtil.insertDoc(event).then((result)=>{
      let message = new Message(Message.OBJECT_CREATED, result, messages.businessMessages.event_created_succes);
      pino.debug({fnction : __filename+ ">" + funcName, result :result}, "get all accepted projects");
      let attachIds = [];
      if(event.eventPhotoAttach){
        attachIds.push(event.eventPhotoAttach.id);
      }
      if(event.speakers){
        for (var i = 0; i < event.speakers.length && event.speakers[i].profilePic; i++) {
          attachIds.push(event.speakers[i].profilePic.id);
        }
      }

      attachementService.attachAttachments(attachIds, false).then((attachResult)=>{
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

exports.deleteEvent = function(id, rev){
  return new Promise((resolve, reject)=>{
    const funcName = "deleteEvent";
    pino.debug({fnction : __filename+ ">" + funcName}, "remove event.");
    ModelUtil.findById(id).then((freshEvent)=>{
        ModelUtil.deleteDoc(id, freshEvent._rev).then((result)=>{
        let message = new Message(Message.OBJECT_REMOVED, result, messages.businessMessages.event_removed_success);
        pino.debug({fnction : __filename+ ">" + funcName, result :result}, "remove event");
        let attachs = [];
        if(freshEvent.eventPhotoAttach){
          attachs.push(freshEvent.eventPhotoAttach);
        }
        if(freshEvent.speakers){
          for (var i = 0; i < freshEvent.speakers.length; i++) {
            attachs.push(freshEvent.speakers[i].profilePic);
          }
        }
        attachementService.removeAttachements(attachs).then((attachsResult)=>{
          pino.debug({fnction : __filename+ ">" + funcName, result :attachsResult}, "remove attachs");
        }, (err)=>{
          return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
        });

        //TODO
        //Need to handle anything is connected to event
        // for (var i = 0; freshEvent.enrollments && i < freshEvent.enrollments.length; i++) {
        //
        // }
        // freshEvent.enrollments.map((enroll)=>{
        //
        // });
        let ids = [];
        for (var i = 0; freshEvent.acceptedEnrollments && i < freshEvent.acceptedEnrollments.length; i++) {
          ids.push(freshEvent.acceptedEnrollments[i]._id);
        }
        for (var i = 0; freshEvent.pendingEnrollments && i < freshEvent.pendingEnrollments.length; i++) {
          ids.push(freshEvent.pendingEnrollments[i]._id);
        }
        for (var i = 0; freshEvent.rejectedEnrollments && i <  freshEvent.rejectedEnrollments.length; i++) {
          ids.push(freshEvent.rejectedEnrollments[i]._id);
        }
        const query = {
          "_id" : {
            '$in' : ids
          }
        };

        if(ids.length > 0){
            ModelUtil.findByQuery(query).then((users)=>{
              for (var i = 0; i < users.length; i++) {
                let enrolls = ObjectUtil.convertArrayIntoJson(users[i].enrollments, 'eventId');
                delete enrolls[id];
                users[i].enrollments = ObjectUtil.convertJsonIntoArrayValues(enrolls);
              }
              ModelUtil.bulkUpdates(users).then((result)=>{
                resolve(message);
              }, (err)=>{
                return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
              });

            }, (err)=>{
              return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
            })
            }else{
              resolve(message);
          }
      }, (err)=>{
        return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
      });
    }, (err)=>{
      return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
    });

  });
};

exports.getEventById = function(id){
  return new Promise((resolve, reject)=>{
    const funcName = 'getEventById';
    ModelUtil.findById(id).then((eventDocument)=>{
      let message = new Message(Message.GETTING_DATA, eventDocument,'');
      pino.debug({fnction : __filename+ ">" + funcName, result :eventDocument}, "getting data");
      resolve(message);
    }, (err)=>{
      return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
    });
  });
};

exports.getEventsByIds = function(ids){
  return new Promise((resolve, reject)=>{
    const funcName = 'getEventById';
    const query = {
      "_id" : {
        '$in' : ids
      }
    };
    ModelUtil.findByQuery(query).then((eventDocuments)=>{
      let message = new Message(Message.GETTING_DATA, eventDocuments,'');
      pino.debug({fnction : __filename+ ">" + funcName, result :eventDocuments}, "getting data");
      resolve(message);
    }, (err)=>{
      return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
    });
  });
};


exports.getAllEvents = function(){
  return new Promise((resolve, reject)=>{
    let funcName = "getAllEvents";
    ModelUtil.findByview("eventsDoc","events-view").then((eventsDocs)=>{
      let message = new Message(Message.GETTING_DATA, eventsDocs.rows, null);
      resolve(message)
    }, (err)=>{
      return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
    });
  })
};

exports.updateEvent = function(eventObj){
  return new Promise((resolve, reject)=>{
    ModelUtil.findById(eventObj._id).then((freshEvent)=>{
      let attachs = [];
      if(eventObj.eventPhotoAttach && freshEvent.eventPhotoAttach && eventObj.eventPhotoAttach.id != freshEvent.eventPhotoAttach.id){
        attachs.push(freshEvent.eventPhotoAttach);
      }
      let oldAttachs = [];
      for(let i = 0; i < freshEvent.speakers.length; i++){
        oldAttachs.push(freshEvent.speakers[i].profilePic);
      }

      let newAttachs = [];
      for(let i = 0; i < eventObj.speakers.length; i++){
        newAttachs.push(eventObj.speakers[i].profilePic);
      }

      let {newItems, excludedItems} = ObjectUtil.getTwoArraysDifferentiation(freshEvent, eventObj, 'id');

      let promises = [];
      promises.push(attachementService.removeAttachements(excludedItems.concat(attachs)));
      promises.push(attachementService.attachAttachments(newItems, true));
      ModelUtil.insertDoc(eventObj).then((result)=>{
        Promise.all(promises).then((results)=>{
          let message = new Message(Message.UPDATE_OBJECT, results, messages.businessMessages.event_updated_success);
          resolve(message);
        });
      }, (err)=>{
        return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
      });

    }, (err)=>{
      return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
    })
  });
}

exports.enroll = function(userObj, eventId){
return new Promise((resolve, reject)=>{
  const funcName = "enroll";

  let enrollment = {
      eventId : eventId,
      status : CONSTANTS.events.requestStatus.inProgress,
      date : new Date().getTime()
  };

  ModelUtil.findById(userObj._id).then((freshUser)=>{
    if(freshUser.enrollments){
      for (var i = 0; i < freshUser.enrollments.length; i++) {
        if(freshUser.enrollments[i].eventId === eventId){
          const errorMessage = new ErrorMessage(ErrorMessage.ALREADY_ENROLLED, messages.errorMessages.already_enrolled);
          return reject(errorMessage);
        }
      }
    }else{
      freshUser.enrollments  = [];
    }

    freshUser.enrollments.push(enrollment);

    ModelUtil.insertDoc(freshUser).then((updateResult)=>{
      return ModelUtil.findById(eventId);
    }, (err)=>{
      return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
    }).then((freshEvent)=>{

      if(!freshEvent.pendingEnrollments){
        freshEvent.pendingEnrollments = [];
      }

      freshUser.date = new Date().getTime();
      delete freshUser.salt;
      delete freshUser.hash;
      freshEvent.pendingEnrollments.push(freshUser);

      return ModelUtil.insertDoc(freshEvent);
    }, (err)=>{
      return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
    }).then((updateResult)=>{

      const message = new Message(Message.UPDATE_OBJECT, updateResult, messages.businessMessages.enrollment_success);
      resolve(message);

    }, (err)=>{
      return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
    });

  });

});

}

exports.unenroll = function(userId, eventId){
  return new Promise((resolve, reject)=>{
    let freshUser;
    ModelUtil.findById(userId).then((user)=>{
      freshUser = user;
      let enrolls = freshUser.enrollments.filter((enroll)=>{
        if(enroll.eventId !== eventId){
          return true;
        }
        return false;
      });
      freshUser.enrollments = enrolls;
      return ModelUtil.findById(eventId);
    }, (err)=>{
      return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
    }).then((freshEvent)=>{
      let acceptedEnrollments = ObjectUtil.convertArrayIntoJson(freshEvent.acceptedEnrollments, '_id');
      let pendingEnrollments = ObjectUtil.convertArrayIntoJson(freshEvent.pendingEnrollments, '_id');
      // let rejectedEnrollments = ObjectUtil.convertArrayIntoJson(freshEvent.rejectedEnrollments, '_id');
      delete acceptedEnrollments[userId];
      delete pendingEnrollments[userId];
      // delete rejectedEnrollments[userId];
      freshEvent.pendingEnrollments = ObjectUtil.convertJsonIntoArrayValues(pendingEnrollments);
      freshEvent.acceptedEnrollments = ObjectUtil.convertJsonIntoArrayValues(acceptedEnrollments);
      // freshEvent.rejectedEnrollments = ObjectUtil.convertJsonIntoArrayValues(rejectedEnrollments);

      let promises = [];
      promises.push(ModelUtil.insertDoc(freshEvent));
      promises.push(ModelUtil.insertDoc(freshUser));
      Promise.all(promises).then((results)=>{
        let message = new Message(Message.UPDATE_OBJECT, results, messages.businessMessages.event_updated_success);
        resolve(message);
      }, (err)=>{
        return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
      });
    },(err)=>{
      return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
    });
  });
}

exports.updateEnrollStatus = function(userId, eventId, status){
  return new Promise((resolve, reject)=>{

    if(CONSTANTS.events.requestStatus.rejected === status){
      exports.unenroll(userId, eventId).then((message)=>{
        return resolve(message);
      }, (err)=>{
        return reject(err);
      });
    }
    let event;
    ModelUtil.findById(eventId).then((freshEvent)=>{
      event = freshEvent;
      let acceptedEnrollments = ObjectUtil.convertArrayIntoJson(freshEvent.acceptedEnrollments, '_id');
      let pendingEnrollments = ObjectUtil.convertArrayIntoJson(freshEvent.pendingEnrollments, '_id');
      // let rejectedEnrollments = ObjectUtil.convertArrayIntoJson(freshEvent.rejectedEnrollments, '_id');
      let message = new Message(Message.UPDATE_OBJECT, {_id : eventId} ,messages.businessMessages.event_updated_success);
      switch (status) {
        case CONSTANTS.events.requestStatus.accepted:

          if(acceptedEnrollments[userId]){
            // delete rejectedEnrollments[userId];
            delete pendingEnrollments[userId];
            return resolve(message);
          }
          if(!acceptedEnrollments[userId] && pendingEnrollments[userId]){
            acceptedEnrollments[userId] = pendingEnrollments[userId];
            delete pendingEnrollments[userId];
          }

          break;

        case CONSTANTS.events.requestStatus.rejected:
            delete pendingEnrollments[userId];
            delete acceptedEnrollments[userId];

          break;
        case CONSTANTS.events.requestStatus.inProgress:
          if(pendingEnrollments[userId]){
            delete acceptedEnrollments[userId];
            // delete rejectedEnrollments[userId];
            return resolve(message);
          }

          else if(!pendingEnrollments[userId] && acceptedEnrollments[userId]){
            pendingEnrollments[userId] = acceptedEnrollments[userId];
            delete acceptedEnrollments[userId];
          }

          break;
        default:
          return resolve();

      }

      ModelUtil.findById(userId).then((freshUser)=>{
        let emails = freshUser.email;
        let emailData = {
          user : freshUser,
          event : event,
          status : status
        };
        MailUtil.sendEmail(CONSTANTS.mail.event_status, CONSTANTS.mailTemplates.event_status, "Event acceptance", emailData, CONSTANTS.language.en, emails).then((info)=>{
          let message = new Message(Message.EMAIL_SENT, null, messages.businessMessages.email_sent_success);
          pino.info(message);
        }, (err)=>{
          let errorMessage = new ErrorMessage(ErrorMessage.EMAIL_ERROR, err);
          pino.error(errorMessage);
        });
      }, (err)=>{
        console.log(err);
      });


      freshEvent.pendingEnrollments = ObjectUtil.convertJsonIntoArrayValues(pendingEnrollments);
      freshEvent.acceptedEnrollments = ObjectUtil.convertJsonIntoArrayValues(acceptedEnrollments);
      // freshEvent.rejectedEnrollments = ObjectUtil.convertJsonIntoArrayValues(rejectedEnrollments);

      //Update user event status
      ModelUtil.findById(userId).then((freshUser)=>{
        for (var i = 0; i < freshUser.enrollments.length; i++) {

          if(freshUser.enrollments[i].eventId === eventId ){
            freshUser.enrollments[i].status = status;
          }
        }
        ModelUtil.insertDoc(freshUser).then((result)=>{

          ModelUtil.insertDoc(freshEvent).then((eventUpdated)=>{
            message = new Message(Message.UPDATE_OBJECT, eventUpdated ,messages.businessMessages.event_updated_success);
            resolve(message);
          }, (err)=>{
            return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
          });
        }, (err)=>{
          return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
        });
      }, (err)=>{
        return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
      });


    }, (err)=>{
      return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
    })
  });
}
function deattachFiles(freshEvent){
  return new Promise((resolve, reject)=>{
    let attachs = [];
    if(freshEvent.eventPhotoAttach){
      attachs.push(freshEvent.eventPhotoAttach);
    }
    if(freshEvent.speakers){
      for (var i = 0; i < freshEvent.speakers.length; i++) {
        attachs.push(freshEvent.speakers[i].profilePic);
      }
    }
    attachementService.removeAttachements(attachs).then((attachsResult)=>{
      pino.debug({fnction : __filename+ ">" + funcName, result :attachsResult}, "remove attachs");
      resolve(attachsResult);
    }, (err)=>{
      return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
    });
  });
}
