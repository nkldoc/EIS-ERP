<?php
require 'vendor/autoload.php'; 
use Jumbojett\OpenIDConnectClient; 
$oidc = new OpenIDConnectClient(
    'https://vdid.vajira.ac.th',
    'eis',
    'PeL+lUSj(8-J{o:E'
);
$oidc->setCodeChallengeMethod('S256');
$oidc->setRedirectURL('https://uat-eis.vajira.ac.th/NMU_permission/login');  
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
} catch (Exception $e) {
    echo 'Authentication failed: ' . $e->getMessage();
}
 
