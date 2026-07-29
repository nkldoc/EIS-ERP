<?php
require_once("../conf/config.php");
echo "<script>location.href = \"https://" . HTTPS_HOST_NAME . "/NMU_permission\"</script>";
exit;
$usid = $_SESSION['user_id'] ?? null;
$vssoId = true;
// echo "<pre>";
// print_r($_REQUEST);
// echo "</pre>";
/*
if ($vssoId == true) {

    echo '<style>';
    echo '.box {
            display: flex;
            align-items: center;
            justify-content: center;
          } 
          .box div {
            width: 500px;
            height: 300px;
          }';
    
    echo '</style>';
    echo '<div class="box">
            <div>User ของท่านยังไม่ได้ทำการเชื่อมกับระบบ EIS กรุณาติดต่อแอดมิน </div>
   
          </div>';
    exit();
}*/
if ($usid > 0) {
    echo "<script>window.top.location.href =\"../index.php\"</script>";
    exit;
}
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title><?php echo COMPANY_NAME; ?></title>
        <!-- System ERP :: Src js  -->
        <?php include("../lib/loadJs.php"); ?>
        <?php include("../lib/loadCss.php"); ?>
        <!-- System ERP :: -->
        <link rel="stylesheet" type="text/css" title="gray" href="../js/ext-3.4.0/resources/css/xtheme-gray.css" />
        <script type="text/javascript" src="./js/signin.js?_dc=<?php echo rand(0, 100000); ?>"></script>
    </head>

    <body>
    </body>

</html>