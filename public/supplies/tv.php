<?php
include("./conf/config.php");
$ss_username = $_SESSION["user_name"] ?? null;
$ss_user_id = $_SESSION["user_id"] ?? null;
$ss_emp_id = $_SESSION["sp_emp_id"] ?? null;
$ss_cost_id = $_SESSION["dc_cost_id"] ?? null;
//echo "formate <br>";
//$rest = array('type' => 'users',
//'status' => 'disconnect',
//"socket" => 0,
//"id" => $user_id ?? null,
//"name" => $user_name ?? null,
//"message" => $user_message ?? null,
//"msgText" => $msgText ?? null,
//"datetime" => date('Y-m-d H:i:s'),
//"totalCount" => $count);
//echo "<pre>".json_encode($rest,JSON_PRETTY_PRINT)."</pre>";
//exit();
?>
<html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1"> 
        <title>TV Procure</title>
        <!-- ORG -->
        <link rel="shortcut icon" href="./images/favicon.ico" type="image/x-icon">
        <link rel="stylesheet" type="text/css" href="css/icon_all.css?dc=<?= __VPRODUCT_ ?>" />
        <link rel="stylesheet" type="text/css" href="./js/ext-3.4.0/resources/css/ext-all-tv.css?_dc=<?= __VPRODUCT_; ?>" />
        <link rel="stylesheet" type="text/css" title="gray" href="./js/ext-3.4.0/resources/css/xtheme-gray-tv.css?_dc=<?= __VPRODUCT_; ?>" />
        <link rel="stylesheet" type="text/css" href="./sp/css/desktop.css" />
        <!-- GC -->
        <!-- LIBS -->
        <script type="text/javascript" src="./js/ext-3.4.0/adapter/ext/ext-base.js"></script>
        <!-- ENDLIBS -->
        <script type="text/javascript" src="./js/ext-3.4.0/ext-all-debug.js"></script>
        <!-- DESKTOP -->
        <style>

            .divTable
            {
                display:  table;
                width:auto;
                border-spacing:0px;
            }
            .divRow
            {
                display:table-row;
                width:auto;
            }

            .divCell
            {
                float:left;/*fix for  buggy browsers*/
                padding:1px;
                display:table-column;

            }
            * {
                box-sizing: border-box; /* not completely needed, yet useful */
            }

            html, body {
                margin: 0;
                padding: 0;
                height: 100%;
            }

            body {
                display: flex; /* or css grid for more intricate layouts */
                flex-direction: column;
            }

            #top {
                /*background: rgba(0,0,0,0);*/
                background:#30839e;
                height: 60px;
                color:#fff;
                border-bottom: 10px solid #CCC;
                padding:0px 0px 0px 20px;
                font-size:3em;
            }

            #pagewrap {
                background-color: #EEE;
                flex-grow: 1; /* make it stretch to the bottom even if little content */
                /*  overflow-x: scroll;  optional */
                /*  overflow-y: scroll;  optional */
            }
            .blink-text {
                text-decoration:blink
            }
            .child-row{
                /*background-color: #ffe2e2 !important;*/
                background-color: #f1f1f1 !important;
                color: #000;
            }
            .adult-row{
                /*background-color: #ffe2e2 !important;*/
                background-color: #fff !important;
                color: #000;
            }
            .group {
                display: none;
            }
            .group.active {
                display: block;
            }
            .container {
                text-align: center;
                padding: 20px;
                font-size: 24px;
                /*            background-color: #eef;*/
            }
        </style>
        <script type="text/javascript">

            var user = 'TV';
            var user_id = 'TV 0';
            var emp_id = 0;
            var cost_id = 0;
            var view = 1;
        </script>
    </head>
    <body scroll="no">
        <div id="x-desktop">
            <audio style="display: none;visibility: hidden;" id="player" autoplay controls><source src="./sound/notifications-sound.mp3" type="audio/mp3"></audio>
            <div id="top" style="">รายการแจ้งเตือนต่างๆ</div>

            <div id="pagewrap">
        <!--       <p> All the page content</p>
               <p> All the page content</p>
               <p> All the page content</p>-->
            </div>
            <!--  Main -->
            <div id="mainGroup" class="divTable group container" style="clear:both; width:100%">
                <!--<p>🟩 Main Group (แสดงชุดที่ 1)</p>-->
                <div class="divRow">
                    <div class="divCell" id="grid11ID"></div>
                    <div class="divCell">&nbsp;</div>
                    <div class="divCell" id="grid12ID"></div>
                </div>
                <div class="divRow">
                    <div class="divCell" id="grid13ID"></div>
                    <div class="divCell">&nbsp;</div>
                    <div class="divCell" id="grid14ID"></div>
                </div>
            </div>
            <!-- Sub -->
            <div class="divTable group container" id="subGroup" style="clear:both; width:100%">
                <!--<p>🟩 Sub Group (แสดงชุดที่ 2)</p>-->
                <div class="divRow">
                    <div class="divCell" id="grid15ID"></div>
                    <div class="divCell">&nbsp;</div>
                    <div class="divCell" id="grid16ID"></div>
                </div>
                <div class="divRow">
                    <div class="divCell" id="grid17ID"></div>
                    <div class="divCell">&nbsp;</div>
                    <div class="divCell" id="grid18ID"></div>
                </div>
            </div>

        </div>
    </body>
    <script type="text/javascript" src="js/tv.js?_dc=<?= __VPRODUCT_; ?>"></script>
</html>
