const faker = require('faker');
const fs = require('fs');

const stream = fs.createWriteStream('./files/dataStream.txt');

let bigArr = new Array(100).fill(3);
let obj;

function replaceAll(target, search, replacement) {
  return target.replace(new RegExp(search, 'g'), replacement);
}
function randInt(lo, hi) {
  return Math.floor(Math.random() * (hi - lo) + lo);
}

function stockArr(num = 100) {
  return new Array(num).fill(0).map(() => faker.commerce.price());
}

class StockCode {
  constructor() {
    this.stock = 0
;    this.letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
  }
  makeTicker() {
    this.stock++;
    let val = this.stock;
    let a = new Array(5).fill('A');
    let letter;
    return a.map(() => {
      letter = this.letters[val % 26];
      val = Math.floor(val / 26);
      return letter;
    }).join('');
  }
}
var codeMaker = new StockCode();

let stockList = []

function makeStock() {
  let obj;
    obj = {};
  obj.stockInfo = {
    relatedTags:["'one'", "'two'"],
    stockCompany: replaceAll(faker.company.companyName(), "'", ""),
    noOfOwners: randInt(1, 10000),
    recommendationPercent: randInt(0, 100)
  }
  obj.stockData = {
    day: stockArr(107),
    week: stockArr(84),
    month: stockArr(30),
    threeMonth: stockArr(90),
    year: stockArr(100),
    fiveYear:stockArr(100)
  }
  obj.stockId = codeMaker.makeTicker(),
  obj.averageStock = faker.commerce.price();
  obj.changePercent = randInt(0, 40)/40;
  return obj;
}

module.exports = makeStock;