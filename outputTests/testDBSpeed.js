const cassandra = require('cassandra-driver');
const {Client} = require('pg');
const BbPromise = require('bluebird');

const clientC = new cassandra.Client({ 
  contactPoints: ['localhost'], 
  keyspace: 'investex',
  localDataCenter: 'datacenter1' ,
  promiseFactory: BbPromise.fromCallback
});

const clientP = new Client({
	user:'user1',
	password:'asdf',
	database:'mydb1'
});

clientP.connect();


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
	return `SELECT * FROM stocks WHERE stockid='${genRandTicker()}'`;
}

class RealisticQueryMaker {
	constructor() {
    this.topCompanies = new Array(10).fill(0).map(()=>genRandTicker());
    this.commonCompanies = new Array(100).fill(0).map(()=>genRandTicker());
    this.occasionalCompanies = new Array(1000).fill(0).map(()=>genRandTicker());
    this.rareCompanies = new Array(1000000).fill(0).map(()=>genRandTicker());
	}

  getDistributedTicker(){
    let roll = Math.random();
    if (roll < 0.5) {
      return this.randomChoice(this.topCompanies);
    } else if (roll < 0.75) {
      return this.randomChoice(this.commonCompanies);
    } else if (roll < 0.95) {
      return this.randomChoice(this.occasionalCompanies);
    } else {
      return this.randomChoice(this.rareCompanies);
    }

  }

  randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  makeQuery() {
    let a = `SELECT * FROM stocks WHERE stockid='${this.getDistributedTicker()}'`;
    return a
  }



	genRandTicker() {
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
}

let queryMaker = new RealisticQueryMaker();

function execC(){
	return clientC.execute(queryMaker.makeQuery());
}

function execP() {
	return clientP.query(queryMaker.makeQuery());
}

let times = 10000;
let cThreads = 30;
let pThreads = 1;
let threads = new Array(cThreads).fill(0).map(() => execC());
let promise = execC();
console.time(`Cassandra ${times} requests, ${cThreads} promise chains`);
for (var i = 0; i < times; i += threads.length) {
  promise = promise.then(execC);
	threads = threads.map((val) => val.then(execC));
}
Promise.all(threads)
	.then(() => console.timeEnd(`Cassandra ${times} requests, ${cThreads} promise chains`))
	.then(() => {
		console.time();
		// threads = new Array(pThreads).fill(0).map(() => execP());
		// console.time(`Postgress ${times} requests, ${pThreads} promise chains`);
		// for (var i = 0; i < times; i += threads.length) {
		// 	threads = threads.map((val) => val.then(execP));
		// }
		// return Promise.all(threads);
	})
	// .then(() => console.timeEnd(`Postgress ${times} requests, ${pThreads} promise chains`))
	.then(() => process.exit());


