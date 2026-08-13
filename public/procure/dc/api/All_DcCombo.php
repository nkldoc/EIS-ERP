<?php

 include("../../conf/config.php");
 include("../../lib/database/DatabaseServer.php");
 include("../../lib/database/apiUtil.php");
 include("../../lib/date/i_date.class.php");
 include("../../lib/mon/mon.class.php");
 include("../conf/configDc.php");
 include("../../gl/conf/configGl.php");


 $db = new DatabaseServer();
 $date = new i_date();
 $util = new apiUtil();
 $mon = new mon(); // convert floatval
############################################################################################################
 $mode = @$_REQUEST["mode"];
 $filter = @$_REQUEST["filter"];
 $value = @$_REQUEST["value"];
 $i_read = @$_REQUEST["i_read"];

###################
 $limit = @$_REQUEST["limit"];
 $dir = @$_REQUEST["dir"];
 $sort = @$_REQUEST["sort"];
 $start = @$_REQUEST["start"];
###################
 if (!$util->get($start)) {
     $start = 0;
 }
 if (!$util->get($limit)) {
     $limit = 15;
 } else {
     $limit = ($limit + $start);
 }
 if (!$util->get($dir)) {
     $dir = "ASC";
 }
 if (!$util->get($sort)) {
     $sort = "c_code";
 }
###################
 $root = "data";
 $debug = '';
 $totalCount = 0;

 function get($a) {
     return isset($a) && !empty($a) ? $a : null;
 }

 if ($_REQUEST['type'] == 'storeSpCombo') {
     $start = 0;
     $limit = 500;
     $table = "dbo.dc_emp";
     $root = "data";
     $data = array();
     $sqlTempTable = "select aa.dc_emp_id
                        , aa.c_code
                        , aa.c_name
                        , (select sp_emp_id from dbo.sp_emp where dc_emp_id = aa.dc_emp_id) as sp_emp_id
                        , ROW_NUMBER() OVER (ORDER BY $sort $dir) as row FROM {$table} aa
                    where aa.dc_cost_id=" . SUPPLIES_ID . " and ISNULL(aa.i_enable," . STATUS_DISABLE . ") = ?";

     if ($mode == "SEARCH") {
         if (isset($value) && $value != "") {
             $sqlTempTable .= " and " . $filter . " like ?";
         }
         $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
         $arrParam = array(STATUS_ENABLE, "%{$value}%", $start, $limit);
         $arrCountParam = array(STATUS_ENABLE, "%{$value}%");
     } else {
         $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
         $arrParam = array(STATUS_ENABLE, $start, $limit);
         $arrCountParam = array(STATUS_ENABLE);
     }
//     echo ($sqlMain);
//     print_r($arrParam);
//     exit;
     $stmt = $db->QueryParam($sqlMain, $arrParam);
     $i = $start + 1;
     while ($row = $db->Fetch($stmt)) {
         $temp = array("no" => ($i++),
             "id" => $row["dc_emp_id"],
             "c_code" => $row["c_code"],
             "c_name" => $row["c_code"] . " " . $row["c_name"]
         );
         ${$root}[] = $temp;
     }
     $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
     $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
     $debug = 'storeExpenseVisionNet >>>';
 } else if ($_REQUEST['type'] == 'storeDepartment') {
     ###################
     $table = "dbo.dc_emp";
     $root = "data";
     $data = array();
     $dc_department_type_id = $_REQUEST['dc_department_type_id'] ?? null;
     $sqlTempTable = "select a.dc_emp_id
		, a.c_code
		, a.c_name
                , isnull(b.dc_department_id,0) as dc_department_id
                , isnull(b.c_department,'') as c_department
                , isnull(b.i_level,0) as i_level
                , isnull(b.i_parent,0) as i_parent
		, ROW_NUMBER() OVER (ORDER BY $sort $dir) as row FROM {$table} a
                    inner join dbo.sp_emp b on b.dc_emp_id = a.dc_emp_id

		where b.dc_department_type_id =" . $dc_department_type_id . " and dc_cost_id=" . SUPPLIES_ID . " and ISNULL(a.i_enable," . STATUS_ENABLE . ") = ?"; //SUPPLIES_ID 38

     if ($mode == "SEARCH") {
         if (isset($value) && $value != "") {
             $sqlTempTable .= " and " . $filter . " like ?";
         }
         $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
         $arrParam = array(STATUS_ENABLE, "%{$value}%", $start, $limit);
         $arrCountParam = array(STATUS_ENABLE, "%{$value}%");
     } else {
         $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
         $arrParam = array(STATUS_ENABLE, $start, $limit);
         $arrCountParam = array(STATUS_ENABLE);
     }

     $stmt = $db->QueryParam($sqlMain, $arrParam);
     $i = $start + 1;

     if (isset($_REQUEST['all'])) {
         ${$root}[] = array("no" => 0,
             "id" => -1,
             "c_code" => "",
             "c_name" => "ทั้งหมด"
         );
     }
     while ($row = $db->Fetch($stmt)) {
         $temp = array("no" => ($i++),
             "id" => intval($row["dc_emp_id"]),
             "c_code" => $row["c_code"],
             "i_level" => intval($row["i_level"]),
             "i_parent" => intval($row["i_parent"]),
             "dc_dempartment_type_id" => intval($row["dc_dempartment_type_id"]),
             "dc_dempartment_id" => intval($row["dc_dempartment_id"]),
             "c_department" => $row["c_department"],
             "c_name" => $row["c_name"] . " || " . $row["c_department"]
         );
         ${$root}[] = $temp;
     }
     $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
     $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
     $debug = 'storeDepartment >>>';
 } else if ($_REQUEST['type'] == 'storeCost') {
     ###################
     $table = "vw_dc_cost";
     $root = "data";
     $data = array();

     $sqlTempTable = "select dc_cost_id
		, c_code
		, c_name
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_create_id) as c_create_name
		,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_create_cost_id) as c_cost_creat_name
		, convert(varchar, d_create, 120) as d_create
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_update_id) as c_update_name
		,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_update_cost_id) as c_cost_update_name
		, convert(varchar, [d_update], 120) as d_update
		, ROW_NUMBER() OVER (ORDER BY $sort $dir) as row FROM {$table}
		where i_last = 1 and ISNULL(i_delete," . DELETE_FALSE . ") = ?";

     if ($mode == "SEARCH") {
         if (isset($value) && $value != "") {
             $sqlTempTable .= " and " . $filter . " like ?";
         }
         $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
         $arrParam = array(DELETE_FALSE, "%{$value}%", $start, $limit);
         $arrCountParam = array(DELETE_FALSE, "%{$value}%");
     } else {
         $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
         $arrParam = array(DELETE_FALSE, $start, $limit);
         $arrCountParam = array(DELETE_FALSE);
     }

     $stmt = $db->QueryParam($sqlMain, $arrParam);
     $i = $start + 1;

     if (isset($_REQUEST['all'])) {
         ${$root}[] = array("no" => 0,
             "id" => -1,
             "c_code" => "",
             "c_name" => "ทั้งหมด"
         );
     }
     while ($row = $db->Fetch($stmt)) {
         $temp = array("no" => ($i++),
             "id" => $row["dc_cost_id"],
             "c_code" => $row["c_code"],
             "c_name" => $row["c_name"]
         );
         ${$root}[] = $temp;
     }
     $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
     $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
     $debug = 'storeCost >>>';
 } else if ($_REQUEST['type'] == 'storeUnitType') { //select * from //dc_vat where end_date is null and i_enabled='1'
     $sqlMain = "select dc_unit_type_id
                        , c_code
                        , c_name
                from vw_dc_unit_type
                where isnull(i_enable," . STATUS_DISABLE . ") = ?
                order by c_name
                ";
     $arrParam = array(STATUS_ENABLE);
     $stmt = $db->QueryParam($sqlMain, $arrParam);
     $i = 0;
     if ($stmt) {
         while ($row = $db->Fetch($stmt)) {
             $i++;
             $temp = array("id" => $row["dc_unit_type_id"]
                 , "c_code" => $row["c_code"]
                 , "c_name" => $row["c_name"]
             );
             ${$root}[] = $temp;
         }
     }
     $totalCount = $i;
     $debug = 'storeUnitType >>>';
 } else if ($_REQUEST['type'] == 'storeAcc') {

     $table = "vw_dc_acc";
     $root = "data";
     $data = array();
     $sqlTempTable = "select dc_acc_id
                        , c_code
                        , c_name
                        ,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_create_id) as c_create_name
                        ,(select top 1 c_name from dc_acc where dc_acc_id={$table}.dc_user_create_cost_id) as c_cost_creat_name
                        , convert(varchar, d_create, 120) as d_create
                        ,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_update_id) as c_update_name
                        ,(select top 1 c_name from dc_acc where dc_acc_id={$table}.dc_user_update_cost_id) as c_cost_update_name
                        , convert(varchar, [d_update], 120) as d_update
                        , ROW_NUMBER() OVER (ORDER BY $sort $dir) as row FROM {$table}
                    where i_last=? and ISNULL(i_enable," . STATUS_DISABLE . ") = ?";

     if ($mode == "SEARCH") {
         if (isset($value) && $value != "") {
             $sqlTempTable .= " and " . $filter . " like ?";
         }
         $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
         $arrParam = array(DC_LAST_YES, STATUS_ENABLE, "%{$value}%", $start, $limit);
         $arrCountParam = array(DC_LAST_YES, STATUS_ENABLE, "%{$value}%");
     } else {
         $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
         $arrParam = array(DC_LAST_YES, STATUS_ENABLE, $start, $limit);
         $arrCountParam = array(DC_LAST_YES, STATUS_ENABLE);
     }

     $stmt = $db->QueryParam($sqlMain, $arrParam);
     $i = $start + 1;
     while ($row = $db->Fetch($stmt)) {
         $temp = array("no" => ($i++),
             "id" => $row["dc_acc_id"],
             "c_code" => $row["c_code"],
             "c_name" => $row["c_name"]
         );
         ${$root}[] = $temp;
     }
     $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
     $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
     $debug = 'storeAcc >>>';
 } else if ($_REQUEST['type'] == 'storeAccExpense') {
     $table = "vw_dc_acc";
     $root = "data";
     $data = array();
     $sqlTempTable = "select dc_acc_id
                        , c_code
                        , c_name
                        ,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_create_id) as c_create_name
                        ,(select top 1 c_name from dc_acc where dc_acc_id={$table}.dc_user_create_cost_id) as c_cost_creat_name
                        , convert(varchar, d_create, 120) as d_create
                        ,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_update_id) as c_update_name
                        ,(select top 1 c_name from dc_acc where dc_acc_id={$table}.dc_user_update_cost_id) as c_cost_update_name
                        , convert(varchar, [d_update], 120) as d_update
                        , ROW_NUMBER() OVER (ORDER BY $sort $dir) as row FROM {$table}
                    where i_last=? and ISNULL(i_enable," . STATUS_DISABLE . ") = ? and i_group=?";

     if ($mode == "SEARCH") {
         if (isset($value) && $value != "") {
             $sqlTempTable .= " and " . $filter . " like ?";
         }
         $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
         $arrParam = array(DC_LAST_YES, STATUS_ENABLE, GL_ACC_GROUP5_EXPENSE, "%{$value}%", $start, $limit);
         $arrCountParam = array(DC_LAST_YES, STATUS_ENABLE, GL_ACC_GROUP5_EXPENSE, "%{$value}%");
     } else {
         $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
         $arrParam = array(DC_LAST_YES, STATUS_ENABLE, GL_ACC_GROUP5_EXPENSE, $start, $limit);
         $arrCountParam = array(DC_LAST_YES, STATUS_ENABLE, GL_ACC_GROUP5_EXPENSE);
     }

     $stmt = $db->QueryParam($sqlMain, $arrParam);
     $i = $start + 1;
     while ($row = $db->Fetch($stmt)) {
         $temp = array("no" => ($i++),
             "id" => $row["dc_acc_id"],
             "c_code" => $row["c_code"],
             "c_name" => $row["c_name"]
         );
         ${$root}[] = $temp;
     }
     $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
     $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
     $debug = 'storeAccExpense >>>';
 } else if ($_REQUEST['type'] == 'storeTitle') { //select * from //dc_vat where end_date is null and i_enabled='1'
     $sqlMain = "select dc_title_id
                    , c_name
                from vw_dc_title
                where isnull(i_enable," . STATUS_DISABLE . ") = ?
                order by c_name
                ";
     $arrParam = array(STATUS_ENABLE);
     $stmt = $db->QueryParam($sqlMain, $arrParam);
     $i = 0;
     if ($stmt) {
         while ($row = $db->Fetch($stmt)) {
             $i++;
             $temp = array("id" => $row["dc_title_id"]
                 , "c_name" => $row["c_name"]
             );
             ${$root}[] = $temp;
         }
     }
     $totalCount = $i;
     $debug = 'storeTitle >>>';
 } else if ($_REQUEST['type'] == 'storeProductGroup') {

     $table = "vw_dc_product_group";
     $root = "data";
     $data = array();
     $sqlTempTable = "select dc_product_group_id
                        , c_code
                        , c_name
                        , ROW_NUMBER() OVER (ORDER BY $sort $dir) as row FROM {$table}
                    where ISNULL(i_enable," . STATUS_DISABLE . ") = ?";

     if ($mode == "SEARCH") {
         if (isset($value) && $value != "") {
             $sqlTempTable .= " and " . $filter . " like ?";
         }
         $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
         $arrParam = array(STATUS_ENABLE, "%{$value}%", $start, $limit);
         $arrCountParam = array(STATUS_ENABLE, "%{$value}%");
     } else {
         $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
         $arrParam = array(STATUS_ENABLE, $start, $limit);
         $arrCountParam = array(STATUS_ENABLE);
     }

     $stmt = $db->QueryParam($sqlMain, $arrParam);
     $i = $start + 1;
     while ($row = $db->Fetch($stmt)) {
         $temp = array("no" => ($i++),
             "id" => $row["dc_product_group_id"],
             "c_code" => $row["c_code"],
             "c_name" => $row["c_name"]
         );
         ${$root}[] = $temp;
     }
     $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
     $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
     $debug = 'storeProductGroup >>>';
 } else if ($_REQUEST['type'] == 'storeTaxCustomer') {

     $table = "vw_dc_tax_customer";
     $root = "data";
     $sort = "c_name";
     $data = array();
     $sqlTempTable = "select dc_tax_customer_id
                        , c_name
                        , ROW_NUMBER() OVER (ORDER BY $sort $dir) as row FROM {$table}
                    where ISNULL(i_enable," . STATUS_DISABLE . ") = ?";

     if ($mode == "SEARCH") {
         if (isset($value) && $value != "") {
             $sqlTempTable .= " and " . $filter . " like ?";
         }
         $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
         $arrParam = array(STATUS_ENABLE, "%{$value}%", $start, $limit);
         $arrCountParam = array(STATUS_ENABLE, "%{$value}%");
     } else {
         $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
         $arrParam = array(STATUS_ENABLE, $start, $limit);
         $arrCountParam = array(STATUS_ENABLE);
     }

     $stmt = $db->QueryParam($sqlMain, $arrParam);
     $i = $start + 1;
     while ($row = $db->Fetch($stmt)) {
         $temp = array("no" => ($i++),
             "id" => $row["dc_tax_customer_id"],
             "c_name" => $row["c_name"]
         );
         ${$root}[] = $temp;
     }
     $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
     $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
     $debug = 'storeTaxCustomer >>>';
 } else if ($_REQUEST['type'] == 'storeDebtorType') {

     $table = "vw_dc_debtor_type";
     $root = "data";
     $sort = "c_name";
     $data = array();
     $sqlTempTable = "select dc_debtor_type_id
                        , c_code
                        , c_name
                        , ROW_NUMBER() OVER (ORDER BY $sort $dir) as row FROM {$table}
                    where ISNULL(i_enable," . STATUS_DISABLE . ") = ?";

     if ($mode == "SEARCH") {
         if (isset($value) && $value != "") {
             $sqlTempTable .= " and " . $filter . " like ?";
         }
         $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
         $arrParam = array(STATUS_ENABLE, "%{$value}%", $start, $limit);
         $arrCountParam = array(STATUS_ENABLE, "%{$value}%");
     } else {
         $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
         $arrParam = array(STATUS_ENABLE, $start, $limit);
         $arrCountParam = array(STATUS_ENABLE);
     }

     $stmt = $db->QueryParam($sqlMain, $arrParam);
     $i = $start + 1;
     while ($row = $db->Fetch($stmt)) {
         $temp = array("no" => ($i++),
             "id" => $row["dc_debtor_type_id"],
             "c_code" => $row["c_code"],
             "c_name" => $row["c_name"]
         );
         ${$root}[] = $temp;
     }
     $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
     $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
     $debug = 'storeDebtorType >>>';
 } else if ($_REQUEST['type'] == 'storeExpenseGroup') {

     $table = "vw_dc_expense_group";
     $root = "data";
     $data = array();
     $sqlTempTable = "select dc_expense_group_id
                        , c_code
                        , c_name
                        , ROW_NUMBER() OVER (ORDER BY $sort $dir) as row FROM {$table}
                    where ISNULL(i_enable," . STATUS_DISABLE . ") = ?";

     if ($mode == "SEARCH") {
         if (isset($value) && $value != "") {
             $sqlTempTable .= " and " . $filter . " like ?";
         }
         $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
         $arrParam = array(STATUS_ENABLE, "%{$value}%", $start, $limit);
         $arrCountParam = array(STATUS_ENABLE, "%{$value}%");
     } else {
         $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
         $arrParam = array(STATUS_ENABLE, $start, $limit);
         $arrCountParam = array(STATUS_ENABLE);
     }

     $stmt = $db->QueryParam($sqlMain, $arrParam);
     $i = $start + 1;
     while ($row = $db->Fetch($stmt)) {
         $temp = array("no" => ($i++),
             "id" => $row["dc_expense_group_id"],
             "c_code" => $row["c_code"],
             "c_name" => $row["c_name"]
         );
         ${$root}[] = $temp;
     }
     $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
     $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
     $debug = 'storeExpenseGroup >>>';
 } else if ($_REQUEST['type'] == 'storeExpenseGroupVisionNet') {

     $table = "vw_dc_expense_group_vsn";
     $root = "data";
     $data = array();
     $sqlTempTable = "select dc_expense_group_vsn_id
                        , c_code
                        , c_name
                        , ROW_NUMBER() OVER (ORDER BY $sort $dir) as row FROM {$table}
                    where ISNULL(i_enable," . STATUS_DISABLE . ") = ?";

     if ($mode == "SEARCH") {
         if (isset($value) && $value != "") {
             $sqlTempTable .= " and " . $filter . " like ?";
         }
         $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
         $arrParam = array(STATUS_ENABLE, "%{$value}%", $start, $limit);
         $arrCountParam = array(STATUS_ENABLE, "%{$value}%");
     } else {
         $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
         $arrParam = array(STATUS_ENABLE, $start, $limit);
         $arrCountParam = array(STATUS_ENABLE);
     }

     $stmt = $db->QueryParam($sqlMain, $arrParam);
     $i = $start + 1;
     while ($row = $db->Fetch($stmt)) {
         $temp = array("no" => ($i++),
             "id" => $row["dc_expense_group_vsn_id"],
             "c_code" => $row["c_code"],
             "c_name" => $row["c_name"]
         );
         ${$root}[] = $temp;
     }
     $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
     $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
     $debug = 'storeExpenseGroupVisionNet >>>';
 } else if ($_REQUEST['type'] == 'storeExpenseVisionNet') {

     $table = "vw_dc_expense_vsn";
     $root = "data";
     $data = array();
     $sqlTempTable = "select dc_expense_vsn_id
                        , c_code
                        , c_name
                        , ROW_NUMBER() OVER (ORDER BY $sort $dir) as row FROM {$table}
                    where ISNULL(i_enable," . STATUS_DISABLE . ") = ?";

     if ($mode == "SEARCH") {
         if (isset($value) && $value != "") {
             $sqlTempTable .= " and " . $filter . " like ?";
         }
         $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
         $arrParam = array(STATUS_ENABLE, "%{$value}%", $start, $limit);
         $arrCountParam = array(STATUS_ENABLE, "%{$value}%");
     } else {
         $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
         $arrParam = array(STATUS_ENABLE, $start, $limit);
         $arrCountParam = array(STATUS_ENABLE);
     }

     $stmt = $db->QueryParam($sqlMain, $arrParam);
     $i = $start + 1;
     while ($row = $db->Fetch($stmt)) {
         $temp = array("no" => ($i++),
             "id" => $row["dc_expense_vsn_id"],
             "c_code" => $row["c_code"],
             "c_name" => $row["c_name"]
         );
         ${$root}[] = $temp;
     }
     $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
     $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
     $debug = 'storeExpenseVisionNet >>>';
 } else if ($_REQUEST['type'] == 'storeExpenseSubGroupEPHIS') {

     $table = "vw_dc_expense_sub_group";
     $root = "data";
     $data = array();
     $sqlTempTable = "select dc_expense_sub_group_id
                        , c_code
                        , c_name
                        , ROW_NUMBER() OVER (ORDER BY $sort $dir) as row FROM {$table}
                    where ISNULL(i_enable," . STATUS_DISABLE . ") = ?";

     if ($mode == "SEARCH") {
         if (isset($value) && $value != "") {
             $sqlTempTable .= " and " . $filter . " like ?";
         }
         $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
         $arrParam = array(STATUS_ENABLE, "%{$value}%", $start, $limit);
         $arrCountParam = array(STATUS_ENABLE, "%{$value}%");
     } else {
         $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
         $arrParam = array(STATUS_ENABLE, $start, $limit);
         $arrCountParam = array(STATUS_ENABLE);
     }

     $stmt = $db->QueryParam($sqlMain, $arrParam);
     $i = $start + 1;
     while ($row = $db->Fetch($stmt)) {
         $temp = array("no" => ($i++),
             "id" => $row["dc_expense_sub_group_id"],
             "c_code" => $row["c_code"],
             "c_name" => $row["c_name"]
         );
         ${$root}[] = $temp;
     }
     $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
     $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
     $debug = 'storeExpenseSubGroupEPHIS >>>';
 } else if ($_REQUEST['type'] == 'storeBankAccCompany') {

     $table = "vw_dc_bank_acc_company_full";
     $root = "data";
     $data = array();
     $sqlTempTable = "select dc_bank_acc_company_id
						, c_bank_name
						, c_code
						, c_name
						, c_type_name
                        , ROW_NUMBER() OVER (ORDER BY c_bank_name ASC, c_code ASC) as row FROM {$table}
                    where ISNULL(i_delete," . DELETE_FALSE . ") = ?";

     if ($mode == "SEARCH") {
         if (isset($value) && $value != "") {
             $sqlTempTable .= " and " . $filter . " like ?";
         }
         $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
         $arrParam = array(DELETE_FALSE, "%{$value}%", $start, $limit);
         $arrCountParam = array(DELETE_FALSE, "%{$value}%");
     } else {
         $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
         $arrParam = array(DELETE_FALSE, $start, $limit);
         $arrCountParam = array(DELETE_FALSE);
     }

     $stmt = $db->QueryParam($sqlMain, $arrParam);
     $i = $start + 1;
     while ($row = $db->Fetch($stmt)) {
         $temp = array("no" => ($i++),
             "id" => $row["dc_bank_acc_company_id"],
             "c_bank_name" => $row["c_bank_name"],
             "c_code" => $row["c_code"],
             "c_name" => $row["c_name"],
             "c_type_name" => $row["c_type_name"]
         );
         ${$root}[] = $temp;
     }
     $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
     $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
     $debug = 'storeAcc >>>';
 }
 //storeCoppyPeriod
 echo json_encode(array("success" => true, "debug" => $debug, "totalCount" => $totalCount, $root => (isset(${$root}) && ${$root} != null) ? ${$root} : ''));
 exit;
?>