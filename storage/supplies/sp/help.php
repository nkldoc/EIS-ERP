<?php include("../conf/config.php"); ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title><?php echo COMPANY_NAME; ?></title>
        <!-- System ERP :: Src js  -->
        <?php include("../lib/loadJs.php"); ?>
        <?php include("../lib/loadCss.php"); ?>
        <!-- System ERP :: -->
        <script type="text/javascript" src="../lib/right/GrantPermission.php?_dc=<?= __VPRODUCT_; ?>&f=<?php echo $_SERVER["PHP_SELF"]; ?>"></script>
        <!-- System ERP :: -->
        <style type="text/css"/>
        .helpe p{
        font-size:18px; color
        } h1 {
        font-size:20px;
        }
        p {  margin-bottom: 0 }
        p + p {  text-indent: 1.5em; margin-top: 0 }

        </style>
    </head>
    <body>
        <?php
         echo '<div class="headx" id="info-user" align="left"><h1>'
         . '<span class="info-username"> ชื่อผู้ใช้งาน : ' . @$_SESSION['user_name'] . ' </span><br/>'
         . '<span class="info-username"> หน่วยงาน : ' . @$_SESSION['cost_name'] . ' </span><br/>'
         . '<span class="info-departmentTypename"> แผนก : ' . @$_SESSION['c_department_type'] . ' </span><br/>'
         . '<span class="info-departmentTypename"> ภายใต้สายงาน : ' . @$_SESSION['c_department'] . ' </span><br/>'
         . '<span class="info-departmentTypename"> ระดับ  : ' . @$_SESSION['c_position'] . ' </span><br/>'
         . '</h1></div>';
        ?>
            <div class="helpe" style="justify-content: 32px;">
                <p><h1> การแจ้งเตือน Table sp_tor จะเก็บฟิวด์อัพเดทวันที่ จะจับจากสถานะเมนู Table sp_status_hdr และวันปัจจุบัน นับเคาดาวน์</h1></p>
                <p> การแจ้งเตือน Table </p>
                <p>   dbo.sp_tor_alert_item เพื่อทำการแจ้งเตือน</p>
                <p> , dbo.sp_tor_pa_item  เป็นรายงานทำ PA </p>
                <p> , dbo.sp_tor_item บันทีกในรูปแบบ item insert </p>
                <p> , dbo.sp_tor_emp ดูผู้รับผิดชอบงาน ณ เวลานั้น </p>
              
            <div>
        </body>
       </html>