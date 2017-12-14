const express = require('express');
const router = express.Router();
const recruitmentManager = require('./recruitment-manager');
const pino = require('../fepsApp-BE').pino;
const renderResponseUtil = require('../fepsApp-BE').renderResponseUtil;
const responseCodes = require('../fepsApp-BE').responseCodes;

const ErrorMessage = require('../fepsApp-BE').ErrorMessage;
const auth = require('../fepsApp-BE').auth;
router.get('/',(req, res, next)=>{
  pino.debug({requestMin : req}, "Getting news");
  recruitmentManager.getRecruitments().then((message)=>{
    pino.info({requestMin : req, news : message}, "Getting news : ");
    res.send(message);
  },(err)=>{
    pino.error({requestMin : req, err : err}, "Getting news : ");
    res.send(err);
  });
});

router.post('/', auth, (req, res, next)=>{

  const recruitmentObj = req.body;

  recruitmentManager.addRecruitment(recruitmentObj).then((message)=>{
    res.json(message)
  },(err)=>{
    res.send(err);
  });

});

router.delete('/:id', auth, (req, res)=>{

  const id = req.params.id;
  pino.debug({requestMin : req}, "removing recruitments");
  recruitmentManager.deleteRecruitment(id).then((message)=>{
    pino.debug({requestMin : req}, "remove recruitment");
    res.send(message);
  },(err)=>{
    pino.error({requestMin : req, err : err}, "remove news");
    res.send(err);
  });
});

router.put('/', auth, (req, res)=>{

  const recruitmentObj = req.body;
  recruitmentManager.updateRecruitment(recruitmentObj).then((message)=>{
    res.json(message);
  },(err)=>{
    res.send(err);
  });
});
module.exports = router;
