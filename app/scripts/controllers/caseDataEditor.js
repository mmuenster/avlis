'use strict';

avlisApp.controller('caseDataEditorController', function($scope, $firebase, $document) {
  var fb = new Firebase('https://dazzling-torch-3393.firebaseio.com');
  var caseDataRef = new Firebase('https://dazzling-torch-3393.firebaseio.com/CaseData');
  var queueRef = new Firebase('https://dazzling-torch-3393.firebaseio.com/AveroQueue');
  var dxCodesRef = new Firebase('https://dazzling-torch-3393.firebaseio.com/newDiagnosisCodes');
  var frontHelpersRef = new Firebase('https://dazzling-torch-3393.firebaseio.com/frontHelpers');  
  var marginHelpersRef = new Firebase('https://dazzling-torch-3393.firebaseio.com/marginHelpers');
  var commentHelpersRef = new Firebase('https://dazzling-torch-3393.firebaseio.com/commentHelpers');
  var frontHelpers = $firebase(frontHelpersRef).$asObject();
  var marginHelpers = $firebase(marginHelpersRef).$asObject();
  var commentHelpers = $firebase(commentHelpersRef).$asObject();  
  var dxCodes = $firebase(dxCodesRef).$asObject();
  var caseDataSync = $firebase(caseDataRef);
  $scope.messages = caseDataSync.$asObject();
  $scope.caseToEdit = '';
  var queueSync = $firebase(queueRef);
  var counter = 0;
  

  dxCodes.$loaded(function() {
    console.log(dxCodes.bccn);
  }, function(error) {
    console.error('Error:', error);
  });

  $scope.editCase = function() {
    $scope.editFields = $scope.messages[$scope.caseToEdit];
    if($scope.editFields.diagnosisTextArea==='') {
      $scope.loadFields();
      setTimeout(function() { $scope.gotoNextBlank(); }, 300);
    }
  };
  
  $scope.dxCodeEntry = function() {
    var baseCodeThisCase, useMicro, useICD9, j, rawDXCode, lastCodeUsed, frontHelpersThisCase, finishPos;
    var x = document.querySelector('textarea#diagnosisTextArea');
    var startPos= x.selectionStart;
    var theText = x.value;
    var alertText = '';

    for(j=startPos - 1; j>=0; j--) {
      if(j===0 || theText.charCodeAt(j)===10) {
        finishPos = j;
        break;
      }
    }
    rawDXCode=theText.slice(finishPos,startPos);
    x.setSelectionRange(finishPos + 1,startPos);
    lastCodeUsed = rawDXCode;

    if (rawDXCode.search(/[/]/)>0) { useMicro = 1; } else { useMicro=0; }
    if (rawDXCode.search(/[*]/)>0) { useICD9 = 1; } else { useICD9 = 0; }
    
    var dxCode = rawDXCode.slice(0, rawDXCode.length - useMicro - useICD9);
    var dxCodeSplitA = dxCode.split(';');
    var dxCodeSplitB = dxCodeSplitA[0].split('.');
    var dxCodeSplitC = dxCodeSplitB[0].split(':');
    
    if(dxCodeSplitC[1]===undefined) {
      baseCodeThisCase=dxCodeSplitC[0].trim();
      frontHelpersThisCase = '';
    } else {
      baseCodeThisCase = dxCodeSplitC[1].trim();
      frontHelpersThisCase = dxCodeSplitC[0];
    }

    var marginCodeThisCase = dxCodeSplitB[1] || '';
    var commentHelpersThisCase = dxCodeSplitA[1] || '';
    var buildingText = '';
    frontHelpersThisCase = frontHelpersThisCase.trim();
    baseCodeThisCase = baseCodeThisCase.trim();
    marginCodeThisCase = marginCodeThisCase.trim();
    commentHelpersThisCase = commentHelpersThisCase.trim();



    for (counter=0; counter < frontHelpersThisCase.length; counter++) {
      buildingText += frontHelpers[frontHelpersThisCase[counter]] + ' ';
    }

    //console.log('base Code DX = |' + baseCodeThisCase + '|')
    buildingText += dxCodes[baseCodeThisCase][2].trim();  //This is the diagnosis line

    if(marginCodeThisCase) {
      buildingText += '; ' + marginHelpers[marginCodeThisCase[0]].trim();
    } else {
      buildingText += '.';  //marginCodes in database contain a period.  If not using one, add period.
    }

//Build comment if there are comment helpers, a comment for the base code, or a micro
    var commentNeeded = commentHelpersThisCase || dxCodes[baseCodeThisCase][3] || useMicro;
    if(commentNeeded) {
      buildingText += '\n\nComment:  ';

      for(counter=0; counter < commentHelpersThisCase.length; counter++) {
        buildingText += commentHelpers[commentHelpersThisCase[counter]] + '  ';
      }

      if(dxCodes[baseCodeThisCase][3]) {
        buildingText += dxCodes[baseCodeThisCase][3].trim() + '  ';
      }

      if(useMicro) {
        buildingText += dxCodes[baseCodeThisCase][4].trim();
      }

      if(useICD9) {
        buildingText += ' (' + dxCodes[baseCodeThisCase][6] + ')';
      }

      buildingText += '\n';
    } else {
      if(useICD9) {
        buildingText += ' ' + '(' + dxCodes[baseCodeThisCase][6] + ')\n';
      } else {
        buildingText += '\n';
      }
    }

    buildingText += '~~' + dxCodes[baseCodeThisCase][5].trim() + '~~\n';
    buildingText = buildingText.trim();

    var currentSelectionStart = document.getElementById('diagnosisTextArea').selectionStart;
    var currentSelectionEnd = document.getElementById('diagnosisTextArea').selectionEnd;
    var firstHalf = $scope.editFields.diagnosisTextArea.substr(0, currentSelectionStart);
    var secondHalf = $scope.editFields.diagnosisTextArea.substr(currentSelectionEnd, $scope.editFields.diagnosisTextArea.length);
    
    $scope.editFields.diagnosisTextArea = firstHalf + buildingText + secondHalf;
    
    setTimeout(function() { $scope.gotoNextBlank(); }, 400);
  };

  $scope.gotoNextBlank = function() {
    var currentSelectionStart = document.getElementById('diagnosisTextArea').selectionStart;
    var input = document.getElementById('diagnosisTextArea');
    var n = $scope.editFields.diagnosisTextArea.search(/[*][*][*]/);
    if (n>-1) {
      input.focus();
      input.setSelectionRange(n, n+3);
    }
  };

  $scope.loadFields = function() {
    var headerText = '';
    var site = '';
    var grossPhrase = '';

    for (var key in $scope.editFields.jars) {
      if (!$scope.editFields.jars.hasOwnProperty(key)) { continue; }
      //Do your logic with the property here
      $scope.editFields.jars[key].site = toTitleCase($scope.editFields.jars[key].site);
      site = $scope.editFields.jars[key].site;
      grossPhrase = procedureTextFromGross($scope.editFields.jars[key].grossDescription);
      if(grossPhrase) {
        headerText += key + ') ' + site + ', ' + grossPhrase + ':\n***\n\n';
      } else {
        headerText += key + ') ' + site + ':\n***\n\n';
      }
      }
    $scope.editFields.diagnosisTextArea = headerText;
    $scope.editFields.photoCaption = $scope.editFields.caseNumber + ' A';
  };

  $scope.submitCase = function() {
    $scope.messages[$scope.caseToEdit] = $scope.editFields;
    $scope.messages.$save();
    $scope.submitMessage = 'Submit ' + $scope.caseToEdit + ' succeeded';
    queueSync.$push({ 'action':'writeCase', 'caseNumber':$scope.caseToEdit, 'doctor':'mmuenster'});
    $scope.editFields = {};
    $scope.caseToEdit = '';
    $document[ 0 ].getElementById('input_codeToEdit').focus();
  };
});

function procedureTextFromGross(gross) {
  var shavePos = gross.search(/(sb.)/) + gross.search(/ shave /) + 2;
  var punchPos = gross.search(/(pb.)/) + gross.search(/ punch /) + 2;
  var excisionPos = gross.search(/(ex.#)/) + gross.search(/ ellipt/) + 2;
  
  if(shavePos>0) { return 'Shave Biopsy'; }
  else if(punchPos>0) {return 'Punch Biopsy'; }
  else if(excisionPos>0) {return 'Excision'; }
  //else if(nailPos>0) {return 'Nail Clipping'; }
  return '';
}

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}
