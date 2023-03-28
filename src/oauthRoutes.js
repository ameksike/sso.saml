const express = require("express");
const router = express.Router();
const samlDriver = require("./samlDriver");

router.post('/authorize', samlDriver.authenticate(), (req, res) => {
    // OAuth Step 2
    const payload = { ...req.body, ...req.query, ...req.fields };
    
    req.query.domain = req.session?.passport?.user?.domain;
    const oauth = samlDriver.service.getConfig(req).options.oauth;
    console.log(req.session.passport.user);
    if (req.session) {
        let prevSession = req.session;
        req.session.regenerate((err) => {
            Object.assign(req.session, prevSession);        
            const cfg = samlDriver.service.getConfig();
            res.redirect(oauth?.redirectUri + "?code=12345");
        });
    } else {
        res.send('Log in Callback Success');
    }
});


router.get("/authorize", (req, res, next) => {
    // OAuth Step 1
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
    req.query.domain = "saml-my2";
    samlDriver.service.setConfig({ redirectUri: payload.redirect_uri, oauth }, req);
    if (req.isAuthenticated && req.isAuthenticated()) {
        res.redirect(oauth.redirectUri + "?code=12345");
    } else {
        samlDriver.authenticate({ domain: "oauth", code: 11111 })(req, res, next);
    }
});

router.post('/token', (req, res) => {
    // OAuth Step 2
    res.json({
        access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IkFudG9uaW8uTWVtYnJpZGVzQHNpdGEuYWVybyIsInVzZXIiOjI1NTIzNCwiZGV2aWNlIjo1MDM4MDcsImlhdCI6MTY3OTMxNzgxNSwiZXhwIjoxNjc5NzQ5ODE1fQ.CrtcVc0P8OyPPTtVjEljo-ZjKtP8WZkCN4FIrfj98h4",
        refresh_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IkFudG9uaW8uTWVtYnJpZGVzQHNpdGEuYWVybyIsInVzZXIiOjI1NTIzNCwiZGV2aWNlIjo1MDM4MDcsImlhdCI6MTY3OTMxNzgxNSwiZXhwIjoxNjc5NzQ5ODE1fQ.CrtcVc0P8OyPPTtVjEljo-ZjKtP8WZkCN4FIrfj98h4",
        token_type: "Bearer",
        expires_in: "1311281970",
        scope: "ABCD"
    });
});

router.get('/revoke', function (req, res) {
    req.logout(req.user, err => {
        if (err) return next(err);
        const cfg = samlDriver.service.getConfig();
        res.redirect(cfg.options.redirectUri);
    });
});

module.exports = router;