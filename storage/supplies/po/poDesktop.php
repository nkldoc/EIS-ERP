<?php
require_once('../conf/config.php') ;
require_once("conf/configDc.php") ;
require_once(__DIR__ . '/../console/src/PhpConsole/__autoload.php') ;
$handler = PhpConsole\Handler::getInstance () ;
$handler -> start () ;
$handler -> getConnector () -> setSourcesBasePath ( $_SERVER[ 'DOCUMENT_ROOT' ] ) ;
$handler -> debug ( 'Start Check ErrorTestClass' . $_SERVER[ 'DOCUMENT_ROOT' ] ) ;

try {
//    throw new Exception('Some caught exception');
} catch ( \Exception $exception ) {
    $handler -> handleException ( $exception ) ;
}
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title><?php echo " ระบบสนับสนุนการบริหารงานเบิกจ่ายเงิน " ; ?></title> 
        <link rel="stylesheet" type="text/css" href="../ext-3.4.0/resources/css/ext-all.css" />
        <link rel="stylesheet" type="text/css" href="css/desktop.css" /> 

        <!-- GC -->
        <!-- LIBS -->
        <script type="text/javascript" src="../ext-3.4.0/adapter/ext/ext-base.js"></script>
        <!-- ENDLIBS -->

        <script type="text/javascript" src="../ext-3.4.0/ext-all-debug.js"></script>

        <!-- DESKTOP -->
        <script type="text/javascript" src="js/StartMenu.js"></script>
        <script type="text/javascript" src="js/TaskBar.js"></script>
        <script type="text/javascript" src="js/Desktop.js"></script>
        <script type="text/javascript" src="js/App.js"></script>
        <script type="text/javascript" src="js/Module.js"></script>
        <script type="text/javascript" src="js/sample.js"></script>
<!--        <script type="text/javascript" src="reg/actionPo.js?_dc=<?php echo rand ( 0 , 100000 ) ; ?>"></script>-->
        <script type="text/javascript" src="../lib/right/GrantPermission.php?_dc=<?php echo rand ( 0 , 100000 ) ; ?>&f=<?php echo $_SERVER[ "PHP_SELF" ] ; ?>"></script>
        <!-- System ERP :: -->
        <!--      <script type="text/javascript" src="reg/appPoItems.js?_dc=<?php echo rand ( 0 , 100000 ) ; ?>"></script>-->
        <style type="text/css">

            body #x-shortcuts .col-desktop {   
                color:#fff;
            }  
            .col-desktop  {
                
            }  

            body .sub-views{  
                padding-left:800px;
            } 
            div.col-11 .col-sm-4 .alert .alert-primary .alert-with-icon{

            }

            .scroll{
                display:block;
                border: 1px solid red;
                padding:5px;
                margin-top:5px;
                width:300px; 
                max-height:100px;
                overflow:scroll;
            }
            .auto{
                display:block;
                border: 1px solid red;
                padding:5px;
                margin-top:5px;
                width:300px;
                height: 100px !important;
                max-height:110px;
                overflow:hidden;
                overflow-y:auto;
            }
            #x-shortcuts dt {
                float: left;
                margin: 3px 0 0 15px;
                clear: left;
                width:120px;
                font: normal 10px tahoma,arial,verdana,sans-serif;
                text-align: center;
                zoom: 1;
                display: block;
            }
            #x-shortcuts dt div {
                width: 100%;
                color: white;
                overflow: hidden;
                text-overflow: ellipsis;
                cursor: pointer;
            }
            #hdr-grid-win-shortcut img {
                width: 48px; 
                height: 48px;
                background-image: url(images/grid48x48.png);
                filter: progid:DXImageTransform.Microsoft.AlphaImageLoader(src='images/grid48x48.png', sizingMethod='scale');
            }
            #item-grid-win-shortcut img {
                width: 48px; 
                height: 48px;
                background-image: url(images/grid48x48.png);
                filter: progid:DXImageTransform.Microsoft.AlphaImageLoader(src='images/grid48x48.png', sizingMethod='scale');
            }
        
            #right-win-shortcut img {
                width: 48px; 
                height: 48px;
                background-image: url(images/im48x48.png);
                filter: progid:DXImageTransform.Microsoft.AlphaImageLoader(src='images/im48x48.png', sizingMethod='scale');
            }
        </style>
    </head>
    <body scroll="no"> 
        <div id="x-desktop" class="col-desktop"> 
            <div style="text-alng:center;margin:5px; float:right; color:#eee;"><h3> ระบบสนับสนุนการบริหารงานเบิกจ่ายเงิน </h3> 
            <a href="#" target="_blank"><img src="images/powered.gif" /> 
            </a></div>
            <dl id="x-shortcuts"> 
                <dt id="hdr-grid-win-shortcut">
                    <a href="#"><img src="images/s.gif" />
                        <div>ข้อมูลรายการจัดทำใบขอเบิก</div></a>
                </dt>
                <dt id="item-grid-win-shortcut">
                    <a href="#"><img src="images/s.gif" />
                        <div>ข้อมูลสถานะใบขอเบิก</div></a>
                </dt> 
                <dt id="right-win-shortcut">
                    <a href="#">
                        <img src="images/s.gif" />
                        <div>ข้อมูลสิทธิ์พนักงานที่รับผิดชอบ</div>
                    </a>
                </dt> 
                
                <div class="col-desktop">
                    <div class="scroll">
                        I am going to keep lot of content here just to show
                        you how scrollbars works if there is an overflow in
                        an element box. This provides your horizontal as well
                        as vertical scrollbars.<br/>
                        I am going to keep lot of content here just to show
                        you how scrollbars works if there is an overflow in
                        an element box. This provides your horizontal as well
                        as vertical scrollbars.<br/>
                        I am going to keep lot of content here just to show
                        you how scrollbars works if there is an overflow in
                        an element box. This provides your horizontal as well
                        as vertical scrollbars.<br/>
                        I am going to keep lot of content here just to show
                        you how scrollbars works if there is an overflow in
                        an element box. This provides your horizontal as well
                        as vertical scrollbars.<br/>        
                    </div>
 
                    <p> </p> 
                    <div class="auto">
                        I am going to keep lot of content here just to show
                        you how scrollbars works if there is an overflow in
                        an element box. This provides your horizontal as well
                        as vertical scrollbars   I am going to keep lot of content here just to show
                        you how scrollbars works if there is an overflow in
                        an element box. This provides your horizontal as well
                        as vertical scrollbars 
                        I am going to keep lot of content here just to show
                        you how scrollbars works if there is an overflow in
                        an element box. This provides your horizontal as well
                        as vertical scrollbars 
                    </div>
                </div>   

            </dl>    
            
        </div>    
        <div id="ux-taskbar">
            <div id="ux-taskbar-start"></div>
            <div id="ux-taskbuttons-panel"></div>
            <div class="x-clear"></div>
        </div> 
    </body>
</html>
