const fs = require('node:fs');
const { spawnSync } = require('node:child_process');
const assert = require('node:assert/strict');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../public/supplies/sp/tor/api/mnProjectOverlapAdmin.php'), 'utf8')
  .replace(/^<\?php\s*/, '').replace(/^require .*;\r?\n/gm, '');
// Run the real endpoint with isolated database and budget API doubles, never live credentials.
for (const [scenario, expected, updated] of [
  ['anonymous', 401, false], ['non-admin', 403, false], ['bad-token', 403, false],
  ['missing-child', 409, false], ['downstream', 409, false], ['unbooked', 200, true],
  ['missing-reference', 409, false], ['cancel-failed', 409, false], ['booked', 200, true],
]) {
  const harness = `<?php
    $scenario='${scenario}'; $updated=false; $calls=0; $urls=[];
    $_SESSION=['user_id'=>$scenario==='anonymous'?0:($scenario==='non-admin'?2:1),'dc_cost_id'=>1,'project_overlap_token'=>'x'];
    $_POST=['token'=>$scenario==='bad-token'?'bad':'x','sp_tor_contract_id'=>5,'parent_id'=>2];
    $_SERVER['REQUEST_METHOD']='POST';
    define('SQLSRV_FETCH_ASSOC',2); define('IPAPIBG','https://example.invalid/api');
    define('CURLOPT_RETURNTRANSFER',1); define('CURLOPT_CONNECTTIMEOUT',2); define('CURLOPT_TIMEOUT',3); define('CURLINFO_HTTP_CODE',4);
    class DatabaseServer {public $conn=1;}
    function sqlsrv_begin_transaction($c){return true;}
    function sqlsrv_commit($c){return true;}
    function sqlsrv_rollback($c){return true;}
    function sqlsrv_query($c,$sql,$args){global $calls,$updated;
      if(strpos($sql,'UPDATE dbo.sp_tor_contract')!==false)$updated=true;return ++$calls;}
    function sqlsrv_fetch_array($s,$type){global $scenario;
      if($s===1){if($scenario==='missing-child')return null;
        return ['i_overlap'=>in_array($scenario,['booked','cancel-failed','missing-reference'])?2:0,
          'bg_reserve_overlap_id'=>in_array($scenario,['booked','cancel-failed'])?99:0,
          'bg_reserve_money1_id'=>$scenario==='booked'?88:0];}
      return $scenario==='downstream'?['sp_check_period_hdr_id'=>10]:null;}
    function curl_init($url){global $urls;$urls[]=$url;return 1;}
    function curl_setopt_array($c,$opts){}
    function curl_exec($c){global $scenario;return json_encode(['success'=>$scenario!=='cancel-failed']);}
    function curl_getinfo($c,$key){return 200;}
    function curl_close($c){}
    register_shutdown_function(function(){global $updated,$urls;
      file_put_contents('php://stderr',json_encode(['status'=>http_response_code(),'updated'=>$updated,'urls'=>$urls]));});
  `;
  const result = spawnSync('php', ['-n'], { input: harness + source, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  const meta = JSON.parse(result.stderr);
  assert.equal(meta.status, expected, scenario);
  assert.equal(meta.updated, updated, scenario);
  if (scenario === 'booked') {
    assert.equal(meta.urls.length, 2);
    assert.ok(meta.urls[0].endsWith('/bg_reserve_money_id/88/i_enable/2'));
    assert.ok(meta.urls[1].endsWith('/bg_reserve_overlap_id/99/i_enable/2'));
  }
  if (['anonymous','non-admin','bad-token','missing-child','downstream','missing-reference'].includes(scenario)) {
    assert.equal(meta.urls.length, 0, scenario);
  }
  console.log('PASS ' + scenario);
}
