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
    $sort = "po_working_hdr_id,a.po_status_hdr_id asc " ;
}

#################################
$arrParam      = array () ;
$arrCountParam = array () ;
$sqlTempTable  = "select a.po_working_hdr_id
                    , a.po_status_hdr_id 
                    , a.c_code 
                    , a.c_name 
                    , a.c_code_ref 
                    , a.c_comment  
                    , a.d_doc_date, a.dc_emp_id
                    , a.d_create
                    , a.dc_user_create_cost_id
                    , a.dc_user_create_id 
                    , row_number() over (order by po_status_hdr_id asc) as row 
                from dbo.po_working_item a 
                where a.po_working_hdr_id=?" ;

$arrParam[]      = $_POST[ 'hdrID' ] ;
$arrCountParam[] = $_POST[ 'hdrID' ] ;
if ( $mode == "SEARCH" ) {
    if ( isset ( $filter ) && $filter != "" ) {
        $sqlTempTable    .= " and " . $filter . " like ?" ;
        $arrParam[]      = "%{$value}%" ;
        $arrCountParam[] = "%{$value}%" ;
    }
}


$arrParam[] = $start ; 

$arrParam[] = $limit ;

$sqlMain = "select a.*  "
    . " , convert(varchar, a.d_doc_date, 120) as d_doc_date  
        ,(select top 1 c_name from dc_emp where dc_emp_id=a.dc_emp_id) as c_emp_name
        ,(select top 1 c_name from po_status_hdr where po_status_hdr_id=a.po_status_hdr_id) as c_status
        , convert(varchar, a.d_create, 120) as d_create 
        ,(select top 1 c_full_name from dc_user where dc_user_id=a.dc_user_create_id) as c_create_name
        ,(select top 1 c_name from dc_cost where dc_cost_id=a.dc_user_create_cost_id) as c_cost_creat_name
        
     from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?" ;
//     echo $sqlMain; exit;
$stmt    = $db -> QueryParam ( $sqlMain , $arrParam ) ;
$i       = $start + 1 ;
while ( $row = $db -> Fetch ( $stmt ) ) {
    $temp = array ( "no" => ($i ++ ) ,
      "id"                => intval ( $row[ "row" ] ) ,
      "po_working_hdr_id" => intval ( $row[ "po_working_hdr_id" ] ) ,
      "po_status_hdr_id"  => intval ( $row[ "po_status_hdr_id" ] ) , 
 
      "dc_emp_id"         => intval ( $row[ "dc_emp_id" ] ) ,
      "txtdc_emp_idID"    => $row[ "c_emp_name" ] ,
      "c_code"            => $row[ "c_code" ] , 
      "c_status"          => $row[ "c_status" ] ,
      "c_name"            => $row[ "c_name" ] ,
      "c_code_ref"            => $row[ "c_code_ref" ] , 
      "d_doc_date"        => $date -> extDateBuddha ( $row[ "d_doc_date" ] ) ,
      "c_comment"         => $row[ "c_comment" ] ,
      "dc_user_create_id"      => $row[ "c_create_name" ] ,
      "dc_user_create_cost_id" => $row[ "c_cost_creat_name" ] ,
      "d_create"               => $date -> extDateBuddha ( $row[ "d_create" ] ) //,
 
        ) ;
    ${$root}[] = $temp ;
}
$sqlCount   = "select count(*) as totalCount from ({$sqlTempTable}) a" ;
$totalCount = $db -> GetDataBySQL ( $sqlCount , $arrCountParam ) ;
echo json_encode ( array ( "debug" => true , "totalCount" => $totalCount , $root => ${$root} ) ) ;

function get ( $a ) {
    return isset ( $a ) && ! empty ( $a ) ? $a : null ;
}
