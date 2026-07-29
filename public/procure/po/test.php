 
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title><?php echo COMPANY_NAME ; ?></title>
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


    </head>
    <body>

        <script type="text/javascript">
            /*!
 * Ext JS Library 3.4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */
Ext.chart.Chart.CHART_URL = '../ext-3.4.0/resources/charts.swf'; 
Ext.onReady(function(){
    var store = new Ext.data.JsonStore({
        fields: ['season', 'total'],
        data: [{
            season: 'Summer',
            total: 150
        },{
            season: 'Fall',
            total: 245
        },{
            season: 'Winter',
            total: 117
        },{
            season: 'Spring',
            total: 184
        }]
    });

    new Ext.Panel({
        width: 400,
        height: 400,
        title: 'Pie Chart with Legend - Favorite Season',
        renderTo: 'container',
        items: {
            store: store,
            xtype: 'piechart',
            dataField: 'total',
            categoryField: 'season',
            //extra styles get applied to the chart defaults
            extraStyle:
                              {
                                  legend :
                                      {
                                          display : 'bottom' ,
                                          padding : 5 ,
                                          font :
                                              {
                                                  family : 'Tahoma' ,
                                                  size : 13
                                              }
                                      }
                              }
                      }
                  } ) ;
              } ) ;
        </script>
        <div id="container"></div>
    </body>
</html>