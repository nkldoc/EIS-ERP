<?php
 
include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");

###################
$db     = new DatabaseServer();
$date   = new i_date();
$util   = new apiUtil();
############################################################################################################
        $mode =$_REQUEST["mode"] ?? null;
        $filter =$_REQUEST["filter"] ?? null;
        $value =$_REQUEST["value"] ?? null;
        $i_read =$_REQUEST["i_read"] ?? null;
        ###################
        $root = "data";
        $data = array();
        ###################
        $limit =$_REQUEST["limit"] ?? null;
        $dir =$_REQUEST["dir"] ?? null;
        $sort =$_REQUEST["sort"] ?? null;
        $start =$_REQUEST["start"] ?? null;

        function get($a) {
            return $a ?? 0;
        }

        if (!get($start)) {
            $start = 0;
        }
        if (!get($limit)) {
            $limit = 20;
        } else {
            $limit = ($limit + $start);
        }
        if (!get($dir)) {
            $dir = "DESC";
        }
        if (!get($sort)) {
            $sort = " s.c_code";
        }
        $keyin = "";
        $arrParam = array();
        $arrCountParam = array();

        $sqlTempTable = "SELECT
                            ROW_NUMBER() OVER (ORDER BY a.d_create DESC) AS row
                            ,a.dc_creditor_id
                        FROM NMU.dbo.dc_creditor a
                        WHERE exists (select 1 from dbo.sp_check_period_hdr where dc_creditor_id=a.dc_creditor_id)
                        and a.i_enable = 1 AND a.i_delete = 2 and a.i_key in(1) 
            ";
        if ($mode == "SEARCH") {
            if ($filter && $filter !== "") {
                if ($filter === "c_tax_number_imp")
                    $sqlTempTable .= " and c_tax_number_imp like ?";
                else if ($filter === "c_name")
                    $sqlTempTable .= " and c_name like ?";
                $arrParam[] = "%{$value}%";
                $arrCountParam[] = "%{$value}%";
            }
        }

        $arrParam[] = $start;
        $arrParam[] = $limit;

        $sqlMain = "SELECT a.dc_creditor_id
                        ,isnull(s.c_tax_number_imp,'') as c_tax_number_imp
                        ,s.inv_name
                        ,s.c_addr_imp3 
                        
                    FROM ({$sqlTempTable}) a
                    INNER JOIN NMU.dbo.dc_creditor s ON a.dc_creditor_id = s.dc_creditor_id
                    WHERE a.row > ? AND a.row <= ?";
                    
        
//         if ($mode == "SEARCH") {
//                    echo $sqlMain;
//                    print_r($arrParam);
//                    exit();
//         }
        $stmt = $db->QueryParam($sqlMain, $arrParam);
        $i = $start + 1;
         ${$root}[] = array(
                "no" => $i,
                "dc_creditor_id" => 0,
                "c_tax_number_imp" => '00000000000',
                "c_name" => "<<--- ไม่เลือก ---->>",
            );
        while ($row = $db->Fetch($stmt)) {
            
            $temp = array(
                "no" => $i++,
                "dc_creditor_id" => $row["dc_creditor_id"],
                "c_tax_number_imp" => $row["c_tax_number_imp"],
                "c_address" => $row["c_addr_imp3"],
                "c_name" => $row["inv_name"],
            );
           
            ${$root}[] = $temp;
        }
        $sqlCount = "SELECT COUNT(*) AS totalCount FROM ({$sqlTempTable}) a";
        $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
        echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
        exit;
  
