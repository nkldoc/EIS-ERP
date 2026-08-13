<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
include("../../lib/mon/mon.class.php");
include("./class/class.PrintHtml.php");
 
###################
$db 	= new DatabaseServer(); 
$mon 	= new mon(); // convert floatval
$date 	= new i_date();
$util	= new apiUtil();
$db->BeginTran();
$stmChkMaster 	= true; // as so 
 
 
$f1			= $db->GetDataBySQL("select * from ar_bill_invoice_hdr where ar_bill_invoice_hdr_id=?", array($_REQUEST["id"])); 
$res1 		= $db->json_clean_decode($f1['json_print_dtl']); 
$Arr = (array)$res1;  
$print 		= new PrintHtml($db,$date,$mon); 

if(isset($_REQUEST['mode']) && $_REQUEST['mode']=='CHECKCLOSEBILLINGNOORDER'){
	$htmlPrint  = $print->HtmlNoOrder($_REQUEST["id"],$f1["c_code"], $Arr);
}else{
	$htmlPrint  = $print->Html($_REQUEST["id"],$f1["c_code"], $Arr);
}

 
$returnData = array(
			"c_code" 	=>$f1['c_code'], 
			"html" 		=> $htmlPrint 
		);  
		
if ($stmChkMaster)
{
	$db->CommitTran();
	$re = array("reval"=>0,"success"=>"Success","msg"=>"บันทึกเรียร้อย","data"=>$returnData);
}
else
{
	$db->RollBackTran();
	$re = array("reval"=>1,"success"=>"Error","msg"=>"Error");
}
echo json_encode($re); exit; 
?>