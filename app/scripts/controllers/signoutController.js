'use strict';

avlisApp.controller('signoutController', ['$scope', '$firebase', '$location', '$sce', function ($scope, $firebase, $location, $sce) {
  var signoutQueueCount = 0;
  var signoutQueueProgressCounter = 0;
  var signoutQueue = {};
  var queueRef = new Firebase('https://dazzling-torch-3393.firebaseio.com/AveroQueue');
  var queueSync = $firebase(queueRef).$asArray();
  
  queueSync.$loaded(function () {
  	for (var x=0; x < queueSync.length; x++) {
  		if(queueSync[x].action==='pdfReview') {
  			signoutQueue[signoutQueueCount]=queueSync[x];
  			signoutQueueCount++;
  		}
  	}
  	
    if(signoutQueueCount>0) {
      $scope.signoutMonitor = signoutQueue[signoutQueueProgressCounter].caseNumber + '; Case ' + (signoutQueueProgressCounter+1) + ' of ' + signoutQueueCount;
      $scope.currentUrl = $sce.trustAsResourceUrl(signoutQueue[signoutQueueProgressCounter].url);
    } else {
      $scope.signoutMonitor = 'No cases to signout!';
      $scope.currentUrl = null;
    }

  });

  $scope.skip=function() {
    advanceCase();
  };

  $scope.remove=function() {
    $firebase(queueRef).$remove(signoutQueue[signoutQueueProgressCounter].nodeName);
    advanceCase();
  };

  $scope.signout=function() {
    $firebase(queueRef).$push({ 'action':'signout', 'caseNumber':signoutQueue[signoutQueueProgressCounter].caseNumber, 'doctor':'mmuenster'});
    $firebase(queueRef).$remove(signoutQueue[signoutQueueProgressCounter].nodeName);
    advanceCase($scope);
  };

  $scope.editCPTCodes=function() {
    var codeString = prompt('Enter the new code string...', 'Matthew Muenster');
    var codeArray = codeString.split(' ').sort();
    var newCodeString = '';
    for (var counter=0; counter < codeArray.length; counter++) {

      if(codeArray[counter]==='5') {
        newCodeString += '88305-G: ';
      } else if (codeArray[counter]==='4') {
        newCodeString += '88304-G: ';
      } else if (codeArray[counter]==='12') {
        newCodeString += '88312-G: ';
      } else if (codeArray[counter]==='42') {
        newCodeString += '88342-G: ';
      } else if (codeArray[counter]==='5T') {
        newCodeString += '88305-TC ';
      } else if (codeArray[counter]==='4T') {
        newCodeString += '88304-TC ';
      }
    }

    var proceed = confirm('Are these codes correct? \n ' + newCodeString);
    if (proceed) {
      $firebase(queueRef).$push({'action':'cptDeletes', 'caseNumber':signoutQueue[signoutQueueProgressCounter].caseNumber});
      $firebase(queueRef).$push({'action':'cptAdds', 'caseNumber':signoutQueue[signoutQueueProgressCounter].caseNumber, 'cptCodes':newCodeString });
      $firebase(queueRef).$push({'action':'pdfSave', 'caseNumber':signoutQueue[signoutQueueProgressCounter].caseNumber});
    } 
  };

  function advanceCase() {
    if(signoutQueueProgressCounter<signoutQueueCount-1) {
          signoutQueueProgressCounter++;
          $scope.signoutMonitor = signoutQueue[signoutQueueProgressCounter].caseNumber + '; Case ' + (signoutQueueProgressCounter+1) + ' of ' + signoutQueueCount;
          $scope.currentUrl = $sce.trustAsResourceUrl(signoutQueue[signoutQueueProgressCounter].url);
      } else {
          $scope.signoutMonitor = 'Signout Completed!';
          $scope.currentUrl = null;
      }    
  }

}]);

