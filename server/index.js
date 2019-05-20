/* eslint-disable no-console */
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const getTicker = require('../database/CassDB.js');
const r = require('newrelic');
const app = express();
const port = 80;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
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

app.get('/stocks/:stockId', (req, res) => {
  res.sendFile(path.join(__dirname, '/../public/dist/index.html'));
})
