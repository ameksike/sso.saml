const express = require("express");
const router = express.Router();
const samlDriver = require("./samlDriver");

router.post(
    '/login',
    samlDriver.authenticate(),
    function (req, res) {
        if (req.session) {
            let prevSession = req.session;
            req.session.regenerate((err) => {
                Object.assign(req.session, prevSession);        
                const cfg = samlDriver.service.getConfig();
                res.redirect(cfg.options.redirectUri);
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
        const cfg = samlDriver.service.getConfig();
        res.redirect(cfg.options.redirectUri);
    }
);

router.get('/logout', function (req, res) {
    req.logout(req.user, err => {
        if (err) return next(err);
        const cfg = samlDriver.service.getConfig();
        res.redirect(cfg.options.redirectUri);
    });
});

router.get('/metadata', function (req, res) {
    samlDriver.metadata(req).then(data => {
        res.type('application/xml');
        res.status(200).send(data)
    });
});

module.exports = router;