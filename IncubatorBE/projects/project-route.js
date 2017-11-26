const express = require('express');
const router = express.Router();
const projectManager = require('./project-manager');
let pino = require('../fepsApp-BE').pino;
const responseCodes = require('../fepsApp-BE').responseCodes;
const projectSchema = require('./projects-schema');
const ErrorMessage = require('../fepsApp-BE').ErrorMessage;
const auth = require('../fepsApp-BE').auth;
var multipart = require('connect-multiparty');
const messages = require('../fepsApp-BE').messages;
const renderResponseUtil = require('../fepsApp-BE').renderResponseUtil;
// var multipartMiddleware = multipart();
router.get('/',(req, res, next)=>{
  // accepted value should be yes or true.
  let status = req.query.status;
  let projectName = req.query.name;
  status = parseInt(status);
  if(status){
    pino.debug({requestMin : req}, "Getting accepted projects");
    projectManager.getProjectsByStatus(status).then((message)=>{
    pino.info({requestMin : req, projects : message}, "Getting accepted projects");
      res.send(message);
    },(err)=>{
      pino.error({requestMin : req, err : err}, "Getting accepted projects");
      res.send(err);
    });
  }else if(projectName){
    pino.debug({requestMin : req}, "Getting accepted projects");
    projectManager.getProjectsByName(projectName).then((message)=>{
    pino.info({requestMin : req, projects : message}, "Getting accepted projects");
      res.send(message);
    },(err)=>{
      pino.error({requestMin : req, err : err}, "Getting accepted projects");
      res.send(err);
    });
  }else{
    pino.debug({requestMin : req}, "Getting Projects");
    projectManager.getProjects().then((message)=>{
      pino.info({requestMin : req, projects : message}, "Getting projects");
      res.send(message);
    },(err)=>{
      pino.error({requestMin : req, err : err}, "Getting projects");
      res.send(err);
    });
  }

});

router.get('/:id', (req, res)=>{

  const id = req.params.id;
  pino.debug({requestMin : req}, "Getting Projects by id: " + id);

  projectManager.getProjectById(id).then((projectResult)=>{
    pino.info({requestMin : req, news : projectResult}, "Getting projectby id");
    res.send(projectResult);
  }, (err)=>{
    pino.error({requestMin : req, err : err}, "Getting project by id: " + id);
    res.send(err);
  });
});

router.post('/', auth,(req, res, next)=>{
  	req.checkBody(projectSchema);
    const projectObj = req.body;
	  // req.getValidationResult().then(function(result) {
	  //   if (!result.isEmpty()) {
    //     let errorMessage = new ErrorMessage(ErrorMessage.VALIDATION_ERROR, result.array());
    //     pino.error({requestMin : req, err : errorMessage}, "Creating project validation error");
	  //     res.status(400).json(errorMessage);
	  //     return;
	  //   }
      projectManager.createProject(projectObj, req.user).then((message)=>{
        res.json(message);
      },(err)=>{
        res.send(err);
      });
	  // });
});

router.delete('/:id', auth, (req, res)=>{
  const rev = req.query.rev;
  const id = req.params.id;
  pino.debug({requestMin : req}, "removing project");
  projectManager.deleteProject(id, rev, req.user).then((message)=>{
    pino.debug({requestMin : req}, "remove project");
    res.send(message);
  },(err)=>{
    pino.error({requestMin : req, err : err}, "remove project");
    res.send(err);
  });
});

router.put('/', auth,(req, res, next)=>{
  	req.checkBody(projectSchema);
    const projectObj = req.body;
	  // req.getValidationResult().then(function(result) {
	  //   if (!result.isEmpty()) {
    //     let errorMessage = new ErrorMessage(ErrorMessage.VALIDATION_ERROR, result.array());
    //     pino.error({requestMin : req, err : errorMessage}, "Creating project validation error");
	  //     res.status(400).json(errorMessage);
	  //     return;
	  //   }
      projectManager.updateProject(projectObj, req.user).then((message)=>{
        res.json(message)
      },(err)=>{
        res.send(err);
      });
	  // });
});

router.patch('/', auth, (req, res)=>{

  let project = req.body;
  let operType = req.query.operType;
  switch (operType) {
    case 'update_status':
      projectManager.updateProjectStatus(project, req.user).then((projectMessage)=>{
        res.json(projectMessage);
      }, (err)=>{
        res.send(err);
      });
      break;
    case 'add_feedback':
      req.checkBody('feedback', 'feedback is mandatory').notEmpty();
      req.checkBody('score', "Must be number").notEmpty().isInt();
      req.getValidationResult().then(function(result) {
        if (!result.isEmpty()) {
          let errorMessage = new ErrorMessage(ErrorMessage.VALIDATION_ERROR, result.array());
          res.status(400).send(errorMessage);
          return;
        }
        projectManager.updateProjectFeedback(project).then((projectMessage)=>{
          res.json(projectMessage);
        }, (err)=>{
          res.send(err);
        });
      });

      break;
    case 'incubation_attachs':
      projectManager.updateIncubationAttachs(project, req.user).then((projectMessage)=>{
        renderResponseUtil.sendResponse(req, res, projectMessage);
      }, (errorMessage)=>{
        renderResponseUtil.sendResponse(req, res, errorMessage);
      });
      break;

    default:
      let errorMessage = new ErrorMessage(ErrorMessage.UNSUPPORTED_OPERATION, messages.errorMessages.unsupported_operation);
      res.send(errorMessage);
  }


});



module.exports = router;
