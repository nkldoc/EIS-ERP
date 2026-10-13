<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();

$root =  "data";
$data = array();
$con = null;



function Rep_RepBIPrType_fetch()
{
	global $db, $date, $root, $data, $con, $arr_status;
	unset(${$root});
	$totalCount = 0;
	$f_for_debt = 0;
	$yc = 0;
	$y1 = 0;
	$y2 = 0;
	$y3 = 0;
	$y4 = 0;
	$y5 = 0;
	$yl = 0;
	$re = 0;
	$i_groupMenu = "and b.i_groupMenu in (1,2,3,4,5,6,7,8)";
	// $year = isset($_GET['year_en']) ? intval($_GET['year_en']) : date("Y");
	$yearTh = isset($_GET['year_th']) ? intval($_GET['year_th']) : (date('Y') + 543);
	$yearEn = isset($_GET['year_en']) ? intval($_GET['year_en']) : date('Y');
	$chart1 = [];  // ดึงข้อมูลชุดแรก
	$chart2 = [];  // ดึงข้อมูลชุดที่สอง
	$where = ' and  a.i_pr_year = ' . $yearEn;
	// 
	$sqlMain = "SET NOCOUNT ON 
DECLARE @TEMP_SP_BG_BUDGET_SUM TABLE (
				i_year bigint
				,dc_expense_budget_type_id bigint
				,dc_cost_acc_id bigint
				,dc_cost_id bigint
				,bg_expense_id bigint
				,f_plan_begin decimal(18,2)
				,f_period_begin decimal(18,2)
				,f_income_begin decimal(18,2)
				,f_plan_transfer decimal(18,2) 
				,f_period_transfer decimal(18,2)
				,f_income_transfer decimal(18,2)
				,f_reserve_budget decimal(18,2)
				,f_reserve_budget_long decimal(18,2)
				,f_reserve_budget_income decimal(18,2)
				,f_reserve_budget_income_Finish decimal(18,2)
				,f_reserve_period decimal(18,2)
				,f_reserve_periodincome decimal(18,2)
				,f_reserve_periodfinish decimal(18,2)
				,f_reserve_income decimal(18,2)
				,f_reserve_income_Finish decimal(18,2)
				,f_total_all decimal(18,2)
				,f_return_all decimal(18,2)
				,f_total_cut decimal(18,2)
				,f_return_cut decimal(18,2)
				,f_total_pay decimal(18,2)
				,f_return_pay decimal(18,2)
				,f_plan_total decimal(18,2)
				,f_plan_cut_total decimal(18,2)
				,f_plan_pay_total decimal(18,2)
				,f_period_total decimal(18,2)
				,f_period_cut_total decimal(18,2)
				,f_period_pay_total decimal(18,2)
				,f_income_total decimal(18,2)
				,f_income_cut_total decimal(18,2)
				,f_income_pay_total decimal(18,2)
			); 
			INSERT INTO @TEMP_SP_BG_BUDGET_SUM EXEC NMU_EIS..SP_BG_BUDGET_SUM 2025
			
						select
                         *
						,(SELECT c_code  from  NMU_EIS..bg_expense where bg_expense_id = a.bg_expense_id  ) + ' : ' + a.c_name  as c_code_name
						,a.c_code
                        from 
                        (
						-- เงินตั้งต้น ของ รายได้ 
                        select 
						bg_expense_id
						,(SELECT c_code  from  NMU_EIS..bg_expense where bg_expense_id = a.bg_expense_id  )  as c_code
                        ,dc_expense_budget_type_id
						,(select c_name from NMU_EIS..bg_expense where bg_expense_id = a.bg_expense_id) as c_name 
                    	
						,f_plan_begin + f_plan_transfer as  f_plan_begin -- เงินโอนเปลี่ยนแปลง						
						,f_reserve_budget as f_reserve_budget
						,f_reserve_budget_income as f_reserve_budget_income
						,f_total_all-  f_return_all as f_reserve_budget_income_Finish

						,0  as f_period_transfer_bkb
                        ,0 as f_reserve_period_bkb
						,0 as f_reserve_periodincome_bkb
						,0 as f_reserve_periodfinish_bkb
							
                        ,0 as f_period_transfer_government
						,0 as f_reserve_period_government
						,0 as f_reserve_periodincome_government
						,0 as f_reserve_periodfinish_government

						from @TEMP_SP_BG_BUDGET_SUM a 						
						where i_year = 2025 
						and dc_cost_id = 38  and a.dc_cost_acc_id = 77 
			            AND a.dc_expense_budget_type_id = 2
                UNION ALL 
                     select 
					 	--เงินตั้งต้น ของ กทม 
						bg_expense_id
						,(SELECT c_code  from  NMU_EIS..bg_expense where bg_expense_id = a.bg_expense_id  )  as c_code
                        ,dc_expense_budget_type_id
						,(select c_name from NMU_EIS..bg_expense where bg_expense_id = a.bg_expense_id) as c_name 
						,0 as  f_plan_begin -- เงินโอนเปลี่ยนแปลง              	
						,0 as f_reserve_budget
						,0 as f_reserve_budget_income
						,0 as f_reserve_periodfinish

						,f_period_begin + f_period_transfer  as f_period_transfer_bkb
                        ,f_reserve_period as f_reserve_period_bkb
						,f_reserve_periodincome as f_reserve_periodincome_bkb
						,f_total_all-  f_return_all as f_reserve_periodfinish_bkb
						
                        ,0 as f_period_transfer_government
						,0  as f_reserve_period_government
						,0 as f_reserve_periodincome_government
						,0 as f_reserve_periodfinish_government
						from @TEMP_SP_BG_BUDGET_SUM a 						
						where i_year = 2025 
						and dc_cost_id = 38  and a.dc_cost_acc_id = 77 
                         AND a.dc_expense_budget_type_id = 4
                UNION ALL 
					 	--เงินตั้งต้น ของ อุดหนุน
                     select 
						bg_expense_id
						,(SELECT c_code  from  NMU_EIS..bg_expense where bg_expense_id = a.bg_expense_id  )  as c_code
                        ,dc_expense_budget_type_id
						,(select c_name from NMU_EIS..bg_expense where bg_expense_id = a.bg_expense_id) as c_name 
						,0 as  f_plan_begin -- เงินโอนเปลี่ยนแปลง              	
						,0 as f_reserve_budget
						,0 as f_reserve_budget_income
						,0 as f_reserve_periodfinish

						,0  as f_period_transfer_bkb
                        ,0 as f_reserve_period_bkb
						,0 as f_reserve_periodincome_bkb
						,0 as f_reserve_periodfinish_bkb

						,f_period_begin + f_period_transfer  as f_period_transfer_government
                        ,f_reserve_period as f_reserve_period_government
						,f_reserve_periodincome as f_reserve_periodincome_government
						,f_total_all -  f_return_all as f_reserve_periodfinish_government
						from @TEMP_SP_BG_BUDGET_SUM a 						
						where i_year = 2025 
						and dc_cost_id = 38  and a.dc_cost_acc_id = 77 
                         AND a.dc_expense_budget_type_id = 5
                        ) a
                        
						ORDER by a.c_code,a.bg_expense_id 


";
	$stmt = $db->QueryParam($sqlMain, array());
	if ($stmt) {
		$i = 0;
		$i_tor_type1 = 0;
		while ($row = $db->Fetch($stmt)) {
				$temp = array(                                            
				"no"                                        => ++$i,
				"name"                                      => $row["c_name"],
				"c_name"                                    => $row["c_code_name"],
				"bg_expense_id"                             => intVal($row["bg_expense_id"]),
				"dc_expense_budget_type_id"                 => intVal($row["dc_expense_budget_type_id"]),
				                                                                                                                                                                    
				"f_plan_begin"                              => intVal($row["f_plan_begin"]),   //f_plan_begin  เงินตั้งต้น รายได้ 
				"f_reserve_budget"                          => intVal($row["f_reserve_budget"]), //f_reserve_budget //เงินจอง PR  รายได้ 
				"f_reserve_budget_income"                   => intVal($row["f_reserve_budget_income"]), //f_reserve_budget //เงินจองตรวจรับ  รายได้  
				"f_reserve_budget_income_Finish"            => intVal($row["f_reserve_budget_income_Finish"]), //f_reserve_budget //เงินจองเบิกแล้ว  รายได้ 
                                                                                
                                            
				"f_plan_begin_remaining"                    => intVal($row["f_plan_begin"]) - 
				(intVal($row["f_reserve_budget"])  + intVal($row["f_reserve_budget_income"])  + intVal($row["f_reserve_budget_income_Finish"]) )  ,                                             
				// ตั้งต้น - จองแล้ว - ตรวจรับ - เบิกแล้ว   (เงินรวม รายได้)                                              
				                                            
				                                            
                            //   f_reserve_period_bkb                                                                                                  
				"f_period_transfer_bkb"                     => intVal($row["f_period_transfer_bkb"]), // f_period_transfer_bkb กทม  ตั้งต้น  
				"f_reserve_period_bkb"                      => intVal($row["f_reserve_period_bkb"]), // f_reserve_period_bkb  //เงินจอง PR  กทม
				"f_reserve_periodincome_bkb"                => intVal($row["f_reserve_periodincome_bkb"]), // f_reserve_period_bkb  //เงินจองตรวจรับ  กทม
				"f_reserve_periodfinish_bkb"                => intVal($row["f_reserve_periodfinish_bkb"]), // f_reserve_period_bkb  //เงินจองเบิกแล้ว    กทม
                                            
				"f_period_transfer_remaining_bkb"           => intVal($row["f_period_transfer_bkb"]) - 
				(intVal($row["f_reserve_period_bkb"])  + intVal($row["f_reserve_periodincome_bkb"]) +  intVal($row["f_reserve_periodfinish_bkb"]) )  ,                                             
				// ตั้งต้น - จองแล้ว - ตรวจรับ - เบิกแล้ว   (เงินรวม กทม)                                              
                                            
                                            
				"f_period_transfer_government"              => intVal($row["f_period_transfer_government"]), // ตั้งต้น  
				"f_reserve_period_government"               => intVal($row["f_reserve_period_government"]), // ใช้แล้ว
				"f_reserve_periodincome_government"         => intVal($row["f_reserve_periodincome_government"]), // ใช้แล้ว
				"f_reserve_periodfinish_government"         => intVal($row["f_reserve_periodfinish_government"]), // ใช้แล้ว
                                            
				"f_period_transfer_remaining_government"    => intVal($row["f_period_transfer_government"]) -
				(intVal($row["f_reserve_period_government"]) - intVal($row["f_reserve_periodincome_government"]) - intVal($row["f_reserve_periodfinish_government"]) ) , // ตั้งต้น - ใช้แล้ว                                             
				// ตั้งต้น - จองแล้ว - ตรวจรับ - เบิกแล้ว   (เงินรวม รัฐบาล)                                                                                          
                                            
// f_reserve_periodfinish 
			);
			${$root}[] = $temp;
			$i_tor_type1 	+= $row["bg_expense_id"];
			// $i_tor_type2 	+= $row["i_tor_type2"];
			// $i_tor_type3 	+= $row["i_tor_type3"];
			// $i_tor_type4 	+= $row["i_tor_type4"];
			// $i_tor_type5 	+= $row["i_tor_type5"];
			// $i_tor_type6 	+= $row["i_tor_type6"];
			// $i_product_type7 	+= $row["i_product_type7"];
			// $i_product_type8 += $row["i_product_type8"];
		}
	}
	// print_r($root);
	// exit;
	return json_encode(array(
		"debug"                 => true,
		$root					=> ${$root},
		"no"                    => 9999,
		// "i_tor_type1"           => $i_tor_type1,
		// "i_tor_type2"           => $i_tor_type2,
		// "i_tor_type3"           => $i_tor_type3,
		// "i_tor_type4"           => $i_tor_type4,
		// "i_tor_type5"           => $i_tor_type5,
		// "i_tor_type6"       	=> $i_tor_type6,
		// "i_product_type7"       => $i_product_type7,
		// "i_product_type8"       => $i_product_type8,
		"year_th"               => $yearTh,
		"year_en"               => $yearEn,
		"totalCount"            => $i,
	));
}
