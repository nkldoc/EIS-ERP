<?PHP
/*eakibanez *************************************************
getHeaderCookieErp -> login 
lineNotif -> แจ้งเตือนไลน์
jsonLog -> สร้าง Log
jsonSendLog -> แจ้งเตือน
postMsg -> แจ้งเตือน
postIr -> แจ้งเตือน
postToSuppliesApi -> แจ้งเตือน

 *  */
function getHeaderCookieErp($endpoint = 'https://erpdev.vajira.ac.th') {
// Initialize cURL
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $endpoint);
    curl_setopt($ch, CURLOPT_HEADER, true);
    $responseHeaders = '';
// Set a callback function to capture the headers
    curl_setopt($ch, CURLOPT_WRITEFUNCTION, function ($curl, $data) use (&$responseHeaders) {
        $responseHeaders .= $data;
        return strlen($data);
    });
// Execute the request
    curl_exec($ch);
    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    curl_close($ch);
    $headers = substr($responseHeaders, 0, $headerSize);
    preg_match_all('/^Set-Cookie:\s*([^;\r\n]*)/mi', $headers, $cookies);
    $cookie = $cookies[1][0] ?? null;
// Output the cookie
    return $cookie;
} 
function lineNotif($msg) {
    $url = 'https://notify-api.line.me/api/notify';
    $token = 'D6FRoKcCbis7buuMmlDNHBJYXgOWamF8pbtHo6AUzS1'; // SEN TO Dev.ICE

    $headers = [
        'Content-Type: application/x-www-form-urlencoded',
        'Authorization: Bearer ' . $token
    ];
    $fields = 'message=' . $msg;

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $fields);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    $result = curl_exec($ch);
    curl_close($ch);
    $result = json_decode($result, TRUE);
    return $result;
} 
function jsonLog($arrJson = array()) {
    $datetime = date('Y-m-d H:i:s');
    $posts = array("postdt" => $datetime, "datas" => $arrJson);
    $json = json_encode($posts);
    file_put_contents('logs/' . date('Y-m') . '-log.json', ($json . ","), FILE_APPEND); 
    //print_r($posts["datas"]["datatype"]);
    //alert(lineGroup);
    $success = $posts["datas"]["success"] ?? null;
    if ($success === 0) {
        $datatype = $posts["datas"]["message"] ?? null;
    } else {
        $datatype = $posts["datas"]["datatype"] ?? null;
    } 
    lineNotif("logtime api :::" . $datetime . ":::" . $datatype);
}
function jsonSendLog($arrJson = array()) {
    $datetime = date('Y-m-d H:i:s');
    $posts = array("postdt" => $datetime, "datas" => $arrJson);
    $json = json_encode($posts);
    file_put_contents('logs/' . date('Y-m') . '-log.json', ($json . ","), FILE_APPEND);
    //print_r($posts["datas"]["datatype"]);
    //alert(lineGroup);
    $success = $posts["datas"]["success"] ?? null;
    if ($success === 0) {
        $datatype = $posts["datas"]["message"] ?? null;
    } else {
        $datatype = $posts["datas"]["datatype"] ?? null;
    }
} 
function postPeriod($step=1, $id=null, $dtl_id=null,$db, $date, $data = [], $data2 = []){
 
         
$url = URL_SERVER_API.'/mnTorController';

// Payload for the POST request


    if ($step == 1) {
        $payload = [
                "mode" => "UP_SP_TOR_HDR_PERIOD",
                "sp_tor_hdr_period_id" => null,
                "tor_id" => 2361,
                "sp_tor_contract_id" => $data['sp_tor_contract_id'], //$data["sp_tor_contract_id"],
                "i_is_join_ventureID" => null,
                "c_name" => $data2["c_name"],
                "i_qty" => 1,
                "dc_unit_type_id" => 24,
                "i_is_po" => 0,
                "i_is_purchase" => null,
                "ap_po_hdr_id" => null,
                "i_period" => $data["i_period"],
                "d_doc_date" => "29-11-2567",
                "i_day_use_l" => 1,
                "d_period_date" => "31-01-2568",
                "i_day" => 63,
                "i_alert" => 1,
                "f_total_amt" => $data["f_total_amt"],
                "dc_expense_budget_type_id" => 2,
                "dc_bg_budget_type_id" => "เงินรายได้คณะแพทย์ฯ-โรงพยาบาล",
                "dc_cost2_id" => 51,
                "dc_creditor_id" => 9726,
                "i_is_join_venture_per" => null,
                "c_code" => "พวช.ซ.005006/2568",
                "dc_creditor_id2" => null,
                "txtdc_creditor_id2ID" => "เลือกผู้เสนอราคา",
                "already_withdrawn" => 1,
                "i_pr_type1" => 1,
                "copy_contract_dtl" => "save",
                "sp_expense_id" => 131,
                "po_expense_id" => "030308001 : ค่าวัสดุเครื่องบริโภค",
                "i_hire_type_l" => 1,
                "i_product_type" => 1,
                "period_i_is_inv" => null,
                "c_name_dtl" => $data2["c_name"],
                "i_qty" => 1,
                "f_net_unit_price" => $data["f_total_amt"],
                "sp_unit_type_id" => 24,
                "dc_unit_type_id" => "รายการ"
            ];
        $jsonPayload = json_encode($payload);
        
    } else if ($step == 2) {
 
        
        $payload2 = [
            "mode" => "UP_SP_CHECK_PERIOD_DTL",
            "data_dtl" => [
                [
                    "i_qty" => "1",
                    "sp_tor_hdr_period_id" => $id,
                    "sp_tor_dtl_period_id" => $dtl_id,
                    "dc_creditor_id" => "9726",
                    "c_name" => $data2["c_name"],
                    "dc_unit_type_id" => 24,
                    "c_unit" => "รายการ",
                    "dc_bg_budget_type_id" => "2",
                    "po_expense_id" => "131",
                    "i_hire_type" => 1,
                    "i_product_type" => 1,
                    "i_is_inv" => null,
                    "f_net_unit_price" => $data["f_total_amt"],
                    "f_net_total_price" => $data["f_total_amt"]
                ]
            ],
            "sp_tor_hdr_period_id" => $id,
            "sp_mn_contract_hdr_id" => 1868,//get ผ่านรายการก่อนถึงจะได้มาซึ่ง 
            "sp_tor_contract_id" => $data['sp_tor_contract_id'],//$data["sp_tor_contract_id"],
            "i_is_po" => 0,
            "f_vat_amt" => "1,226,716.64",
            "f_total_add_vat_amt" => "17,524,523.36",
            "f_rate_vat" => 7.00,
            "c_doc_ref" =>  $data['c_doc_ref'],
            "d_arrive_date" => "2025-01-08",
            "d_doc_arrive_dt" => "2025-01-15",
            "c_comment" => $data["c_comment"],
            "dc_creditor_per_id" => 9726
        ];       
        $jsonPayload = json_encode($payload2);
    }

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json',]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonPayload); 
    // Disable SSL verification (temporary)
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
    $response = curl_exec($ch);
    if (curl_errno($ch)) {
        echo 'cURL error: ' . curl_error($ch);
    } else {
        // echo 'Response: ' . $response;
    } 
    curl_close($ch); 
return $response;
} 
function postMsg($msg='ส่งข้อความจากแอดมินระบบจะทำการรีโหลดเสิร์ฟเวอร์ 10 นาที'){ 
 $url = "https://".SERVER_RUN_APP.".vajira.ac.th:8443/supplies/websocket/event";  
// Define the query parameters
$params = [
    'msgType' => '4',
    'msg' => $msg
]; 
// Append the query parameters to the URL
$fullUrl = $url . '?' . http_build_query($params); 
// Initialize cURL session
$ch = curl_init(); 
// Set cURL options
curl_setopt($ch, CURLOPT_URL, $fullUrl); // Use the full URL with query parameters
curl_setopt($ch, CURLOPT_POST, true);   // Specify this is a POST request
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Disable SSL verification if needed 
// Execute the request and get the response
$response = curl_exec($ch); 
// Check for errors
if (curl_errno($ch)) {
    echo 'Error:' . curl_error($ch);
} else {
    echo 'Response:' . $response;
} 
// Close the cURL session
curl_close($ch);
}
function postIr($period ,$db, $date, $data = [], $data2 = []){
    $arr = json_decode($period);  
    postPeriod(2, $arr->id, $arr->dtl_id, $db, $date, $data, $data2); 
    
}
function postToSuppliesApi($db, $date, $arrJson = [], $url) {
        if(!is_array($arrJson)){  
            die('ข้อมูลผิดพลาด กรุณาตรวจเช็คอีกครั้ง');
        }
        $data = array();  
         // เตรียมข้อมูล

        // b  
         // period_hdr_id
         $data["sp_tor_hdr_period_id"] = $arrJson["data"][0]["erp_hdr_period_id"];
         $data["sp_tor_contract_id"] = $arrJson["data"][0]["sp_tor_contract_id"];
         $data["c_doc_ref"] = $arrJson["data"][0]["c_doc_ref"];
         $data["i_period"] = $arrJson["data"][0]["i_period"];
         $data["c_contract_code"] = $arrJson["data"][0]["c_contract_code"];
         $data["f_vat_amt"] = $arrJson["data"][0]["f_vat_amt"];
         $data["f_total_amt"] = $arrJson["data"][0]["f_total_amt"];
         $data["d_doc_date"] = $arrJson["data"][0]["d_pickup_date"];
         $data["c_comment"] = $arrJson["data"][0]["c_comment"];
      
         $dtl = $arrJson["data"][0]["tbl_dtl"][0];
         $data2 = array(); 
         // period_dtl_id
         $data2["erp_dtl_period_id"] = $dtl["erp_dtl_period_id"];
         $data2["c_name"] = $dtl["c_name"];
         $data2["i_qty"] = $dtl["i_qty"];
         $data2["dc_unit_id"] = $dtl["dc_unit_id"];
         $data2["dc_unit_name"] = $dtl["dc_unit_name"];
         $data2["f_net_unit_price"] = $dtl["f_net_unit_price"];
         $data2["dc_product_type_id"] = $dtl["dc_product_type_id"];
         $data2["dc_product_type_name"] = $dtl["dc_product_type_name"];
      
        // post period
        $url;
        $period = postPeriod(1, null,null,$db, $date, $data, $data2);   // inert period
        postIr($period,$db, $date, $data, $data2); //เตรียมข้อมูลและ insert checking
         // d 
  
     
} //End IF Insert
