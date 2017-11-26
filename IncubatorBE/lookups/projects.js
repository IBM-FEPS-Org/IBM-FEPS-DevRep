const PROJECT_STATUS = require('../util/constants.json').projects;
const DOCUMENTS = require('../util/constants.json').documents.type;

module.exports ={
  "type" : DOCUMENTS.project_status,
  "data" : [
    {"name": "Initial", "id" : PROJECT_STATUS.status.Initial},
    {"name": "Assigned", "id" : PROJECT_STATUS.status.Assigned},
    {"name": "Reviewed", "id" : PROJECT_STATUS.status.Reviewed},
    {"name": "Rejected", "id" : PROJECT_STATUS.status.Rejected},
    {"name": "Accepted", "id" : PROJECT_STATUS.status.Accepted}
  ]
};


console.log(module.exports);
