<?php
function contractAlertFrequencyDefaults(): array {
    return ['monthDay'=>1, 'threeWeekDays'=>[1,4]];
}
function contractAlertFrequencyValidate($policy): array {
    if (!is_array($policy) || !isset($policy['monthDay'],$policy['threeWeekDays'])
        || !is_int($policy['monthDay']) || $policy['monthDay']<1 || $policy['monthDay']>7
        || !is_array($policy['threeWeekDays']) || count($policy['threeWeekDays'])!==2)
        throw new InvalidArgumentException('กรุณาเลือกวันแจ้งเตือนให้ครบและถูกต้อง');
    foreach ($policy['threeWeekDays'] as $day) if (!is_int($day) || $day<1 || $day>7) throw new InvalidArgumentException('วันแจ้งเตือนไม่ถูกต้อง');
    if (count(array_unique($policy['threeWeekDays']))!==2) throw new InvalidArgumentException('ช่วง 3 สัปดาห์ต้องเลือกวันแจ้งเตือน 2 วันที่ไม่ซ้ำกัน');
    sort($policy['threeWeekDays']);
    return ['monthDay'=>$policy['monthDay'],'threeWeekDays'=>$policy['threeWeekDays']];
}
function contractAlertFrequencySlot(int $days, DateTimeImmutable $now, array $times, array $policy): ?string {
    if ($days>31) return null;
    sort($times);
    $weekday=(int)$now->format('N');
    if ($days>21 && $weekday!==$policy['monthDay']) return null;
    if ($days>7 && $days<=21 && !in_array($weekday,$policy['threeWeekDays'],true)) return null;
    // Weekly reminders occur once per selected day, at the first configured time.
    $eligible=$days>7 ? [$times[0]] : $times;
    $slot=null;
    foreach ($eligible as $time) if ($time<=$now->format('H:i')) $slot=$time;
    return $slot;
}
