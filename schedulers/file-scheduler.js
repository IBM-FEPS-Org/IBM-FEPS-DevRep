var schedule = require('node-schedule');
const ModelUtil = require('../fepsApp-BE').ModelUtil;
const pino = require('../fepsApp-BE').pino;
const Promise = require('promise')
pino.info("Starting Attachemnts Scheduler, It runs every day 5 am");

var j = schedule.scheduleJob('* * 5 * * *', ()=>{
  pino.info('Running the the scheduler every day at 5 am');
  pino.info("Getting all not attached attacments");
  ModelUtil.findByview('attachmentsDoc', 'not-attached-attachs').then((attachments)=>{
    let attachs = [];
    for(let i = 0; i < attachments.rows.length; i++){
      attachs.push(attachments.rows[i].value);
    }
    let timerIndex = 0;
    for ( let i = 0, total = attachs.length; i < total ; ) {


      timerIndex ++;
      pino.info('Deleting ' + timerIndex * 50 + ' attachemnts');

      let promises = [];

      for (let j = 0 ; i < total && j < 50; i++, j++) {
        promises.push(ModelUtil.deleteDoc(attachs[i]._id, attachs[i]._rev));
      }
      if(promises.length > 0){
        setTimeout(()=>{
          Promise.all(promises).then((results)=>{
            pino.info("Attachments is removed successfully");
          }, (err)=>{
            pino.error(err);
          });
        }, timerIndex * 1000);
      }
    }

  },(err)=>{
    pino.error(err);
  });
});
