<?php
include("../../../conf/config.php") ;
include("../../conf/configDc.php") ;
include("../../../lib/database/DatabaseServer.php") ;
include("../../../lib/database/apiUtil.php") ;
include("../../../lib/date/i_date.class.php") ;

###################
$db 	= new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();
############################################################################################################
$mode	= @$_REQUEST["mode"];
$filter = @$_REQUEST["filter"];
$value	= @$_REQUEST["value"];
$i_read	= @$_REQUEST["i_read"];
###################
$root	= "data";
$data	= array();
###################
$limit 	= @$_REQUEST["limit"];
$dir 	= @$_REQUEST["dir"];
$sort 	= @$_REQUEST["sort"];
$start 	= @$_REQUEST["start"];
###################
if (!$util->get($start)) { $start = 0; }
if (!$util->get($limit)) { $limit = 20; }else{ $limit=($limit+$start); }
 if ( ! $util -> get ( $dir ) ) {
    $dir = "DESC" ;
}
if ( ! $util -> get ( $sort ) ) {
    $sort = "d_doc_date" ;
}

#################################
$arrParam = array();
$arrCountParam = array();
$sqlTempTable  = "select c_name
                    , convert(varchar, [d_doc_date], 120) as d_doc_date
                    , i_bg_year
                    , c_comment
                    ,(select top 1 c_full_name from dc_user where dc_user_id=po_bg_holiday.dc_user_create_id) as c_create_name
                    ,(select top 1 c_name from dc_cost where dc_cost_id=po_bg_holiday.dc_user_create_cost_id) as c_cost_creat_name
                    , convert(varchar, po_bg_holiday.d_create, 120) as d_create
                    ,(select top 1 c_full_name from dc_user where dc_user_id=po_bg_holiday.dc_user_update_id) as c_update_name
                    ,(select top 1 c_name from dc_cost where dc_cost_id=po_bg_holiday.dc_user_update_cost_id) as c_cost_update_name
                    , convert(varchar, po_bg_holiday.d_update , 120) as d_update
                    , row_number() over (order by $sort $dir) as row 
                from dbo.po_bg_holiday 
                where 1 = ?" . $util -> viewAcc ( $i_read ) ;

    $arrParam[]    = 1 ;
    $arrCountParam[] = 1 ;
if($mode=="SEARCH"){
        if (isset($filter)&&$filter!="")
        {
            $sqlTempTable .= " and ".$filter." like ?";
            $arrParam[]   = "%{$value}%" ;
            $arrCountParam[] = "%{$value}%" ;
    }
    }
    
   
    $arrParam[] = $start;
    $arrParam[] = $limit;
    
    $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
	while($row =$db->Fetch($stmt))				
	{
		$temp = array("no" => ($i++), 
      "id"                     => intval ( $row[ "row" ] ) ,
      "i_bg_year"              => intval ( $row[ "i_bg_year" ] ) ,
      "c_name"                 => $row[ "c_name" ] ,
      "d_doc_date"             => $date -> extDateBuddha ( $row[ "d_doc_date" ] ) ,
      "c_comment"              => $row[ "c_comment" ] ,
      "dc_user_create_id"      => $row[ "c_create_name" ] ,
      "dc_user_create_cost_id" => $row[ "c_cost_creat_name" ] ,
      "d_create"               => $date -> extDateBuddha ( $row[ "d_create" ] ) ,
      "dc_user_update_id"      => $row[ "c_update_name" ] ,
      "dc_user_update_cost_id" => $row[ "c_cost_update_name" ] ,
      "d_update"               => $date -> extDateBuddha ( $row[ "d_update" ] )
    );
		${$root}[] = $temp;
	}
    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    echo json_encode(array("debug"=>true,"totalCount"=>$totalCount,$root=>${$root}));

    function get($a){ return isset($a) && !empty($a)?$a:null; }
