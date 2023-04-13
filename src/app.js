const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const logger = require("./services/log.service");
const samlDriver = require("./services/saml.driver");
const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: process?.env?.SESSION_KEY || '3v25234523452345'
}));
app.use(logger.track());
samlDriver.setDependencies({
    passport: require('passport'),
    service: require("./services/saml.service")
});
app.use(samlDriver.initialize());
app.use(samlDriver.session());

app.use("/saml", require("./routes/saml.routes"));
app.use("/oauth", require("./routes/oauth.routes"));
app.use("/", require("./routes/app.routes"));

module.exports = app;