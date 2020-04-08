const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;;

const app = express();
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

function toJsonData(req, res, next) {
  let stringData = '';
  let logs = [];
  let headers;
  let results = [];
  fs.readFile('./log.csv', (err, data) => {
    if (err)
      console.log(err)
    else
      stringData = data.toString('utf8');
      logs = stringData.split('\n');
      headers = logs.shift().split(',');
      for (let i=0; i<logs.length-1; i++) {
        let currentLog = logs[i].split(',');
        let object = {};
        for (let j=0; j<headers.length; j++) {
          object[headers[j]] = currentLog[j];
        }
        results.push(object);
      }
    return res.end(JSON.stringify(results));
    }
  );
};

const csvWriter = createCsvWriter({
  path: 'log.csv',
  header: [
    {id: 'agent', title: 'Agent'},
    {id: 'time', title: 'Time'},
    {id: 'method', title: 'Method'},
    {id: 'resource', title: 'Resource'},
    {id: 'version', title: 'Version'},
    {id: 'status', title: 'Status'},
  ]
});

app.use((req, res, next) => {
  res.status(200);
  let data = [
    {
    agent: req.header("user-agent").replace(',',''),
    time: new Date().toISOString(),
    method: req.method,
    resource: req.url,
    version: `HTTP/${req.httpVersion}`,
    status: res.statusCode,
    }
  ];
  csvWriter
    .writeRecords(data)
    .then(() => console.log('The file has been writen successfully to the csv file!'))
    next();

});

app.get('/', (req, res, next) => {
    res.status(200).send('Ok');
    next();
  });

  app.get('/logs', (req, res, next) => {
    toJsonData(req, res, next);
  });

module.exports = app;
