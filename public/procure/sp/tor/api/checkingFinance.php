<?php
// All calculations use cents; allocation preserves the exact document total.
function checkingCents($value) { return (int) round(floatval($value ?? 0) * 100, 0, PHP_ROUND_HALF_UP); }
function checkingMoney($cents) { return number_format($cents / 100, 2, '.', ''); }
function checkingAllocate($total, $weights) {
    if (!$weights) return array();
    $weights = array_map(function ($v) { return max(0, $v); }, $weights);
    $sum = array_sum($weights);
    if (!$sum) { $weights = array_fill(0, count($weights), 1); $sum = count($weights); }
    $result = array(); $remainders = array(); $used = 0;
    foreach ($weights as $i => $weight) {
        $share = $total * ($weight / $sum);
        $result[$i] = (int) floor($share); $used += $result[$i];
        $remainders[$i] = $share - $result[$i];
    }
    arsort($remainders, SORT_NUMERIC);
    $order = array_keys($remainders);
    for ($i = 0; $i < $total - $used; $i++) $result[$order[$i % count($order)]]++;
    ksort($result);
    return array_values($result);
}
function checkingDebtCents($row) {
    $primary = checkingCents($row['f_net_total_price'] ?? 0);
    return $primary !== 0 ? $primary : checkingCents($row['f_wip_total_price'] ?? 0) + checkingCents($row['f_under_total_price'] ?? 0);
}
function checkingSetDebtTotal(&$row, $amount) {
    if (checkingCents($row['f_net_total_price'] ?? 0) !== 0 ||
        (checkingCents($row['f_wip_total_price'] ?? 0) === 0 && checkingCents($row['f_under_total_price'] ?? 0) === 0)) {
        $row['f_net_total_price'] = checkingMoney($amount);
        $row['f_wip_total_price'] = '0.00'; $row['f_under_total_price'] = '0.00';
    } else {
        $parts = checkingAllocate($amount, array(checkingCents($row['f_wip_total_price'] ?? 0), checkingCents($row['f_under_total_price'] ?? 0)));
        $row['f_net_total_price'] = '0.00';
        $row['f_wip_total_price'] = checkingMoney($parts[0]); $row['f_under_total_price'] = checkingMoney($parts[1]);
    }
}
function calculateCheckingFinance($data, $source, $fine = array(), $manualVatIds = array()) {
    $header = &$data['sp_check_period_hdr'][0];
    $items = &$data['sp_check_period_dtl'];
    $debts = &$data['sp_tranf_item'];
    $kind = $source['kind'] ?? 'header';
    if (!in_array($kind, array('header','items','debts'), true)) throw new InvalidArgumentException('แหล่งยอดเงินไม่ถูกต้อง');
    // Quantity/unit-price edits drive the line total; explicit line totals remain authoritative.
    if ($kind === 'items' && in_array($source['field'] ?? '', array('i_qty','f_net_unit_price'), true)) {
        foreach ($items as &$row) if (intval($row['sp_check_period_dtl_id']) === intval($source['row_id'] ?? 0)) {
            $row['f_net_total_price'] = checkingMoney(checkingCents(floatval($row['i_qty'] ?? 0) * floatval($row['f_net_unit_price'] ?? 0)));
        }
        unset($row);
    }
    if ($kind === 'debts' && $debts) $gross = array_sum(array_map('checkingDebtCents', $debts));
    elseif ($kind === 'items' && $items) $gross = array_sum(array_map(function ($r) { return checkingCents($r['f_net_total_price']); }, $items));
    else $gross = checkingCents($header['f_total'] ?? $header['f_inv_vat'] ?? 0);
    if ($gross < 0) throw new InvalidArgumentException('ยอดรวมต้องไม่ติดลบ');
    $itemIndexes = array();
    foreach ($items as $index => $row) $itemIndexes[intval($row['sp_check_period_dtl_id'])] = $index;
    $linked = count($debts) > 0 && count($items) > 0;
    foreach ($debts as $row) if (!isset($itemIndexes[intval($row['sp_check_period_dtl_id'] ?? 0)])) $linked = false;
    foreach ($items as $item) {
        $found = false;
        foreach ($debts as $row) if (intval($row['sp_check_period_dtl_id'] ?? 0) === intval($item['sp_check_period_dtl_id'])) $found = true;
        if (!$found && checkingCents($item['f_net_total_price'] ?? 0) > 0) $linked = false;
    }
    if ($kind === 'debts' && $linked) {
        $totals = array_fill(0, count($items), 0);
        foreach ($debts as $row) $totals[$itemIndexes[intval($row['sp_check_period_dtl_id'])]] += checkingDebtCents($row);
    } elseif ($kind === 'items') $totals = array_map(function ($r) { return checkingCents($r['f_net_total_price']); }, $items);
    else $totals = checkingAllocate($gross, array_map(function ($r) { return checkingCents($r['f_net_total_price']); }, $items));
    foreach ($items as $index => &$row) {
        $row['f_net_total_price'] = checkingMoney($totals[$index]);
        $quantity = floatval($row['i_qty'] ?? 0);
        if ($quantity > 0) $row['f_net_unit_price'] = number_format(($totals[$index] / 100) / $quantity, 2, '.', '');
    }
    unset($row);
    if ($kind !== 'debts' && $debts) {
        if ($linked) {
            foreach ($items as $itemIndex => $item) {
                $indexes = array(); $weights = array();
                foreach ($debts as $index => $row) if (intval($row['sp_check_period_dtl_id']) === intval($item['sp_check_period_dtl_id'])) {
                    $indexes[] = $index; $weights[] = checkingDebtCents($row);
                }
                if (!$indexes && $totals[$itemIndex] > 0) throw new InvalidArgumentException('รายการตรวจรับยังไม่มีรายการตั้งหนี้ที่เชื่อมกัน');
                $parts = checkingAllocate($totals[$itemIndex], $weights);
                foreach ($indexes as $i => $index) checkingSetDebtTotal($debts[$index], $parts[$i]);
            }
        } else {
            $parts = checkingAllocate($gross, array_map('checkingDebtCents', $debts));
            foreach ($debts as $index => &$row) checkingSetDebtTotal($row, $parts[$index]);
            unset($row);
        }
    }
    $vatOn = intval($header['i_vat_amt'] ?? 0) === 1;
    $taxOn = intval($header['i_tax_personal'] ?? 0) === 1;
    $warrantyOn = intval($header['i_rate'] ?? 0) === 1;
    $vatRate = $vatOn ? floatval($header['f_rate_vat'] ?? 7) : 0;
    $taxRate = $taxOn ? floatval($header['f_tax_personal_rate'] ?? 1) : 0;
    $warrantyRate = $warrantyOn ? floatval($header['f_tax_warranty_rate'] ?? 5) : 0;
    foreach (array($vatRate,$taxRate,$warrantyRate) as $rate) if ($rate < 0 || $rate > 100) throw new InvalidArgumentException('อัตราภาษี/ประกันผลงานต้องอยู่ระหว่าง 0–100%');
    $vat = 0;
    foreach ($debts as &$row) {
        $row['f_sum_Transf'] = checkingMoney(checkingDebtCents($row));
        $lineVat = !$vatOn ? 0 : (in_array(intval($row['sp_tranf_item_id']), $manualVatIds, true)
            ? checkingCents($row['f_vat_amt'] ?? 0) : (int) round(checkingDebtCents($row) * $vatRate / (100 + $vatRate), 0, PHP_ROUND_HALF_UP));
        $row['f_vat_amt'] = checkingMoney($lineVat); $vat += $lineVat;
    }
    unset($row);
    if (!$debts) $vat = $vatOn ? (int) round($gross * $vatRate / (100 + $vatRate), 0, PHP_ROUND_HALF_UP) : 0;
    if ($vatOn && intval($header['i_edit_vat'] ?? 0) === 1 && !$manualVatIds) {
        $vat = checkingCents($header['f_vat_amt'] ?? 0);
        $parts = checkingAllocate($vat, array_map('checkingDebtCents', $debts));
        foreach ($debts as $index => &$row) $row['f_vat_amt'] = checkingMoney($parts[$index]);
        unset($row);
    }
    if ($vat < 0 || $vat > $gross) throw new InvalidArgumentException('ยอด VAT ต้องไม่เกินยอดขอเบิกและไม่ติดลบ');
    $base = $gross - $vat;
    $tax = (int) round($base * $taxRate / 100, 0, PHP_ROUND_HALF_UP);
    $warranty = (int) round($gross * $warrantyRate / 100, 0, PHP_ROUND_HALF_UP);
    $fineAmount = checkingCents($header['f_fine_amt'] ?? 0);
    if (($fine['mode'] ?? 'amount') === 'percent') {
        if (!is_numeric($fine['rate'] ?? null)) throw new InvalidArgumentException('อัตราค่าปรับไม่ถูกต้อง');
        $rate = floatval($fine['rate'] ?? -1);
        if ($rate < 0 || $rate > 100) throw new InvalidArgumentException('อัตราค่าปรับต้องอยู่ระหว่าง 0–100%');
        $fineAmount = (int) round($gross * $rate / 100, 0, PHP_ROUND_HALF_UP);
    }
    $other = checkingCents($header['f_other'] ?? 0);
    $pay = $gross - $tax - $fineAmount - $warranty - $other;
    if ($pay < 0) throw new InvalidArgumentException('ยอดหักรวมมากกว่ายอดขอเบิก');
    foreach (array('f_total'=>$gross,'f_inv_vat'=>$gross,'f_total_add_vat_amt'=>$base,'f_vat_amt'=>$vat,
        'f_tax_personal'=>$tax,'f_warranty'=>$warranty,'f_fine_amt'=>$fineAmount,'f_other'=>$other,'f_pay'=>$pay) as $field=>$amount) $header[$field] = checkingMoney($amount);
    $header['f_rate_vat'] = number_format($vatRate,2,'.','');
    $header['f_tax_personal_rate'] = number_format($taxRate,2,'.','');
    $header['f_tax_warranty_rate'] = number_format($warrantyRate,2,'.','');
    $header['i_is_fine'] = $fineAmount > 0 ? 1 : 0;
    if (!$vatOn) $header['i_edit_vat'] = 0;
    $ledgerParts = checkingAllocate($gross, array_map(function ($row) { return checkingCents($row['f_net_total_price'] ?? 0); }, $data['sp_tranf_hdr'] ?? array()));
    foreach ($data['sp_tranf_hdr'] ?? array() as $index=>$row) {
        $amount = 0;
        foreach ($debts as $debt) if (intval($debt['sp_tranf_hdr_id']) === intval($row['sp_tranf_hdr_id'])) $amount += checkingDebtCents($debt);
        if (!$debts) $amount = $ledgerParts[$index];
        $data['sp_tranf_hdr'][$index]['f_net_total_price'] = checkingMoney($amount);
    }
    return $data;
}
