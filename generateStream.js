const makeStock = require('./CreateStock.js');
var fs = require('fs');
var stream = fs.createWriteStream('./files/dataSmall.txt');



let i = 0;
let limit = 100000;
console.time(`Stream write time: ${limit}`);

function loadData() {
  while (i < limit) {
    i++;
    if (i % 10000 === 0) {
      console.error(i, '/', limit);
    }
    if (!stream.write(JSON.stringify(makeStock()) + '\n')) {
      break;
    }
  }
  if (i >= limit) {
    console.timeEnd(`Stream write time: ${limit}`);
    stream.end();
  }

}

loadData();
stream.on('drain', loadData);
