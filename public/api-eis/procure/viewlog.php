<?php
function preJson($json_string,$data="datax"){
    $preJson = '{"'.$data.'":['.substr_replace($json_string,"", -1).']}';  
    return $preJson;
}

try{
    $finename = $_GET['file']??null;
 
    
    if($finename==null){
        throw new Exception("file is null"); 
    }else if($finename){
        $json_string = @file_get_contents(__DIR__.'/logs/'.$finename.'-log.json'); 
        
        echo preJson($json_string);
        // print_r(json_decode(preJson($json_string),true)); 
     } 
  } catch (Exception $e) { 
    echo " Error : ".$e->getMessage();
}



//    $json = json_encode($result, JSON_PRETTY_PRINT); //    $json = json_encode($result); 
//    echo $json;