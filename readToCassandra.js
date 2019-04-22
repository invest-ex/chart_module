const fs = require('fs');
const readLine = require('readline');
const { Writable } = require('stream');
const cassandra = require('cassandra-driver');

let streams = 32;
console.time(`Cassandra write ${streams} streams`);
const readStream = fs.createReadStream('./files/data.txt');

const lineReader = readLine.createInterface({
	input: readStream,
  console: false, 
});

const client = new cassandra.Client({ 
  contactPoints: ['localhost'], 
  keyspace: 'cycling',
  localDataCenter: 'datacenter1' 
});

class DbWriteManager {
	constructor(writeFunc, restartFunc, numStreams = 4) {
		this.writeFunc = writeFunc;
		this.restartFunc = restartFunc;
		this.numStreams = numStreams;
		this.streams = [];
    this.streamsFull = [];
		let stream;
		for (let i = 0; i < numStreams; i++) {
			stream = new Writable({write: function writeFunc(data, encoding, cb) {
        client.execute(createQuery(data), cb);
      }});
      this.streamsFull.push(false);
			stream.on('drain', ()=> {
        this.streamsFull[i] = false;
        restartFunc();
      });
			this.streams.push(stream);
		}
	}

	write(data) {
    let j = 0;
    while (j < this.numStreams) {
      if (this.streamsFull[j]) {
        j ++; 
        continue;
      }
      let worked = this.streams[j].write(data);
      if (!worked)
      {
        this.streamsFull[j] = true;
      } 
      break;

    }
		return j < this.numStreams;
	}
}
let q = 0;
let createQuery = (buffer) => {
  q++;
	let obj = JSON.parse(buffer.toString());
	let {stockInfo, stockData} = obj;
	query = `
		INSERT INTO stocks (
			StockId, 
        	AverageStock, 
        	ChangePercent,
        	RelatedTags,
        	CompanyName,
        	NoOfOwners,
        	RecommendationPercent,
        	day,
        	week,
        	month,
        	threeMonth,
        	year,
        	fiveYear
        ) VALUES (
        	'${obj.stockId}', 
        	${obj.averageStock}, 
        	${obj.changePercent},
        	[${stockInfo.relatedTags}],
        	'${stockInfo.stockCompany}',
        	${stockInfo.noOfOwners},
        	${stockInfo.recommendationPercent},
        	[${stockData.day}],
        	[${stockData.week}],
        	[${stockData.month}],
        	[${stockData.threeMonth}],
        	[${stockData.year}],
        	[${stockData.fiveYear}]
		);
	`;
	return query;
}
let q2 = 0;
let writeFunc = (data, encoding, cb) => {
	client.execute(createQuery(data), cb);
}

let restartLineReader = () => {

	while (bufferLines.length) {
    let line = bufferLines.pop();
    if (!dbWrite.write(line)) {
      bufferLines.push(line);
      return;
    }
  }
  lineReader.resume();

}
const dbWrite = new DbWriteManager(writeFunc, restartLineReader, streams);

let bufferLines = [];
let lineN = 0;
let lastLineN = -1;
lineReader.on('line', function (line) {
  lineN++;
	if(!dbWrite.write(line)) {
		lineReader.pause();
		bufferLines.push(line);
	}
});
let tick = 0;
setInterval(()=>{
  console.log(lineN, '/', ++tick);
  if (lineN === lastLineN) {
    console.timeEnd(`Cassandra write ${streams} streams`);
    process.exit();
  } 
  lastLineN = lineN;
}, 1000);
