const { MultiSamlStrategy } = require('passport-saml');
/**
 * http://www.passportjs.org/packages/passport-saml/
 */
module.exports = {
    init: (passport, service) => {

        passport.serializeUser((user, done) => {
            if (!service?.serializeUser || !service.serializeUser(user, done)) {
                done(null, user);
            }
        });

        passport.deserializeUser((user, done) => {
            if (!service?.deserializeUser || !service.deserializeUser(user, done)) {
                done(null, user);
            }
        });

        passport.use("saml", new MultiSamlStrategy(
            {
                passReqToCallback: true,
                getSamlOptions: (req, done) => {
                    service?.configure && service.configure(req)
                        .then(configuration => done(null, configuration))
                        .catch(error => done(error));
                    if (!service?.configure && req?.logout) {
                        req.logout();
                    }
                }
            },
            (req, profile, done) => {
                service?.identify && service.identify(profile)
                    .then(user => done(null, user))
                    .catch(error => done(error));
            },
            (req, profile, done) => {
                console.log("logout", profile);
            })
        );
    }
}