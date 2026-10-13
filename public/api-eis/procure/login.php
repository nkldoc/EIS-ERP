<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: access");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require __DIR__.'/classes/Database.php';
require __DIR__.'/classes/JwtHandler.php';

function msg($success,$status,$message,$extra = []){
    return array_merge([
        'success' => $success,
        'status' => $status,
        'message' => $message
    ],$extra);
}

$db_connection = new Database();
$conn = $db_connection->dbConnection();

$data = json_decode(file_get_contents("php://input"));
$identifier = $data->username ?? $data->email ?? null;
$returnData = [];

// IF REQUEST METHOD IS NOT EQUAL TO POST
if($_SERVER["REQUEST_METHOD"] != "POST"):
    $returnData = msg(0,404,'Page Not Found!');

// CHECKING EMPTY FIELDS
elseif(!is_string($identifier)
    || !isset($data->password) || !is_string($data->password)
    || empty(trim($identifier))
    || empty(trim($data->password))
    ):

    $fields = ['fields' => ['email','password']];
    $returnData = msg(0,422,'Please Fill in all Required Fields!',$fields);

elseif(isset($data->token_lifetime) && !in_array($data->token_lifetime, JwtHandler::TOKEN_LIFETIMES, true)):
    http_response_code(422);
    $returnData = msg(0,422,'Invalid token lifetime.');

// IF THERE ARE NO EMPTY FIELDS THEN-
else:
    $email = trim($identifier);
    $password = trim($data->password);

    // CHECKING THE EMAIL FORMAT (IF INVALID FORMAT)
    if(strlen($password) < 8):
        $returnData = msg(0,422,'Your password must be at least 8 characters long!');

    // THE USER IS ABLE TO PERFORM THE LOGIN ACTION
    else:
        try{
            $conn->beginTransaction();
            
            $fetch_user_by_email = strpos($email, '@') !== false
                ? "SELECT * FROM `users` WHERE `email`=:email FOR UPDATE"
                : "SELECT * FROM `users` WHERE `name`=:email FOR UPDATE";
            $query_stmt = $conn->prepare($fetch_user_by_email);
            $query_stmt->bindValue(':email', $email,PDO::PARAM_STR);
            $query_stmt->execute();

            // IF THE USER IS FOUNDED BY EMAIL
            if($query_stmt->rowCount() === 1):
                $row = $query_stmt->fetch(PDO::FETCH_ASSOC);
                $check_password = password_verify($password, $row['password']);

                // VERIFYING THE PASSWORD (IS CORRECT OR NOT?)
                // IF PASSWORD IS CORRECT THEN SEND THE LOGIN TOKEN
                if($check_password && !(int)$row['is_active']):
                    http_response_code(403);
                    $returnData = msg(0,403,'Account disabled.');
                elseif($check_password):

                    $lifetime = $row['token_lifetime'] !== null ? (int)$row['token_lifetime'] : ($data->token_lifetime ?? 86400);
                    $jwt = new JwtHandler($lifetime);
                    $token = $jwt->jwtEncodeData(__DIR__, array("user_id"=> $row['id'], "token_version" => (int)$row['token_version']));
                    $update = $conn->prepare('UPDATE users SET last_token_expires_at=? WHERE id=?');
                    $update->execute([$jwt->getExpiresAt(), $row['id']]);
                    
                    $returnData = [
                        'success' => 1,
                        'message' => 'You have successfully logged in.',
                        'token' => $token,
                        'expires_at' => $jwt->getExpiresAt(),
                        'token_lifetime' => $lifetime,
                        'lifetime_managed' => $row['token_lifetime'] !== null
                    ];

                // IF INVALID PASSWORD
                else:
                    $returnData = msg(0,422,'Invalid Password!');
                endif;

            // IF THE USER IS NOT FOUNDED BY EMAIL THEN SHOW THE FOLLOWING ERROR
            else:
                $returnData = msg(0,422,'Invalid Email Address!');
            endif;
            $conn->commit();
        }
        catch(PDOException $e){
            if ($conn->inTransaction()) $conn->rollBack();
            http_response_code(500);
            $returnData = msg(0,500,'Unable to log in.');
        }

    endif;

endif;

echo json_encode($returnData);
