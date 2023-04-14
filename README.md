# sso.saml
Single Sign On (SSO) solution based on SAML

# Set a local IdP based on Simplesaml: Option 1

* docker pull kristophjunge/test-saml-idp

* docker run --name=testsamlidp -p 8080:8080 -p 8443:8443 -e SIMPLESAMLPHP_SP_ENTITY_ID=saml-poc -e SIMPLESAMLPHP_SP_ASSERTION_CONSUMER_SERVICE=http://localhost:4300/login/callback -d kristophjunge/test-saml-idp

* http://localhost:8080/simplesaml

* openssl req -x509 -newkey rsa:4096 -keyout certs\key.pem -out certs\cert.pem -nodes -days 900

* http://localhost:8080/simplesaml/saml2/idp/metadata.php

* docker ps
* docker exec -it a5a7599fcfac bash

* edit simplesaml metadata
    ```
    vi metadata/saml20-sp-remote.php
    ```
    ```php
    $metadata[getenv('SIMPLESAMLPHP_SP_ENTITY_ID')] = array(
        'AssertionConsumerService' => getenv('SIMPLESAMLPHP_SP_ASSERTION_CONSUMER_SERVICE'),
        'SingleLogoutService' => getenv('SIMPLESAMLPHP_SP_SINGLE_LOGOUT_SERVICE'),
    );

    $metadata['saml-my'] = array(
        'AssertionConsumerService' => 'http://localhost:4004/saml/login',
        'SingleLogoutService' => 'http://localhost:4004/saml/logout',
        'entityid' => 'saml-my',
        'metadata-set' => 'saml20-sp-remote',
    );
    ```
    ```
    :wq
    ```
* http://localhost:8080/simplesaml/module.php/core/frontpage_federation.php
* http://localhost:8080/simplesaml/module.php/core/show_metadata.php?entityid=saml-my&set=saml20-sp-remote


# Set a local IdP based on Simplesaml: Option 2
* ./cfg/authsources.php for users
* ./cfg/saml20-sp-remote.php for SP
* docker-compose up
* docker-compose exec idp bash
* cat metadata/saml20-sp-remote.php


For more information see: [Setup a single sign on saml](https://medium.com/disney-streaming/setup-a-single-sign-on-saml-test-environment-with-docker-and-nodejs-c53fc1a984c9) or [Docker Test SAML 2.0 Identity Provider (IdP)](https://github.com/kenchan0130/docker-simplesamlphp)

# Run app
* npm install
* npm start
* http://localhost:4004

# Users 
There are two static users configured in the IdP with the following data:
```
UID	Username	Password	Group	Email
--------------------------------------------------------
1	user1	    user1pass	group1	user1@example.com
2	user2	    user2pass	group2	user2@example.com
```
And there is one admin:
```
Username	Password
--------------------------------------------------------
admin	    secret
```

# Docs
- [Internet Engineering Task Force (IETF)](https://datatracker.ietf.org/doc/html/rfc6750)
- [OAuth 2.0 Framework - RFC 6749](https://oauth.net/2/)
- [Overview of SAML](https://developers.onelogin.com/saml)
- [SSO - SAML Authentication](https://medium.com/brightlab-techblog/single-sign-on-sso-saml-authentication-explained-1e463b9168cb)
- [HTTP Authorization](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization)
- [Passport SAML](http://www.passportjs.org/packages/passport-saml/)
- [SAML Test Tool](https://samltest.id/)