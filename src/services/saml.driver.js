/**
 * http://www.passportjs.org/packages/passport-saml/
 */
const { MultiSamlStrategy } = require('passport-saml');
const DIP = require("../lib/dip");

class SamlDriver extends DIP {
    constructor() {
        super();
        this.id = "saml";
    }

    initialize() {
        this.passport = this.passport || require('passport');
        this.passport.serializeUser((user, done) => {
            if (!this.service?.serializeUser || !this.service.serializeUser(user, done)) {
                done(null, user);
            }
        });

        this.passport.deserializeUser((user, done) => {
            if (!this.service?.deserializeUser || !this.service.deserializeUser(user, done)) {
                done(null, user);
            }
        });

        this.strategy = new MultiSamlStrategy(
            {
                passReqToCallback: true,
                getSamlOptions: (req, done) => {
                    this.service?.configure && this.service.configure(req)
                        .then(configuration => done(null, configuration))
                        .catch(error => done(error));
                    if (!this.service?.configure && req?.logout) {
                        req.logout(req.user, err => {
                            if (err) return next(err);
                        });
                    }
                }
            },
            (req, profile, done) => {
                this.service?.identify && this.service.identify(profile)
                    .then(user => done(null, user))
                    .catch(error => done(error));
            }
        );
        this.passport.use(this.id, this.strategy);
        return this.passport.initialize();
    }

    session() {
        return this.passport.session();
    }

    authenticate(params) {
        return this.passport.authenticate(this.id, {
            additionalParams: params || {}
        });
    }

    metadata(req) {
        return new Promise((resolve, reject) => {
            const config = this.service.getConfig();
            this.strategy.generateServiceProviderMetadata(
                req,
                config.key.sp,
                config.key.sp,
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            )
        });
    }
}

const obj = new SamlDriver();
obj.Cls = SamlDriver;
module.exports = obj;