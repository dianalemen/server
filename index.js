require('dotenv').config();

const express = require('express');
const path = require('path');
const exhbs = require('express-handlebars');
const bodyParser = require('body-parser');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const mongoose = require('mongoose');
const Message = require('./model/messege');

mongoose.connect('mongodb://localhost/chatdb');
var db = mongoose.connection;
/*const mongoConnected = new Promise((res, rej) => {
    MongoClient.connect('mongodb://localhost:27017/chatdb', (err, db) => {
        if (err) rej(err)
        console.log('Connected correctly to server')
        res(db)
    })
})

mongoConnected.catch(err => console.error(err.stack))*/

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

app.get('/', (req, res) => {
    res.render('home', {
        message: 'welcome to home page'
    });
});

app.get('/create', (req, res) => {
    res.send(
        //mongoConnected.then(db => {
        db
        .collection('User')
        .insert({ "username": "5", "password": "fdsfsdfsdf", "email": "ex@com.ua", "name": "Diana" }, (err, user) => {
            if (err) res.status(404).send(err)
        })
    )
})

app.post('/creatmsg', (req, res) => {
    let body = req.body.body;
    console.log(body);
    let date = new Date();
    let message = new Message({
        body: body
    });
    console.log('msg', message)
    res.send(
        Message.createMessage(message))
})

app.get('/read', (req, res) => {
    //mongoConnected.then(db => {
    db.collection('User')
        .find().toArray(function(e, docs) {
            res.render("user", {
                user: docs
            });
        });
});

app.get('/readmsg', (req, res) => {
    //mongoConnected.then(db => {
    db.collection('messages')
        .find().toArray(function(e, docs) {
            res.render("message", {
                message: docs
            });
        });
});

app.get('/update', (req, res) => {
    res.send(
        //mongoConnected.then(db => {
        db
        .collection('User')
        .updateOne({ "id": "4" }, { $set: { "item": "newItem" } }, (err, user) => {
            if (err) res.status(404).send(err)
        })
    )
});

app.get('/delete', (req, res) => {
    res.send(
        //mongoConnected.then(db => {
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
    // if(err) {
    //     return console.log('something goes wrong!!!');
    // }
    console.log(`server is runnign at ${port}`);
});