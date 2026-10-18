<?php
function checkingPreflightYear($value) {
    $year = intval($value ?? 0);
    if($year>=2400)$year-=543;
    return $year>=1900&&$year<=2399?$year:null;
}
function analyzeCheckingPreflight($check, $contract, $period, $debts, $currentYear, $closedPeriod, $billing, $today=null) {
    $results = array();
    $add = function ($code,$title,$status,$message,$evidence,$action='') use (&$results) {
        $results[] = array('code'=>$code,'title'=>$title,'status'=>$status,'message'=>$message,'evidence'=>$evidence,'action'=>$action);
    };
    $code = trim((string) ($check['resolved_overlap_code'] ?? $check['c_overlap'] ?? ''));
    $year = checkingPreflightYear($check['resolved_overlap_year'] ?? $check['i_yyyy_overlap'] ?? $check['i_yyyy'] ?? null);
    $overlap = intval($contract['i_overlap'] ?? 0);
    $date = substr((string) ($check['d_checking_date'] ?? ''),0,10);
    $usesToday=trim($date)==='';
    if($usesToday)$date=$today??(new DateTimeImmutable('now',new DateTimeZone('Asia/Bangkok')))->format('Y-m-d');
    $parsedDate=DateTimeImmutable::createFromFormat('!Y-m-d',$date);
    if(!$parsedDate||$parsedDate->format('Y-m-d')!==$date)$date='';
    // เทียบปีของวันที่ตรวจรับโดยตรงกับปีที่ใช้เงิน ไม่เลื่อนปีในเดือนตุลาคม
    $currentYear = $date ? intval(substr($date,0,4)) : null;
    $carryover = $year && $currentYear && $year !== $currentYear;
    $years = array('ปีตามวันที่ตรวจรับ: '.($currentYear ? $currentYear+543 : 'ไม่พบข้อมูล'),
        'ปีที่ใช้เงิน: '.($year ? $year+543 : 'ไม่ระบุ'));
    if (!$currentYear || !$year) $add('BILLING','เงินปีปัจจุบันต้องวางบิลก่อน','warning','ยังยืนยันปีที่ใช้เงินไม่ได้',$years,'ตรวจวันที่ตรวจรับและปีที่ใช้เงินในใบตรวจรับ');
    elseif ($carryover) $add('BILLING','เงินปีปัจจุบันต้องวางบิลก่อน','pass','เป็นรายการเงินกันเหลื่อม/ต่างปี จึงไม่เข้าเงื่อนไขเงินปีปัจจุบัน',$years);
    elseif ($billing === null) $add('BILLING','เงินปีปัจจุบันต้องวางบิลก่อน','warning','อ่านข้อมูลการวางบิลไม่สำเร็จ',$years,'ตรวจสอบรายการวางบิลอีกครั้ง');
    else {
        $codes = array();
        foreach ($billing as $row) if (trim((string) ($row['c_code'] ?? '')) !== '') $codes[]=$row['c_code'];
        $passed = count($codes)>0 && intval($check['i_status_billing'] ?? 0)===4;
        $add('BILLING','เงินปีปัจจุบันต้องวางบิลก่อน',$passed?'pass':'block',
            $passed?'มีเลขวางบิลและผ่านรายการวางบิลแล้ว':(count($codes)?'มีเลขวางบิล แต่ยังไม่ผ่านรายการวางบิล':'ยังไม่มีเลขวางบิล'),
            array_merge($years,array('เลขวางบิล: '.($codes?implode(', ',$codes):'ไม่มี'),'สถานะวางบิล: '.($check['i_status_billing']??'ไม่ระบุ'))),
            $passed?'':'จัดทำและผ่านรายการวางบิลก่อนส่งเบิก');
    }
    $closedValid=$closedPeriod&&checkingPreflightYear($closedPeriod['c_yyyy']??null)&&intval($closedPeriod['c_mm']??0)>=1&&intval($closedPeriod['c_mm']??0)<=12;
    $checkingPeriod = $date ? substr($date,5,2).'/'.(intval(substr($date,0,4))+543) : 'ไม่ระบุ';
    $displayDate = $date ? substr($date,8,2).'-'.substr($date,5,2).'-'.(intval(substr($date,0,4))+543) : 'ไม่ระบุ';
    $checkingCode=trim((string)($check['c_code']??''));
    if ($checkingCode !== '') $add('CLOSED_PERIOD','?????????????????????????????????????????','pass',
        '????????????????? ????????????????/???????????',array('??????????: '.$checkingCode));
    elseif (!$date || !$closedValid) $add('CLOSED_PERIOD','ตรวจปิดงวดบัญชีประจำเดือนจากวันที่ตรวจรับ','warning',
        !$date?'วันที่ตรวจรับไม่ครบหรือไม่ถูกต้อง':'ไม่พบข้อมูลงวดบัญชีที่ปิดล่าสุด',array('วันที่ตรวจรับ: '.$displayDate,'เดือน/ปีที่นำไปตรวจปิดงวด: '.$checkingPeriod),'ตรวจสอบวันที่ตรวจรับและสถานะปิดงวดกับฝ่ายบัญชี');
    else {
        $checkingMonth = intval(substr($date,0,4))*100+intval(substr($date,5,2));
        $closedMonth = checkingPreflightYear($closedPeriod['c_yyyy'])*100+intval($closedPeriod['c_mm']);
        $blocked = $checkingMonth <= $closedMonth;
        $add('CLOSED_PERIOD','ตรวจปิดงวดบัญชีประจำเดือนจากวันที่ตรวจรับ',$blocked?'block':'pass',
            $blocked?'เดือน/ปีของวันที่ตรวจรับอยู่ในงวดบัญชีหรือปีที่ปิดแล้ว':'เดือน/ปีของวันที่ตรวจรับอยู่หลังงวดบัญชีที่ปิดล่าสุด',
            array('วันที่ตรวจรับ: '.$displayDate,'เดือน/ปีที่นำไปตรวจปิดงวด: '.$checkingPeriod,
                'งวดบัญชีปิดล่าสุด (ระบบจัดซื้อ): '.sprintf('%02d',intval($closedPeriod['c_mm'])).'/'.(checkingPreflightYear($closedPeriod['c_yyyy'])+543)),
            $blocked?'ให้ฝ่ายบัญชีตรวจสอบและยืนยันงวดที่อนุญาตก่อนส่งเบิก':'');
    }
    $active = $period && intval($period['i_enabled'] ?? 0)===1;
    $add('PERIOD','สถานะใช้งานของงวด',$active?'pass':'block',$active?'งวดตามสัญญายังใช้งานอยู่':($period?'งวดนี้ไม่อยู่ในสถานะใช้งาน':'ไม่พบงวดที่เชื่อมกับใบตรวจรับ'),
        array('งวดเงิน: '.($period['i_period']??'ไม่ระบุ'),'สถานะงวด: '.($period['i_enabled']??'ไม่พบข้อมูล')),
        $active?'':'ตรวจสอบงวดและให้ผู้มีสิทธิ์เปิดใช้งานงวดที่ถูกต้อง');
    $transactionYear=$date?intval(substr($date,0,4))+(intval(substr($date,5,2))>=10?1:0):null;
    $recordYear=checkingPreflightYear($check['i_yyyy']??null);
    $deductionYear=checkingPreflightYear($check['i_yyyy_overlap']??null);
    $carryoverYears=array('วันที่ตรวจรับ: '.$displayDate,
        'ปีงบประมาณจากวันที่ตรวจรับ (ต.ค.–ธ.ค. บวก 1 ปี): '.($transactionYear?$transactionYear+543:'ไม่ระบุ'),
        'ปีปัจจุบันในรายการ (i_yyyy): '.($recordYear?$recordYear+543:'ไม่ระบุ'),
        'ปีที่หักเงินงบประมาณ: '.($deductionYear?$deductionYear+543:'ไม่ระบุ'));
    if (!$deductionYear || !$transactionYear) $add('CARRYOVER','ใบกันเงินและการยืนยันกันเหลื่อมในสัญญา','warning','ยังตรวจเงื่อนไขใช้ใบกันไม่ได้',$carryoverYears,'ตรวจปีที่ทำรายการและปีที่หักเงินงบประมาณให้ครบ');
    elseif ($transactionYear <= $deductionYear) $add('CARRYOVER','ใบกันเงินและการยืนยันกันเหลื่อมในสัญญา','pass',
        $transactionYear===$deductionYear?'ปีที่ทำรายการตรงกับปีที่หักเงินงบประมาณ เป็นเงินปีปัจจุบัน ไม่ต้องใช้ใบกัน':'ปีที่ทำรายการไม่มากกว่าปีที่หักเงินงบประมาณ จึงไม่เข้าเงื่อนไขใช้ใบกัน',$carryoverYears);
    else {
        $matched = false;
        foreach (array(array('c_overlap','i_yyyy_overlap'),array('c_overlap2','i_yyyy_overlap2')) as $fields) {
            if ($code!=='' && $code===trim((string)($contract[$fields[0]]??'')) && $deductionYear===checkingPreflightYear($contract[$fields[1]]??null)) $matched=true;
        }
        $confirmed = $matched && $overlap===3;
        $add('CARRYOVER','ใบกันเงินและการยืนยันกันเหลื่อมในสัญญา',$confirmed?'pass':'block',
            $confirmed?'เลขใบกันและปีตรงกับสัญญาที่ยืนยันกันเหลื่อมก่อหนี้แล้ว':($code===''?'ต่างปี/กันเหลื่อม แต่ยังไม่มีเลขใบกัน':'สัญญายังไม่ยืนยันกันเหลื่อมก่อหนี้ หรือเลขใบกัน/ปีไม่ตรงกัน'),
            array_merge($carryoverYears,array('ใบกันตรวจรับ: '.($code?:'ไม่มี'),'ใบกันสัญญา: '.($contract['c_overlap']??'ไม่มี'),
                'ใบกันที่ 2: '.($contract['c_overlap2']??'ไม่มี'),'สถานะกันเหลื่อมสัญญา: '.$overlap)),
            $confirmed?'':'ตรวจเลขใบกันและปีที่ใช้เงิน แล้วให้ผู้รับผิดชอบยืนยันกันเหลื่อมก่อหนี้ในสัญญา');
    }
    $sum=0;$missingAccounts=0;
    foreach($debts as $row){$sum+=(int)round(floatval($row['total_amount']??0)*100);if(empty($row['account_code']))$missingAccounts++;}
    $amount=(int)round(floatval($check['f_inv_vat']??$check['f_total']??0)*100);
    $checkingCode=trim((string)($check['c_code']??''));
    $issues=array();$actions=array();
    if($checkingCode===''){$issues[]='ยังไม่ออกเลขตรวจรับ';$actions[]='ออกเลขตรวจรับในระบบก่อนส่งเบิก';}
    if(!$debts){$issues[]='ยังไม่บันทึกรายการก่อหนี้';$actions[]='บันทึกรายการก่อหนี้';}
    else {
        if($missingAccounts){$issues[]='รายการก่อหนี้ยังระบุผังบัญชีไม่ครบ';$actions[]='ระบุผังบัญชีให้ครบทุกรายการ';}
        if($sum<=0){$issues[]='ยอดก่อหนี้ต้องมากกว่าศูนย์';$actions[]='ตรวจสอบยอดก่อหนี้';}
        if($sum!==$amount){$issues[]='ยอดก่อหนี้ไม่เท่ากับยอดขอเบิก';$actions[]='ปรับยอดก่อหนี้ให้ตรงกับยอดขอเบิก';}
    }
    $valid=count($issues)===0;
    $message=$valid?'มีเลขตรวจรับ รายการก่อหนี้ ผังบัญชีครบ และยอดตรงกับใบตรวจรับ':implode(' / ',$issues);
    $add('DEBT','รายการก่อหนี้ก่อนส่งเบิก',$valid?'pass':'block',$message,
        array('เลขตรวจรับ: '.($checkingCode!==''?$checkingCode:'ยังไม่ออกเลข'),'จำนวนรายการ: '.count($debts),'รวมก่อหนี้: '.number_format($sum/100,2),'ยอดขอเบิก: '.number_format($amount/100,2),'ยังไม่มีผังบัญชี: '.$missingAccounts),
        implode(' / ',$actions));
    $ordered=array();
    foreach(array('PERIOD','CLOSED_PERIOD','CARRYOVER','DEBT','BILLING') as $ruleCode){
        foreach($results as $row)if($row['code']===$ruleCode){
            if($usesToday&&in_array($ruleCode,array('CLOSED_PERIOD','CARRYOVER','BILLING'),true)){
                array_unshift($row['evidence'],'ยังไม่มีวันที่ตรวจรับ ใช้วันที่ปัจจุบันในการตรวจสอบ: '.$displayDate);
            }
            $ordered[]=$row;
        }
    }
    $results=$ordered;
    $blocked=0;$warnings=0;
    foreach($results as $row){if($row['status']==='block')$blocked++;if($row['status']==='warning')$warnings++;}
    return array('rules'=>$results,'blocked'=>$blocked,'warnings'=>$warnings,'ready'=>$blocked===0&&$warnings===0);
}
function loadCheckingPreflight($db,$check,$contract,$period,$debts) {
    $read=function($sql,$params=array())use($db){$stmt=@sqlsrv_query($db->conn,$sql,$params);if(!$stmt)return null;$rows=array();while($row=sqlsrv_fetch_array($stmt,SQLSRV_FETCH_ASSOC))$rows[]=$row;return $rows;};
    $years=$read('SELECT TOP 1 i_year_ad FROM '.DB_NMU_EIS.'bg_budget_year WHERE i_enable=1 AND i_status=1 ORDER BY i_year_ad DESC');
    $closed=$read("SELECT TOP 1 c_mm,c_yyyy FROM ".DB_NMU."gl_dc_period WHERE i_system='4' AND i_status=2 AND i_last_period=1 ORDER BY TRY_CONVERT(int,c_yyyy) DESC,TRY_CONVERT(int,c_mm) DESC");
    $billing=$read('SELECT c_code FROM dbo.sp_check_billing_items WHERE sp_check_period_hdr_id=?',array($check['sp_check_period_hdr_id']));
    $result=analyzeCheckingPreflight($check,$contract,$period,$debts,checkingPreflightYear($years[0]['i_year_ad']??null),$closed[0]??null,$billing);
    $result['check_code']=$check['c_code'];$result['payment_period']=$check['payment_period'];
    $now=new DateTimeImmutable('now',new DateTimeZone('Asia/Bangkok'));
    $result['analyzed_at']=$now->format('d-m-').(intval($now->format('Y'))+543).$now->format(' H:i:s');
    return $result;
}
