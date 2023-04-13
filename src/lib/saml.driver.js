/**
 * http://www.passportjs.org/packages/passport-saml/
 * 
 */
const { MultiSamlStrategy } = require('passport-saml');
const DIP = require("./dip");
const os = require('os');
const fileCache = require('file-system-cache').default;
const { fetch, toPassportConfig, MetadataReader, claimsToCamelCase } = require('passport-saml-metadata');

class SamlDriver extends DIP {
    constructor() {
        super();
        this.id = "saml";
    }

    /**
     * @description initialize the passport driver 
     * @returns {Function} middleware
     */
    initialize() {
        this.passport = this.passport || require('passport');
        this.passport?.serializeUser((user, done) => {
            if (!this.service?.serializeUser || !this.service.serializeUser(user, done)) {
                done(null, user);
            }
        });

        this.passport?.deserializeUser((user, done) => {
            if (!this.service?.deserializeUser || !this.service.deserializeUser(user, done)) {
                done(null, user);
            }
        });

        this.strategy = new MultiSamlStrategy(
            {
                passReqToCallback: true,
                getSamlOptions: (req, done) => {
                    if (this.service?.configure) {
                        this.service.configure(req)
                            .then(configuration => done(null, configuration))
                            .catch(error => done(error));
                    } else {
                        done(new Error("No service handler available"));
                    }
                }
            },
            (req, profile, done) => {
                if (this.service?.identify) {
                    this.service.identify(profile, req)
                        .then(user => done(null, user))
                        .catch(error => done(error));
                } else {
                    done(null, profile);
                }
            }
        );
        this.passport?.use(this.id, this.strategy);
        return this.passport?.initialize();
    }

    /**
     * @description define session middleware
     */
    session() {
        return this.passport?.session();
    }

    /**
     * @description define authenticate middleware
     */
    authenticate(params) {
        return this.passport ? this.passport.authenticate(this.id, {
            additionalParams: params || {},
        }) : (req, res, next) => next();
    }

    /**
     * @description define how to handle the configuration 
     */
    getMetadata(req) {
        return new Promise(async (resolve, reject) => {
            const config = await this.service.getConfig(req);
            this.strategy.generateServiceProviderMetadata(
                req,
                config.key.as,
                config.key.as,
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

    /**
     * @description define how to save the configuration 
     */
    async setMetadata(req) {
        const { url, content } = req.body || req;
        try {
            const backupStore = fileCache({ basePath: os.tmpdir() });
            const reader = url ? await fetch({ url, backupStore }) : (content ? new MetadataReader(content) : null);
            const config = reader ? toPassportConfig(reader) : {};
            config.realm = config.realm || 'urn:nodejs:saml-metadata-app';
            config.protocol = config.protocol || 'saml2';

            if (this.service?.import) {
                return await this.service.import(config, req);
            } else {
                return config;
            }
        }
        catch (error) {
            this.logger?.error({
                src: "Service:SAML:SetMetadata",
                error
            });
            return null;
        }
    }
}

const obj = new SamlDriver();
obj.Cls = SamlDriver;
module.exports = obj;