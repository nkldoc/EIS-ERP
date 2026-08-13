<?php

// 1. ตรวจสอบว่า GC เปิดใช้งานอยู่หรือไม่
echo "--- Initial State ---" . PHP_EOL;
echo "GC Enabled: " . (gc_enabled() ? 'Yes' : 'No') . PHP_EOL;

// 2. ฟังก์ชันจำลองการสร้างขยะในหน่วยความจำ (Circular Reference)
function createGarbage() {
    $a = new stdClass();
    $b = new stdClass();
    
    $a->self = $b;
    $b->self = $a;
    
    // เมื่อจบฟังก์ชัน $a และ $b จะหลุด Scope 
    // แต่เพราะมันอ้างอิงกันเอง Reference Count จะไม่เป็น 0 
    // ทำให้ต้องรอ GC มากำจัด
}

echo PHP_EOL . "--- Creating Garbage ---" . PHP_EOL;
for ($i = 0; $i < 10000; $i++) {
    createGarbage();
}

// 3. ตรวจสอบสถานะก่อนรัน GC
$statusBefore = gc_status();
echo "Collected Cycles before manual run: " . $statusBefore['runs'] . PHP_EOL;
echo "Current Memory Usage: " . number_format(memory_get_usage()) . " bytes" . PHP_EOL;

// 4. สั่งให้ Garbage Collection ทำงานทันที
echo PHP_EOL . "--- Running Garbage Collection ---" . PHP_EOL;
$collected = gc_collect_cycles();

// 5. ตรวจสอบผลลัพธ์
$statusAfter = gc_status();
echo "Nodes Collected: " . $collected . PHP_EOL;
echo "Total GC Runs: " . $statusAfter['runs'] . PHP_EOL;
echo "Memory Usage After: " . number_format(memory_get_usage()) . " bytes" . PHP_EOL;

?>