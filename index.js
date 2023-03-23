const express = require('express');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const app = express();

const samlPassport = require("./src/samlPassport");
const samlService = require("./src/samlService");
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
app.use("/saml", require("./src/samlRoutes"));
app.use("/", require("./src/appRoutes"));

const server = app.listen(4004, function () {
    console.log('Listening on port %d', server.address().port)
});