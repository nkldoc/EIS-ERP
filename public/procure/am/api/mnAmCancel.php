<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();

$data = $util->mnUser($_REQUEST);
$am_tran_rg_hdr_id  = $_REQUEST["am_tran_rg_hdr_id"];
$cancel_name        = $_REQUEST["cancel_name"];
$cancel_comment     = $_REQUEST["c_comment"];
$user_id            = $data["dc_user_create_id"];
$user_cost_id       = $data["dc_user_create_cost_id"];


$db->BeginTran();

// copy
$sql = "declare @am_tran_rg_hdr_id as bigint;
        declare @cancel_name as varchar(1000);
        declare @cancel_comment as varchar(1000);
        declare @user_id as bigint;
        declare @user_cost_id as bigint;

        set @am_tran_rg_hdr_id = ?;
        set @cancel_name = ?;
        set @cancel_comment = ?;
        set @user_id = ?;
        set @user_cost_id = ?;

        declare @hdr_id as bigint;

        insert into am_cancel_hdr
        select @cancel_name, @cancel_comment, *, @user_id, @user_cost_id, getdate() from am_tran_rg_hdr where am_tran_rg_hdr_id = @am_tran_rg_hdr_id;

        select @hdr_id = @@IDENTITY;

        insert into am_cancel_dtl
        select @hdr_id, * from am_tran_rg_dtl where am_tran_rg_hdr_id = @am_tran_rg_hdr_id;

        insert into am_cancel_asset
        select @hdr_id, b.* 
        from am_tran_rg_dtl a
                inner join dc_asset b on a.am_tran_rg_dtl_id = b.am_tran_rg_dtl_id
        where am_tran_rg_hdr_id = @am_tran_rg_hdr_id;";
$stmt = $db->QueryParam($sql, array($am_tran_rg_hdr_id, $cancel_name, $cancel_comment, $user_id, $user_cost_id));

$stmt2 = false;
if ($stmt)
{
    // delete
    $sql = "declare @am_tran_rg_hdr_id as bigint;
            set @am_tran_rg_hdr_id = ?;

            delete from dc_asset
            where am_tran_rg_dtl_id in (select am_tran_rg_dtl_id 
                                        from am_tran_rg_dtl 
                                        where am_tran_rg_hdr_id = @am_tran_rg_hdr_id);

            delete from am_tran_rg_dtl where am_tran_rg_hdr_id = @am_tran_rg_hdr_id;

            delete from am_tran_rg_hdr where am_tran_rg_hdr_id = @am_tran_rg_hdr_id;";
    $stmt2 = $db->QueryParam($sql, array($am_tran_rg_hdr_id));
}

if ($stmt && $stmt2)
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