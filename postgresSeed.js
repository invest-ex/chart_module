const { Client } = require('pg');
const FileToDBManager = require('./fileToDB.js');

const client = new Client({
	user:'user1',
	password:'asdf',
	database:'mydb1'

});

client.connect();

function createQuery(buffer) {
	let obj = JSON.parse(buffer.toString());
	let a = `
		INSERT INTO stocks (stockid, price) 
		VALUES ('${obj.stockId}', ${obj.stockInfo.noOfOwners});
	`
	return a;
	// return `INSERT INTO stocks (StockId, Price) VALUES ('ABSEX', 3)`;
}

function writeFunc(data, encoding, cb) {
	client.query(createQuery(data), cb);
}


client.query(`
  DROP TABLE IF EXISTS stocks;
`);
client.query(`
  CREATE TABLE stocks (
    stockid VARCHAR (5) PRIMARY KEY,
    price INTEGER
  );
`);
let seed = 1;
let file = './files/dataSmall.txt';
let name = 'Postgres';

var a = new FileToDBManager(writeFunc, file, seed, name);