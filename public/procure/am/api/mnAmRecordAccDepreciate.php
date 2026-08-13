<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
include("../conf/config_am.php");

$db = new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();

$table 		= "gl_tran_hdr";
$keyName 	= "gl_tran_hdr_id";
$code_gen	= "GX";
$data = $util->mnUser($_REQUEST, "ADD");

// prepare data
$data["d_save_date"]	= (!empty($data["d_save_date"]))? $date->bc_to_ad($data["d_save_date"]) : null;
$gl_depre_hdr_id = @$data["id"];
$strM = @$data["strM"];
$strY = @$data["strY"];

// process 
$stmt = false;
$stmt2 = false;
$stmt3 = false;
$stmt4 = false;

$db->BeginTran();

$arrParam = array();

if ($data["mode"] == "EDIT")
{
    $arrParam[] = $gl_depre_hdr_id; 
    $arrParam[] = $data["d_save_date"];
    $arrParam[] = $strM;
    $arrParam[] = $strY;
    $arrParam[] = $data["dc_user_create_id"];
    $arrParam[] = $data["dc_user_create_cost_id"];

    $sql = "declare @gl_depre_hdr_id as bigint;
                    declare @d_save_date as varchar(10);
                    declare @strM as varchar(50);
                    declare @strY as varchar(4);
                    declare @create_id as bigint;
                    declare @create_cost_id as bigint;

                    set @gl_depre_hdr_id = ?;
                    set @d_save_date = ?;
                    set @strM = ?;
                    set @strY = ?;

                    set @create_id = ?;
                    set @create_cost_id = ?;

                    /*insert gl_tran_hdr*/
                    insert into gl_tran_hdr (c_ref_doc, gl_dc_book_type_id, d_doc_date
                                                    , d_save_date, f_total_amt, table_pk_id
                                                    , table_name, table_detail, c_mm, c_yyyy, c_yyyy_mm
                                                    , c_comment1, i_enable, i_type, i_is_post, i_is_close_year
                                                    , i_is_reversing, i_close_year_type, i_preview
                                                    , i_chk_gl_dtl, i_chk_gl_purchase, c_code, c_code_post
                                                    , dc_user_create_id, dc_user_create_cost_id, d_create
                                                    , dc_user_update_id, dc_user_update_cost_id, d_update)
                    select a.c_code as c_ref_doc
                            , (select gl_dc_book_type_id from gl_dc_book_doc where c_code = left(a.c_code, 2)) as gl_dc_book_type_id
                            , convert(datetime, @d_save_date, 102) as d_doc_date
                            , convert(datetime, @d_save_date, 102) as d_save_date
                            , isnull((select sum(f_depre_amt) from gl_depre_dtl where gl_depre_hdr_id = a.gl_depre_hdr_id), 0) as f_total_amt
                            , a.gl_depre_hdr_id as table_pk_id
                            , 'gl_depre_hdr' as table_name
                            , 'บันทึกบัญชีค่าคำนวณค่าเสื่อม' as table_detail
                            , right(left(@d_save_date,7),2) as c_mm
                            , left(@d_save_date,4) as c_yyyy
                            , left(@d_save_date,4)+right(left(@d_save_date,7),2) as c_yyyy_mm
                            , 'ค่าเสื่อมราคา-หมวด '+ a.c_name +' เดือน '++@strM+' ' +@strY as c_comment1
                            , 1 as i_enable
                            , 2 as i_type
                            , 2 as i_is_post
                            , 2 as i_is_close_year
                            , 2 as i_is_reversing
                            , 9 as i_close_year_type
                            , 1 as i_preview
                            , 2 as i_chk_gl_dtl
                            , 2 as i_chk_gl_purchase
                            , '0' as c_code
                            , '0' as c_code_post
                            , @create_id
                            , @create_cost_id
                            , getdate()
                            , @create_id
                            , @create_cost_id
                            , getdate()
                    from gl_depre_hdr a
                    where a.gl_depre_hdr_id = @gl_depre_hdr_id;";
    $sql.="SELECT @@IDENTITY as hdr_id";
    $stmt = $db->QueryParam($sql, $arrParam);
    if ($stmt)
    {
        $next_result = $db->NextResult($stmt);
        if( $next_result ) {
            $dd_hdr = $db->Fetch($stmt);
            $hdr_id = $dd_hdr["hdr_id"] ;
        }
    }
}
else
{
    $stmt = true;
}

if ($hdr_id > 0)
{
            /*
                (i_rank, gl_tran_hdr_id, dc_cost_acc_id
                , dc_acc_id, f_dr, f_cr
                , dc_creditor_type_id, dc_emp_id, dc_cnt_id
                , i_cont, bh_contract_id)
            */
    $sql = "declare @gl_depre_hdr_id as bigint;
            declare @hdr_id as bigint;
            set @gl_depre_hdr_id = ?;
            set @hdr_id = ?;

            insert into gl_tran_dtl (i_rank, gl_tran_hdr_id, dc_cost_acc_id
                                    , dc_acc_id, f_dr, f_cr
                                    , i_type_person, dc_emp_id, dc_debtor_id,dc_creditor_id
                                    , i_is_nontax_exp,dc_product_id,pk_id1,pk_id2 )
            select ROW_NUMBER() OVER (ORDER BY a.dc_cost_acc_id, f_dr desc) as i_rank 
                , @hdr_id as gl_tran_hdr_id
                , dc_cost_acc_id
                , dc_acc_id
                , f_dr
                , f_cr 
                , 0 as i_type_person
                , 0 as dc_emp_id
                , 0 as dc_debtor_id
                , 0 as dc_creditor_id
                , 2 as i_is_nontax_exp
                , 0 as dc_product_id 
                , 0 as pk_id1
                , 0 as pk_id2
            from (select a.dc_cost_acc_id 
                    ,b.dc_acc_dr_id as dc_acc_id
                    , sum(a.f_depre_amt) as f_dr
                    , 0.00 as f_cr
                 from gl_depre_dtl a
                    inner join dc_asset_type b on a.dc_asset_type_id = b.dc_asset_type_id 
                    inner join gl_depre_hdr c on a.gl_depre_hdr_id = c.gl_depre_hdr_id
                where a.gl_depre_hdr_id = @gl_depre_hdr_id
                group by a.dc_cost_acc_id, b.dc_acc_dr_id
                union
                select a.dc_cost_acc_id 
                    ,b.dc_acc_cr_id as dc_acc_id
                    , 0.00 as f_dr
                    , sum(a.f_depre_amt) as f_cr
                 from gl_depre_dtl a
                    inner join dc_asset_type b on a.dc_asset_type_id = b.dc_asset_type_id 
                    inner join gl_depre_hdr c on a.gl_depre_hdr_id = c.gl_depre_hdr_id
                where a.gl_depre_hdr_id = @gl_depre_hdr_id
                group by a.dc_cost_acc_id, b.dc_acc_cr_id) a
            order by i_rank;";
    $stmt2 = $db->QueryParam($sql, array($gl_depre_hdr_id, $hdr_id));
    if ($stmt2)
    {
        // Gen Code
        list($yyyy, $mm, $dd) = explode("-",@$data["d_save_date"]);
        $c_yyyy_mm = $yyyy.$mm;
        $arrParamGencode	= array($code_gen,$c_yyyy_mm,$data["dc_user_update_id"],$data["dc_user_update_cost_id"],$hdr_id);
        $sqlGenCode		= "EXEC SP_GEN_CODE ?,?,?,?,?;";
        $stmtGenCode 		= $db->QueryParam($sqlGenCode,$arrParamGencode);

        $arr_gen_code           = $db->Fetch($stmtGenCode);
        $c_code 		= $arr_gen_code["c_code_gen"] ;
        $ref_id   		= $arr_gen_code["reference_id"] ;

        if ($hdr_id==$ref_id)
        {
            $sql = "UPDATE {$table}
            SET c_code = ?
            WHERE {$keyName} = ?;";

            $stmt3 = $db->QueryParam($sql, array($c_code, $hdr_id));
            $code_gen = $c_code;

            if ($stmt3)
            {
                $sql = "UPDATE gl_depre_hdr SET i_is_posted = ? WHERE gl_depre_hdr_id = ?";
                $stmt4 = $db->QueryParam($sql, array(ASSET_CAL_POST_YES, $gl_depre_hdr_id));
            }
        }
    }
}
if ($stmt  && $stmt2 && $stmt3 && $stmt4)
{
    $db->CommitTran();
    $re = array("reval"=>0,"success"=>"Success","msg"=>"commit","hdr_id"=>$hdr_id,"c_code_gen"=>$code_gen);
}
else
{
    $db->RollBackTran();
    $re = array("reval"=>1,"success"=>"Error","msg"=>"check statement : {$sql}");
}

echo json_encode($re);
exit;
?>