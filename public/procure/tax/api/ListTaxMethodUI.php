<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

###################
$db 	= new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();
//print_r($_REQUEST);
############################################################################################################
$gl_rep_acc_hdr_id = isset($_REQUEST['hdrid']) && $_REQUEST['hdrid']>0?$_REQUEST['hdrid']:0;
$gl_rep_acc_dtl_id = isset($_REQUEST['id']) && $_REQUEST['id']>0?$_REQUEST['id']:0;
$mode = isset($_REQUEST['mode'])?$_REQUEST['mode']:"";
################### 
$root	= "data";
$data = array();
$debug = '';
################### 
###################
	function getDetailAcc($acc_id){
            global $db;
            $sql = "select a.c_name
                    from dc_tax_method a
                        inner join tax_map_method b on b.dc_tax_method_id=a.dc_tax_method_id
                    where b.dc_acc_id=? and b.i_enable = ?
                    order by a.c_code,a.c_name";

            $arrParam 	= array($acc_id, STATUS_ENABLE);
            $stmt 	= $db->QueryParam($sql, $arrParam);
            $i 		= 0;
            $retval	= '';
            while($row =$db->Fetch($stmt))
            {
                if($i>0){ $br = "<br/> - "; }else{ $br = " - "; }
                $retval .= @$br.$row["c_name"];
                $i++;
            }

            return $i>0?array(1,$retval):array(2,'Copy จากรายการใช้จ่าย');
	}; //End Function
	function getDetailf($acc_id,$id){
		global $db;
		$sql = "select a.c_name 
                        from dc_tax_method a
                            inner join tax_map_method b on b.dc_tax_method_id=a.dc_tax_method_id
                        where b.dc_section_tax_id = ? 
                                and b.dc_acc_id=?
                                and b.i_enable = ?
                        order by a.c_code,a.c_name";
		
			$arrParam 	= array($id,$acc_id,STATUS_ENABLE); 
			$stmt 		= $db->QueryParam($sql, $arrParam);
			$i 			= 1;
			$retval		= '';
			while($row =$db->Fetch($stmt))
			{
                            if($i>1){  
                                    $br = "<br/> - "; }else{ $br = " - ";
                            } 
                            $retval .= @$br.$row["c_name"]; 
                            $i++;
			}
	 
			return $retval;
	}; //End Function


	switch ($mode)
	{
		case "listPrStoreMapReport" :
		$sql = "select a.dc_section_tax_id, a.c_name
                            , c.c_code+' - '+c.c_name as c_acc_name 
                        from vw_dc_section_tax a
                            inner join tax_map_method b on b.dc_section_tax_id= a.dc_section_tax_id
                            inner join vw_dc_acc c on c.dc_acc_id = b.dc_acc_id
                        where a.i_enable = ? and b.i_enable = ?
                        and b.dc_acc_id=? 
                        order by a.c_name";
		$arrParam 	= array(STATUS_ENABLE, STATUS_ENABLE , $_REQUEST['id']); 
		$stmt 		= $db->QueryParam($sql, $arrParam);
		$i 			= 0;
		while($row =$db->Fetch($stmt))
		{
                    $temp = array(
                                    "id" => $row["dc_section_tax_id"],
                                    "c_name" => $row["c_name"],
                                    "c_acc_name" => $row["c_acc_name"],
                                    "c_detail" => getDetailf($_REQUEST['id'],$row["dc_section_tax_id"]) 
                                    ); 
                    ${$root}[] = $temp;
                    $i++;
		}
		break;
		case "listAccMapping" :
			$sql = "select c.dc_acc_id , c.c_code+' - '+c.c_name as c_acc_name 
                                from vw_dc_acc c
                                    inner join tax_map_method b on b.dc_acc_id = c.dc_acc_id 
				where c.i_enable =? and c.i_delete = ? 
				group by c.dc_acc_id, c.c_code, c.c_name
				order by c_acc_name";
		$arrParam = array(STATUS_ENABLE , DELETE_FALSE);

		$stmt = $db->QueryParam($sql, $arrParam);
		$i = 0;
		while($row =$db->Fetch($stmt))
		{
			$getDeail = getDetailAcc($row["dc_acc_id"]);
			$temp = array(
					"id" 				=> $row["dc_acc_id"],
					"c_name" 			=> $row["c_acc_name"],
					"i_detail" 			=> $getDeail[0],
					"c_detail" 			=> $getDeail[1],
					); 
			${$root}[] = $temp;
			$i++;
			$debug = "case : listAccMapping";
		}
		break;
		case "listCmbReport" :
			$wh =(isset($_REQUEST['editId']) && $_REQUEST['editId']>0)?'and dc_section_tax_id=?':'';
			$sql = "select dc_section_tax_id, c_name from vw_dc_section_tax 
					where i_enable = ? ".$wh."
					order by c_name";
			
			$arrParam = (isset($_REQUEST['editId']) && $_REQUEST['editId']>0)
			? array(STATUS_ENABLE , $_REQUEST['editId'])
			: array(STATUS_ENABLE);
			
			$stmt = $db->QueryParam($sql, $arrParam);
			$i = 0;
			while($row =$db->Fetch($stmt))
			{
                            $temp = array("id"=>$row["dc_section_tax_id"], "c_name" => $row["c_name"]);
                            ${$root}[] = $temp;
                            $i++;
			}
		break;
		case "listGrid" :
 
			$sql = "select a.dc_tax_method_id
                                    , a.c_code 
                                    , a.c_name
                                    , isnull(b.tax_map_method_id,0) as tax_map_method_id
                                from dc_tax_method a
                                    left join tax_map_method b on b.dc_tax_method_id = a.dc_tax_method_id 
                                            and b.dc_acc_id = ? and b.i_enable = ?
                                where a.dc_section_tax_id=?
                                order by a.c_code";
			$arrParam = array(@$_REQUEST['DcAccId'], STATUS_ENABLE, @$_REQUEST['PrSectionTaxId']);
			$stmt = $db->QueryParam($sql, $arrParam);
			$i = 0;
			while($row =$db->Fetch($stmt))
			{   $i++;
				$temp = array(
						"no" => $i,
						"id" => $row["dc_tax_method_id"],
						"c_code" => $row["c_code"],
						"c_name" => $row["c_name"],
						"i_chk"  => $row["tax_map_method_id"]
				);
				${$root}[] = $temp;
				
			}
		break;
		default:
			${$root} = array();
			$i = 0;
		break;
	}

	$debug = ($debug)?$debug:'';
echo json_encode(array("debug"=>$debug,"totalCount"=>$i,$root=>${$root}));


function get($a){ return isset($a) && !empty($a)?$a:null; }
?>