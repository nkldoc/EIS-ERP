<?php
require __DIR__ . '/../public/supplies/sp/tor/api/checkingFinance.php';
function expectMoney($actual, $expected, $label) {
    if ($actual !== $expected) throw new RuntimeException($label . ': expected ' . $expected . ', got ' . $actual);
}
function financeFixture($amount = '408000.00') {
    return array(
        'sp_check_period_hdr'=>array(array('f_total'=>$amount,'i_vat_amt'=>1,'f_rate_vat'=>7,'i_tax_personal'=>1,
            'f_tax_personal_rate'=>1,'i_rate'=>0,'f_tax_warranty_rate'=>5,'f_fine_amt'=>'160752.00','f_other'=>0)),
        'sp_check_period_dtl'=>array(array('sp_check_period_dtl_id'=>1,'i_qty'=>1,'f_net_unit_price'=>$amount,'f_net_total_price'=>$amount)),
        'sp_tranf_item'=>array(array('sp_tranf_item_id'=>2,'sp_check_period_dtl_id'=>1,'sp_tranf_hdr_id'=>3,
            'f_net_total_price'=>$amount,'f_wip_total_price'=>0,'f_under_total_price'=>0,'f_vat_amt'=>0)),
        'sp_tranf_hdr'=>array(array('sp_tranf_hdr_id'=>3,'f_net_total_price'=>$amount))
    );
}
$data=calculateCheckingFinance(financeFixture(),array('kind'=>'header'));
$header=$data['sp_check_period_hdr'][0];
foreach(array('f_total_add_vat_amt'=>'381308.41','f_vat_amt'=>'26691.59','f_tax_personal'=>'3813.08','f_pay'=>'243434.92') as $field=>$expected) expectMoney($header[$field],$expected,$field);
expectMoney($data['sp_tranf_item'][0]['f_sum_Transf'],'408000.00','send-account total');
expectMoney($data['sp_tranf_hdr'][0]['f_net_total_price'],'408000.00','debt header');
$input=financeFixture('107.00');$input['sp_check_period_hdr'][0]['i_rate']=1;
$data=calculateCheckingFinance($input,array('kind'=>'header'),array('mode'=>'percent','rate'=>2));
foreach(array('f_vat_amt'=>'7.00','f_tax_personal'=>'1.00','f_warranty'=>'5.35','f_fine_amt'=>'2.14','f_pay'=>'98.51') as $field=>$expected) expectMoney($data['sp_check_period_hdr'][0][$field],$expected,$field);
$input['sp_check_period_hdr'][0]['i_vat_amt']=0;$input['sp_check_period_hdr'][0]['i_tax_personal']=0;$input['sp_check_period_hdr'][0]['i_rate']=0;$input['sp_check_period_hdr'][0]['f_fine_amt']=0;
$data=calculateCheckingFinance($input,array('kind'=>'header'));
foreach(array('f_total_add_vat_amt'=>'107.00','f_vat_amt'=>'0.00','f_tax_personal'=>'0.00','f_warranty'=>'0.00','f_pay'=>'107.00') as $field=>$expected) expectMoney($data['sp_check_period_hdr'][0][$field],$expected,'flags off '.$field);
$input=financeFixture('107.00');$input['sp_check_period_hdr'][0]['f_fine_amt']=0;
$input['sp_check_period_dtl'][0]['i_qty']=2;
$data=calculateCheckingFinance($input,array('kind'=>'items','row_id'=>1,'field'=>'i_qty'));
expectMoney($data['sp_check_period_hdr'][0]['f_total'],'214.00','quantity drives gross');
expectMoney($data['sp_tranf_item'][0]['f_net_total_price'],'214.00','quantity drives debt');
$input['sp_tranf_item'][0]['f_net_total_price']='321.00';
$data=calculateCheckingFinance($input,array('kind'=>'debts'));
expectMoney($data['sp_check_period_dtl'][0]['f_net_total_price'],'321.00','debt drives inspection');
expectMoney($data['sp_check_period_dtl'][0]['f_net_unit_price'],'160.50','debt updates unit price');
$input=financeFixture('107.00');$input['sp_check_period_hdr'][0]['f_fine_amt']=0;
$input['sp_check_period_hdr'][0]['i_edit_vat']=1;$input['sp_check_period_hdr'][0]['f_vat_amt']='6.00';
$data=calculateCheckingFinance($input,array('kind'=>'header'));
expectMoney($data['sp_check_period_hdr'][0]['f_total_add_vat_amt'],'101.00','manual header VAT');
expectMoney($data['sp_tranf_item'][0]['f_vat_amt'],'6.00','manual VAT synchronizes line');
$input['sp_check_period_hdr'][0]['i_edit_vat']=0;$input['sp_tranf_item'][0]['f_vat_amt']='6.50';
$data=calculateCheckingFinance($input,array('kind'=>'debts'),array(),array(2));
expectMoney($data['sp_check_period_hdr'][0]['f_vat_amt'],'6.50','manual line VAT');
$input=financeFixture('214.00');$input['sp_check_period_hdr'][0]['f_fine_amt']=0;
$input['sp_tranf_item'][0]['f_net_total_price']=0;$input['sp_tranf_item'][0]['f_wip_total_price']='107.00';
$data=calculateCheckingFinance($input,array('kind'=>'header'));
expectMoney($data['sp_tranf_item'][0]['f_wip_total_price'],'214.00','work in progress amount');
expectMoney($data['sp_tranf_item'][0]['f_net_total_price'],'0.00','preserve work in progress bucket');
$input=financeFixture('0.21');$input['sp_check_period_hdr'][0]['f_fine_amt']=0;
$input['sp_check_period_dtl'][0]['f_net_total_price']='0.21';
$input['sp_tranf_item']=array();
for($i=0;$i<3;$i++)$input['sp_tranf_item'][]=array('sp_tranf_item_id'=>$i+10,'sp_check_period_dtl_id'=>1,'sp_tranf_hdr_id'=>3,'f_net_total_price'=>'0.07');
$data=calculateCheckingFinance($input,array('kind'=>'debts'));
expectMoney($data['sp_check_period_hdr'][0]['f_vat_amt'],'0.00','VAT rounds per line, then sums');
for($amount=0;$amount<10000;$amount+=37) {
    $parts=checkingAllocate($amount,array(1,2,3,0));
    if(array_sum($parts)!==$amount)throw new RuntimeException('allocation loses cents');
}
$input=financeFixture('107.00');$input['sp_check_period_hdr'][0]['f_fine_amt']=0;
try { calculateCheckingFinance($input,array('kind'=>'header'),array('mode'=>'percent','rate'=>101)); throw new RuntimeException('invalid rate accepted'); }
catch(InvalidArgumentException $expected) {}
echo "PASS: original VAT/Tax/pay example, percentage warranty/fine, flags, line rounding, quantity/debt/header synchronization, manual VAT, work in progress, and cent allocation\n";
