const policies = require('./policies');
let app = require('../fepsApp-BE');
const ErrorMessage = require('../fepsApp-BE').ErrorMessage;
const messages = require('../fepsApp-BE').messages;
for(let i = 0, total = policies.length; i < total; i++){
  switch (policies[i].method) {
    case 'get':
      app.get(policies[i].api, (req, res, next)=>{
        authorize(req, res, next, policies[i].groups);
      });
      break;
    case 'post':
      app.post(policies[i].api, (req, res, next)=>{
        authorize(req, res, next, policies[i].groups);
      });
      break;
    case 'delete':
      app.delete(policies[i].api, (req, res, next)=>{
        authorize(req, res, next, policies[i].groups);
      });
      break;
    case 'put':
      app.put(policies[i].api, (req, res, next)=>{
        authorize(req, res, next, policies[i].groups);
      });
      break;
    case 'patch':
      app.patch(policies[i].api, (req, res, next)=>{
        authorize(req, res, next, policies[i].groups);
      });
      break;
  }
}

const authorize = function(req, res, next, roles){
  const user = req.user;


  let flag = false;
  console.log();
  if(user && user.groups){
    const groups = user.groups;
    roles = roles.toString();
    for(i = 0, total = groups.length; i < total; i++ ){
      //the user is authorized for this route
      if(roles.includes(groups[i].name)){
        flag = true;
        return next();
      }
    }
  }


  let errorMessage = new ErrorMessage(ErrorMessage.UNSUPPORTED_OPERATION, messages.errorMessages.unauthorization_error);
  res.status(401).send(errorMessage);

}
