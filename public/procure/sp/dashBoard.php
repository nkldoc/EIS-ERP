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

//Java Session
require_once("../java/Java.inc");
$session = procure_java_session();
if (!java_values($session->get("user_id")) && !$ss_user_id) {
    echo "Logout";
    echo "<script>top.frames.location.reload(false);</script>";
    exit;
} else {
//    echo "Login";
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

function shareSession() {
    $set = null;

    $session_id = trim($_GET['sharesession']);

    if ($session_id != session_id()) {
        session_destroy();
        session_id($session_id);
        session_start();
    }
    if (isset($_GET['sharesession'])) {

        $_SESSION['supplies'] = false;
        $_SESSION['eis'] = false;
        $_SESSION['procure'] = false;

        $_SESSION['subdomain'] = $_GET['domain'];
        $_SESSION['email'] = $_GET['email'];

        if ($_SERVER['REQUEST_URI'] == '/nmu/access/signin.php') {
            $_SESSION['nmu'] = true;
        }
    }
    echo "<hr>cookies";
    var_dumP($_COOKIE); // cookie send by browser, changes after second reload  
    echo "<hr>session";
    var_dump($_SESSION); //filled after second reload as its values are assigned in the code below
    echo "<hr>Request";
    var_dump($_REQUEST); //filled after second reload as its values are assigned in the code below
}

function getSessAapp() {

    return " Ext.session = Ext.apply({ 'cost_name'	:'" . $_SESSION['cost_name'] . "',
                                    'cost_code':'" . $_SESSION['cost_code'] . "',
                                    'dc_cost_id':" . $_SESSION['dc_cost_id'] . ",
                                    'user_id' :" . $_SESSION['user_id'] . ",
                                    'dc_department_id':" . $_SESSION['dc_department_id'] . ",
                                    'dc_department_type_id':" . $_SESSION['dc_department_type_id'] . ",
                                    'i_level':" . $_SESSION['i_level'] . ",
                                    'sp_emp_id':" . $_SESSION['sp_emp_id'] . ",
                                    'user_name' :'" . $_SESSION['user_name'] . "',
                                    'bg_year' :" . YEARBG . ",         
                                    'domain' :Ext.doMain,         
                            });";
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
        <!-- Charts JS -->
        <script src="dboard/assets/plugins/chart.js/chart.min.js?_dc=<?= __VPRODUCT_; ?>"></script> 
        <script src="dboard/assets/js/index-charts.js?_dc=<?= __VPRODUCT_; ?>"></script>  
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
        .message.received {
            background-color: #e4e6eb;
            align-self: flex-start;
        }
        .message.sent {
            /*            background-color: #0078ff;
                        color: white;
                        align-self: flex-end;*/
            background: #f4f7f9;
            width:100%;
            position:relative;
            height:47px;
            padding-top:10px;
            padding-right:50px;
            padding-bottom:10px;
            padding-left:15px;
            border:none;
            resize:none;
            outline:none;
            border:1px solid #ccc;
            color:#000;
            border-top:none;
            border-bottom-right-radius:5px;
            border-bottom-left-radius:5px;
            overflow:hidden;
        }
        .search-item {
    font:normal 11px tahoma, arial, helvetica, sans-serif;
    padding:3px 10px 3px 10px;
    border:1px solid #fff;
    border-bottom:1px solid #eeeeee;
    white-space:normal;
    color:#555;
}
.search-item h3 {
    display:block;
    font:inherit;
    font-weight:bold;
    color:#222;
}

.search-item h3 span {
    float: right;
    font-weight:normal;
    margin:0 0 5px 5px;
    width:100px;
    display:block;
    clear:none;
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

    function getProcess($i_type_emp, $ttal = 0) {
        switch ($i_type_emp) { // 1 ฝ่ายงานซื้อจ้าง , 2 admin , 0 หน่วยงานขอซื้อจ้าง , 3 ผู้บริหารเงิน , 4 ผู้บริหาร
            case 1: $cfg = array("value" => $ttal, "file" => "newTor_1", "i_is_graph" => true);
                break;
            case 2: $cfg = array("value" => $ttal, "file" => "newTor", "i_is_graph" => true);
                break;
            case 3: $cfg = array("value" => $ttal, "file" => "newTor", "i_is_graph" => true);
                break;
            case 4: $cfg = array("value" => $ttal, "file" => "newTor", "i_is_graph" => true);
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

    $g1["totalCount"] = $data["webapp"]["group"][0]["totalCount"] = getProcess(1, 3);
    $g2["totalCount"] = $data["webapp"]["group"][1]["totalCount"] = getProcess(2, 0);
    $g3["totalCount"] = $data["webapp"]["group"][2]["totalCount"] = getProcess(3, 0);
    $g4["totalCount"] = $data["webapp"]["group"][3]["totalCount"] = getProcess(4, 0);
    ?> 
    <body id="pageDashBoardID" class="app">     
        <div class="app-content pt-3 p-md-3 p-lg-4">
            <div class="container-xl"> 
                <div style="width:600px;">
    <div class="x-box-tl"><div class="x-box-tr"><div class="x-box-tc"></div></div></div>
    <div class="x-box-ml"><div class="x-box-mr"><div class="x-box-mc">
        <h3 style="margin-bottom:5px;">ค้นหารายการซื้อจ้าง</h3>
        <input type="text" size="40" name="search" id="search" />
        <div style="padding-top:4px;">
            Live search requires a minimum of 4 characters.
        </div>
    </div></div></div>
    <div class="x-box-bl"><div class="x-box-br"><div class="x-box-bc"></div></div></div>
</div>
            <!--<h1 class="app-page-title">งานซื้อ/จ้างประจำปีงบประมาณ <?= YEARBG ?></h1>-->  
                <a class="nav-link active" href="./dboard/help.html">
                    <span class="nav-icon">
                        <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-question-circle" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"></path>
                        <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"></path>
                        </svg>
                    </span> 
                </a>
                <nav class="table" style="display:none;">
                    <ul>
                        <li> <div id="seachID" class=".btn-show">ค้นหา clt+f</div></li>
                        <li> <div id="bu_downloadID" class="">Add Event Socket</div></li>
                        <li>  <span class="nav-link-text">Help</span></li>
                    </ul></nav> 

                <!--alert msg-->

                <div id="box-show-remove-m1" style="display:none;" class="app-card alert alert-dismissible shadow-sm mb-4 border-left-decoration">
                    <div class="inner">
                        <div class="app-card-body p-3 p-lg-4">
                            <h5 class="mb-3">ข้อความแจ้งเตือน</h5> 
                            <div class="row gx-5 gy-3">
                                <div id="messagesID" class="col-12 col-lg-9"></div> 
                            </div>  
                            <!--<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>-->
                            <button type="button" class="btn-close" aria-label="Close"></button>
                        </div> 
                    </div> 
                </div>
                <!-- //app-card--> 
                <div id="box-show-remove-m2" style="display:none;" class="app-card alert alert-dismissible shadow-sm mb-4 border-left-decoration">
                    <div class="inner">
                        <div class="app-card-body p-3 p-lg-4">
                            <h5 class="mb-3">ค้นหา รายการซื้อจ้าง</h5>
                            <div class="row gx-5 gy-3">
                                <div class="col-12 col-lg-9">

                                    <div class="app-search-box col">
                                        <div class="app-search-form">   
                                            <input type="text" placeholder="เลขที่อ้างอิง/เรื่อง/เลขที่ซื้อจ้าง..." id="textSearchID" class="form-control search-input">
                                            <button type="submit" class="btn search-btn btn-primary" id="buSearchID" value="Search">
                                                <i class="fa-solid fa-magnifying-glass"></i></button> 
                                        </div> 
                                    </div><!--//app-search-box-->  
                                    <!--<div>Portal is a free Bootstrap 5 admin dashboard template. The design is simple, clean and modular so it's a great base for building any modern web app.</div>-->
                                </div><!--//col-->
                                <div id="viewstatusID" class="col-12 col-lg-3">
                                    <a class="btn app-btn-primary"><svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-file-earmark-arrow-down me-2" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M4 0h5.5v1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h1V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2z"/>
                                        <path d="M9.5 3V0L14 4.5h-3A1.5 1.5 0 0 1 9.5 3z"/>
                                        <!--<path fill-rule="evenodd" d="M8 6a.5.5 0 0 1 .5.5v3.793l1.146-1.147a.5.5 0 0 1 .708.708l-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 1 1 .708-.708L7.5 10.293V6.5A.5.5 0 0 1 8 6z"/>-->
                                        </svg>แสดงรายละเอียด</a>
                                </div><!--//col-->
                            </div><!--//row-->
                            <button type="button" class="btn-close" aria-label="Close"></button>
                        </div><!--//app-card-body--> 
                    </div><!--//inner-->
                </div><!--//app-card-->
                <div id="group11" class="app-card app-card-accordion shadow-sm mb-4"  style="display:none;">
                    <div class="app-card-header p-4 pb-2  border-0">
                        <button id="buCloseGroup11" style="float:right;" type="button" class="btn-close" aria-label="Close"></button>
                        <h4 class="app-card-title" id="ttg1"><?= $g1["name"] . " " . $g1["totalCount"]; ?></h4> 
                    </div><!--//app-card-header  class="accordion-button btn btn-link" type="button" data-bs-toggle="collapse"  data-bs-target="#faq1-1" aria-expanded="false" aria-controls="faq1-1"-->
                    <div class="app-card-body p-4 pt-0">
                        <div id="faq1-accordion" class="faq1-accordion faq-accordion accordion">



                            <div class="accordion-item">
                                <h2 class="accordion-header" id="faq1-heading-5">
                                    <button class="accordion-button btn btn-link" type="button" data-bs-toggle="collapse"  data-bs-target="#faq1-5" aria-expanded="false" aria-controls="faq1-5">
                                        ตรวจสอบเอกสาร
                                    </button>
                                </h2>
                                <div id="faq1-5" class="accordion-collapse collapse border-0" aria-labelledby="faq1-heading-5">
                                    <div class="accordion-body text-start p4"> 
                                        รายการที่ตรวจสอบ แหล่งเงิน ค่าใช้จ่าย ให้ถูกต้อง หลังจากที่ได้รับมอบหมายให้ทำรายการนี้
                                    </div>
                                </div>
                            </div><!--//accordion-item-->



                        </div><!--//faq1-accordion-->
                    </div><!--//app-card-body-->
                </div><!--//app-card-->
                <div id="groupMenu1" class="row g-4 mb-4">
                    <div class="col-6 col-lg-3" id="group1">
                        <div class="app-card app-card-stat shadow-sm h-100">
                            <div class="app-card-body p-3 p-lg-4">
                                <h4 class="stats-type mb-1" id="groupMenu1"><?= $g1["name"]; ?></h4>
                                <div class="stats-figure"> <?= $g1["totalCount"]; ?></div>
                                <div class="stats-meta text-warning-emphasis">
                                    <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-arrow-up" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5z"/>
                                    </svg>
                                    รอดำเนินการ
                                </div>
                                <div class="stats-meta text-success">
                                    <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-arrow-down" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1z"/>
                                    </svg>
                                    กำลังดำเนินการ</div>
                            </div><!--//app-card-body-->
                            <a class="app-card-link-mask" href="#"></a>
                        </div><!--//app-card-->
                    </div><!--//col-->
                    <div id="group12" class="app-card app-card-accordion shadow-sm mb-4" style="display:none;">
                        <div class="app-card-header p-4 pb-2  border-0">
                            <button id="buCloseGroup12" style="float:right;" type="button" class="btn-close" aria-label="Close"></button>
                            <h4 class="app-card-title"><?= $g2["name"] . " " . $g2["totalCount"]; ?></h4>
                        </div><!--//app-card-header-->
                        <div class="app-card-body p-4 pt-0">
                            <div id="faq1-accordion" class="faq1-accordion faq-accordion accordion">

                                <div class="accordion-item">
                                    <h2 class="accordion-header" id="faq1-heading-1">
                                        <button class="accordion-button btn btn-link" type="button" data-bs-toggle="collapse"  data-bs-target="#faq1-1" aria-expanded="false" aria-controls="faq1-1">
                                            ยืนยันการทำกันเหลื่อม(ยังไม่ก่อหนี้) 
                                        </button>
                                    </h2>
                                    <div id="faq1-1" class="accordion-collapse collapse border-0" aria-labelledby="faq1-heading-1">
                                        <div class="accordion-body text-start p4">
                                            Anim pariatur cliche reprehenderit, enim eiusmod high life
                                            accusamus terry richardson ad squid. 3 wolf moon officia
                                            aute, non cupidatat skateboard dolor brunch. Food truck
                                            quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor,
                                            sunt aliqua put a bird on it squid single-origin coffee
                                            nulla assumenda shoreditch et. Nihil anim keffiyeh
                                            helvetica, craft beer labore wes anderson cred nesciunt
                                            sapiente ea proident. Ad vegan excepteur butcher vice lomo.
                                            Leggings occaecat craft beer farm-to-table, raw denim
                                            aesthetic synth nesciunt you probably haven't heard of them
                                            accusamus labore sustainable VHS.
                                        </div>
                                    </div>
                                </div><!--//accordion-item-->

                                <div class="accordion-item">
                                    <h2 class="accordion-header" id="faq1-heading-2">
                                        <button class="accordion-button btn btn-link" type="button" data-bs-toggle="collapse"  data-bs-target="#faq1-2" aria-expanded="false" aria-controls="faq1-2">
                                            ยืนยันการทำกันเหลื่อม(ก่อหนี้แล้ว)
                                        </button>
                                    </h2>
                                    <div id="faq1-2" class="accordion-collapse collapse border-0" aria-labelledby="faq1-heading-2">
                                        <div class="accordion-body text-start p4">
                                            Anim pariatur cliche reprehenderit, enim eiusmod high life
                                            accusamus terry richardson ad squid. 3 wolf moon officia
                                            aute, non cupidatat skateboard dolor brunch. Food truck
                                            quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor,
                                            sunt aliqua put a bird on it squid single-origin coffee
                                            nulla assumenda shoreditch et. Nihil anim keffiyeh
                                            helvetica, craft beer labore wes anderson cred nesciunt
                                            sapiente ea proident. Ad vegan excepteur butcher vice lomo.
                                            Leggings occaecat craft beer farm-to-table, raw denim
                                            aesthetic synth nesciunt you probably haven't heard of them
                                            accusamus labore sustainable VHS.
                                        </div>
                                    </div>
                                </div><!--//accordion-item-->


                                <div class="accordion-item">
                                    <h2 class="accordion-header" id="faq1-heading-3">
                                        <button class="accordion-button btn btn-link" type="button" data-bs-toggle="collapse"  data-bs-target="#faq1-3" aria-expanded="false" aria-controls="faq1-3">

                                            ลงนามในสัญญา
                                        </button>
                                    </h2>
                                    <div id="faq1-3" class="accordion-collapse collapse border-0" aria-labelledby="faq1-heading-3">
                                        <div class="accordion-body text-start p4">
                                            Anim pariatur cliche reprehenderit, enim eiusmod high life
                                            accusamus terry richardson ad squid. 3 wolf moon officia
                                            aute, non cupidatat skateboard dolor brunch. Food truck
                                            quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor,
                                            sunt aliqua put a bird on it squid single-origin coffee
                                            nulla assumenda shoreditch et. Nihil anim keffiyeh
                                            helvetica, craft beer labore wes anderson cred nesciunt
                                            sapiente ea proident. Ad vegan excepteur butcher vice lomo.
                                            Leggings occaecat craft beer farm-to-table, raw denim
                                            aesthetic synth nesciunt you probably haven't heard of them
                                            accusamus labore sustainable VHS.
                                        </div>
                                    </div>
                                </div><!--//accordion-item-->

                                <div class="accordion-item">
                                    <h2 class="accordion-header" id="faq1-heading-4">
                                        <button class="accordion-button btn btn-link" type="button" data-bs-toggle="collapse"  data-bs-target="#faq1-4" aria-expanded="false" aria-controls="faq1-4">
                                            บันทึกรายการสัญญา(ไม่มี PR) 
                                        </button>
                                    </h2>
                                    <div id="faq1-4" class="accordion-collapse collapse border-0" aria-labelledby="faq1-heading-4">
                                        <div class="accordion-body text-start p4">
                                            Anim pariatur cliche reprehenderit, enim eiusmod high life
                                            accusamus terry richardson ad squid. 3 wolf moon officia
                                            aute, non cupidatat skateboard dolor brunch. Food truck
                                            quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor,
                                            sunt aliqua put a bird on it squid single-origin coffee
                                            nulla assumenda shoreditch et. Nihil anim keffiyeh
                                            helvetica, craft beer labore wes anderson cred nesciunt
                                            sapiente ea proident. Ad vegan excepteur butcher vice lomo.
                                            Leggings occaecat craft beer farm-to-table, raw denim
                                            aesthetic synth nesciunt you probably haven't heard of them
                                            accusamus labore sustainable VHS.
                                        </div>
                                    </div>
                                </div><!--//accordion-item-->

                                <div class="accordion-item">
                                    <h2 class="accordion-header" id="faq1-heading-5">
                                        <button class="accordion-button btn btn-link" type="button" data-bs-toggle="collapse"  data-bs-target="#faq1-5" aria-expanded="false" aria-controls="faq1-5">

                                            ออกเลขที่สัญญา (ไม่ตรวจรับ)
                                        </button>
                                    </h2>
                                    <div id="faq1-5" class="accordion-collapse collapse border-0" aria-labelledby="faq1-heading-5">
                                        <div class="accordion-body text-start p4">
                                            Anim pariatur cliche reprehenderit, enim eiusmod high life
                                            accusamus terry richardson ad squid. 3 wolf moon officia
                                            aute, non cupidatat skateboard dolor brunch. Food truck
                                            quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor,
                                            sunt aliqua put a bird on it squid single-origin coffee
                                            nulla assumenda shoreditch et. Nihil anim keffiyeh
                                            helvetica, craft beer labore wes anderson cred nesciunt
                                            sapiente ea proident. Ad vegan excepteur butcher vice lomo.
                                            Leggings occaecat craft beer farm-to-table, raw denim
                                            aesthetic synth nesciunt you probably haven't heard of them
                                            accusamus labore sustainable VHS.
                                        </div>
                                    </div>
                                </div><!--//accordion-item-->

                                <div class="accordion-item">
                                    <h2 class="accordion-header" id="faq1-heading-6">
                                        <button class="accordion-button btn btn-link" type="button" data-bs-toggle="collapse"  data-bs-target="#faq1-6" aria-expanded="false" aria-controls="faq1-6">

                                            ตั้งค่าใช้จ่ายรายเดือน (เช็ค)
                                        </button>
                                    </h2>
                                    <div id="faq1-6" class="accordion-collapse collapse border-0" aria-labelledby="faq1-heading-6">
                                        <div class="accordion-body text-start p4">
                                            Anim pariatur cliche reprehenderit, enim eiusmod high life
                                            accusamus terry richardson ad squid. 3 wolf moon officia
                                            aute, non cupidatat skateboard dolor brunch. Food truck
                                            quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor,
                                            sunt aliqua put a bird on it squid single-origin coffee
                                            nulla assumenda shoreditch et. Nihil anim keffiyeh
                                            helvetica, craft beer labore wes anderson cred nesciunt
                                            sapiente ea proident. Ad vegan excepteur butcher vice lomo.
                                            Leggings occaecat craft beer farm-to-table, raw denim
                                            aesthetic synth nesciunt you probably haven't heard of them
                                            accusamus labore sustainable VHS.
                                        </div>
                                    </div>
                                </div><!--//accordion-item-->

                            </div><!--//faq1-accordion-->
                        </div><!--//app-card-body-->
                    </div><!--//app-card-->
                    <div class="col-6 col-lg-3" id="group2" <?php echo ($_SESSION["dc_cost_id"] == 97 || $_SESSION["user_id"] == 1) ? "style='display:block  ;'" : "style='display:none;'"; ?>>
                        <div class="app-card app-card-stat shadow-sm h-100">
                            <div class="app-card-body p-3 p-lg-4">
                                <h4 class="stats-type mb-1" id="groupMenu2"><?= $g2["name"]; ?></h4>
                                <div class="stats-figure"><?= $g2["totalCount"]; ?></div>
                                <div class="stats-meta text-warning-emphasis">
                                    <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-arrow-up" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5z"/>
                                    </svg>  
                                    บันทึกรายละเอียดในสัญญา
                                </div>
                                <div class="stats-meta text-success">
                                    <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-arrow-down" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1z"/>
                                    </svg>
                                    รับของ/ตรวจรับ</div>
                            </div><!--//app-card-body-->
                            <a class="app-card-link-mask" href="#"></a>
                        </div><!--//app-card-->
                    </div><!--//col-->
                    <div id="group13" class="app-card app-card-accordion shadow-sm mb-4" style="display:none;">
                        <div class="app-card-header p-4 pb-2  border-0">
                            <button id="buCloseGroup13" style="float:right;" type="button" class="btn-close" aria-label="Close"></button>
                            <h4 class="app-card-title"><?= $g3["name"] . " " . $g3["totalCount"]; ?></h4>
                        </div><!--//app-card-header-->
                        <div class="app-card-body p-4 pt-0">
                            <div id="faq1-accordion" class="faq1-accordion faq-accordion accordion"> 
                                <div class="accordion-item">
                                    <h2 class="accordion-header" id="faq1-heading-1">
                                        <button class="accordion-button btn btn-link" type="button" data-bs-toggle="collapse"  data-bs-target="#faq1-1" aria-expanded="false" aria-controls="faq1-1">
                                            ส่งมอบงาน 
                                        </button>
                                    </h2>
                                    <div id="faq1-1" class="accordion-collapse collapse border-0" aria-labelledby="faq1-heading-1">
                                        <div class="accordion-body text-start p4">
                                            Anim pariatur cliche reprehenderit, enim eiusmod high life
                                            accusamus terry richardson ad squid. 3 wolf moon officia
                                            aute, non cupidatat skateboard dolor brunch. Food truck
                                            quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor,
                                            sunt aliqua put a bird on it squid single-origin coffee
                                            nulla assumenda shoreditch et. Nihil anim keffiyeh
                                            helvetica, craft beer labore wes anderson cred nesciunt
                                            sapiente ea proident. Ad vegan excepteur butcher vice lomo.
                                            Leggings occaecat craft beer farm-to-table, raw denim
                                            aesthetic synth nesciunt you probably haven't heard of them
                                            accusamus labore sustainable VHS.
                                        </div>
                                    </div>
                                </div><!--//accordion-item-->

                                <div class="accordion-item">
                                    <h2 class="accordion-header" id="faq1-heading-2">
                                        <button class="accordion-button btn btn-link" type="button" data-bs-toggle="collapse"  data-bs-target="#faq1-2" aria-expanded="false" aria-controls="faq1-2">
                                            ตรวจรับพัสดุ/ครุภัณฑ์ 
                                        </button>
                                    </h2>
                                    <div id="faq1-2" class="accordion-collapse collapse border-0" aria-labelledby="faq1-heading-2">
                                        <div class="accordion-body text-start p4">
                                            Anim pariatur cliche reprehenderit, enim eiusmod high life
                                            accusamus terry richardson ad squid. 3 wolf moon officia
                                            aute, non cupidatat skateboard dolor brunch. Food truck
                                            quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor,
                                            sunt aliqua put a bird on it squid single-origin coffee
                                            nulla assumenda shoreditch et. Nihil anim keffiyeh
                                            helvetica, craft beer labore wes anderson cred nesciunt
                                            sapiente ea proident. Ad vegan excepteur butcher vice lomo.
                                            Leggings occaecat craft beer farm-to-table, raw denim
                                            aesthetic synth nesciunt you probably haven't heard of them
                                            accusamus labore sustainable VHS.
                                        </div>
                                    </div>
                                </div><!--//accordion-item-->


                            </div><!--//faq1-accordion-->
                        </div><!--//app-card-body-->
                    </div><!--//app-card-->      
                    <div class="col-6 col-lg-3" id="group3" <?php echo ($_SESSION["dc_cost_id"] == 97 || $_SESSION["user_id"] == 1) ? "style='display:block  ;'" : "style='display:none;'"; ?>>
                        <div class="app-card app-card-stat shadow-sm h-100">
                            <div class="app-card-body p-3 p-lg-4">
                                <h4 class="stats-type mb-1"  id="groupMenu3"><?= $g3["name"]; ?></h4>
                                <div class="stats-figure"> <?= $g3["totalCount"]; ?></div>
                                <div class="stats-meta text-warning-emphasis">
                                    <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-arrow-up" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5z"/>
                                    </svg>
                                    กำลังดำเนินการตรวจรับ
                                </div>
                                <div class="stats-meta text-success">
                                    <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-arrow-down" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1z"/>
                                    </svg>
                                    การตรวจรับรอวางบิล</div>
                            </div><!--//app-card-body-->
                            <a class="app-card-link-mask" href="#"></a>
                        </div><!--//app-card-->
                    </div><!--//col-->

                    <div id="group14" class="app-card app-card-accordion shadow-sm mb-4" style="display:none;">
                        <div class="app-card-header p-4 pb-2  border-0">
                            <button id="buCloseGroup14" style="float:right;" type="button" class="btn-close" aria-label="Close"></button>
                            <h4 class="app-card-title"><?= $g4["name"] . " " . $g4["totalCount"]; ?></h4>
                        </div><!--//app-card-header-->
                        <div class="app-card-body p-4 pt-0">
                            <div id="faq1-accordion" class="faq1-accordion faq-accordion accordion">

                                <div class="accordion-item">
                                    <h2 class="accordion-header" id="faq1-heading-1">
                                        <button class="accordion-button btn btn-link" type="button" data-bs-toggle="collapse"  data-bs-target="#faq1-1" aria-expanded="false" aria-controls="faq1-1">
                                            บันทึกใบขอเบิก
                                        </button>
                                    </h2>
                                    <div id="faq1-1" class="accordion-collapse collapse border-0" aria-labelledby="faq1-heading-1">
                                        <div class="accordion-body text-start p4">
                                            Anim pariatur cliche reprehenderit, enim eiusmod high life
                                            accusamus terry richardson ad squid. 3 wolf moon officia
                                            aute, non cupidatat skateboard dolor brunch. Food truck
                                            quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor,
                                            sunt aliqua put a bird on it squid single-origin coffee
                                            nulla assumenda shoreditch et. Nihil anim keffiyeh
                                            helvetica, craft beer labore wes anderson cred nesciunt
                                            sapiente ea proident. Ad vegan excepteur butcher vice lomo.
                                            Leggings occaecat craft beer farm-to-table, raw denim
                                            aesthetic synth nesciunt you probably haven't heard of them
                                            accusamus labore sustainable VHS.
                                        </div>
                                    </div>
                                </div><!--//accordion-item-->

                            </div><!--//faq1-accordion-->
                        </div><!--//app-card-body-->
                    </div><!--//app-card-->                    <div class="col-6 col-lg-3" id="group4" <?php echo ($_SESSION["dc_cost_id"] == 97 || $_SESSION["user_id"] == 1) ? "style='display:block  ;'" : "style='display:none;'"; ?>>
                        <div class="app-card app-card-stat shadow-sm h-100">
                            <div class="app-card-body p-3 p-lg-4">
                                <h4 class="stats-type mb-1" id="groupMenu4"><?= $g4["name"]; ?></h4>
                                <div class="stats-figure"> <?= $g4["totalCount"]; ?></div>
                                <div class="stats-meta text-warning-emphasis">
                                    <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-arrow-up" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5z"/>
                                    </svg>
                                    รายการวางบิลแล้ว
                                </div>
                                <div class="stats-meta text-success">
                                    <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-arrow-down" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1z"/>
                                    </svg>
                                    กำลังส่งเบิก</div>
                                <div class="stats-meta text-danger">
                                    <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-arrow-up" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5z"/>
                                    </svg>
                                    รายถูกทักท้วง</div>
                            </div><!--//app-card-body-->
                            <a class="app-card-link-mask" href="#"></a>
                        </div><!--//app-card-->
                    </div><!--//col-->
                </div><!--//row-->  
                <div id="groupMenu2" class="row g-4 mb-4" style="display:none;">
                    <div class="col-12 col-lg-6">
                        <div class="app-card app-card-chart h-100 shadow-sm">
                            <div class="app-card-header p-3">
                                <div class="row justify-content-between align-items-center">
                                    <div class="col-auto">
                                        <h4 id="bgGraphID" style="float:left;" class="app-card-title">แหล่งเงินที่ใช้</h4>
                                        <!--                                        <div id="bgGraphIDcuvID" onclick="" style="
                                                                                                                    display:flex; justify-content: center;  
                                                                                                                    align-items: center;text-align:center; 
                                                                                                                    font-weight:bold;
                                                                                                                    color:#CCC; cursor: pointer; 
                                                                                                                    margin:auto; width: 16px; 
                                                                                                                    height: 16px; 
                                                                                                                    background-color:#0e7bf0; 
                                                                                                                    border: solid 2px #8b9db0; 
                                                                                                                    border-radius: 100%;">1</div>-->
                                    </div><!--//col-->
                                    <div class="col-auto">
                                        <div class="card-header-action">
                                            <a href="charts.html">รายละเอียดเพิ่มเติม</a>
                                        </div><!--//card-header-actions-->
                                    </div><!--//col-->
                                </div><!--//row-->
                            </div><!--//app-card-header-->
                            <div class="app-card-body p-3 p-lg-4">
                                <div class="mb-3 d-flex">   
                                    <select class="form-select form-select-sm ms-auto d-inline-flex w-auto">
                                        <option value="1" selected>This week</option>
                                        <option value="2">Today</option>
                                        <option value="3">This Month</option>
                                        <option value="3">This Year</option>
                                    </select>
                                </div>
                                <div class="chart-container">
                                    <canvas id="canvas-linechart" ></canvas>
                                </div>
                            </div><!--//app-card-body-->
                        </div><!--//app-card-->
                    </div><!--//col-->
                    <div class="col-12 col-lg-6">
                        <div class="app-card app-card-chart h-100 shadow-sm">
                            <div class="app-card-header p-3">
                                <div class="row justify-content-between align-items-center">
                                    <div class="col-auto">
                                        <h4 class="app-card-title">เงินคงเหลือหลักส่งเบิก</h4>
                                    </div><!--//col-->
                                    <div class="col-auto">
                                        <div class="card-header-action">
                                            <a href="charts.html">รายละเอียดเพิ่มเติม</a>
                                        </div><!--//card-header-actions-->
                                    </div><!--//col-->
                                </div><!--//row-->
                            </div><!--//app-card-header-->
                            <div class="app-card-body p-3 p-lg-4">
                                <div class="mb-3 d-flex">   
                                    <select class="form-select form-select-sm ms-auto d-inline-flex w-auto">
                                        <option value="1" selected>This week</option>
                                        <option value="2">Today</option>
                                        <option value="3">This Month</option>
                                        <option value="3">This Year</option>
                                    </select>
                                </div>
                                <div class="chart-container">
                                    <canvas id="canvas-barchart" ></canvas>
                                </div>
                            </div><!--//app-card-body-->
                        </div><!--//app-card-->
                    </div><!--//col-->

                </div><!--//row-->
                <?PHP if ($i_type_emp != 0) { ?>
                    <div id="groupMenu3" class="row g-4 mb-4">
                        <div class="col-12 col-lg-6">
                            <div class="app-card app-card-progress-list h-100 shadow-sm">
                                <div class="app-card-header p-3">
                                    <div class="row justify-content-between align-items-center">
                                        <div class="col-auto">
                                            <h4 class="app-card-title">Progress</h4>
                                        </div><!--//col-->
                                        <div class="col-auto">
                                            <div class="card-header-action">
                                                <a href="#">All projects</a>
                                            </div><!--//card-header-actions-->
                                        </div><!--//col-->
                                    </div><!--//row-->
                                </div><!--//app-card-header-->
                                <div class="app-card-body">
                                    <div class="item p-3">
                                        <div class="row align-items-center">
                                            <div class="col">
                                                <div class="title mb-1 ">Project lorem ipsum dolor sit amet</div>
                                                <div class="progress">
                                                    <div class="progress-bar bg-success" role="progressbar" style="width: 25%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
                                                </div>
                                            </div><!--//col-->
                                            <div class="col-auto">
                                                <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-chevron-right" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                                                </svg>
                                            </div><!--//col-->
                                        </div><!--//row-->
                                        <a class="item-link-mask" href="#"></a>
                                    </div><!--//item-->


                                    <div class="item p-3">
                                        <div class="row align-items-center">
                                            <div class="col">
                                                <div class="title mb-1 ">Project duis aliquam et lacus quis ornare</div>
                                                <div class="progress">
                                                    <div class="progress-bar bg-success" role="progressbar" style="width: 34%;" aria-valuenow="34" aria-valuemin="0" aria-valuemax="100"></div>
                                                </div>
                                            </div><!--//col-->
                                            <div class="col-auto">
                                                <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-chevron-right" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                                                </svg>
                                            </div><!--//col-->
                                        </div><!--//row-->
                                        <a class="item-link-mask" href="#"></a>
                                    </div><!--//item-->

                                    <div class="item p-3">
                                        <div class="row align-items-center">
                                            <div class="col">
                                                <div class="title mb-1 ">Project sed tempus felis id lacus pulvinar</div>
                                                <div class="progress">
                                                    <div class="progress-bar bg-success" role="progressbar" style="width: 68%;" aria-valuenow="68" aria-valuemin="0" aria-valuemax="100"></div>
                                                </div>
                                            </div><!--//col-->
                                            <div class="col-auto">
                                                <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-chevron-right" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                                                </svg>
                                            </div><!--//col-->
                                        </div><!--//row-->
                                        <a class="item-link-mask" href="#"></a>
                                    </div><!--//item-->

                                    <div class="item p-3">
                                        <div class="row align-items-center">
                                            <div class="col">
                                                <div class="title mb-1 ">Project sed tempus felis id lacus pulvinar</div>
                                                <div class="progress">
                                                    <div class="progress-bar bg-success" role="progressbar" style="width: 52%;" aria-valuenow="52" aria-valuemin="0" aria-valuemax="100"></div>
                                                </div>
                                            </div><!--//col-->
                                            <div class="col-auto">
                                                <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-chevron-right" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                                                </svg>
                                            </div><!--//col-->
                                        </div><!--//row-->
                                        <a class="item-link-mask" href="#"></a>
                                    </div><!--//item-->

                                </div><!--//app-card-body-->
                            </div><!--//app-card-->
                        </div><!--//col-->
                        <div class="col-12 col-lg-6">
                            <div class="app-card app-card-stats-table h-100 shadow-sm">
                                <div class="app-card-header p-3">
                                    <div class="row justify-content-between align-items-center">
                                        <div class="col-auto">
                                            <h4 class="app-card-title">สัญญาที่ใกล้หมดประกัน</h4>
                                        </div><!--//col-->
                                        <div class="col-auto">
                                            <div class="card-header-action">
                                                <a href="#">View report</a>
                                            </div><!--//card-header-actions-->
                                        </div><!--//col-->
                                    </div><!--//row-->
                                </div><!--//app-card-header-->
                                <div class="app-card-body p-3 p-lg-4">
                                    <div class="table-responsive">
                                        <table class="table table-borderless mb-0">
                                            <thead>
                                                <tr>
                                                    <th class="meta">Source</th>
                                                    <th class="meta stat-cell">Views</th>
                                                    <th class="meta stat-cell">Today</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td><a href="#">google.com</a></td>
                                                    <td class="stat-cell">110</td>
                                                    <td class="stat-cell">
                                                        <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-arrow-up text-success" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                        <path fill-rule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5z"/>
                                                        </svg> 
                                                        30%
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td><a href="#">getbootstrap.com</a></td>
                                                    <td class="stat-cell">67</td>
                                                    <td class="stat-cell">23%</td>
                                                </tr>
                                                <tr>
                                                    <td><a href="#">w3schools.com</a></td>
                                                    <td class="stat-cell">56</td>
                                                    <td class="stat-cell">
                                                        <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-arrow-down text-danger" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                        <path fill-rule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1z"/>
                                                        </svg>
                                                        20%
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td><a href="#">javascript.com </a></td>
                                                    <td class="stat-cell">24</td>
                                                    <td class="stat-cell">-</td>
                                                </tr>
                                                <tr>
                                                    <td><a href="#">github.com </a></td>
                                                    <td class="stat-cell">17</td>
                                                    <td class="stat-cell">15%</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div><!--//table-responsive-->
                                </div><!--//app-card-body-->
                            </div><!--//app-card-->
                        </div><!--//col-->
                    </div><!--//row-->
                    <div id="groupMenu4" class="row g-4 mb-4">
                        <div class="col-12 col-lg-4">
                            <div class="app-card app-card-basic d-flex flex-column align-items-start shadow-sm">
                                <div class="app-card-header p-3 border-bottom-0">
                                    <div class="row align-items-center gx-3">
                                        <div class="col-auto">
                                            <div class="app-icon-holder">
                                                <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-receipt" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                <path fill-rule="evenodd" d="M1.92.506a.5.5 0 0 1 .434.14L3 1.293l.646-.647a.5.5 0 0 1 .708 0L5 1.293l.646-.647a.5.5 0 0 1 .708 0L7 1.293l.646-.647a.5.5 0 0 1 .708 0L9 1.293l.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .801.13l.5 1A.5.5 0 0 1 15 2v12a.5.5 0 0 1-.053.224l-.5 1a.5.5 0 0 1-.8.13L13 14.707l-.646.647a.5.5 0 0 1-.708 0L11 14.707l-.646.647a.5.5 0 0 1-.708 0L9 14.707l-.646.647a.5.5 0 0 1-.708 0L7 14.707l-.646.647a.5.5 0 0 1-.708 0L5 14.707l-.646.647a.5.5 0 0 1-.708 0L3 14.707l-.646.647a.5.5 0 0 1-.801-.13l-.5-1A.5.5 0 0 1 1 14V2a.5.5 0 0 1 .053-.224l.5-1a.5.5 0 0 1 .367-.27zm.217 1.338L2 2.118v11.764l.137.274.51-.51a.5.5 0 0 1 .707 0l.646.647.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.509.509.137-.274V2.118l-.137-.274-.51.51a.5.5 0 0 1-.707 0L12 1.707l-.646.647a.5.5 0 0 1-.708 0L10 1.707l-.646.647a.5.5 0 0 1-.708 0L8 1.707l-.646.647a.5.5 0 0 1-.708 0L6 1.707l-.646.647a.5.5 0 0 1-.708 0L4 1.707l-.646.647a.5.5 0 0 1-.708 0l-.509-.51z"/>
                                                <path fill-rule="evenodd" d="M3 4.5a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5zm8-6a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5z"/>
                                                </svg>
                                            </div><!--//icon-holder-->

                                        </div><!--//col-->
                                        <div class="col-auto">
                                            <h4 class="app-card-title">ครุภัณฑ์</h4>
                                        </div><!--//col-->
                                    </div><!--//row-->
                                </div><!--//app-card-header-->
                                <div class="app-card-body px-4">

                                    <div class="intro">รายการรับของ/ตรวจรับ ออกเลขครุภัณฑ์</div>
                                </div><!--//app-card-body-->
                                <div class="app-card-footer p-4 mt-auto">
                                    <a class="btn app-btn-secondary" href="#">รายละเอียด</a>
                                </div><!--//app-card-footer-->
                            </div><!--//app-card-->
                        </div><!--//col-->
                        <div class="col-12 col-lg-4">
                            <div class="app-card app-card-basic d-flex flex-column align-items-start shadow-sm">
                                <div class="app-card-header p-3 border-bottom-0">
                                    <div class="row align-items-center gx-3">
                                        <div class="col-auto">
                                            <div class="app-icon-holder">
                                                <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-code-square" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                <path fill-rule="evenodd" d="M14 1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                                                <path fill-rule="evenodd" d="M6.854 4.646a.5.5 0 0 1 0 .708L4.207 8l2.647 2.646a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 0 1 .708 0zm2.292 0a.5.5 0 0 0 0 .708L11.793 8l-2.647 2.646a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708 0z"/>
                                                </svg>
                                            </div><!--//icon-holder-->

                                        </div><!--//col-->
                                        <div class="col-auto">
                                            <h4 class="app-card-title">วัสดุ</h4>
                                        </div><!--//col-->
                                    </div><!--//row-->
                                </div><!--//app-card-header-->
                                <div class="app-card-body px-4">

                                    <div class="intro">รายการรับของ/ตรวจรับ มูลค่า/เสื่อม</div>
                                </div><!--//app-card-body-->
                                <div class="app-card-footer p-4 mt-auto">
                                    <a class="btn app-btn-secondary" href="#">รายละเอียด</a>
                                </div><!--//app-card-footer-->
                            </div><!--//app-card-->
                        </div><!--//col-->
                        <div class="col-12 col-lg-4">
                            <div class="app-card app-card-basic d-flex flex-column align-items-start shadow-sm">
                                <div class="app-card-header p-3 border-bottom-0">
                                    <div class="row align-items-center gx-3">
                                        <div class="col-auto">
                                            <div class="app-icon-holder">
                                                <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-tools" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                <path fill-rule="evenodd" d="M0 1l1-1 3.081 2.2a1 1 0 0 1 .419.815v.07a1 1 0 0 0 .293.708L10.5 9.5l.914-.305a1 1 0 0 1 1.023.242l3.356 3.356a1 1 0 0 1 0 1.414l-1.586 1.586a1 1 0 0 1-1.414 0l-3.356-3.356a1 1 0 0 1-.242-1.023L9.5 10.5 3.793 4.793a1 1 0 0 0-.707-.293h-.071a1 1 0 0 1-.814-.419L0 1zm11.354 9.646a.5.5 0 0 0-.708.708l3 3a.5.5 0 0 0 .708-.708l-3-3z"/>
                                                <path fill-rule="evenodd" d="M15.898 2.223a3.003 3.003 0 0 1-3.679 3.674L5.878 12.15a3 3 0 1 1-2.027-2.027l6.252-6.341A3 3 0 0 1 13.778.1l-2.142 2.142L12 4l1.757.364 2.141-2.141zm-13.37 9.019L3.001 11l.471.242.529.026.287.445.445.287.026.529L5 13l-.242.471-.026.529-.445.287-.287.445-.529.026L3 15l-.471-.242L2 14.732l-.287-.445L1.268 14l-.026-.529L1 13l.242-.471.026-.529.445-.287.287-.445.529-.026z"/>
                                                </svg>
                                            </div><!--//icon-holder-->

                                        </div><!--//col-->
                                        <div class="col-auto">
                                            <h4 class="app-card-title">สัญญาที่เป็นโครงการต่อเหนื่อง</h4>
                                        </div><!--//col-->
                                    </div><!--//row-->
                                </div><!--//app-card-header-->
                                <div class="app-card-body px-4">

                                    <div class="intro">โครงการที่ทำมากว่า 1 ปีก่องสร้าง เช่นก่อสร้าง</div>
                                </div><!--//app-card-body-->
                                <div class="app-card-footer p-4 mt-auto">
                                    <a class="btn app-btn-secondary" href="#">รายละเอียด</a>
                                </div><!--//app-card-footer-->
                            </div><!--//app-card-->
                        </div><!--//col-->
                    </div><!--//row-->
                    <div id="groupMenu5" class="row g-4 mb-4">
                        <div class="col-12 col-lg-4">
                            <div class="app-card app-card-basic d-flex flex-column align-items-start shadow-sm">
                                <div class="app-card-header p-3 border-bottom-0">
                                    <div class="row align-items-center gx-3">
                                        <div class="col-auto">
                                            <div class="app-icon-holder">
                                                <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-receipt" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                <path fill-rule="evenodd" d="M1.92.506a.5.5 0 0 1 .434.14L3 1.293l.646-.647a.5.5 0 0 1 .708 0L5 1.293l.646-.647a.5.5 0 0 1 .708 0L7 1.293l.646-.647a.5.5 0 0 1 .708 0L9 1.293l.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .801.13l.5 1A.5.5 0 0 1 15 2v12a.5.5 0 0 1-.053.224l-.5 1a.5.5 0 0 1-.8.13L13 14.707l-.646.647a.5.5 0 0 1-.708 0L11 14.707l-.646.647a.5.5 0 0 1-.708 0L9 14.707l-.646.647a.5.5 0 0 1-.708 0L7 14.707l-.646.647a.5.5 0 0 1-.708 0L5 14.707l-.646.647a.5.5 0 0 1-.708 0L3 14.707l-.646.647a.5.5 0 0 1-.801-.13l-.5-1A.5.5 0 0 1 1 14V2a.5.5 0 0 1 .053-.224l.5-1a.5.5 0 0 1 .367-.27zm.217 1.338L2 2.118v11.764l.137.274.51-.51a.5.5 0 0 1 .707 0l.646.647.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.509.509.137-.274V2.118l-.137-.274-.51.51a.5.5 0 0 1-.707 0L12 1.707l-.646.647a.5.5 0 0 1-.708 0L10 1.707l-.646.647a.5.5 0 0 1-.708 0L8 1.707l-.646.647a.5.5 0 0 1-.708 0L6 1.707l-.646.647a.5.5 0 0 1-.708 0L4 1.707l-.646.647a.5.5 0 0 1-.708 0l-.509-.51z"/>
                                                <path fill-rule="evenodd" d="M3 4.5a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5zm8-6a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5z"/>
                                                </svg>
                                            </div><!--//icon-holder-->

                                        </div><!--//col-->
                                        <div class="col-auto">
                                            <h4 class="app-card-title">เลขที่สัญญาล่าสุด</h4>
                                        </div><!--//col-->
                                    </div><!--//row-->
                                </div><!--//app-card-header-->
                                <div class="app-card-body px-4">

                                    <div class="intro">พวช.ซ55670100001 คุณ เพชรรัตน์ แซ่ลิ้ม</div>
                                </div><!--//app-card-body-->
                                <div class="app-card-footer p-4 mt-auto">
                                    <a class="btn app-btn-secondary" href="#">รายละเอียด</a>
                                </div><!--//app-card-footer-->
                            </div><!--//app-card-->
                        </div><!--//col-->
                        <div class="col-12 col-lg-4">
                            <div class="app-card app-card-basic d-flex flex-column align-items-start shadow-sm">
                                <div class="app-card-header p-3 border-bottom-0">
                                    <div class="row align-items-center gx-3">
                                        <div class="col-auto">
                                            <div class="app-icon-holder">
                                                <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-code-square" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                <path fill-rule="evenodd" d="M14 1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                                                <path fill-rule="evenodd" d="M6.854 4.646a.5.5 0 0 1 0 .708L4.207 8l2.647 2.646a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 0 1 .708 0zm2.292 0a.5.5 0 0 0 0 .708L11.793 8l-2.647 2.646a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708 0z"/>
                                                </svg>
                                            </div><!--//icon-holder-->

                                        </div><!--//col-->
                                        <div class="col-auto">
                                            <h4 class="app-card-title">วัสดุ</h4>
                                        </div><!--//col-->
                                    </div><!--//row-->
                                </div><!--//app-card-header-->
                                <div class="app-card-body px-4">

                                    <div class="intro">Pellentesque varius, elit vel volutpat sollicitudin, lacus quam efficitur augue</div>
                                </div><!--//app-card-body-->
                                <div class="app-card-footer p-4 mt-auto">
                                    <a class="btn app-btn-secondary" href="#">รายละเอียด</a>
                                </div><!--//app-card-footer-->
                            </div><!--//app-card-->
                        </div><!--//col-->
                        <div class="col-12 col-lg-4">
                            <div class="app-card app-card-basic d-flex flex-column align-items-start shadow-sm">
                                <div class="app-card-header p-3 border-bottom-0">
                                    <div class="row align-items-center gx-3">
                                        <div class="col-auto">
                                            <div class="app-icon-holder">
                                                <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-tools" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                <path fill-rule="evenodd" d="M0 1l1-1 3.081 2.2a1 1 0 0 1 .419.815v.07a1 1 0 0 0 .293.708L10.5 9.5l.914-.305a1 1 0 0 1 1.023.242l3.356 3.356a1 1 0 0 1 0 1.414l-1.586 1.586a1 1 0 0 1-1.414 0l-3.356-3.356a1 1 0 0 1-.242-1.023L9.5 10.5 3.793 4.793a1 1 0 0 0-.707-.293h-.071a1 1 0 0 1-.814-.419L0 1zm11.354 9.646a.5.5 0 0 0-.708.708l3 3a.5.5 0 0 0 .708-.708l-3-3z"/>
                                                <path fill-rule="evenodd" d="M15.898 2.223a3.003 3.003 0 0 1-3.679 3.674L5.878 12.15a3 3 0 1 1-2.027-2.027l6.252-6.341A3 3 0 0 1 13.778.1l-2.142 2.142L12 4l1.757.364 2.141-2.141zm-13.37 9.019L3.001 11l.471.242.529.026.287.445.445.287.026.529L5 13l-.242.471-.026.529-.445.287-.287.445-.529.026L3 15l-.471-.242L2 14.732l-.287-.445L1.268 14l-.026-.529L1 13l.242-.471.026-.529.445-.287.287-.445.529-.026z"/>
                                                </svg>
                                            </div><!--//icon-holder-->

                                        </div><!--//col-->
                                        <div class="col-auto">
                                            <h4 class="app-card-title">สัญญาที่มีหลักค้ำประกัน</h4>
                                        </div><!--//col-->
                                    </div><!--//row-->
                                </div><!--//app-card-header-->
                                <div class="app-card-body px-4"> 
                                    <div class="intro">
                                        <div>1. ค้ำประกันผลงาน/หักจากเงินงวดแรก</div>
                                        <div>2. เงินสด</div>
                                        <div>3. แคชเชียร์เช็ค</div>
                                        <div>4. หนังสือค้ำประกัน</div>
                                    </div>
                                </div><!--//app-card-body-->
                                <div class="app-card-footer p-4 mt-auto">
                                    <a class="btn app-btn-secondary" href="#">รายละเอียด</a>
                                </div><!--//app-card-footer-->
                            </div><!--//app-card-->
                        </div><!--//col-->
                    </div><!--//row-->
                <?PHP } //End i_type_emp    ?>
                <div id="groupMenu6" class="row g-4 mb-4" style="display:none">  
                    <div class="col-auto">
                        <h4 class="app-card-title">Log</h4> 
                        <input type="text" class="form-control search-input" placeholder="type and press enter to chat" id="chat" />
                    </div>
                    <div id="console-container">
                        <div class="form-control search-input" id="console"/>
                    </div>
                    <div class="app-card-footer p-4 mt-auto">  
                        <button class="btn app-btn-secondary" id="connect" onclick="connect();">Connect</button>
                        <button class="btn app-btn-secondary" id="disconnect" onclick="disconnect();">Disconnect</button>   
                    </div>
                </div> 

            </div><!--//row-->
        </div><!--//container-fluid-->
    </div>
    <!--//app-content--> 
</body>

<script>
    Ext.onReady(function () {
        Ext.QuickTips.init();
        Ext.MessageBox.minWidth = 400;
        Ext.inPageSearch = function () {

            document.querySelectorAll("[id='box-show-remove-m2']").forEach(elBoxShow => {
                if (document.getElementById(elBoxShow.id).style.display == "none")
                    document.getElementById(elBoxShow.id).style.display = "block";
                else
                    document.getElementById(elBoxShow.id).style.display = "none";

                elBoxShow.querySelectorAll("[class='btn-close']").forEach(elBtnClose => {
                    elBtnClose.addEventListener("click", function (obj) {
                        document.getElementById(elBoxShow.id).style.display = "none";
                    });
                });
            });
        };
        Ext.newPr = function () {
            new Ext.Window({
                id: 'proProcesID',
                height: Ext.getBody().getViewSize().height,
                width: Ext.getBody().getViewSize().width, //80%
                modal: false,
                plain: true,
                layout: "fit",
                maximizable: false,
                collapsible: true,
                closable: true,
                frame: true,
                listeners: {
                    close: function (win) {
                        return false;
                    },
                    beforeclose: function (win) { },
                    afterrender: function (win) {

                        Ext.getCmp("proProcesID").update('<iframe src="../sp/<?= $cfg['file'] ?>.php?" frameborder="0" width="100%" height="100%"></iframe>');
                    }
                }
            });
            Ext.getCmp('proProcesID').show();
        };

        Ext.resultContract = function () {
            new Ext.Window({
                id: 'proProcesID',
                height: Ext.getBody().getViewSize().height,
                width: Ext.getBody().getViewSize().width - 30, //80%
                modal: true,
                plain: true,
                layout: "fit",
//                maximizable: true,
//                collapsible: true,
                closable: true,
                frame: true,
                listeners: {
                    close: function (win) {
                        return false;
                    },
                    beforeclose: function (win) { },
                    afterrender: function (win) {
                        win.maximize(); // Maximizes the window after rendering
                        Ext.getCmp("proProcesID").update('<iframe src="../sp/contractGroup.php?" frameborder="0" width="100%" height="100%"></iframe>');
                    }
                }
            });
            Ext.getCmp('proProcesID').show();
        };

        Ext.newPrStatus = function () {
            console.log(Ext.get('textSearchID'));
            var txtS = Ext.get('textSearchID').dom.value;
            new Ext.Window({
                id: 'proProcesStatusID',
                height: Ext.getBody().getViewSize().height,
                width: Ext.getBody().getViewSize().width - 20, //80%
                modal: true,
                plain: true,
                layout: "fit",
                maximizable: true,
                collapsible: true,
                closable: true,
                frame: true,
                listeners: {
                    close: function (win) {
                        return false;
                    },
                    beforeclose: function (win) { },
                    afterrender: function (win) {

                        Ext.getCmp("proProcesStatusID").update('<iframe src="../sp/dashBoardStatus.php?textSearchID=' + txtS + '" frameborder="0" width="100%" height="100%"></iframe>');
                    }
                }
            });
            Ext.getCmp('proProcesStatusID').show();
        };


        Ext.getBody().on("contextmenu", function (n) {
            menu = new Ext.menu.Menu({
                items: [{
                        icon: "../images/icons/report_magnify.png",
                        text: 'ค้นหา ctl+f',
                        handler: function () {
                            Ext.EventObject.stopEvent();
                            Ext.inPageSearch();
                        }
                    }, {
                        icon: "../images/icons/report_magnify.png",
                        text: 'คำร้องขอซื้อ/จ้าง',
                        handler: function () {
                            Ext.EventObject.stopEvent();
                            Ext.newPr();
                        }
                    }]});
            Ext.EventObject.stopEvent();
            menu.showAt(Ext.EventObject.getXY());
        });
        Ext.arr = Ext.apply({row1: []});
        var user = '<?= $ss_username ?>';
        var user_id = <?= $ss_user_id ?>;
        var emp_id = <?= $ss_emp_id ?>;
        var cost_id = <?= $ss_cost_id ?>;
        Ext.doMain = "<?= DOMAIN['en']; ?>";
        Ext.URL_LOGIN = "<?= URL_LOGIN; ?>";
<?= getSessAapp(); ?>
        var view = 1;
        var Chat = {};
        var user = '<?= $ss_username ?>';
        var user_id = <?= $ss_user_id ?>;
        var emp_id = <?= $ss_emp_id ?>;
        var cost_id = <?= $ss_cost_id ?>;
        var user = '<?= $ss_username ?>';
        var user_id = <?= $ss_user_id ?>;
        var emp_id = <?= $ss_emp_id ?>;
        var cost_id = <?= $ss_cost_id ?>;
        var home = '<?php basename($escaped_url); ?>';
        var msg = '{"sessId":"","user_id":' + user_id + ',"sp_emp_id":' + emp_id + ',"cost_id":' + cost_id + ',"view":' + view + ',"typemsg":"connect","msg":"","user_name":"' + user + '","datetime":"","useronline":0}';


        Chat.socket = null;
        Chat.connect = (function (host) {
            if ('WebSocket' in window) {
                Chat.socket = new WebSocket(host);
            } else if ('MozWebSocket' in window) {
                Chat.socket = new MozWebSocket(host);
            } else {
                Consolex.log('Error: WebSocket is not supported by this browser.');
                return;
            }

            Chat.socket.onopen = function (event) {
                if (Ext.isEmpty(Ext.session)) {
                    alert('Run on Frame Session');
                    return false;
                }

                Ext.msgTxt = Ext.apply(Ext.util.JSON.decode(msg), {msgType: 0, session_page_id: null});
                Ext.msg = Ext.apply(Ext.msgTxt, Ext.session);
                Chat.socket.send(Ext.util.JSON.encode(Ext.msg));
            };
            Chat.socket.onclose = function () {
                document.getElementById('chat').onkeydown = null;
                Consolex.log('Info: WebSocket closed.');
                Ext.Msg.alert("แจ้งเตือนจากระบบ", "Socket Close ", function (form, action) {
                    top.frames.location.reload(false);
                });
            };
            Chat.socket.onmessage = function (message) {
                const jsonTxt = message.data;
                const obj = Ext.util.JSON.decode(jsonTxt);
                if (obj.msgType === 3 || obj.msgType === 2 || obj.msgType === 4 || obj.msgType === 5) { //chat แจ้งเตือน 
                    Ext.get('box-show-remove-m1').dom.style['display'] = 'block';
                    Ext.get('messagesID').dom.innerHTML += "<p class='message sent'>" + obj.msg + "</p>";
                    Ext.Msg.alert("แจ้งเตือนทั้งหมดจากแอดมิน", obj.msg, function (form, action) { });
                } else if (obj.msgType === 7 && user_id == 1) { // แจ้งเตือน   && user_id!=1

                    Ext.Msg.alert("แจ้งเตือนจากระบบ", "Socket Close ,session_page_id " + obj.session_page_id, function (form, action) {
                        console.log(obj);
                    });
                }
                Consolex.log(Ext.util.JSON.encode(obj));
            };
        });
        Chat.initialize = function () {
            if (window.location.protocol == 'http:') {
                Chat.connect('ws://' + window.location.host + '/procure/websocket/push');
            } else {
                Chat.connect('wss://' + window.location.host + '/procure/websocket/push');
            }
        };
        Chat.sendMessage = (function () {
            var message = document.getElementById('chat').value;
            Ext.msg.msg = message;
            if (message != '') {
                console.log(Ext.util.JSON.encode(Ext.msg));
                Chat.socket.send(Ext.util.JSON.encode(Ext.msg));
                document.getElementById('chat').value = '';
            }
        });


        var Consolex = {};
        Consolex.log = (function (message) {

            var console = document.getElementById('console');
            var p = document.createElement('p');
            p.style.wordWrap = 'break-word';
            p.innerHTML = message;
            console.appendChild(p);
            while (console.childNodes.length > 25) {
                console.removeChild(console.firstChild);
            }
            Consolex.scrollTop = console.scrollHeight;
        });
//        Chat.initialize();




        function disconnect() {
            Chat.socket.close();
            Chat.socket = null;
        }
        function connect() {
            Chat.initialize();
        }

        document.getElementById('connect').onclick = function (e) {
            connect();
        };
        document.getElementById('disconnect').onclick = function (e) {
            disconnect();
        };
        document.getElementById('chat').onkeyup = function (e) {
            if (e.keyCode == 13) {
                Ext.msg.msgType = 3;
                Chat.sendMessage();
                return true;
            }
        };
        document.getElementById('textSearchID').onkeyup = function (e) {

            if (e.key == " " || e.code == "Space" || e.keyCode == 32) {
                //your code 
                console.log(this.value);
            } else if (e.keyCode == 13) {
                //your code 
                Ext.msg.msgType = 3;
                Chat.sendMessage();
            }
            return false;
        };

        window.onkeydown = function (e) {
            if (e.keyCode == 70 && e.ctrlKey) {
                e.preventDefault();
                Ext.inPageSearch();
            }
        };
        //1
        document.getElementById('group1').onclick = function (e) {
//            Ext.arr.row1.push(this); 
            Ext.get('group1').dom.style['display'] = 'none';
            Ext.get('group11').dom.style['display'] = 'block';
//            Ext.get('group11').dom.select();

        };
        document.getElementById('buCloseGroup11').onclick = function (e) {
            Ext.get('group1').dom.style['display'] = 'block';
            Ext.get('group11').dom.style['display'] = 'none';
//            Ext.get('group1').dom.select();

        };
        //2
        document.getElementById('group2').onclick = function (e) {
//            Ext.arr.row1.push(this);
            Ext.resultContract();
//            Ext.get('group2').dom.style['display'] = 'none';
//            Ext.get('group12').dom.style['display'] = 'block';
//            Ext.get('group12').dom.select();

        };
        document.getElementById('buCloseGroup12').onclick = function (e) {

            Ext.get('group2').dom.style['display'] = 'block';
            Ext.get('group12').dom.style['display'] = 'none';
//            Ext.get('group2').dom.select();

        };
        //2
        document.getElementById('group3').onclick = function (e) {
//            Ext.arr.row1.push(this); 
//            Ext.get('group3').dom.style['display'] = 'none';
//            Ext.get('group13').dom.style['display'] = 'block';
//            Ext.get('group13').dom.select();

        };
        document.getElementById('buCloseGroup13').onclick = function (e) {

            Ext.get('group3').dom.style['display'] = 'block';
            Ext.get('group13').dom.style['display'] = 'none';
            Ext.get('group3').dom.focus();
        };
        //2
        document.getElementById('group4').onclick = function (e) {
//            Ext.arr.row1.push(this); 
//            Ext.get('group4').dom.style['display'] = 'none';
//            Ext.get('group14').dom.style['display'] = 'block';
//            Ext.get('buCloseGroup14').dom.select();

        };
        document.getElementById('buCloseGroup14').onclick = function (e) {

            Ext.get('group4').dom.style['display'] = 'block';
            Ext.get('group14').dom.style['display'] = 'none';
//            Ext.get('group4').dom.select();

        };
        Ext.get('viewstatusID').dom.onclick = function (e) {

//                Ext.Msg.alert("แจ้งเตือนจากระบบ", "View Status", function (form, action) {  }); 
            Ext.newPrStatus();
        };
        //
        window.addEventListener('cors_event', function (event) {
            if (event.data.event_id === 'my_cors_message') {
                console.log(event.data.data);
            }
        });
        var ds = new Ext.data.Store({
        proxy: new Ext.data.ScriptTagProxy({
            url: 'http://extjs.com/forum/topics-remote.php'
        }),
        reader: new Ext.data.JsonReader({
            root: 'topics',
            totalProperty: 'totalCount',
            id: 'post_id'
        }, [
            {name: 'title', mapping: 'topic_title'},
            {name: 'topicId', mapping: 'topic_id'},
            {name: 'author', mapping: 'author'},
            {name: 'lastPost', mapping: 'post_time', type: 'date', dateFormat: 'timestamp'},
            {name: 'excerpt', mapping: 'post_text'}
        ])
    });

    // Custom rendering Template
    var resultTpl = new Ext.XTemplate(
        '<tpl for="."><div class="search-item">',
            '<h3><span>{lastPost:date("M j, Y")}<br />by {author}</span>{title}</h3>',
            '{excerpt}',
        '</div></tpl>'
    );
    
    var search = new Ext.form.ComboBox({
        store: ds,
        displayField:'title',
        typeAhead: false,
        loadingText: 'Searching...',
        width: 570,
        pageSize:10,
        hideTrigger:true,
        tpl: resultTpl,
        applyTo: 'search',
        itemSelector: 'div.search-item',
        onSelect: function(record){ // override default onSelect to do redirect
            window.location =
                String.format('http://extjs.com/forum/showthread.php?t={0}&p={1}', record.data.topicId, record.id);
        }
    });
    });
</script>
</html> 

