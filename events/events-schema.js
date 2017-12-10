module.exports = {
eventDate : "Date", //it will be stored as number, maps
headLine : "String", //maps to "Topic"
description : "String",
details : "String",
active : "Boolean",
eventPhotoAttach : String,
speakers: [
	{name : "String", bio : "String", profilePic: "String"}
],
Venue : "String",
enrollments : [{
	status: "number",
	"user" : "userDoc"
}]
};
