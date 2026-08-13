<?php
include("../../lib/database/DatabaseServer.php");
include("../conf/configGl.php");

$db = new DatabaseServer();

$root	= "data";
if ($_REQUEST ["type"] == "dc_acc") {
	
	if($_REQUEST["PAGE"] == "GlRep00017") {
		$i_group	= "(".GL_ACC_GROUP4_REVENUE.",".GL_ACC_GROUP5_EXPENSE.")";	
	} else if($_REQUEST["PAGE"] == "GlRep00018") {
		$i_group	= "(".GL_ACC_GROUP1_ASSET.",".GL_ACC_GROUP2_DEBT.",".GL_ACC_GROUP3_SHARE.")";
	}
	// dc_acc
	$sqlMain = "SELECT * FROM dc_acc
				WHERE i_last=1 AND i_delete = ? and i_enable= ".STATUS_ENABLE."
					AND i_group IN {$i_group}
				ORDER BY c_code";
	$arrParam = array (DELETE_FALSE);
	$stmt = $db->QueryParam ( $sqlMain, $arrParam );
	if ($stmt) {
		${$root} [] = array (
				"id"		=> "0",
				"c_name"	=> "- เลือกทั้งหมด -"
		);
		while ( $row = $db->Fetch ( $stmt ) ) {
			$temp = array (
					"id"		=> $row["dc_acc_id"],
					"c_name"	=> $row["c_code"]." ".$row["c_name"]
			);
			${$root} [] = $temp;
		}
	}
} else if ($_REQUEST ["type"] == "dc_acc_main") {
	if($_REQUEST["PAGE"] == "GlRep00017") {
		$i_group	= "(".GL_ACC_GROUP4_REVENUE.",".GL_ACC_GROUP5_EXPENSE.")";
	} else if($_REQUEST["PAGE"] == "GlRep00018") {
		$i_group	= "(".GL_ACC_GROUP1_ASSET.",".GL_ACC_GROUP2_DEBT.",".GL_ACC_GROUP3_SHARE.")";
	}
	// dc_acc
	$sqlMain = "SELECT * FROM dc_acc
				WHERE i_last=2 and i_level=? AND i_delete = ? and i_enable=".STATUS_ENABLE."
					AND i_group IN {$i_group}
				ORDER BY c_code";
	$arrParam = array (4,DELETE_FALSE);
	$stmt = $db->QueryParam ( $sqlMain, $arrParam );
	if ($stmt) {
		${$root} [] = array (
				"id"		=> "0",
				"c_name"	=> "- เลือกทั้งหมด -"
		);
		while ( $row = $db->Fetch ( $stmt ) ) {
			$temp = array (
					"id"		=> $row["dc_acc_id"],
					"c_name"	=> $row["c_code"]." ".$row["c_name"]
			);
			${$root} [] = $temp;
		}
	}
} else if ($_REQUEST ["type"] == "dc_acc_main_lv5") {
	if($_REQUEST["PAGE"] == "GlRep00017") {
		$i_group	= "(".GL_ACC_GROUP4_REVENUE.",".GL_ACC_GROUP5_EXPENSE.")";
	} else if($_REQUEST["PAGE"] == "GlRep00018") {
		$i_group	= "(".GL_ACC_GROUP1_ASSET.",".GL_ACC_GROUP2_DEBT.",".GL_ACC_GROUP3_SHARE.")";
	}
	// dc_acc
	$sqlMain = "SELECT * FROM dc_acc
				WHERE i_last=2 and i_level=? AND i_delete = ? and i_enable=".STATUS_ENABLE."
					AND i_group IN {$i_group}
				ORDER BY c_code";
	$arrParam = array (5,DELETE_FALSE);
	$stmt = $db->QueryParam ( $sqlMain, $arrParam );
	if ($stmt) {
		${$root} [] = array (
				"id"		=> "0",
				"c_name"	=> "- เลือกทั้งหมด -"
		);
		while ( $row = $db->Fetch ( $stmt ) ) {
			$temp = array (
					"id"		=> $row["dc_acc_id"],
					"c_name"	=> $row["c_code"]." ".$row["c_name"]
			);
			${$root} [] = $temp;
		}
	}
}
else if ($_REQUEST ["type"] == "dc_acc_main_lv2") {
	if($_REQUEST["PAGE"] == "GlRep00017") {
		$i_group	= "(".GL_ACC_GROUP4_REVENUE.",".GL_ACC_GROUP5_EXPENSE.")";
	} else if($_REQUEST["PAGE"] == "GlRep00018") {
		$i_group	= "(".GL_ACC_GROUP1_ASSET.",".GL_ACC_GROUP2_DEBT.",".GL_ACC_GROUP3_SHARE.")";
	}
	// dc_acc
	$sqlMain = "SELECT * FROM dc_acc
				WHERE i_last=2 and i_level=? AND i_delete = ? and i_enable=".STATUS_ENABLE."
					AND i_group IN {$i_group}
				ORDER BY c_code";
	$arrParam = array (2,DELETE_FALSE);
	$stmt = $db->QueryParam ( $sqlMain, $arrParam );
	if ($stmt) {
		${$root} [] = array (
				"id"		=> "0",
				"c_name"	=> "- เลือกทั้งหมด -"
		);
		while ( $row = $db->Fetch ( $stmt ) ) {
			$temp = array (
					"id"		=> $row["dc_acc_id"],
					"c_name"	=> $row["c_code"]." ".$row["c_name"]
			);
			${$root} [] = $temp;
		}
	}
}
else if ($_REQUEST ["type"] == "dc_acc_main_lv3") {
	if($_REQUEST["PAGE"] == "GlRep00017") {
		$i_group	= "(".GL_ACC_GROUP4_REVENUE.",".GL_ACC_GROUP5_EXPENSE.")";
	} else if($_REQUEST["PAGE"] == "GlRep00018") {
		$i_group	= "(".GL_ACC_GROUP1_ASSET.",".GL_ACC_GROUP2_DEBT.",".GL_ACC_GROUP3_SHARE.")";
	}
	// dc_acc
	$sqlMain = "SELECT * FROM dc_acc
				WHERE i_last=2 and i_level=? AND i_delete = ? and i_enable=".STATUS_ENABLE."
					AND i_group IN {$i_group}
				ORDER BY c_code";
	$arrParam = array (3,DELETE_FALSE);
	$stmt = $db->QueryParam ( $sqlMain, $arrParam );
	if ($stmt) {
		${$root} [] = array (
				"id"		=> "0",
				"c_name"	=> "- เลือกทั้งหมด -"
		);
		while ( $row = $db->Fetch ( $stmt ) ) {
			$temp = array (
					"id"		=> $row["dc_acc_id"],
					"c_name"	=> $row["c_code"]." ".$row["c_name"]
			);
			${$root} [] = $temp;
		}
	}
}
echo json_encode(array("debug"=>true,$root=>${$root}));
exit;
?>
