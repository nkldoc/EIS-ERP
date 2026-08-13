<?php
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../conf/configGl.php");
 
$db		= new DatabaseServer();
$util	= new apiUtil();

$root	= "data";
$data	= array();
$con	= null;

function getAccDtl($hdrID){
	global $db;
	$ret = $db->GetDataBySQL("select isnull(sum(b.gl_rep_conf_id),0) as dtl_id 
	from gl_rep_conf a 
	inner join gl_rep_conf_dtl b on a.gl_rep_conf_id=b.gl_rep_conf_id
	where b.gl_rep_conf_id=?", array($hdrID));  
	if ($ret>0) return true; 
	else return false; 
}
 
if($_REQUEST["type"] == "DTL") {
 

 
	$sqlMain	="select a.c_code,a.c_name ,
		a.dc_acc_id, b.dc_acc_id as checked
		, isnull(b.i_source,(select i_source from gl_rep_conf where gl_rep_conf_id=?)) as i_source
		, isnull(b.i_source_item,(select i_source_item from gl_rep_conf where gl_rep_conf_id=?)) as i_source_item
		,a.i_group
		from dc_acc a 
		left join gl_rep_conf_dtl b on b.dc_acc_id =  a.dc_acc_id and b.gl_rep_conf_id=?
		where a.i_group in (1,2,3) and a.i_level in(4,6) Order by a.i_group,c_code,c_name asc";
	$arrParam	= array($_REQUEST["id"],$_REQUEST["id"],$_REQUEST["id"]); 
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	$i=1;
	if($stmt) {
		$i_group = null;
		while($row =$db->Fetch($stmt)) {
			 
		$cheked = ($row["checked"]!=null)?"checked='checked'":"";
 
			$temp = array(
					"no" 		=> $i++,
					"id"		=> "{$row["dc_acc_id"]}",
					"c_name"	=> "{$row["c_code"]} - {$row["c_name"]}",
					//-----------------------------------------------------
					"radioID" 	=>"" ."<div id='radioID{$row["dc_acc_id"]}'></div>", 
 
					//-----------------------------------------------------
					"comboID" 	=>"" ."<div id='combo{$row["dc_acc_id"]}'></div>", 
					//-----------------------------------------------------
					
					"checkbox"	=>""
						."<input type='checkbox' {$cheked} id='cbID".$row["dc_acc_id"]
						."' name='dc_acc_id[{$row["i_group"]}][]' value='"
						.$row["dc_acc_id"]."'><label for='cbID".$row["dc_acc_id"]
						."'> {$row["c_code"]} - {$row["c_name"]}</label>",  
						
					"dc_acc_id"			=> "{$row["dc_acc_id"]}",
					"i_group"			=> "{$row["i_group"]}",
					"i_source"			=> "{$row["i_source"]}",
					"i_source_item"		=> "{$row["i_source_item"]}",
					"i_source_item1"	=> $row["i_source_item"]>2?1:$row["i_source_item"],
					"i_source_item2"	=> $row["i_source_item"]
					); 

		
		
					
		
			${$root}[] = $temp;
		}
	} 
    
echo json_encode(array("debug"=>true,$root=>${$root}));
exit;    
}else if($_REQUEST["type"] == "GETDATA"){
    
    $sqlMain	="select a.c_code,a.c_name ,b.i_source ,i_source_item
		from dc_acc a 
		inner join gl_rep_conf_dtl b on b.dc_acc_id =  a.dc_acc_id and b.gl_rep_conf_id=?
		where a.i_group in (1,2,3) and a.i_level in(4,6) Order by a.i_group,c_code,c_name asc";
    
	$arrParam	=   array($_REQUEST["setId"]); 
	$stmt           =   $db->QueryParam($sqlMain, $arrParam);
	$i              =   1;
        $str            =   null;
                while($row =$db->Fetch($stmt)) {
                            $str .= "<tr>"
				."<td align='left'>".$row["c_code"]."</td>"  
				."<td align='left'>".$row["c_name"]."</td>" 
                                ."<td align='left'>".$arr_i_source[$row["i_source"]]."</td>"
                                ."<td align='left'>".($row["i_source"]==1?$arr_i_source_item1[$row["i_source_item"]]:$arr_i_source_item2[$row["i_source_item"]])."</td>" 	
                                ."</tr>";
                }
                	$str = "<table cellspacing='0' cellpadding='0' width='100%' border='0' style=\"border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt\">
				<tr><th colspan='2'>".CUSTOMER_ALL_COST_NAME."</th></tr>
                                
                                 <tr><th colspan='2'>{$_REQUEST["title"]}</th></tr>
				 
			</table>
			<table cellspacing='0' cellpadding='3' width='100%' border='1' style=\"border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt\">
				<tr bgcolor='#A5BAD6'>
					<th width='10%' align='center'><b>รหัสบัญชี</b></th>
					<th width='35%' align='center'><b>รายการ</b></th>
					<th width='20%' align='center'><b>แหล่งที่มาของเงิน</b></th>
                                        <th width='35%' align='center'><b>สูตรคำนวณ</b></th>
				</tr>
				{$str}
			</table>
			"; 
        header('Content-Type: text/html; charset=utf-8');
	echo '<style type="text/css"> table { font-size:14px; } body{ padding:0px; margin:3px;} #footer td{ background-color:#fff;} </style>';                        
        echo $str;
}

?>