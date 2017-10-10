"ues strict";

var mobi = angular.module("mobipromo");

mobi.service("MainRemoteResource",["$resource", "$http",'ULStorageService', '$q','HttpBuffer', function($resource, $http, ULStorageService, $q, HttpBuffer) {
    return {
        accountResource: $resource("/promo/public/account/:accountId", {},{
            signUpAccount: { method:"POST", isArray:false },
            resetPassword: { method:"PUT", params:{accountId:-1}, isArray:false },
            getAccountIco:{ url:'/promo/authed/account/ico/process', method:"GET", isArray:false}
        }),
        refreshToken: function(){
            var token = ULStorageService.getToken();
            var deferred = $q.defer();
            var promise = deferred.promise;
            var data = "refresh_token=" +  token.refresh_token + "&grant_type=refresh_token";
            $http.post("/promo/token", data, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Accept": "application/json",
                    "Authorization": "Basic cHJvbW9zZXJ2ZXI6ZTYxOTcyMDViYTZmOWM2"
                }
            }).then(function (response) {
                var expiredAt = new Date();
                var token = response.data;
                expiredAt.setSeconds(expiredAt.getSeconds() + token.expires_in);
                response.expires_at = expiredAt.getTime();
                ULStorageService.set('token', token);
                deferred.resolve(response);
                HttpBuffer.retryAll();
            }).catch(function (error) {
                deferred.reject(error);
            });
            return promise;
        },
        getToken: function(credentials){
            var data = "username=" +  encodeURIComponent(credentials.username) + "&password="
                    + encodeURIComponent(credentials.password) + "&grant_type=password";
            var deferred = $q.defer();
            var promise = deferred.promise;
            $http.post('/promo/token', data, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Accept": "application/json",
                    "Authorization": "Basic cHJvbW9zZXJ2ZXI6ZTYxOTcyMDViYTZmOWM2"
                }
            }).then(function (response) {
                var token = response.data;
                var expiredAt = new Date();
                expiredAt.setSeconds(expiredAt.getSeconds() + token.expires_in);
                response.expires_at = expiredAt.getTime();
                ULStorageService.set('token', token);
                deferred.resolve(response);
            }).catch(function(error){
                deferred.reject(error);
            });
            return promise;
        },
        logout:function(){
            ULStorageService.remove('token');
        },
        guid : function guid(){
            /** it just version 4 guid **/
            function s4(){
                return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            };
            return [s4(), s4(), '-', s4(), '-', s4(), '-', s4(), s4(), s4()].join();
        }

    };
}]).factory('AuthTokenInterceptor',["ULStorageService", "$q","HttpBuffer", "$rootScope", function(ULStorageService, $q, HttpBuffer, $rootScope){
    return {
        request: function(config){
            config.headers = config.headers || {};
            var token = ULStorageService.get('token');
            var needToken = config.url.indexOf("/promo/authed") > -1;
            if(needToken){
                config.headers.Authorization = 'Bearer ' + (token && token.access_token);
            }
            return config;
        },
        responseError: function(response){
            var config = response.config || {};
            var errorMsg = response.data && response.data.error ? response.data.error.toLowerCase() : '';
            switch (response.status) {
            case 401:
                if(ULStorageService.hasValidRefreshToken()) {
                    var deferred = $q.defer();
                    HttpBuffer.append(config, deferred);
                    $rootScope.$broadcast('event:auth-refreshToken', response);
                    return deferred.promise;
                }else{
                    ULStorageService.remove("token");
                    $rootScope.$broadcast('event:auth-loginRequired', response);
                };
                return $q.reject(response);
            case 403:
                $rootScope.$broadcast('event:auth-forbidden', response);
                break;
            }
            return $q.reject(response);
        }
    };
}]).factory('ULStorageService', ["localStorageService", function(localStorageService){
    return {
        get: function(key){
            return localStorageService.get(key);
        },
        set: function(key, obj){
            return localStorageService.set(key, obj);
        },
        remove: function(key){
            return localStorageService.remove(key);
        },
        hasValidRefreshToken: function(){
            var token = this.getToken();
            return token && token.expires_at && token.expires_at > new Date().getTime();
        },
        getToken: function(){
            return this.get('token');
        }
    };
}]).factory("HttpBuffer", ["$injector", function($injector){
    var buffer = [];

    function retryHttpRequest(config, deferred, $http) {
        function successCallback(response) {
            deferred.resolve(response);
        };
        function errorCallback(response) {
            deferred.reject(response);
        };
        $http && $http(config).then(successCallback, errorCallback);
    }

    return {
        append: function(config, deferred) {
            buffer.push({
                config: config,
                deferred: deferred
            });
        },
        rejectAll: function(reason) {
            if (reason) {
                for (var i = 0; i < buffer.length; ++i) {
                    buffer[i].deferred.reject(reason);
                }
            }
            buffer.length = 0;
        },
        retryAll: function(updater, $http) {
            for (var i = 0; i < buffer.length; ++i) {
                retryHttpRequest((updater && updater(buffer[i].config)) || buffer[i].config, buffer[i].deferred, $http);
            }
            buffer.length = 0;
        }
    };
    
}]);

