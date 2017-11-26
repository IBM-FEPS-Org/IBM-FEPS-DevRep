const newsModel = require('./news-model');
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

exports.getNews = function(){
  return new Promise(function(resolve,reject){
    const funcName = "getNews";
    var query='';
    pino.debug({fnction : __filename+ ">" + funcName}, "Getting news : ");
    ModelUtil.findByview("newsDoc","news-view").then((news)=>{
    pino.info({fnction : __filename+ ">" + funcName, news : news}, "Getting news : ");

    	let minNews = [];
	    let time = new Date().getTime();
	    for(let i = 0; i < news.rows.length; i++){
	    	minNews.push(news.rows[i].value);
	    }

      let message = new Message(Message.GETTING_DATA, minNews, null);
      resolve(message);
    },(err)=>{
      let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
      pino.error({fnction : __filename+ ">" + funcName, err : err});
      reject(errorMessage);
    });
  });
};

exports.addNews = function(newsObj){
  return new Promise((resolve, reject)=>{
	   const funcName = "addNews";
      pino.debug({fnction : __filename+ ">" + funcName}, "creating news");
      pino.debug({fnction : __filename+ ">" + funcName, news : newsObj});
      newsObj.type = CONSTANTS.documents.type.news;
      ModelUtil.insertDoc(newsObj).then((newsCreated)=>{
        let message = new Message(Message.OBJECT_CREATED, newsCreated, messages.businessMessages.news_creation_success);
        pino.debug({fnction : __filename+ ">" + funcName, news : newsCreated}, "news created successfully");
        resolve(message);
      }, (err)=>{
        let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
        pino.error({fnction : __filename+ ">" + funcName, err : err});
        return reject(err);
      });

  });
};

exports.deleteNews = function(_id, _rev){
  return new Promise((resolve, reject)=>{
    const funcName = "deleteNews";
    pino.debug({fnction : __filename+ ">" + funcName}, "delete news");
    pino.debug({fnction : __filename+ ">" + funcName, _id : _id, _rev : _rev});

    ModelUtil.findById(_id).then((document)=>{
      ModelUtil.deleteDoc(_id, _rev).then((result)=>{

        let message = new Message(Message.OBJECT_REMOVED, result, messages.businessMessages.news_removed_success);
        if(document.imageFile){
          attachementService.removeAttachement(document.imageFile.id, document.imageFile.rev).then((response)=>{
            resolve(message);
          }, (err)=>{
            reject(err)
          });
        }else{
          resolve(message);
        }
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

  //   ModelUtil.deleteDoc(_id, _rev).then((result)=>{
  //
  //     let message = new Message(Message.OBJECT_REMOVED, result, messages.businessMessages.news_removed_success);
  //     return ModelUtil.findById(_id);
  //   },(err)=>{
  //     let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
  //     pino.error({fnction : __filename+ ">" + funcName, err : errorMessage});
  //     reject(errorMessage);
  //   }).then((doc)=>{
  //     return attachementService().then((result)=>{
  //       pino.debug({fnction : __filename+ ">" + funcName, result :result}, "news is removed");
  //       resolve(message);
  //     }, (err)=>{
  //       pino.error({fnction : __filename+ ">" + funcName, err : err});
  //       reject(err);
  //     });
  //   }, (err)=>{
  //     let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
  //     pino.error({fnction : __filename+ ">" + funcName, err : err});
  //     return reject(err);
  //   });
  });
};

exports.updateNews = function(newsObj){
  const funcName = "updateNews";
  return new Promise((resolve, reject)=>{
    ModelUtil.findById(newsObj._id).then((freshNews)=>{
      const oldImage = freshNews.imageFile;
      const newImage = newsObj.imageFile
      freshUser = ObjectUtil.copySameTypeObject(newsObj, freshNews);
      ModelUtil.insertDoc(freshNews).then((newsResult)=>{

        pino.debug({fnction : __filename+ ">" + funcName}, "update news");
        pino.debug({fnction : __filename+ ">" + funcName, data: newsObj});
        if(newImage && oldImage && oldImage.id !== newImage.id){
          attachementService.removeAttachement(oldPic.id, oldPic.rev).then((response)=>{
            let message = new Message(Message.UPDATE_OBJECT, newsResult, messages.businessMessages.news_updated_success);
            resolve(message);
          }, (err)=>{
            reject(err)
          });
        }else{
          let message = new Message(Message.UPDATE_OBJECT, newsResult, messages.businessMessages.news_updated_success);
          resolve(message);
        }

      },(err)=>{
        return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
      });
    }, (err)=>{
      return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
    });

  });
}
