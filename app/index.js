const http = require('http');
const app = require('./app');
require('dotenv').config();
const port = process.env.APPID||3123;
const server = http.createServer(app)
server.listen(port, () => {
    console.log(`server running on ${port}`);
})