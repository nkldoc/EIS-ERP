<?php
header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Methods: *');
header('Access-Control-Allow-Headers: Content-Type, X-Api-Key ,Origin, X-Requested-With, Accept ,Authorization , X-PINGOTHER,');
header('Access-Control-Allow-Credentials: true');
include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");
// $db = new DatabaseServer();
// $date = new i_date();
// $util = new apiUtil();

function GoogleNotif($UI,$group) {
    $db = new DatabaseServer();
    $date = new i_date();
    $util = new apiUtil();
    switch($group){
        case "1" : // TEST
            $token = "https://chat.googleapis.com/v1/spaces/AAAApG9BVEQ/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=-tdvufU_h-aGr-e1-oDDloo_Ik252Y_yVk0vyrMUpqw";
        break;
        case "2" : // จัดสรรเงิน
            $token = "https://chat.googleapis.com/v1/spaces/AAAATCpAByM/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=J5Ael6Spd9gshhspZ6166401PbQak9qd-r9zQb6JhB4";
        break;
        case "3" : // ปัญหา
            $token = "https://chat.googleapis.com/v1/spaces/AAAApG9BVEQ/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=-tdvufU_h-aGr-e1-oDDloo_Ik252Y_yVk0vyrMUpqw";
        break;
        case "poApprove" : // ทักท้วง
            $token = "https://chat.googleapis.com/v1/spaces/AAQAZhaJn7A/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=I9q_-m4hytN3YzWFQw6kei9x-XQVDeFHqDEQp3BTqOc";
        break;
    }
    switch($UI){
        case "1" : //
                ###########################################
                $root = "data";
                $data = array();
                $con = '';
                // print_r($_REQUEST);
                // print_r($_SESSION);
                // exit;
                $sqlMain = $db->GetDataBySQL (
                "SELECT
                    aa.po_working_hdr_id
                    ,aa.c_code_ref
                    ,(select c_name from NMU.dbo.dc_creditor where dc_creditor_id = bb.dc_creditor_id ) dc_creditor 
                    ,(select c_full_name from NMU_DATACENTER..dc_user  where dc_user_id = bb.dc_user_create_id ) dc_user_create
                    ,ROW_NUMBER() OVER (ORDER BY aa.po_working_hdr_id ASC) AS row
                FROM NMU_EIS..po_working_hdr aa
                INNER JOIN NMU_EIS..po_working_dtl bb ON aa.po_working_hdr_id = bb.po_working_hdr_id  
                WHERE aa.po_working_hdr_id  =  ?",array($_REQUEST['id']));
                    $temp = array(
                        "text"                                  => "test",
                        // "id"                            => $row["po_working_hdr_id"],
                        
                    );
                    // ${$root}[] = $temp;
            // echo($sqlMain["c_code_ref"]);
            // exit;
            $jsonData = json_encode($temp);
            $jsonData = '{
                "cardsV2": [
                    {
                    "cardId": "unique-card-id",
                    "card": {
                        "header": {
                        "title": "📝 รายการทักท้วง",
                        "subtitle": "🟢  '.$sqlMain["c_code_ref"].'",
                        "imageType": "CIRCLE",
                        "imageAltText": "Avatar for Sasha"
                        },
                        "sections": [
                        {
                            "header": "ข้อมูล",
                            "collapsible": false,
                            "uncollapsibleWidgetsCount": 2,
                            "widgets": [
                             {
                                "decoratedText": {
                                "startIcon": {
                                    "knownIcon": "CLOCK"
                                },
                                "text": "'.date("l, d F Y").' '.date("h:i:s A").'"
                                }
                            },
                            {
                                "decoratedText": {
                                "startIcon": {
                                    "knownIcon": "PERSON"
                                },
                                "text": "เจ้าของเริ่อง : ' . $sqlMain["dc_user_create"]  .'"
                                }
                            },
                            {
                                "decoratedText": {
                                "startIcon": {
                                    "knownIcon": "MULTIPLE_PEOPLE"
                                },
                                "text": "ผู้ทักท้วง : ' . $_REQUEST["user_name"]  .'"
                                }
                            },
                            {
                                "decoratedText": {
                                "startIcon": {
                                    "knownIcon": "STORE"
                                },
                                "text": "'.$sqlMain["dc_creditor"].'"
                                }
                            },
                            {
                                "buttonList": {
                                "buttons": [
                                    {
                                    "text": "➡️ คลิกเพื่อเข้าสู่ระบบ EIS",
                                    "onClick": {
                                        "openLink": {
                                        "url": "https://eis.vajira.ac.th/NMU_EIS/#po/poProtest"
                                        }
                                    }
                                    },
                                ]
                                }
                            }
                            ]
                        }
                        ]
                    }
                    }
                ]
                }';
        break;
    }

    
// ${$root}[] = $temp;
// ${$root}[] = $temp;



// Step 2: Initialize a cURL session
$ch = curl_init();

// Step 3: Set the cURL options
curl_setopt($ch, CURLOPT_URL, $token);  // Replace with your API endpoint
curl_setopt($ch, CURLOPT_POST, true);  // Use POST method
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);  // Return the response as a string
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'Content-Type: application/json',  // Specify content type as JSON
    'Content-Length: ' . strlen($jsonData)  // Specify content length
));
curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);  // Attach JSON data to the POST fields

// Step 4: Execute the request and get the response
$response = curl_exec($ch);
// Check for errors
if ($response === false) {
    $error = curl_error($ch);
    // echo "cURL Error: $error";
} else {
    // Handle the response
    echo "Response: $response";
}

// Close the cURL session
curl_close($ch);
}

$reMsg = GoogleNotif($_REQUEST["Ui"],$_REQUEST["group"]); 