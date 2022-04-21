const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
require('dotenv').config();

const app = express();

app.use(cookieParser(`${process.env.COOKIE_SECRET}`));
app.use(session({
    secret: `${process.env.SESSION_SECRET}`,
    resave: "true",
    saveUninitialized: "true"
}));
app.use(express.urlencoded({extended: true}));

const db = 'students';
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PWD}@cluster0.sy1rv.mongodb.net/${db}?retryWrites=true&w=majority`)
    .then(() => {
        console.log("Connected to DB");
    })
    .catch((err) => {
        console.log(`Could not connect to database: ${err}`);
    })

/* Views */
app.set('views', './views');
app.set('view engine', 'pug');

/* Routes */
var plants = require('./routes/students');
app.use('/', plants);

app.use((req, res, next) => {
    res.status(404).send("404: Student Not Found")
})

module.exports = app;
