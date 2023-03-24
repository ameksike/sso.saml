const express = require("express");
const router = express.Router();

router.post('/authorize', (_req, res) => {
    res.redirect("/user/profile");
});

router.get("/authorize", (_req, res) => {
    res.redirect("/user/profile");
});

router.post('/token', (req, res) => {
    res.json({
        
    });
});

module.exports = router;