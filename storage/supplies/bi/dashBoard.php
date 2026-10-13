<?php
include("../conf/config.php");
include("./../lib/date/i_date.class.php");
$date = new i_date(); //$date->$l_month_thai
// Permission Logic
// 1. Default Costs
// Permission Logic
// Moved to logic/permission_logic.php
include("logic/permission_logic.php");
?>
<html>

    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF8">
        <title>NMU Dash Baord & Desktop</title>
        <!-- Alarm -->

        <script src="../js/jquery.min.js"></script>
        <link rel="stylesheet" href="../php-notic/bootstrap/css/bootstrap.min.css" />
        <link rel="stylesheet" href="../php-notic/bootstrap/css/dashBoard.css" />
        <script src="../js/bootstrap.min.js"></script>

        <!-- ORG -->
        <link rel="stylesheet" type="text/css" href="../js/ext-3.4.0/resources/css/ext-all.css" />
        <link rel="stylesheet" type="text/css" href="css/desktop.css?v=<?= date("YmdHis"); ?>" />
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
                <dt id="work-readme-win-shortcut">
                    <a href="#"><img src="images/s.gif" />
                        <div>work flow <?PHP echo sprintf("%04d%02d", date('Y'), date('m')); ?></div>
                    </a>
                </dt>
                <dt id="work-reply-report-win-shortcut">
                    <a href="#"><img src="images/Dashboard3.png" width="48" height="48" />
                        <div>รายการซื้อจ้างสำหรับหน่วยงาน</div>
                    </a>
                </dt>
                <?php if ($can_view_bi):
                    ?>
                    <!-- <dt id="work-bi-win-shortcut">
                        <a href="#"><img src="images/s.gif" />
                            <div>Dashboard BI</div>
                        </a>
                    </dt> -->
                    <dt id="work-process-month-win-shortcut">
                        <a href="#"><img src="images/s.gif" />
                            <div>ประมวลผลประจำเดือน <?php echo $date->l_month_thai[sprintf("%02d", date('m'))] . " " . ((date('Y') / 1) + 543); ?></div>
                        </a>
                    </dt>
                    <dt id="work-reports-month-win-shortcut">
                        <a href="#"><img src="images/s.gif" />
                            <div>รายงาน BI รายเดือน </div>
                        </a>
                    </dt>

                    <dt id="work-reports-year-win-shortcut">
                        <a href="#"><img src="images/s.gif" />
                            <div>รายงาน BI รายปี </div>
                        </a>
                    </dt>
                    <dt id="work-reply-reportPie-win-shortcut">
                        <a href="#"><img src="images/reportPie.png" width="48" height="48" />
                            <div>รายการตามแผนงบประมาณประจำปี</div>
                        </a>
                    </dt>
                    <dt id="work-reply-reportEventBar-win-shortcut">
                        <a href="#"><img src="images/document.png" width="48" height="48" />
                            <div>รายงานสรุปผลการปฏิบัติงาน</div>
                        </a>
                    </dt>
                <?php endif; ?>
                <?php if ($permission):
                    ?>
                    <dt id="work-reply-permission-win-shortcut">
                        <a href="#"><img src="images/icons8-permission-100.png" width="48" height="48" />
                            <div>สิทธิ์การใช้งาน</div>
                        </a>
                    </dt>
                <?php endif; ?>
            </dl>
            <dl id="x2-shortcuts" style="margin:15px 15px 15px 25px; float:left;">
                <!--  <dt id="work-bi-win-shortcut">
                        <a href="#"><img src="images/s.gif" />
                            <div>Dashboard BI</div></a>
                    </dt>
                    <dt id="work-process-month-win-shortcut">
                        <a href="#"><img src="images/s.gif" />
                            <div>ประมวลผลประจำเดือน <?php echo $date->l_month_thai[sprintf("%02d", date('m'))] . " " . ((date('Y') / 1) + 543); ?></div></a>
                    </dt>    -->
                <dt style="display:none"
                    id="work-sign-digital-win-shortcut"
                    data-role="sign-pdf">
                    <a href="#">
                        <img src="images/signDestopk.png" />
                        <div>ตรวจสอบ/ลงนาม PDF</div>
                    </a>
                </dt>
            </dl>
        </div>
        <!-- DESKTOP -->
        <!-- -->
        <div id="ux-taskbar">
            <div id="ux-taskbar-start"></div>
            <div id="ux-taskbuttons-panel"></div>
            <div class="x-clear"></div>
        </div>

    </body>
    <script>
        Ext.onReady(function () {

            const roles_cost = [31];
            const roles_approve = [1, 60520, 77];
            const dcCostId = window.parent.Ext.session.dc_cost_id;
            const userId = window.parent.Ext.session.user_id;
            if (
                    roles_cost.includes(dcCostId) ||
                    roles_approve.includes(userId)
                    ) {
                document.getElementById('work-sign-digital-win-shortcut').style.display = 'block';
            }
        });
    </script>
    <script type="text/javascript" src="js/dashboard.js?_dc=<?= __VPRODUCT_; ?>"></script>

</html>