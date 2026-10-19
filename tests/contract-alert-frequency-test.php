<?php
require_once __DIR__.'/../public/supplies/bi/api/ContractAlertFrequency.php';
$policy=contractAlertFrequencyDefaults();$times=['09:00','11:00','13:30','16:00'];$count=0;
function checkSlot($days,$date,$expected) {
    global $policy,$times,$count;
    $actual=contractAlertFrequencySlot($days,new DateTimeImmutable($date,new DateTimeZone('Asia/Bangkok')),$times,$policy);
    if ($actual!==$expected) throw new Exception("$days $date: unexpected slot");
    $count++;
}
checkSlot(32,'2026-10-19 12:00',null);
checkSlot(31,'2026-10-19 08:59',null);
checkSlot(31,'2026-10-19 09:00','09:00');
checkSlot(22,'2026-10-19 16:00','09:00');
checkSlot(22,'2026-10-20 10:00',null);
checkSlot(21,'2026-10-19 16:00','09:00');
checkSlot(8,'2026-10-22 16:00','09:00');
checkSlot(8,'2026-10-21 16:00',null);
checkSlot(7,'2026-10-20 09:00','09:00');
checkSlot(3,'2026-10-20 11:00','11:00');
checkSlot(2,'2026-10-20 13:30','13:30');
checkSlot(1,'2026-10-20 16:00','16:00');
checkSlot(0,'2026-10-20 16:01','16:00');
checkSlot(-1,'2026-10-20 10:00','09:00');
$policy=contractAlertFrequencyValidate(['monthDay'=>7,'threeWeekDays'=>[6,2]]);
checkSlot(25,'2026-10-25 11:00','09:00');
checkSlot(15,'2026-10-20 11:00','09:00');
checkSlot(15,'2026-10-19 11:00',null);
try {contractAlertFrequencyValidate(['monthDay'=>1,'threeWeekDays'=>[1,1]]);throw new Exception('Duplicate weekdays accepted');} catch (InvalidArgumentException $e) {$count++;}
try {contractAlertFrequencyValidate(['monthDay'=>8,'threeWeekDays'=>[1,4]]);throw new Exception('Invalid weekday accepted');} catch (InvalidArgumentException $e) {$count++;}
echo "Contract alert frequency: $count cases passed\n";
