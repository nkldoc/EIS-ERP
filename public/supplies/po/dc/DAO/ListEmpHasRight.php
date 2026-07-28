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
$rt     = "data" ;
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
    $dir = "ASC " ;
}
if ( ! $util -> get ( $sort ) ) {
    $sort = " a.i_seq " ;
}

#################################
$arrParam      = array () ;
$arrCountParam = array () ;
 
$sqlTempTable     = "select a.c_name ,a.c_comment "
    . ",a.po_status_hdr_id "
    . ",isnull(a.i_seq,null) as i_seq "
    . ",isnull(b.dc_emp_id,null) as right_id "
    . ",(select top 1 c_full_name from dc_user where dc_user_id=b.dc_user_create_id) as c_create_name "
    . ",(select top 1 c_name from dc_cost where dc_cost_id=b.dc_user_create_cost_id) as c_cost_creat_name "
    . ",convert(varchar, a.d_create, 120) as d_create"
    . ",(select top 1 c_full_name from dc_user where dc_user_id=b.dc_user_update_id) as c_update_name "
    . ",(select top 1 c_name from dc_cost where dc_cost_id=b.dc_user_update_cost_id) as c_cost_update_name "
    . ",convert(varchar, a.d_update , 120) as d_update"
    . ",row_number() over (order by $sort $dir) as row "
    . "from po_status_hdr a "
    . "left join po_permission_item b on b.po_status_hdr_id=a.po_status_hdr_id and b.dc_emp_id= ? "
    . "where a.i_delete <> 1 and a.i_enable= ? "
    . $util -> viewAcc ( $i_read , 'b' ) ;
$arrParam[]       = $_POST[ 'dc_emp_id' ] ;
$arrCountParam [] = $_POST[ 'dc_emp_id' ] ;
$arrParam[]       = 1 ;
$arrCountParam [] = 1 ;



if ( $mode == "SEARCH" ) {
    if ( isset ( $filter ) && $filter != "" ) {
        $sqlTempTable    .= " and " . $filter . " like ?" ;
        $arrParam[]      = "%{$value}%" ;
        $arrCountParam[] = "%{$value}%" ;
    }
}
$arrParam[] = $start ;
$arrParam[] = $limit ;
$sqlMain    = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?" ;
$stmt       = $db -> QueryParam ( $sqlMain , $arrParam ) ;
$i          = $start + 1 ;
while ( $row        = $db -> Fetch ( $stmt ) ) {
    $temp      = array ( "no"                     => ($i ++ ) ,
      "id"                     => intval ( $row[ "row" ] ) ,
      "po_status_hdr_id"       => intval ( $row[ "po_status_hdr_id" ] ) ,
      "dc_emp_id"              => 0 ,
      "i_seq"                  => intval ( $row[ "i_seq" ] ) ,
      "right_id"               => intval ( $row[ "right_id" ] ) ,
      "c_name"                 => $row[ "c_name" ] ,
      "c_comment"              => $row[ "c_comment" ] ,
      "dc_user_create_id"      => $row[ "c_create_name" ] ,
      "dc_user_create_cost_id" => $row[ "c_cost_creat_name" ] ,
      "d_create"               => $date -> extDateBuddha ( $row[ "d_create" ] ) ,
      "dc_user_update_id"      => $row[ "c_update_name" ] ,
      "dc_user_update_cost_id" => $row[ "c_cost_update_name" ] ,
      "d_update"               => $date -> extDateBuddha ( $row[ "d_update" ] )
        ) ;
    ${$rt}[] = $temp ;
}
$sqlCount   = "select count(*) as totalCount from ({$sqlTempTable}) a" ;
$totalCount = $db -> GetDataBySQL ( $sqlCount , $arrCountParam ) ;
echo json_encode ( array ( "debug" => true , "totalCount" => $totalCount , $rt => ${$rt} ) ) ;

function get ( $a ) {
    return isset ( $a ) && ! empty ( $a ) ? $a : null ;
}
