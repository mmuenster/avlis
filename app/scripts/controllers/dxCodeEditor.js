'use strict';

avlisApp.controller('dxCodeEditorController', function($scope, $firebase) {
  var ref = new Firebase('https://dazzling-torch-3393.firebaseio.com/newDiagnosisCodes');
  $scope.messages = $firebase(ref).$asObject();
  $scope.codeToEdit = '';
  console.log($scope.messages);
  
  $scope.editCode = function() {
    $scope.editFields = $scope.messages[$scope.codeToEdit];
  };
  
  $scope.submitCode = function() {
    $scope.messages[$scope.codeToEdit] = $scope.editFields;
    $scope.messages.$save();
    $scope.submitMessage = 'Submit ' + $scope.codeToEdit + ' succeeded';
  };
});
