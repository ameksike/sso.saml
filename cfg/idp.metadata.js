const config = {
    default: {
        issuer: 'saml-my',
        callbackUrl: 'http://localhost:4004/saml/login',
        logoutCallbackUrl: 'http://localhost:4004/saml/logout',
        entryPoint: 'http://localhost:8080/simplesaml/saml2/idp/SSOService.php',
        certFile: __dirname + '/../certs/idp-dc.crt',
        redirectUri: 'http://localhost:4004'
    },
    'saml-my2': {
        issuer: 'saml-my2',
        callbackUrl: 'http://localhost:4004/oauth/authorize',
        logoutCallbackUrl: 'http://localhost:4004/oauth/revoke',
        entryPoint: 'http://localhost:8080/simplesaml/saml2/idp/SSOService.php',
        certFile: __dirname + '/../certs/idp-dc.crt',
        redirectUri: 'http://localhost:4004'
    },
};

module.exports = config;