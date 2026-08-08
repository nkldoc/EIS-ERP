<?php

require 'vendor/autoload.php';
require_once("../conf/config.php");

use Jumbojett\OpenIDConnectClient;
use Jumbojett\OpenIDConnectClientException;

$oidc = new OpenIDConnectClient(
        'https://vdid.vajira.ac.th',
        'eis',
        'PeL+lUSj(8-J{o:E'
);

$oidc->setCodeChallengeMethod('S256');
$oidc->setRedirectURL(REDIRECT_SERVER);
// You can optionally set additional scopes
$oidc->addScope(array('openid'));
$oidc->addScope(array('profile'));
$oidc->addScope(array('email'));
$oidc->addScope(array('ephis'));



// Authenticate the user
try {
    $oidc->authenticate();
    $userInfo = $oidc->requestUserInfo();
    echo 'Hello, ' . $userInfo->name;
    print_r($userInfo);
    exit();
   
} catch (OpenIDConnectClientException $e) {
    echo 'Authentication failed: ' . $e->getMessage();
}
