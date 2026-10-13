<?php /***/
    include("../../../conf/config.php") ;
    include("../../conf/configDc.php") ;
    include("../../../lib/database/DatabaseServer.php") ;
    include("../../../lib/database/apiUtil.php") ;
    include("../../../lib/date/i_date.class.php") ;
    //print_r($_REQUEST);exit;
    /***/


$db = new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();

$mode    = $_REQUEST[ "mode" ] ;
$table   = "po_working_hdr" ;
$keyName = "po_working_hdr_id" ;

$data = $util->mnUser($_REQUEST);
$data["i_delete"] = DELETE_FALSE;
$c_code_gen       = "STA" ;

$stmt2 = true;
$stmt3 = true;

$db->BeginTran();

switch ($mode) {
    case "ADD" : 
        
    break;
    case "EDIT" :
        $arrParam = array();
        $arrParam[] = $data[ "id" ] ; // po_working_hdr_id
        $arrParam[] = $data[ "up_status_hdr_id" ] ; //po_status_hdr_id
        $arrParam[] = $data["dc_emp_id"];  //dc_emp_id พนักงานผู้รับผิดชอบ  
        $arrParam[] = $data["c_code"]??null; //- c_code item
        $arrParam[] = $data["c_name"]??null; //- c_code item
        $arrParam[] = $date->bc_to_ad($data['d_doc_date']); // item
        $arrParam[] = $data["c_po_code"]; //c_code hdr c_code_ref 
        $arrParam[] = $data["c_comment"]; //c_comment item 
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"]; 
        $arrParam[] = $data[ "up_status_hdr_id" ] ;
        $arrParam[] = $data[ "id" ] ;     
        $sql = " insert into dbo.po_working_item (po_working_hdr_id,po_status_hdr_id"
            . ", dc_emp_id,c_code,c_name,d_doc_date,c_code_ref,c_comment"
            . ", dc_user_create_id,dc_user_create_cost_id,d_create) values (? ,? ,? ,? , ?, ?, ? , ?, ?, ?, ?);"
            . " update dbo.po_working_hdr set last_status_id=? where po_working_hdr_id=?; " ;
        
//   print_r($arrParam); exit;     
        $stmt = $db->QueryParam($sql, $arrParam);
 /* @ log update */
        $db -> logs ( "po-upStatus"
            , $mode
            , $keyName
            , $data[ "id" ]
            , $sql
            , $arrParam
            , $_SESSION ) ;
        break;
    case "DELETE" :

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
