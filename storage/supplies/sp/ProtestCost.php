<?php
include("../conf/config.php");

// $ss_user_id = @$_SESSION["user_id"];
// $user_id = 0;
// if (in_array($ss_user_id, array('1'))) { /* 1 : admin */
//     $user_id = 1; //: admin
// } else if (in_array($ss_user_id, array('3'))) { /* 3 : วราพร ผ่องใยดี */
//     $user_id = 60051; //: บัญชีตั้งค่าใช้จ่ายประจำเดือน
// } else if (in_array($ss_user_id, array('5'))) { /* 5 : สุนันทา สีดา */
//     $user_id = 60102; //: บัญชี
// }

// if ($user_id == 0) {
//     // exit;
// }
// $sp_emp =
// print_r($_SESSION);
// exit; 
$session_supplies = "user_emp_id=" . $_SESSION['user_id'];
// $session_transfer .= "&ss_user_id=" . $user_id;
// $session_transfer .= "&ss_last_login=" . $_SESSION["last_login"];
$OSI = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
    <title><?php echo COMPANY_NAME; ?></title>
</head>

<body style="margin:0px;padding:0px;overflow:hidden">
    <iframe src="<?= $OSI ?>://<?= NMU_HOST ?>/access/seseion_transfer.php?" style="position: absolute; width:0; height:0; border:0;" height="1" width="1"></iframe>
    <iframe src="<?= $OSI ?>://<?= NMU_HOST ?>/po/ProtestCost.php?<?=$session_supplies ?>&_dc=<?= __VPRODUCT_; ?>" frameborder="0" style="overflow:hidden;overflow-x:hidden;overflow-y:hidden;height:100%;width:100%;position:absolute;top:0px;left:0px;right:0px;bottom:0px" height="100%" width="100%"></iframe>
</body>

</html>