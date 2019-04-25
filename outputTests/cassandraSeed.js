const cassandra = require('cassandra-driver');
const FileToDBManager = require('./fileToDB.js');

let createQuery = (buffer) => {
	let obj = JSON.parse(buffer.toString());
	let {stockInfo, stockData} = obj;
	query = `
		INSERT INTO stocksOnePrimary (
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
  keyspace: 'investex',
  localDataCenter: 'datacenter1' 
});

client.execute(`
    DROP TABLE IF EXISTS stocksOnePrimary;
`);

client.execute(`
    CREATE TABLE stocksOnePrimary ( 
        stockid text,
        averagestock float,
        changepercent float,
        companyname text,
        day list<float>,
        fiveyear list<float>,
        month list<float>,
        noofowners int,
        recommendationpercent int,
        relatedtags list<text>,
        threemonth list<float>,
        week list<float>,
        year list<float>,
        PRIMARY KEY (stockid, companyname)
    );
`, () => {
    var a = new FileToDBManager(writeFunc, './files/data.txt', 32, 'Cassandra');
});

let writeFunc = (data, encoding, cb) => {
	client.execute(createQuery(data), cb);
}

