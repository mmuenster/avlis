'use strict';

/**
 * @ngdoc overview
 * @name avlisApp
 * @description
 * # avlisApp
 *
 * Main module of the application.
 */
var avlisApp=angular
  .module('avlisApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'firebase'
  ])
  .config(function($routeProvider) {
    $routeProvider.
      when('/caseDataEditor', {
        templateUrl: 'views/caseDataEditor.html',
        controller: 'caseDataEditorController'
      }).
      when('/dxCodeEditor', {
        templateUrl: 'views/dxCodeEditor.html',
        controller: 'dxCodeEditorController'
      }).
      when('/Signout', {
        templateUrl: 'views/signout.html',
        controller: 'signoutController'
      }).
      otherwise({
        redirectTo: '/main',
        templateUrl: 'views/login.html'
      });
  });

avlisApp.controller('navigationController', ['$scope', '$location', function ($scope, $location) {
    $scope.isCurrentPath = function (path) {
      return $location.path() === path;
    };
  }]);

avlisApp.controller('LoginController', function ($scope, $rootScope, $firebaseAuth) {
  $scope.login = function login() {
      var fbRef = new Firebase('https://dazzling-torch-3393.firebaseio.com');
      console.log(fbRef);
      var authObj = $firebaseAuth(fbRef);
      console.log(authObj);
      var x = fbRef.authWithPassword({email:'mmuenster@averodx.com', 'password':'Password1'}, function(error, authData) {
        if (error) {
          console.log('Login Failed!', error);
        } else {
          console.log('Authenticated successfully with payload:', authData);
        }
      });
      console.log(x);
    };
});

