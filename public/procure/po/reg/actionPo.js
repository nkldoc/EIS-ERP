  /* global Ext, user_right_read, user_right_add, user_right_edit, user_right_delete, exit */
// @ts-ignore
  Ext.extend ( Ext.formSearch = function () {
      //interlizing
      var MenuButton = function () {
          //Menu
          var dateMenu = new Ext.menu.DateMenu ( {
              handler : function ( dp , date ) {
                  Ext.example.msg ( 'Date Selected' , 'You chose {0}.' , date.format ( 'M j, Y' ) ) ;
              }
          } ) ;
          var colorMenu = new Ext.menu.ColorMenu ( {
              handler : function ( cm , color ) {
                  Ext.example.msg ( 'Color Selected' , 'You chose {0}.' , color ) ;
              }
          } ) ;
          var combo = new Ext.form.ComboBox ( {
              store : new Ext.data.SimpleStore ( {
                  fields : [ "id" , "c_name" ] ,
                  data : [ [ 'c_name' , "ชื่อพนักงาน" ] , [ 'c_code' , "รหัสพนักงาน" ] ]
              } ) ,
              value : 'c_name' ,
              valueField : 'id' ,
              displayField : 'c_name' ,
              submitValue : true ,
              hiddenName : 'filter' ,
              mode : 'local' ,
              triggerAction : "all" ,
              typeAhead : true ,
              emptyText : 'Select a state...' ,
              selectOnFocus : true ,
              width : 135 ,
              getListParent : function () {
                  return this.el.up ( '.x-menu' ) ;
              } ,
              iconCls : 'no-icon'
          } ) ;
          //item menu
          var menu = new Ext.menu.Menu ( {
              id : 'mainMenu' ,
              style : {
                  overflow : 'visible'
              } ,
              items : [ combo , // A Field in a Menu
                  {
                      text : 'เลือก' ,
                      checked : true ,
                      // when checked has a boolean value, it is assumed to be a CheckItem
                      checkHandler : onLocationCheck
                  } ,
                  '-' ,
                  {
                      text : '<b class="menu-title">ข้อมูลหลักระบบการเบิกจ่าย</b>' , //<b class="menu-title"></b>
                      menu : {
                          items : [ // stick any markup in a menu
                              '<b class="menu-title">เลือกเมนู</b>' , {
                                  text : ' สถานะการดำเนินงานของใบเบิก' ,
                                  checked : false ,
                                  uri : 'DcPuStatus' ,
                                  group : 'theme' ,
                                  checkHandler : onLocationCheck

                              } , {
                                  text : ' ชื่อผู้ปฏิบัติงาน' ,
                                  checked : true ,
                                  uri : 'ActionPo' ,
                                  group : 'theme' ,
                                  checkHandler : onLocationCheck
                              } , {
                                  text : ' วันหยุดประจำปี' ,
                                  checked : false ,
                                  uri : 'dcHoliday' ,
                                  group : 'theme' ,
                                  checkHandler : onLocationCheck
                              } ]
                      }
                  } ,
                  '-' ,
                  { text : 'บันทึกระบบการเบิกจ่าย' , // <b class="menu-title"></b>
                      menu : {
                          items : [ 'เลือกเมนู' , {
                                  text : ' การนำเข้ามูลการเบิกจ่าย' ,
                                  checked : false ,
                                  uri : 'DcImpPo' ,
                                  group : 'theme' ,
                                  checkHandler : onLocationCheck
                              } , {
                                  text : ' การบันทึกข้อมูลการเบิกจ่าย' ,
                                  checked : false ,
                                  uri : 'RegPoList' ,
                                  group : 'theme' ,
                                  checkHandler : onLocationCheck
                              } , {
                                  text : ' บันทึกการดำเนินงานของการเบิกจ่าย' ,
                                  checked : false ,
                                  uri : 'actionPlant' ,
                                  group : 'theme' ,
                                  checkHandler : onLocationCheck
                              } ]
                      }
                  } ,
                  {
                      text : 'ปฏิทิน' ,
                      iconCls : 'calendar' ,
                      menu : dateMenu // <-- submenu by reference
                  } , {
                      text : 'Choose a Color' ,
                      menu : colorMenu // <-- submenu by reference
                  } ]
          } ) ;
          var tb = new Ext.Toolbar ( {
              text : ' รายการเมนู ' ,
              border : false ,
              icon : '../images/icons/text_list_bullets.png' ,
              iconCls : 'bmenu' ,
              // <-- icon
              menu : menu // assign menu by instance
          } ) ;
          tb.add ( {
              text : ' รายการเมนู ' ,
              icon : '../images/icons/text_list_bullets.png' ,
              iconCls : 'bmenu' ,
              // <-- icon
              border : false ,
              bodyStyle : 'padding:0px 0px 0px 0px !important;' ,
              menu : menu // assign menu by instance
          } ) ;
          menu.addSeparator () ;
          var item = menu.add ( {
              text : 'Dynamically added Item' ,
              uri : Ext.hasWindow

          } ) ;
          menu.add ( {
              text : 'Disabled Item' ,
              id : 'disableMe'
          } ) ;
          // disabled: true
          menu.items.get ( 'disableMe' ).disable () ;
          // scrollable menu
          item.on ( 'click' , onItemClick ) ;

          menu.add ( {
              text : 'สถานะการปฏิบัติงาน'
          } ).on ( 'click' , click = function () {
              var url = 'DcPuStatus' ;
              window.location = url + '.php' ;
          } ) ;

          tb.doLayout () ;

          return tb ;
          //Test
      } ;
      var cmbFilters = {
          xtype : 'combo' ,
          id : 'filter-ID' ,
          store : new Ext.data.SimpleStore ( {
              fields : [ "id" , "c_name" ] ,
              data : [ [ 'c_name' , "สถานะของการดำเนินงาน" ] , [ 'c_code' , "เลขที่ใบเบิก" ] ]
          } ) ,
          value : 'c_name' ,
          valueField : 'id' ,
          displayField : 'c_name' ,
          submitValue : true ,
          hiddenName : 'filter' ,
          mode : "local" ,
          triggerAction : "all" ,
          forceSelection : true ,
          selectOnFocus : true ,
          editable : false ,
          listeners : {
              select : function ( combo , record , index ) {
                  var newValue = record.data.id ;
              }
          }
      } ;
      // functions to display feedback
      function onItemClick ( item ) {
          Ext.example.msg ( 'Menu Click' , 'You clicked the "{0}" menu item.' , item.text ) ;
      }
      function onLocationCheck ( item ) {
          window.location = item.uri + '.php' ;
      }
      //classOverride
      Ext.formSearch.superclass.constructor.call ( this , {
          config : {
//            menuFirst: MenuButton(),
//            firstTab: 'tab-first',
              //              href : '' ,
              //              target : '' ,
//            params: ''
          } ,
          initComponent : function () {
              Ext.formSearch.superclass.initComponent.call ( this ) ;
              this.fn ( this ) ;
          } ,
          listeners : {
              beforerender : function ( obj , eOpts ) {} ,
              afterrender : function ( obj , eOpts ) {}
          } ,
          fn : function () {} ,
          id : 'frm-grid-searchID' ,
          frame : true ,
          bodyStyle : "padding:2px" ,
          autoHeight : true ,
          width : 500 ,
          labelWidth : 180 ,
          defaults : {
              anchor : '0'
          } ,
          items : [ {
                  xtype : 'compositefield' ,
                  fieldLabel : 'คำที่ค้นหา' ,
                  msgTarget : 'side' ,
                  anchor : '-10' ,
                  defaults : {
                      flex : 1
                  } ,
                  items : [ {
                          xtype : 'textfield' ,
                          id : 'val-ID' ,
                          name : 'value'
                      } , cmbFilters ]
              } ] ,
          buttonAlign : 'left' ,
          buttons : [ {
                  id : 'buAdd' , text : 'เพิ่มมูล' , handler : function () {

                      controllTab ( { } , 'Add' ) ;
                  }
              } , {
                  xtype : 'tbfill'
              } , {
                  text : 'ค้นหา' ,
                  id : 'buSearchID' ,
                  iconCls : 'icon-magnifier' ,
                  handler : function () {

                      Ext.store.setBaseParam ( "mode" , "SEARCH" ) ;
                      Ext.store.setBaseParam ( "filter" , Ext.getCmp ( "filter-ID" ).getValue () ) ;
                      Ext.store.setBaseParam ( "value" , Ext.getCmp ( "val-ID" ).getValue () ) ;
                      Ext.getCmp ( 'tab-first' ).getStore ().load () ;
                  }
              } , {
                  text : 'เริ่มใหม' ,
                  iconCls : 'icon-reset' ,
                  handler : function () {
                      Ext.getCmp ( 'frm-grid-searchID' ).getForm ().reset () ;
                  }
              } ]
      } ) ;
  } , Ext.FormPanel , { } ) ;
  Ext.reg ( 'formSearch' , Ext.form.FormPanelSearch = Ext.formSearch ) ;
  Ext.po = Ext.apply ( {
      store : new Ext.data.JsonStore ( {
          storeId : 'statusStores' ,
          autoDestroy : true ,
//          autoLoad : true ,
          url : 'reg/DAO/ListEmpHasRight2.php' ,
          root : 'data' ,
          baseParams : {
//              i_read : user_right_read , dc_emp_id : Ext.session.emp_id
              i_read : 3 , dc_emp_id : 1
          } ,
          idProperty : 'id' ,
          totalProperty : 'totalCount' ,
          fields : [ {
                  name : 'no' ,
                  type : 'int'//i++
              } , {
                  name : 'id' ,
                  type : 'int'//row
              } , {
                  name : 'po_status_hdr_id' ,
                  type : 'int'
              } , {
                  name : 'c_name'
              } , {
                  name : 'c_comment'
              } , {
                  name : 'i_seq' ,
                  type : 'int'
              } , {
                  name : 'po_status_hdr_id' ,
                  type : 'int'
              } , {
                  name : 'dc_emp_id' ,
                  type : 'int'
              } , {
                  name : 'right_id' ,
                  type : 'int'
              } , {
                  name : 'i_enable'
              } , {
                  name : 'dc_user_create_id'
              } , {
                  name : 'dc_user_create_cost_id'
              } , {
                  name : 'd_create'
              } , {
                  name : 'dc_user_update_id'
              } , {
                  name : 'dc_user_update_cost_id'
              } , {
                  name : 'd_update'
              } ]
      } )
  } ) ;

  Ext.extend ( formPermiss = function () {
      formPermiss.superclass.constructor.call ( this , {
          listeners : {
              beforerender : function ( obj , eOpts ) {} ,
              afterrender : function ( obj , eOpts ) {}
          } ,
          id : 'frm-Permiss' ,
          url : Ext.mnController ,
          frame : true ,
          bodyStyle : 'padding:5px' ,
          autoScroll : true ,
          loadMask : true ,
          width : 700 ,
          autoHeight : true ,
          labelWidth : 230 ,
          border : false ,
          defaults : {
              border : false ,
              layout : 'form' ,
              defaults : {
                  xfield : "form" ,
                  defaultType : 'textfield' ,
                  anchor : '40%'
              }
          } ,
          items : [ {
                  id : "frm-mode" ,
                  xtype : "hidden" ,
                  name : "mode" ,
                  value : 'ADD' ,
                  readOnly : true
              } , {
                  xtype : "hidden" ,
                  name : "id" ,
                  id : 'idID'
              } , {
                  xtype : "panel" ,
                  title : Ext.subTitle ,
                  id : 'chbGroupID' ,
                  defaults : {
                      flex : 1 ,
                      bodyStyle : 'padding:5px;'
                  }
              } ] ,
          buttonAlign : 'left' ,
          buttons : [ {
                  text : 'บันทึกรายการ' ,
                  id : 'buSaveID' ,
                  iconCls : 'icon-save' ,
                  listeners : {
                      afterrender : function () {/* if(Ext.getCmp('c_area_codeEditDisID').getValue()!='0'){

                       Ext.getCmp('modeEditID').setValue('GENCODE2');
                       }else{
                       Ext.getCmp('modeEditID').setValue('GENCODE');
                       } */
                      }
                  } ,
                  handler : function () {
                      var form = Ext.getCmp ( 'frm-Permiss' ).getForm () ;
                      if ( form.isValid () ) {
                          form.submit ( {
                              waitMsg : 'Saving Data...' ,
                              success : function ( form , action ) {

                                  Ext.Msg.alert ( 'Success' , action.result.msg , function () {
                                      Ext.getCmp ( 'frm-Permiss' ).destroy () ;
                                      Ext.getCmp ( 'frm-win' ).destroy () ;
                                      Ext.getCmp ( 'tab-first' ).getStore ().reload () ;
                                      Ext.store.reload () ;

                                  } ) ;
                              } ,
                              failure : function ( form , action ) {
                                  switch ( action.failureType ) {
                                      case Ext.form.Action.CLIENT_INVALID:
                                          Ext.Msg.alert ( 'Failure' , 'Form fields may not be submitted with invalid values' ) ;
                                          break ;
                                      case Ext.form.Action.CONNECT_FAILURE:
                                          Ext.Msg.alert ( 'Failure' , 'พลข้อผิดพลาดในการเชื่อต่อเครือข่าย' ) ;
                                          break ;
                                      case Ext.form.Action.SERVER_INVALID:
                                          Ext.Msg.alert ( 'Failure' , action.result.msg ) ;
                                  }
                              }
                          } ) ;
                      }
                  }
              } , {
                  text : Ext.GLOBAL_BU_BACK_TH ,
                  handler : function () {

                      Ext.getCmp ( 'frm-Permiss' ).destroy () ;
                      Ext.getCmp ( 'frm-win' ).destroy () ;
                      Ext.getCmp ( 'tab-first' ).getStore ().reload () ;
                  }
              } ]
      } ) ;
  }
  , Ext.FormPanel , { } ) ;
//formAdd Extend
  Ext.extend ( formAdd = function () {
      formAdd.superclass.constructor.call ( this , {
          listeners : {
              afterrender : function ( obj , eOpts ) {/*console.log('Load Finish'); */
              } ,
          } ,
          id : 'frm-Add' ,
          url : Ext.mnController ,
          frame : true ,
          bodyStyle : "padding:0px" ,
          autoScroll : true ,
          loadMask : true ,
          width : 700 ,
          labelWidth : 180 ,
          defaults : {
              flex : 1 ,
          } ,
          title : Ext.title ,
          items : [ {
                  id : "frm-mode" ,
                  xtype : "hidden" ,
                  name : "mode" ,
                  value : 'ADD' ,
                  readOnly : true
              } , {
                  xtype : "hidden" ,
                  name : "id" ,
              } , {
                  xtype : "hidden" ,
                  name : "i_parent" ,
                  value : 0
              } , {
                  xtype : 'textfield' ,
                  fieldLabel : 'รหัส' ,
                  name : 'c_code' ,
                  readOnly : true
              } , {
                  xtype : 'textfield' ,
                  fieldLabel : 'เรื่อง' ,
                  name : 'c_name' ,
                  validator : function ( val ) {
                      if ( ! Ext.isEmpty ( val ) ) {
                          return true ;
                      }
                      else {
                          return "กรุณาระบุ ชื่อโครงการ " ;
                      }
                  }

              } , {
                  xtype : 'textarea' ,
                  fieldLabel : 'หมายเหตุ' ,
                  name : 'c_comment' ,
                  width : 300
              } , {
                  fieldLabel : 'สถานะการใช้งาน' ,
                  xtype : 'radiogroup' ,
                  columns : [ 80 , 100 ] ,
                  items : [ {
                          boxLabel : 'อนุมัติคำขอ' ,
                          checked : true ,
                          name : 'i_enable' ,
                          inputValue : Ext.CONF_STATUS_ENABLE
                      } , {
                          boxLabel : 'ทักท้วง' ,
                          name : 'i_enable' ,
                          inputValue : Ext.CONF_STATUS_DISABLE
                      } ]
              } ] ,
          buttonAlign : 'left' ,
          buttons : [ {
                  text : 'บันทึกรายการ' ,
                  id : 'buSaveID' ,
                  iconCls : 'icon-save' ,
                  listeners : {
                      afterrender : function () {/* if(Ext.getCmp('c_area_codeEditDisID').getValue()!='0'){

                       Ext.getCmp('modeEditID').setValue('GENCODE2');
                       }else{
                       Ext.getCmp('modeEditID').setValue('GENCODE');
                       } */
                      }
                  } ,
                  handler : function () {
                      var form = Ext.getCmp ( 'frm-Add' ).getForm () ;
                      if ( form.isValid () ) {
                          form.submit ( {
                              waitMsg : 'Saving Data...' ,
                              success : function ( form , action ) {

                                  Ext.Msg.alert ( 'Success' , action.result.msg , function () {
                                      Ext.getCmp ( 'mainContentView' ).remove ( Ext.getCmp ( 'frm-Add' ) , true ) || { } ;
                                      //null obj not errer
                                      Ext.store.reload () ;

                                  } ) ;
                              } ,
                              failure : function ( form , action ) {
                                  switch ( action.failureType ) {
                                      case Ext.form.Action.CLIENT_INVALID:
                                          Ext.Msg.alert ( 'Failure' , 'Form fields may not be submitted with invalid values' ) ;
                                          break ;
                                      case Ext.form.Action.CONNECT_FAILURE:
                                          Ext.Msg.alert ( 'Failure' , 'พลข้อผิดพลาดในการเชื่อต่อเครือข่าย' ) ;
                                          break ;
                                      case Ext.form.Action.SERVER_INVALID:
                                          Ext.Msg.alert ( 'Failure' , action.result.msg ) ;
                                  }
                              }
                          } ) ;
                      }
                  }
              } , {
                  text : Ext.GLOBAL_BU_BACK_TH ,
                  handler : function () {
                      Ext.getCmp ( 'mainContentView' ).setActiveTab ( 'tab-first' ) ;
                  }
              } ]
      } ) ;
  } , Ext.FormPanel , { } ) ;


//formAdd Extend
  function DisbledButton ( t ) {
      //Disabled etc...
      if ( t ) {
          Ext.getCmp ( 'buSaveID' ).hide () ;
      }
      else {
          Ext.getCmp ( 'buSaveID' ).show () ;
      }
  }
  function controllTab ( record , butt ) {
      Ext.getCmp ( 'mainContentView' ).remove ( Ext.getCmp ( 'frm-Add' ) , true ) || { } ;
      //null obj not errer
      if ( butt === 'permission' ) {

          if ( ! Ext.isEmpty ( Ext.getCmp ( 'frm-win' ) ) ) {
              Ext.getCmp ( 'frm-Permiss' ).destroy () ;
              Ext.getCmp ( 'frm-win' ).destroy () ;
          }
          new Ext.Window ( {
              id : 'frm-win' ,
              layout : 'fit' ,
              frame : true ,
              maskLoad : true ,
              title : Ext.subTitle1 + record.get ( 'c_name' ) ,
              width : 700 ,
              height : 400 ,
              autoHeight : true ,
              autoScroll : false ,
              closeAction : 'hide' ,
              constrainHeader : true ,
//              resizable : true ,
              minimizable : true ,
              maximizable : true ,
              border : false ,
//              modal : true ,
              loadMask : true ,
              bodyStyle : 'padding:5px' ,
              defalus : {
                  layout : 'fit' ,
                  anchor : '40%'
              } ,
              listeners : {
                  'minimize' : function ( window ) {
                      this.minimizable = false ;
                      window.setWidth ( 300 ) ;
                      window.collapse () ;
                      window.setMaximizabled ( true ) ;
                      window.alignTo ( Ext.getBody () , 'bl-bl' ) ;
                  } ,
                  beforerender : function ( window , eOpts ) {
                      Ext.showLoadingMask () ;
                  } ,
                  show : function ( window , eOpts ) {
                      console.log ( "show" ) ;
                      this.setPosition ( 0 , 0 ) ;
                      //                      this.minimizable = false ;
                      //                      this.maximize () ;
                      //                      this.minimiz () ;

                  } ,
                  beforehide : function ( window , eOpts ) {} ,
                  hide : function ( window , eOpts ) {
//                      window.drestroy () ;
                  }
              } ,
              items : new formPermiss ()
          } ).show () ;
          Ext.po.store.reload ( {
              params : {
                  dc_emp_id : record.get ( 'id' )
              } ,
              callback : function ( records , operation , success ) {
                  if ( success ) {
                      Ext.each ( records , function ( itm , i , all ) {
                          var centerRegion = Ext.getCmp ( 'chbGroupID' ) ;
                          centerRegion.remove () ;
                          centerRegion.add ( {
                              xtype : "checkbox" ,
                              fieldLabel : itm.get ( 'c_name' ) ,
                              boxLabel : itm.get ( 'c_comment' ) ,
                              checked : itm.get ( 'right_id' ) > 0 ? true : false ,
                              id : itm.get ( 'no' ) + 'ID' ,
                              // row , emp_id, status_id, seq
                              name : 'chk[' + itm.get ( 'id' ) + '][' + itm.get ( 'po_status_hdr_id' ) + ']' ,
                              //po_status_hdr_id
                              inputValue : itm.get ( 'i_seq' )//seq
                          } ) ;
                          //po_status_hdr_id,dc_emp_id,i_seq
                          Ext.getCmp ( 'idID' ).setValue ( record.get ( 'id' ) ) ;
                          Ext.getCmp ( 'frm-Permiss' ).doLayout () ;
                      } , this ) ;
                  }
              }
          } ) ;

          if ( butt === 'view' )
              DisbledButton ( true ) ;
          else
              DisbledButton ( false ) ;
      }
  }

  Ext.onReady ( function ( ) {
      Ext.QuickTips.init ( ) ;


      Ext.user_right_add = user_right_add ;
      Ext.user_right_edit = user_right_edit ;
      Ext.user_right_delete = user_right_delete ;
      Ext.hasWindow = 'actionPo' ;
      Ext.mnController = 'reg/controller/mnActionPo.php' ;
      Ext.menuEnabled = true ;
      //ปิดเมนู
      Ext.DAO = 'reg/DAO/ListActionPo.php' ;
      Ext.title = 'ข้อมูลรายชื่อพนักงาน' ;
      Ext.subTitle = "ข้อมูลหลักสถานะของดำเนินงานขอเบิก" ;
      Ext.subTitle1 = "สิทธิ์การเข้าถึงข้อมูล คุณ" ;
      Ext.store = new Ext.data.JsonStore ( {
          storeId : 'myStore' ,
          autoDestroy : true ,
          autoLoad : true ,
          url : Ext.DAO ,
          root : 'data' ,
          baseParams : {
              i_read : 3 , hdrID : Ext.getHdrID
//              i_read : user_right_read , dc_emp_id : Ext.session.emp_id
          } ,
          //Permission i_read
          idProperty : 'id' ,
          totalProperty : 'totalCount' ,
          fields : [ {
                  name : 'no' , type : 'int'
              } , {
                  name : 'id' , type : 'int'
              } , {
                  name : 'po_status_hdr_id' , type : 'int'
              } , {
                  name : 'po_working_hdr_id' , type : 'int'
              } , {
                  name : 'dc_cost_id' , type : 'int'
              } , {
                  name : 'c_status'
              } , {
                  name : 'txtdc_cost_idID'
              } , {
                  name : 'dc_emp_id' , type : 'int'
              } , {
                  name : 'txtdc_emp_idID'
              } , {
                  name : 'c_code'
              } , {
                  name : 'c_code_ref'
              } , {
                  name : 'd_doc_date'
              } , {
                  name : 'c_name'
              } , {
                  name : 'c_comment'
              } , {
                  name : 'dc_user_create_id' , type : 'int'
              } , {
                  name : 'dc_user_create_cost_id' , type : 'int'
              } , {
                  name : 'd_create'
              } , {
                  name : 'dc_user_update_id' , type : 'int'
              } , {
                  name : 'dc_user_update_cost_id' , type : 'int'
              } , {
                  name : 'd_update'
              } ]
      } ) ;
      var gridMain = {
          region : 'center' ,
          title : Ext.title ,
          xtype : 'grid' ,
          id : 'tab-first' ,
          border : false ,
          stripeRows : true ,
          loadMask : true ,
          store : Ext.store ,
          //'->' , '<-' ,
          tbarCfg : {
              buttonValign : 'top'//for center align
                  //
                  //                  // buttonAlign:'left' //for left align
                  //                  // buttonAlign:'right' //for right align
          } ,
          tbar : [ //              { xtype : 'tbfill' } ,
              {
                  xtype : 'formSearch' ,
                  tabIn : 'tab-first'
              } ] ,
          columns : [ new Ext.grid.RowNumberer ( {
                  width : 35 ,
                  header : " No " ,
                  renderer : function ( value , metaData , record , row , col , store , gridView ) {
                      return record.get ( 'no' ) ;
                  }
              } ) , {
                  header : "ID System" ,
                  sortable : true ,
                  hidden : true ,
                  dataIndex : 'id'
              } , {
                  header : "เลขที่ใบขอเบิก" ,
                  dataIndex : 'c_code_ref'
              } , {
                  header : "สถานะการดำเนินงาน" ,
                  dataIndex : 'c_status'
              } , {
                  header : "เลขที่เอกสาร" ,
                  dataIndex : 'c_code'
              } , {
                  id : 'c_name' ,
                  header : "รายการ" ,
                  width : 210 ,
                  sortable : true ,
                  dataIndex : 'c_name'
              } , {
                  header : "วันที่เอกสาร" ,
                  sortable : false ,
                  align : 'center' ,
                  dataIndex : 'd_doc_date' ,
                  renderer : shortThaiDate ,
              } , {
                  id : 'txtdc_emp_idID' ,
                  header : "ผู้รับผิดชอบ" ,
                  width : 210 ,
                  sortable : true ,
                  dataIndex : 'txtdc_emp_idID'
              } , {
                  header : "หน่วยงานผู้รับผิดชอบ" ,
                  width : 210 ,
                  sortable : true ,
                  dataIndex : 'txtdc_cost_idID'

              } ] ,
          bbar : new Ext.PagingToolbar ( {
              pageSize : 20 ,
              id : 'bbID' ,
              store : Ext.store ,
              displayInfo : true ,
              displayMsg : 'Displaying topics {0} - {1} of {2}'
          } ) ,
          listeners : {
              afterrender : function ( ) {

                  if ( Ext.user_right_add ) {
                      if ( ! Ext.isEmpty ( Ext.getCmp ( "buAdd" ) ) )
                          Ext.getCmp ( 'buAdd' ).setDisabled ( false ) ;
                  }
                  else {
                      if ( ! Ext.isEmpty ( Ext.getCmp ( "buAdd" ) ) )
                          Ext.getCmp ( 'buAdd' ).setDisabled ( true ) ;
                  }
                  if ( Ext.user_right_edit ) {

                      Ext.getCmp ( 'tab-first' ).addColumn ( new Ext.grid.Column ( {
                          header : "สิทธิ์" ,
                          sortable : false ,
                          align : 'center' ,
                          id : 'permissionID' ,
                          width : 50 ,
                          dataIndex : 'id' ,
                          renderer : function ( value , metaData , record , row , col , store , gridView ) {
                              return '<img src="../images/icons/layout_key.png"); style="cursor:pointer"/>' ;
                          }
                      } ) ) ;
                      /* Ext.getCmp ( 'tab-first' ).addColumn ( new Ext.grid.Column ( {
                       header : "แก้ไข" ,
                       sortable : false ,
                       align : 'center' ,
                       id : 'edit' ,
                       width : 50 ,
                       dataIndex : 'id' ,
                       renderer : function ( value , metaData , record , row , col , store , gridView ) {
                       return '<img src="../images/icons/document_edit.gif"); style="cursor:pointer"/>' ;
                       }
                       } ) ) ;*/

                  }
                  if ( false ) {
                      //edit
                      Ext.getCmp ( 'tab-first' ).addColumn ( new Ext.grid.Column ( {
                          header : 'ลบ' ,
                          align : 'center' ,
                          id : 'remove' ,
                          sortable : false ,
                          width : 80 ,
                          dataIndex : 'id' ,
                          renderer : function ( value , metaData , record , row , col , store , gridView ) {
                              var i_enable = record.get ( 'i_enable' ) ;
                              return '<img src="../images/icons/document_delete.gif"); style="cursor:pointer"/>' ;
                          }
                      } ) ) ;
                  }
              }
          }

      } ;
      //main



      new Ext.Viewport ( {
          layout : 'border' ,
          items : [ new Ext.TabPanel ( {
                  region : 'center' ,
                  border : false ,
                  id : 'mainContentView' ,
                  defaults : {
                      autoScroll : true
                  } ,
                  items : [ gridMain ] ,
                  listeners : {
                      afterrender : function ( ) {
                          if ( ! Ext.isEmpty ( Ext.session.emp_id ) ) {
                              //observ ไม่ได้ใช้งานตรวจสอบสิทธ์ console
                              //@TODO ลบทิ้ง
                              Ext.po.store.reload ( {
                                  params : { dc_emp_id : Ext.session.emp_id } ,
                                  callback : function ( records , operation , success ) {
                                      if ( success ) {
                                          Ext.each ( records , function ( itm ) {
                                              console.log ( itm.get ( 'i_seq' ) + ' , ' + itm.get ( 'po_status_hdr_id' ) + ' , ' + itm.get ( 'c_name' ) ) ;
                                          } , this ) ;
                                      }
                                  } } ) ;

                          }
                          else {
                              alert ( 'Dont Permission' ) ;
                          }
                          Ext.getCmp ( 'mainContentView' ).setActiveTab ( 'tab-first' ) ;
                          Ext.getCmp ( 'tab-first' ).on ( 'cellclick' , function ( grid , rowIndex , columnIndex , e ) {
                              var record = grid.getStore ( ).getAt ( rowIndex ) ;
                              if ( columnIndex === grid.getColumnModel ( ).getIndexById ( 'permissionID' ) ) {
                                  controllTab ( record , 'permission' ) ;
                              }
                              else if ( columnIndex === grid.getColumnModel ( ).getIndexById ( 'view' ) ) {
                                  controllTab ( record , 'view' ) ;
                              }
                              else if ( columnIndex === grid.getColumnModel ( ).getIndexById ( 'remove' ) ) {
                                  controllTab ( record , 'remove' ) ;
                              }
                          } , this ) ;
                      }
                  }
              } ) ]
      } ) ;
  } ) ;
