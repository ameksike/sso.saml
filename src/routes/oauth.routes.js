const express = require("express");
const router = express.Router();
const samlDriver = require("../services/saml.driver");
const domainService = require("../services/domain.service");
const credentialService = require("../services/credential.service");
const http = require("../lib/http");

// OAuth Step 1
router.get("/authorize", (req, res, next) => {

    const payload = { ...req.body, ...req.query, ...req.fields };
    const oauth = {
        token: req.headers.authorization,
        clientId: payload.client_id, // '767f23e26f709cfde4e94d35681d8bf6'
        clientCredential: payload.client_credential,
        codeChallenge: payload.code_challenge, // '0cfJnG4uezEfUd2dGRYaWDJiX7IfNRMfum2mJRPwwJk'
        codeChallengeMethod: payload.code_challenge_method, //'S256'
        redirectUri: payload.redirect_uri, // 'https://oauth.pstmn.io/v1/callback'
        responseType: payload.response_type, // code
        scope: payload.scope, // 'ALLOW_GET_PROFILE_DATA'
        state: payload.state,
    };
    req.body.RelayState = payload.state;
    samlDriver.service.setConfig({ redirectUri: payload.redirect_uri, oauth }, req);
    if (req.isAuthenticated && req.isAuthenticated()) {
        res.redirect(oauth.redirectUri + "?code=12345");
    } else {
        samlDriver.authenticate({ RelayState: req.body.RelayState, username: "mito@example.com" })(req, res, next);
    }
});

// OAuth Step 2
router.post('/authorize', samlDriver.authenticate(), (req, res) => {
    const payload = { ...req.body, ...req.query, ...req.fields };

    req.body.RelayState = payload.RelayState || req?.user?.domain || req.session?.passport?.user?.domain;
    const oauth = samlDriver.service.getConfig(req).options.oauth;

    if (req.session) {
        let prevSession = req.session;
        req.session.regenerate((err) => {
            Object.assign(req.session, prevSession);
            res.redirect(oauth?.redirectUri + "?code=12345");
        });
    } else {
        res.send('Log in Callback Success');
    }
});

// OAuth Step 3
router.post('/token', (req, res) => {
    // OAuth Step 3
    res.json({
        access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IkFudG9uaW8uTWVtYnJpZGVzQHNpdGEuYWVybyIsInVzZXIiOjI1NTIzNCwiZGV2aWNlIjo1MDM4MDcsImlhdCI6MTY3OTMxNzgxNSwiZXhwIjoxNjc5NzQ5ODE1fQ.CrtcVc0P8OyPPTtVjEljo-ZjKtP8WZkCN4FIrfj98h4",
        refresh_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IkFudG9uaW8uTWVtYnJpZGVzQHNpdGEuYWVybyIsInVzZXIiOjI1NTIzNCwiZGV2aWNlIjo1MDM4MDcsImlhdCI6MTY3OTMxNzgxNSwiZXhwIjoxNjc5NzQ5ODE1fQ.CrtcVc0P8OyPPTtVjEljo-ZjKtP8WZkCN4FIrfj98h4",
        token_type: "Bearer",
        expires_in: "1311281970",
        scope: "!!!!"
    });
});

// loguot
router.get('/revoke', function (req, res) {
    req.logout(req.user, err => {
        if (err) return next(err);
        req.session.destroy((err) => {
            const cfg = samlDriver.service.getConfig();
            res.redirect(cfg.options.redirectUri);
        })
    });
});

// domain configuration endpoints

router.get('/domain/:id', async (req, res) => {
    const attributes = ["name", "description", "as_url_entry", "as_url_token", "as_url_revoke", "as_url_metadata", "as_url_profile", "as_type", "idp_issuer"];
    const data = await domainService.select({ where: { id: req.params.id }, attributes });
    res.json(data);
});

router.get('/domain', async (req, res) => {
    const attributes = ["name", "description", "as_url_entry", "as_url_token", "as_url_revoke", "as_url_metadata", "as_url_profile", "as_type", "idp_issuer"];
    const data = await domainService.select({ attributes });
    res.json(data);
});

router.post('/domain', http.upload.any(), async (req, res) => {
    http.format(req);
    const data = await domainService.create(req.body);
    res.json(data);
});

// credential configuration endpoints
router.get('/credential', async (req, res) => {
    const data = await credentialService.select({ include: [{ model: "domain", attributes: ["name", "description", "as_url_entry", "idp_issuer"] }]});
    res.json(data);
});

router.post('/credential', http.upload.any(), async (req, res) => {
    http.format(req);
    const data = await credentialService.create(req.body);
    res.json(data);
});

module.exports = router;