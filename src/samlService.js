const config = require('../cfg/idp.metadata');
class SamlService {

    serializeUser(user) {
        console.log("serializeUser", user);
    }

    deserializeUser(user) {
        console.log("deserializeUser", user);
    }

    getConfig(req) {
        const options = (req?.query?.username && config[req.query.username]) || config["default"];
        return options;
    }

    setConfig(options, req) {
        const config = this.getConfig(req);
        Object.assign(config, options || {});
    }

    configure(req) {
        const options = this.getConfig(req);
        const payload = {
            ...options,
            identifierFormat: null,
            validateInResponseTo: false,
            disableRequestedAuthnContext: false,

            cert: require("fs").readFileSync(options.certFile, 'utf8'),
            privateKey: require("fs").readFileSync(__dirname + '/../certs/key.pem', 'utf8'),
            decryptionPvk: require("fs").readFileSync(__dirname + '/../certs/key.pem', 'utf8')
        };
        return Promise.resolve(payload);
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