const config = {
    default: {
        issuer: 'saml-my',
        callbackUrl: 'http://localhost:4004/saml/login',
        logoutCallbackUrl: 'http://localhost:4004/saml/logout',
        entryPoint: 'http://localhost:8080/simplesaml/saml2/idp/SSOService.php',
        certFile: __dirname + '/../certs/idp-dc.crt',
        redirectUri: 'https://oauth.pstmn.io/v1/callback'
    }
};

module.exports = config;