const recruitmentService = require('./recruitment-service');
var Promise = require('promise');
exports.getRecruitments = function(){
  return new Promise((resolve, reject)=>{
    recruitmentService.getRecruitments().then((news)=>{
      resolve(news);
    },(err)=>{
      reject(err);
    });
  });
};

exports.addRecruitment = function(recruitmentObj){
  return new Promise((resolve, reject)=>{
    recruitmentService.addRecruitment(recruitmentObj).then((message)=>{
      resolve(message);
    },(err)=>{
      reject(err);
    });
  });
};

exports.deleteRecruitment = function(_id){
  return new Promise((resolve, reject)=>{
    recruitmentService.deleteRecruitment(_id).then((result)=>{
      resolve(result);
    },(err)=>{
      reject(err);
    });
  });
}

exports.updateRecruitment = function(recruitmentObj){
  return new Promise((resolve, reject)=>{
    recruitmentService.updateRecruitment(recruitmentObj).then((message)=>{
      resolve(message);
    },(err)=>{
      reject(err);
    });
  });
}
