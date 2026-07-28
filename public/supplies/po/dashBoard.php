<?php
include("../conf/config.php") ;
include("conf/configDc.php") ;
require_once(__DIR__ . '/../console/src/PhpConsole/__autoload.php') ;
$handler = PhpConsole\Handler::getInstance () ;
$handler -> start () ;
$handler -> getConnector () -> setSourcesBasePath ( $_SERVER[ 'DOCUMENT_ROOT' ] ) ;

$handler -> debug ( 'Debug message in current page' ) ;



if ( ! isset ( $_SESSION[ 'user_id' ] ) ) {
    echo "<script>window.location.href =\"../access/signin.php\"</script>" ;
    exit ;
}
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title><?php echo COMPANY_NAME ; ?></title>

        <!-- System ERP :: Src js  -->
        <?php include("../lib/loadJs.php") ; ?>
        <?php include("../lib/loadCss.php") ; ?>
        <!-- System ERP :: Permission -->
        <script type="text/javascript" src="../lib/right/GrantPermission.php?_dc=<?php echo rand ( 0 , 100000 ) ; ?>&f=<?php echo $_SERVER[ "PHP_SELF" ] ; ?>"></script>
        <!-- System ERP :: -->
        <!-- CSS Files -->
        <link href="../light-bootstrap-dashboard-master/assets/css/bootstrap.min.css" rel="stylesheet" />
        <link href="../light-bootstrap-dashboard-master/assets/css/light-bootstrap-dashboard.css?v=2.0.0 " rel="stylesheet" />
        <!-- CSS Just for demo purpose, don't include it in your project -->
        <link href="../light-bootstrap-dashboard-master/assets/css/demo.css" rel="stylesheet" />
        <style>
            body .main-views{
                padding-left:10%;
            }
            body .sub-views{
                padding-left:800px;
            }
            div.col-11 .col-sm-4 .alert .alert-primary .alert-with-icon{

            }
        </style>
                <!-- Ext includes -->
        <link rel="stylesheet" type="text/css" href="../ext-3.4.0/resources/css/ext-all.css" />
        <script type="text/javascript" src="../ext-3.4.0/adapter/ext/ext-base-debug.js"></script>
        <script type="text/javascript" src="../ext-3.4.0/ext-all-debug.js"></script>

        <!-- Calendar-specific includes -->
        <link rel="stylesheet" type="text/css" href="../ext-3.4.0/examples/calendar/resources/css/calendar.css" />
        <script type="text/javascript" src="../ext-3.4.0/examples/calendar/src/Ext.calendar.js"></script>
        <script type="text/javascript" src="../ext-3.4.0/examples/calendar/src/templates/DayHeaderTemplate.js"></script>
        <script type="text/javascript" src="../ext-3.4.0/examples/calendar/src/templates/DayBodyTemplate.js"></script>
        <script type="text/javascript" src="../ext-3.4.0/examples/calendar/src/templates/DayViewTemplate.js"></script>
        <script type="text/javascript" src="../ext-3.4.0/examples/calendar/src/templates/BoxLayoutTemplate.js"></script>
        <script type="text/javascript" src="../ext-3.4.0/examples/calendar/src/templates/MonthViewTemplate.js"></script>
        <script type="text/javascript" src="../ext-3.4.0/examples/calendar/src/dd/CalendarScrollManager.js"></script>
        <script type="text/javascript" src="../ext-3.4.0/examples/calendar/src/dd/StatusProxy.js"></script>
        <script type="text/javascript" src="../ext-3.4.0/examples/calendar/src/dd/CalendarDD.js"></script>
        <script type="text/javascript" src="../ext-3.4.0/examples/calendar/src/dd/DayViewDD.js"></script>
        <script type="text/javascript" src="../ext-3.4.0/examples/calendar/src/EventRecord.js"></script>
        <script type="text/javascript" src="../ext-3.4.0/examples/calendar/src/views/MonthDayDetailView.js"></script>
        <script type="text/javascript" src="../ext-3.4.0/examples/calendar/src/widgets/CalendarPicker.js"></script>
        <script type="text/javascript" src="../ext-3.4.0/examples/calendar/src/WeekEventRenderer.js"></script>
        <script type="text/javascript" src="../ext-3.4.0/examples/calendar/src/views/CalendarView.js"></script>
        <script type="text/javascript" src="../ext-3.4.0/examples/calendar/src/views/MonthView.js"></script>
        <script type="text/javascript" src="../ext-3.4.0/examples/calendar/src/views/DayHeaderView.js"></script>
        <script type="text/javascript" src="../ext-3.4.0/examples/calendar/src/views/DayBodyView.js"></script>
        <script type="text/javascript" src="../ext-3.4.0/examples/calendar/src/views/DayView.js"></script>
        <script type="text/javascript" src="../ext-3.4.0/examples/calendar/src/views/WeekView.js"></script>
        <script type="text/javascript" src="../ext-3.4.0/examples/calendar/src/widgets/DateRangeField.js"></script>
        <script type="text/javascript" src="../ext-3.4.0/examples/calendar/src/widgets/ReminderField.js"></script>
        <script type="text/javascript" src="../ext-3.4.0/examples/calendar/src/EventEditForm.js"></script>
        <script type="text/javascript" src="../ext-3.4.0/examples/calendar/src/EventEditWindow.js"></script>
        <script type="text/javascript" src="../ext-3.4.0/examples/calendar/src/CalendarPanel.js"></script>

        <!-- App -->
        <link rel="stylesheet" type="text/css" href="../ext-3.4.0/examples/calendar/resources/css/examples.css" />
        <script type="text/javascript" src="../ext-3.4.0/examples/calendar/app/calendar-list.js"></script>
        <script type="text/javascript" src="../ext-3.4.0/examples/calendar/app/event-list.js"></script>
        <script type="text/javascript" src="../ext-3.4.0/examples/calendar/app/po-app.js"></script>
    </head>
    <body>
        <div style="display:none;">
            <div id="app-header-content">
                <div id="app-logo">
                    <div class="logo-top">&nbsp;</div>
                    <div id="logo-body">&nbsp;</div>
                    <div class="logo-bottom">&nbsp;</div>
                </div>
                <h1>Ext JS Calendar</h1>
                <span id="app-msg" class="x-hidden"></span>
            </div>
        </div>
        <div class="main-views">
            <!-- End Navbar -->
            <div class="content">
                <div class="row">
                    <div class="col-md-6">
                        <div class="card  card-tasks">
                            <div class="card-header ">
                                <h4 class="card-title">สถานะการดำเนินงาน</h4>
                                <p class="card-category">Backend development</p>
                                <p class="card-category">Backend development</p>
                                <p class="card-category">Backend development</p>
                            </div>
                            <div class="card-body ">
                                <div class="table-full-width">
                                    <table class="table">


                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div class="card-footer ">
                                <hr>
                                    <div class="stats">
                                        <i class="now-ui-icons loader_refresh spin"></i> Updated 3 minutes ago
                                    </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card ">
                            <div class="card-header ">
                                <h4 class="card-title">2017 Sales</h4>
                                <p class="card-category">All products including Taxes</p>
                            </div>
                            <div class="card-body ">
                                <div id="chartActivity" class="ct-chart"></div>
                            </div>
                            <div class="card-footer ">
                                <div class="legend">
                                    <i class="fa fa-circle text-info"></i> Tesla Model S
                                    <i class="fa fa-circle text-danger"></i> BMW 5 Series
                                </div>
                                <hr>
                                    <div class="stats">
                                        <i class="fa fa-check"></i> Data information certified
                                    </div>
                            </div>
                        </div>
                    </div>

                </div>
                <div class="row">
                    <div class="col-md-4">
                        <div class="card ">
                            <div class="card-header ">
                                <h4 class="card-title">สถานะต่างๆ</h4>
                                <p class="card-category">อัพเดทสถานะการทำงานของการดำงาน</p>
                            </div>
                            <div class="card-body ">
                                <div id="chartPreferences" class="ct-chart ct-perfect-fourth"></div>
                                <div class="legend">
                                    <i class="fa fa-circle text-info"></i> Open
                                    <i class="fa fa-circle text-danger"></i> Bounce
                                    <i class="fa fa-circle text-warning"></i> Unsubscribe
                                </div>
                                <hr>
                                    <div class="stats">
                                        <i class="fa fa-clock-o"></i> Campaign sent 2 days ago
                                    </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-8">
                        <div class="card ">
                            <div class="card-header ">
                                <h4 class="card-title">Users Behavior</h4>
                                <p class="card-category">24 Hours performance</p>
                            </div>
                            <div class="card-body ">
                                <div id="chartHours" class="ct-chart"></div>
                            </div>
                            <div class="card-footer ">
                                <div class="legend">
                                    <i class="fa fa-circle text-info"></i> Open
                                    <i class="fa fa-circle text-danger"></i> Click
                                    <i class="fa fa-circle text-warning"></i> Click Second Time
                                </div>
                                <hr>
                                    <div class="stats">
                                        <i class="fa fa-history"></i> Updated 3 minutes ago
                                    </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>



    </body>
    <!--   Core JS Files   -->
    <script src="../light-bootstrap-dashboard-master/assets/js/core/jquery.3.2.1.min.js" type="text/javascript"></script>
    <script src="../light-bootstrap-dashboard-master/assets/js/core/popper.min.js" type="text/javascript"></script>
    <script src="../light-bootstrap-dashboard-master/assets/js/core/bootstrap.min.js" type="text/javascript"></script>

    <!--  Google Maps Plugin    -->
    <script src="../light-bootstrap-dashboard-master/assets/js/plugins/chartist.min.js"></script>

    <script src="../light-bootstrap-dashboard-master/assets/js/plugins/bootstrap-notify.js"></script>
    <!-- Control Center for Light Bootstrap Dashboard: scripts for the example pages etc -->
    <script src="../light-bootstrap-dashboard-master/assets/js/light-bootstrap-dashboard.js?v=2.0.0 " type="text/javascript"></script>
    <!-- Light Bootstrap Dashboard DEMO methods, don't include it in your project
    <!--  Dash board    -->
    <script> //jquery

          $ ( document ).ready ( function () {
              type = [ 'primary' , 'info' , 'success' , 'warning' , 'danger' ] ;
              demo = {
                  initPickColor : function () {
                      $ ( '.pick-class-label' ).click ( function () {
                          var new_class = $ ( this ).attr ( 'new-class' ) ;
                          var old_class = $ ( '#display-buttons' ).attr ( 'data-class' ) ;

                          var display_div = $ ( '#display-buttons' ) ;
                         var container =   $ ( 'data-notify[container]' );
                         console.log(container);
                          if ( display_div.length ) {
                              var display_buttons = display_div.find ( '.btn' ) ;
                              display_buttons.removeClass ( old_class ) ;

                              display_buttons.addClass ( new_class ) ;
                              display_div.attr ( 'data-class' , new_class ) ;
                          }

                      } ) ;
                  } ,
                  initDocumentationCharts : function () {
                      /* ----------==========     Daily Sales Chart initialization For Documentation    ==========---------- */

                      dataDailySalesChart = {
                          labels : [ 'M' , 'T' , 'W' , 'T' , 'F' , 'S' , 'S' ] ,
                          series : [
                              [ 12 , 17 , 7 , 17 , 23 , 18 , 38 ]
                          ]
                      } ;

                      optionsDailySalesChart = {
                          lineSmooth : Chartist.Interpolation.cardinal ( {
                              tension : 0
                          } ) ,
                          low : 0 ,
                          high : 50 , // creative tim: we recommend you to set the high sa the biggest value + something for a better look
                          chartPadding : {
                              top : 0 ,
                              right : 0 ,
                              bottom : 0 ,
                              left : 0
                          } ,
                      }

                      var dailySalesChart = new Chartist.Line ( '#dailySalesChart' , dataDailySalesChart , optionsDailySalesChart ) ;

                      // lbd.startAnimationForLineChart(dailySalesChart);
                  } ,
                  initDashboardPageCharts : function () {

                      var dataPreferences = {
                          series : [
                              [ 25 , 30 , 20 , 25 ]
                          ]
                      } ;

                      var optionsPreferences = {
                          donut : true ,
                          donutWidth : 40 ,
                          startAngle : 0 ,
                          total : 100 ,
                          showLabel : false ,
                          axisX : {
                              showGrid : false
                          }
                      } ;

                      Chartist.Pie ( '#chartPreferences' , dataPreferences , optionsPreferences ) ;

                      Chartist.Pie ( '#chartPreferences' , {
                          labels : [ '53%' , '36%' , '11%' ] ,
                          series : [ 53 , 36 , 11 ]
                      } ) ;
                      var dataSales = {
                          labels : [ '9:00AM' , '12:00AM' , '3:00PM' , '6:00PM' , '9:00PM' , '12:00PM' , '3:00AM' , '6:00AM' ] ,
                          series : [
                              [ 287 , 385 , 490 , 492 , 554 , 586 , 698 , 695 , 752 , 788 , 846 , 944 ] ,
                              [ 67 , 152 , 143 , 240 , 287 , 335 , 435 , 437 , 539 , 542 , 544 , 647 ] ,
                              [ 23 , 113 , 67 , 108 , 190 , 239 , 307 , 308 , 439 , 410 , 410 , 509 ]
                          ]
                      } ;

                      var optionsSales = {
                          lineSmooth : false ,
                          low : 0 ,
                          high : 800 ,
                          showArea : true ,
                          height : "245px" ,
                          axisX : {
                              showGrid : false ,
                          } ,
                          lineSmooth : Chartist.Interpolation.simple ( {
                              divisor : 3
                          } ) ,
                          showLine : false ,
                          showPoint : false ,
                          fullWidth : false
                      } ;

                      var responsiveSales = [
                          [ 'screen and (max-width: 640px)' , {
                                  axisX : {
                                      labelInterpolationFnc : function ( value ) {
                                          return value[0] ;
                                      }
                                  }
                              } ]
                      ] ;

                      var chartHours = Chartist.Line ( '#chartHours' , dataSales , optionsSales , responsiveSales ) ;

                      // lbd.startAnimationForLineChart(chartHours);

                      var data = {
                          labels : [ 'Jan' , 'Feb' , 'Mar' , 'Apr' , 'Mai' , 'Jun' , 'Jul' , 'Aug' , 'Sep' , 'Oct' , 'Nov' , 'Dec' ] ,
                          series : [
                              [ 542 , 443 , 320 , 780 , 553 , 453 , 326 , 434 , 568 , 610 , 756 , 895 ] ,
                              [ 412 , 243 , 280 , 580 , 453 , 353 , 300 , 364 , 368 , 410 , 636 , 695 ]
                          ]
                      } ;

                      var options = {
                          seriesBarDistance : 10 ,
                          axisX : {
                              showGrid : false
                          } ,
                          height : "245px"
                      } ;
                      var responsiveOptions = [
                          [ 'screen and (max-width: 640px)' , {
                                  seriesBarDistance : 5 ,
                                  axisX : {
                                      labelInterpolationFnc : function ( value ) {
                                          return value[0] ;
                                      }
                                  }
                              } ]
                      ] ;

                      var chartActivity = Chartist.Bar ( '#chartActivity' , data , options , responsiveOptions ) ;

                  } ,
                  showNotification : function ( from , align ) {
//

                      var notify = $.notify ( {
                          icon : "nc-icon nc-app" ,
                          message : "ระบบสนับสนุนการบริหารงานเบิกจ่ายเงิน <b> สถานะการดำเนินงานต่างควบคู่กับการทำเอกสาร</b> "

                      } , {
                          type : type[0] , // color = Math.floor ( ( Math.random () * 4 ) + 1 ) ;
                          timer : 16000 ,
                          placement : {
                              from : from , align : align
                          }
                      } ) ;

                      console.log ( notify ) ;
                  }
              } ;
              demo.initDashboardPageCharts () ;
              demo.showNotification () ;
//update innerHtml ToID
//              var updateLogoDt = function () {
//                  document.getElementById ( 'navbar-date-dashboardID' ).innerHTML = new Date ().getDate () ;
//              } ;
//              updateLogoDt () ;
//              setInterval ( updateLogoDt , 1000 ) ;
          } ) ;

    </script>

