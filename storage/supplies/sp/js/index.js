  /*!
   * Ext JS Library 3.3.1
   * eakibane
   */

  Ext.onReady ( function ( ) {
      var items = [ ] ;
      Ext.QuickTips.init ( ) ;
      //=============================================================
      // Toolbar / Menu
      //=============================================================
      var menu = new Ext.menu.Menu ( {
          items : [ {
                  text : 'เปิดดูเต็มจอ' ,
                  handler : function ( ) {
                      window.open ( '#' , 'Monitoring' , 'fullscreen="yes"' ) ;
                  }
              } , {
                  text : 'Check 1' ,
                  checked : true
              } , {
                  text : 'Check 2' ,
                  checked : false
              } , '-' , {
                  text : 'Option 1' ,
                  checked : true ,
                  group : 'opts'
              } , {
                  text : 'Option 2' ,
                  checked : false ,
                  group : 'opts'
              } , '-' , {
                  text : 'Sub-items' ,
                  menu : new Ext.menu.Menu ( {
                      items : [ { text : 'Item 1' } , { text : 'Item 2' } ]
                  } )
              } ]
      } ) ;
      items.push ( {
          xtype : 'panel' ,
          width : 450 ,
          height : 200 ,
//          title : 'Basic Panel With Toolbars' ,
//SET X Y
          x : 30 , y : 30 ,
//          cls : 'centered' ,
          tbar : [ 'หน้าจอระบบแจ้งเตือน' , ' ' , '-' , {
                  text : 'ตั้งค่า' ,
                  id : 'menu-btn' ,
                  menu : menu
              } ] ,
          items : [ {
                  xtype : 'displayfield' ,
                  id : 'clock' ,
                  style : "font-size:48px;font-weight:bold;padding:10px 0px 0 15px"
              } , {
                  xtype : 'displayfield' ,
                  value : 'ยังไม่มีรายการเปลี่ยนแปลง' ,
                  id : 'updateCount' ,
                  style : "font-size:28px; color:blue; font-weight:bold;padding:10px 0px 0 15px" } ] ,
          bbar : [ {
                  text : 'Bottom Bar'
              } ]
      } ) ;
      //=============================================================
      // Grid
      //=============================================================
      var myData = [
          [ '3m Co' , 71.72 , 0.02 , 0.03 , '9/1 12:00am' ] ,
          [ 'Alcoa Inc' , 29.01 , 0.42 , 1.47 , '9/1 12:00am' ] ,
          [ 'Altria Group Inc' , 83.81 , 0.28 , 0.34 , '9/1 12:00am' ] ,
          [ 'American Express Company' , 52.55 , 0.01 , 0.02 , '9/1 12:00am' ] ,
          [ 'American International Group, Inc.' , 64.13 , 0.31 , 0.49 , '9/1 12:00am' ] ,
          [ 'AT&T Inc.' , 31.61 , - 0.48 , - 1.54 , '9/1 12:00am' ] ,
          [ 'Boeing Co.' , 75.43 , 0.53 , 0.71 , '9/1 12:00am' ] ,
          [ 'Caterpillar Inc.' , 67.27 , 0.92 , 1.39 , '9/1 12:00am' ] ,
          [ 'Citigroup, Inc.' , 49.37 , 0.02 , 0.04 , '9/1 12:00am' ] ,
          [ 'E.I. du Pont de Nemours and Company' , 40.48 , 0.51 , 1.28 , '9/1 12:00am' ]
      ] ;
      var store = new Ext.data.SimpleStore ( {
          fields : [
              { name : 'company' } ,
              { name : 'price' , type : 'float' } ,
              { name : 'change' , type : 'float' } ,
              { name : 'pctChange' , type : 'float' } ,
              { name : 'lastChange' , type : 'date' , dateFormat : 'n/j h:ia' }
          ] ,
          sortInfo : {
              field : 'company' , direction : 'ASC'
          }
      } ) ;
      var pagingBar = new Ext.PagingToolbar ( {
          pageSize : 5 ,
          store : store ,
          displayInfo : true ,
          displayMsg : 'Displaying topics {0} - {1} of {2}'
      } ) ;
      store.loadData ( myData ) ;
      //=============================================================
      // ListView
      //=============================================================
      Ext.store = new Ext.data.JsonStore ( {
          autoDestroy : false ,
          autoLoad : true ,
          url : "api/List_poEmp.php" ,
          baseParams : { type : "po_emp" , i_read : user_right_read } , // Permission i_read
          root : "data" ,
          idProperty : "id" ,
          totalProperty : "totalCount" ,
          fields : [ { name : "no" } , { name : "id" } , { name : "i_use" } , { name : "c_name" } , { name : "c_comment" } , { name : "i_enable" } , { name : "dc_user_update_id" } , { name : "dc_user_update_cost_id" } , { name : "d_update" } ] ,
          sortInfo : {
              field : 'd_update' , direction : 'ASC'
          }
      } ) ;
      Ext.pagingBar = new Ext.PagingToolbar ( {
          pageSize : 20 ,
          store : Ext.store ,
          displayInfo : true ,
          displayMsg : "Displaying topics {0} - {1} of {2}"
      } ) ;
      items.push ( {
          id : 'gridID' ,
          xtype : 'grid' ,
          store : Ext.store ,
          columns : [
              new Ext.grid.RowNumberer ( {
                  header : "ที่" ,
                  width : 30 ,
                  renderer : function ( value , metaData , record , row , col , store , gridView ) {
                      return record.get ( "no" ) ;
                  }
              } ) ,
              {
                  id : "delete" ,
                  header : "-" ,
                  sortable : false ,
                  align : "center" ,
                  width : 100 ,
                  dataIndex : "id" ,
                  renderer : function ( value , metaData , record , row , col , store , gridView ) {
                      if ( record.get ( "i_use" ) == 1 ) {
                          return "<font color=green>มีการใช้งานในระบบ</font>" ;
                      }
                      else {
                          return "<button style='font-size:11px; cursor:pointer; color: red;'>ลบ</button>" ;
                      }
                  }
              } ,
              {
                  id : "c_name" ,
                  header : "ชื่อ" ,
                  sortable : false ,
                  align : "center" ,
                  dataIndex : "c_name" ,
                  renderer : function ( value , metaData , record , rowIndex , colIndex , store ) {
                      metaData.attr = "style='text-align: center;'" ;
                      return value ;
                  }
              } ,
              {
                  header : "สถานะใช้งาน" ,
                  sortable : true ,
                  align : "center" ,
                  dataIndex : "i_enable" ,
                  renderer : function ( value , metaData , record , rowIndex , colIndex , store ) {
                      if ( value == 1 ) {
                          return "<span style='color:green;'>ใช้งาน</span>" ;
                      }
                      else {
                          return "<span style='color:red;'>ไม่ใช้งานspan>" ;
                      }
                  }
              } ,
              { header : "ผู้ทำรายการล่าสุด" , sortable : true , dataIndex : "dc_user_update_id" } ,
              {
                  header : "วันที่ทำรายการล่าสุด" ,
                  sortable : true ,
                  align : "center" ,
                  dataIndex : "d_update" ,
                  renderer : function ( value , metaData , record , rowIndex , colIndex , store ) {
                      return value != "" ? shortThaiDate ( value ) : "" ;
                  }
              } ,
              { header : "หน่วยงานที่ทำรายการล่าสุด" , sortable : true , dataIndex : "dc_user_update_cost_id" } ,
              { width : 40 , dataIndex : "" }
          ] ,
          autoExpandColumn : "c_name" ,
          bbar : Ext.pagingBar ,
          stripeRows : true ,
          loadMask : true ,
          height : 520 ,
          width : 750 ,
          viewConfig : {
              getRowClass : function ( record , index , rowParams , ds ) {
                  return record.get ( 'no' ) == 10 ? 'background-color: #000' : '' ;
              }
          } ,
//SET X Y
          x : 550 , y : 30 ,
//          title : 'GridPanel' ,
          tbar : [ 'การเรียกข้อมูล' , ' ' , '-' ,
              {
                  xtype : 'button' ,
                  id : 'stID' ,
                  enableToggle : true , //หยุดดึงข้อมูล
                  pressed : true ,
                  text : 'หยุดดึงข้อมูล' ,
                  handler : function ( obj ) {
                      Ext.getCmp ( 'images-view' ).fn ( Ext.getCmp ( 'stID' ).pressed ) ;
                      obj.pressed === true ? this.setText ( 'หยุดดึงข้อมูล' ) : this.setText ( 'เริ่มดึงข้อมูล' ) ;
                  }
              }
              , '->' ,
              new Ext.form.TwinTriggerField ( {
                  xtype : 'twintriggerfield' ,
                  trigger1Class : 'x-form-clear-trigger' ,
                  trigger2Class : 'x-form-search-trigger' ,
                  onTrigger1Click : function ( ) {
                      alert ( 1 ) ;
                      Ext.getCmp ( "gridID" ).getSelectionModel ( ).selectRow ( 2 ) ;
                  } , onTrigger2Click : function ( ) {
                      alert ( 2 ) ;
                      Ext.getCmp ( "gridID" ).getSelectionModel ( ).selectRow ( 0 ) ;
                  }
              } )
          ]
      } ) ;
      //=============================================================
      // ListView
      //=============================================================
      var listView = new Ext.list.ListView ( {
          store : store ,
          multiSelect : true ,
          emptyText : 'No images to display' ,
          reserveScrollOffset : true ,
          columns : [
              { id : 'Company' , header : "ประเภทการแจ้งเตือน" , width : .5 , sortable : true , dataIndex : 'company' } ,
              { header : "ค่าเฉลี่ย" , width : .25 , sortable : true , tpl : '{price:usMoney}' , dataIndex : 'price' } ,
              { header : "ค่าเปลี่ยนแปลง" , width : .25 , sortable : true , dataIndex : 'change' }
          ]
      } ) ;
      items.push ( {
          xtype : 'panel' ,
          id : 'images-view' ,
          width : 450 ,
          height : 310 ,
//SET X Y
          x : 30 , y : 240 ,
          collapsible : false ,
          layout : 'fit' ,
          tbar : [ 'หน้าจอระบบแจ้งเตือน' , ' ' , '-' , { text : 'ประเภทการแจ้งเตือน' } ] , // <i>(0 items selected)</i>
          items : listView ,
          bbar : [ {
                  text : 'Bottom Bar'
              } ] ,
          listeners : {
              afterrender : function ( ) {
                  var store = Ext.getCmp ( 'gridID' ).getStore ( ) ; // your grid instance
                  var refreshTask = { // task which reloads the store each minute
                      run : function ( ) {
                          store.reload ( {
                              callback : function ( record , operation , success )
                              {
                                  if ( success )
                                  {
                                      Ext.getCmp ( "gridID" ).getSelectionModel ( ).selectRow ( 1 ) ;
                                  }
                              }
                          } ) ;
                      } ,
                      interval : 10 * 1000 // 1 Minute
                  } ;
                  var runner = new Ext.util.TaskRunner ( ) ;
                  this.fn = function ( i ) {
                      ! i ? runner.stop ( refreshTask ) : runner.start ( refreshTask ) ;
                  } ;
                  this.fn ( Ext.getCmp ( 'stID' ).pressed ) ;
              }
          } ,
      } ) ;
      //=============================================================
      // Render everything!
      //=============================================================
      new Ext.Viewport ( {
          layout : 'absolute' ,
          autoScroll : true ,
          items : items ,
          listeners : {
              afterrender : function ( ) {
//-----------------------------------------
                  var updateClock = function ( ) {
                      Ext.fly ( 'clock' ).update ( new Date ( ).format ( 'g:i:s A' ) ) ;
                  } ;
                  var task = {
                      run : updateClock ,
                      interval : 1000 //1 second
                  } ;
//-----------------------------------------
                  var runner = new Ext.util.TaskRunner ( ) ;
                  runner.start ( task ) ;
              }
          }
      } ) ;
  }
  ) ;