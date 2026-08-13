<?php
	include("../../../conf/config.php");
                        
    include("../../conf/configGl.php");
	include("../../../lib/database/DatabaseServer.php");
	include("../../../lib/date/i_date.class.php");
    define("START_YEAR_BG", 2017); //ปีงบประมาณ       
        ###################
	$db 	= new DatabaseServer();
	$date 	= new i_date();
	########################################################################## 

function getAll($y){
 global $db,$date;   
    $f=0;
                        
    $sql    = ""
            . "
                DECLARE @yyyymm1 varchar(20);
                DECLARE @yyyymm2 varchar(20);
                DECLARE @yyyy_mm_dd1 varchar(20);
                DECLARE @yyyy_mm_dd2 varchar(20);

                SET @yyyymm1 = '".($y-1)."10';
                SET @yyyymm2 = '".($y)."09';
                SET @yyyy_mm_dd1 = '".($y-1)."-10-01';
                SET @yyyy_mm_dd2 = '".($y)."-09-30';

                ------------------------------------------------------------------------------------------------------------
                select sum(ss.res) as sumAll from (
                select
                        distinct a.gl_rep_conf_id,b.gl_rep_conf_id as dtl_id ,b.dc_acc_id,b.i_source,b.i_source_item
                        ,CASE 
                     WHEN b.i_source = 1 AND b.i_source_item = 1 THEN (select sum(aa.f_dr-aa.f_cr) from gl_tran_dtl aa  
                         inner join gl_tran_hdr ab on ab.gl_tran_hdr_id=aa.gl_tran_hdr_id
                         where aa.dc_acc_id=b.dc_acc_id and ab.i_enable=1 and ab.i_is_post > 1  AND ab.i_is_close_year=2 and ab.d_save_date between convert(datetime,@yyyy_mm_dd1,102) and convert(datetime,@yyyy_mm_dd2,102))
                     WHEN b.i_source = 1 AND b.i_source_item = 2 THEN (select sum(aa.f_cr-aa.f_dr) from gl_tran_dtl aa  
                         inner join gl_tran_hdr ab on ab.gl_tran_hdr_id=aa.gl_tran_hdr_id
                         where aa.dc_acc_id=b.dc_acc_id and ab.i_enable=1 and ab.i_is_post > 1  AND ab.i_is_close_year=2 and ab.d_save_date between convert(datetime,@yyyy_mm_dd1,102) and convert(datetime,@yyyy_mm_dd2,102))

                     WHEN b.i_source = 2 AND b.i_source_item = 1 THEN (select sum(aa.f_begin_dr-aa.f_begin_cr) from gl_balance_cost aa where aa.c_yyyy_mm =@yyyymm1 and aa.i_is_close_year=2  and aa.dc_acc_id=b.dc_acc_id) 
                     WHEN b.i_source = 2 AND b.i_source_item = 2 THEN (select sum(aa.f_begin_cr-aa.f_begin_dr) from gl_balance_cost aa where aa.c_yyyy_mm =@yyyymm1 and aa.i_is_close_year=2  and aa.dc_acc_id=b.dc_acc_id) 
                     WHEN b.i_source = 2 AND b.i_source_item = 3 THEN (select sum(aa.f_cr-aa.f_dr) from gl_balance_cost aa where aa.c_yyyy_mm between @yyyymm1 and @yyyymm2 and aa.i_is_close_year=2 and aa.dc_acc_id=b.dc_acc_id) 
                     WHEN b.i_source = 2 AND b.i_source_item = 4 THEN (select sum(aa.f_dr-aa.f_cr) from gl_balance_cost aa where aa.c_yyyy_mm between @yyyymm1 and @yyyymm2 and aa.i_is_close_year=2 and aa.dc_acc_id=b.dc_acc_id) 
                     WHEN b.i_source = 2 AND b.i_source_item = 5 THEN (select sum(aa.f_end_dr-aa.f_end_cr) from gl_balance_cost aa where aa.c_yyyy_mm =@yyyymm2 and aa.i_is_close_year=2 and aa.dc_acc_id=b.dc_acc_id)  
                     WHEN b.i_source = 2 AND b.i_source_item = 6 THEN (select sum(aa.f_end_cr-aa.f_end_dr) from gl_balance_cost aa where aa.c_yyyy_mm =@yyyymm2 and aa.i_is_close_year=2 and aa.dc_acc_id=b.dc_acc_id)  
                         ELSE 0 
                END as res 
                from gl_rep_conf a
                        left join gl_rep_conf_dtl b on a.gl_rep_conf_id=b.gl_rep_conf_id
                ) ss where 1=?"
            . "";
    
     // 60
	$_yyyy = $y;
    if($_yyyy==START_YEAR_BG){  
		$sqlSpcial    = "select sum(f_total) from gl_rep_conf where 1=?";
        $f = $db->GetDataBySQL($sqlSpcial, array(1));
    // > 60        
    }else if($_yyyy<START_YEAR_BG){
        $f =0;
    // 61    
    }else{	 
		$f = $db->GetDataBySQL($sql,array(1));
	}
	
    return $f;
}   

$ar_bg = array();
$ar_bgAfter = array();
$tt = 0;



for($i=(START_YEAR_BG-1);$i<=date("Y");$i++){  
    
        $ar_bg[$i] = getAll($i);    
        $tt += $ar_bg[$i]; 
        $ar_bgAfter[$i] = $tt;       
}
                        

                        
function getAcc($gl_rep_conf_id=NULL,$id,$y,$i){
 global $db,$date;    
 
  $sqlSpcial    = "select isnull(f_total,0) from gl_rep_conf where gl_rep_conf_id=?";
 
  $setVal       = $db->GetDataBySQL($sqlSpcial, array($id));
  $_yyyy        = $y; 
    
    // 60
    if($_yyyy==START_YEAR_BG){  
        $f  = (isset($setVal) && $setVal!="")?$setVal:0; 
        $t  =  number_format($f,2);
    // > 60        
    }else if($_yyyy<START_YEAR_BG){
        $f  =  0;
        $t  =  number_format($f,2);
    // 61    
    }else{
    
    $sql    = "select a.* from gl_rep_conf_dtl a where a.gl_rep_conf_id=?";
    $f0     = $db->GetDataBySQL($sql, array($id)); 
    $f      = 0;
    $tt     = ""; 
    $setId  = $f0["gl_rep_conf_id"];
    
    
    $whdate = " between convert(datetime,'".($y-1)."-10-01',102) and convert(datetime,'".($y)."-09-30',102)";
    $whdate2 = " c_yyyy_mm between '".($y-1)."10' and '".($y)."09'";
    $wht_mm_yyyy1 = " c_yyyy_mm='".($y-1)."10'";
    $wht_mm_yyyy2 = " c_yyyy_mm='".($y)."09'";

    if($f0["i_source"]==1 && $f0["i_source_item"]==1) //gl_tran_dtl   ยอดรวมของ ผลต่าง เดบิต-เครดิต (f_dr-f_cr)
        $f = $db->GetDataBySQL ("(select sum(aa.f_dr-aa.f_cr) from gl_tran_dtl aa  
	 inner join gl_tran_hdr ab on ab.gl_tran_hdr_id=aa.gl_tran_hdr_id
	 where aa.dc_acc_id in (select dc_acc_id from gl_rep_conf_dtl where gl_rep_conf_id=?) 
	 and ab.i_enable=1 
     and ab.i_is_post > 1 
     AND ab.i_is_close_year=2 
	 and ab.d_save_date {$whdate})", array($setId));  
         
    if($f0["i_source"]==1 && $f0["i_source_item"]==2) //gl_tran_dtl   ยอดรวมของ ผลต่าง เดบิต-เครดิต (f_cr-f_dr)
        $f = $db->GetDataBySQL ("(select sum(aa.f_cr-aa.f_dr) from gl_tran_dtl aa  
	 inner join gl_tran_hdr ab on ab.gl_tran_hdr_id=aa.gl_tran_hdr_id
	 where aa.dc_acc_id in (select dc_acc_id from gl_rep_conf_dtl where gl_rep_conf_id=?) 
	 and ab.i_enable=1 
     and ab.i_is_post > 1 
     AND ab.i_is_close_year=2 
	 and ab.d_save_date {$whdate})", array($setId));   
        if($f0["i_source"]==2 && $f0["i_source_item"]==1) //gl_balance_cost ยอดรวมของ ผลต่าง ยอดยกมาเดบิต-ยอดยกมาเครดิต (f_begin_dr-f_begin_cr) 
            $f = $db->GetDataBySQL ("select sum(f_begin_dr-f_begin_cr) from gl_balance_cost where {$wht_mm_yyyy1} AND i_is_close_year=2 and dc_acc_id in (select dc_acc_id from gl_rep_conf_dtl where gl_rep_conf_id=?);", array($setId));
        if($f0["i_source"]==2 && $f0["i_source_item"]==2) //gl_balance_cost ยอดรวมของ ผลต่าง ยอดยกมาเครดิต-ยอดยกมาเดบิต (f_begin_cr-f_begin_dr)
            $f = $db->GetDataBySQL ("select sum(f_begin_cr-f_begin_dr) from gl_balance_cost where {$wht_mm_yyyy1} AND i_is_close_year=2 and dc_acc_id in (select dc_acc_id from gl_rep_conf_dtl where gl_rep_conf_id=?);", array($setId));
        if($f0["i_source"]==2 && $f0["i_source_item"]==3) //gl_balance_cost ยอดรวมของ ผลต่าง เดบิต-เครดิต (f_dr-f_cr) 
            $f = $db->GetDataBySQL ("select sum(f_cr-f_dr) from gl_balance_cost where {$whdate2}  AND i_is_close_year=2 and dc_acc_id in (select dc_acc_id from gl_rep_conf_dtl where gl_rep_conf_id=?);", array($setId));
        if($f0["i_source"]==2 && $f0["i_source_item"]==4) //gl_balance_cost ยอดรวมของ ผลต่าง เครดิต-เดบิต (f_cr-f_dr)
            $f = $db->GetDataBySQL ("select sum(f_dr-f_cr) from gl_balance_cost where {$whdate2}  AND i_is_close_year=2 and dc_acc_id in (select dc_acc_id from gl_rep_conf_dtl where gl_rep_conf_id=?);", array($setId));
        if($f0["i_source"]==2 && $f0["i_source_item"]==5) //gl_balance_cost ยอดรวมของ ผลต่าง ยอดยกไปเดบิต-ยอดยกไปเครดิต (f_end_dr-f_end_cr)
            $f = $db->GetDataBySQL ("select sum(f_end_dr-f_end_cr) from gl_balance_cost where {$wht_mm_yyyy2}  AND i_is_close_year=2 and dc_acc_id in (select dc_acc_id from gl_rep_conf_dtl where gl_rep_conf_id=?);", array($setId));
        if($f0["i_source"]==2 && $f0["i_source_item"]==6) //gl_balance_cost ยอดรวมของ ผลต่าง ยอดยกไปเครดิต-ยอดยกไปเดบิต (f_end_cr-f_end_dr)
            $f = $db->GetDataBySQL ("select sum(f_end_cr-f_end_dr) from gl_balance_cost where {$wht_mm_yyyy2}  AND i_is_close_year=2 and dc_acc_id in (select dc_acc_id from gl_rep_conf_dtl where gl_rep_conf_id=?);", array($setId));
    } //check year                    

    
    if($i==1 ||$i==3){ 
        $tt     = ""; 
    }else{ 
        $minus = false;
        if($f<0)$minus = true;
        if($minus){  
        $tt    = "(".number_format(abs($f),2).")";
        }else{ $tt    = number_format($f,2); } 
    }
    
    return array($f,$tt);
   
}


        function getLevel($i,$tt,$id,$i_row){
            
            if($i!=1 && $i!=3 && $i!=8 && $i!=9) 
                $tt = "<span title='แสดงรายการบัญชีที่เลือก' style='cursor:pointer' onclick='myFunction(\"{$tt}\",{$i_row},{$id});'><a href=\"#\">{$tt}</a></span>";
            
            if($i==1 || $i==8 || $i==9)$txt = "<div style='font-weight:bold;'>{$tt}</div>";
            else if($i==2 || $i==3 || $i==5 || $i==6) $txt = "<div style='padding-left:10px;'>{$tt}</div>";    
            else $txt = "<div style='padding-left:20px;'>{$tt}</div>";
            
            return $txt;
        }
        function accMinus($f){
            $minus = false;
            if($f<0)$minus = true; 
            
            if($minus){  
                    $tt    = "(".number_format(abs($f),2).")";
            }else{ $tt    = number_format($f,2); }
        
          return $tt;
        }
	function headerX($t='',$rd){
		$title= $_REQUEST['titleReport'];
		$tt = isset($t) && $t!=''?true:false;
		switch($t)
		{ 
			case 'excel': $ttt = 'xls'; break; 
			case 'downloadHTML': $ttt = 'html'; break;  
			case 'html': $ttt 	= ''; break;
			default: $ttt='';
		} 
		if($ttt!=''){ //file include is not spacing outer tag php
			header("Content-Type: application/octet-stream");
			header("Content-Transfer-Encoding: binary");
			header('Expires: '.gmdate('D, d M Y H:i:s').' GMT');
			header('Content-Disposition: attachment; filename = "'.$title.' '.date("Y-m-d-H-i-s").'.'.$ttt.'"');
			header('Pragma: no-cache'); 
			echo chr(255).chr(254).iconv("UTF-8", "UTF-16LE//IGNORE", $rd);  
		}else{
			header('Content-Type: text/html; charset=utf-8');
			echo '<style type="text/css"> table { font-size:14px;} body{ padding:0px; margin:5px;padding:2px;  } #footer td{ background-color:#fff;} '
                        . ' a:link {
                                color: #333;
                                text-decoration:none;
                            } 
                            a:visited {
                                color: #333;
                            } 
                            a:hover {
                                color: gray;
                            } 
                            a:active {
                                color: #333;
                            }
                            td.Underlined { font-weight:bold; border-bottom:1px solid #000; }
                            td.dblUnderlined {font-weight:bold;  border-bottom: 3px double; }
                            </style>';
                        echo '<script>
                                function myFunction(tt,i_row,id) {
                                
                                return window.open("../ListGlDcAccRep.php?type=GETDATA&setId="+id+"&title=แสดงรายการบัญชีของ"+tt, "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=200,left=200,width=1000,height=500");
                               
                                }
                              </script>';
			echo $rd;
		}   
	}; //Function



	//iSearch

	$where = "";        
        $_yyyy = $_REQUEST["i_yyyy"];
        $th_yyyy = $_yyyy+543;
        //--------------------------------------
        $after_yyyy     = $_yyyy-1;
     
        
        $after_th_yyyy = $after_yyyy+543;
                        
	$sql = "select a.gl_dc_activity_id,a.gl_rep_conf_id as id,b.gl_rep_conf_id,a.c_name,a.i_show,a.i_row from gl_rep_conf a
                    left join gl_rep_conf_dtl b on b.gl_rep_conf_id=a.gl_rep_conf_id
                where 1=?
                group by a.gl_dc_activity_id,a.gl_rep_conf_id,b.gl_rep_conf_id,a.c_name,a.i_show,a.i_row 
                order by a.i_row asc";

	$stmt = $db->QueryParam($sql, array(1));
        
	$i = 1;
	$str = "";
        $gl_dc_activity_id  =   0;
            $m1                 =   0;
            $m2                 =   0;  
            $m11                 =   0;
            $m22                 =   0;  
            
            
    
       $i_row = $db->GetDataBySQL("select count(*) from gl_rep_conf where 1=?", array(1)); 
        
        function posted($y,$sumary){
            
                    if($y < START_YEAR_BG ){
                        $sumary            = 0; //ยอด sum 
                        $post_after        = 0; //ยกมาปลายงวดปีที่แล้ว 
                        }else{
                        $sumary            = $sumary; //ยอด sum 
                        $post_after        = 0; //ยกมาปลายงวดปีที่แล้ว  
                     } 
                     $posted = $sumary+$post_after;
           return array($posted,$post_after);          
        }
	while ($data = $db->Fetch($stmt))
	{
                        $c = 0;
                        $a = 0;
                        $b = 0;
                        
                        $m11 +=  getAcc($data["gl_rep_conf_id"],$data["id"],$_yyyy,$data["i_show"])[0];
                        $m22 +=  getAcc($data["gl_rep_conf_id"],$data["id"],$after_yyyy,$data["i_show"])[0];  
                        
                        
                        if($data['gl_dc_activity_id']==$gl_dc_activity_id){
                            
                            $m1 += getAcc($data["gl_rep_conf_id"],$data["id"],$_yyyy,$data["i_show"])[0];
                            $m2 += getAcc($data["gl_rep_conf_id"],$data["id"],$after_yyyy,$data["i_show"])[0];
                            
                        }else{
                            $m1 = getAcc($data["gl_rep_conf_id"],$data["id"],$_yyyy,$data["i_show"])[0];
                            $m2 = getAcc($data["gl_rep_conf_id"],$data["id"],$after_yyyy,$data["i_show"])[0];
                            $gl_dc_activity_id = $data['gl_dc_activity_id']; 
                            
                        }
                        
                        

                   if($data["i_show"] ==9){
                    
                    
                   $y = $_yyyy;   
                   $p2 = (($y-2) < (START_YEAR_BG))?0:$ar_bgAfter[($_yyyy-2)];
                   $p1 = $ar_bgAfter[($_yyyy-1)];
                   
                   if($i==($i_row-2))
                                $str .= "<tr>"
                                    ."<td align='left'>".getLevel($data["i_show"],$data["c_name"],$data["id"],$data["i_row"])."</td>" //getLevel
                                    ."<td align='right' style='font-weight:bold;'>".accMinus($m11)."</td>" //etAcc($id,$y,$i)
                                    ."<td align='right' style='font-weight:bold;'>".accMinus($m22)."</td>"
                                    ."</tr>";
                                    
                   if($i==($i_row-1))
                                $str .= "<tr>"
                                    ."<td align='left'>".getLevel($data["i_show"],$data["c_name"],$data["id"],$data["i_row"])."</td>" //getLevel
                                    ."<td align='right' class='Underlined'>".accMinus($p1)."</td>" //etAcc($id,$y,$i)
                                    ."<td align='right' class='Underlined'>".accMinus($p2)."</td>"
                                    ."</tr>";
                   if($i==($i_row-0))
                                $str .= "<tr>"
                                    ."<td align='left'>".getLevel($data["i_show"],$data["c_name"],$data["id"],$data["i_row"])."</td>" //getLevel
                                    ."<td align='right' class='dblUnderlined'>".accMinus($m11+$p1)."</td>" //etAcc($id,$y,$i)
                                    ."<td align='right' class='dblUnderlined'>".accMinus($m22+$p2)."</td>"
                                    ."</tr>";
                                    
                                
                    }else if($data["i_show"] ==8){ // Sum Grop

                   
                                $str .= "<tr>"
                                    ."<td align='left'>".getLevel($data["i_show"],$data["c_name"],$data["id"],$data["i_row"])."</td>" //getLevel
                                    ."<td align='right' class='Underlined'>".accMinus($m1)."</td>" //etAcc($id,$y,$i)
                                    ."<td align='right' class='Underlined'>".accMinus($m2)."</td>"
                                    ."</tr>";
                    }else{
                      
                        
                            $str .= "<tr>"
                                    ."<td align='left'>".getLevel($data["i_show"],$data["c_name"],$data["id"],$data["i_row"])."</td>" //getLevel
                                    ."<td align='right'>".getAcc($data["gl_rep_conf_id"],$data["id"],$_yyyy,$data["i_show"])[1]."</td>" //etAcc($id,$y,$i)
                                    ."<td align='right'>".getAcc($data["gl_rep_conf_id"],$data["id"],$after_yyyy,$data["i_show"])[1]."</td>"
                                    ."</tr>"; 
                    } 
            
                    
                
		$i++;
	}// end while

	if ($str == "")
		$str = "ไม่พบข้อมูล";

	$str = "<table cellspacing='0' cellpadding='0' width='100%' border='0' style=\"border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt\">
				<tr><th colspan='3'>".CUSTOMER_ALL_COST_NAME."</th></tr>
                                <tr><th colspan='3'>{$_REQUEST['titleReport']}</th></tr>
				<tr><th colspan='3'>สำหรับระยะเวลาบัญชีสิ้นสุด วันที่ 30 กันยายน {$th_yyyy} </th></tr>
			</table>
			<table cellspacing='0' cellpadding='0' width='100%' border='1' style=\"border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt\">
				<tr bgcolor='#A5BAD6'>
					<th width='60%' align='center'><b>รายการ</b></th>
					<th width='20%' align='center'><b>{$th_yyyy}</b></th>
					<th width='20%' align='center'><b>{$after_th_yyyy}</b></th>
				</tr>
				{$str}
			</table>
			"; 
	if(isset($_REQUEST['mode'])) echo headerX($_REQUEST['mode'],$str); 			
?>