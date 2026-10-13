<?php
require_once __DIR__ . '/../vendor/autoload.php';

use Firebase\JWT\JWT;

class JwtHandler
{
    protected $jwt_secrect;
    protected $token;
    protected $issuedAt;
    protected $expire;
    protected $jwt;

    const TOKEN_LIFETIMES = [3600, 28800, 86400, 604800, 2592000];

    public function __construct($lifetime = 86400)
    {
        // set your default time-zone
        date_default_timezone_set('Asia/Bangkok');
        $this->issuedAt = time();

        if (!in_array($lifetime, self::TOKEN_LIFETIMES, true)) {
            throw new InvalidArgumentException('Invalid token lifetime.');
        }
        $this->expire = $this->issuedAt + $lifetime;
        // Set your secret or signature
        $this->jwt_secrect = "this_is_my_secrect";
    }

    public function jwtEncodeData($iss, $data)
    {

        $this->token = array(
            //Adding the identifier to the token (who issue the token)
            "iss" => $iss,
            "aud" => $iss,
            // Adding the current timestamp to the token, for identifying that when the token was issued.
            "iat" => $this->issuedAt,
            // Token expiration
            "exp" => $this->expire,
            // Payload
            "data" => $data
        );

        $this->jwt = JWT::encode($this->token, $this->jwt_secrect, 'HS256');
        return $this->jwt;
    }

    public function getExpiresAt()
    {
        return $this->expire;
    }

    public function jwtDecodeData($jwt_token)
    {
        try {
            $decode = JWT::decode($jwt_token, $this->jwt_secrect, array('HS256'));
            return [
                "data" => $decode->data
            ];
        } catch (Exception $e) {
            return [
                "message" => $e->getMessage()
            ];
        }
    }
}
