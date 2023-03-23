const express = require("express");
const router = express.Router();
const passport = require('passport');

router.post('/login/callback',
    passport.authenticate('saml', { failureRedirect: '/saml/login' }),
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
    passport.authenticate("saml", {
        additionalParams: { username: "user@domain.com" },
        failureRedirect: '/saml/login',
        failureFlash: true
    }),
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
    res.status(200).send("SS"
        /*samlStrategy.generateServiceProviderMetadata(
            fs.readFileSync(__dirname + '/certs/cert.pem', 'utf8'),
            fs.readFileSync(__dirname + '/certs/cert.pem', 'utf8')
        )*/
    );
});

module.exports = router;