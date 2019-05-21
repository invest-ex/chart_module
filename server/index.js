/* eslint-disable no-console */
const r = require('newrelic');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const getTicker = require('../database/CassDB.js');
const app = express();
const port = 80;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
  res.send(html);
});

app.use(express.static(path.join(__dirname, '/../public/dist')));

app.listen(port, () => {
  console.log(`Server is now listening on port: ${port}`)
})

app.get('/api/chart/:stockId', (req, res) => {

  let extendedId = req.params.stockId;
  while (extendedId.length < 5) {
    extendedId += 'A';
  }
  getTicker(extendedId).then((val) => res.end(JSON.stringify(val)));
  // Stocks.find({stockId: req.params.stockId.toUpperCase()}, (err, data) => {
  //   if (err) {
  //     console.log(err.message);
  //   } else if (!data.length) {
  //     Stocks.find({id: req.params.stockId.toUpperCase()}, (err, data) => {
  //       if (err) {
  //         console.log(err.message);
  //       } else if (!data.length) {
  //         console.log('Data not found');
  //         res.sendStatus(404);
  //       } else {
  //         console.log(`Sending ${req.params.stockId} to client`);
  //         res.send(data);
  //       }
  //     }) 
  //   } else {
  //     console.log(`Sending ${req.params.stockId} to client`);
  //     res.send(data);
  //   }
  // }) 

})
const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Stock Chart</title>
  <link rel="stylesheet" href="http://github.hubspot.com/odometer/themes/odometer-theme-minimal.css" />
  <script src="http://github.hubspot.com/odometer/odometer.js"></script>
  <script src="https://code.jquery.com/jquery-3.3.1.min.js"></script>
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <div id="stock-chart"></div>
  <script src="/bundle.js"></script>
</body>
</html>
`;

app.get('/stocks/:stockId', (req, res) => {
  res.send(html);
  //res.sendFile(path.join(__dirname, '/../public/dist/index.html'));
});
