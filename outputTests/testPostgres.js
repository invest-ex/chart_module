const { Client } = require('pg');
const client = new Client({
});

client.connect();
client.query(`
  DROP TABLE IF EXISTS stocks;
`);
client.query(`
  CREATE TABLE stocks (
    StockId VARCHAR (5) PRIMARY KEY,
    Price INTEGER
  );
`);


client.query(`INSERT INTO stocks (StockId, Price) VALUES ('ABSEX', 3)`, (err, data) => {console.log(err, data)})