<?php
declare(strict_types=1);

final class GitDeployment
{
    private $root;
    private $git;
    private $branch;
    public static function command(array $args): string
    {
        return implode(' ', array_map(function ($arg) {
            if (DIRECTORY_SEPARATOR !== '\\') return escapeshellarg($arg);
            // Windows CreateProcess quoting; bypass_shell avoids cmd expansion.
            return '"' . preg_replace('/(\\\\+)$/', '$1$1', preg_replace('/(\\\\*)"/', '$1$1\\\\"', $arg)) . '"';
        }, $args));
    }
    public function __construct(string $root, string $git, string $branch)
    {
        $this->root = realpath($root);
        if (!$this->root || !is_dir($this->root . '/.git')) throw new RuntimeException('ไม่พบ repository EIS-ERP');
        if (!preg_match('/^[a-zA-Z0-9][a-zA-Z0-9._\/-]*$/D', $branch)) throw new RuntimeException('Branch ไม่ถูกต้อง');
        $this->git = $git;
        $this->branch = $branch;
    }
    private function run(array $args): string
    {
        $pipes = [];
        $env = getenv();
        $env['GIT_TERMINAL_PROMPT'] = '0';
        $env['GCM_INTERACTIVE'] = 'Never';
        $p = proc_open(self::command(array_merge([$this->git, '-c', 'safe.directory=' . str_replace('\\', '/', $this->root), '-C', $this->root], $args)), [0=>['pipe','r'],1=>['pipe','w'],2=>['pipe','w']], $pipes, $this->root, $env, ['bypass_shell'=>true]);
        if (!is_resource($p)) throw new RuntimeException('เรียก Git ไม่สำเร็จ');
        fclose($pipes[0]);
        stream_set_blocking($pipes[1], false); stream_set_blocking($pipes[2], false);
        $output = ''; $start = microtime(true);
        do {
            $output .= stream_get_contents($pipes[1]) . stream_get_contents($pipes[2]);
            $status = proc_get_status($p);
            if (!$status['running']) break;
            if (microtime(true) - $start > 90) { proc_terminate($p); fclose($pipes[1]); fclose($pipes[2]); proc_close($p); throw new RuntimeException('Git timeout (90 วินาที) กรุณาตรวจสถานะก่อนลองใหม่'); }
            usleep(50000);
        } while (true);
        $output .= stream_get_contents($pipes[1]) . stream_get_contents($pipes[2]); fclose($pipes[1]); fclose($pipes[2]);
        $code = proc_close($p);
        if ($status['exitcode'] !== -1) $code = $status['exitcode'];
        if ($code !== 0) throw new RuntimeException(trim($output) ?: 'Git failed');
        return trim($output);
    }
    public function status(): array
    {
        return ['branch'=>$this->run(['branch','--show-current']), 'commit'=>$this->run(['log','-1','--format=%h %s']), 'changes'=>$this->run(['status','--porcelain']), 'expected'=>$this->branch];
    }
    public function pull(string $actor): string
    {
        $lock = fopen($this->root . '/.git/eis-deploy.lock', 'c');
        if (!$lock || !flock($lock, LOCK_EX | LOCK_NB)) throw new RuntimeException('มีการอัปเดตอยู่ กรุณารอสักครู่');
        $before = ''; $result = ''; $ok = false;
        try {
            $s = $this->status(); $before = $s['commit'];
            if ($s['branch'] !== $this->branch) throw new RuntimeException('Branch ปัจจุบันไม่ตรงกับที่กำหนด');
            if ($s['changes'] !== '') throw new RuntimeException('มีไฟล์แก้ไขค้าง กรุณา commit หรือจัดการไฟล์ก่อน pull');
            $result = $this->run(['pull','--ff-only','--no-rebase','origin',$this->branch]);
            $ok = true;
            return $result . "\n" . $this->run(['log','-1','--format=%h %s']);
        } catch (Throwable $e) { $result = $e->getMessage(); throw $e; }
        finally {
            file_put_contents($this->root . '/.git/eis-deploy-audit.jsonl', json_encode(['time'=>gmdate('c'),'actor'=>$actor,'before'=>$before,'success'=>$ok,'result'=>$result], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE) . "\n", FILE_APPEND | LOCK_EX);
            flock($lock, LOCK_UN); fclose($lock);
        }
    }
}
