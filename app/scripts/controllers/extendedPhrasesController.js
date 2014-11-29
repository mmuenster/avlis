//Extended phrase controller

'use strict';

avlisApp.controller('extendedPhraseController', function($scope, $firebase, $document, $rootScope) {


console.log($scope.extendedPhrases);

$scope.updateExtPhrase=function(extPhrase) {
	$scope.extendedPhrases.$save(extPhrase);
}

$scope.deleteExtPhrase=function(extPhrase) {
	$scope.extendedPhrases.$remove(extPhrase);
}
});  
