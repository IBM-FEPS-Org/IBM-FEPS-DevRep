
var Promise = require('promise');
const pino = require('../fepsApp-BE').pino;
const messages = require('../fepsApp-BE').messages;
const ErrorMessage = require('../fepsApp-BE').ErrorMessage;
const Message = require('../fepsApp-BE').Message;
const ModelUtil = require('../fepsApp-BE').ModelUtil;
const CONSTANTS = require('../fepsApp-BE').constants;
const ObjectUtil = require('../fepsApp-BE').objectUtil;
const utils = require('../fepsApp-BE').utils;
const MailUtil = require('../fepsApp-BE').mailUtil;
exports.getClinicIssues = function(){
  return new Promise(function(resolve,reject){
    const funcName = "getClinicIssues";
    var query='';
    pino.debug({fnction : __filename+ ">" + funcName}, "Getting getClinicIssues");
    ModelUtil.findByview("clinicIssueDoc","clinicIssue-view ").then((cinicIssues)=>{
    pino.info({fnction : __filename+ ">" + funcName, cinicIssues : cinicIssues}, "Getting cinicIssues : ");

    	let cinicIssuesDocs = [];

	    for(let i = 0; i < cinicIssues.rows.length; i++){
	    	cinicIssuesDocs.push(cinicIssues.rows[i].value);
	    }

      let message = new Message(Message.GETTING_DATA, cinicIssuesDocs, null);
      resolve(message);
    },(err)=>{
      let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
      pino.error({fnction : __filename+ ">" + funcName, err : err});
      reject(errorMessage);
    });
  });
};


exports.addClinicIssue = function(cinicIssueObj, userId){
  return new Promise((resolve, reject)=>{
	   const funcName = "addCinicIssue";
      pino.debug({fnction : __filename+ ">" + funcName}, "creating cinicIssueObj");
      pino.debug({fnction : __filename+ ">" + funcName, cinicIssueObj : cinicIssueObj});
      cinicIssueObj.type = CONSTANTS.documents.type.clinicIssue;
      cinicIssueObj.active = false;
      ModelUtil.insertDoc(cinicIssueObj).then((cinicIssueObjCreated)=>{
        let message = new Message(Message.OBJECT_CREATED, cinicIssueObjCreated, messages.businessMessages.clinic_issue_create_success);
        pino.debug({fnction : __filename+ ">" + funcName, cinicIssueObjCreated : cinicIssueObjCreated}, "cinicIssueObjCreated created successfully");
        ModelUtil.findById(userId).then((freshUser)=>{
          if(freshUser.clinicIssues){
            freshUser.clinicIssues.push(cinicIssueObjCreated.id);
          }else{
            freshUser.clinicIssues = [cinicIssueObjCreated.id];
          }
          ModelUtil.insertDoc(freshUser).then((userUpdated)=>{
            resolve(message);
          }, (err)=>{
            let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
            pino.error({fnction : __filename+ ">" + funcName, err : err});
            return reject(err);
          });
        }, (err)=>{
          let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
          pino.error({fnction : __filename+ ">" + funcName, err : err});
          return reject(err);
        });

      }, (err)=>{
        let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
        pino.error({fnction : __filename+ ">" + funcName, err : err});
        return reject(err);
      });

  });
};

exports.deleteClinicIssue = function(_id){
  return new Promise((resolve, reject)=>{
    const funcName = "deleteClinicIssue";
    pino.debug({fnction : __filename+ ">" + funcName}, "deleteClinicIssue");
    pino.debug({fnction : __filename+ ">" + funcName, _id : _id});

    ModelUtil.findById(_id).then((document)=>{
      ModelUtil.deleteDoc(_id, document._rev).then((result)=>{
        ModelUtil.findById(document.user._id).then((freshUser)=>{
          let clinicIssues = freshUser.clinicIssues;
          freshUser.clinicIssues = clinicIssues.filter((issueId)=>{
            if(issueId === _id){
              return false;
            }
            return true;
          });

          ModelUtil.insertDoc(freshUser).then((result)=>{
            console.log(result);
          }, (err)=>{
            console.log(err);
          });
        }, (err)=>{
          let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
          pino.error({fnction : __filename+ ">" + funcName, err : errorMessage});
          reject(errorMessage);
        })
        let message = new Message(Message.OBJECT_REMOVED, result, messages.businessMessages.clinic_issue_remove_success);

        resolve(message);

      },(err)=>{
        let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
        pino.error({fnction : __filename+ ">" + funcName, err : errorMessage});
        reject(errorMessage);
      });
    }, (err)=>{
      let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
      pino.error({fnction : __filename+ ">" + funcName, err : errorMessage});
      reject(errorMessage);
    });

  });
};

exports.updateClinicIssue = function(clinicIssueObj){
  const funcName = "updateClinicIssue";
  return new Promise((resolve, reject)=>{
    ModelUtil.findById(clinicIssueObj._id).then((freshClinicIssueObj)=>{

      freshClinicIssueObj = ObjectUtil.copySameTypeObject(clinicIssueObj, freshClinicIssueObj);
      ModelUtil.insertDoc(freshClinicIssueObj).then((freshClinicIssueObjResult)=>{

        pino.debug({fnction : __filename+ ">" + funcName}, "update recruitments");
        pino.debug({fnction : __filename+ ">" + funcName, data: freshClinicIssueObjResult});
        //Check status, if closed, then send email to the issue owner
        
        if(clinicIssueObj.status == 2 || clinicIssueObj.status == "resolved" || clinicIssueObj.status == 'closed'){
          let emailData = {
            issue : clinicIssueObj
          };

          ModelUtil.findById(clinicIssueObj.user._id).then((freshUser)=>{
            let emails = freshUser.email;
            MailUtil.sendEmail(CONSTANTS.mail.clinic_issue, CONSTANTS.mailTemplates.clinic_issue, "Your issue has been resolved", emailData, CONSTANTS.language.en, emails).then((info)=>{
              let message = new Message(Message.EMAIL_SENT, null, messages.businessMessages.email_sent_success);
              pino.info(message);
            }, (err)=>{
              let errorMessage = new ErrorMessage(ErrorMessage.EMAIL_ERROR, err);
              pino.error(errorMessage);
            });
          }, (err)=>{
            console.log(err);
          });

        }



        let message = new Message(Message.UPDATE_OBJECT, freshClinicIssueObjResult, messages.businessMessages.clinic_issue_updated_success);
        resolve(message);


      },(err)=>{
        return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
      });
    }, (err)=>{
      return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
    });

  });
}


exports.getClinicIssuesByIds = function(ids){
  return new Promise((resolve, reject)=>{
    const funcName = 'getClinicIssuesByIds';
    const query = {
      "_id" : {
        '$in' : ids
      }
    };
    ModelUtil.findByQuery(query).then((clinicIssueDocuments)=>{
      let message = new Message(Message.GETTING_DATA, clinicIssueDocuments,'');
      pino.debug({fnction : __filename+ ">" + funcName, result :clinicIssueDocuments}, "getting data");
      resolve(message);
    }, (err)=>{
      return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
    });
  });
};
