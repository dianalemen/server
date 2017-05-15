const express = require('express');
const router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const mongoose = require('mongoose');
const marked = require('marked')
const Message = require('./model/messege');
const User = require('./model/user');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const config = require('./config.json');
const bcrypt = require('bcryptjs');
const fs = require('fs');


mongoose.connect('mongodb://localhost/chatdb');
const db = mongoose.connection;



router.post('/registration', (req, res) => {

    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.email;
    let name = req.body.name;

    req.checkBody('username', 'username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is is not valid').isEmail();
    req.checkBody('name', 'Name is required').notEmpty();

    let errors = req.validationErrors();

    let user = new User({
        username: username,
        password: password,
        email: email,
        name: name
    });
    res.send(
        User.createUser(user))
});

router.post('/login', (req, res) => {

    db.collection('users')
        .findOne({ username: req.body.username },
            function(err, user) {

                if (err) throw err;

                if (!user) {
                    console.log('Authentication failed. User not found.');
                    res.send(404);
                } else if (user) {

                    if (bcrypt.compareSync(req.body.password, user.password)) {

                        var token = jwt.sign(user, config.secret, { noTimestamp: true });

                        res.send({
                            token: token,
                            user: req.body.username
                        });
                    } else {
                        console.log('Authentication failed. Wrong password.');
                        res.send(404);
                    }
                }
            });
})


router.get('/readmsg', (req, res) => {
    db.collection('messages')
        .find().toArray(function(err, docs) {
            if (err) throw err;
            res.json(docs);
        });
});

router.get('/users', (req, res) => {
    db.collection('users')
        .find().toArray(function(err, users) {
            if (err) throw err;
            res.json(users);
        });
});

module.exports = router;