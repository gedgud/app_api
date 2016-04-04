// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

var $ip = "http://86.100.222.248:8081/";
//http://192.168.1.66:8081/

function onLoad() {
    document.addEventListener("deviceready", onDeviceReady, false);
}

// device APIs are available
//
function onDeviceReady() {
    // Now safe to use device APIs
}

var facebookExample = angular.module('starter', ['ionic', 'ngStorage', 'ngCordova', 'ngCordovaOauth'])


facebookExample.run(function ($rootScope, $ionicPlatform) {

    $rootScope.appReady = { status: false };

    $ionicPlatform.ready(function () {

        console.log("Tst");
        $rootScope.appReady.status = true;
        $rootScope.$apply();

        if(window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if(window.StatusBar) {
            StatusBar.styleDefault();
        }
    });
});


facebookExample.config(function ($stateProvider, $urlRouterProvider, $compileProvider, $cordovaFacebookProvider) {
    $stateProvider
        .state('login', {
            url: '/login',
            templateUrl: 'templates/login.html',
            controller: 'LoginController'
        })
        .state('home', {
            url: '/home',
            templateUrl: 'templates/home.html',
            controller: 'MainController'
        })
        .state('profile', {
            url: '/profile',
            templateUrl: 'templates/profile.html',
            controller: 'ProfileController'
        })
        .state('api', {
            url: '/api',
            templateUrl: 'templates/api.html',
            controller: 'APIController'
        });

    $urlRouterProvider.otherwise('/login');

    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|content|file|assets-library):/);

    var appID = 136301300064728;
    var version = "v2.0"; // or leave blank and default is v2.0
    $cordovaFacebookProvider.browserInit(appID, version);

});

facebookExample.controller("MainController", function ($scope, $cordovaOauth, $localStorage, $location) {
    $scope.init = function () {
        if ($localStorage.hasOwnProperty("accessToken") === true) {
            $scope.data = $localStorage.Data;

            $scope.isLogin = true;
        } else {
            $location.path("/login");
        }
    };
});

facebookExample.controller("APIController", function ($scope, $http, $cordovaOauth, $localStorage, $location) {


    $scope.data = {};

    $scope.submit = function () {

        var link = 'http://86.100.222.248:8081/user/login';
        $http.post(link, { 'data': $scope.data }).then(function (res) {
            $scope.response = res.data;
            //alert(res.data);
        }, function (err) {
            //alert(JSON.stringify(err, null, 4));
        });
    };

    $scope.init = function () {
        //start controller
    };


});

facebookExample.controller("LoginController", function ($scope, $ionicSideMenuDelegate, $http, $cordovaOauth, $localStorage, $location, $rootScope, $cordovaCamera, $cordovaImagePicker, $cordovaFacebook) {

    //ionic plugin add https://github.com/Wizcorp/phonegap-facebook-plugin.git --variable APP_ID="136301300064728" --variable APP_NAME="myApplication"
    $scope.login = function () {

        $cordovaFacebook.login(["public_profile", "email", "user_friends"])
        .then(function (success) {
            alert("Prisijungei");
        }, function (error) {
            // error
        });



        /*$cordovaOauth.facebook("136301300064728", ["email", "public_profile"], { redirect_uri: "http://localhost/callback" }).then(function (result) {
            $localStorage.accessToken = result.access_token;
            $location.path("/profile");
        }, function(error) {
            alert(error);
            console.log(error);
        });*/
    };


    $scope.getPhoto = function () {
        console.log('Getting camera');
        Camera.getPicture({
            quality: 75,
            targetWidth: 320,
            targetHeight: 320,
            saveToPhotoAlbum: false
        }).then(function (imageURI) {
            console.log(imageURI);
            $scope.lastPhoto = imageURI;
        }, function (err) {
            console.err(err);
        });
    };

    $scope.ready = false;
    $scope.images = [];

    $rootScope.$watch('appReady.status', function () {
        console.log('watch fired ' + $rootScope.appReady.status);
        if ($rootScope.appReady.status) $scope.ready = true;
    });

    $scope.selImages = function () {

        var options = {
            quality: 50,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            targetWidth: 200,
            targetHeight: 200
        };

        $cordovaCamera.getPicture(options).then(function (imageUri) {
            console.log('img', imageUri);
            $scope.images.push(imageUri);

        }, function (err) {
            // error
        });

    };


    $scope.$on('$ionicView.enter', function () {
        $ionicSideMenuDelegate.canDragContent(false);
    });
    $scope.$on('$ionicView.leave', function () {
        $ionicSideMenuDelegate.canDragContent(true);
    });


    $scope.init = function () {

        $http.get($ip + '/users').then(function (resp) {
            $scope.conditions = resp.data;
            
            //////////////alert(JSON.stringify(user['user4'], null, 4));

        }, function (err) {
            console.error('ERR', err);
            // err.status will contain the status code
        });

        if ($localStorage.hasOwnProperty("accessToken") === true) {
            $location.path("/home");
        }
    };


});

facebookExample.controller("ProfileController", function($scope, $http, $localStorage, $location) {

    $scope.data = {};

    $scope.submit = function () {
        if ($localStorage.hasOwnProperty("accessToken") === true) {

            $scope.data.accessToken = $localStorage.accessToken;


            var link = 'http://86.100.222.248:8081/api/update';
            $http.post(link, { 'data': $scope.data }).then(function (res) {
                //$scope.response = res.data;
                alert("DUOMENYS ATNAUJINTI");
            }, function (err) {
                //alert(JSON.stringify(err, null, 4));
            });
        }
    };

    $scope.init = function() {
        if($localStorage.hasOwnProperty("accessToken") === true) {
            $http.get("https://graph.facebook.com/v2.2/me", { params: { access_token: $localStorage.accessToken, fields: "id,name,gender,location,website,picture,relationship_status", format: "json" }}).then(function(result) {
                $scope.profileData = result.data
                $localStorage.Data = result.data;
                //$state.go($state.current, {}, { reload: true });

                
                result.data.accesToken = $localStorage.accessToken;

                var link = 'http://86.100.222.248:8081/user/login';
                $http.post(link, { 'data': result.data }).then(function (res) {
                    $scope.userdata = res.data;
                }, function (err) {
                    //alert(JSON.stringify(err, null, 4));
                });

            }, function(error) {
                alert(JSON.stringify(error, null, 4));
                console.log(error);
            });
        } else {
            alert("Not signed in");
            $location.path("/login");
        }
    };

});

facebookExample.controller("FeedController", function($scope, $http, $localStorage, $location) {

    $scope.init = function() {
        if($localStorage.hasOwnProperty("accessToken") === true) {
            $http.get("https://graph.facebook.com/v2.2/me/feed", { params: { access_token: $localStorage.accessToken, format: "json" }}).then(function(result) {
                $scope.feedData = result.data.data;
                $http.get("https://graph.facebook.com/v2.2/me", { params: { access_token: $localStorage.accessToken, fields: "picture", format: "json" }}).then(function(result) {
                    $scope.feedData.myPicture = result.data.picture.data.url;
                });
            }, function(error) {
                alert("There was a problem getting your profile.  Check the logs for details.");
                console.log(error);
            });
        } else {
            alert("Not signed in");
            $location.path("/login");
        }
    };

});
