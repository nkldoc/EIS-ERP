<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
include("../conf/config_am.php");

$db = new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();

$data 	= $util->mnUser($_REQUEST);
$mode	= $_REQUEST["mode"];

$stmt2 = false;
$db->BeginTran();
switch ($mode) {
	case "EDIT_DTL" :
		$stmt2 = true;
		
		$f_uint_cost = $data["f_unit_cost"];
		$c_cost_ruins = $data["c_cost_ruins"];
		$i_period_year = $data["i_period_year"];
		$f_depreciate = $data["f_depreciate"];
		$i_is_expense = $data["i_is_expense"];
		$d_depreciate = substr($data["d_depreciate"],0,10);
		
		$sql = "declare @am_tran_rg_dtl_id as bigint;
				declare @i_is_expense as tinyint;
				declare @f_unit_cost as decimal(18, 2);
				declare @c_cost_ruins as decimal(18, 2);
				declare @i_period_year as decimal(18, 2);
				declare @d_depreciate as datetime;
				declare @f_depreciate as decimal(18, 2);

				set @am_tran_rg_dtl_id = ?;
				set @i_is_expense = ?;
				set @f_unit_cost = ?;
				set @c_cost_ruins = ?;
				set @i_period_year = ?;
				set @d_depreciate = convert(datetime, ?, 102);
				set @f_depreciate = ?;

				/*dc_asset*/
				update dc_asset
				set f_unit_cost = @f_unit_cost
					, c_cost_ruins = @c_cost_ruins
					, i_period_year = @i_period_year
					, f_depreciate_cost = @f_depreciate
					, i_is_expense = @i_is_expense
					, i_process_depre = 0
				where am_tran_rg_dtl_id = @am_tran_rg_dtl_id;


				/*am_tran_rg_dtl*/
				update am_tran_rg_dtl
				set c_cost_ruins = @c_cost_ruins
					, i_period_year = @i_period_year
					, i_is_expense = @i_is_expense
					, f_depreciate = @f_depreciate
					, d_depreciate = case when @i_is_expense = 1 then null else @d_depreciate end
				where am_tran_rg_dtl_id = @am_tran_rg_dtl_id;";
		
		$stmt = $db->QueryParam($sql, array($data["id"]
				, $i_is_expense
				, $f_uint_cost
				, $c_cost_ruins
				, $i_period_year
				, $d_depreciate
				, $f_depreciate
		));
	break;
	case "RUINS" :
		
		$stmt = true; $stmt2 = true;
		$sql = "";
		$assetRuins = @$_REQUEST["chk"];
		$hdr_id = @$_REQUEST["am_tran_rg_hdr_id"];
		
		if (is_array($assetRuins))
		{
			foreach($assetRuins as $dtl_id)
			{
				$d_depreciate	= (!empty($data["d_depreciate"][$dtl_id]))? $date->bc_to_ad($data["d_depreciate"][$dtl_id]) : null;
				
				$sql = "declare @am_tran_rg_dtl_id as bigint;
						declare @i_is_expense as tinyint;
						declare @f_unit_cost as decimal(18, 2);
						declare @c_cost_ruins as decimal(18, 2);
						declare @i_period_year as decimal(18, 2);
						declare @d_depreciate as datetime;
						declare @f_depreciate as decimal(18, 2);
						
						set @am_tran_rg_dtl_id = ?;
						set @i_is_expense = ?;
						set @f_unit_cost = ?;
						set @c_cost_ruins = ?;
						set @i_period_year = ?;
						set @d_depreciate = convert(datetime, ?, 102);
						set @f_depreciate = ?;
						
						/*dc_asset*/
						update dc_asset
						set f_unit_cost = @f_unit_cost
							, c_cost_ruins = @c_cost_ruins
							, i_period_year = @i_period_year
							, f_depreciate_cost = @f_depreciate
							, i_is_expense = @i_is_expense
							, i_process_depre = 0
						where am_tran_rg_dtl_id = @am_tran_rg_dtl_id;
						
						
						/*am_tran_rg_dtl*/
						update am_tran_rg_dtl
						set c_cost_ruins = @c_cost_ruins
							, i_period_year = @i_period_year
							, i_is_expense = @i_is_expense
							, f_depreciate = @f_depreciate
							, d_depreciate = case when @i_is_expense = 1 then null else @d_depreciate end
							, i_is_audit = 1
						where am_tran_rg_dtl_id = @am_tran_rg_dtl_id;";
				$stmt = $db->QueryParam($sql, array($dtl_id
                                                                    , $data["i_is_expense"][$dtl_id]
                                                                    , $data["f_unit_cost"][$dtl_id]
                                                                    , $data["c_cost_ruins"][$dtl_id]
                                                                    , $data["i_period_year"][$dtl_id]
                                                                    , $d_depreciate
                                                                    , $data["f_depreciate"][$dtl_id]
				)); 
			}// end foreach
			
			$sqlHdr = "
                                    declare @am_tran_rg_hdr_id as bigint;
                                    set @am_tran_rg_hdr_id = ?;

                                    update am_tran_rg_hdr
                                    set i_is_ruins = case when (select count(am_tran_rg_dtl_id) from am_tran_rg_dtl where isnull(i_is_audit, 0) = 0 and am_tran_rg_hdr_id = @am_tran_rg_hdr_id) > 0 then 0  else 1 end
                                    where am_tran_rg_hdr_id = @am_tran_rg_hdr_id";
			$stmt2 = $db->QueryParam($sqlHdr, array($hdr_id));
		}
	break;
}

if ($stmt)
{
    $db->CommitTran();
    $re = array("reval"=>0,"success"=>"Success","msg"=>"commit");
}
else
{
    $db->RollBackTran();
    $re = array("reval"=>1,"success"=>"Error","msg"=>"check statement : {$sql}");
}
 
echo json_encode($re);
exit;

?>