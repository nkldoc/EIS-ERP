<?php
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require __DIR__ . '/../classes/EndpointSender.php';
function check($value, $message) { if (!$value) throw new Exception($message); }
$rows = [['tor_id' => 1768, 'amount' => 125.5, 'note' => null, 'excluded' => 'omit']];
$fields = [['source' => 'tor_id', 'target' => 'pr_id'], ['source' => 'amount', 'target' => 'total'], ['source' => 'note', 'target' => 'remark']];
$mapped = EndpointSource::mapRows($rows, array_keys($rows[0]), $fields);
check($mapped === [['pr_id' => 1768, 'total' => 125.5, 'remark' => null]], 'Mapping must rename, exclude fields and preserve types');
check(EndpointSource::mapRows([], array_keys($rows[0]), $fields) === [], 'Empty result metadata must support mapping');
check(EndpointSource::mapRows($rows, array_keys($rows[0]), []) === $rows, 'Legacy endpoints keep all fields');
foreach ([
    [['source'=>'missing','target'=>'id']],
    [['source'=>'tor_id','target'=>'id'],['source'=>'amount','target'=>'ID']],
    [['source'=>'tor_id','target'=>'bad name']],
    [['source'=>'tor_id','target'=>'id'],['source'=>'tor_id','target'=>'other']]
] as $invalid) {
    $rejected = false;
    try { EndpointSource::mapRows($rows, array_keys($rows[0]), $invalid); } catch (InvalidArgumentException $e) { $rejected = true; }
    check($rejected, 'Invalid mapping must be rejected');
}
foreach (['SELECT * FROM sp_tor_contract', 'SELECT tor_id AS pr_id FROM sp_tor_contract'] as $sql) EndpointSource::validateQuery($sql);
foreach (['SELECT 1 DELETE FROM t', 'SELECT 1; SELECT 2', 'SELECT * INTO x FROM t', 'EXEC proc', "SELECT * FROM OPENQUERY(remote, 'SELECT 1')"] as $sql) {
    $rejected = false;
    try { EndpointSource::validateQuery($sql); } catch (InvalidArgumentException $e) { $rejected = true; }
    check($rejected, 'Unsafe SQL must be rejected');
}
$input = ['name'=>'Example','uri'=>'/procure/ir','method'=>'POST','active'=>true,'query'=>'SELECT * FROM sp_tor_contract','database'=>'NMU_ERP','fields'=>$fields];
check(EndpointSender::validate($input) === $input, 'Persisted source settings must survive validation');
echo "PASS: field selection, aliases, types, nulls, empty data, legacy behavior, SQL validation and source settings\n";
