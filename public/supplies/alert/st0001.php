<?php include("../conf/config.php") ;
if (!isset($_SESSION['user_id'])) {
    echo "<script>window.top.location.href =\"../access/signin.php\"</script>";
    exit;
}
?>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Ext.Direct</title>
<!-- GC -->
 	<!-- LIBS -->
        <link rel="stylesheet" type="text/css" href="../js/ext-3.4.0/resources/css/ext-all.css" />
        <link rel="stylesheet" type="text/css" href="css/desktop.css" />
        <!-- GC -->
        <!-- LIBS -->
        <script type="text/javascript" src="../js/ext-3.4.0/adapter/ext/ext-base.js"></script>
        <!-- ENDLIBS -->
        <script type="text/javascript" src="../js/ext-3.4.0/ext-all-debug.js"></script>
        <!-- ENDLIBS -->
        <script language="javascript" src="./js/st0001.js?_dc=<?= __VPRODUCT_; ?>"></script>
        <!-- Common Styles for the examplesaa -->

    <style type="text/css">
        #out {
            padding: 2px;
            overflow:auto;
            border-width:0;
        }
        #out b {
            color:#555;
        }
        #out xmp {
            margin: 2px;
        }
        #out p {
            margin:0;
        }
        .x-grid3-row-selected{
            background-color: #eee !important;
            font-size:20px !important;
            border-bottom-color: #999;
            border-bottom-style: solid;
            border-top-color: #999;
            border-top-style: solid;
        }
        .centered {
            position: fixed;
            top: 50%;
            left: 50%;
            margin-top: -50px;
            margin-left: -100px;
        }
    </style>
    <!-- System ERP :: -->
    <script type="text/javascript" src="../js/Date/calendarOverride.js?_dc=12927"></script>
    <script type="text/javascript" src="../js/config.js?_dc=12927"></script>
    <script type="text/javascript" src="../js/InfoMainGrid.js?_dc=12927"></script>
    <script type="text/javascript" src="../js/Ext.ux.util.js?_dc=12927"></script>
    <script type="text/javascript" src="../lib/right/GrantPermission.php?_dc=<?=__VPRODUCT_ ; ?>&f=<?php echo $_SERVER[ "PHP_SELF" ] ; ?>"></script>
    <!-- System ERP :: -->

</head>
<body scroll="no">
    <!--    <a href="#" target="_blank" style="margin:5 5px; float:right;">
            <img src="images/taskbar/monitor.png" alt=""/></a>-->
    <!--<div id="x-desktop">
       <a href="#" target="_blank" style="margin:50px; float:right;">
            <img src="images/powered.gif" /></a>
            <dl id="x-shortcuts">
                          <dt id="grid-win-shortcut">
                               <a href="#"><img src="images/s.gif" />
                    <div>Grid Window</div></a>
            </dt>
            <dt id="acc-win-shortcut">
                <a href="#"><img src="images/s.gif" />
                    <div>Accordion Window</div></a>
            </dt>
            <dt id="grid-win-shortcut">
                <a href="#"><img src="images/s.gif" />
                    <div>Grid Window2</div></a>
            </dt>
            <dt id="grid-win-shortcut-3">
                <a href="#"><img src="images/s.gif" />
                    <div>Grid Window3</div></a>
                           </dt>
           </dl>
    </div>
         <div id="ux-taskbar">
                <div id="ux-taskbar-start"></div>
        <div id="ux-taskbuttons-panel"></div>
        <div class="x-clear"></div>
        </div>-->
</body>
</html>