cache = {};

// Get element
function getElement(id, ignoreCache = false) {
  if (ignoreCache || !cache[id]) {
    cache[id] = document.getElementById(id);
  }
  return cache[id];
}

// Get input value
function getInput(id, ignoreCache = false) {
  if (ignoreCache || !cache[id]) {
    cache[id] = document.getElementById(id);
  }
  return cache[id].value;
}

// Set input
function setInput(id, val, ignoreCache = false) {
  if (ignoreCache || !cache[id]) {
    cache[id] = document.getElementById(id);
  }
  cache[id].value = val;
}

// Get input number
function getInputNumber(id) {
  return Number(getInput(id));
}

// Get input as JSON
function getInputJson(id) {
  try {
    return JSON.parse(getInput(id));
  } catch (err) {
    console.log(err);
  }
}

exports.getInput = getInput;
exports.getInputNumber = getInputNumber;
exports.setInput = setInput;
exports.getInputJson = getInputJson;
exports.getElement = getElement;