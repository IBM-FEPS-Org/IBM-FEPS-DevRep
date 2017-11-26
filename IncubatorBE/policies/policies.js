const GROUPS = require('../fepsApp-BE').constants.groups;

module.exports=[
  {"api" : "/news", "method" : "post", "groups" : [GROUPS.super_admin, GROUPS.it_admin]},
  {"api" : "/news", "method" : "put", "groups" : [GROUPS.super_admin, GROUPS.it_admin]},
  {"api" : "/news", "method" : "delete", "groups" : [GROUPS.super_admin, GROUPS.it_admin]},
  //projects
  {"api" : "/projects", "method" : "get", "groups" : [GROUPS.super_admin, GROUPS.founder, GROUPS.member,GROUPS.registered_user, GROUPS.mentor, GROUPS.supervisor_project]},
  {"api" : "/projects/:id", "method" : "get", "groups" : [GROUPS.super_admin, GROUPS.founder, GROUPS.member, GROUPS.mentor, GROUPS.supervisor_project]},
  {"api" : "/projects", "method" : "post", "groups" : [GROUPS.registered_user, GROUPS.founder, GROUPS.member]},
  {"api" : "/projects", "method" : "put", "groups" : [GROUPS.super_admin, GROUPS.mentor, GROUPS.supervisor_project, GROUPS.founder]},
  {"api" : "/projects/:id", "method" : "delete", "groups" : [GROUPS.super_admin, GROUPS.founder]},
  {"api" : "/projects", "method" : "patch", "groups" : [GROUPS.super_admin, GROUPS.mentor, GROUPS.founder, GROUPS.supervisor_project]},

  //Users
  {"api" : "/users", "method" : "patch", "groups" : [GROUPS.super_admin, GROUPS.supervisor_project]},
  //Cycles
  {"api" : "/cycle", "method" : "post", "groups" : [GROUPS.super_admin, GROUPS.supervisor_project]},
  {"api" : "/cycle", "method" : "put", "groups" : [GROUPS.super_admin, GROUPS.supervisor_project]},
  {"api" : "/cycle", "method" : "delete", "groups" : [GROUPS.super_admin, GROUPS.supervisor_project]}
];
