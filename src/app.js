const express = require('express');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const app = express();

const samlPassport = require("./samlPassport");
const samlService = require("./samlService");
samlPassport.init(passport, samlService);

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: 'this shit hits'
}));
app.use(passport.initialize());
app.use(passport.session());
app.use("/saml", require("./samlRoutes"));
app.use("/", require("./appRoutes"));

module.exports = app;