<?php

include("../../conf/config.php") ;
include("../../lib/database/DatabaseServer.php") ;

$db       = new DatabaseServer() ;
$sqlMain  = "SELECT chg from dbo.sp_chg where 1=?" ;
$arrParam = array ( 1 ) ;
$stmt     = $db -> QueryParam ( $sqlMain , $arrParam ) ;
if ( $stmt ) {
    $time = 0 ;
    while ( $row  = $db -> Fetch ( $stmt ) ) {

        $time ++ ;
        $chg = true ;
        $txt = sprintf ( " ID :%s CODE :%s สถานะ%s เกินจากเวลาทำการ %s วัน"
        , intVal ( $row[ "chg" ] )
        , $arrJson -> code
        , $arrJson -> name
        , intVal ( $time )
            ) ;
 
    }
  $stmt1 = $db -> QueryParam ( "truncate table dbo.sp_chg" , array ( 1 ) ) ;
}
else {

    $chg = false ;
    $txt = sprintf ( " ID :%s CODE :%s สถานะ%s เกินจากเวลาทำการ %s วัน"
        , intVal ( $arrJson -> id )
        , $arrJson -> code
        , $arrJson -> name
        , intVal ( $arrJson -> overonday )
        ) ;
}

echo json_encode ( array (
  'chg'  => $chg ,
  'type' => 'event' ,
  'name' => 'message' ,
  'data' => $txt
) ) ;
exit ;
