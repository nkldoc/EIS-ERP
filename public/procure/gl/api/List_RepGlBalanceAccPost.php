<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
include("../../gl/conf/configGl.php");

$db 	= new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();

$root		= "data";
$data		= array();
$con		= null;
$select		= null;
$flds		= null;
$groupBy	= null;

function List_QueryParam() {
	
	global $db, $date, $util, $root, $data, $select, $con, $flds, $groupBy;
 
	$totalCount		= 0;

	$start 				= @$data["start"];
	$limit 				= @$data["limit"];
	$i_type				= @$_REQUEST["i_last"];
	$i_show				= @$_REQUEST["i_show"]; 
	$c_year				= (string)(@$_REQUEST['year']);
	$c_month			= (string)sprintf("%02d%",@$_REQUEST["month"],"");
	$i_is_close_year	= GL_CLOSE_YEAR_NONE;
	$i_type_report		= @$_REQUEST["i_type_report"];
 
	if ($start=="") { $start 	= 0; }
	if ($limit=="") { $limit 	= 20; }else{ $limit=($limit+$start); }
 	
   	if ($i_type_report==2) // งบทดลอง ตามบัญชี
 		$i_is_post			=  " AND b.i_is_post=".BOOK_ACC_GL;
 	else if ($i_type_report==1)  //รายงานยอดคงเหลือบัญชีแยกประเภท ตามบัญชี
 		$i_is_post			=  " AND b.i_is_post in (".BOOK_ACC_GX.",".BOOK_ACC_GL.")";
 
	$dc_acc_id	= explode(";", $_REQUEST["dc_acc_id"]);
	if( !in_array( "0", $dc_acc_id ) ) {
		$in_acc	= "";
		foreach( $dc_acc_id as $val ) {
			$in_acc	.= ( $in_acc == "" )? $val : ", ".$val;
		}
		$dc_acc_code	= " AND a.dc_acc_id IN (".$in_acc.")";
	} else { $dc_acc_code	= null; }
		
	$dc_cost_id	= explode(";", $_REQUEST["dc_cost_id"]);
	if( !in_array( "0", $dc_cost_id ) ) {
		$in_cost	= "";
		foreach( $dc_cost_id as $val ) {
			$in_cost	.= ( $in_cost == "" )? $val : ", ".$val;
		}
		$dc_cost_code	= " AND c.dc_cost_id IN (".$in_cost.")";
	} else { $dc_cost_code	= null; }
 	
	if($i_show > 0) {
		$i_show = " and (	(isnull(f_begin_dr,0)!=0) or (isnull(f_begin_cr,0)!=0) or
							(isnull(f_dr,0)!=0) or (isnull(f_cr,0)!=0) or
							(isnull(f_end_dr,0)!=0) or (isnull(f_end_cr,0)!=0)	) ";
	} else { $i_show = null; }

	if ($i_type==3)
	{ //ทั้งหมด
		$ww_i_type = " i_type in (1,7,4)";
	}
	else if ($i_type==2)
	{ //ย่อย
		$ww_i_type = " i_type in (2,3,4)";
	}
	else if ($i_type==0)
	{ //คุม
		$ww_i_type = " i_type!=7";
	}

$sqlMain = "DECLARE @start int = ?;
			DECLARE @limit int = ?;
			DECLARE @c_yyyy varchar(4) = ?;
			DECLARE @c_mm varchar(2) = ?;
			DECLARE @i_is_close_year int = ?;
			DECLARE @i_type int = ?;
						
			SET NOCOUNT ON
			DECLARE @TempRpGlBalanceByAccAll TABLE
				(	acc_code_parent VARCHAR(250),
					acc_name_parent VARCHAR(250),
					i_level INT,
					acc_code VARCHAR(250),
					acc_name VARCHAR(250),
					cost_code VARCHAR(250),
					cost_name VARCHAR(250), 
					f_begin_dr DECIMAL(18,2),
					f_begin_cr DECIMAL(18,2),
					f_dr DECIMAL(18,2),
					f_cr DECIMAL(18,2),
					f_end_dr DECIMAL(18,2),
					f_end_cr DECIMAL(18,2) );
			
			DECLARE @TempRpGlBalanceByAcc TABLE
				(	i_type TINYINT,
					acc_code_parent VARCHAR(250),
					acc_name_parent VARCHAR(250),
					i_level INT,
					acc_code VARCHAR(250),
					acc_name VARCHAR(250),
					cost_code VARCHAR(250),
					cost_name VARCHAR(250), 					
					f_begin_dr DECIMAL(18,2),
					f_begin_cr DECIMAL(18,2),
					f_dr DECIMAL(18,2),
					f_cr DECIMAL(18,2),
					f_end_dr DECIMAL(18,2),
					f_end_cr DECIMAL(18,2) );  
			
			/* DATA */
			INSERT INTO @TempRpGlBalanceByAccAll
			SELECT
				LEFT(a.c_code, LEN(a.c_code)-2)+'00',
				(SELECT TOP 1 c_name FROM dc_acc WHERE c_code = (LEFT(a.c_code, LEN(a.c_code)-2)+'00')),
				a.i_level,
				a.c_code,
				a.c_name,
				c.c_code,
				c.c_name, 
				b.f_begin_dr,
				b.f_begin_cr,
				b.f_dr,
				b.f_cr,
				b.f_end_dr,
				b.f_end_cr
			FROM gl_balance_cost b
				INNER JOIN dc_acc a ON a.dc_acc_id = b.dc_acc_id
				INNER JOIN dc_cost c ON b.dc_cost_acc_id = c.dc_cost_id	
			WHERE b.c_yyyy = @c_yyyy AND b.c_mm=@c_mm AND b.i_is_close_year = @i_is_close_year
				$i_is_post 
				$dc_acc_code
				$dc_cost_code 
			;
			
			/* DATA ACC NULL*/
			INSERT INTO @TempRpGlBalanceByAccAll
			SELECT
				LEFT(a.c_code, LEN(a.c_code)-2)+'00',
				(SELECT TOP 1 c_name FROM dc_acc WHERE c_code = (LEFT(a.c_code, LEN(a.c_code)-2)+'00')),
				a.i_level,
				a.c_code,
				a.c_name,
				NULL,
				NULL,				
				b.f_begin_dr,
				b.f_begin_cr,
				b.f_dr,
				b.f_cr,
				b.f_end_dr,
				b.f_end_cr
			FROM dc_acc a LEFT JOIN @TempRpGlBalanceByAccAll b ON a.c_code = b.acc_code
			WHERE a.i_last = 1 AND a.i_delete = 2 AND b.acc_code IS NULL
				$dc_acc_code
				;
			
			/* sub Acc Parent type 1*/
			INSERT INTO @TempRpGlBalanceByAcc
			SELECT
				1,
				b.acc_code_parent,
				b.acc_name_parent,
				5,
				NULL,
				NULL,
				NULL,
				NULL,			
				CASE WHEN SUM(b.f_begin_dr-b.f_begin_cr) > 0 THEN SUM(b.f_begin_dr-b.f_begin_cr) ELSE 0 END f_begin_dr,
				CASE WHEN SUM(b.f_begin_cr-b.f_begin_dr) > 0 THEN SUM(b.f_begin_cr-b.f_begin_dr) ELSE 0 END f_begin_cr,
				CASE WHEN SUM(b.f_dr) > 0 THEN SUM(b.f_dr) ELSE 0 END,
				CASE WHEN SUM(b.f_cr) > 0 THEN SUM(b.f_cr) ELSE 0 END,
				CASE WHEN SUM(b.f_end_dr-b.f_end_cr) > 0 THEN SUM(b.f_end_dr-b.f_end_cr) ELSE 0 END f_end_dr,
				CASE WHEN SUM(b.f_end_cr-b.f_end_dr) > 0 THEN SUM(b.f_end_cr-b.f_end_dr) ELSE 0 END f_end_cr
			FROM @TempRpGlBalanceByAccAll b
			GROUP BY b.acc_code_parent, b.acc_name_parent;
			
			/* sub Acc type 2*/
			INSERT INTO @TempRpGlBalanceByAcc
			SELECT
				2,
				acc_code_parent,
				acc_name_parent,
				6,
				acc_code,
				acc_name,
				NULL,
				NULL,			
				CASE WHEN SUM(f_begin_dr-f_begin_cr) > 0 THEN SUM(f_begin_dr-f_begin_cr) ELSE 0 END f_begin_dr,
				CASE WHEN SUM(f_begin_cr-f_begin_dr) > 0 THEN SUM(f_begin_cr-f_begin_dr) ELSE 0 END f_begin_cr,
				CASE WHEN SUM(f_dr) > 0 THEN SUM(f_dr) ELSE 0 END f_dr,
				CASE WHEN SUM(f_cr) > 0 THEN SUM(f_cr) ELSE 0 END f_cr,
				CASE WHEN SUM(f_end_dr-f_end_cr) > 0 THEN SUM(f_end_dr-f_end_cr) ELSE 0 END f_end_dr,
				CASE WHEN SUM(f_end_cr-f_end_dr) > 0 THEN SUM(f_end_cr-f_end_dr) ELSE 0 END f_end_cr
			FROM @TempRpGlBalanceByAccAll
			GROUP BY acc_code_parent, acc_name_parent, acc_code, acc_name;
			
			/* sub Acc Total type 3*/
			INSERT INTO @TempRpGlBalanceByAcc
			SELECT
				3,
				acc_code_parent,
				acc_name_parent,
				NULL,
				acc_code,
				acc_name,
				cost_code,
				cost_name,
				CASE WHEN SUM(f_begin_dr-f_begin_cr) > 0 THEN SUM(f_begin_dr-f_begin_cr) ELSE 0 END f_begin_dr,
				CASE WHEN SUM(f_begin_cr-f_begin_dr) > 0 THEN SUM(f_begin_cr-f_begin_dr) ELSE 0 END f_begin_cr,
				CASE WHEN SUM(f_dr) > 0 THEN SUM(f_dr) ELSE 0 END f_dr,
				CASE WHEN SUM(f_cr) > 0 THEN SUM(f_cr) ELSE 0 END f_cr,
				CASE WHEN SUM(f_end_dr-f_end_cr) > 0 THEN SUM(f_end_dr-f_end_cr) ELSE 0 END f_end_dr,
				CASE WHEN SUM(f_end_cr-f_end_dr) > 0 THEN SUM(f_end_cr-f_end_dr) ELSE 0 END f_end_cr
			FROM @TempRpGlBalanceByAccAll
			WHERE (	(isnull(f_begin_dr,0)!=0) or (isnull(f_begin_cr,0)!=0) or
					(isnull(f_dr,0)!=0) or (isnull(f_cr,0)!=0) or
					(isnull(f_end_dr,0)!=0) or (isnull(f_end_cr,0)!=0)	)
			GROUP BY acc_code_parent, acc_name_parent, acc_code, acc_name, cost_code, cost_name;
			

			/* sub Acc Total type 7*/
			INSERT INTO @TempRpGlBalanceByAcc
			SELECT
				7,
				acc_code_parent,
				acc_name_parent,
				NULL,
				NULL,
				NULL,
				cost_code,
				cost_name,
				CASE WHEN SUM(f_begin_dr-f_begin_cr) > 0 THEN SUM(f_begin_dr-f_begin_cr) ELSE 0 END f_begin_dr,
				CASE WHEN SUM(f_begin_cr-f_begin_dr) > 0 THEN SUM(f_begin_cr-f_begin_dr) ELSE 0 END f_begin_cr,
				CASE WHEN SUM(f_dr) > 0 THEN SUM(f_dr) ELSE 0 END f_dr,
				CASE WHEN SUM(f_cr) > 0 THEN SUM(f_cr) ELSE 0 END f_cr,
				CASE WHEN SUM(f_end_dr-f_end_cr) > 0 THEN SUM(f_end_dr-f_end_cr) ELSE 0 END f_end_dr,
				CASE WHEN SUM(f_end_cr-f_end_dr) > 0 THEN SUM(f_end_cr-f_end_dr) ELSE 0 END f_end_cr
			FROM @TempRpGlBalanceByAccAll
			WHERE (	(isnull(f_begin_dr,0)!=0) or (isnull(f_begin_cr,0)!=0) or
					(isnull(f_dr,0)!=0) or (isnull(f_cr,0)!=0) or
					(isnull(f_end_dr,0)!=0) or (isnull(f_end_cr,0)!=0)	)
			GROUP BY acc_code_parent, acc_name_parent, cost_code, cost_name;	

 			
			/* sub Acc Total type 4*/
			INSERT INTO @TempRpGlBalanceByAcc
			SELECT
				4,
				'9999999999',
				'รวม',
				NULL,
				NULL,
				NULL,
				NULL,
				NULL,				
				ISNULL(SUM(f_begin_dr), 0.00),
				ISNULL(SUM(f_begin_cr), 0.00),
				ISNULL(SUM(f_dr), 0.00),
				ISNULL(SUM(f_cr), 0.00),
				ISNULL(SUM(f_end_dr), 0.00),
				ISNULL(SUM(f_end_cr), 0.00)
			FROM @TempRpGlBalanceByAcc
			WHERE i_type = 3;
			
			/* numrow */
			DECLARE @TempRpGlBalanceByAccRow TABLE
				(	numrow NUMERIC(11,0) IDENTITY(1,1) NOT NULL,
					i_type TINYINT,
					i_level TINYINT,
					acc_code_parent VARCHAR(250),
					acc_name_parent VARCHAR(250),
					acc_code VARCHAR(250),
					acc_name VARCHAR(250),
					cost_code VARCHAR(250),
					cost_name VARCHAR(250),				
					f_begin_dr DECIMAL(18,2),
					f_begin_cr DECIMAL(18,2),
					f_dr DECIMAL(18,2),
					f_cr DECIMAL(18,2),
					f_end_dr DECIMAL(18,2),
					f_end_cr DECIMAL(18,2) );
			
			INSERT INTO @TempRpGlBalanceByAccRow
			SELECT
				i_type,
				i_level,
				acc_code_parent,
				acc_name_parent,
				acc_code,
				acc_name,
				cost_code,
				cost_name,			
				f_begin_dr,
				f_begin_cr,
				f_dr,
				f_cr,
				f_end_dr,
				f_end_cr
			FROM @TempRpGlBalanceByAcc
			WHERE 	$ww_i_type 
					$i_show
			ORDER BY acc_code_parent, acc_code, i_type;
			
			SELECT * FROM @TempRpGlBalanceByAccRow
			WHERE numrow > @start
			ORDER BY numrow;
			
			SELECT COUNT(*) AS rowCounts FROM @TempRpGlBalanceByAccRow;";
			
	$arrParam[]			= $start;
	$arrParam[]			= $limit;
 	$arrParam[]			= $c_year;
	$arrParam[]			= $c_month; 
	$arrParam[]			= GL_CLOSE_YEAR_NONE;
	$arrParam[]			= $i_type; 

 
 //  print_r($arrParam); echo "<hr>$sqlMain"; exit;  
  			
	$stmt = $db->QueryParam( $sqlMain, $arrParam );
	
	if( $stmt ) {
		
		while( $row = $db->Fetch( $stmt ) ) {
			 
				$temp = array(	"no"	=> $row["numrow"],
 					"i_type"			=> $row["i_type"],
					"i_level"			=> $row["i_level"],
					"acc_code_parent"	=> $row["acc_code_parent"],
					"acc_name_parent"	=> $row["acc_name_parent"],
					"acc_code"			=> $row["acc_code"],
					"acc_name"			=> $row["acc_name"],
					"cost_code"			=> $row["cost_code"],
					"cost_name"			=> $row["cost_name"],				
					"f_begin_dr"		=> $row["f_begin_dr"],
					"f_begin_cr"		=> $row["f_begin_cr"],
					"f_dr"				=> $row["f_dr"],
					"f_cr"				=> $row["f_cr"],
					"f_end_dr"			=> $row["f_end_dr"],
					"f_end_cr"			=> $row["f_end_cr"] );

			${$root}[] = $temp;
			
			$totalCount++;
		}
	}

	return json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));
}
?>
