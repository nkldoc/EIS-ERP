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
    $sort = "a.po_status_hdr_id" ;
}

#################################
$arrParam      = array () ;
$arrCountParam = array () ;

$sqlTempTable    = "select a.po_working_hdr_id 
, a.c_status_last
, a.last_status_id
, (select top 1 c_name from po_status_hdr where po_status_hdr_id=a.last_status_id) as c_status
, a.c_detail
, a.c_code_ref 
, (select top 1 c_full_name from dc_user where dc_user_id=a.dc_user_create_id) as c_create_name
, (select top 1 c_name from dc_cost where dc_cost_id=a.dc_user_create_cost_id) as c_cost_creat_name
, convert(varchar, a.d_create, 120) as d_create 
, (select top 1 c_full_name from dc_user where dc_user_id=a.dc_user_create_id) as c_update_name
, (select top 1 c_name from dc_cost where dc_cost_id=a.dc_user_update_cost_id) as c_cost_update_name
, convert(varchar, a.d_update, 120) as d_update 
, convert(varchar, (select d_doc_date from dbo.po_working_item where po_working_hdr_id = a.po_working_hdr_id and po_status_hdr_id =a.last_status_id), 120) as d_doc_date
, row_number() over (order by a.last_status_id asc) as row 
from dbo.po_working_hdr a 
where 1 = ?" . $util -> viewAcc ( $i_read , "a" ) ;
$arrParam[]      = 1 ;
$arrCountParam[] = 1 ;


if ( $mode == "SEARCH" ) {
    if ( isset ( $filter ) && $filter != "" ) {
        $sqlTempTable    .= " and " . $filter . " like ?" ;
        $arrParam[]      = "%{$value}%" ;
        $arrCountParam[] = "%{$value}%" ;
    }
}

$arrParam[] = $start ;
$arrParam[] = $limit ;

$sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?" ;
$stmt    = $db -> QueryParam ( $sqlMain , $arrParam ) ;
$i       = $start + 1 ;
while ( $row     = $db -> Fetch ( $stmt ) ) {
    $temp      = array ( "no"                => ($i ++ ) ,
      "id"                => intval ( $row[ "row" ] ) ,
      "po_working_hdr_id" => intval ( $row[ "po_working_hdr_id" ] ) ,
      "po_status_hdr_id"  => intval ( $row[ "last_status_id" ] ) ,
//      "txtdc_cost_idID"        => $row[ "c_cost_name" ] ,
//      "dc_cost_id"             => intval ( $row[ "dc_cost_id" ] ) ,
//      "dc_emp_id"              => intval ( $row[ "dc_emp_id" ] ) ,
//      "txtdc_emp_idID"         => $row[ "c_emp_name" ] ,
      "c_po_code"         => $row[ "c_code_ref" ] ,
       "c_code"         => null,
      "c_name"            => $row[ "c_detail" ] ,
      "c_status"          => $row[ "c_status" ] ,
      "last_status_id"    => intval ( $row[ "last_status_id" ] ) , 
      "d_doc_date"              => $date -> extDateBuddha ($row[ "d_doc_date" ]) ,
      "dc_user_create_id"      => $row[ "c_create_name" ] ,
      "dc_user_create_cost_id" => $row[ "c_cost_creat_name" ] ,
      "d_create"               => $date -> extDateBuddha ( $row[ "d_create" ] ) ,
      "dc_user_update_id"      => $row[ "c_update_name" ] ,
      "dc_user_update_cost_id" => $row[ "c_cost_update_name" ] ,
      "d_update"               => $date -> extDateBuddha ( $row[ "d_update" ] )
        ) ;
    ${$root}[] = $temp ;
}
$sqlCount   = "select count(*) as totalCount from ({$sqlTempTable}) a" ;
$totalCount = $db -> GetDataBySQL ( $sqlCount , $arrCountParam ) ;
echo json_encode ( array ( "debug" => true , "totalCount" => $totalCount , $root => ${$root} ) ) ;

function get ( $a ) {
    return isset ( $a ) && ! empty ( $a ) ? $a : null ;
}
