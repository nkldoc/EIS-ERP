<?php
function checkNumber($num) {
    if (!$num) {
        throw new Exception('Division by zero.');
    } else {
        return "$num x 10 / $num = " . ($num * 10 / $num);
    }
}

$timmer = Intval(2);
$loop = Intval(10);
while (true) {

    try {
        print checkNumber($loop);
    } catch (Exception $e) {
        print 'Exception Message: ' . $e->getMessage();
        break;
    } finally {
        print ("\n\r");
    }
 

    $loop--;
    sleep($timmer);
}
