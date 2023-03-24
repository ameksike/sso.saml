const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require("body-parser");
const samlDriver = require("./samlDriver");
const app = express();

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: process?.env?.SESSION_KEY || '3v25234523452345'
}));

samlDriver.setDependencies({
    passport: require('passport'),
    service: require("./samlService")
});
app.use(samlDriver.initialize());
app.use(samlDriver.session());

app.use("/saml", require("./samlRoutes"));
app.use("/oauth", require("./oauthRoutes"));
app.use("/", require("./appRoutes"));

module.exports = app;