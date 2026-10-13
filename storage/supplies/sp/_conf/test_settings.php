<?php
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require __DIR__ . '/mysql_connect.php';
$names = ['SP_MYSQL_ENV','APP_ENV','MYSQL_DB_HOST','MYSQL_DB_PORT','MYSQL_DB_NAME','MYSQL_DB_USER','MYSQL_DB_PASS'];
$original=[];
foreach ($names as $name) { $original[$name]=getenv($name); putenv($name); }
$server=$_SERVER['SERVER_ADDR'] ?? null;
$localAddress=$_SERVER['LOCAL_ADDR'] ?? null;
unset($_SERVER['LOCAL_ADDR']);
function expectSetting($ok, $label) { if (!$ok) throw new RuntimeException($label); echo "PASS $label\n"; }
try {
    $_SERVER['SERVER_ADDR']='192.168.201.2';
    expectSetting(spMysqlSettings()['host']==='192.168.201.24', 'production web server selects MySQL server .24');
    unset($_SERVER['SERVER_ADDR']);
    $_SERVER['LOCAL_ADDR']='192.168.201.2';
    expectSetting(spMysqlSettings()['environment']==='production', 'IIS LOCAL_ADDR selects production when SERVER_ADDR is absent');
    $_SERVER['LOCAL_ADDR']='10.1.2.2';
    $settings=spMysqlSettings();
    expectSetting($settings['environment']==='production' && $settings['host']==='192.168.201.24' && $settings['port']===3306, 'production internal IIS address selects MySQL .24:3306');
    unset($_SERVER['LOCAL_ADDR']);
    $_SERVER['SERVER_ADDR']='192.168.201.24';
    expectSetting(spMysqlSettings()['host']==='192.168.201.24', 'production server selects production profile');
    $_SERVER['SERVER_ADDR']='127.0.0.1';
    expectSetting(spMysqlSettings()['host']==='localhost', 'localhost selects development profile');
    unset($_SERVER['SERVER_ADDR']);
    expectSetting(spMysqlSettings()['environment']==='development', 'CLI defaults to development');
    putenv('APP_ENV=production');
    expectSetting(spMysqlSettings()['environment']==='production', 'APP_ENV override');
    putenv('SP_MYSQL_ENV=local');
    expectSetting(spMysqlSettings()['environment']==='development', 'SP_MYSQL_ENV has precedence');
    putenv('MYSQL_DB_HOST=127.0.0.1'); putenv('MYSQL_DB_PORT=3307'); putenv('MYSQL_DB_PASS=');
    $settings=spMysqlSettings();
    expectSetting($settings['host']==='127.0.0.1' && $settings['port']===3307 && $settings['pass']==='', 'connection overrides including empty password');
    putenv('MYSQL_DB_PORT=0');
    try { spMysqlSettings(); throw new LogicException('Invalid port accepted'); } catch (RuntimeException $e) { echo "PASS invalid port rejected\n"; }
    putenv('SP_MYSQL_ENV=invalid');
    try { spMysqlSettings(); throw new LogicException('Invalid environment accepted'); } catch (RuntimeException $e) { echo "PASS unknown environment rejected\n"; }
} finally {
    foreach ($original as $name=>$value) putenv($value===false ? $name : $name.'='.$value);
    if ($server===null) unset($_SERVER['SERVER_ADDR']); else $_SERVER['SERVER_ADDR']=$server;
    if ($localAddress===null) unset($_SERVER['LOCAL_ADDR']); else $_SERVER['LOCAL_ADDR']=$localAddress;
}
