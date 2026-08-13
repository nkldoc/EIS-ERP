<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
include("../../lib/mon/mon.class.php");
include("./class/status.class.php");
 
###################
$db 	= new DatabaseServer();
$so	= new StatusOrder($db);
$mon 	= new mon(); // convert floatval
$date 	= new i_date();
$util	= new apiUtil();
 
############################################################################################################
$mode	= @$_REQUEST["mode"];
$filter = @$_REQUEST["filter"];
$value	= @$_REQUEST["value"];
$i_read	= @$_REQUEST["i_read"];
###################
$table	= "ar_so_hdr";
/* 	$tab 		="ar_onair_dtl";
	$key_fld	="ar_onair_dtl_id"; */
	
$root	= "data";
$data	= array();
###################
$limit 	= @$_REQUEST["limit"];
$dir 	= @$_REQUEST["dir"];
$sort 	= @$_REQUEST["sort"];
$start 	= @$_REQUEST["start"]; 
###################
if (!$util->get($start)) { 	$start 	= 0; }
if (!$util->get($limit)) { 	$limit 	= 20; }else{ $limit=($limit+$start); }
if (!$util->get($dir))	{       $dir 	= "DESC"; }
if (!$util->get($sort)) {  	$sort 	= "{$table}.dc_cnt_id"; }
###################
 
 if(isset($_REQUEST['mode']) && $_REQUEST['mode']=="GETDATA")
 {  
    $f1 = $db->GetDataBySQL("select * from ar_onair_hdr where ar_onair_hdr_id=?", array($_REQUEST['id'])); 
    
    $isBarter = $f1["i_is_barter"]==1?" and {$table}.i_is_barter = ?":" and {$table}.dc_comm_id = ?";
    
    $sqlTempTable = "select {$table}.dc_cnt_id   
                        ,(select top 1 c_name from dc_cnt where dc_cnt_id={$table}.dc_cnt_id) as c_cnt_name
                        ,(select top 1 c_code from dc_cnt where dc_cnt_id={$table}.dc_cnt_id) as c_cnt_code          
                        ,{$table}.i_enable 
                        , sum(b.f_total_cost) as sum_total_cost
                        , sum(b.f_disc_com_amt) as sum_disc_com
                        , sum(b.f_total_cost-b.f_disc_com_amt) as sum_net_disc_com
                        , sum(b.f_disc_cash_amt) as sum_disc_cash 
                        , sum(b.f_net_cost) as sum_net_cost 
                        
                    , ROW_NUMBER() OVER (ORDER BY {$sort} {$dir}) as row FROM {$table} "
                    . " inner join ar_so_dtl b on b.ar_so_hdr_id = {$table}.ar_so_hdr_id "
                    . " WHERE isnull(c_code,'0') !='0' "
                    . " and {$table}.onair_yyyy_mm =? "
                    . " and {$table}.i_is_commit=1 "
                    . " and {$table}.i_is_imc=0 "
                    . " and {$table}.i_class_type = 1"
                    . $isBarter 
                    . " and isnull({$table}.i_enable,2)= 1 "
                    . " and {$table}.ar_so_hdr_id not in (select ar_so_hdr_id from ar_onair_dtl_so where i_enable=1)"
                    . " group by {$table}.dc_cnt_id,{$table}.i_enable";

 
	$sqlMain = "select * from ({$sqlTempTable}) a "; 
                            
       	$arrParam[]         = $f1['onair_yyyy_mm'];
	$arrCountParam[]    = $f1['onair_yyyy_mm'];   
        
        if($f1["i_is_barter"]){
            $arrParam[]         = 1;
            $arrCountParam[]    = 1;            
        }else{
            $arrParam[]         = $f1['dc_comm_id'];
            $arrCountParam[]    = $f1['dc_comm_id'];
        }

//        echo $sqlTempTable;
//        print_r($arrParam);
//        exit;
        
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	$i = $start + 1;
 
	$f1 = null;$f2 = null;$f3 = null;$f4 = null;$f5 = null;$f6 = null;
 
	while($row =$db->Fetch($stmt))				
	{
//
        $radio = "" 
                . "<input type='hidden' name='dc_cnt_id[]' value='".$row["dc_cnt_id"]."'>"
                . "<label style='color:blue'><div><input type='radio' checked name='onairPro{$row["dc_cnt_id"]}' value='1' />ยืนยัน<label><div>"
                . "<label style='color:red'><div><input type='radio' name='onairPro{$row["dc_cnt_id"]}' value='0' />ไม่ยืนยัน<label><div>";

                           $temp = array("no" => ($i++),  
						"id"                => $row["dc_cnt_id"],
						"soDtlID"           =>(1)?$radio:'',   
                                                "txtdc_cnt_idID"    => $row["c_cnt_name"]?$row["c_cnt_code"]." ".$row["c_cnt_name"]:"", //frm
                                                "c_cnt_name"        => $row["c_cnt_name"]?$row["c_cnt_name"]:"[{$row["dc_cnt_id"]}]", //grid				
                                                "dc_cnt_id"         => $row["dc_cnt_id"], 
						"c_comment"         => '<textarea style="width:80%;" name="txtArea'.$row["dc_cnt_id"].'" rows="3" cols="10"></textarea>',    
						"i_enable"          => $row["i_enable"],
						"sum_total_cost"        => number_format($row["sum_total_cost"],2), 
						"sum_disc_com" 		=> number_format($row["sum_disc_com"],2), 
						"sum_net_disc_com"	=> number_format($row["sum_net_disc_com"],2),   
						"sum_disc_cash" 	=> number_format($row["sum_disc_cash"],2), 
						"sum_net_cost" 		=> number_format($row["sum_net_cost"],2)
					);
		${$root}[] = $temp;
		$f1 += $row["sum_total_cost"];
		$f2 += $row["sum_disc_com"];
		$f3 += $row["sum_net_disc_com"];
		$f4 += $row["sum_disc_cash"];
		$f5 += $row["sum_net_cost"];

	}
	
	${$root}[] = array("no" => ($i++), 
                            "id" 		=> 'grandTotal',
                            "c_cnt_name"        => "<div align='right'>รวม</div>",
                            "sum_total_cost"        => number_format($f1,2), 
                            "sum_disc_com"          => number_format($f2,2),  
                            "sum_net_disc_com"      => number_format($f3,2), 
                            "sum_disc_cash"         => number_format($f4,2), 
                            "sum_net_cost"          => number_format($f5,2) 
			);
        
	$sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
	$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);

	echo json_encode(array("debug"=>true,"totalCount"=>$totalCount,$root=>${$root}));
 
}else{
	echo "Invalid GETDATA";
}
?>                                                  