const express = require("express");
const router = express.Router();
const samlDriver = require("../services/saml.driver");

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
        req.session.cookie.expires = new Date().getTime();
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


const os = require('os');
const fileCache = require('file-system-cache').default;
const { fetch, toPassportConfig, MetadataReader, claimsToCamelCase } = require('passport-saml-metadata');
const backupStore = fileCache({ basePath: os.tmpdir() });

router.post('/metadata', async function (req, res) {
    const url = req.body.url;
    const content = req.body.content;

    const reader = url ? await fetch({ url, backupStore }) : new MetadataReader(content);
    const config = toPassportConfig(reader);
    config.realm = 'urn:nodejs:passport-saml-metadata-example-app';
    config.protocol = 'saml2';
    res.json(config);
});

module.exports = router;