<?php 
// C:\xampp\php\php-cgi.exe -c "C:\xampp\php\php.ini" -f "D:\ERP\nmu_supplies\src\main\webapp\bi\api\processMnMonthlyTask.php"
include("./../conf/config.php");
include("./DatabaseServer.php");
include("./apiUtil.php");
include("./i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();

$mode = $_REQUEST["mode"] ?? null;
$table = "dbo.sp_montyly_resulte";
$keyName = sprintf("%04d%02d", date('Y'), date('m'));

 
$stmt2  = true;
$stmt3  = true;    

//print_r($_REQUEST); exit();
$db->BeginTran();
 
        $sql = "
        -- DELETE 
        DELETE FROM dbo.sp_montyly_resulte WHERE mm=RIGHT('0' + RTRIM(MONTH(convert(varchar(10),getdate(),120))), 2) and yyyy=YEAR(convert(varchar(10),getdate(),120));
        -- INSERT INTO 
        INSERT INTO dbo.sp_montyly_resulte   
                select RIGHT('0' + RTRIM(MONTH(convert(varchar(10),getdate(),120))), 2) as mm 
               , YEAR(convert(varchar(10),getdate(),120)) as yyyy
               , convert(varchar(10),getdate(),120) as nowDate 
               , CASE
                       WHEN c.i_entrance <= 2 and h.period_status_id is null and a.i_enabled = 1 THEN 'รอดำเนินการ'
                       WHEN c.i_entrance > 2 and h.period_status_id is null and a.i_enabled = 1 THEN 'อยู่ระหว่างดำเนินการ' 
                       WHEN c.i_entrance > 2 and c.i_enabled = 1 and h.period_status_id = 4 and ch.c_arrive_code is null and ch.c_code is null THEN 'รอส่งมอบ' 
                       WHEN c.i_entrance > 2 and c.i_enabled = 1 and ch.c_arrive_code is not null and ch.c_code is null and w.c_code_ref is null THEN 'ส่งมอบแล้ว' 
                       WHEN c.i_entrance > 2 and c.i_enabled = 1 and ch.c_arrive_code is not null and ch.c_code is not null and w.c_code_ref is null THEN 'ตรวจรับแล้ว' 
                       WHEN c.i_entrance > 2 and c.i_enabled = 1 and ch.c_arrive_code is not null and ch.c_code is not null and w.c_code_ref is not null THEN 'ส่งเบิกแล้ว'   
                       WHEN a.i_enabled = 2 THEN 'ยกเลิก'  
                       WHEN a.i_problem = 1 THEN 'ปัญหาอื่นๆ'  
                       ELSE 'อื่นๆ' END AS groupMenu
               , CASE
                       WHEN c.i_entrance <= 2 and h.period_status_id is null and a.i_enabled = 1 THEN 1
                       WHEN c.i_entrance > 2 and h.period_status_id is null and a.i_enabled = 1 THEN 2
                       WHEN c.i_entrance > 2 and c.i_enabled = 1 and h.period_status_id = 4 and ch.c_arrive_code is null and ch.c_code is null THEN 3
                       WHEN c.i_entrance > 2 and c.i_enabled = 1 and ch.c_arrive_code is not null and ch.c_code is null and w.c_code_ref is null THEN 4
                       WHEN c.i_entrance > 2 and c.i_enabled = 1 and ch.c_arrive_code is not null and ch.c_code is not null and w.c_code_ref is null THEN 5
                       WHEN c.i_entrance > 2 and c.i_enabled = 1 and ch.c_arrive_code is not null and ch.c_code is not null and w.c_code_ref is not null THEN 6
                       WHEN a.i_enabled = 2 THEN 7
                       WHEN a.i_problem = 1 THEN 8
                       ELSE NULL END AS i_groupMenu
               , CASE
                        WHEN a.tor_type_id=1 and a.f_total_amt <= 500000 THEN 'เจาะจงไม่เกิน 5 แสน'
                        WHEN a.tor_type_id=1 and a.f_total_amt > 500000 THEN 'เจาะจงเกิน 5 แสน'
                       ELSE (select c_name from sp_type_status where sp_type_status_id=a.tor_type_id)
               END AS c_type
               , CASE
                        WHEN a.tor_type_id=1 and a.f_total_amt <= 500000 THEN 11
                        WHEN a.tor_type_id=1 and a.f_total_amt > 500000 THEN 12
                       ELSE a.tor_type_id
               END AS i_type
               , a.tor_id as sp_tor_id
               , a.c_code as c_pr_code
               , a.tor_type_id as sp_type_status_id
               , a.i_product_type
               , a.i_purchase
               , a.i_type_contract 
               , a.sp_emp_id
               , a.dc_department_id
               , a.f_total_amt 
               , (select c_name from sp_type_status where sp_type_status_id=a.tor_type_id) as sp_type_status  
               , b.c_code as c_contract_code
               , h.i_period
               , isnull((SELECT sum(f_net_total_price) FROM sp_tor_dtl_period where sp_tor_hdr_period_id = h.sp_tor_hdr_period_id),0) as f_period_amt
               , h.dc_expense_budget_type_id  
               , h.sp_tor_hdr_period_id
               , (select c_name from sp_status_hdr where sp_status_hdr_id=a.tor_status_id) as c_status_tor  
               , a.tor_status_id
               , h.period_status_id
               , a.i_enabled
               , a.i_problem
               , a.c_problem
               , c.i_entrance
               , c.i_seq
               , (select c_name from sp_status_hdr where sp_status_hdr_id=h.period_status_id) as period_status
               , ch.c_arrive_code,ch.c_code as c_check_code ,w.c_code_ref  
        from sp_tor a
               left join sp_tor_contract b on b.sp_tor_id = a.tor_id 
               inner join sp_status_hdr c on c.sp_status_hdr_id = a.tor_status_id
               left join sp_tor_hdr_period h on h.sp_tor_contract_id = b.sp_tor_contract_id
               left join sp_check_period_hdr ch on ch.sp_tor_hdr_period_id = h.sp_tor_hdr_period_id
               left join sp_withdraw w on w.sp_check_period_hdr_id = ch.sp_check_period_hdr_id
               order by c.i_entrance,h.sp_tor_hdr_period_id asc, a.tor_id desc;";
    $sql .="
            DELETE FROM dbo.sp_bg_monthly_resulte WHERE mm=RIGHT('0' + RTRIM(MONTH(convert(varchar(10),getdate(),120))), 2) and yyyy=YEAR(convert(varchar(10),getdate(),120));
            INSERT INTO dbo.sp_bg_monthly_resulte 
            select * /*INTO sp_bg_monthly_resulte*/ from (
            /* รายการ จ้าง/เช่า แหล่งเงิน 1*/
            select distinct RIGHT('0' + RTRIM(MONTH(convert(varchar(10),getdate(),120))), 2) as mm 
            , YEAR(convert(varchar(10),getdate(),120)) as yyyy
            , convert(varchar(10),getdate(),120) as nowDate ,a.tor_id,a.i_type_bg,a.dc_expense_budget_type_id as dc_expense_budget_type_id,a.c_code,  a.f_type_amt as f_type_amt, 1 as i_is_bg, 1 as i_is_hdr, a.i_purchase
            , a.tor_status_id , (select c_name from sp_status_hdr where sp_status_hdr_id=a.tor_status_id) as sp_type_status ,a.i_enabled, a.i_problem
            from sp_tor a
            inner join sp_tor_dtl b on b.sp_tor_id = a.tor_id 
            where  isnull(a.dc_expense_budget_type_id,0) <> 0 and a.i_purchase in (2,3) and a.i_is_notor<>1 and a.i_type_bg = 1
            union
            /* รายการ จ้าง/เช่า แหล่งเงิน 2*/
            select distinct RIGHT('0' + RTRIM(MONTH(convert(varchar(10),getdate(),120))), 2) as mm 
            , YEAR(convert(varchar(10),getdate(),120)) as yyyy
            , convert(varchar(10),getdate(),120) as nowDate ,a.tor_id,a.i_type_bg,a.dc_expense_budget_type2_id as dc_expense_budget_type_id,a.c_code, a.f_type2_amt as f_type_amt, 2 as i_is_bg, 1 as i_is_hdr, a.i_purchase 
            , a.tor_status_id , (select c_name from sp_status_hdr where sp_status_hdr_id=a.tor_status_id) as sp_type_status ,a.i_enabled, a.i_problem
            from sp_tor a
            inner join sp_tor_dtl b on b.sp_tor_id = a.tor_id 
            where  isnull(a.dc_expense_budget_type2_id,0) <> 0 and a.i_purchase in (2,3) and a.i_is_notor<>1 and a.i_type_bg = 1
            union
            /* รายการ ซื้อ แหล่งเงิน 1*/
            select distinct RIGHT('0' + RTRIM(MONTH(convert(varchar(10),getdate(),120))), 2) as mm 
            , YEAR(convert(varchar(10),getdate(),120)) as yyyy
            , convert(varchar(10),getdate(),120) as nowDate ,a.tor_id,a.i_type_bg, b.dc_bg_budget_type_id as dc_expense_budget_type_id,a.c_code ,b.f_unit_price as f_type_amt
            , row_number() over (PARTITION BY b.sp_tor_id order by b.sp_tor_dtl_id asc)  as i_is_bg, 2 as i_is_hdr , a.i_purchase , a.tor_status_id 
            , (select c_name from sp_status_hdr where sp_status_hdr_id=a.tor_status_id) as sp_type_status ,a.i_enabled, a.i_problem
            from sp_tor a 
            inner join sp_tor_dtl b on b.sp_tor_id = a.tor_id 
            where a.i_purchase = 1 and a.i_is_notor<>1 and a.i_type_bg = 1 
            ) a  
            where c_code is not null  
            order by tor_id, i_is_bg;";
      $sql .="
                DELETE FROM dbo.sp_bg_monthly_resulte WHERE mm=RIGHT('0' + RTRIM(MONTH(convert(varchar(10),getdate(),120))), 2) and yyyy=YEAR(convert(varchar(10),getdate(),120));
                INSERT INTO dbo.sp_bg_monthly_resulte 
                select * /*INTO sp_bg_monthly_resulte*/ from (
                /* รายการ จ้าง/เช่า แหล่งเงิน 1*/
                select distinct RIGHT('0' + RTRIM(MONTH(convert(varchar(10),getdate(),120))), 2) as mm 
                , YEAR(convert(varchar(10),getdate(),120)) as yyyy
                , convert(varchar(10),getdate(),120) as nowDate ,a.tor_id,a.i_type_bg,a.dc_expense_budget_type_id as dc_expense_budget_type_id,a.c_code,  a.f_type_amt as f_type_amt, 1 as i_is_bg, 1 as i_is_hdr, a.i_purchase
                , a.tor_status_id , (select c_name from sp_status_hdr where sp_status_hdr_id=a.tor_status_id) as sp_type_status ,a.i_enabled, a.i_problem
                from sp_tor a
                inner join sp_tor_dtl b on b.sp_tor_id = a.tor_id 
                where  isnull(a.dc_expense_budget_type_id,0) <> 0 and a.i_purchase in (2,3) and a.i_is_notor<>1 and a.i_type_bg = 1
                union
                /* รายการ จ้าง/เช่า แหล่งเงิน 2*/
                select distinct RIGHT('0' + RTRIM(MONTH(convert(varchar(10),getdate(),120))), 2) as mm 
                , YEAR(convert(varchar(10),getdate(),120)) as yyyy
                , convert(varchar(10),getdate(),120) as nowDate ,a.tor_id,a.i_type_bg,a.dc_expense_budget_type2_id as dc_expense_budget_type_id,a.c_code, a.f_type2_amt as f_type_amt, 2 as i_is_bg, 1 as i_is_hdr, a.i_purchase 
                , a.tor_status_id , (select c_name from sp_status_hdr where sp_status_hdr_id=a.tor_status_id) as sp_type_status ,a.i_enabled, a.i_problem
                from sp_tor a
                inner join sp_tor_dtl b on b.sp_tor_id = a.tor_id 
                where  isnull(a.dc_expense_budget_type2_id,0) <> 0 and a.i_purchase in (2,3) and a.i_is_notor<>1 and a.i_type_bg = 1
                union
                /* รายการ ซื้อ แหล่งเงิน 1*/
                select distinct RIGHT('0' + RTRIM(MONTH(convert(varchar(10),getdate(),120))), 2) as mm 
                , YEAR(convert(varchar(10),getdate(),120)) as yyyy
                , convert(varchar(10),getdate(),120) as nowDate ,a.tor_id,a.i_type_bg, b.dc_bg_budget_type_id as dc_expense_budget_type_id,a.c_code ,b.f_unit_price as f_type_amt
                , row_number() over (PARTITION BY b.sp_tor_id order by b.sp_tor_dtl_id asc)  as i_is_bg, 2 as i_is_hdr , a.i_purchase , a.tor_status_id 
                , (select c_name from sp_status_hdr where sp_status_hdr_id=a.tor_status_id) as sp_type_status ,a.i_enabled, a.i_problem
                from sp_tor a 
                inner join sp_tor_dtl b on b.sp_tor_id = a.tor_id 
                where a.i_purchase = 1 and a.i_is_notor<>1 and a.i_type_bg = 1 
                ) a  
                where c_code is not null  
                order by tor_id, i_is_bg";
   $sql .="
    DELETE FROM dbo.sp_bg_monthly_group_menu WHERE mm=RIGHT('0' + RTRIM(MONTH(convert(varchar(10),getdate(),120))), 2) and yyyy=YEAR(convert(varchar(10),getdate(),120));
    INSERT INTO dbo.sp_bg_monthly_group_menu   
    SELECT distinct a.*
            , RIGHT('0' + RTRIM(MONTH(convert(varchar(10),getdate(),120))), 2) as mm 
            , YEAR(convert(varchar(10),getdate(),120)) as yyyy
            ,ch.c_arrive_code,ch.c_code as c_check_code 
            ,w.c_code_ref
       , CASE
                    WHEN c.i_entrance <= 2 and h.period_status_id is null and a.i_enabled = 1 THEN 'รอดำเนินการ'
                    WHEN c.i_entrance > 2 and h.period_status_id is null and a.i_enabled = 1 THEN 'อยู่ระหว่างดำเนินการ' 
                    WHEN c.i_entrance > 2 and c.i_enabled = 1 and h.period_status_id = 4 and ch.c_arrive_code is null and ch.c_code is null THEN 'รอส่งมอบ' 
                    WHEN c.i_entrance > 2 and c.i_enabled = 1 and ch.c_arrive_code is not null and ch.c_code is null and w.c_code_ref is null THEN 'ส่งมอบแล้ว' 
                    WHEN c.i_entrance > 2 and c.i_enabled = 1 and ch.c_arrive_code is not null and ch.c_code is not null and w.c_code_ref is null THEN 'ตรวจรับแล้ว' 
                    WHEN c.i_entrance > 2 and c.i_enabled = 1 and ch.c_arrive_code is not null and ch.c_code is not null and w.c_code_ref is not null THEN 'ส่งเบิกแล้ว'   
                    WHEN a.i_enabled = 2 THEN 'ยกเลิก'  
                    WHEN a.i_problem = 1 THEN 'ปัญหาอื่นๆ'  
                    ELSE 'อื่นๆ' END AS groupMenu
            , CASE
                    WHEN c.i_entrance <= 2 and h.period_status_id is null and a.i_enabled = 1 THEN 1
                    WHEN c.i_entrance > 2 and h.period_status_id is null and a.i_enabled = 1 THEN 2
                    WHEN c.i_entrance > 2 and c.i_enabled = 1 and h.period_status_id = 4 and ch.c_arrive_code is null and ch.c_code is null THEN 3
                    WHEN c.i_entrance > 2 and c.i_enabled = 1 and ch.c_arrive_code is not null and ch.c_code is null and w.c_code_ref is null THEN 4
                    WHEN c.i_entrance > 2 and c.i_enabled = 1 and ch.c_arrive_code is not null and ch.c_code is not null and w.c_code_ref is null THEN 5
                    WHEN c.i_entrance > 2 and c.i_enabled = 1 and ch.c_arrive_code is not null and ch.c_code is not null and w.c_code_ref is not null THEN 6
                    WHEN a.i_enabled = 2 THEN 7
                    WHEN a.i_problem = 1 THEN 8
                    ELSE NULL END AS i_groupMenu  
    FROM (
    select a.* from (
            /* รายการ จ้าง/เช่า แหล่งเงิน 1*/
            select distinct a.tor_id,a.i_type_bg,a.dc_expense_budget_type_id as dc_expense_budget_type_id,a.c_code,  a.f_type_amt as f_type_amt, 1 as i_is_bg, 1 as i_is_hdr, a.i_purchase
            , a.tor_status_id , (select c_name from sp_status_hdr where sp_status_hdr_id=a.tor_status_id) as sp_type_status ,a.i_enabled, a.i_problem
            from sp_tor a
            inner join sp_tor_dtl b on b.sp_tor_id = a.tor_id 
            where  isnull(a.dc_expense_budget_type_id,0) <> 0 and a.i_purchase in (2,3) and a.i_is_notor<>1 and a.i_type_bg = 1
            union
            /* รายการ จ้าง/เช่า แหล่งเงิน 2*/
            select distinct a.tor_id,a.i_type_bg,a.dc_expense_budget_type2_id as dc_expense_budget_type_id,a.c_code, a.f_type2_amt as f_type_amt, 2 as i_is_bg, 1 as i_is_hdr, a.i_purchase 
            , a.tor_status_id , (select c_name from sp_status_hdr where sp_status_hdr_id=a.tor_status_id) as sp_type_status ,a.i_enabled, a.i_problem
            from sp_tor a
            inner join sp_tor_dtl b on b.sp_tor_id = a.tor_id 
            where  isnull(a.dc_expense_budget_type2_id,0) <> 0 and a.i_purchase in (2,3) and a.i_is_notor<>1 and a.i_type_bg = 1
            union
            /* รายการ ซื้อ แหล่งเงิน 1*/
            select distinct a.tor_id,a.i_type_bg, b.dc_bg_budget_type_id as dc_expense_budget_type_id,a.c_code ,b.f_unit_price as f_type_amt
            , row_number() over (PARTITION BY b.sp_tor_id order by b.sp_tor_dtl_id asc)  as i_is_bg, 2 as i_is_hdr , a.i_purchase , a.tor_status_id 
            , (select c_name from sp_status_hdr where sp_status_hdr_id=a.tor_status_id) as sp_type_status ,a.i_enabled, a.i_problem
            from sp_tor a 
            inner join sp_tor_dtl b on b.sp_tor_id = a.tor_id 
            where a.i_purchase = 1 and a.i_is_notor<>1 and a.i_type_bg = 1 
            ) a  
            where a.c_code is not null   
    ) a
            inner join sp_tor aa on aa.tor_id = a.tor_id
            left join sp_tor_contract b on b.sp_tor_id = a.tor_id 
            inner join sp_status_hdr c on c.sp_status_hdr_id = a.tor_status_id
            left join sp_tor_hdr_period h on h.sp_tor_contract_id = b.sp_tor_contract_id
            left join sp_check_period_hdr ch on ch.sp_tor_hdr_period_id = h.sp_tor_hdr_period_id
            left join sp_withdraw w on w.sp_check_period_hdr_id = ch.sp_check_period_hdr_id
    where isnull(a.dc_expense_budget_type_id ,0) <> 0
    and aa.i_product_type = 2
    order by i_groupMenu;"; 
        $stmt = $db->QueryParam($sql , array());
        $re_id = $keyName;
 
 

if ($stmt) {
    $db->CommitTran();
//    sleep(6);
    $re = array("reval" => 0, "success" => "Success", "msg" => "บันทึกเรียบร้อยแล้ว", "yyymm" => $re_id);
} else {
    $db->RollBackTran();
    $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : {$sql}");
}

echo json_encode($re);
exit;
