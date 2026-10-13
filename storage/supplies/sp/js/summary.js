  /*!
   * Ext JS Library 3.3.1
   * eakibane
   */
//  console.log('Debug::Summary');
  Ext.onReady ( function ( ) {
      var items = [ ] ;
      Ext.QuickTips.init ( ) ;
      localStorage.setItem ( "gridshow1" , localStorage.getItem ( "gridshow1" ) || { } ? 1 : 2 ) ;
//      console.log ( localStorage.getItem ( "gridshow1" ) ) ;
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
                  text : 'รายการแจ้งเตือน' ,
                  handler : function ( ) {
                      Ext.getCmp ( 'gridID' ).show () ;
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
                  text : 'ข้อมูลแจ้งเตือน' ,
                  menu : new Ext.menu.Menu ( {
                      items : [ { text : 'ข้อมูลประเภทแจ้งเตือน' } , { text : 'ข้อมูลรายการแจ้งเตือน' } ]
                  } )
              } ]
      } ) ;
      items.push ( {
          xtype : 'panel' ,
          width : 850 ,
          height : 500 ,
          reSize : true ,
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
                  value : '- รายการตรวจนับก่อนหมดหลักประกัน 2 รายการ' ,
                  id : 'warrantiesCountID' ,
                  style : "font-size:28px; color:blue; font-weight:bold;padding:10px 0px 0 15px"
              } , {
                  xtype : 'displayfield' ,
                  value : '- รายการปิดสัญญาและคืนหลักประกัน 1 รายการ' ,
                  id : 'clostContCountID' ,
                  style : "font-size:28px; color:red; font-weight:bold;padding:10px 0px 0 15px"
              } , {
                  xtype : 'displayfield' ,
                  value : '- ยังไม่มีรายการเปลี่ยนแปลง' ,
                  id : 'updateCount' ,
                  style : "font-size:28px; color:orange; font-weight:bold;padding:10px 0px 0 15px"
              } ] ,
          bbar : [ {
                  text : 'Bottom Bar' , handler : function () {
                      localStorage.setItem ( "gridshow1" , true ) ;
                  }
              } ]
      } ) ;
      //=============================================================
      // Grid
      //=============================================================

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
          height : 500 ,
          width : 750 ,
          viewConfig : {
              getRowClass : function ( record , index , rowParams , ds ) {
                  return record.get ( 'no' ) == 10 ? 'background-color: #000' : '' ;
              }
          } ,
//SET X Y
          x : 850 , y : 30 ,
//          title : 'GridPanel' ,
          tbar : [ 'การเรียกข้อมูล' , ' ' , '-' ,
              {
                  xtype : 'button' ,
                  id : 'buTID' ,
                  enableToggle : true , //หยุดดึงข้อมูล
                  pressed : false ,
//                  text : 'เริ่มดึงข้อมูล' ,
                  handler : function ( obj ) {
                      Ext.getCmp ( 'viewID' ).fn ( obj.pressed === true ? 1 : 2 ) ;
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
      // Render everything!
      //=============================================================
      new Ext.Viewport ( {
          layout : 'absolute' ,
          id : 'viewID' ,
          autoScroll : true ,
          items : items ,
          listeners : {
              afterrender : function ( ) {
//                  Ext.getCmp ( 'gridID' ).hide () ;
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
//-----------------------------------------
//-----------------------------------------
                  Ext.store = Ext.getCmp ( 'gridID' ).getStore ( ) ; // your grid instance
                  Ext.refreshTask = { // task which reloads the store each minute
                      run : function ( ) {
                          Ext.store.reload ( {
                              callback : function ( record , operation , success )
                              {
                                  if ( success )
                                  {
                                      Ext.getCmp ( "gridID" ).getSelectionModel ( ).selectRow ( 1 ) ;
                                  }
                              }
                          } ) ;
                      } ,
                      interval : 3 * 1000 // 1 Minute
                  } ;
//                  var runner = new Ext.util.TaskRunner ( ) ;

                  this.fn = function ( i ) {

                      if ( i === 1 ) {
                          Ext.getCmp ( 'buTID' ).setText ( 'เริ่มดึงข้อมูล' ) ;
                          runner.start ( Ext.refreshTask ) ;
                          localStorage.setItem ( "gridshow1" , 1 ) ;

                      }
                      else if ( i === 2 ) {
                          Ext.getCmp ( 'buTID' ).setText ( 'หยุดดึงข้อมูล' ) ;
                          runner.stop ( Ext.refreshTask ) ;
                          localStorage.setItem ( "gridshow1" , 2 ) ;

                      }
                      console.log ( ' ==== ' + i ) ;
                  } ;

                  this.fn ( localStorage.getItem ( "gridshow1" ) === 1 ? 1 : 2 ) ;
              } //End affter

          }
      } ) ;
  }
  ) ;