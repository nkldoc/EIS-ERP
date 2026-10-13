<?php
require_once('../conf/config.php') ;
require_once("conf/configDc.php") ;  
require_once(__DIR__ . '/../console/src/PhpConsole/__autoload.php') ;
$handler = PhpConsole\Handler::getInstance () ;
$handler -> start () ;
$handler -> getConnector () -> setSourcesBasePath ( $_SERVER[ 'DOCUMENT_ROOT' ] ) ; 
$handler -> debug ( 'Start Check ErrorTestClass' ) ; 
 
try {
   $id = $_GET["id"]??null;
   
//    throw new Exception('Some caught exception');
} catch(Exception $exception) {
    $handler->handleException($exception);
}
 ?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title><?php echo COMPANY_NAME ; ?></title>  
        <?php include("../lib/loadJs.php") ; ?> 
        <?php include("../lib/loadCss.php") ; ?>  
        <!-- System ERP :: Permission -->
        <script type="text/javascript" src="../lib/right/GrantPermission.php?_dc=<?php echo rand ( 0 , 100000 ) ; ?>&f=<?php echo $_SERVER[ "PHP_SELF" ] ; ?>"></script>
        <!-- System ERP :: -->
        <style type="text/css">
            .ui-space{
                padding:18px;
            }
            .txtBlue{
                color:blue;
            }
            .txtRed{
                color:red;
            }
            .lblShow{
                padding-left:5px;
                padding-right:5px;
            }
            .x-toolbar-cell{
                padding:0px 0px 0px 0px !important; 
            } 
        </style> 
        <script type="text/javascript">
          Ext.getHdrID = <?PHP echo $id;?> ;
        </script>
        
        <script type="text/javascript" src="reg/actionPo.js?_dc=<?php echo rand ( 0 , 100000 ) ; ?>"></script>
    </head>
    <body> 
    </body> 
</html>