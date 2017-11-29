let cache = require('memory-cache');
const projectsModel = require('./projects-model');
var Promise = require('promise');
const pino = require('../fepsApp-BE').pino;
const messages = require('../fepsApp-BE').messages;
const ErrorMessage = require('../fepsApp-BE').ErrorMessage;
const Message = require('../fepsApp-BE').Message;
const validationRules = require('../fepsApp-BE').validationRules;
const CONSTANTS = require('../fepsApp-BE').constants;
const ModelUtil = require('../fepsApp-BE').ModelUtil;
const utils = require('../fepsApp-BE').utils;
const cycleService = require('../cycles/cycle-service');
const attachementService = require('../attachments/attachment-service');
const userService = require('../users/users-service');
const ObjectUtil = require('../fepsApp-BE').objectUtil;
const MailUtil = require('../fepsApp-BE').mailUtil;
exports.getProjects = function(){

    return new Promise(function(resolve,reject) {

        const funcName = "getProjects";
        pino.debug({fnction: __filename + ">" + funcName}, "Getting projects");
        //find cycle by active = true
        cycleService.getCycleByActive(true).then((response)=>{
            //in case no active cycle
            if(!response.data)
                reject('no_active_cycle');
            let currentCycle = response.data[0]._id;

            ModelUtil.findByview("projectsDoc","projects-view").then((projects)=>{
	        	let minProjects = [];
	    	    for(let i = 0; i < projects.rows.length; i++){
	    	    	if(projects.rows[i].value.cycle == currentCycle){
	    	    		minProjects.push(projects.rows[i].value);
	    	    	}
	    	    }
	            let message = new Message(Message.GETTING_DATA, minProjects, "");
	            pino.debug({fnction : __filename+ ">" + funcName, result :projects}, "get all projects in current active cycle");
	            resolve(message);
            }, (err)=>{
              let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
              pino.error({fnction : __filename+ ">" + funcName, err : errorMessage});
              reject(errorMessage);
            });
    }, (err)=>{
          let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
          pino.error({fnction : __filename+ ">" + funcName, err : errorMessage});
          reject(errorMessage);
        });

    })

  };
exports.getProjectsByStatus= function(status){
	return new Promise(function(resolve,reject) {

        const funcName = "getProjectsByStatus";
        cycleService.getCycleByActive(true).then((cycles)=>{
          pino.debug({fnction: __filename + ">" + funcName}, "Getting all accepted projects");

          if(!cycles.data){
            let errorMessage = new ErrorMessage(ErrorMessage.VALIDATION_ERROR, messages.errorMessages.no_active_cycle);
            return reject(errorMessage);
          }else if(cycles.data.length > 0 && cycles.data[0].currentPhase !== CONSTANTS.cycles.incubation){
            let message = new Message(Message.GETTING_DATA, [], messages.errorMessages.cycleـnotـincuabtion);
            pino.debug({fnction : __filename+ ">" + funcName, result :message}, "get all accepted projects");
            return resolve(message);
          }

           let query = {
              type: CONSTANTS.documents.type.projects,
              status: status,
              cycle : cycles.data[0]._id
            };

          //find project by status
          ModelUtil.findByQuery(query).then((projects)=>{
                let message = new Message(Message.GETTING_DATA, projects, "");
                pino.debug({fnction : __filename+ ">" + funcName, result :projects}, "get all accepted projects");
                resolve(message);
          }, (err)=>{
                let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
                pino.error({fnction : __filename+ ">" + funcName, err : errorMessage});
                reject(errorMessage);
          });
        }, (err)=>{
          return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
        });


    }, (err)=>{
          let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
          pino.error({fnction : __filename+ ">" + funcName, err : errorMessage});
          reject(errorMessage);
        });
};


exports.getProjectsByName = function(projectName){
  return new Promise((resolve, reject)=>{
    const funcName = "getProjectsByName";
    let query = {
      startupName : projectName,
      type : CONSTANTS.documents.type.projects
    };
    ModelUtil.findByQuery(query).then((projects)=>{
      let message = new Message(Message.GETTING_DATA, projects, "");
      pino.debug({fnction : __filename+ ">" + funcName, result :projects}, "get projects by name");
      resolve(message);
    }, (err)=>{
      let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
      pino.error({fnction : __filename+ ">" + funcName, err : errorMessage});
      reject(errorMessage);
    })
  });
}


exports.createProject = function(projectObj, projectFounder){
  return new Promise((resolve, reject)=>{
	   const funcName = "createProject";
      pino.debug({fnction : __filename+ ">" + funcName}, "creating project");
      pino.debug({fnction : __filename+ ">" + funcName, project : projectObj});
      const currentDate = new Date().getTime();
      let cycleQuery = {
        type : CONSTANTS.documents.type.cycles,
        active : true
      };

      //Validate Cycle is active and in admission phase.
      ModelUtil.findOneByQuery(cycleQuery).then((cycle)=>{
        if(cycle){
          if(cycle.active != true){
            let errorMessage = new ErrorMessage(ErrorMessage.VALIDATION_ERROR, messages.errorMessages.no_active_cycle);
            return reject(errorMessage);
          }else if(cycle.currentPhase !== CONSTANTS.cycles.admission){
            let errorMessage = new ErrorMessage(ErrorMessage.VALIDATION_ERROR, messages.errorMessages.no_admission_cycle);
            return reject(errorMessage);
          }

          //Validate project has only 5 members, you can change in constants.json

          let memberCheck = !projectObj.members;
          if( memberCheck || projectObj.members.length > validationRules.project.members.max || projectObj.members.length < validationRules.project.members.min){
            let errorMessage = new ErrorMessage(ErrorMessage.VALIDATION_ERROR, messages.errorMessages.over_project_member);
            return reject(errorMessage);
          }

          //validate that members and owners has no prvious projects
          let getMemberPromises = [];
          for(let i = 0; projectObj.members && i < projectObj.members.length; i++){
            //it's cheap and I think faster since they are 5 members, to get user by id instead of getting all of them at once
            getMemberPromises.push(ModelUtil.findById(projectObj.members[i]._id));
          }

          getMemberPromises.push(ModelUtil.findById(projectFounder._id));

          Promise.all(getMemberPromises).then((members)=>{
            let invlovedUsers = [];

            for(let i = 0, total = members.length; i < total; i++){
              //If a suer has a project, then an error arises
              if(members[i].projects && members[i].projects.length > 0 && members[i].projects.cycle === cycle._id){
                let errorMessage = new ErrorMessage(ErrorMessage.VALIDATION_ERROR, messages.errorMessages.member_has_project);
                return reject(errorMessage);
              }
            }
            //Create project
            projectObj.type = CONSTANTS.documents.type.projects;
            projectObj.cycle = cycle._id;
            projectObj.status = CONSTANTS.projects.status.Initial;
            ModelUtil.insertDoc(projectObj).then((projectCreated)=>{

              pino.debug({fnction : __filename+ ">" + funcName, project : projectCreated}, "project created successfully");
              //Update users with the users
              let project = {
                _id: projectCreated.id,
                startupName : projectObj.startupName,
                role : CONSTANTS.projects.roles.member,
                cycle : cycle._id
              };
              for(let i = 0, total = members.length; i < total; i++){
                if(members[i]._id === projectFounder._id){
                  members[i].projects = [{
                    _id: projectCreated.id,
                    startupName : projectObj.startupName,
                    role : CONSTANTS.projects.roles.founder,
                    cycle : cycle._id
                  }];
                  members[i].groups = [{"id" : 6, "name" : CONSTANTS.groups.founder}];
                }else{
                  members[i].projects = [{
                      _id: projectCreated.id,
                      startupName : projectObj.startupName,
                      role : projectObj.members[i].role,
                      cycle : cycle._id
                    }];
                  //members[i].groups = [{"id" : 9, "name" :CONSTANTS.groups.member}];
                  if(projectObj.members[i].role == "Co-Founder")
                	  {
                	  	members[i].groups = [{"id" : 10, "name" : projectObj.members[i].role}];
                	  }
                  else if(projectObj.members[i].role == "Member")
		        	  {
		        	  	members[i].groups = [{"id" : 9, "name" :CONSTANTS.groups.member}];
		        	  }
                  
                }
              }
              ModelUtil.bulkUpdates(members).then(()=>{
                pino.debug({fnction : __filename+ ">" + funcName, project : projectCreated}, "project members updated successfully with data");

                markProjectAttachmentsAttached(projectObj).then(()=>{
                  let message = new Message(Message.OBJECT_CREATED, projectCreated, messages.businessMessages.project_creation_success);
                  resolve(message);
                }, (err)=>{
                  return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
                })

              }, (err)=>{
                let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
                return reject(errorMessage);
              });
            }, (err)=>{
              let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
              pino.error({fnction : __filename+ ">" + funcName, err : err});
              return reject(err);
            });

          }, (err)=>{
            reject(err);
          });
        }else{
          let errorMessage = new ErrorMessage(ErrorMessage.VALIDATION_ERROR, messages.errorMessages.no_current_cycle);
          return reject(errorMessage);
        }
      });
  });
};


exports.deleteProject = function(_id,_rev, user){
  return new Promise((resolve, reject)=>{
    const funcName = "deleteProject";

    pino.debug({fnction : __filename+ ">" + funcName}, "delete project");
    pino.debug({fnction : __filename+ ">" + funcName, _id : _id, _rev : _rev});
    // Make sure the user is the founder of the project
    ModelUtil.findById(_id).then((freshProject)=>{

      ModelUtil.findById(freshProject.cycle).then((cycle)=>{

      let groups = utils.getGroups(user);
      if(groups.includes(CONSTANTS.groups.founder)  && cycle.currentPhase !== CONSTANTS.cycles.admission){
        let errorMessage = new ErrorMessage(ErrorMessage.VALIDATION_ERROR, messages.errorMessages.update_project_after_admission);
        return reject(errorMessage);
      }
/*
      if( groups.includes(CONSTANTS.groups.super_admin) && (cycle.currentPhase !== CONSTANTS.cycles.revision || cycle.currentPhase !== CONSTANTS.cycles.admission)){
    	  console.log("rejected");
    	    let errorMessage = new ErrorMessage(ErrorMessage.VALIDATION_ERROR, messages.errorMessages.update_project_after_admission);
        return reject(errorMessage);
      }*/

      for (var i = 0; i < freshProject.members.length; i++) {
        //Only owner founder and super admin can delete project
        if(groups.includes(CONSTANTS.groups.super_admin) || freshProject.members[i]._id === user._id){
          return deleteProjectDataInMemebers(_id, user).then(()=>{
            return ModelUtil.findById(_id).then((freshProject)=>{
              ModelUtil.deleteDoc(_id, _rev).then((result)=>{
                //remove project attachments
                removeProjectAttachments(null, freshProject).then((result)=>{
                  let message = new Message(Message.OBJECT_REMOVED, result, messages.businessMessages.project_removed_success);
                  pino.debug({fnction : __filename+ ">" + funcName, result :result}, "project is removed");
                  resolve(message);
                  pino.debug({fnction : __filename+ ">" + funcName}, "project attachments removed successfully");
                }, (err)=>{
                  pino.error({fnction : __filename+ ">" + funcName}, err);
                  reject(err);
                });
            },(err)=>{
              let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
              pino.error({fnction : __filename+ ">" + funcName, err : errorMessage});
              reject(errorMessage);
            });
            }, (err)=>{
              return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
            });
          }, (err)=>{
            let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
            pino.error({fnction : __filename+ ">" + funcName, err : errorMessage});
            reject(errorMessage);
          });

        }

      }
      return utils.rejectMessage(ErrorMessage.VALIDATION_ERROR,  messages.errorMessages.unauthorization_error, funcName, reject);
    }, (err)=>{
      return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
    });

  }, (err)=>{
    reject(err)
  });
  });
};

exports.updateProjectByFounder = function(projectObj, projectFounder){
  return new Promise((resolve, reject)=>{
	   const funcName = "updateProjectByFounder";
      pino.debug({fnction : __filename+ ">" + funcName}, "creating project");
      pino.debug({fnction : __filename+ ">" + funcName, project : projectObj});
      const currentDate = new Date().getTime();
      let cycleQuery = {
        type : CONSTANTS.documents.type.cycles,
        active : true
      };

      //Validate Cycle is active and in admission phase.
      ModelUtil.findOneByQuery(cycleQuery).then((cycle)=>{
        if(cycle){
          if(cycle.active != true){
            return utils.rejectMessage(ErrorMessage.VALIDATION_ERROR,  messages.errorMessages.no_active_cycle, funcName, reject);
          }else if(cycle.currentPhase !== CONSTANTS.cycles.admission){
            return utils.rejectMessage(ErrorMessage.VALIDATION_ERROR,  messages.errorMessages.no_admission_cycle, funcName, reject);
          }

          //Validate project has only 5 members, you can change in constants.json

          let memberCheck = !projectObj.members;
          if( memberCheck || projectObj.members.length > validationRules.project.members.max || projectObj.members.length < validationRules.project.members.min){
            return utils.rejectMessage(ErrorMessage.VALIDATION_ERROR,  messages.errorMessages.over_project_member, funcName, reject);
          }

          ModelUtil.findById(projectObj._id).then((freshProject)=>{
            //get excluded memebers by comparing the projectObj from client and freshProject from databse
            let newMembers = [];
            let exisitingMembers = [];
            let excludedMembers = [];
            let jTotal = freshProject.members.length, iTotal = projectObj.members.length;

            for(let i = 0 ; i < iTotal; i++ ){
              let j = 0, isNewMember = true;
              for( ; j < jTotal; j++){
                if(projectObj.members[i]._id === freshProject.members[j]._id){
                  isNewMember = false;
                  exisitingMembers.push(projectObj.members[i]._id);
                  break;
                }
              }
              if(isNewMember){
                newMembers.push(projectObj.members[i]);
              }
            }

            //Get excluded members
            jTotal = projectObj.members.length, iTotal = freshProject.members.length;
            for(let i = 0; i < iTotal; i++ ){
              let j = 0, isExcludedMember = true;
              for( ; j < jTotal; j++){
                if(freshProject.members[i]._id === projectObj.members[j]._id){
                  isExcludedMember = false;
                  break;
                }
              }
              if(isExcludedMember){
                excludedMembers.push(freshProject.members[i]);
              }
            }

            //check excludedMembers to remove the relate project data from them

            ModelUtil.findDocsByFieldFromArray(newMembers, '_id').then((freshNewMembers)=>{
              //If a suer has a project, then an error arises
              for(let i = 0, total = freshNewMembers.length; i < total; i++){
                if(freshNewMembers[i].projects && freshNewMembers[i].projects.length > 0 && cycle._id === freshNewMembers[i].projects[0].cycle ){
                  let errorMessage = new ErrorMessage(ErrorMessage.VALIDATION_ERROR, messages.errorMessages.member_has_project);
                  return reject(errorMessage);
                }
              }

              let projectUpdated;
              ModelUtil.updateDoc(projectObj).then((updatedProject)=>{
                projectUpdated = updatedProject;
                removeProjectAttachments(projectObj, freshProject).then((result)=>{
                  pino.debug({fnction : __filename+ ">" + funcName}, "project attachments removed successfully");
                }, (err)=>{
                  pino.error({fnction : __filename+ ">" + funcName}, err);
                });

                //detatach the excluded members

                return removeProjectFromUsers(excludedMembers);
              }, (err)=>{
                return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
              }).then(()=>{
                //members are excluded
                //Add the new members
                return attachProjectToMembers(freshNewMembers, projectObj, projectFounder, cycle);
              }, (err)=>{
                reject(err);
              }).then(()=>{
                //new members has the updated project data
                let message;

                //make the attach = true in the attachments
                markProjectAttachmentsAttached(projectObj).then(()=>{
                  let message = new Message(Message.OBJECT_CREATED, projectUpdated, messages.businessMessages.project_updated_success);
                  resolve(message);
                }, (err)=>{
                  return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
                })

              }, (err)=>{
                reject(err);
              });
              }, (err)=>{
                return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
              });

          }, (err)=>{
            return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
          });
        }else{
          let errorMessage = new ErrorMessage(ErrorMessage.VALIDATION_ERROR, messages.errorMessages.no_update_project);
          return reject(errorMessage);
        }
      });
  });
};

function removeProjectAttachments(projectObj, freshProject){
  return new Promise((resolve, reject)=>{
    const funcName = "removeProjectAttachments";
    let promises = [];
    //remove old attachments
    // in case remove old attachments without adding
    if( (!projectObj) && (freshProject.afiliationAttachment && freshProject.afiliationAttachment.id)){
      promises.push(attachementService.removeAttachement(freshProject.afiliationAttachment.id, freshProject.afiliationAttachment.rev));
    }
    //replace old attachments, checking projectObj to avoid null pointer
    else if( (!projectObj) && projectObj.afiliationAttachment && freshProject.afiliationAttachment && projectObj.afiliationAttachment.id !== freshProject.afiliationAttachment.id){
      promises.push(attachementService.removeAttachement(freshProject.afiliationAttachment.id, freshProject.afiliationAttachment.rev));
    }

    // in case remove old attachments without adding
    if( (!projectObj) && (freshProject.prototypeAttachment && freshProject.prototypeAttachment.id)){
      promises.push(attachementService.removeAttachement(freshProject.prototypeAttachment.id, freshProject.prototypeAttachment.rev));
    }
    //replace old attachments, checking projectObj to avoid null pointer
    else if(projectObj && projectObj.prototypeAttachment && freshProject && freshProject.prototypeAttachment && projectObj.prototypeAttachment.id !== freshProject.prototypeAttachment.id){
      promises.push(attachementService.removeAttachement(freshProject.prototypeAttachment.id, freshProject.prototypeAttachment.rev));
    }

    Promise.all(promises).then((results)=>{
      resolve(results);
    }, (err)=>{
      reject(err);
    });
  });
}

exports.getMemberProjects = function(_id){
  return Promise((resolve, reject)=>{
    const funcName = "getMemberProjects";
    let query = {
      type : CONSTANTS.documents.type.projects,
      "members" :  {
        "$elemMatch": { "_id":  id}
      }
    };

    ModelUtil.findByQuery(query).then((projects)=>{
      let message = new Message(Message.GETTING_DATA, projects, "");
      pino.debug({fnction : __filename+ ">" + funcName, result :projects}, "get projects by member id");
      resolve(message);
    }, (err)=>{
      let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
      pino.error({fnction : __filename+ ">" + funcName, err : errorMessage});
      reject(errorMessage);
    });
  });
}

exports.getProjectsByUserId = function(userId){
  return new Promise((resolve, reject)=>{
    let funcName = "getProjectsByUserId";
    cycleService.getCycleByActive(true).then((cycle)=>{
      if(!cycle.data){
        return utils.rejectMessage(ErrorMessage.VALIDATION_ERROR,  messages.errorMessages.no_active_cycle, funcName, reject);
      }

      let projectIds = [];
      ModelUtil.findById(userId).then((freshUser)=>{
        for (var i = 0; freshUser.projects && i < freshUser.projects.length; i++) {
          if(freshUser.projects[i].cycle === cycle.data[0]._id){
            projectIds.push(freshUser.projects[i]._id);
          }
        }
        let query = {
          "_id" : {
            "$in": projectIds
          }
        };
        if(projectIds.length > 0){
           ModelUtil.findByQuery(query).then((projects)=>{
              let message = new Message(Message.GETTING_DATA, projects, "");
            resolve(message);
            }, (err)=>{
              return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
            });
          }
        else
          resolve();
      }, (err)=>{
        return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
      });

  }, (err)=>{
    reject(err);
  })
  });
}

exports.getProjectById = function(id){
  return new Promise((resolve, reject)=>{
    const funcName = "getProjectById";
    ModelUtil.findById(id).then((project)=>{
      let message = new Message(Message.GETTING_DATA, project, "");
      pino.debug({fnction : __filename+ ">" + funcName, result :project}, "getting project by id");
      resolve(message);
    }, (err)=>{
      let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
      pino.error({fnction : __filename+ ">" + funcName, err : errorMessage});
      reject(errorMessage);
    });
  });
};

exports.updateProjectStatus = function(projectObj){
  return new Promise((resolve, reject)=>{
    let myFreshProject;
    ModelUtil.findById(projectObj._id).then((freshProject)=>{
      myFreshProject = freshProject;
      freshProject.status = projectObj.status;
      return ModelUtil.insertDoc(freshProject);
    }, (err)=>{
      return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
    }).then((updatedProject)=>{
      let message = new Message(Message.UPDATE_OBJECT, updatedProject, "");
      let emailData = {"project" : myFreshProject};
      //Notify superadmin
      const superadmins = cache.get(CONSTANTS.groups.super_admin);
      let emails;
      emails = ObjectUtil.getArrayValuesFromJsons(superadmins, 'email').toString();
      MailUtil.sendEmail(CONSTANTS.mail.project_status, CONSTANTS.mailTemplates.project_status, "Project status has been changed", emailData, CONSTANTS.language.en, emails).then((info)=>{
        let message = new Message(Message.EMAIL_SENT, null, messages.businessMessages.email_sent_success);
        pino.info(message);
      }, (err)=>{
        let errorMessage = new ErrorMessage(ErrorMessage.EMAIL_ERROR, err);
        pino.error(errorMessage);
      });
      resolve(message);
    }, (err)=>{
      return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
    });
  });

}


exports.updateProjectFeedback = function(projectObj){
  return new Promise((resolve, reject)=>{
    let myFreshProject;
    ModelUtil.findById(projectObj._id).then((freshProject)=>{
      myFreshProject = freshProject;
      freshProject.feedback = projectObj.feedback;
      freshProject.score = projectObj.score;
      freshProject.comment = projectObj.comment;
      return ModelUtil.insertDoc(freshProject);
    }, (err)=>{
      return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
    }).then((updatedProject)=>{
      let message = new Message(Message.UPDATE_OBJECT, updatedProject, "");
      let emailData = {"project" : myFreshProject};
      //Notify superadmin
      const superadmins = cache.get(CONSTANTS.groups.super_admin);
      let emails;
      emails = ObjectUtil.getArrayValuesFromJsons(superadmins, 'email').toString();
      MailUtil.sendEmail(CONSTANTS.mail.feedback_score, CONSTANTS.mailTemplates.feedback_score, "Feedback and score is added to project " + myFreshProject.startupName, emailData, CONSTANTS.language.en, emails).then((info)=>{
        let message = new Message(Message.EMAIL_SENT, null, messages.businessMessages.email_sent_success);
        pino.info(message);
      }, (err)=>{
        let errorMessage = new ErrorMessage(ErrorMessage.EMAIL_ERROR, err);
        pino.error(errorMessage);
      });
      resolve(message);
    }, (err)=>{
      return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
    });
  });

}


exports.updateIncubationAttachs = function(projectObj, user){
  return new Promise((resolve, reject)=>{
    const funcName = 'updateIncubationAttachs';
    ModelUtil.findById(projectObj._id).then((freshProject)=>{
      for (var i = 0, total = freshProject.members.length; i < total; i++) {
        if (freshProject.members[i]._id === user._id && userService.checkUserGroup(user, CONSTANTS.groups.founder)) {
          const {newItems, existingItems, excludedItems} = ObjectUtil.getTwoArraysDifferentiation(projectObj.incubationAttachments, freshProject.incubationAttachments, 'id');
          freshProject.incubationAttachments = projectObj.incubationAttachments;
          return ModelUtil.insertDoc(freshProject).then((updatedProject)=>{

            let promises = [attachementService.removeAttachements(excludedItems)];
            promises.push(attachementService.attachAttachments(newItems, true));
            Promise.all(promises).then((result)=>{
              let message = new Message(Message.UPDATE_OBJECT, updatedProject, "");
              resolve(message);
            }, (err)=>{
              reject(err);
            });
            resolve(message);
          }, (err)=>{
            return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
          });
        }
      }

      return utils.rejectMessage(ErrorMessage.UNAUTHORIZATION_ERROR,  errorMessage, funcName, reject);
    }, (err)=>{
      return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
    })
  });

}


//delete any project data in the specified users
function removeProjectFromUsers(users){
  return new Promise((resolve, reject)=>{
    const funcName = 'removeProjectFromUsers';
    if(users.length === 0){
      resolve();
    }
    ModelUtil.findDocsByFieldFromArray(users, '_id').then((members)=>{
      for(let i = 0, total = members.length; i < total; i++){
        members[i].groups = [{"id":8, "name" : CONSTANTS.groups.registered_user}];
        delete members[i].projects;
      }
      ModelUtil.bulkUpdates(members).then(()=>{
        resolve();
      }, (err)=>{
        return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
      })
    });
  });
}

function attachProjectToMembers(members, projectObj, projectFounder, cycle){
  return new Promise((resolve, reject)=>{
    const funcName = "attachProjectToMembers";
    if(members && members.length === 0){
      resolve();
    }
    pino.debug({fnction : __filename+ ">" + funcName, project : projectObj}, "project created successfully");
    //Update users with the users
    /*let project = {
      _id: projectObj._id,
      startupName : projectObj.startupName,
      role : CONSTANTS.projects.roles.member,
      cycle: cycle._id
    };*/
    for(let i = 0, total = members.length; i < total; i++){
      if(members[i]._id === projectFounder._id){
        members[i].projects = [{
          _id: projectObj._id,
          startupName : projectObj.startupName,
          role : CONSTANTS.projects.roles.founder,
          cycle: cycle._id
        }];
        members[i].groups = [{"id" : 6, "name" : CONSTANTS.groups.founder}];
      }
      else{
        members[i].projects = [{
            _id: projectObj._id,
            startupName : projectObj.startupName,
            role : members[i].role,
            cycle: cycle._id
          }];
        if(members[i].role == CONSTANTS.projects.roles.member)
        	{
        		members[i].groups = [{"id" : 9, "name" :members[i].role}];
        	}
        else if(members[i].role == CONSTANTS.projects.roles.cofounder)
	    	{
	    		members[i].groups = [{"id" : 10, "name" :members[i].role}];
	    	}
        
      }
    }
    ModelUtil.bulkUpdates(members).then(()=>{
      pino.debug({fnction : __filename+ ">" + funcName}, "Project data removed from it's members");
      resolve();
    }, (err)=>{
      let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
      return reject(errorMessage);
    });

  })
}

function markProjectAttachmentsAttached(projectObj){
  return new Promise((resolve, reject)=>{
    let attachments = [];
    if( projectObj.afiliationAttachment){
      attachments.push(projectObj.afiliationAttachment);
    }

    if( projectObj.prototypeAttachment){
      attachments.push(projectObj.prototypeAttachment);
    }

    if(attachments.length > 0){
        attachementService.attachAttachments(attachments, true).then(()=>{
          resolve();
        }, (err)=>{
          reject(err);
        });
    }else{
      resolve();
    }
  });
}


//Delete project data in all members
const deleteProjectDataInMemebers = function(projectId, user){
  return new Promise((resolve, reject)=>{
    let funcName = "deleteProjectDataInMemebers";
    //FIXME, validation should be activated
    // let groups = utils.getGroups(user);
    //
    //   if(groups.includes(CONSTANTS.groups.founder) && cycle.currentPhase !== CONSTANTS.cycles.admission){
    //     let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, messages.errorMessages.update_project_after_admission);
    //     reject(errorMessage);
    //   }
    //
    //   if( cycle.currentPhase !== CONSTANTS.cycles.revision && !groups.includes(CONSTANTS.groups.supervisor_event) || !groups.includes(CONSTANTS.groups.supervisor_clinic) || !groups.includes(CONSTANTS.groups.supervisor_project)){
    //     let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, messages.errorMessages.update_project_after_admission);
    //     reject(errorMessage);
    //   }
      ModelUtil.findById(projectId).then((project)=>{

        //validate that members and owners has no prvious projects
        let getMemberPromises = [];
        for(let i = 0; project.members && i < project.members.length; i++){
          //it's cheap and I think faster since they are 5 members, to get user by id instead of getting all of them at once
          getMemberPromises.push(ModelUtil.findById(project.members[i]._id));
        }


        Promise.all(getMemberPromises).then((members)=>{
          let exisitingMembers = [];
          for(let i = 0, total = members.length; i < total; i++){
            if(members[i]){
              delete members[i].projects;
              members[i].groups = [{"id":8, "name" : CONSTANTS.groups.registered_user}];
              exisitingMembers.push(members[i]);
            }
          }
        ModelUtil.bulkUpdates(exisitingMembers).then(()=>{
          pino.debug({fnction : __filename+ ">" + funcName}, "Project data removed from it's members");
          resolve();
        }, (err)=>{
          let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
          return reject(errorMessage);
        });
      },(err)=>{
        let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
        return reject(errorMessage);
      });
      }, (err)=>{
        let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
        return reject(errorMessage);
      });
  });
}

exports.deleteProjectDataInMemebers = deleteProjectDataInMemebers;
