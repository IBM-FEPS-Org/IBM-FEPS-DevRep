const crypto = require('crypto');
let cache = require('memory-cache');
const usersModel = require('./users.model');
const Promise = require('promise');
const pino = require('../fepsApp-BE').pino;
const messages = require('../fepsApp-BE').messages;
const ErrorMessage = require('../fepsApp-BE').ErrorMessage;
const Message = require('../fepsApp-BE').Message;
const CONSTANTS = require('../fepsApp-BE').constants;
const securtiyUtil = require('../fepsApp-BE').securtiyUtil;
const ModelUtil = require('../fepsApp-BE').ModelUtil;
const ObjectUtil = require('../fepsApp-BE').objectUtil;
const utils = require('../fepsApp-BE').utils;
const projectService = require('../projects/projects-service');
const eventsService = require('../events/events-service');
const attachementService = require('../attachments/attachment-service');
const cycleService = require('../cycles/cycle-service');
const clinicServices = require('../clinicIssues/clinicIssues-service.js');
const MailUtil = require('../fepsApp-BE').mailUtil;
const cacheOperations = require('../fepsApp-BE').cacheOperations;
exports.getUserByUsername = function(username){
  return new Promise(function(resolve,reject){
    const funcName = "getUserByUsername";
    const query = {"username" : username};
    pino.debug({fnction : __filename+ ">" + funcName}, "Getting user by username : " + username);
    usersModel.getUsers(query).then((user)=>{
      if(user){
        delete user.hash;
        delete user.salt;
      }
      pino.info({fnction : __filename+ ">" + funcName, user : user}, "Getting user by username : " + username);
      let message = new Message(Message.GETTING_DATA, user, null);
      resolve(message);
    },(err)=>{
      return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
    });
  });
};

exports.getUsersByGroups = function(groups)
{
	return new Promise((resolve, reject)=>{
    const funcName = "getUsersByGroups";
		let query = {
			"type": "users",
			"groups" :  {
				"$elemMatch": { "id":  {"$in": groups}}
			}
		};
    pino.debug({fnction : __filename+ ">" + funcName}, "Getting user by groups : " + groups);
		ModelUtil.findByQuery(query).then((users)=>{
      if(users){
        for(let i =0; i < users.length; i++){
          delete users[i].hash;
          delete users[i].salt;
        }
      }
      pino.debug({fnction : __filename+ ">" + funcName}, "Result of getting user by groups : " + users);
			resolve(users);
		}, (err)=>{
			reject(err);
		});
	});
}

exports.getUserByUsernameGroup = function(username, group){
  return new Promise((resolve, reject)=>{
    let funcName = "getUserByUsernameGroup";
    let query = {
      type : CONSTANTS.documents.type.users,
      "username" : username,
      "groups" :  {
        "$elemMatch": { "name":  group}
      }
    };
    ModelUtil.findByQuery(query).then((users)=>{
      if(users){
        for(let i =0; i < users.length; i++){
          delete users[i].hash;
          delete users[i].salt;
        }
      }
      pino.debug({fnction : __filename+ ">" + funcName}, "Result of getting user by groups : " + users);
			resolve(users?users[0] : null);
		}, (err)=>{
			reject(err);
		});

  });
}

exports.createUser = function(userObj){
  return new Promise((resolve, reject)=>{
    const funcName = "createUser";
    //check if username, email, phone is exist
    let query = {
      "$or": [
        { "email": userObj.email },
        { "phone": userObj.phone },
        { "username" : userObj.username}
      ]
    };

    ModelUtil.findByQuery(query).then((users)=>{
      if(users){
        let errorMessages = [];
        let usernameErrorExist, phoneErrorExist, emailErrorExist;

        for(let i = 0; i < users.length; i ++){
          if(users[i].username === userObj.username & !usernameErrorExist){
            errorMessages.push(new ErrorMessage(ErrorMessage.VALIDATION_ERROR,messages.errorMessages.username_already_exist));
            usernameErrorExist = true;
          }
          if(users[i].phone === userObj.phone && !phoneErrorExist){
            errorMessages.push(new ErrorMessage(ErrorMessage.VALIDATION_ERROR,messages.errorMessages.phone_already_exist));
            phoneErrorExist = true;
          }
          if(users[i].email === userObj.email && !emailErrorExist){
            errorMessages.push(new ErrorMessage(ErrorMessage.VALIDATION_ERROR,messages.errorMessages.email_already_exist));
            emailErrorExist = true;
          }
          if(usernameErrorExist && emailErrorExist && phoneErrorExist){
            break;
          }
        }
        return reject(errorMessages);
      }
      pino.debug({fnction : __filename+ ">" + funcName}, "creating user");

      userObj = securtiyUtil.setPassword(userObj, userObj.password);
      //Do not save password directly in DB, we save hash instead.

      delete userObj.password;
      delete userObj.confirmPass;

      userObj.type = CONSTANTS.documents.type.users;
      let groups = cache.get(CONSTANTS.documents.type.groups);
      userObj.groups = [groups.groups[CONSTANTS.groups.registered_user]];
      userObj.active = true;
      ModelUtil.insertDoc(userObj).then((createdUser)=>{
        let message = new Message(Message.USER_CREATED, createdUser, messages.businessMessages.user_register_success);
        pino.debug({fnction : __filename+ ">" + funcName, user : createdUser}, "User created successfully");
        let emailData = {"user" : userObj};
        let emails;
        emails = userObj.email;
        MailUtil.sendEmail(CONSTANTS.mail.welcome_email, CONSTANTS.mailTemplates.welcome_email, "Welcome to FEPS BI", emailData, CONSTANTS.language.en, emails).then((info)=>
        {
            let message = new Message(Message.EMAIL_SENT, null, messages.businessMessages.email_sent_success);
            pino.info(message);
            
        }, (err)=>
        {
            let errorMessage = new ErrorMessage(ErrorMessage.EMAIL_ERROR, err);
            pino.error(errorMessage);
        });
        
        
        
        if(userObj.profilePic){
          attachementService.attachAttachments([userObj.profilePic], true).then(()=>{
            resolve(message);
          },(err)=>{
            reject(err);
          });
        }else{
          resolve(message);
        }

        // resolve(message);
      }, (err)=>{
        return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
      });

    },(err)=>{
      return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
    });

  });
};


exports.updateUser = function(userObj){
	  return new Promise((resolve, reject)=>{

	      //remove password fields if exist
	      delete userObj.password;
	      const funcName = "updateUser";
	      //Check these fields are unique
	      let query = {
	    	      "$or": [
	    	        { "email": userObj.email },
	    	        { "phone": userObj.phone },
	    	        { "username" : userObj.username}
	    	      ]
	    	    };

	      //Check the returned users are different user not the same user
	      ModelUtil.findByQuery(query).then((users)=>{
	    	  
	        if(users.length >1){
	          let errorMessages = [];
	          let usernameErrorExist, phoneErrorExist, emailErrorExist;

	          for(let i = 0; i < users.length; i ++){
	            if(users[i].username === userObj.username && !usernameErrorExist && users[i]._id != userObj._id){
	              errorMessages.push(new ErrorMessage(ErrorMessage.VALIDATION_ERROR,messages.errorMessages.username_already_exist));
	              usernameErrorExist = true;
	            }
	            if(users[i].phone === userObj.phone && !phoneErrorExist && users[i]._id != userObj._id){
	              errorMessages.push(new ErrorMessage(ErrorMessage.VALIDATION_ERROR,messages.errorMessages.phone_already_exist));
	              phoneErrorExist = true;
	            }
	            if(users[i].email === userObj.email && !emailErrorExist && users[i]._id != userObj._id){
	              errorMessages.push(new ErrorMessage(ErrorMessage.VALIDATION_ERROR,messages.errorMessages.email_already_exist));
	              emailErrorExist = true;
	            }
	            if(usernameErrorExist && emailErrorExist && phoneErrorExist){
	              break;
	            }
	          }
	          return reject(errorMessages);
	        }
	  	pino.debug({fnction : __filename+ ">" + funcName}, "updating user");
        ModelUtil.findById(userObj._id).then((freshUser)=>{
          const oldPic = freshUser.profilePic;
          const newPic = userObj.profilePic;
          delete userObj._rev;
          freshUser = ObjectUtil.copySameTypeObject(userObj, freshUser);
          let updateUser;
          ModelUtil.insertDoc(freshUser).then((updatedUser)=>{
            if(freshUser.groups[0].name == CONSTANTS.groups.super_admin){
              cacheOperations.refreshSuperadmins();
            }
            updateUser = updatedUser;
	          let message = new Message(Message.UPDATE_OBJECT, updatedUser, messages.businessMessages.user_update_success);
	          pino.debug({fnction : __filename+ ">" + funcName, user : updatedUser}, "User updated successfully");
            //update related projects with the denoramlized fields.
            return updateRelatedProjects(freshUser, userObj);

	        }, (err)=>{
	          reject(err);
	        }).then(()=>{
            let message = new Message(Message.UPDATE_OBJECT, updateUser, messages.businessMessages.user_update_success);
            if(newPic && oldPic && oldPic.id !== newPic.id){
              attachementService.removeAttachement(oldPic.id, oldPic.rev).then((response)=>{
                attachementService.attachAttachments([newPic], true).then(()=>{
                	resolve(message);
                },(err)=>{
                  reject(err);
                });
              }, (err)=>{
                reject(err);
              });
            }
            else if(newPic)
        	{
            	attachementService.attachAttachments([newPic], true).then(()=>{
                	resolve(message);
                },(err)=>{
                  reject(err);
                });
        	}
            else{
              resolve(message);
            }
            updateRelatedEvents(freshUser).then((result)=>{
              pino.info('Events are updated');
            }, (err)=>{
            	reject(err);
            });
          });
        }, (err)=>{
        	reject(err);
        });
	  },(err)=>{
		  reject(err);
	      });
    });
  };


const oldDeleteUser = function(_id, _rev){
  return new Promise((resolve, reject)=>
  {
    const funcName = "oldDeleteUser";
    		
	    ModelUtil.deleteDoc(_id, _rev).then((result)=>
	    {
	    	    let message = new Message(Message.OBJECT_REMOVED, result, messages.businessMessages.user_removed);
	        pino.debug({fnction : __filename+ ">" + funcName, result :result}, "user is removed");
	        resolve(message);
	    }
	    ,(err)=>
	    {
		     reject(err);
		});
	    resolve();
  },(err)=>
  {
	     reject(err);
  });
};

exports.deleteUser = function (id,rev,user)
{
	return new Promise((resolve, reject)=>{
	      //remove password fields if exist
	      const funcName = "deleteUser";
	      var promises = [];
	      ModelUtil.findById(id).then((document)=>
	      {
	    	  
	    	  	  
		    	  pino.debug({fnction : __filename+ ">" + funcName}, "Deleting user");
		    	  if(document.profilePic)
	    		  {
		    		  
		    		  promises.push(attachementService.removeAttachement(document.profilePic.id, document.profilePic.rev));
		    		  attachementService.removeAttachement(document.profilePic.id, document.profilePic.rev).then(()=>{
		    	            
		    			  	resolve();
		              }, (err)=>{
		                reject(err);
		              });
	    		  }
		    	  
		    	  if(document.enrollments)
		    	  {
		    		  for(let i = 0; i < document.enrollments.length; i ++)
		    		  {
		    			  promises.push(eventsService.unenroll(id,document.enrollments[i].eventId));
		    			  eventsService.unenroll(id,document.enrollments[i].eventId).then((response)=>
    			  		  {
		    	            resolve();
		    	          }, (err)=>{
		    	            reject(err);
		    	          });
		    		  }

		    	  }
		    	  if(document.clinicIssues)
		    	  {
		    		  for(let i = 0; i < document.clinicIssues.length; i ++)
		    		  {
		    			  promises.push(clinicServices.deleteClinicIssue(document.clinicIssues[i]));
		    			  clinicServices.deleteClinicIssue(document.clinicIssues[i]).then((response)=>
	    			  		  {
			    	            resolve();
			    	          }, (err)=>{
			    	            reject(err);
			    	          });
		    		  }
		    	  }
		    	  if(document.projects)
		    	  {
		    		  
		    		  ModelUtil.findById(document.projects[0]._id).then((project)=>
		    		  {
		    		      let message = new Message(Message.GETTING_DATA, project, "");
		    		      pino.debug({fnction : __filename+ ">" + funcName, result :project}, "getting project by id");
		    		      
		    		      if(project.members[0]._id == id)
		    		    	  {
		    		    	  		promises.push(projectService.deleteProject(project._id,project._rev,user));
		    		    	  		projectService.deleteProject(project._id,project._rev,user).then(()=>
		    		    	  		{
		        					ModelUtil.findById(id).then((result)=>
		        					{
			        					ModelUtil.deleteDoc(result._id,result._rev).then(()=>
		        					    {
		        					    	
		        					        resolve();
		        					    }
		        					    ,(err)=>
		        					    {
		        						     reject(err);
		        						});
			        					
		        					 },(err)=>
			    		    	  		 {
			    		    	  			 
			        		            reject(err);
			        		         });
		        					resolve();
		        		         }
		    		    	  		 ,(err)=>
		    		    	  		 {
		    		    	  			 
		        		            reject(err);
		        		         });
		    		    	  }
	        			  
		    		      
		    		      resolve(message);
		    		   }
		    		   ,(err)=>{
		    			   reject(err);
		    		    });
		    		  	
		    	  }

		    	  resolve();
		    	  
		    	  

	  },(err)=>
	  {
	  		reject(err);
	  });   
	  
    	  
	  
	});

	
};


exports.deleteUserr = function (id,rev,user)
{
	return new Promise((resolve, reject)=>{
	      //remove password fields if exist
	      const funcName = "deleteUserr";
	      var promises = [];
	      ModelUtil.findById(id).then((document)=>
	      {
		    	  pino.debug({fnction : __filename+ ">" + funcName}, "Deleting user");
		    	  if(document.profilePic)
	    		  {
		    		  
		    		  attachementService.removeAttachement(document.profilePic.id, document.profilePic.rev).then(()=>
		    		  {
		    			  
		    			  
		    			  if(document.projects)
				    	  {
				    		  
				    		  ModelUtil.findById(document.projects[0]._id).then((project)=>
				    		  {
				    			  
				    		      let message = new Message(Message.GETTING_DATA, project, "");
				    		      pino.debug({fnction : __filename+ ">" + funcName, result :project}, "getting project by id");
				    		      
				    		      if(project.members[0]._id == id)
				    		    	  {
				    		    	  		projectService.deleteProject(project._id,project._rev,user).then(()=>
				    		    	  		{
				        					
				        					if(document.enrollments)
					        			    	{
				        						eventsService.unenrollAll(id).then(()=>
				        						{
				        							if(document.clinicIssues)
					        	  			    		{	
				        								clinicServices.deleteAllClinicIssue(id).then(()=>
				        								{
				        									
				        									ModelUtil.findById(id).then((result)=>
				        		          					{
				        		          						
				        		                				ModelUtil.deleteDoc(result._id,result._rev).then(()=>
				        		          					    {
				        		          					    	
				        		          					        resolve();
				        		          					    }
				        		          					    ,(err)=>
				        		          					    {
				        		          						     reject(err);
				        		          						});
				        		                					
				        		          					 },(err)=>
				        		            		    	  		 {
				        		            		    	  			 
				        		                		            reject(err);
				        		                		         });
				        								},(err)=>{
		        				    	            				reject(err);
			        				    	          		});
					        	  			    		}
				        							else
			        								{
				        								ModelUtil.findById(id).then((result)=>
			        		          					{
			        		          						
			        		                				ModelUtil.deleteDoc(result._id,result._rev).then(()=>
			        		          					    {
			        		          					    	
			        		          					        resolve();
			        		          					    }
			        		          					    ,(err)=>
			        		          					    {
			        		          						     reject(err);
			        		          						});
			        		                					
			        		          					 },(err)=>
			        		            		    	  		 {
			        		            		    	  			 
			        		                		            reject(err);
			        		                		         });
			        								}
				        						},(err)=>{
		        				    	            		reject(err);
		        				    	          	});
				        						
				        						
					        			    	}    	
				        					else if(document.clinicIssues)
				        	  			    	{
				        						clinicServices.deleteAllClinicIssue(id).then(()=>
		        								{
		        									
		        									ModelUtil.findById(id).then((result)=>
		        		          					{
		        		          						ModelUtil.deleteDoc(result._id,result._rev).then(()=>
		        		          					    {
		        		          					    	resolve();
		        		          					    }
		        		          					    ,(err)=>
		        		          					    {
		        		          						     reject(err);
		        		          						});
		        		                					
		        		          					 },(err)=>
		        		            		    	  		 {
		        		            		    	  			 
		        		                		            reject(err);
		        		                		         });
		        								},(err)=>{
        				    	            				reject(err);
	        				    	          		});
				        	  			    	}
				        					else
				        					{
				        							ModelUtil.findById(id).then((result)=>
					          					{
					          						ModelUtil.deleteDoc(result._id,result._rev).then(()=>
					          					    {
					          					    	resolve();
					          					    }
					          					    ,(err)=>
					          					    {
					          						     reject(err);
					          						});
					                					
					          					 },(err)=>
					            		    	  		 {
					            		    	  			 
					                		            reject(err);
					                		         });
				        					}
				        					
				        					resolve();
				        		         }
				    		    	  		 ,(err)=>
				    		    	  		 {
				    		    	  			 
				        		            reject(err);
				        		         });
				    		    	  }
				    		      else
				    		    	  {
				    		    	  	  for(let i = 0; i < project.members.length; i ++)
						    		  {
				    		    	  		  if(project.members[i]._id == id)
			    		    	  			  {
				    		    	  			  project.members.splice(i,1);
				    		    	  			  break;
			    		    	  			  }
						    		  }
				    		    	  	  ModelUtil.updateDoc(project).then(()=>{
				    		    	  		  if(document.enrollments)
					        			    	{
				        						eventsService.unenrollAll(id).then(()=>
				        						{
				        							if(document.clinicIssues)
					        	  			    		{	
				        								clinicServices.deleteAllClinicIssue(id).then(()=>
				        								{
				        									ModelUtil.findById(id).then((result)=>
				        		          					{
				        		                				ModelUtil.deleteDoc(result._id,result._rev).then(()=>
				        		          					    {
				        		          					        resolve();
				        		          					    }
				        		          					    ,(err)=>
				        		          					    {
				        		          						     reject(err);
				        		          						});
				        		                					
				        		          					 },(err)=>
				        		            		    	  		 {
				        		            		    	  			 
				        		                		            reject(err);
				        		                		         });
				        								},(err)=>{
		        				    	            				reject(err);
			        				    	          		});
					        	  			    		}
				        							else
						        					{
						        							ModelUtil.findById(id).then((result)=>
							          					{
							          						ModelUtil.deleteDoc(result._id,result._rev).then(()=>
							          					    {
							          					    	
							          					        resolve();
							          					    }
							          					    ,(err)=>
							          					    {
							          						     reject(err);
							          						});
							                					
							          					 },(err)=>
							            		    	  		 {
							            		    	  			 
							                		            reject(err);
							                		         });
						        					}
				        						},(err)=>{
		        				    	            		reject(err);
		        				    	          	});
				        						
				        						
					        			    	}    	
				        					else if(document.clinicIssues)
				        	  			    	{
				        						clinicServices.deleteAllClinicIssue(id).then(()=>
		        								{
		        									ModelUtil.findById(id).then((result)=>
		        		          					{
		        		          						ModelUtil.deleteDoc(result._id,result._rev).then(()=>
		        		          					    {
		        		          					        resolve();
		        		          					    }
		        		          					    ,(err)=>
		        		          					    {
		        		          						     reject(err);
		        		          						});
		        		                					
		        		          					 },(err)=>
		        		            		    	  		 {
		        		            		    	  			 
		        		                		            reject(err);
		        		                		         });
		        								},(err)=>{
      				    	            				reject(err);
	        				    	          		});
				        	  			    	}
				        					else
				        					{
				        							ModelUtil.findById(id).then((result)=>
					          					{
					          						
					                				ModelUtil.deleteDoc(result._id,result._rev).then(()=>
					          					    {
					          					        resolve();
					          					    }
					          					    ,(err)=>
					          					    {
					          						     reject(err);
					          						});
					                					
					          					 },(err)=>
					            		    	  		 {
					            		    	  			 
					                		            reject(err);
					                		         });
				        					}
				    		    	  		  resolve();
				    		    	  	  },(err)=>
			    		    	  		 {
			    		    	  			 
			        		            reject(err);
			        		         });
				    		    	  }
			        			  
				    		      resolve(message);
				    		   }
				    		   ,(err)=>{
				    			   reject(err);
				    		    });	
				    	  }
		    			  else
	    				  {
		    				  	ModelUtil.findById(id).then((result)=>
	        					{
	        						
		        					ModelUtil.deleteDoc(result._id,result._rev).then(()=>
	        					    {
	        					    	resolve();
	        					    }
	        					    ,(err)=>
	        					    {
	        						     reject(err);
	        						});
		        					
	        					 },(err)=>
		    		    	  		 {
		    		    	  			 
		        		            reject(err);
		        		         });
	    				  }
		    			  resolve();
		    			  
		          }, (err)=>{
		              reject(err);
		          });
	    		  }
		    	  else if(document.projects)
		    	  {
		    		  
		    		  ModelUtil.findById(document.projects[0]._id).then((project)=>
		    		  {
		    		      let message = new Message(Message.GETTING_DATA, project, "");
		    		      pino.debug({fnction : __filename+ ">" + funcName, result :project}, "getting project by id");
		    		      
		    		      if(project.members[0]._id == id)
		    		    	  {
		    		    	  		projectService.deleteProject(project._id,project._rev,user).then(()=>
		    		    	  		{
		        					if(document.enrollments)
			        			    	{
		        						eventsService.unenrollAll(id).then(()=>
		        						{
		        							if(document.clinicIssues)
			        	  			    		{	
		        								clinicServices.deleteAllClinicIssue(id).then(()=>
		        								{
		        									ModelUtil.findById(id).then((result)=>
		        		          					{
		        		          						ModelUtil.deleteDoc(result._id,result._rev).then(()=>
		        		          					    {
		        		          					    	resolve();
		        		          					    }
		        		          					    ,(err)=>
		        		          					    {
		        		          						     reject(err);
		        		          						});
		        		                					
		        		          					 },(err)=>
		        		            		    	  		 {
		        		            		    	  			 
		        		                		            reject(err);
		        		                		         });
		        								},(err)=>{
        				    	            				reject(err);
	        				    	          		});
			        	  			    		}
		        							else
				        					{
				        							ModelUtil.findById(id).then((result)=>
				        							{
					          						
					                					ModelUtil.deleteDoc(result._id,result._rev).then(()=>
					                					{
					                						resolve();
					                					}
					          					    ,(err)=>
					          					    {
					          						     reject(err);
					          						});
					                					
					          					 },(err)=>
					            		    	  		 {
					            		    	  			 
					                		            reject(err);
					                		         });
				        					}
		        						},(err)=>{
        				    	            		reject(err);
        				    	          	});
		        						
		        						
			        			    	}    	
		        					else if(document.clinicIssues)
		        	  			    	{
		        						clinicServices.deleteAllClinicIssue(id).then(()=>
        								{
        									ModelUtil.findById(id).then((result)=>
        		          					{
        		          						
    		                					ModelUtil.deleteDoc(result._id,result._rev).then(()=>
        		          					    {
        		          					    	resolve();
        		          					    }
        		          					    ,(err)=>
        		          					    {
        		          						     reject(err);
        		          						});
        		                					
        		          					 },(err)=>
        		            		    	  		 {
        		            		    	  			 
        		                		            reject(err);
        		                		         });
        								},(err)=>{
				    	            				reject(err);
    				    	          		});
		        	  			    	}
		        					else
		        					{
		        							ModelUtil.findById(id).then((result)=>
			          					{
			          						ModelUtil.deleteDoc(result._id,result._rev).then(()=>
			          					    {
			          					    	resolve();
			          					    }
			          					    ,(err)=>
			          					    {
			          						    reject(err);
			          						});
			                					
			          					 },(err)=>
			            		    	  		 {
			            		    	  			 
			                		            reject(err);
			                		         });
		        					}
		        					
		        					resolve();
		        		         }
		    		    	  		 ,(err)=>
		    		    	  		 {
		    		    	  			 
		        		            reject(err);
		        		         });
		    		    	  }
		    		      else
		    		    	  {
		    		    	  	  for(let i = 0; i < project.members.length; i ++)
				    		  {
		    		    	  		  if(project.members[i]._id == id)
	    		    	  			  {
		    		    	  			  project.members.splice(i,1);
		    		    	  			  break;
	    		    	  			  }
				    		  }
		    		    	  	  ModelUtil.updateDoc(project).then(()=>{
		    		    	  		  	
		    		    	  		  if(document.enrollments)
			        			    	{
		        						eventsService.unenrollAll(id).then(()=>
		        						{
		        							if(document.clinicIssues)
			        	  			    		{	
		        								clinicServices.deleteAllClinicIssue(id).then(()=>
		        								{
		        									
		        									ModelUtil.findById(id).then((result)=>
		        		          					{
		        		          						
		        		                				ModelUtil.deleteDoc(result._id,result._rev).then(()=>
		        		          					    {
		        		          					    		
		        		          					        resolve();
		        		          					    }
		        		          					    ,(err)=>
		        		          					    {
		        		          						     reject(err);
		        		          						});
		        		                					
		        		          					 },(err)=>
		        		            		    	  		 {
		        		            		    	  			 
		        		                		            reject(err);
		        		                		         });
		        								},(err)=>{
        				    	            				reject(err);
	        				    	          		});
			        	  			    		}
		        							else
				        					{
				        							ModelUtil.findById(id).then((result)=>
					          					{
					          						
					                					ModelUtil.deleteDoc(result._id,result._rev).then(()=>
						          					    {
						          					    	resolve();
						          					    }
						          					    ,(err)=>
						          					    {
						          						     reject(err);
						          						});
					                					
					          					 },(err)=>
					            		    	  		 {
					            		    	  			 
					                		            reject(err);
					                		         });
				        					}
		        							
		        						},(err)=>{
        				    	            		reject(err);
        				    	          	});
		        						
		        						
			        			    	}    	
		        					else if(document.clinicIssues)
		        	  			    	{
		        						clinicServices.deleteAllClinicIssue(id).then(()=>
        								{
        									
        									ModelUtil.findById(id).then((result)=>
        		          					{
        		          						ModelUtil.deleteDoc(result._id,result._rev).then(()=>
        		          					    {
        		          					    	resolve();
        		          					    }
        		          					    ,(err)=>
        		          					    {
        		          						     reject(err);
        		          						});
        		                					
        		          					 },(err)=>
        		            		    	  		 {
        		            		    	  			 
        		                		            reject(err);
        		                		         });
        								},(err)=>{
				    	            				reject(err);
    				    	          		});
		        	  			    	}
		        					else
		        					{
		        							ModelUtil.findById(id).then((result)=>
			          					{
			          						ModelUtil.deleteDoc(result._id,result._rev).then(()=>
			          					    {
			          					    	resolve();
			          					    }
			          					    ,(err)=>
			          					    {
			          						     reject(err);
			          						});
			                					
			          					 },(err)=>
			            		    	  		 {
			            		    	  			 
			                		            reject(err);
			                		         });
		        					}
		    		    	  		  resolve();
		    		    	  	  },(err)=>
	    		    	  		 {
	    		    	  			 
	        		            reject(err);
	        		         });
		    		    	  }
	        			  
		    		      resolve(message);
		    		   }
		    		   ,(err)=>{
		    			   reject(err);
		    		    });	
		    	  }
		    	  else if(document.enrollments)
		    	  {
						eventsService.unenrollAll(id).then(()=>
						{
							if(document.clinicIssues)
	    	  			    		{	
									clinicServices.deleteAllClinicIssue(id).then(()=>
									{
										ModelUtil.findById(id).then((result)=>
			          					{
			          						ModelUtil.deleteDoc(result._id,result._rev).then(()=>
			          					    {
			          					    	resolve();
			          					    }
			          					    ,(err)=>
			          					    {
			          						     reject(err);
			          						});
			                					
			          					 },(err)=>
			            		    	  		 {
			            		    	  			 
			                		            reject(err);
			                		         });
									},(err)=>{
			    	            				reject(err);
				    	          		});
	    	  			    		}
							else
							{
								  	ModelUtil.findById(id).then((result)=>
								  	{
										ModelUtil.deleteDoc(result._id,result._rev).then(()=>
										{
											resolve();
									    }
									    ,(err)=>
									    {
										     reject(err);
										});
							
									 },(err)=>
								  		 {
								  			 
								        reject(err);
								     });
							}
							
						},(err)=>{
		    	            		reject(err);
		    	          	});
						
						
    			  }
		    	  else if(document.clinicIssues)
		    	  {
		    		clinicServices.deleteAllClinicIssue(id).then(()=>
					{
						
						ModelUtil.findById(id).then((result)=>
    					{
    						
    						ModelUtil.deleteDoc(result._id,result._rev).then(()=>
    					    {
    					    	resolve();
    					    }
    					    ,(err)=>
    					    {
    						     reject(err);
    						});
          					
    					 },(err)=>
    					 {
      		    	  			 
          		            reject(err);
          		     });
					},(err)=>{
            				reject(err);
    	          		});
			    	
		    	  }
		    	  else
		    	  {
		    		  	ModelUtil.findById(id).then((result)=>
					{
						ModelUtil.deleteDoc(result._id,result._rev).then(()=>
					    {
					    	resolve();
					    }
					    ,(err)=>
					    {
						    reject(err);
						});
				
					 },(err)=>
		    	  		 {
		    	  			 
	  		            reject(err);
	  		         });
		    	  }

		    	  resolve();
		    	  
		    	  

    });

  });
};

exports.checkUserGroup = function(userObj, group){
  if(!userObj || !group){
    throw new Error('userObj and group must be objects');
  }

  for(let i = 0; userObj.groups && i < userObj.groups.length; i++){
    if(userObj.groups[i].name === group){
      return true;
    }
  }
  return false;
}

exports.checkUserGroups = function(userObj, groups){
  if(!userObj || !groups){
    throw new Error('userObj and group must be objects');
  }

  for(let i = 0; userObj.groups && i < userObj.groups.length; i++){
    for (var j = 0; j < groups.length; j++) {
      if(userObj.groups[i].name === groups[j]){
        return true;
      }
    }
  }
  return false;
}


const setPassword = function(userObj, password){
  userObj.salt = crypto.randomBytes(16).toString('hex');
  userObj.hash = crypto.pbkdf2Sync(password, userObj.salt, 1000, 64, 'sha512').toString('hex');
};


exports.getMentors = function(){
	  return new Promise(function(resolve,reject){
	    const funcName = "get Mentor List";
	    const query = "{\"groups.name\":"+"mentor}";

	    pino.debug({fnction : __filename+ ">" + funcName}, "Getting Mentors List : " );
	    usersModel.getUsers(query).then((result)=>{
	      pino.info({fnction : __filename+ ">" + funcName, result : result}, "Getting mentors List: ");
	   //   let message = new Message(Message.GETTING_DATA, result, null);
	      resolve(result);
	    },(err)=>{
	      return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
	    });
	  });
	};

exports.getAllUsers = function(){
    return new Promise((resolve,reject)=>{
        const funcName = "getAllUsers";
        const query = {type : CONSTANTS.documents.type.users};
        pino.debug({fnction : __filename+ ">" + funcName}, "Getting all users");

        ModelUtil.findByview("userDoc","users-view").then((users)=>{

        let minUsers = [];
        let time = new Date().getTime();
        for(let i = 0; i < users.rows.length; i++){
        	minUsers.push(users.rows[i].value);
        }

        let message = new Message(Message.GETTING_DATA, minUsers, null);
        resolve(message);
    },(err)=>{
        return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
        });
    });
};

exports.assignProjectsToMentor = function(userObj){
  return new Promise((resolve, reject)=>{
    const funcName = 'assignProjectsToMentor';
    cycleService.getCycleByActive(true).then((cycle)=>{
      if(!cycle.data){
        return utils.rejectMessage(ErrorMessage.VALIDATION_ERROR,  messages.errorMessages.no_active_cycle, funcName, reject);
      }

      for (var i = 0; userObj.projects && i < userObj.projects.length; i++) {
        userObj.projects[i].cycle = cycle.data[0]._id;
      }

    
    ModelUtil.findById(userObj._id).then((freshUser)=>{
      //user must be mentor to assign projects to him
      if(!freshUser.groups || freshUser.groups.length == 0 || freshUser.groups[0].name !== CONSTANTS.groups.mentor){
        return utils.rejectMessage(ErrorMessage.UNAUTHORIZATION_ERROR,  messages.errorMessages.user_must_be_mentor, funcName, reject);
      }

      if(!freshUser.projects || !Array.isArray(freshUser.projects)){
        freshUser.projects = [];
      }
      freshUser.projects = freshUser.projects.concat(userObj.projects);

      //Remove duplicates projects in user
      let jsonProjects = ObjectUtil.convertArrayIntoJson(freshUser.projects, '_id');

      freshUser.projects = ObjectUtil.convertJsonIntoArrayValues(jsonProjects);

      let updatedUserData;

      ModelUtil.insertDoc(freshUser).then((result)=>{
        updatedUserData = result;
        const projectIds = ObjectUtil.getArrayValuesFromJsons(userObj.projects, '_id');
        //send false because projectIds is array of integers.
        let promises = ModelUtil.getFindByIdPromises(projectIds, false);
        let deassignProjectPromises = [];
        Promise.all(promises).then((freshProjects)=>{
          let emailData = {"projects" : freshProjects, mentor : freshUser};
          let emails;
          emails = freshUser.email;
         MailUtil.sendEmail(CONSTANTS.mail.assign_mentor_email, CONSTANTS.mailTemplates.assign_mentor_email, "Projects Assigned To You", emailData, CONSTANTS.language.en, emails).then((info)=>{
            let message = new Message(Message.EMAIL_SENT, null, messages.businessMessages.email_sent_success);
            pino.info(message);
          }, (err)=>{
            let errorMessage = new ErrorMessage(ErrorMessage.EMAIL_ERROR, err);
            pino.error(errorMessage);
                });
      for (var i = 0; i < freshProjects.length; i++) {
            //deassign project from its old mentors
            // this condition freshProjects[i].mentors[0]._id !== userObj._id, just to make sure the current mentor is not the old mentor
            if(freshProjects[i].mentors && freshProjects[i].mentors[0]._id !== userObj._id && freshProjects[i].mentors.length > 0){
              deassignProjectPromises.push(removeProjectsFromUser(freshProjects[i].mentors[0]._id, [freshProjects[i]._id]));
            }
            freshProjects[i].mentors = [{"_id" : freshUser._id, "_rev" : freshUser._rev, "username" : userObj.username}];
            delete freshProjects[i].score;
            delete freshProjects[i].feedback;
            freshProjects[i].status = CONSTANTS.projects.status.Assigned;

          }
          return ModelUtil.bulkUpdates(freshProjects);
        }, (err)=>{
          return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
        }).then(()=>{
          //Projects updated successfully
          Promise.all(deassignProjectPromises).then(()=>{
            let message = new Message(Message.UPDATE_OBJECT, updatedUserData, messages.businessMessages.user_update_success);
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
    });

  });
    ////////////
  });
}


exports.assignRoleNewCycle = function(userObj){
	  return new Promise((resolve, reject)=>{
	    ModelUtil.findById(userObj._id).then((freshUser)=>{

	      const oldPic = freshUser.profilePic;
	      const newPic = userObj.profilePic;

	      if(newPic && oldPic && oldPic.id !== newPic.id){
	        attachementService.removeAttachement(oldPic.id, oldPic.rev).then((response)=>{
	          attachementService.attachAttachments([newPic], true).then(()=>{
	            // resolve(message);
	            pino.info('image updated');
	          },(err)=>{
	            pino.error(err);
	          });
	        }, (err)=>{
	          pino.error(err);
	        });
	      }

	      ObjectUtil.copySameTypeObject(userObj, freshUser);


	      ModelUtil.insertDoc(freshUser).then((result)=>
	      {
	        let message =  new Message(Message.UPDATE_OBJECT, result, messages.businessMessages.user_update_success);
	        resolve(message);
	        
	      }, (err)=>{
	        return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
	      });

	    }, (err)=>{
	      return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
	    });
	  });
}

exports.assignRole = function(userObj){
  return new Promise((resolve, reject)=>{
    ModelUtil.findById(userObj._id).then((freshUser)=>{

      const oldPic = freshUser.profilePic;
      const newPic = userObj.profilePic;

      if(newPic && oldPic && oldPic.id !== newPic.id){
        attachementService.removeAttachement(oldPic.id, oldPic.rev).then((response)=>{
          attachementService.attachAttachments([newPic], true).then(()=>{
            // resolve(message);
            pino.info('image updated');
          },(err)=>{
            pino.error(err);
          });
        }, (err)=>{
          pino.error(err);
        });
      }

      ObjectUtil.copySameTypeObject(userObj, freshUser);


      ModelUtil.insertDoc(freshUser).then((result)=>{
        let message =  new Message(Message.UPDATE_OBJECT, result, messages.businessMessages.user_update_success);

        //Notify superadmin
        const superadmins = cache.get(CONSTANTS.groups.super_admin);

        for (var i = 0; i < superadmins.length; i++) {
          let emails;
         /* emails = superadmins[i].email;
          let emailData = {user : freshUser, admin : superadmins[i]};
          MailUtil.sendEmail(CONSTANTS.mail.change_role, CONSTANTS.mailTemplates.change_role, "Role Changed", emailData, CONSTANTS.language.en, emails).then((info)=>{
            let message = new Message(Message.EMAIL_SENT, null, messages.businessMessages.email_sent_success);
            pino.info(message);
          }, (err)=>{
            let errorMessage = new ErrorMessage(ErrorMessage.EMAIL_ERROR, err);
            pino.error(errorMessage);
          });*/
          emails = freshUser.email;
          let emailData = {user : freshUser};
          MailUtil.sendEmail(CONSTANTS.mail.change_role_email, CONSTANTS.mailTemplates.change_role_email, "Role Changed", emailData, CONSTANTS.language.en, emails).then((info)=>{
            let message = new Message(Message.EMAIL_SENT, null, messages.businessMessages.email_sent_success);
            pino.info(message);
          }, (err)=>{
            let errorMessage = new ErrorMessage(ErrorMessage.EMAIL_ERROR, err);
            pino.error(errorMessage);
          });
          
        }
        
        

        resolve(message);
      }, (err)=>{
        return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
      });

    }, (err)=>{
      return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
    });
  });
}

function removeProjectsFromUser(userId, projectIds){
  return new Promise((resolve, reject)=>{
    if(!projectIds || projectIds.length == 0){
      resolve();
    }

    ModelUtil.findById(userId).then((freshUser)=>{
      if(freshUser.projects){
        let remainProjects = [];
        //exclude deleted Projects
        for(let i = 0, total = freshUser.projects.length; i < total; i++){
          if(!projectIds.includes(freshUser.projects[i]._id)){
            remainProjects.push(freshUser.projects[i]);
          }
        }
        freshUser.projects = remainProjects;
        ModelUtil.insertDoc(freshUser).then((result)=>{
          resolve(result);
        }, (err)=>{
          return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
        })
      }else{
        resolve();
      }
    }, (err)=>{
      return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
    });
  });
}

//Update related projects to users, in case the user has been updated.
function updateRelatedProjects(freshUser, userObj){
  return new Promise((resolve, reject)=>{
      if(!freshUser.projects || freshUser.projects.length === 0){
        resolve();
      }
      let promises = [];
      for (var i = 0; i < freshUser.projects.length; i++) {
        promises.push(ModelUtil.findById(freshUser.projects[i]._id));
      }

      Promise.all(promises).then((freshProjects)=>{
        for (var i = 0, iTotal = freshProjects.length; i < iTotal; i++) {
          for (var j = 0, jTotal = freshProjects[i].members.length; j < jTotal; j++) {
            if(freshProjects[i].members[j]._id === userObj._id){
              freshProjects[i].members[j].firstName = userObj.firstName;
              freshProjects[i].members[j].surName = userObj.surname;
              freshProjects[i].members[j].username = userObj.username;
              freshProjects[i].members[j].email = userObj.email;
            }
          }
        }
        return ModelUtil.bulkUpdates(freshProjects);
      }, (reject)=>{
        return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
      }).then(()=>{
        let message = new Message(Message.UPDATE_OBJECT, '' , messages.businessMessages.project_updated_success);
        resolve(message);
      }, (err)=>{
        reject(err);
      });

  });
}

function updateRelatedEvents(freshUser){
  return new Promise((resolve, reject)=>{
    const funcName = 'updateRelatedEvents';
    if(!freshUser.enrollments){
      return resolve();
    }

    let promises = [];
    for (var i = 0; i < freshUser.enrollments.length; i++) {
      promises.push(ModelUtil.findById(freshUser.enrollments[i].eventId));
    }

    Promise.all(promises).then((events)=>{
      events.forEach((event)=>{
        if(event.pendingEnrollments){
          event.pendingEnrollments.forEach((enrollment)=>{
            if(freshUser._id === enrollment.user._id){
              enrollment.user = freshUser;
              return;
            }
          });
        }

        if(event.rejectedEnrollments){
          event.rejectedEnrollments.forEach((enrollment)=>{
          if(freshUser._id === enrollment.user._id){
            enrollment.user = freshUser;
            return;
          }
        });
      }
      if(event.acceptedEnrollmens){
        event.acceptedEnrollmens.forEach((enrollment)=>{
          if(freshUser._id === enrollment.user._id){
            enrollment.user = freshUser;
            return;
          }
        });
      }
      });

      return ModelUtil.bulkUpdates(events);

    }, (err)=>{
      return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
    }).then(()=>{
      let message = new Message(Message.UPDATE_OBJECT, '' , messages.businessMessages.project_updated_success);
      resolve(message);
    }, (err)=>{
      reject(err);
    });

  });
}
