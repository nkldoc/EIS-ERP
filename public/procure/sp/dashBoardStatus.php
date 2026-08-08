<?php
include("../conf/config.php");
include("../lib/database/DatabaseServer.php");
include("../lib/database/apiUtil.php");
include("../lib/date/i_date.class.php");

//exit();
//PHP session
$ss_emp_id = $_SESSION["sp_emp_id"] ?? null;
$ss_cost_id = $_SESSION["dc_cost_id"] ?? null;
$ss_username = $_SESSION["user_name"] ?? null;
$ss_user_id = $_SESSION["user_id"] ?? null; 

require_once("../java/Java.inc");
$session = procure_java_session();
if (!java_values($session->get("user_id"))) {
    echo "<script>top.frames.location.reload(false);</script>";
    exit;
}


$user_name = java_values($session->get("user_name"));
$user_id = java_values($session->get("user_id"));
$dc_cost_id = java_values($session->get("dc_cost_id"));
$sp_emp_id = java_values($session->get("sp_emp_id"));
$i_type_emp = java_values($session->get("i_type_emp"));

switch ($i_type_emp) { // 1 ฝ่ายงานซื้อจ้าง , 2 admin , 0 หน่วยงานขอซื้อจ้าง , 3 ผู้บริหารเงิน , 4 ผู้บริหาร
    case 0: $cfg = array("value" => 0, "file" => "newTor_1", "i_is_graph" => true);
        break;
    case 1: $cfg = array("value" => 1, "file" => "newTor", "i_is_graph" => true);
        break;
    case 2: $cfg = array("value" => 2, "file" => "newTor", "i_is_graph" => true);
        break;
    case 3: $cfg = array("value" => 3, "file" => "newTor", "i_is_graph" => true);
        break;
    case 4: $cfg = array("value" => 4, "file" => "newTor", "i_is_graph" => false);
        break;
    default: break;
}       
?>
<!DOCTYPE html>
<html lang="en"> 
    <head> 
        <!-- Meta -->
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0"> 
        <meta name="description" content="">
        <meta name="author" content="">     
        <!-- FontAwesome JS-->
        <script defer src="dboard/assets/plugins/fontawesome/js/all.min.js"></script>
        <link rel="stylesheet" type="text/css" href="../css/icon_all.css?dc=<?= __VPRODUCT_ ?>" />
        <!-- System ERP :: Src js  --> 
        <script type="text/javascript" src="../js/jquery.js"></script>
        <script type="text/javascript" src="../js/ext-3.4.0/adapter/jquery/ext-jquery-adapter.js"></script>
        <script type="text/javascript" src="../js/ext-3.4.0/ext-all.js"></script>
        <!-- App CSS -->  
        <link href="../js/ext-3.4.0/resources/css/ext-all.css" rel="stylesheet" type="text/css" /> 
        <link id="theme-style" rel="stylesheet" href="dboard/assets/css/portal.css">
        <!-- dboard -->          
        <script src="dboard/assets/plugins/popper.min.js"></script>
        <script src="dboard/assets/plugins/bootstrap/js/bootstrap.min.js"></script>   
 
        <script src="dboard/assets/js/dashBard.js?_dc=<?= __VPRODUCT_; ?>"></script> 

    </head>  <style type="text/css">

        input#chat {
            width: 410px
        }

        #console-container {
            width: 600px;
        }

        #console {
            border: 1px solid #CCCCCC;
            border-right-color: #999999;
            border-bottom-color: #999999;
            height: 170px;
            overflow-y: scroll;
            padding: 5px;
            width: 100%;
        }

        #console p {
            padding: 0;
            margin: 0;
        }
        .btn-show{

        }
        .btn-closex{

            /*
            --bs-btn-close-color: #000;
            --bs-btn-close-bg: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23000'%3e%3cpath d='M.293.293a1 1 0 0 1 1.414 0L8 6.586 14.293.293a1 1 0 1 1 1.414 1.414L9.414 8l6.293 6.293a1 1 0 0 1-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 0 1-1.414-1.414L6.586 8 .293 1.707a1 1 0 0 1 0-1.414z'/%3e%3c/svg%3e");
            --bs-btn-close-opacity: 0.5;
            --bs-btn-close-hover-opacity: 0.75;
            --bs-btn-close-focus-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
            --bs-btn-close-focus-opacity: 1;
            --bs-btn-close-disabled-opacity: 0.25;
            --bs-btn-close-white-filter: invert(1) grayscale(100%) brightness(200%);
            box-sizing:content-box;
            width:1em;
            height:1em;
            padding:.25em .25em;
            color:var(--bs-btn-close-color);
            background:rgba(0,0,0,0) var(--bs-btn-close-bg) center/1em auto no-repeat;
            border:0;
            border-radius:.375rem;
            opacity:var(--bs-btn-close-opacity)*/
        }
        #console{
            font:normal 10px 'Mitr', sans-serif;
            color:#000;
        }
        .app-search-form{
            position:relative;
            max-width:600px
        }
        .app-search-form .search-input{
            font-size:.875rem;
            border-radius:.25rem;
            padding-right:3rem;
            padding-left:1rem
        }
        .app-search-form .search-input:focus{
            border-color:#e7e9ed
        }
        .app-search-form .search-btn{
            color:#828d9f;
            background:none;
            border:none;
            position:absolute;
            right:0;
            top:0;
            margin-right:0;
            padding:.5rem 1rem
        }
        .app-search-form .search-btn:active,
        .app-search-form .search-btn:focus,
        .app-search-form .search-btn:hover{
            outline:none !important;
            color:#15a362;
            box-shadow:none
        }
    </style> 

    <?PHP
    $jsondata = file_get_contents('../conf/app/202401group.json');
    $data = json_decode($jsondata, true);

    for ($i = 0; $i < sizeof($data["webapp"]["group"]); $i++) {
//        echo $data["webapp"]["group"][$i]["name"]
//        . " >> " . $data["webapp"]["group"][$i]["nameTxt"]
//        . " >> " . $data["webapp"]["group"][$i]["totalCount"];
//        echo "<br>"; 
        $grouMenuId = $data["webapp"]["group"][$i]["menuGroupID"];
        $id = null;

        foreach ($grouMenuId as $key => $menuArr) {
            $id .= $menuArr['id'] . " => (" . $menuArr['approved'] . ") ,";
        }

//        echo $data["webapp"]["group"][$i]["nameTxt"]."--> ".rtrim($id, " ,");
//        echo "<br>";
    }

    function getProcess($i_type_emp) {
        switch ($i_type_emp) { // 1 ฝ่ายงานซื้อจ้าง , 2 admin , 0 หน่วยงานขอซื้อจ้าง , 3 ผู้บริหารเงิน , 4 ผู้บริหาร
            case 1: $cfg = array("value" => 4, "file" => "newTor_1", "i_is_graph" => true);
                break;
            case 2: $cfg = array("value" => 1, "file" => "newTor", "i_is_graph" => true);
                break;
            case 3: $cfg = array("value" => 1, "file" => "newTor", "i_is_graph" => true);
                break;
            case 4: $cfg = array("value" => 2, "file" => "newTor", "i_is_graph" => true);
                break;
            default: $cfg = array("value" => 0, "file" => "newTor", "i_is_graph" => true);
                break;
        }

        return $cfg['value'];
    }

    $g1["name"] = $data["webapp"]["group"][0]["nameTxt"];
    $g2["name"] = $data["webapp"]["group"][1]["nameTxt"];
    $g3["name"] = $data["webapp"]["group"][2]["nameTxt"];
    $g4["name"] = $data["webapp"]["group"][3]["nameTxt"];

    $g1["totalCount"] = $data["webapp"]["group"][0]["totalCount"] = getProcess(1);
    $g2["totalCount"] = $data["webapp"]["group"][1]["totalCount"] = getProcess(2);
    $g3["totalCount"] = $data["webapp"]["group"][2]["totalCount"] = getProcess(3);
    $g4["totalCount"] = $data["webapp"]["group"][3]["totalCount"] = getProcess(4);
    ?> 
    <body class="app">     
      
       
           <div id="box-show-remove-m2" style="display:block;" class="app-card alert alert-dismissible shadow-sm mb-4 border-left-decoration">
                    <div class="inner">
                        <div class="app-card-body p-3 p-lg-4">
                            <h5 class="mb-3">รายการซื้อจ้าง <?=$_REQUEST['textSearchID']??null;?></h5> 
                            <button type="button" class="btn-close" aria-label="Close"></button>
                        </div><!--//app-card-body--> 
                    </div><!--//inner-->
                </div><!--//app-card-->
 
 
    </div>
    <!--//app-content--> 
</body>

<script>
    Ext.onReady(function () {
        Ext.QuickTips.init();
        Ext.MessageBox.minWidth = 400;
  
    });
</script>
</html> 

