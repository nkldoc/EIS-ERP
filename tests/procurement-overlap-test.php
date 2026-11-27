<?php
require __DIR__ . '/../public/supplies/bi/api/ProcurementOverlap.php';
function checkOverlap($condition, $message) { if (!$condition) throw new RuntimeException($message); }
function evidence($source, $code = '', $verified = false, $flag = null) {
    return array('source'=>$source, 'code'=>$code, 'verified'=>$verified, 'overlap_flag'=>$flag);
}
$base = array('i_type_bg'=>4);
$cases = array(
    array($base, array(evidence('PR')), 'ยังไม่ก่อหนี้'),
    array($base, array(evidence('PR'),evidence('PO')), 'ก่อหนี้แล้ว'),
    array(array('i_type_bg'=>1), array(evidence('PR'),evidence('PO')), 'ไม่เข้าข่ายกันเหลื่อม'),
    array($base, array(evidence('PO','INVALID')), 'ต้องตรวจสอบ'),
    array($base, array(evidence('PO','',false,3)), 'ต้องตรวจสอบ'),
    array($base, array(evidence('PO','SECOND',true)), 'บันทึกใช้ใบกันแล้ว'),
    array($base, array(evidence('ใบกัน NMU_EIS','DOC',true)), 'ยังไม่ก่อหนี้'),
    array($base, array(evidence('จองใบกัน','DOC',true)), 'จองใช้ใบกัน'),
    array($base, array(evidence('ใบกัน NMU_EIS','DOC',true), evidence('PO')), 'ยังไม่ก่อหนี้'),
    array($base, array(evidence('PO','VALID',true), evidence('PO','INVALID')), 'ต้องตรวจสอบ')
);
foreach ($cases as $case) checkOverlap(procurementOverlapClassify($case[0],$case[1])['overlap_status']===$case[2],$case[2]);
$result=procurementOverlapClassify($base,array(evidence('PO','FIRST',true),evidence('PO','SECOND',true),evidence('AP','SECOND',true)));
checkOverlap(count($result['overlap_warnings'])===0,'AP may use the second PO slot');
$result=procurementOverlapClassify($base,array(evidence('PO','FIRST',true),evidence('AP','OTHER',true)));
checkOverlap(count($result['overlap_warnings'])===1,'AP mismatch must be visible');
$fetch=function($sql,$params){
    if(strpos($sql,'FROM dbo.sp_tor_contract WHERE')!==false)return array(
        array('sp_tor_id'=>1,'c_code'=>'PO1','c_overlap'=>'FIRST','c_overlap2'=>'SECOND','i_overlap'=>2,'i_overlap2'=>3,'i_yyyy_overlap'=>2568,'i_yyyy_overlap2'=>2569),
        array('sp_tor_id'=>1,'c_code'=>'PO2','c_overlap'=>null,'c_overlap2'=>null,'i_overlap'=>null,'i_overlap2'=>null,'i_yyyy_overlap'=>null,'i_yyyy_overlap2'=>null));
    if(strpos($sql,'FROM dbo.sp_tor_contract c INNER JOIN')!==false)return array(array('sp_tor_id'=>1,'c_code'=>'CHK','c_code_debt'=>'AP1','c_overlap'=>'SECOND','i_yyyy_overlap'=>2569,'i_overlap'=>3,'payment_code'=>'PAY1','c_booking'=>'SECOND','i_budget_year_overlap'=>2026));
    if(strpos($sql,'FROM NMU_EIS.dbo.bg_reserve_overlap r')!==false){checkOverlap(strpos($sql,'r.i_sys=1')!==false,'Reserve must be scoped to ERP');return array();}
    if(strpos($sql,'c_code IN')!==false)return array(array('c_code'=>'FIRST','i_year'=>2025,'i_status'=>5,'i_overlap_type'=>2),array('c_code'=>'SECOND','i_year'=>2026,'i_status'=>5,'i_overlap_type'=>1));
    return array();
};
$row=array('tor_id'=>1,'pr_code'=>'PR1','i_type_bg'=>4,'pr_overlap_code'=>'FIRST','pr_overlap_year'=>2025,'pr_overlap_flag'=>1);
$rows=procurementOverlapEnrich(array($row),$fetch);
checkOverlap(count($rows)===1,'Multiple contracts must not duplicate a PR');
checkOverlap($rows[0]['overlap_status']==='บันทึกใช้ใบกันแล้ว','Validate both PO slots');
checkOverlap(count($rows[0]['overlap_warnings'])===0,'Buddhist and Gregorian years must match');
checkOverlap(count(array_filter($rows[0]['overlap_evidence'],function($i){return $i['reference']==='PO2';}))===2,'Keep all active contracts, including empty slots');
echo "PASS: overlap groups, second slot, multiple contracts, AP mismatch, system scope, year normalization\n";

$po = evidence('PO','DOC',true); $po['po_id'] = 10;
$ap = evidence('AP','DOC',true); $ap['po_id'] = 20;
checkOverlap(procurementOverlapClassify($base,array($po,$ap))['overlap_status']==='ต้องตรวจสอบ','AP cannot borrow evidence from another contract');
$doc = evidence('ใบกัน NMU_EIS','DOC',true); $doc['po_id'] = 10;
checkOverlap(procurementOverlapClassify($base,array($doc))['overlap_debt_status']==='ก่อหนี้แล้ว','Document po_id is debt evidence');
$doc['year_mismatch'] = true;
checkOverlap(procurementOverlapClassify($base,array($doc))['overlap_status']==='ต้องตรวจสอบ','Year mismatch must take precedence');
echo "PASS: registry versus usage, reservation, debt link, partial invalid evidence, per-contract AP matching\n";
