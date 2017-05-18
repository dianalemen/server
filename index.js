require('dotenv').config();

const express = require('express');
const path = require('path');
const exhbs = require('express-handlebars');
const bodyParser = require('body-parser');
const app = express();
const Message = require('./model/messege');
const expressValidator = require('express-validator');
const socketioJwt = require('socketio-jwt')
const config = require('./config.json');
const cors = require('cors');
const http = require('http').Server(app);
const io = require('socket.io').listen(http);
const router = require('./routes');

const requestMiddleware = require('./request-middleware').requestMiddleware;

const port = process.env.PORT;

app.use(express.static('public'))

app.use(requestMiddleware);
app.use(bodyParser.json())
app.use(bodyParser.urlencoded())
app.use(expressValidator());
app.use(cors());
app.use(router);


io.sockets
    .on('connection', socketioJwt.authorize({
        secret: config.secret,
        callback: false
    }))
    .on('authenticated', socket => {
        io.emit('join', {
                user: socket.decoded_token.username,
                time: Date.now()
            }, join),
            socket.on("message", createMsg)
            .on('disconnect', disconnect)

        function join() {
            db
                .collection('users')
                .updateOne({ "username": socket.decoded_token.username }, { $set: { "status": "online" } }, (err, user) => {
                    if (err) res.status(404).send(err)
                })
        }

        function createMsg(msg) {
            let message = new Message({
                body: msg,
                user: socket.decoded_token.username
            });
            io.emit('message', message);

            Message.createMessage(message);
        };

        function disconnect() {
            io.emit('leave', {
                user: socket.decoded_token.username,
                time: Date.now()
            })
        }
    })



app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

http.listen(port, (err) => {
    console.log(`server is runnign at ${port}`);
});