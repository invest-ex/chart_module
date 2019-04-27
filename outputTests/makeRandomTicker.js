

// class StockCode {
//   constructor() {
//     this.stock = 0
//   }
//   makeTicker() {
//     this.stock++;
//     let val = this.stock;
//     let a = new Array(5).fill('A');
//     let letter;
//     return a.map(() => {
//       letter = this.letters[val % 26];
//       val = Math.floor(val / 26);
//       return letter;
//     }).join('');
//   }
// }

process.stdin.setEncoding('utf8');

process.stdin.on('readable', () => {
  let chunk;
  // Use a loop to make sure we read all available data.
  while ((chunk = process.stdin.read()) !== null) {
    console.log(makeTicker(parseInt(chunk)));
  }
});

process.stdin.on('end', () => {
  process.stdout.write('\nend');
});

function makeTicker(val = 0) {
    const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    let a = new Array(5).fill('A');
    let letter;
    return a.map(() => {
      letter = letters[val % 26];
      val = Math.floor(val / 26);
      return letter;
    }).join('');
}

module.exports = makeTicker;