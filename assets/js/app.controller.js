"use strict";


angular.module("mobipromo").controller("SignUpController", ["$scope", "MainRemoteResource", "$state","md5", function($scope, MainRemoteResource, $state, md5) {
    $scope.signUpModel = {
        data:{
        },
        action:{
        }
    };
    var model = $scope.signUpModel;
    model.action.signUp = function signUp(signUpData){
        var signUp = {
            account: signUpData.account,
            email: signUpData.email,
            password: md5.createHash((signUpData.password || "").trim())
        };
        console.log(JSON.stringify(signUp));
        $state.go("app.signin");
    };
    model.action.validate = function validate(){
        let isOk = model.data.account && model.data.account.trim().length> 5;//account ok
        isOk = isOk && model.data.email; //email ok
        isOk = isOk && model.data.password && model.data.password.trim().length > 8 && model.data.password == model.data.confirm;// password ok;
        return isOk;
    };
}]).controller("ContentController", ["$scope", function($scope) {
}]).controller("IcoController", ["$scope", function($scope) {
    $scope.icoModel = {
        data:{},
        display:{
        },
        action:{
        }
    };
    var model = $scope.icoModel;
    model.action.getAccountIcoProcess = function getAccountIcoProcess(){
        var accountIco = {
            ico:[
                {
                    bankType:'eth',
                    amount: 2,
                    address: '0xa2eF9863F9bd037bfA2b645aCe5968c822641D46'
                },{
                    bankType:"btc",
                    amount: 1,
                    address: "1HwtQCDGktHgJX3LTjf132GAFoWgyY​Esdw"
                },{
                    bankType:"acc",
                    amount: 32000,
                    address: "0xa2eF9863F9bd037bfA2b645aCe5968c822641D46"
                }
            ]
        };
        var ico = {};
        for(var index = 0; index < accountIco.ico.length; ++index){
            var icoItem = accountIco.ico[index];
            switch (icoItem.bankType) {
                case 'eth':
                ico.eth = icoItem;
                break;
                case 'btc':
                ico.btc = icoItem;
                break;
                case 'acc':
                ico.acc = icoItem;
                break;
            }
        }
        model.data.ico = ico;
    };

    model.action.getAccountIcoProcess();
}]).controller("LoginController", ["$scope", "$rootScope", "MainRemoteResource", "$state","md5", function($scope, $rootScope, MainRemoteResource, $state, md5){
    $scope.signinModel = {
        data:{
            loading: 0,
            account: '',
            password: ''
        }
    };
    $scope.display = {};
    $scope.validSignInInfo = function validSignInInfo(){
        var infoIsValid = $scope.signinModel.data.account && $scope.signinModeldata.data.password;
        infoIsValid = infoIsValid && !$scope.signinModel.data.loading;
        return infoIsValid;
    };
    $scope.signIn = function signIn(){
        var credentials = {
            username: $scope.signinModel.data.account,
            password: md5.createHash($scope.signinModel.data.password)
        };
        $scope.signinModel.data.loading++;
        MainRemoteResource.getToken(credentials).then(function(success){
            $state.go('app.ico');
            $scope.signinModel.data.loading--;
            $scope.display.error = undefined;
        }).catch(function(error){
            console.log(error);
            $scope.signinModel.data.loading--;
            if(error && error.data && error.data.code){
                $scope.display.error = error.data;
            };
        });
    };
    $rootScope.icoEnv = {
        couldLogin:true,
        couldLogout:false,
        couldList:false,
        couldSubscribe:false
    };
}]);
