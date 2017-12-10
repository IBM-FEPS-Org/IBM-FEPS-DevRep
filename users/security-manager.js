const utils = require('../fepsApp-BE').utils;
const usersService = require('./users-service');
const cycleService = require('../cycles/cycle-service');
const messages = require('../fepsApp-BE').messages;
const ErrorMessage = require('../fepsApp-BE').ErrorMessage;
const Message = require('../fepsApp-BE').Message;
var Promise = require('promise');
const CONSTANTS = require('../fepsApp-BE').constants;
exports.getUserByUsername = function(username){
  return new Promise((resolve, reject)=>{
    usersService.getUserByUsername(username).then((user)=>{
      resolve(user);
    },(err)=>{
      reject(err);
    });
  });
};

exports.createUser = function(userObj){
  return new Promise((resolve, reject)=>{
    usersService.createUser(userObj).then((user)=>{
      resolve(user);
    },(err)=>{
      reject(err);
    });
  });
};

exports.updateUser = function(userObj){
  return new Promise((resolve, reject)=>{
    usersService.updateUser(userObj).then((user)=>{
      resolve(user);
    },(err)=>{
      reject(err);
    });
  });
};



exports.deleteUser = function(_id, _rev,user){
  return new Promise((resolve, reject)=>{
    usersService.deleteUserr(_id, _rev,user).then((result)=>{
      resolve(result);
    },(err)=>{
      reject(err);
    });
  });
};

exports.oldDeleteUser = function(_id, _rev){
  return new Promise((resolve, reject)=>{
    usersService.oldDeleteUser(_id, _rev).then((result)=>{
      resolve(result);
    },(err)=>{
      reject(err);
    });
  });
};


exports.getUsersByGroups = function(groups){
	  return new Promise((resolve, reject)=>{
	    usersService.getUsersByGroups(groups).then((result)=>{
	      resolve(result);
	    },(err)=>{
	      reject(err);
	    });
	  });
	};

exports.getUserByUsernameGroup  = function(username, group){
	  return new Promise((resolve, reject)=>{
	    usersService.getUserByUsernameGroup(username, group).then((result)=>{
	      resolve(result);
	    },(err)=>{
	      reject(err);
	    });
	  });
	};

exports.getAllUsers  = function(){
  return new Promise((resolve, reject)=>{
    usersService.getAllUsers().then((result)=>{
    resolve(result);
    },(err)=>{
        reject(err);
      });
    });
};

exports.assignProjectsToMentor = function(userObj){
  return new Promise((resolve, reject)=>{
    const  funcName = 'assignProjectsToMentor';
    cycleService.getCycleByActive(true).then((cycles)=>{
      if(cycles.data && cycles.data[0].currentPhase === CONSTANTS.cycles.revision){
        usersService.assignProjectsToMentor(userObj).then((userUpdated)=>{
          resolve(userUpdated);
        }, (errorMessage)=>{
          reject(errorMessage)
        });
      }else{
          return utils.rejectMessage(ErrorMessage.VALIDATION_ERROR,  messages.errorMessages.cant_assign_project, funcName, reject);
      }
    }, (err)=>{
      return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
    });

  });
};

exports.assignRole = function(userObj){
  return new Promise((resolve, reject)=>{
    usersService.assignRole(userObj).then((userUpdated)=>{
      resolve(userUpdated);
    }, (errorMessage)=>{
      reject(errorMessage)
    });
  });
};
