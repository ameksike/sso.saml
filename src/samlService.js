class SamlService {

    serializeUser(user) {
        console.log("serializeUser", user);
    }

    deserializeUser(user) {
        console.log("deserializeUser", user);
    }

    configure(req) {
        console.log("configure", req.query.username);
        return Promise.resolve({
            issuer: 'saml-my',  // saml-poc
            callbackUrl : 'http://localhost:4004/saml/login',
            logoutCallbackUrl: 'http://localhost:4004/saml/logout',
            entryPoint: 'http://localhost:8080/simplesaml/saml2/idp/SSOService.php',

            identifierFormat: null,
            validateInResponseTo: false,
            disableRequestedAuthnContext: false,
            
            cert: require("fs").readFileSync(__dirname + '/../certs/idp.crt', 'utf8'),
            privateKey: require("fs").readFileSync(__dirname + '/../certs/key.pem', 'utf8'),
            decryptionPvk: require("fs").readFileSync(__dirname + '/../certs/key.pem', 'utf8')
        });
    }

    identify(profile) {
        return Promise.resolve({
            id: profile.uid,
            email: profile.email,
            displayName: profile.cn,
            firstName: profile.givenName,
            lastName: profile.sn
        });
    }
}

const obj = new SamlService();
obj.Cls = SamlService;

module.exports = obj;