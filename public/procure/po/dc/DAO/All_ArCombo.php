<?php
	include("../../../conf/config.php");
	include("../../../lib/database/DatabaseServer.php");
	include("../../../lib/database/apiUtil.php");
	include("../../../lib/date/i_date.class.php");
	include("../../../lib/mon/mon.class.php");
 
	
	$db = new DatabaseServer();
	$date 	= new i_date();
	$util	= new apiUtil();
	$mon 	= new mon(); // convert floatval
	############################################################################################################
	$mode	= @$_REQUEST["mode"];
	$filter = @$_REQUEST["filter"];
	$value	= @$_REQUEST["value"];
	$i_read	= @$_REQUEST["i_read"];
 
	###################
	$limit 	= @$_REQUEST["limit"];
	$dir 	= @$_REQUEST["dir"];
	$sort 	= @$_REQUEST["sort"];
	$start 	= @$_REQUEST["start"];
	###################
	if (!$util->get($start)) { 	$start 	= 0; }
	if (!$util->get($limit)) { 	$limit 	= 15; }else{ $limit=($limit+$start); }
	if (!$util->get($dir))	{   $dir 	= "ASC"; }
	if (!$util->get($sort)) {  	$sort 	= "c_code"; }
	################### 
	$root	= "data";
	$debug = ''; 
	$totalCount =0; 
	function get($a){ return isset($a) && !empty($a)?$a:null; }

 if($_REQUEST['type'] == 'storeStatus') {  
	
        $arrParam	= array(); 
        $arrParam[]	= STATUS_ENABLE;
        $wh             = "";
        $last_id = $_POST['last_status_id']??22;
        if($last_id){
            $wh = " and i_seq > (select i_seq from dbo.po_status_hdr where po_status_hdr_id= $last_id)";   
        }
        
	$sqlMain	= "select po_status_hdr_id 
						, c_code
						, c_name 
                                                ,i_seq
					from dbo.po_status_hdr
					where i_delete<>1 and isnull(i_enable,".STATUS_DISABLE.") = ? {$wh}
					order by i_seq
				";
	
//        echo $sqlMain; print_r($arrParam);
        
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	$i=0;
	if($stmt){
		while($row =$db->Fetch($stmt))
		{   $i++;
			$temp = array("id" => $row["po_status_hdr_id"]
						, "c_code" => $row["c_code"] 
						, "c_name" => $row["c_name"]
                                                , "i_seq" => $row["i_seq"]
			);
			${$root}[] = $temp;
		}
	}
	$totalCount = $i;
	$debug='storeStatus >>>'; 
	
}else if($_REQUEST['type'] =="storeEmpItem"){ //storeEmpItem
    	
        $arrParam	= array(); 
        $arrParam[]	= STATUS_ENABLE;
        

        
	$sqlMain	= "select b.c_code ,a.dc_emp_id
                            ,b.c_name 
                            from dbo.po_emp_item a
                            inner join dbo.dc_emp b on b.dc_emp_id=a.dc_emp_id 
                            where 1 = ?
                            group by a.dc_emp_id,b.c_code ,b.c_name"; 
//        echo $sqlMain; print_r($arrParam); 
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	$i=0;
	if($stmt){
		while($row =$db->Fetch($stmt))
		{   $i++;
			$temp = array("id" => $row["dc_emp_id"] 
//                                                , "c_name" => $row["c_name"]  
						, "c_name" => $row["c_code"]." ".$row["c_name"]  
			);
			${$root}[] = $temp;
		}
	}
	$totalCount = $i;
	$debug='storeEmpItem >>>'; 
} 
echo json_encode(array("success"=>true, "debug"=>$debug,"totalCount"=>$totalCount, $root=>(isset(${$root}) && ${$root}!=null)?${$root}:''));
exit;
 
