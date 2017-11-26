exports.copySameTypeObject = copySameTypeObject;
exports.getArrayValuesFromJsons = getArrayValuesFromJsons;
exports.removeRedundantFromArrayOfJsons = removeRedundantFromArrayOfJsons;
exports.convertJsonIntoArrayValues = convertJsonIntoArrayValues;
exports.convertArrayIntoJson = convertArrayIntoJson;
exports.mergeArraysInArray = mergeArraysInArray;
exports.getTwoArraysDifferentiation = getTwoArraysDifferentiation;
function copySameTypeObject(source, target){

  for (var key in source) {
    if (source.hasOwnProperty(key)) {
      var val = source[key];
      target[key] = val;
    }
  }
  return target;
};



function getArrayValuesFromJsons(jsonList, field){

  let values = [];
  if(jsonList && Array.isArray(jsonList)){
    for(let i = 0; i < jsonList.length; i++){
      values.push(jsonList[i][field]);
    }
  }

  return values;
}


function removeRedundantFromArrayOfJsons(array, key){
  bigJson = convertArrayIntoJson(array, key);
  array = convertJsonIntoArrayValues(bigJson);
  return array;
}

function convertJsonIntoArrayValues(jsonObj){

  let result = [];
  if( !jsonObj){
    return result;
  }
  for(var i in jsonObj){
    result.push( jsonObj [i]);
  }
  return result;
}

function convertArrayIntoJson(array, key){

  let bigJson = {};
  if(!array) {
    return {};
  }
  for (var i = 0; i < array.length; i++) {
    bigJson[array[i][key]] = array[i];
  }
  return bigJson;
}

function mergeArraysInArray(arrays){
  let array = [];
  for(let i = 0; i < arrays.length; i++){
    array = array.concat(arrays[i]);
  }
  return array;
}

function getTwoArraysDifferentiation(newArray, oldArray, key){
  let newItems = [],  existingItems = [],  excludedItems = [];

  if(!oldArray){
    newItems = newArray;
    return {newItems, existingItems, excludedItems};
  }

  if(!newArray){
    existingItems = oldArray;
    return {newItems, existingItems, excludedItems};
  }

  const oldArrayJSON = convertArrayIntoJson(oldArray, key);
  const newArrayJSON = convertArrayIntoJson(newArray, key);



  //get new items
  for (var i = 0; i < newArray.length; i++) {
    if(!oldArrayJSON[newArray[i][key]]){
      newItems.push(newArray[i]);
    }else{
      existingItems.push(newArray[i]);
    }
  }

  //get excludedItems
  //get new items
  for (var i = 0; i < oldArray.length; i++) {
    if(!newArrayJSON[oldArray[i][key]]){
      excludedItems.push(oldArray[i]);
    }
  }

  return {newItems, existingItems, excludedItems};
}
