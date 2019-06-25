const mongo = require('mongodb');
const FileToDBManager = require('./fileToDB.js');


const client = mongo.MongoClient;

const url = 'mongodb://localhost:27017';
let collection;

client.connect(url, (err, client) => {
    console.log('connected');
    collection = client.db('investex').collection('stocks');

    let a = new FileToDBManager(writeFunc, './files/data.txt', 32, 'Mongo');

});




let parse = (data) => JSON.parse(data.toString());

let writeFunc = (data, encoding, cb) => {
	collection.insert(parse(data), (err) => {err&&console.log('error is' + err); cb()});

}

