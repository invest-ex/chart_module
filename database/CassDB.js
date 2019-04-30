const cassandra = require('cassandra-driver');
const BbPromise = require('bluebird');
const redis = require('redis');


const clientR = redis.createClient();

clientR.get = BbPromise.promisify(clientR.get);
clientR.mget = BbPromise.promisify(clientR.mget);

clientR.on('error', (err) => {
	console.log('error', +err);
});

const client = new cassandra.Client({ 
  contactPoints: ['localhost'], 
  keyspace: 'investex',
  localDataCenter: 'datacenter1', 
  consistencyLevel: 'ONE',
  promiseFactory: BbPromise.fromCallback
});

function formatDBObj(dbObj) {
	const res = dbObj.rows[0];
    if (!res) {
      return {};
    }
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
    return [stockObj];
}
function getData(stockid) {
  return clientR.get(stockid)
    .then((res) => {
      if (res) {return formatDBObj(JSON.parse(res))}
      return client.execute(`
        SELECT * FROM stocks
        WHERE stockid='${stockid}';
      `)
      .then((resObj) => {
        clientR.set(stockid, JSON.stringify(resObj));
        return formatDBObj(resObj)
      });
    });
}


module.exports = getData;