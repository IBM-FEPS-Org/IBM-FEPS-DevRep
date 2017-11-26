fepsApp.service('userProfileService', function ($http, envService, $localStorage) {
    var apiUrl = envService.read('apiUrl');
    /**
     * Private Functions
     */
    var _saveProfile = function (profile) {

    };
    /**
     * Public interfaces
     */
    return {
        /**
         *
         * @param options
         */
        init: function (options) {
            $log.trace('userProfileService:init()');
            userProfileModel.init();
        },
        updateProfile: function (userObject) {
            var token = $localStorage.currentUser.token;
            delete userObject.token;
            return $http({
                method: 'PUT',
                url: apiUrl + '/users',
                data: userObject,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                }
            });
        },
        assignRole: function (userObject) {
            var token = $localStorage.currentUser.token;
            delete userObject.token;
            return $http({
                method: 'PATCH',
                url: apiUrl + '/users?operType=assgin-role',
                data: userObject,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                }
            });
        },
        getAllUsers: function () {
            var token = $localStorage.currentUser.token;
            return $http({
                method: 'GET',
                url: apiUrl + '/users',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                }
            });
        },
        getUserByUsername: function (username) {
            var token = $localStorage.currentUser.token;
            //delete userObject.token;
            return $http({
                method: 'GET',
                url: apiUrl + '/users?username=' + username,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                }
            });
        },
        assignMentor: function (mentorProjectsObject) {
            var token = $localStorage.currentUser.token;
            //delete userObject.token;
            return $http({
                method: 'PATCH',
                url: apiUrl + '/users?operType=assign-mentor',
                data: mentorProjectsObject,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                }
            });
        }
    }

});
