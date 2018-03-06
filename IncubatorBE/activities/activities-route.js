const express = require('express');
const router = express.Router();
const activitiesManager = require('./activities-manager');
const pino = require('../fepsApp-BE').pino;
const renderResponseUtil = require('../fepsApp-BE').renderResponseUtil;
const responseCodes = require('../fepsApp-BE').responseCodes;
// const newsSchema = require('./news-schema');
const ErrorMessage = require('../fepsApp-BE').ErrorMessage;
const auth = require('../fepsApp-BE').auth;

router.get('/',(req, res, next)=>
{
	  pino.debug({requestMin : req}, "Getting Activities");
	
	
	  if(!req.query.ids)
	  {
		  activitiesManager.getAllActivities().then((message)=>
		  {
		      pino.info({requestMin : req, news : message}, "Getting Activities : ");
		      res.send(message);
		  },(err)=>
		  {
		      pino.error({requestMin : req, err : err}, "Getting Activities : ");
		      res.send(err);
		  });
	  }
	  else
	  {
	    const ids = req.query.ids.split(',');
	    activitiesManager.getActivitiesByIds(ids).then((message)=>
	    {
	    	pino.info({requestMin : req, news : message}, "Getting Activities : ");
	    	res.send(message);
	    },(err)=>{
	    	pino.error({requestMin : req, err : err}, "Getting Activities : ");
	    	res.send(err);
	    });
	  }

});

router.get('/:id',(req, res, next)=>
{
	console.log(req.params);
	  const id = req.params.id;
	  pino.debug({requestMin : req}, "Getting Activities");
	  activitiesManager.getActivityById(id).then((message)=>
	  {
		  pino.info({requestMin : req, news : message}, "Getting Activities");
		  res.send(message);
	  },(err)=>
	  {
		  pino.error({requestMin : req, err : err}, "Getting Activities");
		  res.send(err);
	  });
});

router.post('/', auth, (req, res)=>
{

	  let event = req.body;
	
	  activitiesManager.createActivity(event).then((message)=>
	  {
		  renderResponseUtil.sendResponse(req, res, message);
	  }, (errorMessage)=>{
		  renderResponseUtil.sendResponse(req, res, errorMessage);
	  });

});


router.put('/', auth, (req, res)=>
{

	  let event = req.body;
	
	  activitiesManager.updateActivity(event).then((message)=>
	  {
		  renderResponseUtil.sendResponse(req, res, message);
	  }, (errorMessage)=>
	  {
		  renderResponseUtil.sendResponse(req, res, errorMessage);
	  });

});


router.delete('/:id', auth, (req, res)=>
{
	  const id = req.params.id;
	  const rev = req.query.rev;
	  activitiesManager.deleteActivity(id, rev).then((message)=>
	  {
		  renderResponseUtil.sendResponse(req, res, message);
	  }, (errorMessage)=>
	  {
		  renderResponseUtil.sendResponse(req, res, errorMessage);
	  });
});







module.exports = router;
