<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
include("../../lib/mon/mon.class.php"); 
include("./../conf/configAR.php");

$db = new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();
$mon 	= new mon();        // convert floatval
 
$mode		= $_REQUEST["mode"];
$table 		= "ar_bill_invoice_dtl";
$keyName 	= "ar_bill_invoice_dtl_id";
 
$data = $util->mnUser($_REQUEST);  
  

    if($mode=='ADD' || $mode=='EDIT')
    {  
        $db->BeginTran();
        $checkVal = 0;

		
        $fld = array("ar_bill_invoice_hdr_id" 
					,"ar_so_dtl_id"  
					,"f_total_cost"
					,"f_net_cost"
					,"dc_tax_id"
					,"f_tax_amt"
					,"f_unit_cost" 
					,"f_quan" 
					,"c_comment"
					,"i_enable" 					
					,"dc_user_create_id"
					,"dc_user_create_cost_id"
					,"d_create"
					,"dc_user_update_id"
					,"dc_user_update_cost_id"
					,"d_update");      
 
	foreach($data['soDtl'] as $so_dtl_id){

	//Intelize
	$f1         = $db->GetDataBySQL("select *
	,(select dc_product_group_id from dc_product where dc_product_id=ar_so_dtl.dc_product_id) as dc_product_group_id 
	from ar_so_dtl where ar_so_dtl_id=?",array($so_dtl_id));
	 
	$f2 = $db->GetDataBySQL("select a.dc_tax_id,a.f_tax_rate 
							from dc_tax a inner join dc_tax_def b on b.dc_tax_id=a.dc_tax_id 
							where b.dc_product_group_id=?",array($f1['dc_product_group_id']));  
 			
 
                //Syncro
                $data['ar_so_dtl_id']           = $so_dtl_id; 
                //setValue 
                $data['dc_tax_id']          	= $f2['dc_tax_id']; 
                $data['f_tax_amt']              = $mon->round54(($f1['f_total_cost']*$f2['f_tax_rate']/100),2);
                $data['f_net_cost'] 			= $f1['f_total_cost']-$data['f_tax_amt'];
				$data['f_unit_cost']			= $f1['f_unit_cost'];
				$data['f_quan']					= $f1['f_quan'];
				$data['f_total_cost']			= $f1['f_total_cost'];
				$data['c_comment']              = isset($data["comment{$so_dtl_id}"])?$data["comment{$so_dtl_id}"]:null;

       //info     
				$data['i_enable']				= 1;
                $data['dc_user_create_id']      = $_SESSION["user_id"];
                $data['dc_user_create_cost_id'] = $_SESSION["dc_cost_id"];
                $data['d_create']               = date("Y-m-d H:i:s");
				
                $data['dc_user_update_id']      = $_SESSION["user_id"];
                $data['dc_user_update_cost_id'] = $_SESSION["dc_cost_id"];
                $data['d_update']               = date("Y-m-d H:i:s");
                
            switch ($mode) {

                case "ADD" :  
                        $arrParam = array();		
                        $addField = "";
                        $addValue = "";

                        foreach($fld as $value)
                        {  
                                        $addField .= ", {$value}";
                                        $addValue .= ", ?";
                                        $arrParam[] = $data[$value]; 
                        } 

                        $sql = "INSERT INTO {$table} (".substr($addField, 1).") VALUES (".substr($addValue,1).")";  
                        $sql.="SELECT @@IDENTITY as id";

                        $stmChkMaster = $db->QueryParam($sql, $arrParam);

                        if($stmChkMaster === false){
                            $checkVal+=1;
                        }else{
							$db->QueryParam("update ar_so_dtl set i_billing=1 where ar_so_dtl_id=?", array($so_dtl_id));
							/* null=>"ยังไม่ออกเลข SO",
							1=>"ออกเลข SO",
							2=>"วางไปแล้วบางส่วน",
							3=>"วางบิลสมบูรณ์(เต็มใบ)",
							4=>"วางบิลสมบูรณ์(ยกเลิกบางส่วน)"
							$db->QueryParam("update ar_so_hdr set i_is_status=3 where ar_so_hdr_id=?", array($f1['ar_so_hdr_id']));
							*/
						}
                break;
                case "EDIT" :  break;
            } //End switch

	}//End LoOp

            if ($checkVal>0)
            {
                    $db->RollBackTran();
                    $re = array("reval"=>1,"success"=>"Error","msg"=>"Error"); 
            }
            else
            {
                    $db->CommitTran();
                    $re = array("reval"=>0,"success"=>"Success","msg"=>"บันทึกเรียร้อย");
            } echo json_encode($re); exit;  
    }else if($mode=='DELETE')
    {
            $db->BeginTran(); 

            $smtDel = $db->QueryParam("delete from ar_bill_invoice_dtl where ar_bill_invoice_dtl_id =?",array($_REQUEST['id']));

             if ($smtDel===true)
            {
                    $db->RollBackTran();
                    $re = array("reval"=>1,"success"=>"Error","msg"=>"Error"); 
            }
            else
            {
                    $db->CommitTran();
                    $re = array("reval"=>0,"success"=>"Success","msg"=>"บันทึกเรียร้อย");
            } echo json_encode($re); exit;  

    }          
?>
