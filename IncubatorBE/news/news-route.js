const express = require('express');
const router = express.Router();
const newsManager = require('./news-manager');
const pino = require('../fepsApp-BE').pino;
const renderResponseUtil = require('../fepsApp-BE').renderResponseUtil;
const responseCodes = require('../fepsApp-BE').responseCodes;
const newsSchema = require('./news-schema');
const ErrorMessage = require('../fepsApp-BE').ErrorMessage;
const auth = require('../fepsApp-BE').auth;
router.get('/',(req, res, next)=>{
  pino.debug({requestMin : req}, "Getting news");
  newsManager.getNews().then((message)=>{
    pino.info({requestMin : req, news : message}, "Getting news : ");
    res.send(message);
  },(err)=>{
    pino.error({requestMin : req, err : err}, "Getting news : ");
    res.send(err);
  });
});

router.post('/', auth, (req, res, next)=>{
  	// req.checkBody(newsSchema);
    const newsObj = req.body;
	  // req.getValidationResult().then(function(result) {
	    // if (!result.isEmpty()) {
      //   let errorMessage = new ErrorMessage(ErrorMessage.VALIDATION_ERROR, result.array());
      //   pino.error({requestMin : req, err : errorMessage}, "Creating news validation error");
	    //   res.status(400).json(errorMessage);
	    //   return;
	    // }
      newsManager.addNews(newsObj).then((message)=>{
        res.json(message)
      },(err)=>{
        res.send(err);
      });
	  // });
});

router.delete('/:id', auth, (req, res)=>{
  const _rev = req.query._rev;
  const id = req.params.id;
  pino.debug({requestMin : req}, "removing news");
  newsManager.deleteNews(id, _rev).then((message)=>{
    pino.debug({requestMin : req}, "remove news");
    res.send(message);
  },(err)=>{
    pino.error({requestMin : req, err : err}, "remove news");
    res.send(err);
  });
});

router.put('/', auth, (req, res)=>{

  const newsObj = req.body;
  newsManager.updateNews(newsObj).then((message)=>{
    res.json(message);
  },(err)=>{
    res.send(err);
  });
});
module.exports = router;
