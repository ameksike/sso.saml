<?php
/**
 * SAML 2.0 remote SP metadata for SimpleSAMLphp.
 *
 * See: https://simplesamlphp.org/docs/stable/simplesamlphp-reference-sp-remote
 */

if (!getenv('SIMPLESAMLPHP_SP_ENTITY_ID')) {
    throw new UnexpectedValueException('SIMPLESAMLPHP_SP_ENTITY_ID is not defined as an environment variable.');
}
if (!getenv('SIMPLESAMLPHP_SP_ASSERTION_CONSUMER_SERVICE')) {
    throw new UnexpectedValueException('SIMPLESAMLPHP_SP_ASSERTION_CONSUMER_SERVICE is not defined as an environment variable.');
}

$metadata[getenv('SIMPLESAMLPHP_SP_ENTITY_ID')] = array(
    'AssertionConsumerService' => getenv('SIMPLESAMLPHP_SP_ASSERTION_CONSUMER_SERVICE'),
    'SingleLogoutService' => getenv('SIMPLESAMLPHP_SP_SINGLE_LOGOUT_SERVICE'),
);

$metadata['saml-my2'] = array(
    'AssertionConsumerService' => 'https://bfc8-79-152-59-192.eu.ngrok.io/oauth/authorize',
    'SingleLogoutService' => 'https://bfc8-79-152-59-192.eu.ngrok.io/oauth/revoke',
    'entityid' => 'saml-my2',
    'metadata-set' => 'saml20-sp-remote',
);

$metadata['saml-my3'] = array(
    'AssertionConsumerService' => 'http://localhost:4000/auth/v1/oauth/authorize',
    'SingleLogoutService' => 'http://localhost:4000/auth/v1/oauth/token',
    'entityid' => 'saml-my3',
    'metadata-set' => 'saml20-sp-remote',
);

$metadata['sita-sp'] = array(
    'AssertionConsumerService' => 'https://bfc8-79-152-59-192.eu.ngrok.io/auth/v1/oauth/authorize',
    'SingleLogoutService' => 'https://bfc8-79-152-59-192.eu.ngrok.io/auth/v1/oauth/revoke',
    'entityid' => 'sita-sp',
    'metadata-set' => 'saml20-sp-remote',
);