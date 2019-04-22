const fs = require('fs');
const readLine = require('readline');
const { Writable } = require('stream');
const cassandra = require('cassandra-driver');

const readStream = fs.createReadStream('./files/dataSmall.txt');

const lineReader = readLine.createInterface({
	input: readStream,
  console: false, 
});

const client = new cassandra.Client({ 
  contactPoints: ['localhost'], 
  keyspace: 'investex',
  localDataCenter: 'datacenter1' 
});

class DbWriteManager {
	constructor(writeFunc, restartFunc, numStreams = 4) {
		this.writeFunc = writeFunc;
		this.restartFunc = restartFunc;
		this.numStreams = numStreams;
		this.streams = [];
		let stream;
		for (let i = 0; i < numStreams; i++) {
			stream = new Writable({write: writeFunc});
			stream.on('drain', restartFunc);
			this.streams.push(stream);
		}
	}

	write(data) {
		for (let i = 0
			; i < this.numStreams 
			&& !this.streams[i].write(data)
			; i++)
		return i < this.numStreams;
	}
}

let createQuery = (buffer) => {
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

const dbWrite = new DbWriteManager(writeFunc, restartLineReader, 1);

let bufferLines = [];

lineReader.on('line', function (line) {
	if(!dbWrite.write(line)) {
		lineReader.pause();
		bufferLines.push(line);
	}
});
