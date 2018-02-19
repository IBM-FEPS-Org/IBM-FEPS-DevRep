const clinicIssuesService = require('./clinicIssues-service');
var Promise = require('promise');
exports.getclinicIssues = function(){
  return new Promise((resolve, reject)=>{
    clinicIssuesService.getClinicIssues().then((news)=>{
      resolve(news);
    },(err)=>{
      reject(err);
    });
  });
};

exports.addClinicIssue = function(clinicIssueObj, userId){
  return new Promise((resolve, reject)=>{
    clinicIssuesService.addClinicIssue(clinicIssueObj, userId).then((message)=>{
      resolve(message);
    },(err)=>{
      reject(err);
    });
  });
};

exports.deleteClinicIssue = function(_id){
  return new Promise((resolve, reject)=>{
    clinicIssuesService.deleteClinicIssue(_id).then((result)=>{
      resolve(result);
    },(err)=>{
      reject(err);
    });
  });
}

exports.deleteAllClinicIssue = function(userId){
	  return new Promise((resolve, reject)=>{
	    clinicIssuesService.deleteAllClinicIssue(userId).then((result)=>{
	      resolve(result);
	    },(err)=>{
	      reject(err);
	    });
	  });
	}


exports.updateClinicIssue = function(clinicIssueObj){
  return new Promise((resolve, reject)=>{
    clinicIssuesService.updateClinicIssue(clinicIssueObj).then((message)=>{
      resolve(message);
    },(err)=>{
      reject(err);
    });
  });
}

exports.getClinicIssuesByIds = function(ids){
  return new Promise((resolve, reject)=>{
    clinicIssuesService.getClinicIssuesByIds(ids).then((clinicIssueMsg)=>{
      resolve(clinicIssueMsg);
    }, (err)=>{
      reject(err);
    })
  });
}
