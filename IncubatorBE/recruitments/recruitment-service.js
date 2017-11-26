
var Promise = require('promise');
const pino = require('../fepsApp-BE').pino;
const messages = require('../fepsApp-BE').messages;
const ErrorMessage = require('../fepsApp-BE').ErrorMessage;
const Message = require('../fepsApp-BE').Message;
const ModelUtil = require('../fepsApp-BE').ModelUtil;
const CONSTANTS = require('../fepsApp-BE').constants;
const ObjectUtil = require('../fepsApp-BE').objectUtil;
const attachementService = require('../attachments/attachment-service');
const utils = require('../fepsApp-BE').utils;

exports.getRecruitments = function(){
  return new Promise(function(resolve,reject){
    const funcName = "getRecruitments";
    var query='';
    pino.debug({fnction : __filename+ ">" + funcName}, "Getting recruitments");
    ModelUtil.findByview("recruitmentsDoc","recruitments-view").then((recruitments)=>{
    pino.info({fnction : __filename+ ">" + funcName, recruitments : recruitments}, "Getting recruitments : ");

    	let recruitmentsDocs = [];

	    for(let i = 0; i < recruitments.rows.length; i++){
	    	recruitmentsDocs.push(recruitments.rows[i].value);
	    }

      let message = new Message(Message.GETTING_DATA, recruitmentsDocs, null);
      resolve(message);
    },(err)=>{
      let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
      pino.error({fnction : __filename+ ">" + funcName, err : err});
      reject(errorMessage);
    });
  });
};


exports.addRecruitment = function(recruitmentObj){
  return new Promise((resolve, reject)=>{
	   const funcName = "addRecruitment";
      pino.debug({fnction : __filename+ ">" + funcName}, "creating recruitment");
      pino.debug({fnction : __filename+ ">" + funcName, recruitmentObj : recruitmentObj});
      recruitmentObj.type = CONSTANTS.documents.type.recruitments;
      recruitmentObj.active = false;
      ModelUtil.insertDoc(recruitmentObj).then((recruitmentObjCreated)=>{
        let message = new Message(Message.OBJECT_CREATED, recruitmentObjCreated, messages.businessMessages.recruitment_create_success);
        pino.debug({fnction : __filename+ ">" + funcName, recruitment : recruitmentObjCreated}, "recruitment created successfully");
        resolve(message);
      }, (err)=>{
        let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
        pino.error({fnction : __filename+ ">" + funcName, err : err});
        return reject(err);
      });

  });
};

exports.deleteRecruitment = function(_id){
  return new Promise((resolve, reject)=>{
    const funcName = "deleteRecruitment";
    pino.debug({fnction : __filename+ ">" + funcName}, "deleteRecruitment");
    pino.debug({fnction : __filename+ ">" + funcName, _id : _id});

    ModelUtil.findById(_id).then((document)=>{
      ModelUtil.deleteDoc(_id, document._rev).then((result)=>{

        let message = new Message(Message.OBJECT_REMOVED, result, messages.businessMessages.recruitment_remove_success);

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

exports.updateRecruitment = function(recruitmentObj){
  const funcName = "updaterecruitment";
  return new Promise((resolve, reject)=>{
    ModelUtil.findById(recruitmentObj._id).then((freshRecruitmentObj)=>{

      freshRecruitmentObj = ObjectUtil.copySameTypeObject(recruitmentObj, freshRecruitmentObj);
      ModelUtil.insertDoc(freshRecruitmentObj).then((freshRecruitmentObjResult)=>{

        pino.debug({fnction : __filename+ ">" + funcName}, "update recruitments");
        pino.debug({fnction : __filename+ ">" + funcName, data: freshRecruitmentObjResult});

        let message = new Message(Message.UPDATE_OBJECT, freshRecruitmentObjResult, messages.businessMessages.recruitment_updated_success);
        resolve(message);


      },(err)=>{
        return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
      });
    }, (err)=>{
      return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
    });

  });
}
