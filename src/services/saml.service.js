const config = {};
class SamlService {

    serializeUser(user) {
        console.log("serializeUser", user);
    }

    deserializeUser(user) {
        console.log("deserializeUser", user);
    }

    getConfig(req) {
        const cfg = {};
        cfg.options = (req?.body?.RelayState && config[req.body.RelayState]) || config["default"];
        cfg.path = __dirname + '/../';
        cfg.key = {};
        cfg.key.sp = require("fs").readFileSync(cfg.path + '/certs/key.pem', 'utf8');
        cfg.key.idp = require("fs").readFileSync(cfg.options.certFile, 'utf8');
        return cfg;
    }

    setConfig(options, req) {
        const cfg = this.getConfig(req);
        Object.assign(cfg.options, options || {});
    }

    configure(req) {
        const cfg = this.getConfig(req);
        const payload = {
            ...cfg.options,
            identifierFormat: null,
            validateInResponseTo: false,
            disableRequestedAuthnContext: false,
            cert: cfg.key.idp,
            privateKey: cfg.key.sp,
            decryptionPvk: cfg.key.sp
        };
        return Promise.resolve(payload);
    }

    identify(profile) {
        return Promise.resolve({
            id: profile.uid,
            email: profile.email,
            displayName: profile.cn,
            firstName: profile.givenName,
            lastName: profile.sn,
            domain: profile.spNameQualifier || profile.NameQualifier
        });
    }
}

const obj = new SamlService();
obj.Cls = SamlService;
module.exports = obj;