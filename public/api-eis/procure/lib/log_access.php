<?php
function API_log_access($menuID, $menuTxt)
{
    $fullVersion = '';
    $browserName = '';
    $nAgt = @$_SERVER['HTTP_USER_AGENT'];
    if (strpos($nAgt, "Opera") != "") {
        $browserName = "Opera";
        $fullVersion = substr($nAgt, strpos($nAgt, "Opera") + 6);
    } else if (strpos($nAgt, "MSIE") != "") {
        $browserName = "Microsoft Internet Explore";
        $fullVersion = substr($nAgt, strpos($nAgt, "MSIE") + 5);
    } else if (strpos($nAgt, "Chrome") != "") {
        $browserName = "Chrome";
        $fullVersion = substr($nAgt, strpos($nAgt, "Chrome") + 7);
    } else if (strpos($nAgt, "Safari") != "") {
        $browserName = "Safari";
        $fullVersion = substr($nAgt, strpos($nAgt, "Safari") + 7);
    } else if (strpos($nAgt, "Firefox") != "") {
        $browserName = "Firefox";
        $fullVersion = substr($nAgt, strpos($nAgt, "Firefox") + 8);
    }
    if (strpos($fullVersion, ";") != "") {
        $fullVersion = substr($fullVersion, 0, strpos($fullVersion, ";"));
    }
    if (strpos($fullVersion, " ") != "") {
        $fullVersion = substr($fullVersion, 0, strpos($fullVersion, " "));
    }
    $majorVersion = intval($fullVersion, 10);
    $db = new DatabaseServer();
    $db->BeginTran();

    $sysUserID      = 0;
    $ip             = @getenv('HTTP_CLIENT_IP') ?: @getenv('HTTP_X_FORWARDED_FOR') ?: @getenv('HTTP_X_FORWARDED') ?: @getenv('HTTP_FORWARDED_FOR') ?: @getenv('HTTP_FORWARDED') ?: @getenv('REMOTE_ADDR');
    $menuID         = $menuID;
    $menuText       = $menuTxt;
    $browser        = $browserName . "  = " . $fullVersion . ",Major version = " . $majorVersion . ",navigator.userAgent = " . $nAgt;
    $access_date    = date("Y-m-d H:i:s");

    $sql = "INSERT INTO NMU..log_access (sysUserId, ip, menuID
                                    , menuTxt, browser, access_date)
                                    VALUES (?, ?, ?
                                            , ?, ?, ?)";
    $arrParam = array($sysUserID, $ip, $menuID, $menuText, $browser, $access_date);
    $log_stmt = $db->QueryParam($sql, $arrParam);

    if ($log_stmt) {
        $db->CommitTran();
        $log_re = array("reval" => 0, "success" => "Success", "msg" => "บันทีกเรียบร้อยแล้ว");
    } else {
        $db->RollBackTran();
        $log_re = array("reval" => 1, "success" => "Error", "msg" => "check statement : {$sql}");
    }
    // echo json_encode($re);
}
