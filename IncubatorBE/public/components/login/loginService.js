fepsApp.factory('loginService', function ($http, envService, $localStorage) {

    var apiUrl = envService.read('apiUrl');
    var loginService = {};

    loginService.signIn = function (userName, password) {
        return $http({
            method: 'POST',
            url: apiUrl + '/login',
            data: {username: userName, password: password},
            headers: {}
        });
    }


    loginService.signUp = function (newUser) {
        return $http({
            method: 'POST',
            url: apiUrl + '/users',
            data: newUser,
            headers: {}
        });
    }
    
    loginService.getUserByUsername = function (username) {
        return $http({
            method: 'GET',
            url: apiUrl + '/users?username='+username,
            headers: {}
        });
    }

    loginService.signOut = function () {
        $localStorage.currentUser = null;
    }

    loginService.isAuthenticated = function () {
        var token = "-1";
        if ($localStorage.currentUser) {
            token = $localStorage.currentUser.token;
        }
        return $http({
            method: 'POST',
            url: apiUrl + '/authenticated',
            data: {token: token},
            headers: {}
        });
    }

    loginService.changePassword = function (oldPassword, password, confirmPassword) {
        return $http({
            method: 'patch',
            url: apiUrl + '/change-password',
            data: {
                "oldPassword": oldPassword,
                "password": password,
                "confirmPassword": confirmPassword
            },
            headers: {
                "Content-Type": "application/json",
                "Authorization":"Bearer "+$localStorage.currentUser.token
            }
        });
    }

    loginService.forgetPassword = function (email,language) {
        return $http({
            method: 'POST',
            url: apiUrl + '/forget-password',
            data: {
                "email": email,
                "language": language
            },
            headers: {
                "Content-Type": "application/json",
            }
        });
    }

    loginService.resetPassword = function (password, confirmPassword, token) {
        return $http({
            method: 'POST',
            url: apiUrl + '/reset-password',
            data: {
                "password": password,
                "confirmPassword": confirmPassword
            },
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            }
        });
    }
    return loginService;

});