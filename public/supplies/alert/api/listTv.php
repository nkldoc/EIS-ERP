<?php

include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();



 $root = "data";
 $data = array();

 $limit = $_REQUEST["limit"] ?? null;
 $dir = $_REQUEST["dir"] ?? null;
 $sort = $_REQUEST["sort"] ?? null;
 $start = $_REQUEST["start"] ?? null;

 function get($a) {
     return $a ?? 0;
 }

 if (!get($start)) {
     $start = 0;
 }
 if (!get($limit)) {
     $limit = 9;
 } else {
     $limit = ($limit + $start);
 }
 if (!get($dir)) {
     $dir = "DESC";
 }
 if (!get($sort)) {
     $sort = " a.row";
 }
 
$i = 1;
$count = 0;
$mode = $_REQUEST["mode"];
$arrParam = array();
$arrCountParam = array();
// if (is_object($arr))
//     foreach ($arr->data[0] as $k => $v) {
switch ($mode) {
    case "grid1":

        ###########################################
        $root = "data";
        $data = array();
    
        $arrParam[] = $start;
        $arrParam[] = $limit;
        // $arrParam[] = $_REQUEST['dc_bg_budget_type_id'] ?? null;
        $sqlTempTable = "select  ROW_NUMBER() OVER(PARTITION BY e.sp_emp_id ORDER BY a.tor_id) AS Row
 , a.tor_id
 , convert(varchar,i.d_tor_status_date, 120) as d_tor_status_date
 , DATEDIFF(day , convert(varchar,i.d_tor_status_date, 120) , convert(varchar(10), GETDATE(), 120)) as diffDay
 , e.c_name as emp_name
 , a.c_code
 , c.c_code as c_contract_name
 , a.c_name as pr_name
 , a.tor_type_id
 , a.tor_status_id
 , isnull(c.i_contract_status,0) as i_contract_status
 , convert(varchar(10), GETDATE(), 120) as day_now 
 , (SELECT c_name from sp_type_status where sp_type_status_id = a.tor_type_id) as c_tor_type 
 , DATEDIFF(day, convert(varchar,i.d_tor_status_date, 120) , convert(varchar(10), GETDATE(), 120)) as diff1320
 , CASE
	WHEN a.tor_type_id = 1 
		AND a.i_type_contract = 1 
		AND DATEDIFF(day,convert(varchar,i.d_tor_status_date, 120), convert(varchar(10), GETDATE(), 120)) < 40
	THEN 1
	WHEN a.tor_type_id = 1 
		AND a.i_type_contract = 3 
		AND DATEDIFF(day,convert(varchar,i.d_tor_status_date, 120), convert(varchar(10), GETDATE(), 120)) < 40
	THEN 1
	WHEN a.tor_type_id = 3  
		AND a.i_type_contract = 3  
		AND DATEDIFF(day,convert(varchar,i.d_tor_status_date, 120), convert(varchar(10), GETDATE(), 120)) < 40
	THEN 1
	WHEN a.tor_type_id = 3 
		AND a.i_type_contract = 1  
		AND DATEDIFF(day,convert(varchar,i.d_tor_status_date, 120), convert(varchar(10), GETDATE(), 120)) < 40
	THEN 1
	WHEN a.tor_type_id = 1  
		AND a.i_type_contract = 2 
		AND DATEDIFF(day,convert(varchar,i.d_tor_status_date, 120), convert(varchar(10), GETDATE(), 120)) < 26
	THEN 1
	WHEN a.tor_type_id = 3  
		AND a.i_type_contract = 2 
		AND DATEDIFF(day,convert(varchar,i.d_tor_status_date, 120), convert(varchar(10), GETDATE(), 120)) < 26
	THEN 1	WHEN a.tor_type_id = 4 -- e bidding
		AND a.i_type_contract = 2 
		AND DATEDIFF(day,convert(varchar,i.d_tor_status_date, 120), convert(varchar(10), GETDATE(), 120)) < 61
	THEN 1
	WHEN a.tor_type_id = 4 -- e bidding
		AND a.i_type_contract = 1 
		AND DATEDIFF(day,convert(varchar,i.d_tor_status_date, 120), convert(varchar(10), GETDATE(), 120)) < 61
	THEN 1
    	WHEN a.tor_type_id = 4 -- e bidding
		AND a.i_type_contract = 3 
		AND DATEDIFF(day,convert(varchar,i.d_tor_status_date, 120), convert(varchar(10), GETDATE(), 120)) < 61
	THEN 1
	ELSE 0
	END AS Pass_status
 from sp_tor a
inner join sp_emp e on e.sp_emp_id=a.sp_emp_id
inner join sp_tor_contract c on c.sp_tor_id = a.tor_id 
inner join sp_tor_item i on i.tor_id = a.tor_id and i.sp_status_hdr_id = a.tor_status_id
where c.i_enabled = 1 and a.i_enabled = 1
AND isnull(c.c_code,'') = '' 
and isnull(a.c_code,'') != ''  
AND NOT EXISTS (SELECT tor_id FROM sp_tor_un_alert WHERE tor_id = a.tor_id)
--and isnull(c.i_contract_status,0) < 1
--AND convert(varchar,i.d_tor_status_date, 120) > '2022-10-01'
AND a.i_type_bg = 1 
AND (CASE
	WHEN a.tor_type_id = 1 
		AND a.i_type_contract = 1  
		AND DATEDIFF(day,convert(varchar,i.d_tor_status_date, 120), convert(varchar(10), GETDATE(), 120)) < 40
	THEN 1
	WHEN a.tor_type_id = 1  
		AND a.i_type_contract = 3 
		AND DATEDIFF(day,convert(varchar,i.d_tor_status_date, 120), convert(varchar(10), GETDATE(), 120)) < 40
	THEN 1
	WHEN a.tor_type_id = 3  
		AND a.i_type_contract = 3  
		AND DATEDIFF(day,convert(varchar,i.d_tor_status_date, 120), convert(varchar(10), GETDATE(), 120)) < 40
	THEN 1
	WHEN a.tor_type_id = 3 
		AND a.i_type_contract = 1  
		AND DATEDIFF(day,convert(varchar,i.d_tor_status_date, 120), convert(varchar(10), GETDATE(), 120)) < 40
	THEN 1
	WHEN a.tor_type_id = 1   
		AND a.i_type_contract = 2  
		AND DATEDIFF(day,convert(varchar,i.d_tor_status_date, 120), convert(varchar(10), GETDATE(), 120)) < 26
	THEN 1
	WHEN a.tor_type_id = 3  
		AND a.i_type_contract = 2  
		AND DATEDIFF(day,convert(varchar,i.d_tor_status_date, 120), convert(varchar(10), GETDATE(), 120)) < 26
	THEN 1 WHEN a.tor_type_id = 4 -- e bidding
		AND a.i_type_contract = 2  
		AND DATEDIFF(day,convert(varchar,i.d_tor_status_date, 120), convert(varchar(10), GETDATE(), 120)) < 61
	THEN 1
	WHEN a.tor_type_id = 4 -- e bidding
		AND a.i_type_contract = 1 
		AND DATEDIFF(day,convert(varchar,i.d_tor_status_date, 120), convert(varchar(10), GETDATE(), 120)) < 61
	THEN 1
    	WHEN a.tor_type_id = 4 -- e bidding
		AND a.i_type_contract = 3  
		AND DATEDIFF(day,convert(varchar,i.d_tor_status_date, 120), convert(varchar(10), GETDATE(), 120)) < 61
	THEN 1
	ELSE 0
	END) = 0 

group by a.tor_id
	,e.dc_department_id
	,e.sp_emp_id
	,e.c_name
	,a.c_code
	,a.c_name
	,tor_type_id
	,a.tor_type_id
	,a.f_total_amt
	,a.d_egp_date
	,c.d_doc_date
	,a.i_type_contract
	,a.tor_status_id
	,i.d_tor_status_date
	,c.i_contract_status
	,c.c_code
                ";
    $sqlMain = "select a.* from ({$sqlTempTable}) a " 
            . " WHERE a.row > ? and a.row <= ?";       
        //    echo $sqlMain;
        //    exit();
        $stmt = $db->QueryParam($sqlMain, $arrParam);
        $i = $start + 1;
        while ($row = $db->Fetch($stmt)) {

            $temp = array(
                "no" => $i++,
                "id" => $row["tor_id"],
                "c_code" => $row["c_code"],
                "c_name" => $row["pr_name"],
                "sp_emp" => $row["emp_name"],
                "day" => $row["diffDay"],
            );

            ${$root}[] = $temp;
        }
        break;
    case "grid2":

        ###########################################
        $root = "data";
        $data = array();
    
        $arrParam[] = $start;
        $arrParam[] = $limit;
        // $arrParam[] = $_REQUEST['dc_bg_budget_type_id'] ?? null;
        $sqlTempTable = "select row_number() over (order by DATEDIFF(day,convert(varchar, c.d_due_date, 120),GETDATE()) DESC) as row  
		, DATEDIFF(day,convert(varchar, c.d_due_date, 120),GETDATE()) AS diffDay  
				, convert(varchar,c.d_doc_date, 120) as d_start_date
		, convert(varchar,c.d_due_date, 120) as d_due_date
		, convert(varchar(10), GETDATE(), 120) as day_now
		, h.sp_tor_hdr_period_id
		, p.po_working_hdr_id
		, h.i_is_last 
		, t.tor_id, c.c_code,c.c_name

			, (select top 1 c_name from NMU_ERP.dbo.sp_emp where sp_emp_id=t.sp_emp_id) as sp_emp_name 
			, (select top 1 inv_name from nmu.dbo.dc_creditor where dc_creditor_id=c.dc_creditor_id) as dc_creditor_name 
		, c.i_is_close
		, c.i_is_complete
	 from NMU_ERP.dbo.sp_tor_contract c
	 inner join NMU_ERP.dbo.sp_tor t on t.tor_id=c.sp_tor_id
	 inner join NMU_ERP.dbo.sp_tor_hdr_period h on h.sp_tor_contract_id=c.sp_tor_contract_id
	 inner join NMU_ERP.dbo.sp_check_period_hdr p on p.sp_tor_hdr_period_id=h.sp_tor_hdr_period_id
	where c.i_enabled=1 and t.i_enabled=1 
	and convert(varchar(10),c.d_doc_date, 120) > '2024-10-01'  
	and p.po_working_hdr_id is null
	and DATEDIFF(day,c.d_due_date, convert(varchar,getDate() , 120)) >= (-15)  ";
        //    echo $sqlMain;
        //    exit();
    
       
   $sqlMain = "select a.* from ({$sqlTempTable}) a " 
            . " WHERE a.row > ? and a.row <= ?";
    
        $stmt = $db->QueryParam($sqlMain, $arrParam);
        $i = $start + 1;
        while ($row = $db->Fetch($stmt)) {

            $temp = array(
                "no" => $i++,
                "id" => $row["tor_id"],
                "c_code" => $row["c_code"],
                "c_name" => $row["c_name"],
                "sp_emp" => $row["sp_emp_name"],
                "day" => $row["diffDay"],
            );

            ${$root}[] = $temp;
        }
        break;
    case "grid3":

          ###########################################
        $root = "data";
        $data = array();
    
        $arrParam[] = $start;
        $arrParam[] = $limit;
        // $arrParam[] = $_REQUEST['dc_bg_budget_type_id'] ?? null;
        $sqlTempTable = "SELECT 
                                DATEDIFF(day, c.d_due_date, GETDATE()) AS diffDay,
                                DATEDIFF(day, GETDATE(), c.d_due_date) as beetDay,
                                CONVERT(varchar, GETDATE(), 120) as dd,
                                CONVERT(varchar, c.d_doc_date, 120) as d_start_date,
                                CONVERT(varchar, c.d_due_date, 120) as d_due_date,
                                CONVERT(varchar(10), GETDATE(), 120) as day_now,
                                t.tor_id,
                                c.c_code,
                                c.c_name,
                                (SELECT TOP 1 c_name FROM NMU_ERP.dbo.sp_emp WHERE sp_emp_id = t.sp_emp_id) AS sp_emp_name,
                                (SELECT TOP 1 inv_name FROM nmu.dbo.dc_creditor WHERE dc_creditor_id = c.dc_creditor_id) AS dc_creditor_name,
                                ROW_NUMBER() OVER (ORDER BY DATEDIFF(day, GETDATE(), c.d_due_date) ASC) AS row

                            FROM NMU_ERP.dbo.sp_tor_contract c
                            INNER JOIN NMU_ERP.dbo.sp_tor t ON t.tor_id = c.sp_tor_id
                            INNER JOIN NMU_ERP.dbo.sp_tor_hdr_period h ON h.sp_tor_contract_id = c.sp_tor_contract_id

                            WHERE 
                                c.i_enabled = 1 
                                AND t.i_enabled = 1 
                                AND CONVERT(varchar(10), c.d_doc_date, 120) > '2024-10-01'  
                                AND DATEDIFF(day, GETDATE(), c.d_due_date) BETWEEN -1000 AND 5
                                AND NOT EXISTS (
                                    SELECT 1
                                    FROM NMU_ERP.dbo.sp_check_period_hdr p2
                                    INNER JOIN NMU_ERP.dbo.sp_tor_hdr_period h2 ON h2.sp_tor_contract_id = p2.sp_tor_contract_id
                                    WHERE 
                                        p2.sp_tor_contract_id = c.sp_tor_contract_id
                                        AND p2.po_working_hdr_id IS NOT NULL 
                                        AND h2.i_is_last = 1
                                )";
        //    echo $sqlMain;
        //    exit();
    
       
   $sqlMain = "select a.* from ({$sqlTempTable}) a " 
            . " WHERE a.row > ? and a.row <= ?"
           . " order by row";
    
        $stmt = $db->QueryParam($sqlMain, $arrParam);
        $i = $start + 1;
        while ($row = $db->Fetch($stmt)) {

            $temp = array(
                "no" => $i++,
                "id" => $row["tor_id"],
                "c_code" => $row["c_code"],
                "c_name" => $row["c_name"],
                "sp_emp" => $row["sp_emp_name"],
                "day" => $row["beetDay"],
            );

            ${$root}[] = $temp;
        }
        break;
    case "grid4":

        ###########################################
        $root = "data";
        $data = array();
    
        $arrParam[] = $start;
        $arrParam[] = $limit;
        // $arrParam[] = $_REQUEST['dc_bg_budget_type_id'] ?? null;
        $sqlTempTable = "select row_number() over (order by DATEDIFF(day,convert(varchar, s.d_update, 120),GETDATE()) DESC) as row  
		, DATEDIFF(day,convert(varchar, s.d_update, 120),GETDATE()) AS diffDay 
		, s.c_code as ap_code,c.c_name
		, c.c_code as c_contract_code
		, (select top 1 c_name from NMU_ERP.dbo.sp_emp where sp_emp_id=t.sp_emp_id) as sp_emp_name 
        , (select top 1 inv_name from nmu.dbo.dc_creditor where dc_creditor_id=s.dc_creditor_id) as dc_creditor_name 
		, convert(varchar, s.d_update, 120) as d_reg_billing_date
		, convert(varchar(10), GETDATE(), 120) as day_now
		, s.f_total_add_vat_amt
		, convert(varchar, s.d_checking_date, 120) as d_checking_date
		--, s.dc_creditor_id
		--, c.dc_creditor_id
	    --, (select top 1 c_code_ref from NMU_EIS.dbo.po_working_hdr pwh where pwh.po_working_hdr_id = s.sp_check_period_hdr_id  and pwh.i_enable = 1) as c_code_ref    
        --, convert(varchar, s.d_arrive_date, 120) as d_arrive_date
        --, convert(varchar, s.d_doc_arrive_dt, 120) as d_doc_arrive_dt
		--, s.i_yyyy
		, s.i_yyyy_overlap
		, t.i_yyyy
                --, t.tor_id
        , s.sp_check_period_hdr_id 
from NMU_ERP.dbo.sp_check_period_hdr s
		inner join NMU_ERP.dbo.sp_tor_contract c on c.sp_tor_contract_id=s.sp_tor_contract_id
		inner join NMU_ERP.dbo.sp_tor t on t.tor_id=c.sp_tor_id
	where s.i_status_billing >= 4 
	and  s.i_yyyy > 2024 and s.i_enabled=1 
        and convert(varchar, s.d_update, 120) > '2024-10-01' 
        and isnull(s.po_working_hdr_id,0) = 0
	and DATEDIFF(day,convert(varchar, s.d_update, 120),GETDATE()) > 7
	AND NOT EXISTS (SELECT 1 FROM NMU_EIS.dbo.po_working_begin_hdr eis WHERE eis.po_id = s.sp_check_period_hdr_id)
	AND NOT EXISTS (SELECT 1 FROM NMU_EIS.dbo.po_working_hdr pwh WHERE pwh.po_working_hdr_id = s.sp_check_period_hdr_id  and pwh.i_enable = 1)
";

           $sqlMain = "select a.* from ({$sqlTempTable}) a " 
            . " WHERE a.row > ? and a.row <= ?";
           
        $stmt = $db->QueryParam($sqlMain, $arrParam);
        $i = $start + 1;
        while ($row = $db->Fetch($stmt)) {

            $temp = array(
                "no" => $i++,
                "id" => $row["tor_id"],
                "c_code" => $row["ap_code"],
                "c_name" => $row["c_name"],
                "sp_emp" => $row["sp_emp_name"],
                "day" => $row["diffDay"],
            );

            ${$root}[] = $temp;
        }
        break;
    case "grid5":

        ###########################################
        $root = "data";
        $data = array();
    
        $arrParam[] = $start;
        $arrParam[] = $limit;
        // $arrParam[] = $_REQUEST['dc_bg_budget_type_id'] ?? null;
        $sqlTempTable = "select  ROW_NUMBER() OVER(PARTITION BY e.sp_emp_id ORDER BY a.tor_id) AS Row
 , a.tor_id
 , convert(varchar,i.d_tor_status_date, 120) as d_tor_status_date
 , DATEDIFF(day , convert(varchar,i.d_tor_status_date, 120) , convert(varchar(10), GETDATE(), 120)) as diffDay
 , e.c_name as emp_name
 , a.c_code
 , c.c_code as c_contract_name
 , a.c_name as pr_name
 , a.tor_type_id
 , a.tor_status_id
 , isnull(c.i_contract_status,0) as i_contract_status
 , convert(varchar(10), GETDATE(), 120) as day_now 
 , (SELECT c_name from sp_type_status where sp_type_status_id = a.tor_type_id) as c_tor_type 
 , DATEDIFF(day, convert(varchar,i.d_tor_status_date, 120) , convert(varchar(10), GETDATE(), 120)) as diff1320
 , CASE
	WHEN a.tor_type_id = 1 
		AND a.i_type_contract = 1 
		AND DATEDIFF(day,convert(varchar,i.d_tor_status_date, 120), convert(varchar(10), GETDATE(), 120)) < 40
	THEN 1
	WHEN a.tor_type_id = 1 
		AND a.i_type_contract = 3 
		AND DATEDIFF(day,convert(varchar,i.d_tor_status_date, 120), convert(varchar(10), GETDATE(), 120)) < 40
	THEN 1
	WHEN a.tor_type_id = 3  
		AND a.i_type_contract = 3  
		AND DATEDIFF(day,convert(varchar,i.d_tor_status_date, 120), convert(varchar(10), GETDATE(), 120)) < 40
	THEN 1
	WHEN a.tor_type_id = 3 
		AND a.i_type_contract = 1  
		AND DATEDIFF(day,convert(varchar,i.d_tor_status_date, 120), convert(varchar(10), GETDATE(), 120)) < 40
	THEN 1
	WHEN a.tor_type_id = 1  
		AND a.i_type_contract = 2 
		AND DATEDIFF(day,convert(varchar,i.d_tor_status_date, 120), convert(varchar(10), GETDATE(), 120)) < 26
	THEN 1
	WHEN a.tor_type_id = 3  
		AND a.i_type_contract = 2 
		AND DATEDIFF(day,convert(varchar,i.d_tor_status_date, 120), convert(varchar(10), GETDATE(), 120)) < 26
	THEN 1	WHEN a.tor_type_id = 4 -- e bidding
		AND a.i_type_contract = 2 
		AND DATEDIFF(day,convert(varchar,i.d_tor_status_date, 120), convert(varchar(10), GETDATE(), 120)) < 61
	THEN 1
	WHEN a.tor_type_id = 4 -- e bidding
		AND a.i_type_contract = 1 
		AND DATEDIFF(day,convert(varchar,i.d_tor_status_date, 120), convert(varchar(10), GETDATE(), 120)) < 61
	THEN 1
    	WHEN a.tor_type_id = 4 -- e bidding
		AND a.i_type_contract = 3 
		AND DATEDIFF(day,convert(varchar,i.d_tor_status_date, 120), convert(varchar(10), GETDATE(), 120)) < 61
	THEN 1
	ELSE 0
	END AS Pass_status
 from sp_tor a
inner join sp_emp e on e.sp_emp_id=a.sp_emp_id
inner join sp_tor_contract c on c.sp_tor_id = a.tor_id 
inner join sp_tor_item i on i.tor_id = a.tor_id and i.sp_status_hdr_id = a.tor_status_id
where c.i_enabled = 1 and a.i_enabled = 1
AND isnull(c.c_code,'') = '' 
and isnull(a.c_code,'') != ''  
AND NOT EXISTS (SELECT tor_id FROM sp_tor_un_alert WHERE tor_id = a.tor_id)
--and isnull(c.i_contract_status,0) < 1
--AND convert(varchar,i.d_tor_status_date, 120) > '2022-10-01'
AND a.i_type_bg = 1 
AND (CASE
	WHEN a.tor_type_id = 1 
		AND a.i_type_contract = 1  
		AND DATEDIFF(day,convert(varchar,i.d_tor_status_date, 120), convert(varchar(10), GETDATE(), 120)) < 40
	THEN 1
	WHEN a.tor_type_id = 1  
		AND a.i_type_contract = 3 
		AND DATEDIFF(day,convert(varchar,i.d_tor_status_date, 120), convert(varchar(10), GETDATE(), 120)) < 40
	THEN 1
	WHEN a.tor_type_id = 3  
		AND a.i_type_contract = 3  
		AND DATEDIFF(day,convert(varchar,i.d_tor_status_date, 120), convert(varchar(10), GETDATE(), 120)) < 40
	THEN 1
	WHEN a.tor_type_id = 3 
		AND a.i_type_contract = 1  
		AND DATEDIFF(day,convert(varchar,i.d_tor_status_date, 120), convert(varchar(10), GETDATE(), 120)) < 40
	THEN 1
	WHEN a.tor_type_id = 1   
		AND a.i_type_contract = 2  
		AND DATEDIFF(day,convert(varchar,i.d_tor_status_date, 120), convert(varchar(10), GETDATE(), 120)) < 26
	THEN 1
	WHEN a.tor_type_id = 3  
		AND a.i_type_contract = 2  
		AND DATEDIFF(day,convert(varchar,i.d_tor_status_date, 120), convert(varchar(10), GETDATE(), 120)) < 26
	THEN 1 WHEN a.tor_type_id = 4 -- e bidding
		AND a.i_type_contract = 2  
		AND DATEDIFF(day,convert(varchar,i.d_tor_status_date, 120), convert(varchar(10), GETDATE(), 120)) < 61
	THEN 1
	WHEN a.tor_type_id = 4 -- e bidding
		AND a.i_type_contract = 1 
		AND DATEDIFF(day,convert(varchar,i.d_tor_status_date, 120), convert(varchar(10), GETDATE(), 120)) < 61
	THEN 1
    	WHEN a.tor_type_id = 4 -- e bidding
		AND a.i_type_contract = 3  
		AND DATEDIFF(day,convert(varchar,i.d_tor_status_date, 120), convert(varchar(10), GETDATE(), 120)) < 61
	THEN 1
	ELSE 0
	END) = 0 

group by a.tor_id
	,e.dc_department_id
	,e.sp_emp_id
	,e.c_name
	,a.c_code
	,a.c_name
	,tor_type_id
	,a.tor_type_id
	,a.f_total_amt
	,a.d_egp_date
	,c.d_doc_date
	,a.i_type_contract
	,a.tor_status_id
	,i.d_tor_status_date
	,c.i_contract_status
	,c.c_code
                ";
    $sqlMain = "select a.* from ({$sqlTempTable}) a " 
            . " WHERE a.row > ? and a.row <= ?";       
        //    echo $sqlMain;
        //    exit();
        $stmt = $db->QueryParam($sqlMain, $arrParam);
        $i = $start + 1;
        while ($row = $db->Fetch($stmt)) {

            $temp = array(
                "no" => $i++,
                "id" => $row["tor_id"],
                "c_code" => $row["c_code"],
                "c_name" => $row["pr_name"],
                "sp_emp" => $row["emp_name"],
                "day" => $row["diffDay"],
            );

            ${$root}[] = $temp;
        }
        break;
    case "grid6":

        ###########################################
        $root = "data";
        $data = array();
    
        $arrParam[] = $start;
        $arrParam[] = $limit;
        // $arrParam[] = $_REQUEST['dc_bg_budget_type_id'] ?? null;
        $sqlTempTable = "select row_number() over (order by DATEDIFF(day,convert(varchar, c.d_due_date, 120),GETDATE()) DESC) as row  
		, DATEDIFF(day,convert(varchar, c.d_due_date, 120),GETDATE()) AS diffDay  
				, convert(varchar,c.d_doc_date, 120) as d_start_date
		, convert(varchar,c.d_due_date, 120) as d_due_date
		, convert(varchar(10), GETDATE(), 120) as day_now
		, h.sp_tor_hdr_period_id
		, p.po_working_hdr_id
		, h.i_is_last 
		, t.tor_id, c.c_code,c.c_name

			, (select top 1 c_name from NMU_ERP.dbo.sp_emp where sp_emp_id=t.sp_emp_id) as sp_emp_name 
			, (select top 1 inv_name from nmu.dbo.dc_creditor where dc_creditor_id=c.dc_creditor_id) as dc_creditor_name 
		, c.i_is_close
		, c.i_is_complete
	 from NMU_ERP.dbo.sp_tor_contract c
	 inner join NMU_ERP.dbo.sp_tor t on t.tor_id=c.sp_tor_id
	 inner join NMU_ERP.dbo.sp_tor_hdr_period h on h.sp_tor_contract_id=c.sp_tor_contract_id
	 inner join NMU_ERP.dbo.sp_check_period_hdr p on p.sp_tor_hdr_period_id=h.sp_tor_hdr_period_id
	where c.i_enabled=1 and t.i_enabled=1 
	and convert(varchar(10),c.d_doc_date, 120) > '2024-10-01'  
	and p.po_working_hdr_id is null
	and DATEDIFF(day,c.d_due_date, convert(varchar,getDate() , 120)) >= (-15)  ";
        //    echo $sqlMain;
        //    exit();
    
       
   $sqlMain = "select a.* from ({$sqlTempTable}) a " 
            . " WHERE a.row > ? and a.row <= ?";
    
        $stmt = $db->QueryParam($sqlMain, $arrParam);
        $i = $start + 1;
        while ($row = $db->Fetch($stmt)) {

            $temp = array(
                "no" => $i++,
                "id" => $row["tor_id"],
                "c_code" => $row["c_code"],
                "c_name" => $row["c_name"],
                "sp_emp" => $row["sp_emp_name"],
                "day" => $row["diffDay"],
            );

            ${$root}[] = $temp;
        }
        break;
    case "grid7":

          ###########################################
        $root = "data";
        $data = array();
    
        $arrParam[] = $start;
        $arrParam[] = $limit;
        // $arrParam[] = $_REQUEST['dc_bg_budget_type_id'] ?? null;
        $sqlTempTable = "select row_number() over (order by DATEDIFF(day,convert(varchar, c.d_due_date, 120),GETDATE()) DESC) as row  
		, DATEDIFF(day,convert(varchar, c.d_due_date, 120),GETDATE()) AS diffDay  
				, convert(varchar,c.d_doc_date, 120) as d_start_date
		, convert(varchar,c.d_due_date, 120) as d_due_date
		, convert(varchar(10), GETDATE(), 120) as day_now
		, h.sp_tor_hdr_period_id
		, p.po_working_hdr_id
		, h.i_is_last 
		, t.tor_id, c.c_code,c.c_name

			, (select top 1 c_name from NMU_ERP.dbo.sp_emp where sp_emp_id=t.sp_emp_id) as sp_emp_name 
			, (select top 1 inv_name from nmu.dbo.dc_creditor where dc_creditor_id=c.dc_creditor_id) as dc_creditor_name 
		, c.i_is_close
		, c.i_is_complete
	 from NMU_ERP.dbo.sp_tor_contract c
	 inner join NMU_ERP.dbo.sp_tor t on t.tor_id=c.sp_tor_id
	 inner join NMU_ERP.dbo.sp_tor_hdr_period h on h.sp_tor_contract_id=c.sp_tor_contract_id
	 inner join NMU_ERP.dbo.sp_check_period_hdr p on p.sp_tor_hdr_period_id=h.sp_tor_hdr_period_id
	where c.i_enabled=1 and t.i_enabled=1 
	and convert(varchar(10),c.d_doc_date, 120) > '2024-10-01'  
	and p.po_working_hdr_id is null
	and DATEDIFF(day,c.d_due_date, convert(varchar,getDate() , 120)) >= (-5)  ";
        //    echo $sqlMain;
        //    exit();
    
       
   $sqlMain = "select a.* from ({$sqlTempTable}) a " 
            . " WHERE a.row > ? and a.row <= ?";
    
        $stmt = $db->QueryParam($sqlMain, $arrParam);
        $i = $start + 1;
        while ($row = $db->Fetch($stmt)) {

            $temp = array(
                "no" => $i++,
                "id" => $row["tor_id"],
                "c_code" => $row["c_code"],
                "c_name" => $row["c_name"],
                "sp_emp" => $row["sp_emp_name"],
                "day" => $row["diffDay"],
            );

            ${$root}[] = $temp;
        }
        break;
    case "grid8":

        ###########################################
        $root = "data";
        $data = array();
    
        $arrParam[] = $start;
        $arrParam[] = $limit;
        // $arrParam[] = $_REQUEST['dc_bg_budget_type_id'] ?? null;
        $sqlTempTable = "select row_number() over (order by DATEDIFF(day,convert(varchar, s.d_update, 120),GETDATE()) DESC) as row  
		, DATEDIFF(day,convert(varchar, s.d_update, 120),GETDATE()) AS diffDay 
		, s.c_code as ap_code,c.c_name
		, c.c_code as c_contract_code
		, (select top 1 c_name from NMU_ERP.dbo.sp_emp where sp_emp_id=t.sp_emp_id) as sp_emp_name 
        , (select top 1 inv_name from nmu.dbo.dc_creditor where dc_creditor_id=s.dc_creditor_id) as dc_creditor_name 
		, convert(varchar, s.d_update, 120) as d_reg_billing_date
		, convert(varchar(10), GETDATE(), 120) as day_now
		, s.f_total_add_vat_amt
		, convert(varchar, s.d_checking_date, 120) as d_checking_date
		--, s.dc_creditor_id
		--, c.dc_creditor_id
	    --, (select top 1 c_code_ref from NMU_EIS.dbo.po_working_hdr pwh where pwh.po_working_hdr_id = s.sp_check_period_hdr_id  and pwh.i_enable = 1) as c_code_ref    
        --, convert(varchar, s.d_arrive_date, 120) as d_arrive_date
        --, convert(varchar, s.d_doc_arrive_dt, 120) as d_doc_arrive_dt
		--, s.i_yyyy
		, s.i_yyyy_overlap
		, t.i_yyyy
                --, t.tor_id
        , s.sp_check_period_hdr_id 
from NMU_ERP.dbo.sp_check_period_hdr s
		inner join NMU_ERP.dbo.sp_tor_contract c on c.sp_tor_contract_id=s.sp_tor_contract_id
		inner join NMU_ERP.dbo.sp_tor t on t.tor_id=c.sp_tor_id
	where s.i_status_billing >= 4 
	and  s.i_yyyy > 2024 and s.i_enabled=1 
        and convert(varchar, s.d_update, 120) > '2024-10-01' 
        and isnull(s.po_working_hdr_id,0) = 0
	and DATEDIFF(day,convert(varchar, s.d_update, 120),GETDATE()) > 7
	AND NOT EXISTS (SELECT 1 FROM NMU_EIS.dbo.po_working_begin_hdr eis WHERE eis.po_id = s.sp_check_period_hdr_id)
	AND NOT EXISTS (SELECT 1 FROM NMU_EIS.dbo.po_working_hdr pwh WHERE pwh.po_working_hdr_id = s.sp_check_period_hdr_id  and pwh.i_enable = 1)
";

           $sqlMain = "select a.* from ({$sqlTempTable}) a " 
            . " WHERE a.row > ? and a.row <= ?";
           
        $stmt = $db->QueryParam($sqlMain, $arrParam);
        $i = $start + 1;
        while ($row = $db->Fetch($stmt)) {

            $temp = array(
                "no" => $i++,
                "id" => $row["tor_id"],
                "c_code" => $row["ap_code"],
                "c_name" => $row["c_name"],
                "sp_emp" => $row["sp_emp_name"],
                "day" => $row["diffDay"],
            );

            ${$root}[] = $temp;
        }
        break;
}

     $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
     $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
     echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
     exit();
    
