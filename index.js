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

mongoose.connect('mongodb://localhost/chatdb');
var db = mongoose.connection;

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
    res.render('home', {
        message: 'welcome to home page'
    });
});

app.get('/create', (req, res) => {
    res.send(
        db
        .collection('User')
        .insert({ "username": "5", "password": "fdsfsdfsdf", "email": "ex@com.ua", "name": "Diana" }, (err, user) => {
            if (err) res.status(404).send(err)
        })
    )
})

app.post('/createmsg', (req, res) => {

    let body = req.body.body;

    let message = new Message({
        body: body
    });
    res.send(
        Message.createMessage(message))
})

app.post('/registration', (req, res) => {

    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.email;
    let name = req.body.name;

    console.log(req.body);

    req.checkBody('username', 'Name is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is is not valid').isEmail();
    req.checkBody('username', 'Name is required').notEmpty();

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

app.post('/login', (req, res) => {
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

app.get('/read', (req, res) => {
    db.collection('User')
        .find().toArray(function(e, docs) {
            res.render("user", {
                user: docs
            });
        });
});

app.get('/readmsg', (req, res) => {
    db.collection('messages')
        .find().toArray(function(e, docs) {
            res.render("message", {
                message: docs
            });
        });
});

app.get('/update', (req, res) => {
    res.send(
        db
        .collection('User')
        .updateOne({ "id": "4" }, { $set: { "item": "newItem" } }, (err, user) => {
            if (err) res.status(404).send(err)
        })
    )
});

app.get('/delete', (req, res) => {
    res.send(
        db
        .collection('User')
        .deleteMany({ "id": "5" }, (err, user) => {
            if (err) res.status(404).send(err)
        })
    )
});

app.get('*', (req, res) => {
    res.end('404');
});

app.listen(port, (err) => {
    console.log(`server is runnign at ${port}`);
});