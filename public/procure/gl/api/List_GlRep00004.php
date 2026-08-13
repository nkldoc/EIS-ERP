 <?php
include("../conf/configGl.php");
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
 
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

	$dc_acc_id	= explode(";", $_REQUEST['dc_acc_id']);
	$dc_cost_id	= explode(";", $_REQUEST['dc_cost_id']);
	$start 			= @$_REQUEST["start"];
	$limit 			= @$_REQUEST["limit"];
	
	if (!get($start)) { $start 	= 0; }
	if (!get($limit)) { $limit 	= 20; }else{ $limit=($limit+$start); }

	// DC_ACC
	if(!in_array("0",$dc_acc_id) && $_REQUEST["dc_acc_id"] != "") {
		$in_acc	= '';
		foreach($dc_acc_id as $val){
			$in_acc	.= ($in_acc == '')? $val : ", ".$val;
		}
		$dc_acc_code	= " AND b.dc_acc_lv2_id IN (".$in_acc.")";
	} else { $dc_acc_code	= null; }
	
	// DC_COST
	if(!in_array("0",$dc_cost_id)) {
		$in_cost	= '';
		foreach($dc_cost_id as $val){
			$in_cost	.= ($in_cost == '')? $val : ", ".$val;
		}
		$dc_cost_code	= " AND a.dc_cost_acc_id IN (".$in_cost.")";
	} else { $dc_cost_code	= null; }
		
	 
	//--------------------------------------------------------------------------------------//
	 
$sqlMain = "DECLARE @start int = {$start};
			DECLARE @limit int = {$limit};
			DECLARE @i_year INT = {$_REQUEST["year_start"]};
			DECLARE @i_type INT = {$_REQUEST["i_show"]};
			
			SET NOCOUNT ON
			DECLARE @Gl_data TABLE(
							dc_acc_id INT,
							c_code VARCHAR(250),
							c_name VARCHAR(250),
							dc_acc_lv2_id INT,
							c_code_lv2 VARCHAR(250),
							c_name_lv2 VARCHAR(250),
							dc_acc_lv1_id INT,
							c_code_lv1 VARCHAR(250),
							c_name_lv1 VARCHAR(250),
							f_money1 DECIMAL(18,2),
							f_money2 DECIMAL(18,2),
							f_money3 DECIMAL(18,2),
							f_money4 DECIMAL(18,2) );
			
			DECLARE @Gl_show TABLE(
							i_type INT,
							dc_acc_id INT,
							c_code VARCHAR(250),
							c_name VARCHAR(250),
							dc_acc_lv2_id INT,
							c_code_lv2 VARCHAR(250),
							c_name_lv2 VARCHAR(250),
							dc_acc_lv1_id INT,
							c_code_lv1 VARCHAR(250),
							c_name_lv1 VARCHAR(250),
							f_money1 DECIMAL(18,2),
							f_money2 DECIMAL(18,2),
							f_money3 DECIMAL(18,2),
							f_money4 DECIMAL(18,2) );
			
			INSERT INTO @Gl_data
			SELECT dc_acc_id, c_code, c_name
				, dc_acc_lv2_id, c_code_lv2, c_name_lv2
				, dc_acc_lv1_id, c_code_lv1, c_name_lv1
				, SUM(f_money1) AS f_money1
				, SUM(f_money2) AS f_money2
				, SUM(f_money3) AS f_money3
				, SUM(f_money4) AS f_money4
			FROM 
			(
			/*ไตรมาส 1 (ต.ค. - ธ.ค.)*/
			SELECT a.dc_acc_id, b.c_code, b.c_name
				, b.dc_acc_lv2_id, b.c_code_lv2, b.c_name_lv2
				, b.dc_acc_lv1_id, b.c_code_lv1, b.c_name_lv1
			, CASE WHEN c_mm BETWEEN '10' AND '12' THEN
				CASE WHEN b.i_group = ".GL_ACC_GROUP1_ASSET." THEN SUM(a.f_end_dr-a.f_end_cr) ELSE SUM(a.f_end_cr-a.f_end_dr) END
			ELSE 0.00 END AS f_money1
			, 0.00 AS f_money2
			, 0.00 AS f_money3	
			, 0.00 AS f_money4
			, b.i_group
			FROM gl_balance_cost a
				INNER JOIN vw_dc_acc_with_parent b ON a.dc_acc_id = b.dc_acc_id
			where c_yyyy = (@i_year-1)
				AND a.i_is_close_year = ".GL_CLOSE_YEAR_NONE."
				AND a.i_is_post = ".BOOK_ACC_GL."
				AND b.i_group in (".GL_ACC_GROUP1_ASSET.",".GL_ACC_GROUP2_DEBT.",".GL_ACC_GROUP3_SHARE.")
				$dc_cost_code
				$dc_acc_code
			GROUP BY b.i_group, a.dc_acc_id, b.c_code, b.c_name
				, b.dc_acc_lv2_id, b.c_code_lv2, b.c_name_lv2
				, b.dc_acc_lv1_id, b.c_code_lv1, b.c_name_lv1, a.c_mm
			
			UNION ALL
			
			/*ไตรมาส 2-4*/
			SELECT a.dc_acc_id, b.c_code, b.c_name
				, b.dc_acc_lv2_id, b.c_code_lv2, b.c_name_lv2
				, b.dc_acc_lv1_id, b.c_code_lv1, b.c_name_lv1
			, 0.00 AS f_money1
			, CASE WHEN c_mm BETWEEN '01' AND '03' THEN
					CASE WHEN b.i_group = ".GL_ACC_GROUP1_ASSET." THEN SUM(a.f_end_dr-a.f_end_cr) ELSE SUM(a.f_end_cr-a.f_end_dr) END
				ELSE 0.00 END AS f_money2
			, CASE WHEN c_mm BETWEEN '04' AND '06' THEN
					CASE WHEN b.i_group = ".GL_ACC_GROUP1_ASSET." THEN SUM(a.f_end_dr-a.f_end_cr) ELSE SUM(a.f_end_cr-a.f_end_dr) END
				ELSE 0.00 END AS f_money3
			, CASE WHEN c_mm BETWEEN '07' AND '09' THEN
					CASE WHEN b.i_group = ".GL_ACC_GROUP1_ASSET." THEN SUM(a.f_end_dr-a.f_end_cr) ELSE SUM(a.f_end_cr-a.f_end_dr) END
				ELSE 0.00 END AS f_money4
			, b.i_group
			FROM gl_balance_cost a
				INNER JOIN vw_dc_acc_with_parent b ON a.dc_acc_id = b.dc_acc_id
			where c_yyyy = @i_year 
				AND a.i_is_close_year = ".GL_CLOSE_YEAR_NONE."
				AND a.i_is_post = ".BOOK_ACC_GL."
				AND b.i_group in (".GL_ACC_GROUP1_ASSET.",".GL_ACC_GROUP2_DEBT.",".GL_ACC_GROUP3_SHARE.")
				$dc_cost_code
				$dc_acc_code
			GROUP BY b.i_group, a.dc_acc_id, b.c_code, b.c_name
				, b.dc_acc_lv2_id, b.c_code_lv2, b.c_name_lv2
				, b.dc_acc_lv1_id, b.c_code_lv1, b.c_name_lv1, a.c_mm
			) tb
			GROUP BY dc_acc_id, c_code, c_name
				, dc_acc_lv2_id, c_code_lv2, c_name_lv2
				, dc_acc_lv1_id, c_code_lv1, c_name_lv1;
			
			/* i_type 1 */
			INSERT INTO @Gl_show
			SELECT
				1,
				NULL,
				NULL,
				NULL,
				NULL,
				NULL,
				NULL,
				dc_acc_lv1_id,
				c_code_lv1,
				c_name_lv1,
				NULL,
				NULL,
				NULL,
				NULL
			FROM @Gl_data
			GROUP BY dc_acc_lv1_id, c_code_lv1, c_name_lv1;
			
			/* i_type 2 */
			INSERT INTO @Gl_show
			SELECT
				2,
				NULL,
				NULL,
				NULL,
				dc_acc_lv2_id,
				c_code_lv2,
				c_name_lv2,
				dc_acc_lv1_id,
				c_code_lv1,
				c_name_lv1,
				SUM(f_money1),
				SUM(f_money2),
				SUM(f_money3),
				SUM(f_money4)
			FROM @Gl_data
			GROUP BY dc_acc_lv2_id, c_code_lv2, c_name_lv2, dc_acc_lv1_id, c_code_lv1, c_name_lv1;
			
			/* i_type 3 */
			INSERT INTO @Gl_show
			SELECT
				3,
				dc_acc_id,
				c_code,
				c_name,
				dc_acc_lv2_id,
				c_code_lv2,
				c_name_lv2,
				dc_acc_lv1_id,
				c_code_lv1,
				c_name_lv1,
				f_money1,
				f_money2,
				f_money3,
				f_money4
			FROM @Gl_data;
			
			/* i_type 4 */
			INSERT INTO @Gl_show
			SELECT
				4,
				NULL,
				'9999999998',
				NULL,
				NULL,
				'9999999998',
				NULL,
				dc_acc_lv1_id,
				c_code_lv1,
				'รวม '+c_name_lv1,
				SUM(f_money1),
				SUM(f_money2),
				SUM(f_money3),
				SUM(f_money4)
			FROM @Gl_data
			GROUP BY dc_acc_lv1_id, c_code_lv1, c_name_lv1;
			
			/* i_type 5 */
			INSERT INTO @Gl_show
			SELECT
				5,
				NULL,
				'9999999999',
				NULL,
				NULL,
				'9999999999',
				NULL,
				NULL,
				'9999999999',
				'รวมหนี้สินและส่วนของผู้ถือหุ้น',
				SUM(f_money1),
				SUM(f_money2),
				SUM(f_money3),
				SUM(f_money4)
			FROM @Gl_show
			WHERE i_type = 4 AND c_code_lv1 NOT LIKE '1%';
			
			DECLARE @Gl_numrow TABLE(
							numrow NUMERIC(11,0) IDENTITY(1,1) NOT NULL,
							i_type INT,
							dc_acc_id INT,
							c_code VARCHAR(250),
							c_name VARCHAR(250),
							dc_acc_lv2_id INT,
							c_code_lv2 VARCHAR(250),
							c_name_lv2 VARCHAR(250),
							dc_acc_lv1_id INT,
							c_code_lv1 VARCHAR(250),
							c_name_lv1 VARCHAR(250),
							f_money1 DECIMAL(18,2),
							f_money2 DECIMAL(18,2),
							f_money3 DECIMAL(18,2),
							f_money4 DECIMAL(18,2) );
			
			INSERT INTO @Gl_numrow
			SELECT * FROM @Gl_show
			WHERE i_type != @i_type
			ORDER BY c_code_lv1, c_code_lv2, c_code, i_type;
			
			SELECT * FROM @Gl_numrow
			WHERE numrow > @start
			ORDER BY numrow;
			
			SELECT COUNT(*) AS rowCounts FROM @Gl_numrow;";

// 	print_r($sqlMain); exit;
	$stmt = $db->QueryParam($sqlMain,array());
	if( $stmt ) {
		
			while($row =$db->Fetch($stmt))				
			{
				$totalCount++;

					$temp = array(	"no"				=> $row["numrow"],
									"i_type"			=> $row["i_type"],
									"dc_acc_id"			=> $row["dc_acc_id"],
									"c_code"			=> $row["c_code"],
									"c_name"			=> $row["c_name"],
									"dc_acc_lv2_id"		=> $row["dc_acc_lv2_id"],
									"c_code_lv2"		=> $row["c_code_lv2"],
									"c_name_lv2"		=> $row["c_name_lv2"],
									"dc_acc_lv1_id"		=> $row["dc_acc_lv1_id"],
									"c_code_lv1"		=> $row["c_code_lv1"],
									"c_name_lv1"		=> $row["c_name_lv1"],
									"f_money1"			=> $row["f_money1"],
									"f_money2"			=> $row["f_money2"],
									"f_money3"			=> $row["f_money3"],
									"f_money4"			=> $row["f_money4"],
									"total"				=> 		 $row["f_money1"]+$row["f_money2"]+$row["f_money3"]+$row["f_money4"]
						 );
					${$root}[] = $temp;
			}
	}

	return json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root} ));
}
function get($a){ return isset($a) && !empty($a)?$a:null; }

if($_REQUEST["type"] == "data") { echo List_QueryParam();exit; }
?>
