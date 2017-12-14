module.exports = {

	"active" : {
		notEmpty: true
	},
	"headline" : {
		notEmpty: true,
		isLength: {
		      options: [{ min: 2, max: 100 }],
		      errorMessage: 'Title must be between 2 and 100 chars long'
		    }
	},
	"storyDate":{
		notEmpty: true,
	},
	"details" : {
		notEmpty: true,
		isLength: {
		      options: [{ min: 2, max: 3000 }],
		      errorMessage: 'Details must be between 2 and 1000 chars long'
		    }
		},
	"image" : {
		// notEmpty: true,
	},
	"eventId" : {
		optional: true
	},
	"eventURL":{
		optional: true
	},
	"requests" : [{
		"status" : "String",
		"statusCode" : "String",
		"user" : "userDoc"
	}]

};
