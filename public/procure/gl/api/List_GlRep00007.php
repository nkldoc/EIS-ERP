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
	
	$i_is_post				= " AND b.i_is_post=".BOOK_ACC_GL;
	$i_close_all_year 		= " AND b.i_is_close_year in (".GL_CLOSE_YEAR_PERIOD.",".GL_CLOSE_YEAR_NONE.")";
/*
หลังปิดบัญชี เลือกปีงบประมาณ 2561
i_cal_money=1 ยอดยกมาของ 10/2561 		[เงินมี3หมวด] / [Table gl_balance_cost.i_is_close_year=1,2]
i_cal_money=2 ยอดทั้งปี 10/2560 -09/2561	[Table gl_balance_cost.i_is_close_year=1,2]
i_cal_money=3 ยอดยกไป				คำนวณแล้ว SHOW 

*/	
	$sqlMain	= "	SET NOCOUNT ON
					DECLARE @c_yyyy_begin 				varchar(4)	= ?;
					DECLARE @c_yyyy 					varchar(4)  = ?;
					DECLARE @c_mm 						varchar(2)  = ?;
					DECLARE @i_is_close_year 			int 		= ?; 
					DECLARE @c_mm_begin 				varchar(2)  = ?; 
					DECLARE @c_mm_end 					varchar(2)  = ?; 
					DECLARE	@i_is_close_year_period13 	int 		= ?; 
					DECLARE	@c_yyyy_mm_begin 			varchar(6)  = ?; 
					DECLARE	@c_yyyy_mm_end 				varchar(6)  = ?; 
					DECLARE	@dc_acc_special				int 		= ?; 
						
			SET NOCOUNT ON
			DECLARE @TempRpGlBalanceByAccAll TABLE
				(	i_cal_money tinyint,
					acc_code VARCHAR(250),
					acc_name VARCHAR(250),
					f_begin_dr DECIMAL(18,2),
					f_begin_cr DECIMAL(18,2),
					f_dr DECIMAL(18,2),
					f_cr DECIMAL(18,2),
					f_end_dr DECIMAL(18,2),
					f_end_cr DECIMAL(18,2),
					dc_acc_id bigint );
			
			DECLARE @TempRpGlBalanceByAcc TABLE
				(	 
					i_level INT,
					acc_code VARCHAR(250),
					acc_name VARCHAR(250),
					f_begin_dr DECIMAL(18,2),
					f_begin_cr DECIMAL(18,2),
					f_dr DECIMAL(18,2),
					f_cr DECIMAL(18,2),
					f_end_dr DECIMAL(18,2),
					f_end_cr DECIMAL(18,2),
					dc_acc_id bigint  );  
			
			/* DATA */ 
			INSERT INTO @TempRpGlBalanceByAccAll
			SELECT 1,
				a.c_code,
				a.c_name,
				SUM(b.f_begin_dr),
				SUM(b.f_begin_cr),
				0,
				0,
				0,
				0,
				b.dc_acc_id
			FROM gl_balance_cost b
				INNER JOIN dc_acc a ON a.dc_acc_id = b.dc_acc_id
			WHERE b.c_yyyy = @c_yyyy_begin AND b.c_mm=@c_mm_begin AND b.i_is_close_year = @i_is_close_year
				$i_is_post 
			GROUP BY a.c_code,a.c_name,b.dc_acc_id;
			
			INSERT INTO @TempRpGlBalanceByAccAll 
			SELECT 2,
				a.c_code,
				a.c_name,
				0,
				0,
				SUM(c.f_dr),
				SUM(c.f_cr),
				0,
				0,		
				c.dc_acc_id
			FROM gl_tran_hdr b inner join gl_tran_dtl c on c.gl_tran_hdr_id = b.gl_tran_hdr_id	
			INNER JOIN dc_acc a ON a.dc_acc_id = c.dc_acc_id						
			where 	b.c_yyyy_mm between @c_yyyy_mm_begin and @c_yyyy_mm_end and c.dc_acc_id>0
					 AND b.i_is_close_year in (1,2)
					 AND b.i_is_post=3  and b.i_enable=1
					 AND a.dc_acc_id!=@dc_acc_special
			GROUP BY a.c_code,a.c_name,c.dc_acc_id 	
			UNION 	 
			SELECT 2,
				a.c_code,
				a.c_name,
				0,
				0,
				SUM(c.f_dr),
				SUM(c.f_dr),
				0,
				0,		
				c.dc_acc_id
			FROM gl_tran_hdr b inner join gl_tran_dtl c on c.gl_tran_hdr_id = b.gl_tran_hdr_id	
			INNER JOIN dc_acc a ON a.dc_acc_id = c.dc_acc_id						
			where 	b.c_yyyy_mm between @c_yyyy_mm_begin and @c_yyyy_mm_end and c.dc_acc_id>0
					 AND b.i_is_close_year=1 AND b.i_close_year_type=3
					 AND b.i_is_post=3  and b.i_enable=1  
					 AND a.dc_acc_id=@dc_acc_special
			GROUP BY a.c_code,a.c_name,c.dc_acc_id ;	
			 					 
			 
			INSERT INTO @TempRpGlBalanceByAccAll
			SELECT 3,
				a.c_code,
				a.c_name,
				0,
				0,
				0,
				0,				
				SUM(b.f_end_dr),
				SUM(b.f_end_cr),
				b.dc_acc_id				
			FROM gl_balance_cost b
				INNER JOIN dc_acc a ON a.dc_acc_id = b.dc_acc_id
			WHERE b.c_yyyy = @c_yyyy AND b.c_mm=@c_mm_end  AND b.i_is_close_year = @i_is_close_year_period13
					$i_is_post 
			GROUP BY a.c_code,a.c_name,b.dc_acc_id;		
			 
			
			/* DATA ACC NULL*/
			INSERT INTO @TempRpGlBalanceByAccAll
			SELECT 4,
				a.c_code,
				a.c_name,
				ISNULL((SELECT b.f_begin_dr FROM @TempRpGlBalanceByAccAll b WHERE b.dc_acc_id=a.dc_acc_id and b.i_cal_money=1),0) as f_begin_dr,
				ISNULL((SELECT b.f_begin_cr FROM @TempRpGlBalanceByAccAll b WHERE b.dc_acc_id=a.dc_acc_id and b.i_cal_money=1),0) as f_begin_cr,
				ISNULL((SELECT b.f_dr FROM @TempRpGlBalanceByAccAll b WHERE b.dc_acc_id=a.dc_acc_id and b.i_cal_money=2),0) as f_dr,
				ISNULL((SELECT b.f_cr FROM @TempRpGlBalanceByAccAll b WHERE b.dc_acc_id=a.dc_acc_id and b.i_cal_money=2),0) as f_cr,
				ISNULL((SELECT b.f_end_dr FROM @TempRpGlBalanceByAccAll b WHERE b.dc_acc_id=a.dc_acc_id and b.i_cal_money=3),0) as f_end_dr,
				ISNULL((SELECT b.f_end_cr FROM @TempRpGlBalanceByAccAll b WHERE b.dc_acc_id=a.dc_acc_id and b.i_cal_money=3),0) as f_end_cr,
				a.dc_acc_id
  			FROM dc_acc a  
			WHERE a.i_last = 1 AND a.i_delete = 2;

			DELETE FROM @TempRpGlBalanceByAccAll WHERE i_cal_money<4;			
			
			/* sub Acc type 2*/
			INSERT INTO @TempRpGlBalanceByAcc
			SELECT 
				6,
				acc_code,
				acc_name,
				CASE WHEN SUM(f_begin_dr-f_begin_cr) > 0 THEN SUM(f_begin_dr-f_begin_cr) ELSE 0 END f_begin_dr,
				CASE WHEN SUM(f_begin_cr-f_begin_dr) > 0 THEN SUM(f_begin_cr-f_begin_dr) ELSE 0 END f_begin_cr,
				CASE WHEN SUM(f_dr) > 0 THEN SUM(f_dr) ELSE 0 END f_dr,
				CASE WHEN SUM(f_cr) > 0 THEN SUM(f_cr) ELSE 0 END f_cr,
				CASE WHEN SUM(f_end_dr-f_end_cr) > 0 THEN SUM(f_end_dr-f_end_cr) ELSE 0 END f_end_dr,
				CASE WHEN SUM(f_end_cr-f_end_dr) > 0 THEN SUM(f_end_cr-f_end_dr) ELSE 0 END f_end_cr,
				dc_acc_id
			FROM @TempRpGlBalanceByAccAll
			GROUP BY acc_code,acc_name,dc_acc_id;
						
			/* numrow */
			DECLARE @TempRpGlBalanceByAccRow TABLE
				(	numrow NUMERIC(11,0) IDENTITY(1,1) NOT NULL, 
					acc_code VARCHAR(250),
					acc_name VARCHAR(250),
					f_begin_dr DECIMAL(18,2),
					f_begin_cr DECIMAL(18,2),
					f_dr DECIMAL(18,2),
					f_cr DECIMAL(18,2),
					f_end_dr DECIMAL(18,2),
					f_end_cr DECIMAL(18,2), 
					i_type tinyint,
					dc_acc_id bigint);
			
			INSERT INTO @TempRpGlBalanceByAccRow
			SELECT 
				acc_code,
				acc_name,
				f_begin_dr,
				f_begin_cr,
				f_dr,
				f_cr,
				f_end_dr,
				f_end_cr,
				1,
				dc_acc_id
			FROM @TempRpGlBalanceByAcc 
			ORDER BY acc_code;
			
			INSERT INTO @TempRpGlBalanceByAccRow
			SELECT 
				'รวม',
				'ทั้งหมด',
				ISNULL((SELECT SUM(f_begin_dr) FROM @TempRpGlBalanceByAcc),0) AS f_begin_dr,	
				ISNULL((SELECT SUM(f_begin_cr) FROM @TempRpGlBalanceByAcc),0) AS f_begin_cr,	
				ISNULL((SELECT SUM(f_dr) FROM @TempRpGlBalanceByAcc),0) AS f_dr,	
				ISNULL((SELECT SUM(f_cr) FROM @TempRpGlBalanceByAcc),0) AS f_cr,	
				ISNULL((SELECT SUM(f_end_dr) FROM @TempRpGlBalanceByAcc),0) AS f_end_dr,	
				ISNULL((SELECT SUM(f_end_cr) FROM @TempRpGlBalanceByAcc),0) AS f_end_cr,	 
				2,
				0 as dc_acc_id				
			
			SELECT * FROM @TempRpGlBalanceByAccRow ORDER BY numrow;";

	$arrParam[]	= $_REQUEST["year"]-1;
	$arrParam[]	= $_REQUEST["year"];
	$arrParam[]	= $_REQUEST["month"];
	$arrParam[]	= GL_CLOSE_YEAR_NONE;
	$arrParam[]	= "10";
	$arrParam[]	= "09";
	$arrParam[]	= GL_CLOSE_YEAR_PERIOD;
	$arrParam[]	= ($_REQUEST["year"]-1)."10"; 
	$arrParam[]	= $_REQUEST["year"]."09"; 
	$arrParam[]	= 513;
 
  // 	print_r($arrParam); echo $sqlMain;exit;
	$stmt = $db->QueryParam( $sqlMain, $arrParam );
	
	if( $stmt ) {
		
		while( $row = $db->Fetch( $stmt ) ) {
			
			$temp = array(	"no"				=> $row["numrow"],
							"acc_code"			=> $row["acc_code"],
							"acc_name"			=> $row["acc_name"],
							"f_begin_dr"		=> $row["f_begin_dr"],
							"f_begin_cr"		=> $row["f_begin_cr"],
							"f_dr"				=> $row["f_dr"],
							"f_cr"				=> $row["f_cr"],
							"f_end_dr"			=> $row["f_end_dr"],
							"f_end_cr"			=> $row["f_end_cr"],
							"f_end_cr"			=> $row["f_end_cr"],
							"i_type"			=> $row["i_type"],
							"dc_acc_id"			=> $row["dc_acc_id"]);
			
			${$root}[] = $temp;
			
			$totalCount++;
		}
	}

	return json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));
}
?>