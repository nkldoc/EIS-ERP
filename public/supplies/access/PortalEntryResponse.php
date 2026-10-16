<?php

final class PortalEntryResponse
{
    public static function requested(array $query, array $server): bool
    {
        // IIS may supply the original URL separately after an internal rewrite.
        if (array_key_exists('portal_entry', $query)) return !empty($query['portal_entry']);
        foreach (['UNENCODED_URL', 'HTTP_X_ORIGINAL_URL', 'REQUEST_URI'] as $key) {
            $original = [];
            parse_str((string) parse_url((string) ($server[$key] ?? ''), PHP_URL_QUERY), $original);
            if (array_key_exists('portal_entry', $original)) return !empty($original['portal_entry']);
        }
        return false;
    }

    public static function redirect(int $outputLevel): void
    {
        while (ob_get_level() > $outputLevel) ob_end_clean();
        header('Cache-Control: no-store');
        header('Content-Type: text/html; charset=utf-8');
        header('Location: /supplies/', true, 303);
        exit;
    }
}
