const projectService = require('./projects-service');
const userService = require('../users/users-service');
const CONSTANTS = require('../fepsApp-BE').constants;
const utils = require('../fepsApp-BE').utils;
const ErrorMessage = require('../fepsApp-BE').ErrorMessage;
const messages = require('../fepsApp-BE').messages;
var Promise = require('promise');
exports.getProjects = function(active){
  return new Promise((resolve, reject)=>{
    projectService.getProjects({}).then((projects)=>{
      resolve(projects);
    },(err)=>{
      reject(err);
    });
  });
};

exports.getProjectsByStatus = function(status){
  return new Promise((resolve, reject)=>{
    projectService.getProjectsByStatus(status).then((projects)=>{
      resolve(projects);
    },(err)=>{
      reject(err);
    });
  });
};

exports.getProjectsByName = function(projectName){
  return new Promise((resolve, reject)=>{
    projectService.getProjectsByName(projectName).then((projects)=>{
      resolve(projects);
    },(err)=>{
      reject(err);
    });
  });
};

exports.createProject = function(projectObj, projectFounder){
  return new Promise((resolve, reject)=>{
    projectService.createProject(projectObj, projectFounder).then((createdProject)=>{
      resolve(createdProject);
    },(err)=>{
      reject(err);
    });
  });
};

exports.deleteProject = function(_id, _rev, user){
  return new Promise((resolve, reject)=>{
    let funcName = "deleteProject";
    if(userService.checkUserGroups(user, [CONSTANTS.groups.super_admin, CONSTANTS.groups.founder])){
      projectService.deleteProject(_id, _rev, user).then((result)=>{
        resolve(result);
      },(err)=>{
        reject(err);
      });
    }else{
      return utils.rejectMessage(ErrorMessage.VALIDATION_ERROR,  messages.errorMessages.unauthorization_error, funcName, reject);
    }
  });
}

exports.updateProject = function(projectObj, projectFounder){
  return new Promise((resolve, reject)=>{
    projectService.updateProjectByFounder(projectObj, projectFounder).then((projectUpdated)=>{
      resolve(projectUpdated);
    },(err)=>{
      reject(err);
    });
  });
}

exports.getProjectById = function(id){
  return new Promise((resolve, reject)=>{
    projectService.getProjectById(id).then((projectResult)=>{
      resolve(projectResult);
    }, (err)=>{
      reject(err);
    });
  });

}

exports.getProjectsByUserId = function(userId){
  return new Promise((resolve, reject)=>{
    projectService.getProjectsByUserId(userId).then((projects)=>{
      resolve(projects);
    }, (err)=>{
      reject(err);
    });
  });
}

exports.updateProjectStatus = function(projectObj,user){
  return new Promise((resolve, reject)=>{
    let funcName = "updateProjectStatus";
    if(userService.checkUserGroups(user, [CONSTANTS.groups.super_admin, CONSTANTS.groups.supervisor_project])){
      projectService.updateProjectStatus(projectObj).then((projectMsg)=>{
        resolve(projectMsg);
      }, (err)=>{
        reject(err);
      });
    }else{
      return utils.rejectMessage(ErrorMessage.VALIDATION_ERROR,  messages.errorMessages.unauthorization_error, funcName, reject);
    }
  });
}


exports.updateProjectFeedback = function(projectObj){
  return new Promise((resolve, reject)=>{
    projectService.updateProjectFeedback(projectObj).then((projectMsg)=>{
      resolve(projectMsg);
    }, (err)=>{
      reject(err);
    });
  });
}

exports.updateIncubationAttachs = function(projectObj, user){
  return new Promise((resolve, reject)=>{
    projectService.updateIncubationAttachs(projectObj, user).then((projectMsg)=>{
      resolve(projectMsg);
    }, (err)=>{
      reject(err);
    });
  });
}
