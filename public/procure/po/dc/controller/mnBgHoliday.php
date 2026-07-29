<?php
include("../../../conf/config.php") ;
include("../../conf/configDc.php") ;
include("../../../lib/database/DatabaseServer.php") ;
include("../../../lib/database/apiUtil.php") ;
include("../../../lib/date/i_date.class.php") ;

//print_r ( $_REQUEST ) ;
//exit ;
$db = new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();

$mode    = $_REQUEST[ "mode" ] ;
$table   = "po_bg_holiday" ;
$keyName = 'd_doc_date' ;
$data = $util->mnUser($_REQUEST);


$stmt2 = true;
$stmt3 = true;

$db->BeginTran();

switch ($mode) {
    case "ADD" : 
        $arrParam = array();

        $arrParam[] = $data[ "c_name" ] ;
        $arrParam[] = $date -> bc_to_ad ( $data[ "d_doc_date" ] ) ;
        $arrParam[] = $data[ "i_bg_year" ] ;
        $arrParam[] = $data[ "c_comment" ] ;
        $arrParam[] = $data["dc_user_create_id"];
        $arrParam[] = $data["dc_user_create_cost_id"];
        $arrParam[] = $data["d_create"];
        
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];

		
        $sql  = "insert into dbo.{$table} ( c_name,d_doc_date
                                        , i_bg_year,  c_comment
                                        , dc_user_create_id, dc_user_create_cost_id, d_create
                                        , dc_user_update_id, dc_user_update_cost_id, d_update
                                    )
                                values (?, ? 
                                        , ?, ?
                                        , ?, ?, ?
                                        , ?, ?, ?
                                       ); " ;
 
        $stmt = $db->QueryParam($sql, $arrParam);

        $db -> logs ( "po-dcHoliday"
            , $mode
            , $keyName
            , null
            , $sql
            , $arrParam
            , $_SESSION ) ;
 
    break;
    case "EDIT" :
        $arrParam = array();
        $arrParam[] = $data[ "c_name" ] ;
        $arrParam[] = $date -> bc_to_ad ( $data[ "d_doc_date" ] ) ;
        $arrParam[] = $data[ "i_bg_year" ] ;
        $arrParam[] = $data[ "c_comment" ] ;

        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"]; 
        
        $sql        = "UPDATE {$table} SET  c_name = ? , d_doc_date = ? , i_bg_year = ? , c_comment = ? , dc_user_update_id = ?, dc_user_update_cost_id = ? , d_update = ? WHERE {$keyName} = ?" ;
        $arrParam[] = $data[ "id" ] ;
        $stmt = $db->QueryParam($sql, $arrParam);
 /* @ log update */
        $db -> logs ( "po-dcHoliday"
            , $mode
            , $keyName
            , $data[ "id" ]
            , $sql
            , $arrParam
            , $_SESSION ) ;
        break;
    case "DELETE" :
            $sql        = "DELETE FROM dbo.{$table} WHERE d_doc_date = convert(datetime,?,102) " ;
        $arrParam   = array ( $date -> bc_to_ad ( $data[ "d_doc_date" ] ) ) ;
        $stmt = $db->QueryParam($sql, $arrParam);
		###
 /* @ log del */
        $db -> logs ( "po-dcHoliday"
            , $mode
            , $keyName
            , $data[ "id" ]
            , $sql
            , $arrParam
            , $_SESSION ) ;
        break;
}
 
if ($stmt)
{
	$db->CommitTran();
	$re = array("reval"=>0,"success"=>"Success","msg"=>"บันทีกเรียบร้อยแล้ว");
}
else
{
	$db->RollBackTran();
	$re = array("reval"=>1,"success"=>"Error","msg"=>"check statement : {$sql}");
}
 
echo json_encode($re);
exit; 
?>