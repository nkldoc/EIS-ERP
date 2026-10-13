<?php
require_once __DIR__ . '/../conf/database.php';

class Database {
    
    // CHANGE THE DB INFO ACCORDING TO YOUR DATABASE
    private $db_host = MYSQL_DB_HOST;
    private $db_port = MYSQL_DB_PORT;
    private $db_name = MYSQL_DB_NAME;
    private $db_username = MYSQL_DB_USER;
    private $db_password = MYSQL_DB_PASS;
    private $json_period = ''; 

    public function dbConnection(){
        try{
            $conn = new PDO(
                'mysql:host='.$this->db_host.';port='.$this->db_port.';dbname='.$this->db_name.';charset=utf8mb4',
                $this->db_username,
                $this->db_password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_TIMEOUT => 5,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                ]
            );
            return $conn;
        }
        catch(PDOException $e){
            echo "Connection error ".$e->getMessage(); 
            exit;
        }     
    } 

    public function getHeaderCookieErp($endpoint = 'https://erpdev.vajira.ac.th') {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $endpoint);
        curl_setopt($ch, CURLOPT_HEADER, true);
        $responseHeaders = '';
        curl_setopt($ch, CURLOPT_WRITEFUNCTION, function ($curl, $data) use (&$responseHeaders) {
            $responseHeaders .= $data;
            return strlen($data);
        });
        curl_exec($ch);
        $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
        curl_close($ch);
        $headers = substr($responseHeaders, 0, $headerSize);
        preg_match_all('/^Set-Cookie:\s*([^;\r\n]*)/mi', $headers, $cookies);
        $cookie = $cookies[1][0] ?? null;
        return $cookie;
    } 

    public function lineNotif($msg) {
        $url = 'https://notify-api.line.me/api/notify';
        $token = 'D6FRoKcCbis7buuMmlDNHBJYXgOWamF8pbtHo6AUzS1'; 

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

    public function jsonLog($arrJson = array()) {
        $datetime = date('Y-m-d H:i:s');
        $posts = array("postdt" => $datetime, "datas" => $arrJson);
        $json = json_encode($posts, JSON_UNESCAPED_UNICODE);
        file_put_contents('logs/' . date('Y-m') . '-log.json', ($json . ","), FILE_APPEND); 
        
        $success = $posts["datas"]["success"] ?? null;
        if ($success === 0) {
            $datatype = $posts["datas"]["message"] ?? null;
        } else {
            $datatype = $posts["datas"]["datatype"] ?? null;
        } 
        $this->lineNotif("logtime api :::" . $datetime . ":::" . $datatype);
    }

    public function jsonSendLog($arrJson = array()) {
        $datetime = date('Y-m-d H:i:s');
        $posts = array("postdt" => $datetime, "datas" => $arrJson);
        $json = json_encode($posts, JSON_UNESCAPED_UNICODE);
        file_put_contents('logs/' . date('Y-m') . '-log.json', ($json . ","), FILE_APPEND);
    } 

    // ปรับลำดับ Parameter: เอา $db, $date, $data, $data2 มาไว้ข้างหน้า เพราะไม่มีค่า Default
    public function postPeriod($db, $date, $data = [], $data2 = [], $step = 1, $id = null, $dtl_id = null) {
        $url = URL_API_JULA . '/mnTorController';

        if ($step == 1) {
            $payload = [
                "mode" => "UP_SP_TOR_HDR_PERIOD",
                "sp_tor_hdr_period_id" => null,
                "tor_id" => 2361,
                "sp_tor_contract_id" => $data['sp_tor_contract_id'],
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
            $jsonPayload = json_encode($payload, JSON_UNESCAPED_UNICODE);

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
                "sp_mn_contract_hdr_id" => 1868,
                "sp_tor_contract_id" => $data['sp_tor_contract_id'],
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
            $jsonPayload = json_encode($payload2, JSON_UNESCAPED_UNICODE);
        }

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonPayload); 
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
        $response = curl_exec($ch);
        curl_close($ch); 
        return $response;
    } 

    public function postMsg($msg = 'ส่งข้อความจากแอดมินระบบจะทำการรีโหลดเสิร์ฟเวอร์ 10 นาที') {
        $url = "https://eis.vajira.ac.th:8443/supplies/websocket/event";
        $params = ['msgType' => '4', 'msg' => $msg]; 
        $fullUrl = $url . '?' . http_build_query($params); 
        $ch = curl_init(); 
        curl_setopt($ch, CURLOPT_URL, $fullUrl); 
        curl_setopt($ch, CURLOPT_POST, true);   
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); 
        $response = curl_exec($ch); 
        curl_close($ch);
    }

    public function postIr($period, $db, $date, $data = [], $data2 = []) {
        $arr = json_decode($period);  
        // เรียกใช้ postPeriod ด้วยลำดับ parameter ใหม่
        $this->postPeriod($db, $date, $data, $data2, 2, $arr->id, $arr->dtl_id); 
        
        $this->postMsg('ระบบ ERP สัญญา '.$data["c_contract_code"].' จำนวนเงิน '.number_format($data["f_total_amt"],2).' ID '.$arr->id
                    .' ได้ส่งรายการรับของจากคลังมาเพื่อ ดำเนินการออกเลข IR พนักงานผู้รับผิดดำเนินการต่อไป');
    }

    public function postToSuppliesApi($db, $date, $arrJson = []) {
        if(!is_array($arrJson)){  
            die('ข้อมูลผิดพลาด กรุณาตรวจเช็คอีกครั้ง');
        }
        
        $data = array();  
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
        $data2["erp_dtl_period_id"] = $dtl["erp_dtl_period_id"];
        $data2["c_name"] = $dtl["c_name"];
        $data2["i_qty"] = $dtl["i_qty"];
        $data2["dc_unit_id"] = $dtl["dc_unit_id"];
        $data2["dc_unit_name"] = $dtl["dc_unit_name"];
        $data2["f_net_unit_price"] = $dtl["f_net_unit_price"];
        $data2["dc_product_type_id"] = $dtl["dc_product_type_id"];
        $data2["dc_product_type_name"] = $dtl["dc_product_type_name"];

        // เรียกใช้ postPeriod ด้วยลำดับ parameter ใหม่ (step 1)
        $this->json_period = $this->postPeriod($db, $date, $data, $data2, 1, null, null); 

        try {
            $this->postIr($this->json_period, $db, $date, $data, $data2); 
        }
        catch(Exception $e) {
            echo "Error: " . $e->getMessage(); 
            exit;
        }
    }
}
