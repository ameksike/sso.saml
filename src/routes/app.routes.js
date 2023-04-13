const express = require("express");
const router = express.Router();

router.get('/user/profile', function (req, res) {
    if (req.isAuthenticated()) {
        res.send(JSON.stringify(req.user));
    } else {
        res.redirect('/saml/login?username=tst@airfran.com');
    }
});

router.get('/', function (req, res) {
    const menu = `
        <li><a href="/user/profile"> profile </a></li>
        <li><a href="/saml/metadata"> metadata </a></li>
    `;
    const action = req.isAuthenticated() ? `
        <li><a href="/saml/logout"> logout </a></li>
    ` : `
        <li><a href="/saml/login"> login </a></li>
    `;
    res.send(`<ul> 
        ${menu}  
        <li> --------- </li>
        ${action} 
    </ul>`);
});

module.exports = router;