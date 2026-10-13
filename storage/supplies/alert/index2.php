<?php include("../conf/config.php");
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
        <script language="javascript" src="./js/RowExpander.js?_dc=<?= __VPRODUCT_; ?>"></script>
        <script language="javascript" src="./js/index2.js?_dc=<?= __VPRODUCT_; ?>"></script>
        <!-- Common Styles for the examplesaa -->
        <link rel="stylesheet" type="text/css" href="../css/icon_all.css?_dc=39059" />
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
            .contentwrap .col
            {
                padding: 15px;
                display: table-cell;
                width: 10%;
            }
            </style>
            <script language="javascript" type="text/javascript">
                Ext.ipServer = "<?php echo $_SERVER['SERVER_ADDR']; ?>";
            </script>
        </head>
        <body>
            <div class="contentwrap">
                <div class="box-row">
                    <div class="box">row 1</div>
                </div>
                <div class="box-row"><div class="box-column">
                        <!-- test-->
                        <div id="g4ID" class="col">column1</div>
                        <div id="g1ID" class="col">column2</div>
                    </div>
                    <div class="box-column">
                        <div id="g3ID" class="col">column1</div>
                        <div id="g2ID"  class="col">column2</div>
                    </div>
                </div>
            </div>
        </body>
</html>