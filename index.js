'use strict';

const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');

// const sslkey = fs.readFileSync('ssl-key.pem');
// const sslcert = fs.readFileSync('ssl-cert.pem');
//
// const options = {
//   key: sslkey,
//   cert: sslcert,
// };

const app = express();
//app.use(express.static('public'));


app.get('/',(req,res)=>{
  res.redirect('/public/videochat.html');
}

//const server = https.createServer(options, app).listen(80);
const io = require('socket.io')(server);

io.on('connection', socket => {
      const socketid = socket.id;
      console.log('a user connected with session id ' + socketid);

      socket.on('call', data => {
        console.log(data);
        socket.broadcast.emit('call', data);
      });

      socket.on('answer', msg => {
        console.log('answer broadcasted');
        socket.broadcast.emit('answer', msg);
      });
    },
);

app.use(express.static('public'));
app.use('/modules', express.static('node_modules'));


