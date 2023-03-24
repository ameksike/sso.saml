<?php
// These attributes mimic those of Azure AD.
$tplUser = array(
    'http://schemas.microsoft.com/identity/claims/tenantid' => 'ab4f07dc-b661-48a3-a173-d0103d6981b2',
    'http://schemas.microsoft.com/identity/claims/objectidentifier' => '',
    'http://schemas.microsoft.com/identity/claims/displayname' => '',
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/groups' => array(),
    'http://schemas.microsoft.com/identity/claims/identityprovider' => 'https://sts.windows.net/da2a1472-abd3-47c9-95a4-4a0068312122/',
    'http://schemas.microsoft.com/claims/authnmethodsreferences' => array('http://schemas.microsoft.com/ws/2008/06/identity/authenticationmethod/password', 'http://schemas.microsoft.com/claims/multipleauthn'),
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress' => '',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname' => '',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname' => '',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name' => ''
);

$config = array(
    'admin' => array(
        'core:AdminPassword',
    ),
    'example-userpass' => array(
        'exampleauth:UserPass',
        'user0:user0pass' => array_merge($tplUser, array(
            'uid' => 'f2d75402-e1ae-40fe-8cc9-98ca1ab9cd5e',
            'cn' => 'User0 Tester',
            'email' => 'user0@example.com',
            'givenName' => 'Tester',
            'surname' => 'User0',
            'sn' => 'user0@example.com'
        )),
        'user1:user1pass' => array_merge($tplUser, array(
            'uid' => 'f2d75402-e1ae-40fe-8cc9-98ca1ab9cd5e',
            'cn' => 'User1 Taro',
            'email' => 'user1@example.com',
            'givenName' => 'Taro',
            'surname' => 'User1',
            'sn' => 'user1@example.com'
        )),
        'user2:user2pass' => array_merge($tplUser, array(
            'http://schemas.microsoft.com/identity/claims/objectidentifier' => 'f2a94916-2fcb-4b68-9eb1-5436309006a3',
            'http://schemas.microsoft.com/identity/claims/displayname' => 'User2 Taro',
            'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress' => 'user2@example.com',
            'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname' => 'Taro',
            'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname' => 'User2',
            'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name' => 'user2@example.com'
        )),
    ),
);
