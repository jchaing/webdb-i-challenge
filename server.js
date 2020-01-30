const express = require('express');

const db = require('./data/dbConfig.js');

const AccountsRouter = require('./accounts/accounts-router');

const server = express();

server.use(express.json());

server.use('/api/accounts', AccountsRouter);

server.get('/', (req, res) => {
  res.send('<h2>Welcome to WebDB I Challenge</h2>')
})

module.exports = server;
