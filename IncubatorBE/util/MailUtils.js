const nodemailer = require('nodemailer');
const EJS = require('ejs');
const pino = require('../fepsApp-BE').pino;
const messages = require('../fepsApp-BE').messages;
const CONSTANTS = require('../fepsApp-BE').constants;
const Promise = require('promise');
module.exports = function(mailConfigs){

  let supportTransporter = nodemailer.createTransport({
    host: mailConfigs.support.host,
    port: mailConfigs.support.port,
    secure: true, // secure:true for port 465, secure:false for port 587
    auth: {
        user: mailConfigs.support.email,
        pass: mailConfigs.support.password
    }
  });


  return {

    sendEmail : function(mailType, mailTemplate, subject, sentInfo, language, receivers){
      let name = "sendEmail";
      return new Promise((resolve, reject)=>{
        let path;
        if(language == CONSTANTS.language.ar){
          path =   __dirname + "/mail-templates/" + mailTemplate + "_ar.ejs";
        }
        else if(language == CONSTANTS.language.en)
        {
          path =   __dirname + "/mail-templates/" + mailTemplate + "_en.ejs";
        }
        pino.info({fnction : __filename+ ">" + name}, "Sending Email," + mailType);
        send(supportTransporter,mailConfigs.support.email, receivers, subject, path, sentInfo, resolve);

      });
    }
  }
};


function send(transporter,email, receivers, subject, path, sentInfo, resolve){

  let name = "send";
  EJS.renderFile(path, sentInfo, {}, function(err, str){
  let mailOptions = {
          from: email, // sender address
          to: receivers, // list of receivers
          subject: subject, // Subject line
          html: str // html body
      };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          pino.error({fnction : __filename+ ">" + name, err : error}, "Need an action to handle in case there is an error");
        }
        pino.info({fnction : __filename+ ">" + name}, "Email has been sent successfully");
    });
    //Did that because no way to know if the email is sent successfully.
    resolve("In Progress sending");
  });

}
