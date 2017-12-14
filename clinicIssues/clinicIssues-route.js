const express = require('express');
const router = express.Router();
const clinicIssuesManager = require('./clinicIssues-manager');
const pino = require('../fepsApp-BE').pino;
const renderResponseUtil = require('../fepsApp-BE').renderResponseUtil;
const responseCodes = require('../fepsApp-BE').responseCodes;

const ErrorMessage = require('../fepsApp-BE').ErrorMessage;
const auth = require('../fepsApp-BE').auth;
router.get('/',(req, res, next)=>{
  pino.debug({requestMin : req}, "Getting news");


  if(!req.query.ids){
    clinicIssuesManager.getclinicIssues().then((message)=>{
      pino.info({requestMin : req, news : message}, "Getting clinic issues : ");
      res.send(message);
    },(err)=>{
      pino.error({requestMin : req, err : err}, "Getting clinic issues : ");
      res.send(err);
    });
  }else{
    const ids = req.query.ids.split(',');
    clinicIssuesManager.getClinicIssuesByIds(ids).then((message)=>{
      pino.info({requestMin : req, news : message}, "Getting clinic issues");
      res.send(message);
    },(err)=>{
      pino.error({requestMin : req, err : err}, "Getting clinic issues");
      res.send(err);
    });
  }



});

router.post('/', auth, (req, res, next)=>{

  const clinicIssueObj = req.body;

  clinicIssuesManager.addClinicIssue(clinicIssueObj, req.user._id).then((message)=>{
    res.json(message)
  },(err)=>{
    res.send(err);
  });

});

router.delete('/:id', auth, (req, res)=>{

  const id = req.params.id;
  pino.debug({requestMin : req}, "removing clinic issue");
  clinicIssuesManager.deleteClinicIssue(id).then((message)=>{
    pino.debug({requestMin : req}, "remove clinic issue");
    res.send(message);
  },(err)=>{
    pino.error({requestMin : req, err : err}, "remove clinic issue");
    res.send(err);
  });
});

router.put('/', auth, (req, res)=>{

  const clinicIssueObj = req.body;
  clinicIssuesManager.updateClinicIssue(clinicIssueObj).then((message)=>{
    res.json(message);
  },(err)=>{
    res.send(err);
  });
});
module.exports = router;
