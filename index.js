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
        router.join(socket.decoded_token.username);
        io.emit('join', {
                user: socket.decoded_token.username,
                time: Date.now()
            }),
            socket.on("join", updateLoc)
            .on("message", createMsg)
            .on('disconnect', disconnect)
            .on('is typing', typingHandler)
            .on('stop typing', stopTypingHandler)

        function updateLoc(loc) {
            router.update(loc, socket.decoded_token.username)
        };

        function typingHandler() {
            socket.broadcast.emit('typing', socket.decoded_token)
        };

        function stopTypingHandler() {
            socket.broadcast.emit('stop typing', socket.decoded_token)
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
            router.leave(socket.decoded_token.username);
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