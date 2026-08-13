<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
include("../../lib/mon/mon.class.php"); 
$db = new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();
$mon 	= new mon(); // convert floatval
 
$mode		= $_REQUEST["mode"];
$table 		= "imp_receive_hdr";
$tableDtl 	= "imp_receive_dtl";
$keyName 	= "imp_receive_hdr_id";
$msg = 'เรียบร้อยแล้ว'; 
$data = $util->mnUser($_REQUEST); 
$c_code_mu = "IMPR"; 

$fld = array("c_code"
			,"c_gx_code"
            /*,"c_receive_period_no" 
            ,"c_point_receive_name"   */
			,"dc_period_id"
			,"dc_receive_point_id"
			,"c_receive_name"
            ,"d_doc_date"   
            ,"c_comment" 
            ,"i_enable"  
			,"i_post"
            ,"dc_user_create_id"
            ,"dc_user_create_cost_id"
            ,"d_create"
            ,"dc_user_update_id"
            ,"dc_user_update_cost_id"
            ,"d_update");
     
//Inteliz
if($mode=='ADD' || $mode=='EDIT')
{ 
        $data['d_doc_date'] 	= $date->bc_to_ad($data['d_doc_date']); 
        $data['i_enable']    	= STATUS_ENABLE; 
}	
 function enabledDelete($c_gx_code){
	global $db;
	$ret = $db->GetDataBySQL("select i_enable from gl_tran_hdr where c_code=?", array($c_gx_code)); 
	 
	
	if ($ret==2) return true; 
	else return false; 
}
$db->BeginTran();
$stmChkMaster 	= true; // as so 
$stmChkDelDtl 	= true; // as dtl

switch ($mode) {
    case "ADD" :  
		$arrParam = array();		
		$addField = "";
		$addValue = ""; 
		foreach($fld as $value)
		{  
			if(!empty($data[$value]))
			{ 
				$addField .= ", {$value}";
				$addValue .= ", ?";
				$arrParam[] = $data[$value];
			} 
		}  
		$sql = "INSERT INTO {$table} (".substr($addField, 1).") VALUES (".substr($addValue,1).")";  
		$sql.="SELECT @@IDENTITY as id"; 
		$stmChkMaster = $db->QueryParam($sql, $arrParam); 
		if ($stmChkMaster)
		{
			$next_result = $db->NextResult($stmChkMaster);
			if( $next_result ) {
							$ret= $db->Fetch($stmChkMaster);
							$ret_id = $ret["id"]; 
							$returnData     = array("id"=>$ret_id);  
							$log = "Add arSoHdr";
							
                        }
                } 
	break;
        case "EDIT" : 
		$arrParam = array();
		$upField = "";
		foreach($fld as $value)
		{
			if (!empty($data[$value]))
			{ 
				$upField .= ", {$value} = ?";
				$arrParam[] = $data[$value];                 
            } 
		}
		$sql = "UPDATE {$table} SET ".substr($upField, 1)." WHERE {$keyName} = ?"; 
		$arrParam[] = $data["id"];
		$stmChkMaster = $db->QueryParam($sql, $arrParam);
		$returnData     = array("id"=>$data["id"]);  
		$log = "Update arSoHdr";
	break;
//	case "DELETE"
	case "DELETE" : 

		if($_REQUEST['i_enable']==1 && $_REQUEST["c_gx_code"]=='0'){
			$sql = "Declare @idx as bigint;
						set @idx = ?; 
						DELETE FROM imp_receive_hdr where imp_receive_hdr_id =@idx;
						DELETE FROM imp_receive_dtl where imp_receive_hdr_id =@idx;
						"; 
					
				$arrParam = array($data["id"]); 
				$stmChkMaster = $db->QueryParam($sql, $arrParam);
				$returnData = array('status'=>'delete','enabledDelete'=>false);
		}else{
		  	if(enabledDelete($_REQUEST["c_gx_code"])){
			
				$sql = "Declare @idx as bigint;
						set @idx = ?; 
						UPDATE imp_receive_hdr  SET i_enable=2 where imp_receive_hdr_id =@idx;
						"; 
					
				$arrParam = array($data["id"]); 
				$stmChkMaster = $db->QueryParam($sql, $arrParam);
				$returnData = array('status'=>'remove','enabledDelete'=>true);
			}else{
				 
			$msg = 'ไม่สามารถยกเลิกรายการได้ เนื่องจากยกต้องไปเลิก GX เลขที่ '.$_REQUEST["c_gx_code"].'  ที่เมนูของสมุดรายวันก่อน'; 
			$returnData = array('status'=>'notice','enabledDelete'=>false);
			
			} 
		}
		
	break;
    case "GENCODE":
        $data = $util->mnUser($_REQUEST);
		if ($data["ImpStep"] == "EDIT"){
			$data['d_doc_date'] 	= $date->bc_to_ad(@$data['d_doc_date']); 
		}
			
		list($yyyy, $mm, $dd) = explode("-",@$data["d_doc_date"]);
		$c_yyyy_mm = $yyyy.$mm;
        $arrParamGencode	= array($c_code_mu,$c_yyyy_mm,$data["dc_user_update_id"],$data["dc_user_update_cost_id"],$data["id"]);
        $sqlGenCode			= "EXEC SP_GEN_CODE ?,?,?,?,?;";
        $stmtGenCode 		= $db->QueryParam($sqlGenCode,$arrParamGencode);

        $arr_gen_code 	= $db->Fetch($stmtGenCode);
        $c_code 		= $arr_gen_code["c_code_gen"] ;
        $ref_id   		= $arr_gen_code["reference_id"] ;

        if ($data["id"]==$ref_id )
        {
            $sql = "UPDATE {$table}
            SET c_code = ?
            WHERE {$keyName} = ?;";

            $stmt = $db->QueryParam($sql, array($c_code, $data["id"]));
        }
        $data["c_code"] = $c_code;
		
		// บันทึกบัญชี
		$gl_hdr_id = 0;
		$arrParam = array();
		$arrParam[] = $data["id"]; 
		$arrParam[] = $data["d_doc_date"];
		$arrParam[] = $mm;
		$arrParam[] = ($yyyy-543);
		$arrParam[] = $data["dc_user_update_id"];
		$arrParam[] = $data["dc_user_update_cost_id"];

		$sql = "declare @imp_receive_hdr_id as bigint;
				declare @d_save_date as varchar(10);
				declare @strM as varchar(50);
				declare @strY as varchar(4);
				declare @create_id as bigint;
				declare @create_cost_id as bigint;

				set @imp_receive_hdr_id =?;
				set @d_save_date = ?;
				set @strM = ?;
				set @strY = ?;

				set @create_id = ?;
				set @create_cost_id = ?;

				/*insert gl_tran_hdr*/
				insert into gl_tran_hdr (c_ref_doc, gl_dc_book_type_id, d_doc_date
											, d_save_date, f_total_amt, table_pk_id
											, table_name, table_detail, c_mm, c_yyyy, c_yyyy_mm
											, c_comment1, i_enable, i_type, i_is_post, i_is_close_year
											, i_is_reversing, i_close_year_type, i_preview
											, i_chk_gl_dtl, i_chk_gl_purchase, c_code, c_code_post
											, dc_user_create_id, dc_user_create_cost_id, d_create
											, dc_user_update_id, dc_user_update_cost_id, d_update
											, i_cancel_doc_expense)
				select a.c_code as c_ref_doc
						, (select aa.gl_dc_book_type_id from gl_dc_book_doc aa 
								inner join dc_doc bb on aa.dc_doc_id = bb.dc_doc_id
							where bb.c_code = left(a.c_code, 4)) as gl_dc_book_type_id
						, convert(datetime, @d_save_date, 102) as d_doc_date
						, convert(datetime, @d_save_date, 102) as d_save_date
						, isnull((select sum(rcptamt) from imp_receive_dtl where imp_receive_hdr_id = a.imp_receive_hdr_id and canceldate is null), 0) as f_total_amt
						, a.imp_receive_hdr_id as table_pk_id
						, 'imp_receive_hdr' as table_name
						, 'นำเข้าข้อมูลรายได้' as table_detail
						, right(left(@d_save_date,7),2) as c_mm
						, left(@d_save_date,4) as c_yyyy
						, left(@d_save_date,4)+right(left(@d_save_date,7),2) as c_yyyy_mm
						, 'นำเข้าข้อมูลรายได้ '+ a.c_point_receive_name + ' รอบที่ ' + a.c_receive_period_no +' เดือน '++@strM+' ' +@strY as c_comment1
						, 1 as i_enable
						, 2 as i_type
						, 2 as i_is_post
						, 2 as i_is_close_year
						, 2 as i_is_reversing
						, 9 as i_close_year_type
						, 1 as i_preview
						, 1 as i_chk_gl_dtl
						, 1 as i_chk_gl_purchase
						, '0' as c_code
						, '0' as c_code_post
						, @create_id
						, @create_cost_id
						, getdate()
						, @create_id
						, @create_cost_id
						, getdate()
						, 4
				from imp_receive_hdr a
				where a.imp_receive_hdr_id = @imp_receive_hdr_id;";
		$sql.="SELECT @@IDENTITY as hdr_id";
		
		//echo $sql;
 
		$stmt = $db->QueryParam($sql, $arrParam);
		if ($stmt)
		{
			$next_result = $db->NextResult($stmt);
			if( $next_result ) {
				$dd_hdr = $db->Fetch($stmt);
				$gl_hdr_id = $dd_hdr["hdr_id"] ;
			}
		}
		
		if ($gl_hdr_id > 0)
		{
			$df_dc_cost_id = 77;
			$sql = "declare @imp_receive_hdr_id as bigint;
					declare @hdr_id as bigint;
					set @imp_receive_hdr_id = ?;
					set @hdr_id = ?;

					insert into gl_tran_dtl (i_rank, gl_tran_hdr_id, dc_cost_acc_id
											, dc_acc_id, f_dr, f_cr
											, i_type_person, dc_emp_id, dc_debtor_id,dc_creditor_id
											, i_is_nontax_exp,dc_product_id,pk_id1,pk_id2 
											, i_return)
					select ROW_NUMBER() OVER (ORDER BY a.dc_cost_acc_id, f_dr desc) as i_rank 
						, @hdr_id as gl_tran_hdr_id
						, dc_cost_acc_id
						, dc_acc_id
						, f_dr
						, f_cr 
						, 0 as i_type_person
						, 0 as dc_emp_id
						, 0 as dc_debtor_id
						, 0 as dc_creditor_id
						, 2 as i_is_nontax_exp
						, 0 as dc_product_id 
						, 0 as pk_id1
						, 0 as pk_id2
						, 3
					from (select dc_cost_acc_id, dc_acc_id, sum(f_dr) as f_dr, sum(f_cr) as f_cr
							from (
							select {$df_dc_cost_id} as dc_cost_acc_id
								, case b.paidby 
										when '10' then 9 /*เงินสด -> เงินสดในมือ*/
										when '20' then 188 /*บัตรเครดิต -> ลูกหนี้บัตรเครดิต*/
										when '30' then 18 /*เช็ค -> */
										when '40' then (select bb.dc_acc_id from dc_product aa 
															inner join dc_bank_acc_company bb on aa.dc_bank_acc_company_id = bb.dc_bank_acc_company_id
														where aa.c_map_code = b.income) /*เงินโอน -> */
										when '60' then 1035 /*QR Code -> */
										when '70' then 1035 /*QR Code -> */
									end as dc_acc_id
								, case b.paidby 
										when '10' then b.rcptamt
										when '20' then b.rcptamt
										when '30' then b.rcptamt
										when '40' then b.rcptamt
										when '60' then b.rcptamt
										when '70' then b.rcptamt
										else 0
									end as f_dr
								, 0.00 as f_cr
							from imp_receive_hdr a
							inner join imp_receive_dtl b on a.imp_receive_hdr_id = b.imp_receive_hdr_id
							where a.imp_receive_hdr_id = @imp_receive_hdr_id
								and b.canceldate is null
							) ss
							group by dc_cost_acc_id, dc_acc_id
						union
						select {$df_dc_cost_id} as dc_cost_acc_id
							, c.dc_acc_id as dc_acc_id
							, 0.00 as f_dr
							, sum(b.rcptamt) as f_cr
						from imp_receive_hdr a
							inner join imp_receive_dtl b on a.imp_receive_hdr_id = b.imp_receive_hdr_id
							inner join vw_dc_product c on b.income = c.c_map_code
						where a.imp_receive_hdr_id = @imp_receive_hdr_id
							and b.canceldate is null
						group by c.dc_acc_id 
						)a
					order by i_rank;";
			$stmt2 = $db->QueryParam($sql, array($data["id"], $gl_hdr_id));
			if ($stmt2)
			{
				$table 		= "gl_tran_hdr";
				$keyName 	= "gl_tran_hdr_id";
				$code_gen	= "GX";
				
				// Gen Code
				list($yyyy, $mm, $dd) = explode("-",@$data["d_doc_date"]);
				$c_yyyy_mm = $yyyy.$mm;
				$arrParamGencode	= array($code_gen,$c_yyyy_mm,$data["dc_user_update_id"],$data["dc_user_update_cost_id"],$gl_hdr_id);
				$sqlGenCode			= "EXEC SP_GEN_CODE ?,?,?,?,?;";
				$stmtGenCode 		= $db->QueryParam($sqlGenCode,$arrParamGencode);

				$arr_gen_code   = $db->Fetch($stmtGenCode);
				$c_code 		= $arr_gen_code["c_code_gen"] ;
				$ref_id   		= $arr_gen_code["reference_id"] ;

				if ($gl_hdr_id==$ref_id)
				{
					 
					$chk_gl_dtl = $db->GetDataBySQL("SELECT ISNULL((SELECT TOP 1 dd.gl_tran_hdr_id FROM gl_tran_dtl dd WHERE dd.gl_tran_hdr_id=aa.gl_tran_hdr_id and isnull(dd.dc_acc_id,0)=0),0) as no_acc
															,ISNULL((SELECT TOP 1 dd.gl_tran_hdr_id FROM gl_tran_dtl dd WHERE dd.gl_tran_hdr_id=aa.gl_tran_hdr_id and isnull(dd.dc_cost_acc_id,0)=0),0) as no_cost
															,ISNULL((SELECT SUM(dd.f_dr) FROM gl_tran_dtl dd WHERE dd.gl_tran_hdr_id=aa.gl_tran_hdr_id),0) as f_tot_dr
															,ISNULL((SELECT SUM(dd.f_cr) FROM gl_tran_dtl dd WHERE dd.gl_tran_hdr_id=aa.gl_tran_hdr_id),0) as f_tot_cr
													FROM gl_tran_hdr aa
													WHERE aa.gl_tran_hdr_id=?", array($gl_hdr_id)); 
					if (($chk_gl_dtl["no_acc"]>0) || ($chk_gl_dtl["no_cost"]>0) || ($chk_gl_dtl["f_tot_dr"]!=$chk_gl_dtl["f_tot_cr"]))
					{
						$i_success_jv = 2;
					}
					else
					{
						$i_success_jv = 1;
					}		
					 				
					$sql = "UPDATE {$table}
							SET c_code = ?,i_chk_gl_dtl=?
					WHERE {$keyName} = ?;";

					$stmt3 = $db->QueryParam($sql, array($c_code,$i_success_jv,$gl_hdr_id));
					$code_gen = $c_code;

					if ($stmt3)
					{
						$sql = "UPDATE imp_receive_hdr SET c_gx_code = ?, i_post = ? WHERE imp_receive_hdr_id = ?";
						$stmt4 = $db->QueryParam($sql, array($code_gen, 1, $data["id"]));
					}
				}
			}
		}
    break;
	case "IMPORT_EXCEL" :
		$n				= 1; // run เลขแถว
		$path_upload	= "../upload/";
		$uploadfile		= $path_upload.$_FILES["dtl_import"]["name"];
		move_uploaded_file($_FILES["dtl_import"]["tmp_name"], $uploadfile); //ย้ายไฟล์จาก Tmp มาไว้โฟรเดอร์ที่กำหนด
		$handle = @fopen($uploadfile,"r"); //เปิดใช้ไฟล์
		$msg	= "";
		$hdr_id = $_REQUEST["id"];
	
		if($handle != "") {
			$copy_data	= array();
			$copy_field = array();
			
			$sql = "Declare @idx as bigint;
					set @idx = ?; 
					delete from imp_receive_dtl where imp_receive_hdr_id =@idx;"; 
            
		$arrParam = array($hdr_id); 
		$stmChkMaster = $db->QueryParam($sql, $arrParam);
				
			while ($data = fgetcsv($handle, 1000, ",")) {
				if ($n == 1)
				{
					$copy_field[] = "imp_receive_hdr_id";
					foreach ($data as $kk=>$vv){
						$copy_field[$kk]=str_replace(' ',"",$vv);
					}
				}
				else if($n >= 2) {
					$data_insert = array();
					$data_insert["imp_receive_hdr_id"] = $hdr_id;
					foreach($copy_field as $key => $value)
					{
						if ($value == "rmttdate" || $value == "canceldate" )
						{
							if ($data[$key] == "")
								$data_insert[$value] = NULL;
							else 
								$data_insert[$value] = "convert(datetime, '".$data[$key]."', 102)";
						}
						else
							$data_insert[$value] = iconv("tis-620", "utf-8", $data[$key]);
					}
					
					$copy_data[] = $data_insert;
				}
				$n++;
			}

			//===== insert
			foreach ($copy_data as $data) {
				
				$addField = "";
				$addValue = "";
				$chk_amt = 0;
				foreach ($data as $fld => $value) {
					if ($value != "")
					{
						if ($fld == "rmttdate" || $fld == "canceldate" )
						{
							$addField .= ", {$fld}";
							$addValue .= ", {$value}";
						}else{
							$addField .= ", {$fld}";
							$addValue .= ", '{$value}'";
						}
						
					}
					
					if ($fld == "rcptamt")
						$chk_amt = $value;
				}
				//if ($chk_amt > 0){
					$sql	= "INSERT INTO {$tableDtl} (".substr($addField, 1).") VALUES (".substr($addValue,1).")"; 
					$db->Query($sql);
				//}
			}
			
			$sql = "UPDATE {$table} SET c_receive_name = (select top 1 dspname from {$tableDtl} WHERE {$keyName} = {$hdr_id}) WHERE {$keyName} = {$hdr_id}";
			$db->Query($sql);
			
			$db->CommitTran();
			$returnData     = array("id"=>$hdr_id);  
			$log = "Update arSoHdr";
			fclose($handle);
				
		} else { 
			$db->RollBackTran();
			$re = array("success" => true, "debug" => false, "msg" => "ไฟล์ที่เลือกผิดพลาด"); 
			echo json_encode($re);
			exit;
		}
	break;
}

if ($stmChkMaster)
{
	$db->CommitTran();
	$re = array("reval"=>0,"success"=>"Success","msg"=>$msg,"data"=>@$returnData,"log"=>@$log);
}
else
{
	$db->RollBackTran();
	$re = array("reval"=>1,"success"=>"Error","msg"=>"Error");
}
echo json_encode($re); exit; 

?>