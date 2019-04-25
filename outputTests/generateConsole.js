const makeStock = require('./CreateStock.js');


let perCb = 5000;
let totalEntered = 0;
let desiredEntries = 1000000;
let print = true;
let start = Date.now();
function initIfStillGoing() {
  print && console.error(totalEntered, '/', desiredEntries);
  print = !print;
  if (totalEntered < desiredEntries) {
    setTimeout(() => addN(perCb, initIfStillGoing));
  } else {
     console.error(Date.now() - start, 'ms');
     console.error('finished: ', totalEntered);
  }
}

function addN(n, cb) {
  for (var i = 0; i < n; i++) {
    console.log(JSON.stringify(makeStock()));
    totalEntered++;
  }
  cb();
}

initIfStillGoing();