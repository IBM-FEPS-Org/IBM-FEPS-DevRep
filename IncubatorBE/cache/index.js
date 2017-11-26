let app = require('../fepsApp-BE');
const ModelUtil = app.ModelUtil;
const CONSTANTS = app.constants;
const pino = app.pino;
let cache = require('memory-cache');
const Promise = require('promise');
let cacheOperations = {};
//Caching data on the application level

const refreshSectors = function(){
  return new Promise((resolve, reject)=>{
    ModelUtil.findByQuery({type : CONSTANTS.documents.type.sectors}).then((sectors)=>{
      cache.put(CONSTANTS.documents.type.sectors, sectors[0]);
      pino.info("Cached is updated, sectors are chached");
      resolve(sectors[0]);
    }, (err)=>{
      pino.error({err : err},"in caching");
      reject(err);
    });
  });
};

const refreshGroups = function(){
  return new Promise((resolve, reject)=>{
    ModelUtil.findByQuery({type : CONSTANTS.documents.type.groups}).then((result)=>{
      let groups = {};
      let groupsArray = [];
      let groupsContainer = {};
      for(let i = 0; i < result[0].data.length; i++){
        groups[result[0].data[i].name] = result[0].data[i];
        groupsArray[i] = result[0].data[i];
      }
    groupsContainer.groups = groups;
    groupsContainer.groupsArray = groupsArray;

      cache.put(CONSTANTS.documents.type.groups, groupsContainer);
      pino.info("Cached is updated, groups are chached");
      resolve(groups);
    }, (err)=>{
      pino.error({err : err},"in caching");
      reject(err);
    });
  });
}

const refreshProjectStatus = function(){
    return new Promise((resolve, reject)=>{
      ModelUtil.findByQuery({type : CONSTANTS.documents.type.project_status}).then((status)=>{
        cache.put(CONSTANTS.documents.type.project_status, status[0]);
        pino.info("Cached is updated, project status are chached");
        resolve(status[0]);
      }, (err)=>{
        pino.error({err : err},"in caching");
        reject(err);
      });
});
};

const refreshSuperadmins = function(){
  return new Promise((resolve, reject)=>{
    const query = {
      "groups" : {
        "$elemMatch" : {
          "id" : 1
        }
      }
    };

    ModelUtil.findByQuery(query).then((superAdmins)=>{
      pino.info("Cached is updated, superadmins are chached");
      cache.put(CONSTANTS.groups.super_admin, superAdmins);
    }, (err)=>{
      pino.error({err : err}, "in caching");
    });
  });
}


//cache sectors
refreshSectors();
//cache groups
refreshGroups();
//cash project status
refreshProjectStatus();
//cache superadmins
refreshSuperadmins();

cacheOperations.refreshSectors = refreshSectors;
cacheOperations.refreshGroups = refreshGroups;
cacheOperations.refreshProjectStatus = refreshProjectStatus;
cacheOperations.refreshSuperadmins = refreshSuperadmins;
app.cacheOperations = cacheOperations;
