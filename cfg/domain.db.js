const domain = {
    default: {
        description: "",

        idp_type: "SAML",
        idp_issuer: 'saml-my',
        idp_url_entry: 'http://localhost:8080/simplesaml/saml2/idp/SSOService.php',
        idp_url_login: 'http://localhost:8080/simplesaml/saml2/idp/SSOService.php',
        idp_url_logout: 'http://localhost:8080/simplesaml/saml2/idp/SSOService.php',
        idp_url_metadata: "http://localhost:8080/simplesaml/saml2/idp/metadata.php",
        idp_url_failure: null,
        idp_attr_map: "{ \"mail\": \"email\", \"firstName\": \"givenName\", \"lastName\": \"sn\" }",
        idp_cert: __dirname + '/../certs/idp-dc.crt',

        as_type: "OAUTH_AUTHORIZATION_CODE",
        as_url_entry: 'http://localhost:4004/saml/login',
        as_url_token: 'http://localhost:4004/saml/login',
        as_url_revoke: 'http://localhost:4004/saml/logout',
        as_url_metadata: 'http://localhost:4004',
        as_url_profile: '',
        as_user_action: 3,
        as_cert: __dirname + '/../certs/key.pem',

        sp_verify: false,
    }
};

module.exports = domain;