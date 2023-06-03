const express = require('express');
const cors = require('cors');
const app = express();
const morgan = require('morgan');
require("./src/v1/api/config/cartDB.config");
const version1Index = require("./src/v1/api/index");
const { badRequest } = require('./src/v1/api/helpers/response.helper');

//----------use dependencies----------------------------------
//use morgan
app.use(morgan('dev'));
// use cors
app.use(cors());
//body parsing
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//----------redirect routes-----------------------------------
app.use('/v1', version1Index);


//----------for invalid requests start -----------------------


app.all('*', async (req, res) => {
    await badRequest(res, 'Invalid URI');
});

module.exports = app;