<?php
declare(strict_types=1);
require __DIR__ . '/../app/Services/GitDeployment.php';
$git = getenv('TEST_GIT') ?: 'C:/Program Files/Git/cmd/git.exe';
$base = sys_get_temp_dir() . '/eis-deploy-' . bin2hex(random_bytes(6));
mkdir($base);
function gitTest(array $args): string {
    global $git;
    $p = proc_open(GitDeployment::command(array_merge([$git], $args)), [0=>['pipe','r'],1=>['pipe','w'],2=>['pipe','w']], $pipes, null, null, ['bypass_shell'=>true]);
    fclose($pipes[0]); $s = stream_get_contents($pipes[1]) . stream_get_contents($pipes[2]); fclose($pipes[1]); fclose($pipes[2]);
    if (proc_close($p) !== 0) throw new RuntimeException($s);
    return trim($s);
}
function check(bool $ok, string $name): void { if (!$ok) throw new RuntimeException($name); echo "PASS $name\n"; }
function rejects(callable $fn, string $name): void {
    try { $fn(); } catch (RuntimeException $e) { check(true, $name); return; }
    throw new RuntimeException('Expected rejection: ' . $name);
}
$origin = $base . '/origin.git'; $author = $base . '/author'; $target = $base . '/target';
gitTest(['init','--bare',$origin]); gitTest(['clone',$origin,$author]);
gitTest(['-C',$author,'checkout','-b','master']);
gitTest(['-C',$author,'config','user.email','test@example.invalid']);
gitTest(['-C',$author,'config','user.name','Deployment Test']);
file_put_contents($author . '/app.txt','one'); gitTest(['-C',$author,'add','.']); gitTest(['-C',$author,'commit','-m','initial']); gitTest(['-C',$author,'push','origin','master']);
gitTest(['clone','--branch','master',$origin,$target]);
$service = new GitDeployment($target,$git,'master');
check($service->status()['changes'] === '', 'clean status');
file_put_contents($author . '/app.txt','two'); gitTest(['-C',$author,'commit','-am','update']); gitTest(['-C',$author,'push','origin','master']);
$service->pull('test-admin'); check(file_get_contents($target . '/app.txt') === 'two','fast forward updates files');
file_put_contents($target . '/local.txt','local');
rejects(function () use ($service) { $service->pull('test-admin'); }, 'untracked files block pull');
unlink($target . '/local.txt');
file_put_contents($target . '/app.txt','dirty');
rejects(function () use ($service) { $service->pull('test-admin'); }, 'tracked changes block pull');
gitTest(['-C',$target,'checkout','--','app.txt']);
$wrong = new GitDeployment($target,$git,'another');
rejects(function () use ($wrong) { $wrong->pull('test-admin'); }, 'wrong branch blocks pull');
$lock = fopen($target . '/.git/eis-deploy.lock','c'); flock($lock, LOCK_EX);
rejects(function () use ($service) { $service->pull('test-admin'); }, 'concurrent deployment blocked');
flock($lock,LOCK_UN); fclose($lock);
gitTest(['-C',$target,'config','user.email','test@example.invalid']); gitTest(['-C',$target,'config','user.name','Deployment Test']);
file_put_contents($target . '/local.txt','local commit'); gitTest(['-C',$target,'add','.']); gitTest(['-C',$target,'commit','-m','local commit']);
file_put_contents($author . '/remote.txt','remote commit'); gitTest(['-C',$author,'add','.']); gitTest(['-C',$author,'commit','-m','remote commit']); gitTest(['-C',$author,'push','origin','master']);
$before = gitTest(['-C',$target,'rev-parse','HEAD']);
rejects(function () use ($service) { $service->pull('test-admin'); }, 'divergent history blocked');
check(gitTest(['-C',$target,'rev-parse','HEAD']) === $before,'failed pull preserves HEAD');
$audit = array_map(function ($line) { return json_decode($line,true); }, file($target . '/.git/eis-deploy-audit.jsonl', FILE_IGNORE_NEW_LINES));
check($audit[0]['success'] === true && end($audit)['success'] === false && end($audit)['actor'] === 'test-admin','success and failure audited');
echo "Fixtures: $base\n";
