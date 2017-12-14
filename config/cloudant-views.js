//design document view name : attachmentsDoc
//view name : not-attached-attachs
function getNotAttachedAttachs(doc) {
  if(doc.type == "attachments" && doc.attached === false) {
    emit(doc.username,{"_id":doc._id,"_rev":doc._rev,"attached":doc.attached});
  }
}

//design document view name : userDoc
//view name : users-view
function getUsers(doc) {
	 if(doc.type == "users" && doc.groups[0].id != 1) {
		    emit(doc.username,{"_id":doc._id,"_rev":doc._rev,"joinDate":doc.joinDate,"username":doc.username,"linkedIn":doc.linkedIn,"biography": doc.biography, "areaOfExpertises" : doc.areaOfExpertises,"email":doc.email,"profilePic" :doc. profilePic, "firstName":doc.firstName,"surname":doc.surname,"groups":doc.groups});
	 }
}

//design document view name : projectsDoc
//view name : projects-view
function getProjects(doc) {
	  if(doc.type == "projects") {
	    emit(doc.startupName,{"_id":doc._id,"_rev":doc._rev,"submissionDate":doc.submissionDate,"startupName":doc.startupName,"status":doc.status,"mentors":doc.mentors,"feedback":doc.feedback,"score":doc.score,"cycle":doc.cycle});
	  }
}

//design document view name : newsDoc
//view name : news-view
function getNews(doc) {
	  if(doc.type == "news") {
	    emit(doc.headline,{"_id":doc._id,"_rev":doc._rev,"headline":doc.headline,"storyDate":doc.storyDate,"eventURL":doc.eventURL,"active":doc.active,"state":doc.state,"details":doc.details,"imageFile":doc.imageFile});
	  }
}

//design document view name : eventsDoc
//view name : events-view

function eventsDoc(doc) {
	  if(doc.type == "events") {
	    emit(doc.topic,{"_id":doc._id,"_rev":doc._rev,"NoOfPlaces":doc.NoOfPlaces,"pendingEnrollments": doc.pendingEnrollments, "acceptedEnrollments" : doc.acceptedEnrollments, "rejectedEnrollments" : doc.rejectedEnrollments, "eventStartDate":doc.eventStartDate,"eventEndDate":doc.eventEndDate,"eventEnrollDeadline": doc.eventEnrollDeadline,"topic":doc.topic,"description":doc.description,"details":doc.details,"active":doc.active,"eventPhotoAttach":doc.eventPhotoAttach,"agendaAttachment": doc.agendaAttachment, "speakers" : doc.speakers});
	  }
}


//design document view name : recruitmentsDoc
//view name : recruitments-view
function recruitmentsDoc(doc) {
	  if(doc.type == "recruitments") {
	      emit(doc.jobTitle,{"_id":doc._id,"_rev":doc._rev,"jobTitle":doc.jobTitle,"projectName": doc.projectName, "skills" : doc.skills, "jobOwnerMail" : doc.jobOwnerMail, "createDate":doc.createDate, "active" : doc.active});
	  }
}



//design document view name : clinicIssueDoc
//view name : clinicIssue-view
function clinicIssueDoc(doc) {
	  if(doc.type == "clinicIssue") {
	      emit(doc.title,{"_id":doc._id,"_rev":doc._rev,"user": doc.user, "date" : doc.date, "title" : doc.title,"companyName":doc.companyName,"submitterPosition":doc.submitterPosition , "description" : doc.description, "status" : doc.status});
	  }
}


//index creation request to index all fields in all documents
//
//{
//  "type": "text",
//  "index": {}
//}

//project status
//"type": "project_status",
//"data": [
//  {
//    "name": "Initial",
//    "id": 1
//  },
//  {
//    "name": "Assigned",
//    "id": 2
//  },
//  {
//    "name": "Reviewed",
//    "id": 3
//  },
//  {
//    "name": "Rejected",
//    "id": 4
//  },
//  {
//    "name": "Accepted",
//    "id": 5
//  }
//]

//sectors lookup document
//"type": "sectors",
//"data": [
//  {
//    "id": "1",
//    "name": "Accounting",
//    "desc": ""
//  },
//  {
//    "id": "2",
//    "name": "Advertising",
//    "desc": ""
//  },
//  {
//    "id": "3",
//    "name": "Aerospace",
//    "desc": ""
//  },
//  {
//    "id": "4",
//    "name": "Agriculture & Agribusiness",
//    "desc": ""
//  },
//  {
//    "id": "5",
//    "name": "Air Transportation",
//    "desc": ""
//  },
//  {
//    "id": "6",
//    "name": "Apparel & Accessories"
//  },
//  {
//    "id": "7",
//    "name": "Auto",
//    "desc": ""
//  },
//  {
//    "id": "8",
//    "name": "Banking",
//    "desc": ""
//  },
//  {
//    "id": "9",
//    "name": "Beauty & Cosmetics",
//    "desc": ""
//  },
//  {
//    "id": "10",
//    "name": "Biotechnology",
//    "desc": ""
//  },
//  {
//    "id": "11",
//    "name": "Chemical",
//    "desc": ""
//  },
//  {
//    "id": "12",
//    "name": "Communications",
//    "desc": ""
//  },
//  {
//    "id": "13",
//    "name": "Computer",
//    "desc": ""
//  },
//  {
//    "id": "14",
//    "name": "Construction",
//    "desc": ""
//  },
//  {
//    "id": "15",
//    "name": "Consulting",
//    "desc": ""
//  },
//  {
//    "id": "16",
//    "name": "Consumer Products",
//    "desc": ""
//  },
//  {
//    "id": "17",
//    "name": "Education",
//    "desc": ""
//  },
//  {
//    "id": "18",
//    "name": "Electronics",
//    "desc": ""
//  },
//  {
//    "id": "19",
//    "name": "Employment",
//    "desc": ""
//  },
//  {
//    "id": "20",
//    "name": "Energy",
//    "desc": ""
//  },
//  {
//    "id": "21",
//    "name": "Entertainment & Recreation",
//    "desc": ""
//  },
//  {
//    "id": "22",
//    "name": "Fashion",
//    "desc": ""
//  },
//  {
//    "id": "23",
//    "name": "Financial Services",
//    "desc": ""
//  },
//  {
//    "id": "24",
//    "name": "Fine Arts",
//    "desc": ""
//  },
//  {
//    "id": "25",
//    "name": "Food & Beverage",
//    "desc": ""
//  },
//  {
//    "id": "26",
//    "name": "Green Technology",
//    "desc": ""
//  },
//  {
//    "id": "27",
//    "name": "Health",
//    "desc": ""
//  },
//  {
//    "id": "28",
//    "name": "Information",
//    "desc": ""
//  },
//  {
//    "id": "29",
//    "name": "Information Technology",
//    "desc": ""
//  },
//  {
//    "id": "30",
//    "name": "Insurance",
//    "desc": ""
//  },
//  {
//    "id": "31",
//    "name": "Journalism & News",
//    "desc": ""
//  },
//  {
//    "id": "32",
//    "name": "Legal Services",
//    "desc": ""
//  },
//  {
//    "id": "33",
//    "name": "Manufacturing",
//    "desc": ""
//  },
//  {
//    "id": "34",
//    "name": "Media & Broadcasting",
//    "desc": ""
//  },
//  {
//    "id": "35",
//    "name": "Medical Devices & Supplies",
//    "desc": ""
//  },
//  {
//    "id": "36",
//    "name": "Motion Pictures & Video",
//    "desc": ""
//  },
//  {
//    "id": "37",
//    "name": "Music",
//    "desc": ""
//  },
//  {
//    "id": "38",
//    "name": "Pharmaceutical",
//    "desc": ""
//  },
//  {
//    "id": "39",
//    "name": "Public Relations",
//    "desc": ""
//  },
//  {
//    "id": "40",
//    "name": "Publishing",
//    "desc": ""
//  },
//  {
//    "id": "41",
//    "name": "Real Estate",
//    "desc": ""
//  },
//  {
//    "id": "42",
//    "name": "Retail",
//    "desc": ""
//  },
//  {
//    "id": "43",
//    "name": "Service",
//    "desc": ""
//  },
//  {
//    "id": "44",
//    "name": "Sports",
//    "desc": ""
//  },
//  {
//    "id": "45",
//    "name": "Technology",
//    "desc": ""
//  },
//  {
//    "id": "46",
//    "name": "Telecommunications",
//    "desc": ""
//  },
//  {
//    "id": "47",
//    "name": "Tourism",
//    "desc": ""
//  },
//  {
//    "id": "48",
//    "name": "Transportation",
//    "desc": ""
//  },
//  {
//    "id": "49",
//    "name": "Travel",
//    "desc": ""
//  },
//  {
//    "id": "50",
//    "name": "Utilities",
//    "desc": ""
//  },
//  {
//    "id": "51",
//    "name": "Video Games",
//    "desc": ""
//  },
//  {
//    "id": "52",
//    "name": "Web Services",
//    "desc": ""
//  },
//  {
//    "id": "53",
//    "name": "Other",
//    "desc": ""
//  }
//]

//groups lookup document
//"type": "groups",
//"data": [
//  {
//    "id": 1,
//    "name": "Super Admin"
//  },
//  {
//    "id": 2,
//    "name": "IT Admin"
//  },
//  {
//    "id": 3,
//    "name": "Supervisor Event"
//  },
//  {
//    "id": 4,
//    "name": "Supervisor Project"
//  },
//  {
//    "id": 5,
//    "name": "Supervisor clinic"
//  },
//  {
//    "id": 6,
//    "name": "Founder"
//  },
//  {
//    "id": 7,
//    "name": "Mentor"
//  },
//  {
//    "id": 8,
//    "name": "Registered user"
//  },
//  {
//    "id": 9,
//    "name": "Member"
//  },
//	{
	//	"id": 10,
	//	"name": "Co-Founder"
//	}
//]
