<?php
declare(strict_types=1);

final class SuppliesWorkspacePolicy
{
    public static function externalUnit(array $session): bool
    {
        return !empty($session['user_id'])
            && (int)($session['i_type_user'] ?? 0) !== 2
            && (int)($session['dc_center_user'] ?? 0) !== 1
            && !in_array((int)($session['dc_cost_id'] ?? 0), [0, 3, 38], true);
    }
}
