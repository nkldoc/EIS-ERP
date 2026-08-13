<?php
include ("../../conf/config.php");
include ("../../lib/database/DatabaseServer.php");
include ("../../lib/date/i_date.class.php");

$db = new DatabaseServer ();
$date = new i_date ();

$root = "data";
$data = array ();
$con = null;

function List_QueryParam() {
	
	global $db, $date, $root, $data, $con, $arr_status;
	
	$totalCount = 0;
	$con1	= "";
	$con2	= "";
	
	$ArrY	= array(1 => "ปีงบประมาณ", 2 => "เหลื่อมปี");
	$ArrD	= array(0 => "ผังบัญชี", 1 => "หักส่งคืน", 2 => "ปรับปรุง", 3 => "ไม่ระบุ");
	
	$arr_id = explode ( ";", $_REQUEST ["dc_expense_budget_type_id"] );
	if (! in_array ( "0", $arr_id )) {
		$in = "";
		if (is_array ( $arr_id )) {
			foreach ( $arr_id as $val_parent ) {
				$in .= ($in == "") ? $val_parent : ", " . $val_parent;
			}
			$con1 .= ($in != "") ? " AND b.dc_expense_budget_type_id IN (" . $in . ")" : "";
			$con2 .= ($in != "") ? " AND c.dc_expense_budget_type_id IN (" . $in . ")" : "";
		}
	}
	
	if($_REQUEST["i_show_acc"] == 1) { // บัญชีคุม Lv4
		
		$ss_id	= explode(";", $_REQUEST["dc_acc_id_parent"]);
		if( !in_array("0", $ss_id ) ) {
			$in	= "";
			foreach( $ss_id as $val ) { $in	.= ( $in == "" )? $val : ", ".$val; }
			$con	.= " AND e.dc_acc_lv4_id IN (".$in.")";
		}
	
	} else if($_REQUEST["i_show_acc"] == 3) { // บัญชีคุม Lv5
	
		$ss_id	= explode(";", $_REQUEST["dc_acc_id_parent_lv5"]);
		if( !in_array("0", $ss_id ) ) {
			$in	= "";
			foreach( $ss_id as $val ) { $in	.= ( $in == "" )? $val : ", ".$val; }
			$con	.= " AND e.dc_acc_lv5_id IN (".$in.")";
		}
	
	} else if($_REQUEST["i_show_acc"] == 2) { // บัญชีย่อย
	
		$ss_id	= explode(";", $_REQUEST["dc_acc_id"]);
		if( !in_array("0", $ss_id ) ) {
			$in	= "";
			foreach( $ss_id as $val ) { $in	.= ( $in == "" )? $val : ", ".$val; }
			$con	.= " AND e.dc_acc_id IN (".$in.")";
		}
	
	}
	
	$subSql	= "";
	foreach($ArrY AS $i_type_year => $name){
		
		$year	= ($i_type_year == 1)? "@i_year" : "@i_year-1";
		
		$subSql	.= ($subSql == "")? "" : "UNION ALL";
		$subSql	.= "
					/*E-phys*/
					/*{$name}*/
					SELECT
						0 AS i_default
						,0 AS i_deduct
						,c.imp_expense_dtl_id AS dtl_id
						,'imp_expense_dtl' AS table_name
						,c.d_pay AS d_date
						,c.c_approve
						,c.c_acc_item
						,b.dc_expense_budget_type_id
						,e.dc_acc_lv4_id
						,c.i_type_year
						,c.c_budget_year
						,SUM(c.f_inv+c.f_vat) AS f_inv
						,STUFF((
						    SELECT
						    	CASE
						    		WHEN aa.i_status = 1 THEN bb.c_cheque+' : '+CONVERT(varchar, CAST(aa.f_cheque AS money), 1)+'<br>'
						    		ELSE '<font color=red>'+bb.c_cheque+' : ('+CONVERT(varchar, CAST(aa.f_cheque AS money), 1)+')</font><br>'
						    	END 
						    FROM imp_expense_dtl_cheque aa
						    	INNER JOIN dc_cheque bb ON aa.dc_cheque_id = bb.dc_cheque_id
						    WHERE aa.imp_expense_dtl_id = c.imp_expense_dtl_id
						    FOR XML PATH(''),TYPE).value('(./text())[1]','VARCHAR(MAX)')
						  ,1,0,'') AS c_cheque						  
					FROM imp_expense_hdr b
						INNER JOIN vw_imp_expense_dtl_items c on b.imp_expense_hdr_id = c.imp_expense_hdr_id
						INNER JOIN dc_expense d on c.dc_expense_id = d.dc_expense_id
						INNER JOIN vw_dc_acc_with_parent e on c.dc_acc_id_report = e.dc_acc_id
						INNER JOIN imp_fix_acc f ON e.dc_acc_id = f.dc_acc_id
					WHERE b.i_enable = ".STATUS_ENABLE."
						AND c.i_type_year = {$i_type_year}
						AND c.c_budget_year = {$year}
						AND CONVERT(DATETIME, c.d_pay, 102) BETWEEN CONVERT(DATETIME, @d_begin, 102) AND CONVERT(DATETIME, @d_end, 102)
						{$con}
						{$con1}
					GROUP BY c.d_pay, c.c_approve, c.c_acc_item, b.dc_expense_budget_type_id, e.dc_acc_lv4_id, c.i_type_year, c.c_budget_year, c.imp_expense_dtl_id
					UNION ALL
					/*Vision Net*/
					SELECT
						0 AS i_default
						,0 AS i_deduct
						,c.imp_expense_vsn_dtl_id AS dtl_id
						,'imp_expense_dtl' AS table_name
						,c.d_doc AS d_date
						,c.c_approve
						,c.c_acc_item
						,b.dc_expense_budget_type_id
						,e.dc_acc_lv4_id
						,c.i_type_year
						,c.c_budget_year
						,SUM(c.f_inv) AS f_inv
						,STUFF((
						    SELECT
						    	CASE
						    		WHEN aa.i_status = 1 THEN bb.c_cheque+' : '+CONVERT(varchar, CAST(aa.f_cheque AS money), 1)+'<br>'
						    		ELSE '<font color=red>'+bb.c_cheque+' : ('+CONVERT(varchar, CAST(aa.f_cheque AS money), 1)+')</font><br>'
						    	END 
						    FROM imp_expense_vsn_dtl_cheque aa
						    	INNER JOIN dc_cheque bb ON aa.dc_cheque_id = bb.dc_cheque_id
						    WHERE aa.imp_expense_vsn_dtl_id = c.imp_expense_vsn_dtl_id
						    FOR XML PATH(''),TYPE).value('(./text())[1]','VARCHAR(MAX)')
						  ,1,0,'') AS c_cheque
					FROM imp_expense_vsn_hdr b
						INNER JOIN vw_imp_expense_vsn_dtl_items c on b.imp_expense_vsn_hdr_id = c.imp_expense_vsn_hdr_id
						INNER JOIN dc_expense_acc_vsn d on c.dc_expense_acc_vsn_id = d.dc_expense_acc_vsn_id
						INNER JOIN vw_dc_acc_with_parent e on c.dc_acc_id_report = e.dc_acc_id
						INNER JOIN imp_fix_acc f ON e.dc_acc_id = f.dc_acc_id
					WHERE b.i_enable = ".STATUS_ENABLE."
						AND c.i_type_year = {$i_type_year}
						AND c.c_budget_year = {$year}
						AND CONVERT(DATETIME, c.d_doc, 102) BETWEEN CONVERT(DATETIME, @d_begin, 102) AND CONVERT(DATETIME, @d_end, 102)
						{$con}
						{$con1}
					GROUP BY c.d_doc, c.c_approve, c.c_acc_item, b.dc_expense_budget_type_id, e.dc_acc_lv4_id, c.i_type_year, c.c_budget_year, c.imp_expense_vsn_dtl_id
					";
	}
	
	foreach($ArrY AS $i_type_year => $name){
	
		$year	= ($i_type_year == 1)? "@i_year" : "@i_year-1";

		foreach($ArrD AS $i_return => $d_name){
			
			$fld = ($i_return == 0)? "f_dr" : "f_cr"; // 0 => "ผังบัญชี", 1 => "หักส่งคืน", 2 => "ปรับปรุง", 3 => "ไม่ระบุ"
			
			if($_REQUEST["i_btn{$i_return}"] == 1) {
				// ========== BTN ที่บันทึกบัญชี GX/GL แล้ว เฉพาะรหัส+ชื่อผังบัญชี และยอดเงินที่บันทึกบัญชี  ========== //
				$subSql	.= ($subSql == "")? "" : "UNION ALL";
				$subSql	.= "
							/*BTN เฉพาะ {$d_name}*/
							/* {$name} */
							SELECT
								1 AS i_default
								,{$i_return} AS i_deduct
								,NULL AS dtl_id
								,NULL AS table_name
								,b.d_save_date AS d_date
								,a.c_code AS c_approve
								,a.c_comment AS c_acc_item
								,c.dc_expense_budget_type_id
								,e.dc_acc_lv4_id
								,c.i_type_year
								,c.c_budget_year
								,".(($i_return == 0)? "" : "-(")."SUM(ISNULL(c.{$fld},0))".(($i_return == 0)? "" : ")")." AS f_inv
								,'-' AS c_cheque
							FROM gl_bank a
								INNER JOIN gl_tran_hdr b ON a.gl_tran_hdr_id = b.gl_tran_hdr_id
								INNER JOIN gl_tran_dtl c ON c.gl_tran_hdr_id = b.gl_tran_hdr_id
								INNER JOIN vw_dc_acc_with_parent e on c.dc_acc_id = e.dc_acc_id
								INNER JOIN imp_fix_acc f ON e.dc_acc_id = f.dc_acc_id
							WHERE a.i_enable = ".STATUS_ENABLE." AND LEFT(a.c_code,3) = 'btn' AND b.table_name = 'gl_bank'
								AND b.i_enable = ".STATUS_ENABLE." AND b.i_is_post > 1 AND LEFT(b.c_code,1) = 'g'
								AND b.i_is_close_year = 2
								AND ISNULL(c.{$fld},0) > 0
								AND b.i_type = 2
								AND e.i_enable = ".STATUS_ENABLE."
								AND c.i_type_year = {$i_type_year}
								AND c.c_budget_year = {$year}
								AND CONVERT(DATETIME, b.d_save_date, 102) BETWEEN CONVERT(DATETIME, @d_begin, 102) AND CONVERT(DATETIME, @d_end, 102)
								".(($i_return > 0)? " AND c.i_return = ".$i_return : "")."
								{$con} 
								{$con2}
							GROUP BY b.d_save_date, c.dc_expense_budget_type_id, e.dc_acc_lv4_id, c.i_type_year, c.c_budget_year, a.c_code, a.c_comment
							";
								
				if($i_return > 0) { // i_return 1 => "หักส่งคืน", 2 => "ปรับปรุง", 3 => "ไม่ระบุ"
					// ========== ยกเลิก BTN ========== //
					$subSql	.= ($subSql == "")? "" : "UNION ALL";
					$subSql .= "
								SELECT
									1 AS i_default
									,{$i_return} AS i_deduct
									,NULL AS dtl_id
									,NULL AS table_name
									,b.d_save_date AS d_date
									,b.c_code AS c_approve
									,ISNULL(b.c_comment1,'')+''+ISNULL(b.c_comment2,'')+''+ISNULL(b.c_comment3,'') AS c_acc_item
									,c.dc_expense_budget_type_id
									,e.dc_acc_lv4_id
									,c.i_type_year
									,c.c_budget_year
									,".(($i_return == 0)? "" : "-(")."SUM(ISNULL(c.{$fld},0))".(($i_return == 0)? "" : ")")." AS f_inv
									,'-' AS c_cheque
								FROM gl_tran_hdr b
									INNER JOIN gl_tran_dtl c ON b.gl_tran_hdr_id = c.gl_tran_hdr_id
									INNER JOIN dc_acc d ON c.dc_acc_id = d.dc_acc_id
									INNER JOIN vw_dc_acc_with_parent e on c.dc_acc_id = e.dc_acc_id
									INNER JOIN imp_fix_acc f ON e.dc_acc_id = f.dc_acc_id
								WHERE
									b.i_enable = ".STATUS_ENABLE." AND b.i_is_post > 1 AND LEFT(b.c_code,1) = 'g'
									AND b.i_is_close_year = 2
									AND ISNULL(c.{$fld},0) > 0
									AND b.i_type = 2
									AND d.i_enable = 1
									AND e.i_enable = ".STATUS_ENABLE."
									AND c.i_type_year = {$i_type_year}
									AND c.c_budget_year = {$year}
									AND CONVERT(DATETIME, b.d_save_date, 102) BETWEEN CONVERT(DATETIME, @d_begin, 102) AND CONVERT(DATETIME, @d_end, 102)
									AND c.i_return = {$i_return}
									AND b.table_name IN ('imp_expense_vsn_hdr', 'imp_expense_hdr')
									{$con} 
									{$con2}
								GROUP BY b.d_save_date, c.dc_expense_budget_type_id, e.dc_acc_lv4_id, c.i_type_year, c.c_budget_year, b.c_code, b.c_comment1, b.c_comment2, b.c_comment3
								";
				}
			}

			if($_REQUEST["i_gx{$i_return}"] == 1) {
				// ========== GX ของ ทุกอย่างที่ไม่ใช่ BTN เฉพาะ ผังบัญชี (manual) ========== //
				$subSql	.= ($subSql == "")? "" : "UNION ALL";
				$subSql .= "
							/*ฝั่ง GX ของ ทุกอย่างที่ไม่ใช่ BTN เฉพาะ {$d_name}*/
							/* {$name} */
							SELECT
								2 AS i_default
								,{$i_return} AS i_deduct
								,NULL AS dtl_id
								,NULL AS table_name
								,b.d_save_date AS d_date
								,b.c_code AS c_approve
								,ISNULL(b.c_comment1,'')+''+ISNULL(b.c_comment2,'')+''+ISNULL(b.c_comment3,'') AS c_acc_item
								,c.dc_expense_budget_type_id
								,e.dc_acc_lv4_id
								,c.i_type_year
								,c.c_budget_year
								,".(($i_return == 0)? "" : "-(")."SUM(ISNULL(c.{$fld},0))".(($i_return == 0)? "" : ")")." AS f_inv
								,'-' AS c_cheque
							FROM gl_tran_hdr b
								INNER JOIN gl_tran_dtl c ON b.gl_tran_hdr_id = c.gl_tran_hdr_id
								INNER JOIN vw_dc_acc_with_parent e on c.dc_acc_id = e.dc_acc_id
								INNER JOIN imp_fix_acc f ON e.dc_acc_id = f.dc_acc_id
							WHERE
								b.i_enable = ".STATUS_ENABLE." AND b.i_is_post > 1 AND LEFT(b.c_code,1) = 'g'
								AND b.i_is_close_year = 2
								AND ISNULL(c.{$fld},0) > 0
								AND b.i_type = 1
								AND e.i_enable = ".STATUS_ENABLE."
								AND c.i_type_year = {$i_type_year}
								AND c.c_budget_year = {$year}
								AND CONVERT(DATETIME, b.d_save_date, 102) BETWEEN CONVERT(DATETIME, @d_begin, 102) AND CONVERT(DATETIME, @d_end, 102)
								".(($i_return > 0)? " AND c.i_return = ".$i_return : "")."
								{$con}
								{$con2}
							GROUP BY b.d_save_date, c.dc_expense_budget_type_id, e.dc_acc_lv4_id, c.i_type_year, c.c_budget_year, b.c_code, b.c_comment1, b.c_comment2, b.c_comment3
							";
								
				if($i_return > 0) { // i_return 1 => "หักส่งคืน", 2 => "ปรับปรุง", 3 => "ไม่ระบุ"
					// ========== ยกเลิก BTN ========== //
					$subSql	.= ($subSql == "")? "" : "UNION ALL";
					$subSql .= "
					SELECT
						1 AS i_default
						,{$i_return} AS i_deduct
						,NULL AS dtl_id
						,NULL AS table_name
						,b.d_save_date AS d_date
						,b.c_code AS c_approve
						,ISNULL(b.c_comment1,'')+''+ISNULL(b.c_comment2,'')+''+ISNULL(b.c_comment3,'') AS c_acc_item
						,c.dc_expense_budget_type_id
						,e.dc_acc_lv4_id
						,c.i_type_year
						,c.c_budget_year
						,".(($i_return == 0)? "" : "-(")."SUM(ISNULL(c.{$fld},0))".(($i_return == 0)? "" : ")")." AS f_inv
						,'-' AS c_cheque
					FROM gl_tran_hdr b
						INNER JOIN gl_tran_dtl c ON b.gl_tran_hdr_id = c.gl_tran_hdr_id
						INNER JOIN dc_acc d ON c.dc_acc_id = d.dc_acc_id
						INNER JOIN vw_dc_acc_with_parent e on c.dc_acc_id = e.dc_acc_id
						INNER JOIN imp_fix_acc f ON e.dc_acc_id = f.dc_acc_id
					WHERE
						b.i_enable = ".STATUS_ENABLE." AND b.i_is_post > 1 AND LEFT(b.c_code,1) = 'g'
						AND b.i_is_close_year = 2
						AND ISNULL(c.{$fld},0) > 0
						AND b.i_type = 2
						AND d.i_enable = 1
						AND e.i_enable = ".STATUS_ENABLE."
						AND c.i_type_year = {$i_type_year}
						AND c.c_budget_year = {$year}
						AND CONVERT(DATETIME, b.d_save_date, 102) BETWEEN CONVERT(DATETIME, @d_begin, 102) AND CONVERT(DATETIME, @d_end, 102)
						AND c.i_return = {$i_return}
						AND b.table_name IN ('gl_bank')
						{$con}
						{$con2}
					GROUP BY b.d_save_date, c.dc_expense_budget_type_id, e.dc_acc_lv4_id, c.i_type_year, c.c_budget_year, b.c_code, b.c_comment1, b.c_comment2, b.c_comment3
					";
				}
			}
		}
	}
	
	$sqlMain = "SET NOCOUNT ON;
				DECLARE @d_begin AS VARCHAR(10) = '{$_REQUEST ["date_start"]}';
				DECLARE @d_end AS VARCHAR(10) = '{$_REQUEST ["date_end"]}';
				DECLARE @i_year AS INT = '{$_REQUEST ["year"]}';
						
				SELECT * INTO #imp_data FROM({$subSql}) a
					
				SELECT
					b.i_default
					,b.i_deduct
					,b.dtl_id
					,b.table_name
					,CONVERT(VARCHAR, b.d_date, 120) AS d_date
					,RIGHT('0'+CAST(YEAR(b.d_date) AS varchar(4)) ,4) AS yyyy
					,RIGHT('0'+CAST(MONTH(b.d_date) AS varchar(2)) ,2) AS mm
					,RIGHT('0'+CAST(DAY(b.d_date) AS varchar(2)) ,2) AS dd
					,b.c_approve
					,b.c_acc_item
					,b.dc_acc_lv4_id
					,SUM(b.f_inv) AS f_inv
					,b.c_cheque
				FROM vw_dc_expense_budget_type a
					INNER JOIN (
						SELECT aa.* FROM #imp_data aa WHERE aa.i_deduct = 0
						UNION ALL
						SELECT bb.* FROM #imp_data bb WHERE bb.i_deduct IN (1,2,3)) b ON a.dc_expense_budget_type_id = b.dc_expense_budget_type_id
				WHERE a.i_enable=?
				GROUP BY b.i_default, b.i_deduct, b.d_date, b.c_approve, b.dtl_id, b.c_acc_item, b.dc_acc_lv4_id, b.table_name, b.c_cheque
				ORDER BY b.d_date, b.c_approve, b.dc_acc_lv4_id, b.i_deduct;";

	$arrParam [] = STATUS_ENABLE;
	
	$stmt = $db->QueryParam ( $sqlMain, $arrParam );
	
	if ($stmt) {
		while ( $row = $db->Fetch ( $stmt ) ) {
			
			// รอตรวจการแสดงข้อมูลของ ส่ง คืน ต้องออกรายวันไหม
			if($row["i_deduct"] == 0) {
				$yyyy_mm_dd	= $row["yyyy"].$row["mm"].$row["dd"];
				$yyyy_mm	= $row["yyyy"].$row["mm"];
				
				$ArrH[$row["dc_acc_lv4_id"]]			= $row["dc_acc_lv4_id"];
				
				$Arr[$yyyy_mm]["yyyy_mm"]				= $date->l_month_thai[$row["mm"]]." ".($row["yyyy"]+543);
				
				$Arr[$yyyy_mm]["data"][$yyyy_mm_dd]["d_date"]			= $date->shot_date_from_db($row["d_date"]);
			}
			
			if($row["i_deduct"] == 0) {
				$Arr[$yyyy_mm]["data"][$yyyy_mm_dd]["data"][$row["c_approve"]]["data"][$row["dtl_id"]]["d_date"]			= $date->shot_date_from_db($row["d_date"]);
				$Arr[$yyyy_mm]["data"][$yyyy_mm_dd]["data"][$row["c_approve"]]["data"][$row["dtl_id"]]["i_default"]			= $row["i_default"];
				$Arr[$yyyy_mm]["data"][$yyyy_mm_dd]["data"][$row["c_approve"]]["data"][$row["dtl_id"]]["c_approve"]			= $row["c_approve"];
				$Arr[$yyyy_mm]["data"][$yyyy_mm_dd]["data"][$row["c_approve"]]["data"][$row["dtl_id"]]["c_name"]			= $row["c_acc_item"];
				$Arr[$yyyy_mm]["data"][$yyyy_mm_dd]["data"][$row["c_approve"]]["data"][$row["dtl_id"]]["c_cheque"]			= $row["c_cheque"];
				
				$Arr[$yyyy_mm]["data"][$yyyy_mm_dd]["data"][$row["c_approve"]]["data"][$row["dtl_id"]]["data"][$row["dc_acc_lv4_id"]]["dc_acc_lv4_id"]		= $row["dc_acc_lv4_id"];
				$Arr[$yyyy_mm]["data"][$yyyy_mm_dd]["data"][$row["c_approve"]]["data"][$row["dtl_id"]]["data"][$row["dc_acc_lv4_id"]]["f_inv"]				= $row["f_inv"];
				
				// รวมฎีกาวันที่
				if (! isset ( $sumTotal[$row["dc_acc_lv4_id"]]["f_inv"] )) { $sumTotal[$row["dc_acc_lv4_id"]]["f_inv"] = 0; }
				if (! isset ( $sumMMInv[$yyyy_mm][$row["dc_acc_lv4_id"]]["f_inv"] )) { $sumMMInv[$yyyy_mm][$row["dc_acc_lv4_id"]]["f_inv"] = 0; }
				if (! isset ( $sumDateInv[$yyyy_mm_dd][$row["dc_acc_lv4_id"]]["f_inv"] )) { $sumDateInv[$yyyy_mm_dd][$row["dc_acc_lv4_id"]]["f_inv"] = 0; }
					
				$sumTotal[$row["dc_acc_lv4_id"]]["f_inv"]							+= $row["f_inv"];
				$sumMMInv[$yyyy_mm][$row["dc_acc_lv4_id"]]["f_inv"]					+= $row["f_inv"];
				$sumDateInv[$yyyy_mm_dd][$row["dc_acc_lv4_id"]]["f_inv"]			+= $row["f_inv"];

			} else {
				if (! isset ( $SumDeduct[$row["i_deduct"]][$row["dc_acc_lv4_id"]]["f_inv"] )) { $SumDeduct[$row["i_deduct"]][$row["dc_acc_lv4_id"]]["f_inv"] = 0; }
				if (! isset ( $SumMMDeduct[$row["i_deduct"]][$yyyy_mm][$row["dc_acc_lv4_id"]]["f_inv"] )) { $SumMMDeduct[$row["i_deduct"]][$yyyy_mm][$row["dc_acc_lv4_id"]]["f_inv"] = 0; }
								
				$SumDeduct[$row["i_deduct"]][$row["dc_acc_lv4_id"]]["f_inv"]					+= $row["f_inv"];
				$SumMMDeduct[$row["i_deduct"]][$yyyy_mm][$row["dc_acc_lv4_id"]]["f_inv"]		+= $row["f_inv"];
			}
			
			if (! isset ( $SUM1[$yyyy_mm][$row["dc_acc_lv4_id"]]["f_inv"] )) { $SUM1[$yyyy_mm][$row["dc_acc_lv4_id"]]["f_inv"] = 0; }
			$SUM1[$yyyy_mm][$row["dc_acc_lv4_id"]]["f_inv"]		+= $row["f_inv"];
		}
		
		// ===============================================================//
		
		if (isset ( $Arr )) {
			foreach ( $Arr as $yyyy_mm => $objdd ) {
				foreach ( $objdd["data"] as $yyyy_mm_dd => $obj ) {
					foreach ( $obj["data"] as $c_approve => $objDtl ) {
						foreach ( $objDtl["data"] as $dtl_id => $objApprove ) {
							
							$temp		= array();
							$c_cheque	= "";
							
							$temp ["i_type"]		= 1;
							$temp ["d_date"]		= $objApprove["d_date"];
							$temp ["i_default"]		= $objApprove["i_default"];
							$temp ["c_approve"]		= $objApprove["c_approve"];
							$temp ["c_name"]		= $objApprove["c_name"];
							$temp ["c_cheque"]		= ($objApprove["c_cheque"] != "")? $objApprove["c_cheque"] : "<font color=red>ยังไม่ระบุเช็ค</font>";
							$temp ["data"]			= $objApprove["data"];
							
							${$root} [] = $temp;
						}
					}
					// SUM DATE
					$temp	= array();

					$temp ["i_type"]		= 2;
					$temp ["d_date"]		= "รวม ".$obj["d_date"];
					$temp ["data"]			= $sumDateInv[$yyyy_mm_dd];

					${$root} [] = $temp;
				}
				
				// SUM MONTH
				$temp	= array();
					
				$temp ["i_type"]		= 3;
				$temp ["d_date"]		= $objdd["yyyy_mm"];
				$temp ["data"]			= $sumMMInv[$yyyy_mm];
					
				${$root} [] = $temp;
								
				foreach ($ArrD AS $val => $c_name) {
					if($val > 0 && @$SumMMDeduct[$val][$yyyy_mm]) {
						
						// SUM DEDUCT
						$temp	= array();
							
						$temp ["i_type"]		= 5;
						$temp ["d_date"]		= $c_name;
						$temp ["data"]			= @$SumMMDeduct[$val][$yyyy_mm];
						
						${$root} [] = $temp;
					}
				}
				
				$temp	= array();
					
				$temp ["i_type"]		= 7;
				$temp ["d_date"]		= "รวม".$objdd["yyyy_mm"];
				$temp ["data"]			= $SUM1[$yyyy_mm];
					
				${$root} [] = $temp;
			}
		}
	}
	return json_encode ( array ("debug" => true, "totalCount" => $totalCount,$root => ${$root}, "ArrH" => $ArrH ) );
}
?>
