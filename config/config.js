module.exports = {
  "cloudantNoSQLDB": {
  "dbName" : "my_sample_db",
  "credentials": {
	  "username": "b1b9fe3e-73c7-4d89-98fe-cae3ee8a0e14-bluemix",
	  "password": "9a169df71b71d5181f8209d85ad886889ce0b3fdef3250aa141725956705ea1b",
	  "host": "b1b9fe3e-73c7-4d89-98fe-cae3ee8a0e14-bluemix.cloudant.com",
	  "port": 443,
	  "url": "https://b1b9fe3e-73c7-4d89-98fe-cae3ee8a0e14-bluemix:9a169df71b71d5181f8209d85ad886889ce0b3fdef3250aa141725956705ea1b@b1b9fe3e-73c7-4d89-98fe-cae3ee8a0e14-bluemix.cloudant.com"
		  },
    "syslog_drain_url": null,
    "volume_mounts": [],
    "label": "cloudantNoSQLDB",
    "provider": null,
    "plan": "Lite",
    "name": "FEPSApp1-cloudantNoSQLDB",
    "tags": [
        "data_management",
        "ibm_created",
        "lite",
        "ibm_dedicated_public"
      ]
  },
  "mails" : {
    "support" : {
      "email" : "feps.inc@gmail.com",
      "password" : "&UJM^YHN",
      "host" : "smtp.gmail.com",
      "port" : "465"
    }
  }
};

/*dev credentials
 "username": "e0b960f2-32ce-4df0-9cf4-c3b0740320f4-bluemix",
 "password": "4619583789fa5210379a6bb873d2b46531bb4f4ec5d4f58b58add82a8866e7d2",
 "host": "e0b960f2-32ce-4df0-9cf4-c3b0740320f4-bluemix.cloudant.com",
 "port": 443,
 "url": "https://e0b960f2-32ce-4df0-9cf4-c3b0740320f4-bluemix:4619583789fa5210379a6bb873d2b46531bb4f4ec5d4f58b58add82a8866e7d2@e0b960f2-32ce-4df0-9cf4-c3b0740320f4-bluemix.cloudant.com"
*/

/*test credentials
{
  "username": "897b7f83-4faa-4b83-a4d6-aa2dac953322-bluemix",
  "password": "1d34bfcbf04ff8c5f42e86bb5492def5cd4c18012f9089d742fd743fa279d4e1",
  "host": "897b7f83-4faa-4b83-a4d6-aa2dac953322-bluemix.cloudant.com",
  "port": 443,
  "url": "https://897b7f83-4faa-4b83-a4d6-aa2dac953322-bluemix:1d34bfcbf04ff8c5f42e86bb5492def5cd4c18012f9089d742fd743fa279d4e1@897b7f83-4faa-4b83-a4d6-aa2dac953322-bluemix.cloudant.com"
}
*/

/*UAT credentials
"username": "1619e347-5334-4a7f-9faa-ec556fc63129-bluemix",
"password": "88d31f4b3cfdff874ebc6b0478380fa496720c1995a699f65e3585ec41ed3b14",
"host": "1619e347-5334-4a7f-9faa-ec556fc63129-bluemix.cloudant.com",
"port": 443,
"url": "https://1619e347-5334-4a7f-9faa-ec556fc63129-bluemix:88d31f4b3cfdff874ebc6b0478380fa496720c1995a699f65e3585ec41ed3b14@1619e347-5334-4a7f-9faa-ec556fc63129-bluemix.cloudant.com"
*/

/*prod credentials
{
	  "username": "31013944-c6ff-4bde-9b43-1e0b8b6245cf-bluemix",
	  "password": "ea3e062a981db4f88e46b9f2951b938b3c217ada11de7d96e4dcdf9a64ff84c4",
	  "host": "31013944-c6ff-4bde-9b43-1e0b8b6245cf-bluemix.cloudant.com",
	  "port": 443,
	  "url": "https://31013944-c6ff-4bde-9b43-1e0b8b6245cf-bluemix:ea3e062a981db4f88e46b9f2951b938b3c217ada11de7d96e4dcdf9a64ff84c4@31013944-c6ff-4bde-9b43-1e0b8b6245cf-bluemix.cloudant.com"
}
*/
//prod db name : "feps-db"
//dev,test,UAT db name "my_sample_db"
//UAT HOST : "https://uatincubatorapp.eu-gb.mybluemix.net"
//PROD HOST : "https://	fepsincubatorapp.eu-gb.mybluemix.net"