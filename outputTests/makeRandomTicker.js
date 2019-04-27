const cassandra = require('cassandra-driver');

let createQuery = () => {
	let query = `
		INSERT INTO t1 (
			averagestock, 
        	stockid 
        ) VALUES (
            ${Math.random()},
            '${'asdf'}'
		) IF NOT EXISTS;
	`;
	return query;
}


const client = new cassandra.Client({ 
  contactPoints: ['localhost'], 
  keyspace: 'investex',
  localDataCenter: 'datacenter1',
});

console.log('something');
client.execute(`
    CREATE TABLE IF NOT EXISTS t1 ( 
        averagestock float PRIMARY KEY, 
        stockid text,
    );
`, () => {
    console.log('configured');
    let a = [];
    for (var i = 0; i < 1; i++) {
        client.execute(createQuery());
    }
    setTimeout(() => process.exit(), 10000);
});

let writeFunc = () => {
	client.execute(createQuery());
}

