<?php
$root		= "data";
$data		= array();
$con		= null;

switch ($_REQUEST["type"]) {

	case "get_alert_system":

		$no = 0;
		$dir = "../tmpUpdateVersion/pages/";
		if ($dh = opendir($dir)) {
			if ($dh = opendir($dir)) {
				while (($file = readdir($dh)) !== false) {
					if ($file != "." && $file != "..") {
						$list = explode(".", $file);
						$temp = array(
							"no"					=> ++$no,
							"file"					=> $list[0],
							"type"					=> $list[1],
						);
						${$root}[] = $temp;
					}
				}
				closedir($dh);
			}
		}

		echo json_encode(array("success" => true, "totalCount" => $no, $root => ${$root}));
		exit;

		break;
}
