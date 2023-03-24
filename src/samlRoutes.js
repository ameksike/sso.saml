const express = require("express");
const router = express.Router();
const samlDriver = require("./samlDriver");

router.post(
    '/login',
    samlDriver.authenticate(),
    function (req, res) {
        if (req.session) {
            let prevSession = req.session;
            req.session.regenerate((err) => {  // Compliant
                Object.assign(req.session, prevSession);
                res.redirect('/');
            });
        } else {
            res.send('Log in Callback Success');
        }
    }
);

router.get(
    "/login",
    samlDriver.authenticate(),
    function (_req, res) {
        res.redirect("/user/profile");
    }
);

router.get('/logout', function (req, res) {
    req.logout(req.user, err => {
        if (err) return next(err);
        res.redirect("/");
    });
});

router.get('/metadata', function (req, res) {
    res.type('application/xml');
    res.status(200).send(samlDriver.metadata());
});

module.exports = router;