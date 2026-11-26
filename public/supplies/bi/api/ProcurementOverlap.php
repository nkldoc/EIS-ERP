<?php
// One dashboard row per PR. Read all active contracts rather than only the latest.
function procurementOverlapClassify($row, $evidence) {
    $codes = array(); $poCodes = array(); $warnings = array();
    $scoped = intval($row['i_type_bg'] ?? 0) === 4;
    $hasContract = false; $registered = false; $confirmed = false;
    foreach ($evidence as $item) {
        $code = trim((string)($item['code'] ?? ''));
        if ($code !== '') $codes[$code] = true;
        if ($item['source'] === 'PO') {
            $hasContract = true;
            if ($code !== '') $poCodes[$code] = true;
        }
        if ($code !== '' || intval($item['overlap_flag'] ?? 0) > 0 || $item['source'] === 'ใบกัน NMU_EIS' || $item['source'] === 'จองใบกัน') $scoped = true;
        if (!empty($item['verified'])) $registered = true;
        if (in_array($item['source'], array('PR', 'PO', 'AP'), true) && intval($item['overlap_flag'] ?? 0) === 3) $confirmed = true;
        if ($code !== '' && empty($item['verified'])) $warnings['ไม่พบใบกันที่ใช้งานตรงกับเลข ' . $code] = true;
    }
    foreach ($evidence as $item) {
        if ($item['source'] === 'AP' && trim((string)$item['code']) !== '' && !isset($poCodes[trim($item['code'])])) {
            $warnings['เลขใบกัน AP ' . $item['code'] . ' ไม่พบใน c_overlap / c_overlap2 ของสัญญาที่ใช้งาน'] = true;
        }
    }
    if (!$scoped) $status = 'ไม่เข้าข่ายกันเหลื่อม';
    elseif ($registered) $status = 'บันทึกใบกันเหลื่อมแล้ว';
    elseif ($codes || $confirmed) {
        $status = 'ต้องตรวจสอบ';
        if ($confirmed) $warnings['ระบุใช้เงินกันเหลื่อมก่อหนี้แล้ว แต่ไม่พบหลักฐานใบกันที่ใช้งาน'] = true;
    }
    else $status = $hasContract ? 'ก่อหนี้แล้ว' : 'ยังไม่ก่อหนี้';
    return array('overlap_status' => $status, 'overlap_evidence' => $evidence,
        'overlap_warnings' => array_keys($warnings), 'overlap_codes' => array_keys($codes),
        'overlap_debt_status' => $hasContract ? 'ก่อหนี้แล้ว' : 'ยังไม่ก่อหนี้');
}

function procurementOverlapEnrich($rows, $fetch) {
    if (!$rows) return $rows;
    $byId = array(); $evidence = array(); $documents = array(); $allCodes = array();
    $add = function ($id, $source, $reference, $field, $code, $year = null, $flag = null) use (&$evidence, &$allCodes) {
        $code = trim((string)$code);
        $evidence[$id][] = array('source' => $source, 'reference' => (string)$reference, 'field' => $field,
            'code' => $code, 'year' => $year, 'overlap_flag' => $flag, 'verified' => false);
        if ($code !== '') $allCodes[$code] = true;
    };
    foreach ($rows as $row) {
        $id = intval($row['tor_id']); $byId[$id] = $row;
        $add($id, 'PR', $row['pr_code'], 'c_overlap', $row['pr_overlap_code'] ?? '', $row['pr_overlap_year'] ?? null, $row['pr_overlap_flag'] ?? null);
    }
    foreach (array_chunk(array_keys($byId), 500) as $ids) {
        $marks = implode(',', array_fill(0, count($ids), '?'));
        $contracts = $fetch("SELECT sp_tor_id, c_code, c_overlap, c_overlap2, i_overlap, i_overlap2, i_yyyy_overlap, i_yyyy_overlap2
            FROM dbo.sp_tor_contract WHERE i_enabled=1 AND sp_tor_id IN ($marks)", $ids);
        foreach ($contracts as $c) {
            $add(intval($c['sp_tor_id']), 'PO', $c['c_code'], 'c_overlap', $c['c_overlap'], $c['i_yyyy_overlap'], $c['i_overlap']);
            $add(intval($c['sp_tor_id']), 'PO', $c['c_code'], 'c_overlap2', $c['c_overlap2'], $c['i_yyyy_overlap2'], $c['i_overlap2']);
        }
        // AP uses the inspection's c_overlap, and the actual payment uses c_booking.
        $checks = $fetch("SELECT DISTINCT c.sp_tor_id, h.c_code, h.c_code_debt, h.c_overlap, h.i_yyyy_overlap, h.i_overlap,
                d.c_code AS payment_code, d.c_booking, d.i_budget_year_overlap
            FROM dbo.sp_tor_contract c INNER JOIN dbo.sp_check_period_hdr h ON h.sp_tor_contract_id=c.sp_tor_contract_id AND h.i_enabled=1
            LEFT JOIN NMU_EIS.dbo.po_working_hdr w ON w.po_working_hdr_id=h.po_working_hdr_id AND w.i_enable=1
            LEFT JOIN NMU_EIS.dbo.po_working_dtl d ON d.po_working_hdr_id=w.po_working_hdr_id AND ISNULL(d.i_mark_delete,0)<>1
            WHERE c.i_enabled=1 AND c.sp_tor_id IN ($marks)", $ids);
        foreach ($checks as $c) {
            $id = intval($c['sp_tor_id']);
            $add($id, 'AP', $c['c_code_debt'] ?: $c['c_code'], 'c_overlap', $c['c_overlap'], $c['i_yyyy_overlap'], $c['i_overlap']);
            if (trim((string)$c['c_booking']) !== '') $add($id, 'AP', $c['payment_code'], 'c_booking', $c['c_booking'], $c['i_budget_year_overlap']);
        }
        $reserves = $fetch("SELECT DISTINCT COALESCE(NULLIF(r.pr_id,0),c.sp_tor_id) AS tor_id, r.c_code_overlap, r.i_year, r.i_reserve
            FROM NMU_EIS.dbo.bg_reserve_overlap r
            LEFT JOIN dbo.sp_tor_contract c ON c.sp_tor_contract_id=r.po_id AND c.i_enabled=1
            WHERE r.i_enable=1 AND r.i_sys=1 AND COALESCE(NULLIF(r.pr_id,0),c.sp_tor_id) IN ($marks)", $ids);
        foreach ($reserves as $r) $add(intval($r['tor_id']), 'จองใบกัน', $byId[intval($r['tor_id'])]['pr_code'], 'c_code_overlap', $r['c_code_overlap'], $r['i_year'], $r['i_reserve']);
        $linked = $fetch("SELECT DISTINCT COALESCE(NULLIF(h.tor_id,0),c.sp_tor_id) AS tor_id, h.c_code, h.i_year, h.i_status, h.i_overlap_type
            FROM NMU_EIS.dbo.bg_overlap_hdr h
            LEFT JOIN dbo.sp_tor_contract c ON c.sp_tor_contract_id=h.po_id AND c.i_enabled=1
            WHERE h.i_enable=1 AND h.i_delete=2 AND ISNULL(h.i_sys,1)=1
                AND COALESCE(NULLIF(h.tor_id,0),c.sp_tor_id) IN ($marks)", $ids);
        foreach ($linked as $d) {
            $id = intval($d['tor_id']);
            $add($id, 'ใบกัน NMU_EIS', $d['c_code'], 'bg_overlap_hdr.c_code', $d['c_code'], $d['i_year']);
            $documents[trim($d['c_code'])] = $d;
        }
    }
    // Exact document-code matching; IDs in PR/PO overlap fields have historically
    // held different table IDs, so an ID alone is not accepted as proof.
    foreach (array_chunk(array_keys($allCodes), 500) as $codes) {
        $marks = implode(',', array_fill(0, count($codes), '?'));
        $docs = $fetch("SELECT c_code, i_year, i_status, i_overlap_type FROM NMU_EIS.dbo.bg_overlap_hdr
            WHERE i_enable=1 AND i_delete=2 AND ISNULL(i_sys,1)=1 AND c_code IN ($marks)", $codes);
        foreach ($docs as $d) $documents[trim($d['c_code'])] = $d;
        $budgetDocs = $fetch("SELECT DISTINCT d.c_code_ref AS c_code, h.i_year
            FROM NMU_EIS.dbo.bg_budget_dtl_overlap d
            INNER JOIN NMU_EIS.dbo.bg_budget_hdr_overlap h ON h.bg_budget_hdr_overlap_id=d.bg_budget_hdr_overlap_id AND h.i_enable=1
            WHERE d.c_code_ref IN ($marks)", $codes);
        foreach ($budgetDocs as $d) if (!isset($documents[trim($d['c_code'])])) $documents[trim($d['c_code'])] = $d;
    }
    foreach ($rows as &$row) {
        $items = array();
        foreach ($evidence[intval($row['tor_id'])] ?? array() as $item) {
            if ($item['code'] !== '' && isset($documents[$item['code']])) {
                $doc = $documents[$item['code']];
                $item['verified'] = true;
                $item['document_year'] = $doc['i_year'];
                $item['document_status'] = $doc['i_status'] ?? null;
                $year = intval($item['year']); $docYear = intval($doc['i_year']);
                if ($year > 2400) $year -= 543;
                if ($docYear > 2400) $docYear -= 543;
                $item['year_mismatch'] = $year > 0 && $docYear > 0 && $year !== $docYear;
            }
            $items[json_encode($item)] = $item;
        }
        $row = array_merge($row, procurementOverlapClassify($row, array_values($items)));
        foreach ($row['overlap_evidence'] as $item) if (!empty($item['year_mismatch'])) $row['overlap_warnings'][] = 'ปีใบกันไม่ตรงกับทะเบียน: ' . $item['code'] . ' (' . $item['source'] . ')';
    }
    unset($row);
    return $rows;
}
