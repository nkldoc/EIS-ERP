<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
$db = new DatabaseServer();
$date = new i_date();
$mode = $_REQUEST["mode"] ?? null;
$table = "dbo.sp_tor";
/* * iceeedddee */
switch ($mode) {
    case "ReadFile" :
        //-------PUT---------
        //file_put_contents('D:/newfile.txt', 'run');
        //-------GET----
        $file = file_get_contents('D:/newfile.txt') ?? null; // bar
        //----------------------------
        $root = "data";
        $arr = array("aa", "bb");
        $totalCount = 0;
        $i = 0;
        ${$root} = null;
        if ($file == "run") { // newfile ==run
            foreach ($arr as $v) {
                $temp = array("no" => $i++);
                ${$root}[] = $temp;
            }
            $totalCount = $i;
            file_put_contents('D:/newfile.txt', 'clear');
        }

        echo json_encode(array("debug" => true, "totalCount" => $totalCount, "data" => ${$root}));
        exit();
        break;
    case "LIST" :
        $check = $_REQUEST['check'] ?? null;
        
     
      
            
                $modfy = $db->GetDataBySQL("select convert(varchar(20), last_user_update, 120) as last_user_update
                        ,convert(varchar(20), last_user_scan, 120) as last_user_scan 
                        ,convert(varchar(20), last_user_seek, 120) as last_user_seek
                        ,object_name(object_id) as OBJ_NAME
                        from sys.dm_db_index_usage_stats
                        where object_name(object_id)=?", array('sp_tor_hdr_period'));
                
                $lastRequest = $_REQUEST['lastModify']??null;   
                $last        = $modfy["last_user_update"]??null;  

                $last       = $last ?$last:'0000-00-00 00:00:00';
    
         
        if ($last == $lastRequest && $check == 'true') {
                echo json_encode(array("check"=>false,"batchCounter" => $last , "totalCount" => 0, "data" => null));
                exit();   
        } else {


            ###########################################
            $mode = $_REQUEST["mode"] ?? null;
            $filter = $_REQUEST["filter"] ?? null;
            $value = $_REQUEST["value"] ?? null;
            $i_read = $_REQUEST["i_read"] ?? null;

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
                $limit = 30;
            } else {
                $limit = ($limit + $start);
            }
            if (!get($dir)) {
                $dir = "DESC";
            }
            if (!get($sort)) {
                $sort = " s.c_code";
            }

            $arrParam = array();
            $arrCountParam = array();
            $con = null;
            $conDtl = null;
            $wh = null;
    //        
            $type = $_REQUEST["type"] ?? null;
            $act = $_REQUEST["act"] ?? null;
            $value = $_REQUEST["value"] ?? null;
            if ($type == "po_working_dtl") {

                //  
                $typeText = $_REQUEST['viewData']??null;
                //                $wh = " where isnull(c.i_parent,0) = 0  and c.d_doc_date between '2022-11-15' and convert(varchar(10), getdate(), 120)";
                // $wh = " where isnull(c.i_parent,0) = 0  and c.d_doc_date > '2022-10-01'";
                // if($typeText=='true'){

                    $wh .= " where sp_tor_id > 0 and a.c_code is not null ";
                // }else{
                    $wh .= null;
                // }
                // $wh = null;
                if ($act == "SEARCH") {
                    $type = $_REQUEST['TypeTxt']??null;
                    switch ($type) {
                        case 1 : $wh .= ($value != "") ? " and b.c_code like '%" . $value . "%' " : "";  break;
                        case 2: $wh .= ($value != "") ? " and b.c_name like '%" . $value . "%' " : "";  break;
                        case 3: $wh .= ($value != "") ? " and a.c_code like '%" . $value . "%' " : "";  break;
                        case 4: $wh .= ($value != "") ? " and a.d_doc_ref like '%" . $value . "%' " : "";  break;
                        case 5: $wh .= ($value != "") ? " and (select inv_name from nmu..dc_creditor where  dc_creditor_id =  b.dc_creditor_id ) like '%" . $value . "%' " : "";  break;
                        case 6: $wh .= " and b.sp_emp_id = ". $_SESSION['sp_emp_id'] ;  break;
                    }
                } else {
                    $wh .= "";
                }

                $i_yyyy = $_REQUEST["i_yyyy"] ?? null;
                if (!empty($i_yyyy)) {
                    $wh .= " and a.i_yyyy = " . intval($i_yyyy) . " ";
                }
                // สถานะรายการ: กำลังดำเนินการ (ยังไม่ส่งเบิกทางคลัง) / ส่งเบิกทางคลัง (ตรงกับ i_start ที่แสดงในกริด)
                $i_start_filter = $_REQUEST["i_start_filter"] ?? null;
                $whWithdrawExists = " EXISTS (
                        select 1 from sp_withdraw
                        where isnull(po_working_hdr_id,0) > 0
                        and sp_check_period_hdr_id = (
                            select top 1 isnull(sp_check_period_hdr_id,0) from sp_check_period_hdr
                            where sp_tor_hdr_period_id = (
                                select top 1 sp_tor_hdr_period_id from sp_tor_hdr_period
                                where sp_tor_contract_id = b.sp_tor_contract_id and i_is_last = 1
                            )
                        )
                    ) ";
                if ($i_start_filter == "1") {
                    $wh .= " and not " . $whWithdrawExists;
                } else if ($i_start_filter == "2") {
                    $wh .= " and " . $whWithdrawExists;
                }
    //
                $arrParam = array();
                $arrCountParam = array();
                $arrParam[] = $start;
                $arrParam[] = $limit;
    //
    //            

                $sqlMain = "SET NOCOUNT ON  
                select 
                ROW_NUMBER() OVER (ORDER BY b.sp_tor_contract_id DESC ) AS numrow ,
                a.tor_id ,
                b.sp_tor_contract_id  
                INTO #TemData
                from sp_Tor  a 
                inner join sp_tor_contract b on b.sp_Tor_id = a.tor_id 
                {$wh} 
                " 
// SELECT #TemData a
                . " SELECT 
                a.* ,
                isnull(b.c_code,0) as  pr_code,
                c.c_code ,
                isnull(b.c_name,c.c_name)as c_name ,
                c.f_total_amt,
                (select c_name from sp_emp where sp_emp_id = b.sp_emp_id) as sp_emp_name,
                (select top 1 c_code from dbo.sp_status_hdr where sp_status_hdr_id=b.tor_status_id)  as c_code_status ,
                (select sum(f_total) from sp_withdraw where sp_tor_contract_id = c.sp_tor_contract_id )as sum_f_total , 
                (select inv_name from nmu..dc_creditor where dc_creditor_id =  c.dc_creditor_id) as dc_creditor , 
                case when 
                (select isnull(po_working_hdr_id,0) from sp_withdraw where sp_check_period_hdr_id =
                (select top 1 isnull(sp_check_period_hdr_id,0) from sp_check_period_hdr where sp_tor_hdr_period_id = d.sp_tor_hdr_period_id  ) )
                > 0 then 'ส่งเบิกทางคลัง' else 'กำลังดำเนินการ' end as i_start  , 
                isnull(c.i_delivery,DATEDIFF(day , convert(varchar(10), c.d_doc_date , 120), convert(varchar(10),c.d_due_date, 120)))   as  i_delivery ,
                CONVERT(varchar,c.d_doc_date,120) as d_doc_date,
                CONVERT(varchar,c.d_due_date,120) as d_duc_date "
                . " FROM #TemData a "
                . " inner join NMU_ERP.dbo.sp_tor b on b.tor_id = a.tor_id" 
                . " inner join NMU_ERP.dbo.sp_tor_contract c on c.sp_tor_contract_id = a.sp_tor_contract_id" 
                . " left join NMU_ERP.dbo.sp_tor_hdr_period d on d.sp_tor_contract_id = c.sp_tor_contract_id and d.i_is_last = 1"
                // . " left join NMU_ERP.dbo.sp_withdraw w on w.sp_check_period_hdr_id = ch.sp_check_period_hdr_id "
                . " WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow ; "
                . " SELECT COUNT(*) AS rowCounts FROM #TemData;"
// DROPT
                . " DROP TABLE #TemData";  
                $stmt = $db->QueryParam($sqlMain, $arrParam);
                $i = $start + 1;
                $i_purchase = array(1 => 'ซื้อ', 2 => 'จ้าง', 3 => 'เช่า');

                while ($row = $db->Fetch($stmt)) {
                        
                    $temp = array(
                        "no"                    => $i++,
                        "id"                    => intval($row["tor_id"]),
                        "sp_tor_contract_id"    => intval($row["sp_tor_contract_id"]),
                        // "i_period"           => intval($row["i_period"]),
                        "DateDiffArrive"        => intval($row["i_delivery"]),
                        "f_total_amt"           => number_format($row["f_total_amt"], 2),
                        "sum_f_total"           => number_format($row["sum_f_total"], 2),

                        // "c_menu"             => $row["c_menu"], //c_menu contract_code c_arrive_code c_checking_code
                        "sp_emp_name"               => $row["sp_emp_name"],
                        "i_start"               => $row["i_start"],
                        "c_code_status"         => $row["c_code_status"],
                        "pr_code"               => $row["pr_code"],
                        "contract_code"         => $row["c_code"],
                        "dc_creditor"           => $row["dc_creditor"],
                        "c_name"                => $row["c_name"], 
                        // "withdraw_code"         => $row["withdraw_code"], 
                        "d_doc_date"            => @$row["d_doc_date"]?$date->extDateBuddha($row["d_doc_date"]):'',  
                        "d_duc_date"         => @$row["d_duc_date"]?$date->extDateBuddha($row["d_duc_date"]):'',  
                        // "d_arrive_date"         => @$row["d_arrive_date"]?$date->extDateBuddha($row["d_arrive_date"]):'',  
                        // "d_checking_date"       => @$row["d_checking_date"]?$date->extDateBuddha($row["d_checking_date"]):'',  
                        // "d_withdraw_date"       => @$row["d_withdraw_date"]?$date->extDateBuddha($row["d_withdraw_date"]):'',  
                    );
                    ${$root}[] = $temp;
                }

                $db -> NextResult ( $stmt ) ;
                $rowCounts = $db -> Fetch ( $stmt ) ;
                echo json_encode(array("check"=>true,"batchCounter" => $last, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
                exit();
            } else if ($type == "Period") {
                $typeText = $_REQUEST['viewData']??null;
                if($typeText=='true'){
                    $wh .= " and p.period_status_id <> 10040";
                }else{
                    $wh .= null;
                }
                // $wh = null;
                if ($act == "SEARCH") {
                    $type = $_REQUEST['TypeTxt']??null;
                    switch ($type) {
                        case 1 : $wh .= ($value != "") ? " and c.c_code like '%" . $value . "%' " : "";  break;
                        // case 2: $wh .= ($value != "") ? " and a.c_name like '%" . $value . "%' " : "";  break;
                        // case 3: $wh .= ($value != "") ? " and a.c_code like '%" . $value . "%' " : "";  break;
                        // case 4: $wh .= ($value != "") ? " and a.index_receive like '%" . $value . "%' " : "";  break;
                    }
                } else {
                    $wh .= "";
                }
                $arrParam = array();
                $arrCountParam = array();
                $arrParam[] = $_REQUEST['sp_tor_contract_id'];
                $arrParam[] = $start;
                $arrParam[] = $limit;
    //            
                $sqlMain = "SET NOCOUNT ON  
                                SELECT p.sp_tor_hdr_period_id 
                                        , p.i_period 
                                        , p.period_status_id 
                                        , c.c_code
                                        , c.sp_tor_contract_id
                                        , convert(varchar(10), c.d_due_date, 120) as d_due_date  
                                        , ROW_NUMBER() OVER (ORDER BY DATEDIFF(day, convert(varchar(10), getdate(), 120), convert(varchar(10),p.d_period_date, 120))) AS numrow
                                        INTO #TemData
                                        FROM NMU_ERP.dbo.sp_tor_contract c
                                        INNER JOIN NMU_ERP.dbo.sp_tor_hdr_period p on p.sp_tor_contract_id=c.sp_tor_contract_id  
                                        where c.sp_tor_contract_id =  ? " 
    // SELECT #TemData a
                                . " SELECT a.*"
                                . " , (select c_name from NMU_ERP.dbo.sp_status_hdr where sp_status_hdr_id = a.period_status_id ) as c_menu"
                                . " , ch.c_arrive_code
                                    , DATEDIFF(day, convert(varchar(10), getdate() , 120), convert(varchar(10),p.d_period_date, 120)) AS DateDiffArrive
                                    , convert(varchar(10), ch.d_arrive_date, 120) as d_arrive_date
                                    , p.c_contract_code as period_code
                                    , ch.c_code as c_checking_code
                                    , convert(varchar(10), ch.d_checking_date, 120) as d_checking_date  
                                    , p.i_period 
                                    , convert(varchar(10), p.d_doc_date, 120) as d_doc_date
                                    , convert(varchar(10), p.d_period_date, 120) as d_period_date
                                    , w.c_code_ref as withdraw_code
                                    , convert(varchar(10), w.d_doc_date, 120) as d_withdraw_date  
                                "
                                . " FROM #TemData a "
                                . " inner join NMU_ERP.dbo.sp_tor_hdr_period p on p.sp_tor_hdr_period_id=a.sp_tor_hdr_period_id " 
                                . " left join NMU_ERP.dbo.sp_check_period_hdr ch on ch.sp_tor_hdr_period_id = p.sp_tor_hdr_period_id "
                                . " left join NMU_ERP.dbo.sp_withdraw w on w.sp_check_period_hdr_id = ch.sp_check_period_hdr_id "
                                . " WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow; "
                                . " SELECT COUNT(*) AS rowCounts FROM #TemData;"
    // DROPT
                                . " DROP TABLE #TemData";  
//                        
//                echo $sqlMain;
//                exit;
                
                $stmt = $db->QueryParam($sqlMain, $arrParam);
                
                $i = $start + 1;
                $i_purchase = array(1 => 'ซื้อ', 2 => 'จ้าง', 3 => 'เช่า');

                while ($row = $db->Fetch($stmt)) {
                        
                    $temp = array(
                        "no"                    => $i++,
                        "id"                    => intval($row["sp_tor_hdr_period_id"]),
                        "i_period"              => intval($row["i_period"]),
                        "DateDiffArrive"              => intval($row["DateDiffArrive"]),
                        "c_menu"                => $row["c_menu"], //c_menu contract_code c_arrive_code c_checking_code
                        "period_code"           => $row["period_code"],
                        "contract_code"         => $row["c_code"],
                        "c_arrive_code"         => $row["c_arrive_code"],
                        "c_checking_code"       => $row["c_checking_code"], 
                        "withdraw_code"         => $row["withdraw_code"], 
                        "d_due_date"            => @$row["d_due_date"]?$date->extDateBuddha($row["d_due_date"]):'',  
                        "d_period_date"         => @$row["d_period_date"]?$date->extDateBuddha($row["d_period_date"]):'',  
                        "d_arrive_date"         => @$row["d_arrive_date"]?$date->extDateBuddha($row["d_arrive_date"]):'',  
                        "d_checking_date"       => @$row["d_checking_date"]?$date->extDateBuddha($row["d_checking_date"]):'',  
                        "d_withdraw_date"       => @$row["d_withdraw_date"]?$date->extDateBuddha($row["d_withdraw_date"]):'',  
                    );
                    ${$root}[] = $temp;
                }

                $db -> NextResult ( $stmt ) ;
                $rowCounts = $db -> Fetch ( $stmt ) ;
                echo json_encode(array("check"=>true,"batchCounter" => $last, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
                exit();
            }
        }//End check update
}
