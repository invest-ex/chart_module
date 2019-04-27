const cassandra = require('cassandra-driver');

const client = new cassandra.Client({ 
  contactPoints: ['localhost'], 
  keyspace: 'investex',
  localDataCenter: 'datacenter1', 
  consistencyLevel: 'ONE'
});

function getData(stockid) {

	return new Promise((accept, reject) => {
		client.execute(`
			SELECT * FROM stocks
			WHERE stockid='${stockid}';
			`, (a,b) => {
				const res = b.rows[0];
				let stockObj = {
					stockId: res.stockid,
					averageStock: res.averagestock,
					changePercent: res.changepercent
				};
				stockObj.stockInfo = {
					relatedTags: res.relatedtags,
					stockCompany: res.companyname,
					noOfOwners: res.noofowners,
					recommendationPercent: res.recommendationpercent
				};
				stockObj.stockData = {
					day: res.day,
					week: res.week,
					month: res.month,
					threeMonth: res.threemonth,
					year: res.year,
					fiveYear: res.fiveyear
				};
				console.log(res.fiveyear);

				accept([stockObj]);
			});
	});
}


module.exports = getData;