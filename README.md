# sso.saml
Single Sign On (SSO) solution based on SAML

# Set a local IdP based on Simplesaml

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
    $metadata['saml-my'] = array(
    'AssertionConsumerService' => 'http://localhost:4004/saml/login/callback',
    'SingleLogoutService' => false,
    'entityid' => 'saml-poc',
    'metadata-set' => 'saml20-sp-remote',
    );
    ```
    ```
    :wq
    ```
* http://localhost:8080/simplesaml/module.php/core/frontpage_federation.php
* http://localhost:8080/simplesaml/module.php/core/show_metadata.php?entityid=saml-my&set=saml20-sp-remote

for more information see: [Setup a single sign on saml](https://medium.com/disney-streaming/setup-a-single-sign-on-saml-test-environment-with-docker-and-nodejs-c53fc1a984c9)

# Run app
* npm install
* npm start
* http://localhost:4004