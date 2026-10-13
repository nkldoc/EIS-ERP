<?php

class DatabaseServer {

    public $conn;

    public function __Construct($DB_HOST = "", $DB_USER = "", $DB_PASS = "", $DB_NAME = "", $DB_CHARSET = "")
    {
        $DB_HOST    = ($DB_HOST == "") ? DB_SERVER : $DB_HOST;
        $DB_USER    = ($DB_USER == "") ? DB_USER : $DB_USER;
        $DB_PASS    = ($DB_PASS == "") ? DB_PASS : $DB_PASS;
        $DB_NAME    = ($DB_NAME == "") ? DB_NAME : $DB_NAME;
        $DB_CHARSET = ($DB_CHARSET == "") ? DB_CHARSET : $DB_CHARSET;

        $conInfo = array(
            "Database" => $DB_NAME,
            "UID" => $DB_USER,
            "PWD" => $DB_PASS,
            "LoginTimeout" => 5,
            "CharacterSet" => $DB_CHARSET,
            "TrustServerCertificate" => defined('MSSQL_TRUST_SERVER_CERTIFICATE') ? MSSQL_TRUST_SERVER_CERTIFICATE : true,
            "Encrypt" => defined('MSSQL_ENCRYPT') ? MSSQL_ENCRYPT : false,
        );

        $this->conn = @sqlsrv_connect($DB_HOST, $conInfo);

        if ($this->conn) {
            return true;
        } else {
            echo "Connection could not be established.<br />";
            die(print_r(sqlsrv_errors(), true));
        }
    }

    public function Query($sql)
    {

        //$stmt = @sqlsrv_query($this->conn, $sql,array("QueryTimeout" => 60));
        $stmt = @sqlsrv_query($this->conn, $sql);
        if ($stmt === false) {
            die(print_r(sqlsrv_errors(), true));
        }
        return $stmt;
    }

    public function QueryParam($sql, $arrParam)
    {
        $stmt = @sqlsrv_query($this->conn, $sql, $arrParam);
        if ($stmt === false) {
            die(print_r(sqlsrv_errors(), true));
        }
        return $stmt;
    }

    protected function RowAffect($stmt)
    {
        return @sqlsrv_rows_affected($stmt);
    }

    public function NumRows($stmt)
    {
        return @sqlsrv_num_rows($stmt);
    }

    public function NumFields($stmt)
    {
        return @sqlsrv_num_fields($stmt);
    }

    public function Fetch($stmt, $fetchType = SQLSRV_FETCH_ASSOC)
    {
        return @sqlsrv_fetch_array($stmt, $fetchType);
    }

    public function FreeSTMT($stmt)
    {
        @sqlsrv_free_stmt($stmt);
    }

    public function NextResult($stmt)
    {
        $next_result = @sqlsrv_next_result($stmt);

        if ($next_result === false) {
            die(print_r(sqlsrv_errors(), true));
        }
        return $next_result;
    }

    public function BeginTran()
    {
        if (@sqlsrv_begin_transaction($this->conn) === false) {
            die(print_r(sqlsrv_errors(), true));
        }
    }

    public function CommitTran()
    {
        return @sqlsrv_commit($this->conn);
    }

    public function RollBackTran()
    {
        return sqlsrv_rollback($this->conn);
    }

    public function GetDataBySQL($sql, $arrParam)
    {

        $stmt  = $this->QueryParam($sql, $arrParam);
        $fetch = $this->Fetch($stmt, SQLSRV_FETCH_BOTH);
        if ($this->NumFields($stmt) == 1)
            list($data) = $fetch;
        else
            $data  = $fetch;

        $this->FreeSTMT($stmt);
        return $data;
    }

    public function json_clean_decode($json, $assoc = false, $depth = 512, $options = 0)
    {

        // search and remove comments like /* */ and //
        $json = preg_replace("#(/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+/)|([\s\t](//).*)#", '', $json);

        if (version_compare(phpversion(), '5.4.0', '>=')) {
            $json = json_decode($json, $assoc, $depth, $options);
        } elseif (version_compare(phpversion(), '5.3.0', '>=')) {
            $json = json_decode($json, $assoc, $depth);
        } else {
            $json = json_decode($json, $assoc);
        }

        return $json;
    }

    //end func
// Method: POST, PUT, GET etc
// Data: array("param" => "value") ==> index.php?param=value

    public function CallAPI($method, $url, $data = false) {
        $curl = curl_init();
        switch ($method) {
            case "POST":
                curl_setopt($curl, CURLOPT_POST, 1);

                if ($data)
                    curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
                break;
            case "PUT":
                curl_setopt($curl, CURLOPT_PUT, 1);
                break;
            default:
                if ($data)
                    $url = sprintf("%s?%s", $url, http_build_query($data));
        }

        // Optional Authentication:
        curl_setopt($curl, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
        curl_setopt($curl, CURLOPT_USERPWD, "username:password");

        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);

        $result = curl_exec($curl);

        curl_close($curl);

        return $result;
    }
    public function setUserCookie($name, $value, $expires = 0, $path = "", $domain = "", $secure = false, $http_only = false) {
       $value = rawurlencode($value);
       date_default_timezone_set('UTC');
       $date = date("D, d-M-Y H:i:s",$expires) . ' GMT';
       $header = "Set-Cookie: {$name}={$value}";
       if($expires != 0) {
         $header .= "; expires={$date}; Max-Age=".($expires - time());
       }
       if($path != "") {
         $header .= "; path=".$path;
       }
       if($domain != "") {
         $header .= "; domain=".$domain;
       }
       if($secure) {
         $header .= "; secure";
       }
       if($http_only) {
         $header .= "; HttpOnly";
       }
       header($header, false);
    }
    public function sendAPI($arr, $url = 'http://staging-api.sellsuki.com/dpx/warehousetxcheck', $meth = 'POST',$cookie='session_id=fb78c8c0d8853e792ae25a5fb5845151110bc3cf'){
        $data_json = $arr;
        $ch = curl_init();
        //$cookie = $this->setUserCookie("JULA-API","sss");   
    //header("Set-Cookie: user=$_POST[email]; expires=Tue, 17-May-12 14:39:58 GMT;path=/; domain=yourdomain.com");
            
    //$headers[] = 'Set-Cookie: user=$_POST[email]; expires=Tue, 17-May-12 14:39:58 GMT;path=/; domain=yourdomain.com';
            
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json','Set-Cookie: '.$cookie));
        curl_setopt($ch, CURLOPT_VERBOSE, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
        curl_setopt($ch, CURLOPT_CAINFO, getcwd() . "/juladev.crt");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data_json);
        if ($meth == 'POST') {
            curl_setopt($ch, CURLOPT_POST, 1);
        } else if ($meth == 'PUT') {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
        } else if ($meth == 'DELETE') {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");
        }

        $response = curl_exec($ch);
        curl_close($ch);
        return $response;
    }

    //NEW BY EAK
    public function getData($url)
    {
        $po_dtl_list = file_get_contents($url);
        $po_dtl_list = json_decode($po_dtl_list, true);
        return $po_dtl_list;
    }

    public function getList($list = array(), $val = 0, $id = 'id', $c_name = 'c_name')
    {

        foreach ($list as $ptArr) {
            if ($ptArr[$id] == $val) {
                $getPTgetHDR = $ptArr[$c_name];
            }
        }
        return $getPTgetHDR;
    }

    public function setData($url, $val = 0, $id = 'id', $c_name = 'c_name')
    {

        if ($val > 0)
            return $this->getList($this->getData($url)['data'], $val);
        else
            return $this->getData($url);
    }

    public function formatLog()
    {
        $time      = date("M j G:i:s Y");
        $ip        = getenv('REMOTE_ADDR');
        $userAgent = getenv('HTTP_USER_AGENT');
        $referrer  = getenv('HTTP_REFERER');
        $query     = getenv('QUERY_STRING');
        //COMBINE VARS INTO OUR LOG ENTRY
        return $msg       = "IP: " . $ip . " TIME: " . $time . " REFERRER: " . $referrer . " SEARCHSTRING: " . $query . " USERAGENT: " . $userAgent;
    }

    public function logs(
        $menu,
        $mode,
        $id = null /* field name of primary key on menu */,
        $value = null /* id row on acton */,
        $sql = null /* sql statement */,
        $parram = array() /* parram sql */,
        $ses = array() /* sesson */,
        $log_filename = "../../../_logs" /* curren http://localhost/nmu/po/dc/controller */
    ) {
        if (is_array($ses)) {
            $user = array($ses['user_id'] => $ses["user_name"]);
        } // End if

        $paratxt = json_encode($parram);
        //remove space & newline
        $sql3    = str_replace(
            array("\n", "\r"),
            "",
            str_replace(
                array("  ", "   ", "        ", "        "),
                " ",
                $sql
            )
        );
        //prepraring array return
        $arr     = array(
            "d_action_date" => date('Y-m-d H:i:s'),
            "menu"          => "{$menu}",
            "user_info"     => $user,
            "mode"          => "{$mode}",
            "user_id"       => "{$ses['user_id']}",
            "id"            => $id,
            "value"         => $value,
            "sql"           => $sql3,
            "parram"        => $paratxt
        );
        /* ใช้แยกโฟลเดอร์ */
        $logym   = ("/" . date('Y-m') . "/");

        $log_filename = $log_filename . $logym;

        if (!file_exists($log_filename)) {
            // create directory/folder uploads.
            mkdir($log_filename, 0777, true);
        }
        $log_file_data = $log_filename . date('Y-m-d') . '-' . $menu . '-' . $ses['user_id'] . '.log';

        if (file_put_contents(
            $log_file_data,
            ("," . json_encode($arr) . "\n"),
            FILE_APPEND
        )) {
            $re      = "log success";
            $success = "Success";
            $reval   = 0;
        } else {
            $re      = "log failed";
            $success = "Success";
            $reval   = 1;
        }
        return json_encode(array("reval" => $reval, "success" => $success, "msg" => $re));
    }

    //TODO create genLogFile();
    public function __Destruct()
    {
        sqlsrv_close($this->conn);
    }
}
