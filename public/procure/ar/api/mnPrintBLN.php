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
$table 		= "ar_pre_print_bill_hdr";
$keyName 	= "ar_pre_print_bill_hdr_id";
 
$data = $util->mnUser($_REQUEST);  

$arrPrint = array(-1=>"no_group",1=>"c_spot_name",2=>"show_sum_all");

    function addItem($data){
         global $db,$date,$fld1;
         $fld       = $fld1;       
         $arrParam  = array();		
         $addField  = "";
         $addValue  = "";

         foreach($fld as $value)
         {  
               if(!empty($data[$value])){         
                    $addField .= ", {$value}";
                    $addValue .= ", ?";
                    $arrParam[] = $data[$value]; 
               }
         }  
         $sql = "INSERT INTO ar_pre_print_bill_dtl (".substr($addField, 1).") VALUES (".substr($addValue,1).")"; 
         
         $stmt2 = $db->QueryParam($sql, $arrParam); 
         return $stmt2;
    } 
    function addItemsAll($id, $txt,$quan,$total,$i_is_detail=0,$f_quan_old=0){
            $datas["ar_pre_print_bill_hdr_id"]  = $id;                         
            $datas["c_invoice_item"]            = $txt;
            $datas["f_quan"]                    = $quan;
            $datas["f_total_cost"]              = $total;
            $datas["i_is_detail"]               = $i_is_detail;
            $datas["f_quan_old"]                = $f_quan_old;
            $datas["i_enable"]                  = 1;
        $stm = addItem($datas);  
        return $stm;
    }//End Func   
    
    function genBlCode($code_dc,$c_yyyy_mm,$dc_user_update_id,$dc_user_update_cost_id,$ret_id,$dc_area_id,$str){
        global $db,$date;  
        
        $str ="BLN";
        $sql = "select isnull(max(c_area_code),0) " 
                . "from ar_pre_print_bill_hdr "
                . "where "
                . "c_area_code !='0' 
                    and substring(c_area_code,1,3)='{$str}'
                    and dc_area_id ='{$dc_area_id}'
                    and left(right(c_area_code,8),4) = right('".$c_yyyy_mm."', 4)
                    and dbo.get_StrYYYY_MM(d_billing_date)=?";
                    
        echo $sql; echo "<hr/>";     
        $ff     = $db->GetDataBySQL($sql, array($c_yyyy_mm)); 
                
        $num     = substr($ff,12,4); 
//        echo " 1. {$num} <br/>"; 
        $num     = intval($num); 
//        echo " 2. {$num} <br/>"; 
        $num     +=1; 
//        echo " 3. {$num} <br/>";
        $c_code  = sprintf("%s%04d",$code_dc,$num); 
//        echo $c_code; 
//        echo "<hr/>";
               
      return array($c_code,$num);         
    }

    if($mode=='ADD' || $mode=='EDIT')
    {  
        $db->BeginTran();
        $checkVal = 0;
        $stmt2 = true; 
        $msg = "บันทึกเรียร้อย";
        $fld = array( "ar_bill_invoice_hdr_id"
                        ,"ar_pre_print_type"
                        ,"dc_area_id"
                        ,"c_ref_code"
                        ,"c_code"
                        ,"c_area_code"
                        ,"c_so_code"
                        ,"c_name"
                        ,"c_address"
                        ,"d_doc_date"
                        ,"d_so_date"
                        ,"d_billing_date"
                        ,"c_yyyy_mm"
                        ,"ref_yyyy_mm"
                        ,"c_contract_no" 
                        ,"i_no_order"
                        ,"i_enable"
                        ,"dc_user_create_id"
                        ,"dc_user_create_cost_id"
                        ,"d_create"
                        ,"dc_user_update_id"
                        ,"dc_user_update_cost_id"
                        ,"d_update");      

        $fld1 = array("ar_pre_print_bill_dtl_id"
                        ,"ar_pre_print_bill_hdr_id"
                        ,"c_invoice_item"
                        ,"f_quan"
                        ,"f_unit_cost"
                        ,"f_total_cost"
                        ,"f_disc_com"
                        ,"f_disc_cash"
                        ,"f_vat_amt"
                        ,"f_net_cost"
                        ,"f_total_amt"
                        ,"tax_percent"
                        ,"percent_disc_com"
                        ,"i_is_detail"
                        ,"f_quan_old"
                        ,"i_enable"); 						
                
 
		$data["ar_pre_print_type"] = $arrPrint[$data["printFormat"]];
		$data["i_enable"] = 1;
		$data["i_no_order"] = 0;
                $data['d_doc_date'] = $date->bc_to_ad($data['d_doc_date']);
                $data['d_so_date'] = $date->bc_to_ad($data['d_so_date']);
                $data['d_billing_date'] = $date->bc_to_ad($data['d_billing_date']);
                
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

                $sql = "INSERT INTO ar_pre_print_bill_hdr (".substr($addField, 1).") VALUES (".substr($addValue,1).")";   
                $sql.="SELECT @@IDENTITY as id";  
                $stmt2 = $db->QueryParam($sql, $arrParam);
                if ($stmt2)
		{
                    $next_result = $db->NextResult($stmt2);
                    if( $next_result ) {

                    $ff     = $db->Fetch($stmt2);
                    $ret_id = $ff["id"];
                                
                    $f1 = $db->GetDataBySQL("select dc_area_id 
                    ,right(c_yyyy_mm,4) as yymm
                    ,(select c_branch from dc_business_area where dc_area_id=ar_bill_invoice_hdr.dc_area_id) as c_branch
                    ,dc_product_type_id
                    ,* from ar_bill_invoice_hdr where ar_bill_invoice_hdr_id = ?",array($data['ar_bill_invoice_hdr_id']));   

                    $data["c_class"]       = $db->GetDataBySQL("select (select top 1 c_ref_doc from dc_product_class where dc_product_class_id=dc_product_type.dc_product_class_id) as c_ref_doc from dc_product_type where dc_product_type_id = ?",array($f1["dc_product_type_id"]));
                    $data["yymm"]          = $f1["yymm"];  
                    $Ym = substr($f1['c_yyyy_mm'],2);
                    
                   // $code_dc               = (string)("BL".$f1['c_branch'].$data["c_class"].$Ym);    
                    
                    $code_dc    = (string)("BLN".$f1['c_branch'].$Ym);
                    $arrCode    = genBlCode($code_dc,$f1['c_yyyy_mm'],$data['dc_user_update_id'],$data['dc_user_update_cost_id'],$ret_id,$f1["dc_area_id"],$data["c_class"]);  
                    
                
                        if ($ret_id>0 && $arrCode[0]!="")
                        {
                            $c_area_code = $arrCode[0]; 
                            
                            $sql3 = "UPDATE {$table}
                            SET c_area_code	= ?  	 
                            , dc_user_update_id =?
                            , dc_user_update_cost_id =?
                            , d_update =?
                            WHERE {$keyName} = ?"; 
                            $arrParam3 = array($c_area_code 
                                    , $_SESSION["user_id"]
                                    , $_SESSION["dc_cost_id"]
                                    , date("Y-m-d H:i:s")
                                    , $ret_id);

                            $stmt3= $db->QueryParam($sql3,$arrParam3);  
                            
                            $sql3 = "UPDATE ar_bill_invoice_hdr
                            SET c_area_print = ?  	 
                            , dc_user_update_id =?
                            , dc_user_update_cost_id =?
                            , d_update =?
                            WHERE ar_bill_invoice_hdr_id = ?"; 
                            $arrParam3 = array($c_area_code 
                                    , $_SESSION["user_id"]
                                    , $_SESSION["dc_cost_id"]
                                    , date("Y-m-d H:i:s")
                                    , $data['ar_bill_invoice_hdr_id']);

                            $stmt3  = $db->QueryParam($sql3,$arrParam3);
                            $id     = $ret_id;
                            if(@$_REQUEST['itemsSum'] !=''){ 
                                $dtl_id = 'Sum'; 
                                
                                $stmt2 = addItemsAll($id, $data["items{$dtl_id}"],$data["f_quan{$dtl_id}"],$data["f_total_cost{$dtl_id}"],1,$data["f_quan{$dtl_id}"]); 
                                         addItemsAll($id, $data["c_comment{$dtl_id}"],0,0,1);
                                }else{ 
                                    foreach($data['ar_bill_invoice_dtl_id'] as $dtl_id){   
                                       $stmt2 = addItemsAll($id, $data["items{$dtl_id}"],$data["f_quan{$dtl_id}"],$data["f_total_cost{$dtl_id}"],1,$data["f_quan{$dtl_id}"]); 
                                       addItemsAll($id, $data["c_comment{$dtl_id}"],0,0,1);
                                    } 
                                }
                            if(1)
                            { //total text 
                
                                
                                addItemsAll($id, "ราคาทั้งสิ้น",0,$data["f_total_cost"]); 
                                addItemsAll($id, "ส่วนลดการค้า",0,$data["f_disc_com_amt"]); 
                                addItemsAll($id, "จำนวนเงินก่อนภาษีมูลค่าเพิ่ม",0,$data["f_net_cost_amt"]); 
                                addItemsAll($id, "ภาษีมูลค่าเพิ่ม",0,$data["f_vat_amt"]); 
                                addItemsAll($id, "รวมเป็นเงินทั้งสิ้น",0,$data["f_net_amt"]); 
                                addItemsAll($id, $data["f_net_text"],0,0,4); 
                                addItemsAll($id, $data["c_invoice_item1"],0,0,2); 
                                addItemsAll($id, $data["c_invoice_item2"],0,0,3);  
                            } 
                            //dbo.SP_INSERT_MONTH_REPORT_BL
            #TODO ADD REPORT                           
            $sql2        = "EXEC SP_INSERT_MONTH_REPORT_BL ?;"; 
            $stmt2       = $db->QueryParam($sql2,array($data['ar_bill_invoice_hdr_id'])); 


                            $msg = $c_area_code;
                            $ReData = array("id"=>$id);
                        }  
                    } 
                } 
                break;
                case "EDIT" :  
                    $stmt2=true;
                    $stmt3=true; 
			 $sql2 = "UPDATE ar_pre_print_bill_hdr
                                SET ar_bill_invoice_hdr_id=?
                                ,ar_pre_print_type=?
                                ,dc_area_id=?
                                ,c_ref_code=?
                                ,c_code=?
                                ,c_so_code=?
                                ,c_name=?
                                ,c_address=?
                                ,d_doc_date=?
                                ,d_so_date=?
                                ,d_billing_date=?
                                ,c_yyyy_mm=?
                                ,ref_yyyy_mm=?
                                ,c_contract_no=?
                                ,c_area_code=?
                                ,i_no_order=?
                                ,i_enable=?
                                ,dc_user_update_id =?
                                ,dc_user_update_cost_id =?
                                ,d_update =?
                                WHERE ar_pre_print_bill_hdr_id = ?"; 
                                
                                $arrParam2= array($data['ar_bill_invoice_hdr_id']
                                            ,$data['ar_pre_print_type']
                                            ,$data['dc_area_id']
                                            ,$data['c_ref_code']
                                            ,$data['c_code']
                                            ,$data['c_so_code']
                                            ,$data['c_name']
                                            ,$data['c_address']
                                            ,$data['d_doc_date']
                                            ,$data['d_so_date']
                                            ,$data['d_billing_date']
                                            ,$data['c_yyyy_mm']
                                            ,$data['ref_yyyy_mm']
                                            ,$data['c_contract_no']
                                            ,$data['c_area_code']
                                            ,$data['i_no_order']
                                            ,$data['i_enable']
                                        , $_SESSION["user_id"]
                                        , $_SESSION["dc_cost_id"]
                                        , date("Y-m-d H:i:s")
                                        ,$data['id']);
                
                                $stmt2 = $db->QueryParam($sql2,$arrParam2);
                                $stmt3 = $db->QueryParam("delete from ar_pre_print_bill_dtl where ar_pre_print_bill_hdr_id =?",array($data['id'])); 
                                //Re-Print
                                $id     = $data['id'];
                                if(@$_REQUEST['itemsSum'] !=''){
                                 
                                $dtl_id = 'Sum';
                                $stmt2 = addItemsAll($id, $data["items{$dtl_id}"],$data["f_quan{$dtl_id}"],$data["f_total_cost{$dtl_id}"],1,$data["f_quan{$dtl_id}"]); 
                                         addItemsAll($id, $data["c_comment{$dtl_id}"],0,0,1);
                                }else{ 
                                    foreach($data['ar_bill_invoice_dtl_id'] as $dtl_id){  
                                       $stmt2 = addItemsAll($id, $data["items{$dtl_id}"],$data["f_quan{$dtl_id}"],$data["f_total_cost{$dtl_id}"],1,$data["f_quan{$dtl_id}"]); 
                                                addItemsAll($id, $data["c_comment{$dtl_id}"],0,0,1);
                                       
                                       }
                                }
                                if(1)
                                { //total text  
                                    addItemsAll($id, "ราคาทั้งสิ้น",0,$data["f_total_cost"]); 
                                    addItemsAll($id, "ส่วนลดการค้า",0,$data["f_disc_com_amt"]); 
                                    addItemsAll($id, "จำนวนเงินก่อนภาษีมูลค่าเพิ่ม",0,$data["f_net_cost_amt"]); 
                                    addItemsAll($id, "ภาษีมูลค่าเพิ่ม",0,$data["f_vat_amt"]); 
                                    addItemsAll($id, "รวมเป็นเงินทั้งสิ้น",0,$data["f_net_amt"]); 
                                    addItemsAll($id, $data["f_net_text"],0,0,4); 
                                    addItemsAll($id, $data["c_invoice_item1"],0,0,2); 
                                    addItemsAll($id, $data["c_invoice_item2"],0,0,3);  
                                } 
                                
                                $msg = " Re-Print ";	
                                $ReData = array("id"=>$id);
				break;
            } //End switch 

            if (!$stmt2) #TODO !
            {
                    $db->RollBackTran();
                    $re = array("reval"=>1,"success"=>"Error","msg"=>"Error"); 
            }
            else
            {
                    $db->CommitTran();
                    $re = array("reval"=>0,"success"=>"Success","msg"=>$msg,"data"=>@$ReData);
            } echo json_encode($re); exit;  
    }          
?>
