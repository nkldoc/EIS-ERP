<?php
// Offline mapper test: php -n tests/erp-confirmation-upsert-test.php
if(extension_loaded('sqlsrv'))exit('Run with php -n');
const SQLSRV_FETCH_ASSOC=2;
class ErpConfirmationMssqlException extends RuntimeException {}
function sqlsrv_fetch_array($stmt,$type){return array_shift($stmt->rows);}
function sqlsrv_free_stmt($stmt){}
function sqlsrv_next_result($stmt){return null;}
function sqlsrv_num_fields($stmt){return count($stmt->rows)?1:0;}
require __DIR__.'/../public/supplies/sp/api/erpConfirmationMapper.php';
$mode='existing';$writes=[];
$query=function($sql,$params)use(&$mode,&$writes){
    if(strpos($sql,'SELECT TOP (2)')===0)return (object)['rows'=>$mode==='new'?[]:($mode==='ambiguous'?[['sp_tor_period_bill_id'=>88],['sp_tor_period_bill_id'=>89]]:[['sp_tor_period_bill_id'=>88]])];
    if(strpos($sql,'SELECT c.name')===0){
        $rows=[];
        foreach($params[1]==='sp_tor_period_bill'?['pr','po','period','title']:['code','sp_tor_period_bill_id'] as $name)$rows[]=['name'=>$name,'type'=>'nvarchar','is_nullable'=>0,'is_identity'=>0,'is_computed'=>0,'generated_always_type'=>0,'default_object_id'=>0];
        return (object)['rows'=>$rows];
    }
    $writes[]=[$sql,$params];return (object)['rows'=>strpos($sql,'DECLARE @mapper_ids')===0?[['mapper_insert_id'=>'99']]:[]];
};
$doc=['source'=>'["line_ids"]','tables'=>[['schema'=>'dbo','name'=>'sp_tor_period_bill_receive'],['schema'=>'dbo','name'=>'sp_tor_period_bill']],'mapping'=>[]];
foreach(['pr_id'=>'pr','po_id'=>'po','period_id'=>'period','c_name'=>'title'] as $from=>$to)$doc['mapping'][]=[json_encode(['root',$from]),json_encode(['dbo','sp_tor_period_bill',$to])];
$doc['mapping'][]=[json_encode(['row','c_doc_ref']),json_encode(['dbo','sp_tor_period_bill_receive','code'])];
$payload='{"pr_id":1769,"po_id":449,"period_id":4081,"c_name":"updated title","line_ids":[{"c_doc_ref":"BL-1"},{"c_doc_ref":"BL-2"}]}';
$result=ErpConfirmationMapper::insert($doc,$payload,$query);
if(!$result['updated_master']||count($writes)!==3||strpos($writes[0][0],'UPDATE dbo.sp_tor_period_bill SET')!==0||$writes[0][1]!==[1769,449,4081,'updated title','88']||$writes[1][1]!==['BL-1','88']||$writes[2][1]!==['BL-2','88'])throw new Exception('Existing master update/link failed');
$mode='new';$writes=[];$result=ErpConfirmationMapper::insert($doc,$payload,$query);
if($result['updated_master']||count($writes)!==3||$writes[1][1]!==['BL-1','99'])throw new Exception('New master insert/link failed');
$mode='ambiguous';$writes=[];
try{ErpConfirmationMapper::insert($doc,$payload,$query);throw new Exception('Expected duplicate master rejection');}catch(InvalidArgumentException $e){if($writes)throw new Exception('Wrote before rejection');}
echo "PASS existing master UPDATE + new detail rows, new master INSERT + generated reference, ambiguous masters blocked; chk_id not required\n";
