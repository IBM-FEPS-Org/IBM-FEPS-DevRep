fepsApp.factory('userProfileModel', function ($log, $q) {

    var id, admin_id, username, displayName, authenticatedAt, authenticatedBy, fname, lname, password, email, image, tel,
        type, userContacts, flightInfo, residenceInfo, userSupervisor;

    /**
     * Private Functions
     */

    var _resetProfile = function () {

    };

    /**
     * Public interfaces
     */

    return {
        /**
         *
         */
        init: function (callback) {
            $log.trace("userProfileModel init()...");
            _resetProfile();
        },
        setProfile: function (userObject) {
            id = userObject.attributes.id;
            admin_id = userObject.attributes.admin_id;
            username = userObject.attributes.username;
            displayName = userObject.displayName;
            authenticatedAt = userObject.authenticatedAt;
            authenticatedBy = userObject.authenticatedBy;
            fname = userObject.attributes.fname;
            lname = userObject.attributes.lname;
            password = userObject.attributes.password;
            email = userObject.attributes.email;
            type = userObject.attributes.type;
            image = userObject.attributes.image;
            tel = userObject.attributes.tel;
            flightInfo = userObject.attributes.flightInfo;

        },
        getProfile: function () {
            return {
                "id": id,
                "admin_id": admin_id,
                "userObject": username,
                "displayName": displayName,
                "authenticatedAt": authenticatedAt,
                "authenticatedBy": authenticatedBy,
                "fname": fname,
                "lname": lname,
                "password": password,
                "email": email,
                "type": type,
                "image": image,
                "tel": tel,
                "flightInfo": flightInfo,
                "userSupervisor": userSupervisor
            };
        },
        getDisplayName: function () {
            return displayName;
        },
        resetProfile: function () {
            id = null;
            admin_id = null;
            username = null;
            displayName = null;
            authenticatedAt = null;
            authenticatedBy = null;
            fname = null;
            lname = null;
            password = null;
            email = null;
            type = null;
            image = null;
            tel = null;
            flightInfo = null;
            userSupervisor = null;
            userContacts = null;
            residenceInfo = null
        },
        retrieveUserProfile: function () {
            var self = this;
            //var profile = JSON.parse(StorageHandler.get(StorageHandler.KEYS.USER_PROFILE, false));
            //self.setProfile(profile);
        },
        saveUserProfile: function (userObject) {
            /*var self = this;
            StorageHandler.set(StorageHandler.KEYS.USER_PROFILE, userObject, false);
            StorageHandler.set(StorageHandler.KEYS.IS_LOGGED_IN, true, false);
            self.setProfile(userObject);*/

        },
        resetUserProfile: function () {
            /*var self = this;
            StorageHandler.remove(StorageHandler.KEYS.USER_PROFILE);
            StorageHandler.remove(StorageHandler.KEYS.IS_LOGGED_IN);
            StorageHandler.remove(StorageHandler.KEYS.SYNC_TIME);
            StorageHandler.remove(StorageHandler.KEYS.USER_PUSH_TOKEN);
            self.resetProfile();*/
        }

    }

});
