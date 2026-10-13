<?php
include("../../../conf/config.php") ;
include("../../conf/configDc.php") ;
include("../../../lib/database/DatabaseServer.php") ;
include("../../../lib/database/apiUtil.php") ;
include("../../../lib/date/i_date.class.php") ;

$db   = new DatabaseServer() ;
$date = new i_date() ;
$util = new apiUtil() ;

$table   = "dc_emp" ;
$keyName = "dc_emp_id" ;
$data    = $util -> mnUser ( $_REQUEST ) ;
$mode    = $data[ "mode" ] ;
$stmt    = true ;
$stmt2   = true ;
$stmt3   = true ;

$db -> BeginTran () ;

switch ( $mode ) {
    case "ADD" :
        $arrParam = array () ;
        //start Log
        $db -> logs ( "po-DcEmp"
            , "CLEAR"
            , "dc_emp_id"
            , $data[ 'id' ]
            , "DELETE dbo.po_permission_item where dc_emp_id=?"
            , array ( $data[ 'id' ] )
            , $_SESSION ) ;
        //End Log

        $stmt2 = $db -> QueryParam ( "DELETE dbo.po_permission_item where dc_emp_id=?" , array ( $data[ 'id' ] ) ) ;

        $chkarr = $data[ 'chk' ] ?? null ;
        if ( is_array ( $chkarr ) ) {
            $i        = 0 ;
            $arrParam = array () ;
            foreach ( $chkarr as $k => $v ) { // echo " {var_dump($k)} =>  {var_dump($v)} po_status_hdr_id = {$po_status_hdr_id}  ,dc_emp_id = {$dc_emp_id} ,i_seq = {$i_seq} \n\r" ;
                $i ++ ;
                $po_status_hdr_id = $k ?? null ;
                $dc_emp_id        = $data[ 'id' ] ?? null ;
                $i_seq            = $v[ $dc_emp_id ] ?? null ;


                $arrParam[] = $po_status_hdr_id ?? null ;
                $arrParam[] = $dc_emp_id ?? null ;
                $arrParam[] = $i_seq ?? null ;

                $arrParam[] = $data[ "dc_user_update_id" ] ?? null ;
                $arrParam[] = $data[ "dc_user_update_cost_id" ] ?? null ;
                $arrParam[] = $data[ "d_update" ] ?? null ;

                $arrParam[] = $data[ "dc_user_update_id" ] ?? null ;
                $arrParam[] = $data[ "dc_user_update_cost_id" ] ?? null ;
                $arrParam[] = $data[ "d_update" ] ?? null ;

                $sql = "insert into dbo.po_permission_item (po_status_hdr_id, dc_emp_id, i_seq
                                        , dc_user_create_id, dc_user_create_cost_id, d_create
                                        , dc_user_update_id, dc_user_update_cost_id, d_update ) values (?, ?, ?
                                        , ?, ?, ?
                                        , ?, ?, ? ); " ;

                //Add Log i
                $db -> logs ( "po-DcEmp"
                    , $mode
                    , "po_status_hdr_id"
                    , "[$po_status_hdr_id,$dc_emp_id,$i_seq]"
                    , $sql
                    , $arrParam
                    , $_SESSION ) ;
                $stmt3    = $db -> QueryParam ( $sql , $arrParam ) ;
                $arrParam = null ;
            }//Eend Loop
        }//End if

        break ;
}

if ( $stmt ) {
    $db -> CommitTran () ;
    $re = array ( "reval" => 0 , "success" => "Success" , "msg" => "บันทีกเรียบร้อยแล้ว" ) ;
}
else {
    $db -> RollBackTran () ;
    $re = array ( "reval" => 1 , "success" => "Error" , "msg" => "check statement : {$sql}" ) ;
}
echo json_encode ( $re ) ;
exit ;
