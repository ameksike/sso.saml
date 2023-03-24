const express = require("express");
const router = express.Router();
const samlDriver = require("./samlDriver");


router.post('/authorize', (req, res) => {
    const payload = { ...req.body, ...req.query };
    res.redirect(samlDriver.service.getConfig().redirectUri);
});

router.get("/authorize", (req, res, next) => {
    const payload = { ...req.body, ...req.query };
    samlDriver.service.setConfig({
        redirectUri: payload.redirect_uri
    });
    if (req.isAuthenticated && req.isAuthenticated()) {
        res.redirect(payload.redirect_uri || "/user/profile");
    } else {
        samlDriver.authenticate()(req, res, next);
    }
});

router.post('/token', (req, res) => {
    res.json({
        access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IkFudG9uaW8uTWVtYnJpZGVzQHNpdGEuYWVybyIsInVzZXIiOjI1NTIzNCwiZGV2aWNlIjo1MDM4MDcsImlhdCI6MTY3OTMxNzgxNSwiZXhwIjoxNjc5NzQ5ODE1fQ.CrtcVc0P8OyPPTtVjEljo-ZjKtP8WZkCN4FIrfj98h4",
        refresh_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IkFudG9uaW8uTWVtYnJpZGVzQHNpdGEuYWVybyIsInVzZXIiOjI1NTIzNCwiZGV2aWNlIjo1MDM4MDcsImlhdCI6MTY3OTMxNzgxNSwiZXhwIjoxNjc5NzQ5ODE1fQ.CrtcVc0P8OyPPTtVjEljo-ZjKtP8WZkCN4FIrfj98h4",
        token_type: "Bearer",
        expires_in: "1311281970",
        scope: "ABCD"
    });
});

module.exports = router;