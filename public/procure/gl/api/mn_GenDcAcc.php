<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");
include("../../gl/conf/configGl.php");

$db		= new DatabaseServer();
$date 	= new i_date();

$root		= "data";
$data		= array();

$mode		= $_REQUEST["mode"];
$arrParam	= array();
$addField	= null;
$addValue	= null;
$arrValue	= array();

switch ( $mode ) {

	case "GEN" :
		
		if($_REQUEST["round"] == 50) { // หน้ากากหลอกการ load รอบที่ 50 ทำงาน
			
			$sql	= "	SET NOCOUNT ON
						/* DECLARE ตามเวลที่ต้องการ */
						DECLARE @lv1 iNT = 0;
						DECLARE @lv2 iNT = 0;
						DECLARE @lv3 iNT = 0;
						DECLARE @lv4 iNT = 0;
						DECLARE @lv5 iNT = 0;
						DECLARE @lv6 iNT = 0;

						/* ตำแหน่งแต่เลเวล */
						DECLARE @position1 iNT	= (select i_level1 from gl_config_dc_acc);
						DECLARE @position2 iNT	= (select i_level2 from gl_config_dc_acc);
						DECLARE @position3 iNT	= (select i_level3 from gl_config_dc_acc);
						DECLARE @position4 iNT	= (select i_level4 from gl_config_dc_acc);
						DECLARE @position5 iNT	= (select i_level5 from gl_config_dc_acc);
						DECLARE @position6 iNT	= (select i_level6 from gl_config_dc_acc);

						/* เริ่มต้นระบบต้อง เพิ่มข้อมูลลง table gl_config_dc_acc ไปพร้อมกันตอน run scrpit */
						/* ------------------------------------------------------------*/
						/* --------------------- เพิ่มจำนวนตาม fld level ทั้งหมด ---------------*/
						/* ------------------------------------------------------------*/
						/*
						INSERT INTO gl_config_dc_acc (column1, column2, column3, ...)
						VALUES (value1, value2, value3, ...);
						*/
					
						DECLARE @dc_acc_id iNT;
						DECLARE @i_level iNT;

						UPDATE dc_acc SET c_code_tree = null;
						
						DECLARE vendor_cursor CURSOR FOR 
						SELECT dc_acc_id, [i_level]
						FROM dc_acc WHERE i_delete = 2
						ORDER BY c_code;
						
						OPEN vendor_cursor;
						
						FETCH NEXT FROM vendor_cursor 
						INTO @dc_acc_id, @i_level;
						
						WHILE @@FETCH_STATUS = 0
							BEGIN
								IF @i_level = 1
									BEGIN
										SET @lv1 = @lv1 + 1;
										SET @lv2 = 0;
										SET @lv3 = 0;
										SET @lv4 = 0;
										SET @lv5 = 0;
										SET @lv6 = 0;
									END
								ELSE IF @i_level = 2
									BEGIN
										SET @lv2 = @lv2 + 1;
										SET @lv3 = 0;
										SET @lv4 = 0;
										SET @lv5 = 0;
										SET @lv6 = 0;
									END
								ELSE IF @i_level = 3
									BEGIN
										SET @lv3 = @lv3 + 1;
										SET @lv4 = 0;
										SET @lv5 = 0;
										SET @lv6 = 0;
									END
								ELSE IF @i_level = 4
									BEGIN
										SET @lv4 = @lv4 + 1;
										SET @lv5 = 0;
										SET @lv6 = 0;
									END
								ELSE IF @i_level = 5
									BEGIN
										SET @lv5 = @lv5 + 1;
										SET @lv6 = 0;
									END
								ELSE IF @i_level = 6
									SET @lv6 = @lv6 + 1;
						
								/*===========*/
								UPDATE dc_acc SET c_code_tree = right('00000000000000000000'+cast(@lv1 as varchar(20)), @position1) +
																right('00000000000000000000'+cast(@lv2 as varchar(20)), @position2) +
																right('00000000000000000000'+cast(@lv3 as varchar(20)), @position3) +
																right('00000000000000000000'+cast(@lv4 as varchar(20)), @position4) +
																right('00000000000000000000'+cast(@lv5 as varchar(20)), @position5) +
																right('00000000000000000000'+cast(@lv6 as varchar(20)), @position6)
								,i_group = left(c_code,1)
								WHERE dc_acc_id = @dc_acc_id;
								
							FETCH NEXT FROM vendor_cursor 
							INTO @dc_acc_id, @i_level
						END
						
						CLOSE vendor_cursor;
						DEALLOCATE vendor_cursor;";
			
			$para	= $db->QueryParam($sql,array());
			
			if($para){
				$re = array( "success" => true, "msg" => "ประมวลผล" );
			} else {
				$re = array( "success" => false, "msg" => "" );
			}	
		} else {
			$re = array( "success" => true, "msg" => "ไม่มีการประมวลผล" );
		}
		
		echo json_encode($re);
		exit;
	break;
}
echo json_encode($re);
exit;
?>
