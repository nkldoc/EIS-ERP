<?php
$config = is_file('C:/ProgramData/EIS-Messenger/config-backups/presence-78b33bc2c6fb4db7ab02bc233f640bf3.php.bak') ? (array) require 'C:/ProgramData/EIS-Messenger/config-backups/presence-78b33bc2c6fb4db7ab02bc233f640bf3.php.bak' : [];
$config['enabled'] = true;
$config['directory'] = '//NMU-EIS-DOC/EIS-Presence$';
$config['websocket_url'] = 'wss://doc-eis.nmu.ac.th/eis-docs/presence';
return $config;