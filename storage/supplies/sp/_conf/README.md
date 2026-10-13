# Supplies MySQL configuration

Include `__DIR__ . '/../_conf/mysql_connect.php'` from a file in `sp/api`, then call `spMysqlConnect()`.

- When PHP `SERVER_ADDR` or IIS `LOCAL_ADDR` is the production web server `192.168.201.2`, its internal address `10.1.2.2`, or database server `192.168.201.24`, use the `production` profile with MySQL host `192.168.201.24`.
- On localhost and other development machines, use `development`.
- For CLI jobs or a server behind a proxy, explicitly set `SP_MYSQL_ENV=production` or `APP_ENV=production`. `SP_MYSQL_ENV` takes precedence. Development accepts `development`, `dev`, `local`, or `localhost`.
- `MYSQL_DB_HOST`, `MYSQL_DB_PORT`, `MYSQL_DB_NAME`, `MYSQL_DB_USER`, and `MYSQL_DB_PASS` override the selected profile. An empty password override is supported. The request URL and browser Host header do not select the database. Failed connections never fall back to the other database.

Keep real credentials in `mysql_credentials.local.php` (ignored by Git), with separate `production` and `development` arrays containing `host`, `port`, `name`, `user`, and `pass`. Provision this file separately when deploying, or provide all connection values through environment variables. Defaults are production host `192.168.201.24`, development host `localhost`, port `3306`, database `php_auth_api`, and charset `utf8mb4`. No credentials are hard-coded in the shared connector.

Read-only checks from this directory:

```text
php test_settings.php
php test_connect.php development
php test_connect.php production
```

`test_settings.php` is CLI-only. `test_connect` also supports browser requests from signed-in Supplies users with delivery-menu permission, using the automatically selected server profile; URL parameters cannot override the profile. Tests never print credentials. The connection check runs only `SELECT 1`.
