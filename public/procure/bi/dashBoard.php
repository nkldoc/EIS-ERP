<?php
include("../conf/config.php");
include("./../lib/date/i_date.class.php");
$date = new i_date(); //$date->$l_month_thai
?>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF8">
        <title>NMU Dash Baord & Desktop</title>
        <!-- Alarm -->
        <!-- <script src="../js/jquery.min.js"></script>
        <link rel="stylesheet" href="../css/bootstrap3.min.css" />
        <script src="../js/bootstrap.min.js"></script> -->
        <script src="../js/jquery.min.js"></script>
        <link rel="stylesheet" href="../php-notic/bootstrap/css/bootstrap.min.css" />
        <link rel="stylesheet" href="../php-notic/bootstrap/css/dashBoard.css" />
        <script src="../js/bootstrap.min.js"></script>

        <!-- ORG -->
        <link rel="stylesheet" type="text/css" href="../js/ext-3.4.0/resources/css/ext-all.css" />
        <link rel="stylesheet" type="text/css" href="css/desktop.css" />
        <!-- GC -->
        <!-- LIBS -->
        <script type="text/javascript" src="../js/ext-3.4.0/adapter/ext/ext-base.js"></script>
        <!-- ENDLIBS -->
        <script type="text/javascript" src="../js/ext-3.4.0/ext-all-debug.js"></script> 

    </head>
    <body scroll="no">
        <div id="x-desktop">
            <!--Alarm-->
            <dl style="margin:15px 50px 0px 0px; float:right;"> 
              
                <dt id="right-logo-win-shortcut">
                    <a href="#"><img src="images/s.gif" />  
                </dt>
            </dl>
 
            <dl id="x-shortcuts" style="margin:15px; float:left;"> 
                <dt id="work-bi-win-shortcut">
                    <a href="#"><img src="images/s.gif" />
                        <div>Dashboard BI</div></a>
                </dt> 
                <dt id="work-process-month-win-shortcut">
                    <a href="#"><img src="images/s.gif" /> 
                        <div>ประมวลผลประจำเดือน <?php echo $date->l_month_thai[sprintf("%02d", date('m'))]." ".((date('Y')/1)+543);?></div></a>  
                </dt>
                <dt id="work-reports-month-win-shortcut">
                    <a href="#"><img src="images/s.gif" /> 
                        <div>รายงาน BI รายเดือน </div></a>  
                </dt> 
                <dt id="work-reports-year-win-shortcut">
                    <a href="#"><img src="images/s.gif" /> 
                        <div>รายงาน BI รายปี </div></a>  
                </dt> 
<!--                <dt id="work-reports-year-win-shortcut">
                    <a href="#"><img src="images/s.gif" /> 
                        <div>รายงาน BI ต่าง </div></a>  
                </dt> -->
                <dt id="work-readme-win-shortcut">
                    <a href="#"><img src="images/s.gif" /> 
                        <div>คู่มือใช้งาน <?PHP echo sprintf("%04d%02d", date('Y'), date('m'));?></div></a>  
                </dt> 
            </dl>
<!--             <dl id="x2-shortcuts" style="margin:15px; float:left;"> 
                <dt id="work-bi-win-shortcut">
                    <a href="#"><img src="images/s.gif" />
                        <div>Dashboard BI</div></a>
                </dt> 
                <dt id="work-process-month-win-shortcut">
                    <a href="#"><img src="images/s.gif" /> 
                        <div>ประมวลผลประจำเดือน <?php echo $date->l_month_thai[sprintf("%02d", date('m'))]." ".((date('Y')/1)+543);?></div></a>  
                </dt>
                <dt id="work-reports-month-win-shortcut">
                    <a href="#"><img src="images/s.gif" /> 
                        <div>รายงาน BI ต่าง </div></a>  
                </dt> 
            </dl>-->
        </div>
        <!-- DESKTOP -->
<!--             <div id="ux-taskbar">
                    <div id="ux-taskbar-start"></div>
            <div id="ux-taskbuttons-panel"></div>
            <div class="x-clear"></div>
                </div> -->

    </body>
    <script> 
        Ext.onReady(function () {
        
        }); 
    </script>
    <script type="text/javascript" src="js/dashboard.js?_dc=<?= __VPRODUCT_; ?>"></script>
</html>
