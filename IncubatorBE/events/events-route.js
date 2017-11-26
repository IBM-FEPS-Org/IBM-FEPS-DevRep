const express = require('express');
const router = express.Router();
const eventsManager = require('./events-manager');
const pino = require('../fepsApp-BE').pino;
const renderResponseUtil = require('../fepsApp-BE').renderResponseUtil;
const responseCodes = require('../fepsApp-BE').responseCodes;
// const newsSchema = require('./news-schema');
const ErrorMessage = require('../fepsApp-BE').ErrorMessage;
const auth = require('../fepsApp-BE').auth;

router.get('/',(req, res, next)=>{
  pino.debug({requestMin : req}, "Getting Events");


  if(!req.query.ids){
    eventsManager.getAllEvents().then((message)=>{
      pino.info({requestMin : req, news : message}, "Getting news : ");
      res.send(message);
    },(err)=>{
      pino.error({requestMin : req, err : err}, "Getting news : ");
      res.send(err);
    });
  }else{
    const ids = req.query.ids.split(',');
    eventsManager.getEventsByIds(ids).then((message)=>{
      pino.info({requestMin : req, news : message}, "Getting news : ");
      res.send(message);
    },(err)=>{
      pino.error({requestMin : req, err : err}, "Getting news : ");
      res.send(err);
    });
  }

});

router.get('/:id',(req, res, next)=>{
  const id = req.params.id;
  pino.debug({requestMin : req}, "Getting Events");
  eventsManager.getEventById(id).then((message)=>{
    pino.info({requestMin : req, news : message}, "Getting events");
    res.send(message);
  },(err)=>{
    pino.error({requestMin : req, err : err}, "Getting events");
    res.send(err);
  });
});

router.post('/', auth, (req, res)=>{

  let event = req.body;

  eventsManager.createEvent(event).then((message)=>{
    renderResponseUtil.sendResponse(req, res, message);
  }, (errorMessage)=>{
    renderResponseUtil.sendResponse(req, res, errorMessage);
  });

});


router.put('/', auth, (req, res)=>{

  let event = req.body;

  eventsManager.updateEvent(event).then((message)=>{
    renderResponseUtil.sendResponse(req, res, message);
  }, (errorMessage)=>{
    renderResponseUtil.sendResponse(req, res, errorMessage);
  });

});

router.delete('/:id', auth, (req, res)=>{
  const id = req.params.id;
  const rev = req.query.rev;
  eventsManager.deleteEvent(id, rev).then((message)=>{
    renderResponseUtil.sendResponse(req, res, message);
  }, (errorMessage)=>{
    renderResponseUtil.sendResponse(req, res, errorMessage);
  });
});


router.post('/:eventId/requests/', auth, (req, res)=>{
  console.log(req.params);
  console.log(req.params.eventId)  ;
  eventsManager.enroll(req.user, req.params.eventId).then((message)=>{
    renderResponseUtil.sendResponse(req, res, message);
  }, (errorMessage)=>{
    renderResponseUtil.sendResponse(req, res, errorMessage);
  });
});

router.patch('/:eventId/requests/', auth, (req, res)=>{

  const userId = req.query.userId;
  const eventId = req.params.eventId;
  const status = parseInt(req.body.status);
  if(status === NaN && status != 1 && status != 2 && status != 3 ){
    const errorMessage = new ErrorMessage(ErrorMessage.VALIDATION_ERROR, messages.errorMessages.wrong_status_value);
    renderResponseUtil.sendResponse(req, res, errorMessage);
  }

  eventsManager.updateEnrollStatus(userId, eventId, status).then((message)=>{
    renderResponseUtil.sendResponse(req, res, message);
  }, (errorMessage)=>{
    renderResponseUtil.sendResponse(req, res, errorMessage);
  });

});

router.delete('/:eventId/requests/', auth, (req, res)=>{

  const userId = req.user._id;
  const eventId = req.params.eventId;

  eventsManager.unenroll(userId, eventId).then((message)=>{
    renderResponseUtil.sendResponse(req, res, message);
  }, (errorMessage)=>{
    renderResponseUtil.sendResponse(req, res, errorMessage);
  });

});



module.exports = router;
