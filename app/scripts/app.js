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
    'firebase',
    'ui.bootstrap',
    'xeditable'
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
      when('/signout', {
        templateUrl: 'views/signout.html',
        controller: 'signoutController'
      }).
      when('/extendedPhraseEditor', {
        templateUrl: 'views/extendedPhraseEditor.html',
        controller: 'extendedPhraseController'
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

avlisApp.run(function(editableOptions) {
  editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
});

avlisApp.run(function($rootScope, $firebase){
  var epRef= new Firebase('https://dazzling-torch-3393.firebaseio.com/extendedPhrases');
  $rootScope.extendedPhrases = $firebase(epRef).$asArray();
})