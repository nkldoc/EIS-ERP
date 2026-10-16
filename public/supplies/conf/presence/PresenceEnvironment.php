<?php
declare(strict_types=1);

final class PresenceEnvironment
{
    public static function isProduction(): bool
    {
        $environment = strtolower((string) getenv('EIS_APP_ENV'));
        if ($environment !== '') {
            if (!in_array($environment, ['production', 'dev', 'local'], true)) {
                throw new RuntimeException('EIS_APP_ENV must be production, dev or local');
            }
            return $environment === 'production';
        }
        $host = strtolower((string) parse_url('http://' . ($_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? ''), PHP_URL_HOST));
        return in_array($host, ['eis.nmu.ac.th', 'doc-eis.nmu.ac.th', '10.10.10.2', '192.168.168.3'], true);
    }

    public static function config(string $legacyFile): array
    {
        // An explicitly selected file always wins, including on developer machines.
        $explicit = getenv('EIS_PRESENCE_CONFIG');
        if ($explicit) {
            if (!is_readable($explicit)) throw new RuntimeException('EIS_PRESENCE_CONFIG is not readable');
            return (array) require $explicit;
        }
        if (self::isProduction()) {
            return is_readable($legacyFile) ? (array) require $legacyFile : [];
        }
        // Never load a copied production UNC share or production signing keys in dev.
        $localFile = __DIR__ . '/presence.dev.local.php';
        if (is_readable($localFile)) return (array) require $localFile;
        return [
            'enabled' => true,
            'directory' => is_dir('D:/EIS-DOCS/storage/presence')
                ? 'D:/EIS-DOCS/storage/presence'
                : dirname(__DIR__, 4) . '/storage/presence/dev',
            'websocket_url' => 'wss://dev-eis.nmu.ac.th:4003/presence',
        ];
    }
}
