const LDB = require('../lib/ldb');
const fs = require("fs");
const { domainModel } = require("../models");

class DomainService {
    constructor() {
        this.dao = domainModel;
    }

    select(query) {
        return this.dao.select(query);
    }

    create(option) {
        const tmp = {
            id: option.id,
            description: option.description,

            idp_type: option.idp_type || "SAML",
            idp_issuer: option.idp_issuer || "default",
            idp_url_entry: option.idp_url_entry,
            idp_url_login: option.idp_url_login,
            idp_url_logout: option.idp_url_logout,
            idp_url_metadata: option.idp_url_metadata,
            idp_url_failure: option.idp_url_failure,
            idp_attr_map: option.idp_attr_map || { "mail": "email", "firstName": "givenName", "lastName": "sn" },
            idp_cert: option.idp_cert || fs.readFileSync(__dirname + '/../../certs/idp-dc.crt', 'utf8'),

            as_type: option.as_type || "OAUTH_AUTHORIZATION_CODE",
            as_url_entry: option.as_url_entry || 'http://localhost:4004/saml/login',
            as_url_token: option.as_url_token || 'http://localhost:4004/saml/login',
            as_url_revoke: option.as_url_revoke || 'http://localhost:4004/saml/logout',
            as_url_metadata: option.as_url_metadata || 'http://localhost:4004',
            as_url_profile: option.as_url_profile || '',
            as_user_action: option.as_user_action || 3,
            as_cert: option.as_cert || fs.readFileSync(__dirname + '/../../certs/key.pem', 'utf8'),

            sp_verify: option.sp_verify || false,
        };
        return this.dao.save(tmp);
    }
}

const obj = new DomainService();
obj.Cls = DomainService;
module.exports = obj;