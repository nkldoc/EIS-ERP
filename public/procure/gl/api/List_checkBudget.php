<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

$db 	= new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();

$root		= "data";
$data		= array();
$con		= null;

if( $_REQUEST["type"] == "gl_tran_dtl" ) {
    
    $arrReturn      = array(null => "", "1" => "หักส่งคืน","2" => "ปรับปรุง","3" => "<font color=red>ไม่ระบุ</font>");
    
    $mode				= @$_REQUEST["mode"];
    $i_read				= @$_REQUEST["i_read"];
    
    $limit 	= @$_REQUEST["limit"];
    $start 	= @$_REQUEST["start"];
    
    if (!$util->get($start)) { 	$start 	= 0; }
    if (!$util->get($limit)) { 	$limit 	= 20; }else{ $limit=($limit+$start); }
    
//     switch($i_read) {
//         case 1:		$con = " AND a.dc_user_create_id=".$_SESSION["user_id"]; break;
//         case 2:		$con = " AND a.dc_user_create_cost_id=".$_SESSION["dc_cost_id"]; break;
//         default:	$con = "";
//     }
    
    if($mode == "SEARCH") {
        
        if($_REQUEST["f_money"] != "") { $con .= " AND (a.f_dr = {$_REQUEST["f_money"]} OR a.f_cr = {$_REQUEST["f_money"]})"; }
        if($_REQUEST["c_code"] != "") { $con .= " AND a.c_code LIKE '%".$_REQUEST["c_code"]."%' "; }
        if($_REQUEST["dc_expense_budget_type_id"] > 0) { $con .= " AND a.dc_expense_budget_type_id = ".$_REQUEST["dc_expense_budget_type_id"]; }
        if($_REQUEST["dc_acc_id"] > 0) { $con .= " AND a.dc_acc_id = ".$_REQUEST["dc_acc_id"]; }
        if($_REQUEST["d_date1"] != "" && $_REQUEST["d_date2"] != "") {
            $con	.= " AND a.d_date BETWEEN CONVERT(DATETIME,'{$_REQUEST["d_date1"]}',102) AND CONVERT(DATETIME,'{$_REQUEST["d_date2"]}'+' 23:59:59',102)";
        }
    }
    
    $sqlMain = "SET NOCOUNT ON
				SELECT
                	distinct
                	ROW_NUMBER() OVER (ORDER BY a.gl_tran_dtl_id) AS numrow
                	,a.*
                    ,b.c_name AS dc_expense_budget_type_name
                    ,c.c_code+' '+c.c_name AS dc_acc_name
                INTO #TempData
                FROM (
                /*GL ของ imp_expense_vsn_hdr, imp_expense_hdr (auto)*/
                SELECT
                	c.gl_tran_dtl_id
                	,'gl_tran_dtl' AS table_name
                	,b.c_code
                	,b.c_ref_doc AS c_doc
                    ,CONVERT(VARCHAR, b.d_save_date, 120) AS d_date
                	,c.f_dr
                	,c.f_cr
                	,c.dc_expense_budget_type_id
                	,c.dc_acc_id
                	,ISNULL(c.i_type_year,9) AS i_type_year
                	,c.c_budget_year
                	,c.i_return
                FROM gl_tran_hdr b
                	INNER JOIN gl_tran_dtl c ON b.gl_tran_hdr_id = c.gl_tran_hdr_id
                	INNER JOIN dc_acc d ON c.dc_acc_id = d.dc_acc_id
                	INNER JOIN imp_fix_acc e ON d.dc_acc_id = e.dc_acc_id
                WHERE
                	b.i_enable = 1 AND b.i_is_post in (3) AND LEFT(b.c_code,1) = 'g'
                	AND b.i_is_close_year = 2 AND d.i_enable = 1
                	AND c.f_dr > 0
                	AND b.table_name IN ('imp_expense_vsn_hdr', 'imp_expense_hdr')
                	AND b.i_type = 2 /*1 = Manual, 2 = Autometic*/
                /*ข้อมูล IMP*/
                /*
                UNION ALL
                SELECT * FROM (
                	/*e-phis*/
                	SELECT
                		b.imp_expense_dtl_id
                		,'imp_expense_dtl' AS table_name
                		,a.c_code
                		,'เลขที่ฏีกา : '+b.c_approve AS c_doc
                		,b.d_pay AS d_date
                		,ISNULL(b.f_inv,0)+ISNULL(b.f_vat,0) AS f_dr
                		,0 AS f_cr
                		,a.dc_expense_budget_type_id
                		,b.dc_acc_id_report AS dc_acc_id
                		,b.i_type_year
                		,b.c_budget_year
                		,null AS i_return
                	FROM imp_expense_hdr a
                		INNER JOIN vw_imp_expense_dtl_items b on a.imp_expense_hdr_id = b.imp_expense_hdr_id
                		INNER JOIN dc_expense c on b.dc_expense_id = c.dc_expense_id
                		INNER JOIN dc_acc d on b.dc_acc_id_report = d.dc_acc_id
                		INNER JOIN imp_fix_acc e ON d.dc_acc_id = e.dc_acc_id
                	WHERE a.i_enable = 1
                	UNION ALL
                	/*Vision Net*/
                	SELECT
                		b.imp_expense_vsn_dtl_id
                		,'imp_expense_vsn_dtl' AS table_name
                		,a.c_code
                		,'เลขที่ฏีกา : '+b.c_approve AS c_doc
                		,b.d_doc AS d_date
                		,b.f_inv AS f_dr
                		,0 AS f_cr
                		,a.dc_expense_budget_type_id
                		,b.dc_acc_id_report AS dc_acc_id
                		,b.i_type_year
                		,b.c_budget_year
                		,null AS i_return
                	FROM imp_expense_vsn_hdr a
                		INNER JOIN vw_imp_expense_vsn_dtl_items b on a.imp_expense_vsn_hdr_id = b.imp_expense_vsn_hdr_id
                		INNER JOIN dc_expense_acc_vsn c on b.dc_expense_acc_vsn_id = c.dc_expense_acc_vsn_id
                		INNER JOIN dc_acc d on b.dc_acc_id_report = d.dc_acc_id
                		INNER JOIN imp_fix_acc e ON d.dc_acc_id = e.dc_acc_id
                	WHERE a.i_enable = 1
                ) bb
                */

                /*-----------------------------------------------------------------------*/
                UNION ALL
                /*BTN AUTO*/
                SELECT
                	c.gl_tran_dtl_id
                	,'gl_tran_dtl' AS table_name
                	,b.c_code
                	,a.c_doc
                	,CONVERT(VARCHAR, b.d_save_date, 120) AS d_date
                	,c.f_dr
                	,c.f_cr
                	,c.dc_expense_budget_type_id
                	,c.dc_acc_id
                	,ISNULL(c.i_type_year,9) AS i_type_year
                	,c.c_budget_year
                	,c.i_return
                FROM gl_bank a
                	INNER JOIN gl_tran_hdr b ON a.gl_tran_hdr_id = b.gl_tran_hdr_id
                	INNER JOIN gl_tran_dtl c ON c.gl_tran_hdr_id = b.gl_tran_hdr_id
                	INNER JOIN dc_acc d ON d.dc_acc_id = c.dc_acc_id
                	INNER JOIN imp_fix_acc e ON d.dc_acc_id = e.dc_acc_id
                WHERE
                	a.i_enable = 1 AND LEFT(a.c_code,3) = 'btn' AND b.table_name = 'gl_bank'
                	AND b.i_enable = 1 AND b.i_is_post > 1 AND LEFT(b.c_code,1) = 'g'
                	AND b.i_is_close_year = 2 AND d.i_enable = 1
                	AND b.i_type = 2 /*1 = Manual, 2 = Autometic*/
                UNION ALL
                /*GX ของ ทุกอย่างที่ไม่ใช่ BTN เฉพาะ ผังบัญชี (manual)*/
                SELECT
                	c.gl_tran_dtl_id
                	,'gl_tran_dtl' AS table_name
                	,b.c_code
                	,b.c_ref_doc AS c_doc
                	,CONVERT(VARCHAR, b.d_save_date, 120) AS d_date
                	,c.f_dr
                	,c.f_cr
                	,c.dc_expense_budget_type_id
                	,c.dc_acc_id
                	,ISNULL(c.i_type_year,9) AS i_type_year
                	,c.c_budget_year
                	,c.i_return
                FROM gl_tran_hdr b
                	INNER JOIN gl_tran_dtl c ON b.gl_tran_hdr_id = c.gl_tran_hdr_id
                	INNER JOIN dc_acc d ON c.dc_acc_id = d.dc_acc_id
                	INNER JOIN imp_fix_acc e ON d.dc_acc_id = e.dc_acc_id
                WHERE
                	b.i_enable = 1 AND b.i_is_post > 1 AND LEFT(b.c_code,1) = 'g'
                	AND b.i_is_close_year = 2 AND d.i_enable = 1
                	AND b.i_type = 1 /*1 = Manual, 2 = Autometic*/
                
                /*------------------------------------- ยกเลิก -------------------------------------*/
                UNION ALL
                /*ยกเลิก BTN*/
                SELECT
                	c.gl_tran_dtl_id
                	,'gl_tran_dtl' AS table_name
                	,b.c_code
                	,b.c_ref_doc AS c_doc
                	,CONVERT(VARCHAR, b.d_save_date, 120) AS d_date
                	,c.f_dr
                	,c.f_cr
                	,c.dc_expense_budget_type_id
                	,c.dc_acc_id
                	,ISNULL(c.i_type_year,9) AS i_type_year
                	,c.c_budget_year
                	,c.i_return
                FROM gl_tran_hdr b
                	INNER JOIN gl_tran_dtl c ON b.gl_tran_hdr_id = c.gl_tran_hdr_id
                    INNER JOIN dc_acc d ON c.dc_acc_id = d.dc_acc_id
                    INNER JOIN imp_fix_acc e ON d.dc_acc_id = e.dc_acc_id
                WHERE
                	b.i_enable = 1 AND b.i_is_post > 1 AND LEFT(b.c_code,1) = 'g'
                	AND b.i_is_close_year = 2 AND d.i_enable = 1
                	AND b.table_name IN ('gl_bank')
                	AND ISNULL(c.i_return,0) != 0
                	AND b.i_type = 2
                UNION ALL
                /*ยกเลิก IMP*/
                SELECT
                	c.gl_tran_dtl_id
                	,'gl_tran_dtl' AS table_name
                	,b.c_code
                	,b.c_ref_doc AS c_doc
                	,CONVERT(VARCHAR, b.d_save_date, 120) AS d_date
                	,c.f_dr
                	,c.f_cr
                	,c.dc_expense_budget_type_id
                	,c.dc_acc_id
                	,ISNULL(c.i_type_year,9) AS i_type_year
                	,c.c_budget_year
                	,c.i_return
                FROM gl_tran_hdr b
                	INNER JOIN gl_tran_dtl c ON b.gl_tran_hdr_id = c.gl_tran_hdr_id
                	INNER JOIN dc_acc d ON c.dc_acc_id = d.dc_acc_id
                	INNER JOIN imp_fix_acc e ON d.dc_acc_id = e.dc_acc_id
                WHERE b.i_enable = 1 AND b.i_is_post > 1 AND LEFT(b.c_code,1) = 'g'
                	AND b.i_is_close_year = 2 AND d.i_enable = 1
                	AND b.table_name IN ('imp_expense_vsn_hdr', 'imp_expense_hdr')
                	AND ISNULL(c.i_return,0) != 0
                	AND b.i_type = 2
                ) a
                    LEFT JOIN dc_expense_budget_type b ON a.dc_expense_budget_type_id = b.dc_expense_budget_type_id
                    LEFT JOIN dc_acc c ON a.dc_acc_id = c.dc_acc_id
                WHERE 1=1
                    {$con};

                SELECT * FROM #TempData aa
				WHERE aa.numrow > ? AND aa.numrow <= ?
				ORDER BY aa.numrow;
				
				SELECT COUNT(*) AS rowCounts FROM #TempData;";
					
	$arrParam[]	= $start;
	$arrParam[]	= $limit;
	
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if( sqlsrv_has_rows( $stmt ) ) {
	    while( $row = $db->Fetch( $stmt ) ) {
	        
	        if($row["i_type_year"] == 9) {
	            $c_budget_year = "<font color=red>ไม่ระบุ</font>";
	        } else if($row["i_type_year"] == 1) {
	            $c_budget_year = ($row["c_budget_year"]+543);
	        } else if($row["i_type_year"] == 2) {
	            $c_budget_year = ($row["c_budget_year"]+543)." (เหลื่อมปี)";
	        } else {
	            $c_budget_year = "";
	        }
	        
	        $temp = array( "no"                            => $row["numrow"],
	                       "id"                            => $row["gl_tran_dtl_id"],
                           "c_code"                        => ($row["c_code"] != "" && $row["c_code"] != "0")? $row["c_code"] : "",
	                       "c_doc"						   => $row["c_doc"],
	                       "d_date"                        => ($row["d_date"] != "")? $date->extDateBuddha($row["d_date"]) : "",
	                       "f_dr"                          => $row["f_dr"],
	                       "f_cr"                          => $row["f_cr"],
	                       "dc_expense_budget_type_id"     => $row["dc_expense_budget_type_id"],
	                       "dc_expense_budget_type_name"   => $row["dc_expense_budget_type_name"],
	                       "dc_acc_id"                     => $row["dc_acc_id"],
	                       "dc_acc_name"                   => $row["dc_acc_name"],
                           "c_budget_year"                 => $c_budget_year,
	                       "c_return"                      => $arrReturn[$row["i_return"]],
	        );
	        
	        ${$root}[] = $temp;
	    }
	}
	
	$db->NextResult( $stmt );
	$rowCounts=$db->Fetch( $stmt );
	
	echo json_encode(array("debug"=>true, "totalCount"=>$rowCounts["rowCounts"], $root=>${$root}));
	exit;
}
?>