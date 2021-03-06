"use strict";

var app = angular.module("mobipromo",[
    "ngResource",
    "angular-md5",
    "monospaced.qrcode",
    "LocalStorageModule",
    "ui.router"
]);
app.config(function($stateProvider, $urlRouterProvider ) {
    $stateProvider
        .state('app', {
            url: '/',
            views: {
                'content@': {
                    templateUrl: 'app/views/ico.html',
                    controller: 'IcoController'
                }
            }
        })
        .state('app.signup', {
            url: 'signup',
            views: {
                'content@': {
                    templateUrl: 'app/views/signup.html',
                    controller: 'SignUpController'
                }
            }
        })
        .state('app.signin', {
            url: 'signin',
            views: {
                'content@': {
                    templateUrl: 'app/views/signin.html',
                    controller: 'LoginController'
                }
            }
        })
        .state('app.ico', {
            url: 'ico',
            views: {
                'content@': {
                    templateUrl: 'app/views/ico.html',
                    controller: 'IcoController'
                }
            }
        })
        .state('app.notice', {
            url: 'notice',
            views: {
                'content@': {
                    templateUrl: 'app/views/notice.html'
                }
            }
        })
    ;
    $urlRouterProvider.otherwise('/ico');
}).config(['$httpProvider', function($httpProvider){
    $httpProvider.interceptors.push("AuthTokenInterceptor");
}]);
app.run(['$rootScope', 'HttpBuffer', '$state','MainRemoteResource', 'ULStorageService','$timeout', function($rootScope, HttpBuffer, $state, MainRemoteResource, ULStorageService,$timeout){
    $rootScope.$on('event:auth-refreshToken', function refreshToken(){
        MainRemoteResource.refreshToken();
    });
    $rootScope.$on('event:auth-loginRequired', function gotoLogin(){
        HttpBuffer.rejectAll();
        $timeout(function(){$state.go("app.signin");},3000);
    });
    $rootScope.icoEnv = {
        couldLogin:true,
        couldLogout:false,
        couldList:false,
        couldSubscribe:false
    };
    $rootScope.logout = function logout(){
        $rootScope.icoEnv = {
            couldLogin:true,
            couldLogout:false,
            couldList:false,
            couldSubscribe:false
        };
        ULStorageService.remove("token");
        $state.go("app.signin");
    };
}]);

    
