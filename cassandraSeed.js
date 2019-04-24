const cassandra = require('cassandra-driver');
const FileToDBManager = require('./fileToDB.js');

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


const client = new cassandra.Client({ 
  contactPoints: ['localhost'], 
  keyspace: 'cycling',
  localDataCenter: 'datacenter1' 
});

let writeFunc = (data, encoding, cb) => {
	client.execute(createQuery(data), cb);
}

var a = new FileToDBManager(writeFunc, './files/data.txt', 32, 'Cassandra');

