const ErrorMessage = require('../fepsApp-BE').ErrorMessage;
const Message = require('../fepsApp-BE').Message;

module.exports = {
  sendResponse : function(req, res, message){
    switch (message.code) {

      case Message.USER_CREATED:
        res.status(201).send(message);
        break;
      case Message.OBJECT_CREATED:
        res.status(201).send(message);
        break;
      case Message.GETTING_DATA:
        res.status(200).send(message);
        break;
      case Message.OBJECT_REMOVED:
        res.status(200).send(message);
        break;
      case Message.UPDATE_OBJECT:
        res.status(200).send(message);
        break;
      case Message.EMAIL_SENT:
        res.status(200).send(message);
        break;
      case Message.RESET_PASSWORD:
        res.status(200).send(message);
        break;

      case ErrorMessage.USERNAME_ALREADY_EXIST:
        res.status(500).send(message);
        break;
      case ErrorMessage.OBJECT_NOT_FOUND:
        res.status(401).send(message);
        break;
      case ErrorMessage.DATABASE_ERROR:
        res.status(401).send(message);
        break;
      case ErrorMessage.VALIDATION_ERROR:
        res.status(401).send(message);
        break;
      case ErrorMessage.MISSING_PARAMETER:
        res.status(400).send(message);
        break;
      case ErrorMessage.ALREADY_ENROLLED:
        res.status(400).send(message);
        break;
      case ErrorMessage.UNAUTHORIZATION_ERROR:
        res.status(401).send(message);
        break;
      case ErrorMessage.ALREADY_CREATED:
        res.status(401).send(message);
        break;
      case ErrorMessage.AUTHENTICATION_ERROR:
        res.status(401).send(message);
        break;
      case ErrorMessage.ALREADY_CREATED:
        res.status(401).send(message);
        break;
      case ErrorMessage.UNSUPPORTED_OPERATION:
        res.status(401).send(message);
        break;

      default:
        res.status(200).send(message);
    }
  }
}
