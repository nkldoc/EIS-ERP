<?php include("../conf/config.php") ;
?>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1">
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
        <script language="javascript" src="./js/index.js?_dc=<?=__VPRODUCT_ ; ?>"></script>
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
        .clickable-box {
            position: absolute;
            top: 0px;
            left: 0px;
            width: 300px;
            height: 70px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            text-decoration: none;
            font-weight: bold;
        }
        .x-grid3-row-selected{
            background-color: #ff0 !important;
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
<body scroll="no">  </body>
</html>