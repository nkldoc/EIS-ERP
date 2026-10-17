<?php

// The caller owns the transaction covering the PR and its reservations.
function savePrReservationTypes($db, $prId, array $data) {
    $types = [];
    for ($slot = 1; $slot <= 3; $slot++) {
        $value = $data['i_pr_type' . $slot] ?? null;
        if ($value === null || $value === '') {
            $types[] = null; // Do not clear funding slots absent from the form.
        } elseif (is_scalar($value) && in_array((string) $value, ['1', '2'], true)) {
            $types[] = (int) $value;
        } else {
            throw new InvalidArgumentException('Invalid reservation type');
        }
    }
    $types[] = $prId;
    $stmt = $db->QueryParam(
        'UPDATE dbo.sp_tor SET i_pr_type1 = COALESCE(?, i_pr_type1),
            i_pr_type2 = COALESCE(?, i_pr_type2),
            i_pr_type3 = COALESCE(?, i_pr_type3) WHERE tor_id = ?',
        $types
    );
    if (!$stmt) {
        return false;
    }
    return $db->QueryParam(
        'UPDATE reserve_money SET i_pr_type = funding.i_pr_type
         FROM ' . DB_NMU_EIS . 'bg_reserve_money AS reserve_money
         INNER JOIN dbo.sp_tor AS pr ON pr.tor_id = reserve_money.pr_id
         CROSS APPLY (VALUES
             (pr.bg_reserve_money1_id, pr.i_pr_type1),
             (pr.bg_reserve_money2_id, pr.i_pr_type2),
             (pr.bg_reserve_money3_id, pr.i_pr_type3)
         ) AS funding(reserve_id, i_pr_type)
         WHERE pr.tor_id = ?
           AND reserve_money.bg_reserve_money_id = funding.reserve_id
           AND reserve_money.i_sys = ? AND reserve_money.i_reserve = 1
           AND funding.i_pr_type IN (1, 2)',
        [$prId, I_SYS]
    );
}
