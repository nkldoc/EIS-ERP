<?php
include("../../../conf/config.php") ;
include("../../conf/configDc.php") ;
include("../../../lib/database/DatabaseServer.php") ;
include("../../../lib/database/apiUtil.php") ;
include("../../../lib/date/i_date.class.php") ;

###################
$db     = new DatabaseServer() ;
$date   = new i_date() ;
$util   = new apiUtil() ;
############################################################################################################
$mode   = @$_REQUEST[ "mode" ] ;
$filter = @$_REQUEST[ "filter" ] ;
$value  = @$_REQUEST[ "value" ] ;
$i_read = @$_REQUEST[ "i_read" ] ;
###################
$root   = "data" ;
$data   = array () ;
###################
$limit  = @$_REQUEST[ "limit" ] ;
$dir    = @$_REQUEST[ "dir" ] ;
$sort   = @$_REQUEST[ "sort" ] ;
$start  = @$_REQUEST[ "start" ] ;
###################
if ( ! $util -> get ( $start ) ) {
    $start = 0 ;
}
if ( ! $util -> get ( $limit ) ) {
    $limit = 20 ;
}
else {
    $limit = ($limit + $start) ;
}
if ( ! $util -> get ( $dir ) ) {
    $dir = "ASC" ;
}
if ( ! $util -> get ( $sort ) ) {
    $sort = "c_code" ;
}

#################################
$arrParam      = array () ;
$arrCountParam = array () ;
$sqlTempTable  = "select dc_expense_group_id
                    , dc_expense_group_svn_id
                    , c_code, c_code_old, c_name
                    , row_number() over (order by $sort $dir) as row 
                from dbo.po_expense_group a
                where 1 = ?" ;

$arrParam[] = 1 ;
if ( $mode == "SEARCH" ) {
    if ( isset ( $filter ) && $filter != "" ) {
        $sqlTempTable .= " and " . $filter . " like ?" ;
        $arrParam[]   = "%{$value}%" ;
    }
}

$arrCountParam = $arrParam ;
$arrParam[]    = $start ;
$arrParam[]    = $limit ;

$sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?" ;
$stmt    = $db -> QueryParam ( $sqlMain , $arrParam ) ;
$i       = $start + 1 ;
while ( $row     = $db -> Fetch ( $stmt ) ) {
 
    $temp      = array ( "no"                      => ($i ++ ) ,
      "id"                      => intval(($row[ "dc_expense_group_id" ]===null)?$row[ "dc_expense_group_svn_id" ]:$row["dc_expense_group_id"]), 
      "dc_expense_group_id"     => $row[ "dc_expense_group_id"] ,
      "dc_expense_group_svn_id" => $row[ "dc_expense_group_svn_id" ] ,
      "c_name"                  => $row[ "c_name" ] ,
      "c_code"                  => $row[ "c_code" ] ,
      "c_code_old"              => $row[ "c_code_old" ] ,
    ) ;
    ${$root}[] = $temp ;
}
$sqlCount   = "select count(*) as totalCount from ({$sqlTempTable}) a" ;
$totalCount = $db -> GetDataBySQL ( $sqlCount , $arrCountParam ) ;
echo json_encode ( array ( "debug" => true , "totalCount" => $totalCount , $root => ${$root} ) ) ;

function get ( $a ) {
    return isset ( $a ) && ! empty ( $a ) ? $a : null ;
}
?>