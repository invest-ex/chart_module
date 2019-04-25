const { Client } = require('pg');
const FileToDBManager = require('./fileToDB.js');

const client = new Client({
	user:'user1',
	password:'asdf',
	database:'mydb1'
});

client.connect();

function createQuery(buffer) {
  return createBactchedQuery([buffer]);
}

function createBactchedQuery(buffers) {
  let bufferArr = JSON.parse(buffers);
  let a = `
    INSERT INTO stocks (
      stockid,
      averagestock,
      changepercent,
      relatedtags,
      companyname,
      noofowners,
      recommendationpercent,
      day,
      week,
      month,
      threemonth,
      year,      
      fiveyear
    ) VALUES 
      ${bufferArr.map((buffer) => makeValues(buffer))}
    ;
  `
  return a;
}

function makeValues(buffer) {
  let obj = JSON.parse(buffer.toString());
  let {stockInfo, stockData} = obj;
  let value = `(
    '${obj.stockId}', 
    ${obj.averageStock}, 
    ${obj.changePercent},
    ARRAY[${stockInfo.relatedTags}],
    '${stockInfo.stockCompany}',
    ${stockInfo.noOfOwners},
    ${stockInfo.recommendationPercent},
    ARRAY[${stockData.day}],
    ARRAY[${stockData.week}],
    ARRAY[${stockData.month}],
    ARRAY[${stockData.threeMonth}],
    ARRAY[${stockData.year}],
    ARRAY[${stockData.fiveYear}]
  )`;
  return value;
}

function writeFunc(data, encoding, cb) {
	client.query(createBactchedQuery(data), cb);
}


client.query(`
  DROP TABLE IF EXISTS stocks;
`);
client.query(`
	CREATE TABLE stocks (
	StockId VARCHAR(5) PRIMARY KEY,
	AverageStock float8,
	ChangePercent float8,
	RelatedTags TEXT[],
	CompanyName VARCHAR(50),
	NoOfOwners INTEGER,
	RecommendationPercent INTEGER,
	day float8[],
	week float8[],
	month float8[],
	threemonth float8[],
	year float8[],
	fiveYear float8[]
	);
`);
console.log('made db');
let seed = 1;
let file = './files/data.txt';
let name = 'Postgres';
let batch = 200;

var a = new FileToDBManager(writeFunc, file, seed, name, batch);