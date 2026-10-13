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
        <meta http-equiv="Content-Type" content="text/html; charset=UTF8">
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

        </style>
        <script type="text/javascript">

                        var user = 'TV';
                        var user_id = 'TV 0';
                        var emp_id = 0;
                        var cost_id = 0;
                        var view = 1;
                        //0 => all ,1 => only , 2 => cost;
                        /* 
                        'type' => 'users',
                        'status' => $status,
                        "socket" => strval($socket_new),
                        "id" => $user_id ?? null,
                        "name" => $user_name ?? null,
                        "message" => $user_message ?? null,
                        "msgText" => $msgText ?? null,
                        "datetime" => date('Y-m-d H:i:s'),
                        "totalCount" => $count)));
                    */
//                          Ext.JsonMsg = '{"type":"users","typemsg":"tv","status":null,"socket":null,"id":null,"name":null,"message":null,"msgText":null,"datetime":"","totalCount":1}';
//                        Ext.JsonMsg = '{"sessId":"","user_id":' + user_id + ',"sp_emp_id":' + emp_id + ',"cost_id":' + cost_id + ',"view":' + view + ',"typemsg":"tv","msg":"","user_name":"' + user + '","datetime":"","useronline":1}';
//var msg = '{"sessId":"","user_id":' + user_id + ',"sp_emp_id":' + emp_id + ',"cost_id":' + cost_id + ',"view":' + view + ',"typemsg":"' + typemsg + '","msg":"' + message + '","user_name":"' + user + '","datetime":"","useronline":0}';
        </script>
    </head>
    <body scroll="no">
        <div id="x-desktop">
            <audio style="display: none;visibility: hidden;" id="player" autoplay controls><source src="./sound/notifications-sound.mp3" type="audio/mp3"></audio>
            <!--Alarm-->
            <!--            <dl style="margin:15px 50px 0px 0px; float:right;"> 
                            <div id="warrantyID" class="container-fluid">
                                <div class="navbar-header">
                                    <span class="navbar-brand" id="warranty_notif" style="font-size:14px; color:#EEE">หมดรับรับประกัน</span>
                                </div>
                                <ul class="nav navbar-nav navbar-right" style="border-radius:10px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
                                    <li class="dropdown">
                                        <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                                            <span class="label label-pill label-danger count" id="warranty_count" style="border-radius:10px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"></span>
                                            <span class="glyphicon glyphicon-bell" style="font-size:18px; color:#ccc"></span></a>
                                        <ul class="dropdown-menu" id="warranty_dropdown-menu" style="border-radius:10px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"></ul>
                                    </li>
                                </ul>
                            </div>
                        </dl>-->

            <!--            <dl id="x-shortcuts" style="margin:15px; float:left;">
                            <dt id="work-table-win-shortcut" >
                                <a href="#"><img src="sp/images/s.gif"/>
                                    <div style="font-size:12x; color:#EEE" id="show-btn">แสดงข้อมูล</div></a>
                            </dt> 
                        </dl>
                        <dl id="x-shortcuts" style="margin:15px; float:left;"> 
                            <dt id="grid-win-shortcut">
                                <a href="#"><img src="sp/images/s.gif" />
                                    <div>Grid Window</div></a>
                            </dt> 
                        </dl>-->




            <div id="top" style="">รายการแจ้งเตือนต่างๆ</div>
            <div id="pagewrap">
        <!--       <p> All the page content</p>
               <p> All the page content</p>
               <p> All the page content</p>-->
            </div>       
            <div class="divTable" style="clear:both; width:100%">
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
        </div> 
    </body>
    <script type="text/javascript">

        var blinks = document.getElementsByTagName('blink');
        var visibility = 'hidden';
        window.setInterval(function () {
            for (var i = blinks.length - 1; i >= 0; i--) {
                blinks[i].style.visibility = visibility;
            }
            visibility = (visibility === 'visible') ? 'hidden' : 'visible';
        }, 800);

    </script>
    <script type="text/javascript" src="js/tv_1.js?_dc=<?= __VPRODUCT_; ?>"></script>
</html>
