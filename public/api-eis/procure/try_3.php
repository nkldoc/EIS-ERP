<?php
function divide($x, $y)
{
    $a = $x;
    $b = $y;
    
    try {
        //check avarribel
        if ($a != 0 && $b == 0) {
            throw new Exception("Division by zero.........1"); 
        }else if($a == 0 && $b == 0){
            throw new Exception("Division by 2"); 
        }

        $c = $a / $b;
        //commit
        echo " Resulte : ".$c;
        
    } catch (Exception $e) { 
        //Rollback
        echo " Error : ".$e->getMessage();
    }
}

$jsonobj = '{"method":"POST","postdt":"2023-07-05 14:32:57","datas":{"datatype":"periodBilling","data":[{"pr_id":513,"contract_id":532,"contract_code":"\u0e1e\u0e27\u0e0a.\u0e0b.02060\/2566","bg_budget_type_id":2,"bg_exp_id":139,"f_total_amt":1544800,"partner":"\u0e1a\u0e23\u0e34\u0e29\u0e31\u0e17 \u0e44\u0e1e\u0e23\u0e21\u0e4c \u0e40\u0e21\u0e14\u0e34\u0e04\u0e2d\u0e25 \u0e08\u0e33\u0e01\u0e31\u0e14","contract_type_id":3,"purchase_method_id":3,"date_end":"2023-03-21 00:00:00.000","ordering_date":"2023-09-30"}]}},
{"method":"PUT","postdt":"2023-07-05 14:35:16","datas":{"datatype":"closeContract","data":[{"pr_id":513,"contract_id":532,"contract_code":"\u0e1e\u0e27\u0e0a.\u0e0b.02060\/2566","bg_budget_type_id":2,"bg_exp_id":139,"f_total_amt":1544800,"partner":"\u0e1a\u0e23\u0e34\u0e29\u0e31\u0e17 \u0e44\u0e1e\u0e23\u0e21\u0e4c \u0e40\u0e21\u0e14\u0e34\u0e04\u0e2d\u0e25 \u0e08\u0e33\u0e01\u0e31\u0e14","contract_type_id":3,"purchase_method_id":3,"date_end":"2023-03-21 00:00:00.000","ordering_date":"2023-09-30"}]}},'; 

$preJson = '{"datax":['.substr_replace($jsonobj,"", -1).']}';  
print_r(json_decode($preJson));
exit();
 
// $exception = new Exception('Invalid username or password', 100); 
// $message =  $exception->getMessage();
// $code =  $exception->getCode();
// echo $code;
// echo $message;

divide(10,0);