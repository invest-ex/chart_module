const cassandra = require('cassandra-driver');
const BbPromise = require('bluebird');
const redis = require('redis');
const mongo = require('mongodb');
const RealisticQueryMaker = require('./distributedTicker');

const clientR = redis.createClient();

clientR.get = BbPromise.promisify(clientR.get);

let errCount = 0;
clientR.on('error', (err) => {
	// console.log('error', +err);
});

const clientC = new cassandra.Client({ 
  contactPoints: ['127.0.0.1:9042'], 
  keyspace: 'investex',
  localDataCenter: 'datacenter1' ,
  promiseFactory: BbPromise.fromCallback
});

const url = 'mongodb://localhost:27017';
let collection;

mongo.MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
    console.log('connected');
    collection = client.db('investex').collection('stocks');
});


function genRandTicker() {
	letters = ["A", "B", "C", "D", "E", "F", "G", "H", 
		"I", "J", "K", "L", "M", "N", "O", "P", "Q", 
		"R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
	let val = Math.floor(Math.random()*1000000);
	let a = new Array(5).fill(0);
	return a.map(() => {
      letter = this.letters[val % 26];
      val = Math.floor(val / 26);
      return letter;
    }).join('');
}

function makeQuery(){
	return `SELECT * FROM stocks WHERE stockid='${genRandTicker()}' LIMIT 1;`;
}

let queryMaker = new RealisticQueryMaker();
let hit = 0;
function execR(){
	const ticker = queryMaker.getDistributedTicker();
	return clientR.get(ticker)
		.then((res) => {
			if (res) {hit++;return JSON.parse(res);}
			return clientC.execute(queryMaker.makeQuery(ticker))
				.then((res) => {
					clientR.set(ticker, JSON.stringify(res));
					return res;
				})
		});
}

function execC() {
	return clientC.execute(queryMaker.makeQuery());
}

function unpromisedExecM(cb) {
	return collection.find({stockId: queryMaker.getDistributedTicker()}).toArray(cb);
}

const execM = BbPromise.promisify(unpromisedExecM);

let times = 100000;
let cThreads = 64;
let mThreads = 64;
let threads = new Array(cThreads).fill(0).map(() => execC());
// let promise = execR();
console.time(`Cassandra ${times} requests, ${cThreads} promise chains`);
for (let i = 0; i < times; i += threads.length) {
	threads = threads.map((val) => val.then((val) => {return execC();}));
}

Promise.all(threads)
	.then(() => console.timeEnd(`Cassandra ${times} requests, ${cThreads} promise chains`))
	.then(() => {
		console.log(hit, ' is redis hits');
		threads = new Array(mThreads).fill(0).map(() => execM());
		console.time(`Mongo ${times} requests, ${mThreads} promise chains`);
		for (var i = 0; i < times; i += threads.length) {
			threads = threads.map((val) => val.then(() => execM() ));
		}
		return Promise.all(threads);
	})
	// .then(() => console.timeEnd(`Postgress ${times} requests, ${pThreads} promise chains`))
	.then(() => {
		console.timeEnd(`Mongo ${times} requests, ${mThreads} promise chains`);
		process.exit()
	});


