<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
include("../../gl/conf/configGl.php");

$db 	= new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();

$root		= "data";
$data		= array();
$con		= null;
$select		= null;
$flds		= null;
$groupBy	= null;

function List_QueryParam() {
	
	global $db, $date, $util, $root, $data, $select, $con, $flds, $groupBy, $arr_status;

	$Arr_money		= array("1"=>"แสดงยอดรวมรายเดือน", "2"=>"แสดงยอดรวมรายไตรมาส" ,"3"=>"แสดงยอดรวมรายไตรมาส (ณ สิ้นไตรมาส)", "4"=>"แสดงยอดรวมรายปี");
	$Arr_process	= array("1"=>"ไม่ประมวลผล", "2"=>"ประมวลผล");
	
	$totalCount		= 0;
	
	if($_REQUEST["i_enable"] > 0) {
		$con	.= " AND a.i_enable = ".$_REQUEST["i_enable"]." ";
	}
	
	$sqlMain	= "	SET NOCOUNT ON
					SELECT
						a.gl_rep_acc_hdr_id
						,a.c_code
						,a.c_name
						,a.i_money
						,a.i_process
						,a.i_enable
						,a.i_level_dtl
						,b.gl_rep_acc_dtl_id
						,b.i_sequence AS i_sequence1
						,b.c_name AS c_name1
						,c.gl_rep_acc_sub_dtl_id
						,c.i_sequence AS i_sequence2
						,c.c_name AS c_name2
						,d.dc_acc_id AS dc_acc_id1
						,d.c_code AS acc_code1
						,d.c_name AS acc_name1
						,e.dc_acc_id AS dc_acc_id2
						,e.c_code AS acc_code2
						,e.c_name AS acc_name2
					FROM gl_rep_acc_hdr a
						LEFT JOIN gl_rep_acc_dtl b ON a.gl_rep_acc_hdr_id = b.gl_rep_acc_hdr_id
						LEFT JOIN gl_rep_acc_sub_dtl c ON b.gl_rep_acc_dtl_id = c.gl_rep_acc_dtl_id
						LEFT JOIN (SELECT aa.gl_rep_acc_dtl_id, bb.dc_acc_id, bb.c_code, bb.c_name FROM gl_rep_acc_map aa INNER JOIN dc_acc bb ON aa.dc_acc_id = bb.dc_acc_id) d ON b.gl_rep_acc_dtl_id = d.gl_rep_acc_dtl_id
						LEFT JOIN (SELECT aa.gl_rep_acc_sub_dtl_id, bb.dc_acc_id, bb.c_code, bb.c_name FROM gl_rep_acc_map aa INNER JOIN dc_acc bb ON aa.dc_acc_id = bb.dc_acc_id) e ON c.gl_rep_acc_sub_dtl_id = e.gl_rep_acc_sub_dtl_id
					WHERE a.i_delete=?
						{$con}
					ORDER BY a.c_code, b.i_sequence, c.i_sequence;";

	$arrParam[]	= DELETE_FALSE;
						
	$stmt = $db->QueryParam( $sqlMain, $arrParam );
	
	if( $stmt ) {

		while( $row = $db->Fetch( $stmt ) ) {

			$Arr1[$row["gl_rep_acc_hdr_id"]]["c_code"]			= $row["c_code"];
			$Arr1[$row["gl_rep_acc_hdr_id"]]["c_name"]			= $row["c_name"];
			$Arr1[$row["gl_rep_acc_hdr_id"]]["i_money"]			= $Arr_money[$row["i_money"]];
			$Arr1[$row["gl_rep_acc_hdr_id"]]["i_process"]		= $Arr_process[$row["i_process"]];
			$Arr1[$row["gl_rep_acc_hdr_id"]]["i_enable"]		= $arr_status[$row["i_enable"]];
			$Arr1[$row["gl_rep_acc_hdr_id"]]["i_level_dtl"]		= $row["i_level_dtl"];
			
			$Arr2[$row["gl_rep_acc_hdr_id"]][$row["gl_rep_acc_dtl_id"]]["i_sequence1"]		= $row["i_sequence1"];
			$Arr2[$row["gl_rep_acc_hdr_id"]][$row["gl_rep_acc_dtl_id"]]["c_name1"]			= $row["c_name1"];
			if($row["dc_acc_id1"] > 0) {
				$Arr3[$row["gl_rep_acc_hdr_id"]][$row["gl_rep_acc_dtl_id"]][$row["dc_acc_id1"]]["dc_acc_id1"]			= $row["dc_acc_id1"];
				$Arr3[$row["gl_rep_acc_hdr_id"]][$row["gl_rep_acc_dtl_id"]][$row["dc_acc_id1"]]["acc_code1"]			= $row["acc_code1"];
				$Arr3[$row["gl_rep_acc_hdr_id"]][$row["gl_rep_acc_dtl_id"]][$row["dc_acc_id1"]]["acc_name1"]			= $row["acc_name1"];
			}
			
			$Arr4[$row["gl_rep_acc_hdr_id"]][$row["gl_rep_acc_dtl_id"]][$row["gl_rep_acc_sub_dtl_id"]]["i_sequence2"]		= $row["i_sequence2"];
			$Arr4[$row["gl_rep_acc_hdr_id"]][$row["gl_rep_acc_dtl_id"]][$row["gl_rep_acc_sub_dtl_id"]]["c_name2"]			= $row["c_name2"];
			if($row["dc_acc_id2"] > 0) {
				$Arr5[$row["gl_rep_acc_hdr_id"]][$row["gl_rep_acc_dtl_id"]][$row["gl_rep_acc_sub_dtl_id"]][$row["dc_acc_id2"]]["dc_acc_id2"]		= $row["dc_acc_id2"];
				$Arr5[$row["gl_rep_acc_hdr_id"]][$row["gl_rep_acc_dtl_id"]][$row["gl_rep_acc_sub_dtl_id"]][$row["dc_acc_id2"]]["acc_code2"]			= $row["acc_code2"];
				$Arr5[$row["gl_rep_acc_hdr_id"]][$row["gl_rep_acc_dtl_id"]][$row["gl_rep_acc_sub_dtl_id"]][$row["dc_acc_id2"]]["acc_name2"]			= $row["acc_name2"];
			}
			
			$totalCount++;
		}
		
		if(is_array(@$Arr1)) {
			
			foreach( $Arr1 AS $hdr_id => $obj1 ) {
					
				//=================================//
				$temp		= array();
				
				$no2		= 0;
				
				$temp["i_type"]				= 1;
				$temp["c_name"]				= $obj1["c_name"];
				$temp["c_code"]				= $obj1["c_code"];
				$temp["i_money"]			= $obj1["i_money"];
				$temp["i_process"]			= $obj1["i_process"];
				$temp["i_enable"]			= $obj1["i_enable"];
				$temp["i_level_dtl"]		= $obj1["i_level_dtl"];
 				$temp["i_sequence1"]		= "";
				$temp["c_name1"]			= "";
				$temp["i_sequence2"]		= "";
				$temp["c_name2"]			= "";
				$temp["acc_code"]			= "";
				$temp["acc_name"]			= "";
				
				${$root}[]	= $temp;
				//=================================//
				
				foreach( $Arr2[$hdr_id] AS $dtl_id => $obj2 ) {
					
					if ( $dtl_id > 0 ) {
						
						if(is_array(@$Arr3[$hdr_id][$dtl_id])) {
							
							$id1	= 0;
								
							foreach( $Arr3[$hdr_id][$dtl_id] AS $obj3 ) {
						
								if( $id1 != $dtl_id ) {
									$id1			= $dtl_id;
									$i_sequence1	= $obj2["i_sequence1"];
									$c_name1		= $obj2["c_name1"];
								} else {
									$i_sequence1	= "";
									$c_name1		= "";
								}
								
								//=================================//
								$temp		= array();
									
								$temp["i_type"]				= 2;
								$temp["c_name"]				= "";
								$temp["c_code"]				= "";
								$temp["i_money"]			= "";
								$temp["i_process"]			= "";
								$temp["i_enable"]			= "";
								$temp["i_level_dtl"]		= "";
								$temp["i_sequence1"]		= $i_sequence1;
								$temp["c_name1"]			= $c_name1;
								$temp["i_sequence2"]		= "";
								$temp["c_name2"]			= "";
								$temp["acc_code"]			= $obj3["acc_code1"];
								$temp["acc_name"]			= $obj3["acc_name1"];
									
								${$root}[]	= $temp;
								//=================================//
							}
								
						} else {
							//=================================//
							$temp		= array();
		
							$temp["i_type"]				= 2;
							$temp["c_name"]				= "";
							$temp["c_code"]				= "";
							$temp["i_money"]			= "";
							$temp["i_process"]			= "";
							$temp["i_enable"]			= "";
							$temp["i_level_dtl"]		= "";
							$temp["i_sequence1"]		= $obj2["i_sequence1"];
							$temp["c_name1"]			= $obj2["c_name1"];
							$temp["i_sequence2"]		= "";
							$temp["c_name2"]			= "";
							$temp["acc_code"]			= "";
							$temp["acc_name"]			= "";
		
							${$root}[]	= $temp;
							//=================================//
						}
						
						foreach( $Arr4[$hdr_id][$dtl_id] AS $sub_dtl_id => $obj4 ) {
	
							if ( $sub_dtl_id > 0 ) {

								if(is_array($Arr5[$hdr_id][$dtl_id][$sub_dtl_id])) {
									
									$id2	= 0;
									
									foreach( $Arr5[$hdr_id][$dtl_id][$sub_dtl_id] AS $obj5 ) {
										
										if( $id2 != $sub_dtl_id ) {
											$id2			= $sub_dtl_id;
											$i_sequence2	= $obj4["i_sequence2"];
											$c_name2		= $obj4["c_name2"];
										} else {
											$i_sequence2	= "";
											$c_name2		= "";
										}
										
										//=================================//
										$temp		= array();
											
										$temp["i_type"]				= 3;
										$temp["c_name"]				= "";
										$temp["c_code"]				= "";
										$temp["i_money"]			= "";
										$temp["i_process"]			= "";
										$temp["i_enable"]			= "";
										$temp["i_level_dtl"]		= "";
										$temp["i_sequence1"]		= "";
										$temp["c_name1"]			= "";
										$temp["i_sequence2"]		= $i_sequence2;
										$temp["c_name2"]			= $c_name2;
										$temp["acc_code"]			= $obj5["acc_code2"];
										$temp["acc_name"]			= $obj5["acc_name2"];
											
										${$root}[]	= $temp;
										//=================================//
									}
								}
							}
						}
					}
				}
			}
		}
	}

	return json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));
}
?>
