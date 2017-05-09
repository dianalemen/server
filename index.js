require('dotenv').config();

const express = require('express');
const path = require('path');
const exhbs = require('express-handlebars');
const bodyParser = require('body-parser');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const mongoose = require('mongoose');
const Message = require('./model/messege');
const User = require('./model/user');
const passport = require('passport');
const expressValidator = require('express-validator');
const jwt = require('jsonwebtoken');
const config = require('./config.json');
const http = require('http').Server(app);
const io = require('socket.io').listen(http);
const routes = express.Router();

mongoose.connect('mongodb://localhost/chatdb');
const db = mongoose.connection;

const requestMiddleware = require('./request-middleware').requestMiddleware;

const port = process.env.PORT;

app.engine('.hbs', exhbs({
    defaultLayout: 'main',
    extname: '.hbs',
    layoutDir: path.join(__dirname, 'views/layouts')
}))

app.set('view engine', '.hbs')
app.set('views', path.join(__dirname, 'views'))

app.use(requestMiddleware);
app.use(bodyParser.json())
app.use(bodyParser.urlencoded())
app.use(expressValidator());

app.get('/', (req, res) => {
    io.on('connection', function(socket) {
        console.log("connected");
        socket.on('message', function(msg) {
            console.log('message: ' + msg);
        });
    });
    res.render('home', {
        message: 'welcome to home page'
    });
});

routes.post('/createmsg', (req, res) => {

    let body = req.body.body;

    let message = new Message({
        body: body
    });
    res.send(
        Message.createMessage(message))
})

routes.post('/registration', (req, res) => {

    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.email;
    let name = req.body.name;

    console.log(req.body);

    req.checkBody('username', 'username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is is not valid').isEmail();
    req.checkBody('name', 'Name is required').notEmpty();

    let errors = req.validationErrors();

    var user = new User({
        username: username,
        password: password,
        email: email,
        name: name
    });
    console.log(user);
    res.send(
        User.createUser(user))
});

routes.post('/login', (req, res) => {
    db.collection('users')
        .findOne({ username: req.body.username },
            function(err, user) {

                if (err) throw err;

                if (!user) {
                    res.json({ success: false, message: 'Authentication failed. User not found.' });
                } else if (user) {

                    if (user.password != req.body.password) {
                        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
                    } else {

                        var token = jwt.sign(user, config.secret, { noTimestamp: true });

                        res.json({
                            success: true,
                            message: 'Enjoy your token!',
                            token: token
                        });
                    }

                }

            });
})

routes.use(function(req, res, next) {

    var token = req.body.token || req.param('token') || req.headers['x-access-token'];

    if (token) {

        jwt.verify(token, app.get('superSecret'), function(err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                req.decoded = decoded;
                next();
            }
        });

    } else {

        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });

    }

});

app.get('*', (req, res) => {
    res.end('404');
});

http.listen(port, (err) => {
    console.log(`server is runnign at ${port}`);
});