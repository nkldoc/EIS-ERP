  /* global Ext */
  function controllTab ( record , butt ) {

      Ext.getCmp ( 'contenterCenter' ).remove ( Ext.getCmp ( 'frm-Add' ) , true ) || { } ;
      //null obj not errer
      if ( butt == 'add' ) {
          var frmAdd = new formAdd () ;
          Ext.getCmp ( 'contenterCenter' ).add ( frmAdd ) ;
          Ext.getCmp ( 'contenterCenter' ).setActiveTab ( frmAdd ) ;

          DisbledButton ( false ) ;
      }
      else if ( butt == 'allview' ) {
          var win = new Ext.Window ( {
              id : "win-msg-delete2" ,
              title : "Show Over View" ,
              modal : true ,
              width : 600 ,
              height : 400 ,
              items : [ {
                      xtype : "panel" ,
                      title : "Panel" ,
                      activeOnTop : true ,
                      layout : "fit" ,
                      items : [ {
                              layout : "border" ,
                              items : [ {
                                      region : "center" ,
                                      title : "ข้อมูลรายการ"
                                  } , {
                                      region : "south" ,
                                      title : "ดูข้อมูลเบื้อเบื้องต้น" ,
                                      height : 100 ,
                                      split : true ,
                                      collapsible : true
                                  } ]
                          } ]
                  } ] ,
              buttons : [ {
                      text : "Cancel" ,
                      handler : function () {
                          Ext.getCmp ( "win-msg-delete2" ).destroy () ;
                          // Ext.getCmp ( 'tabpanel1' ).getStore ().reload () ;
                      }
                  } ]
          } ).show () ;

      }
      else if ( butt == 'edit' || butt == 'view' ) {
          var frmAdd = new formAdd () ;
          Ext.getCmp ( 'contenterCenter' ).add ( frmAdd ) ;
          Ext.getCmp ( 'contenterCenter' ).setActiveTab ( frmAdd ) ;
          frmAdd.getForm ().loadRecord ( record ) ;
          Ext.getCmp ( 'frm-mode' ).setValue ( 'EDIT' ) ;
          if ( butt == 'view' )
              DisbledButton ( true ) ;
          else
              DisbledButton ( false ) ;
      }
      else if ( butt == 'changeStatus' ) {

//----------storeEmpItem--->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
          Ext.storeEmpItem.reload ( {
              params : { last_status_id : record.get ( 'last_status_id' ) } ,
              callback : function ( recordx , operation , success ) {
                  if ( success ) {
//----------storeStatus---
                      Ext.storeStatus.reload ( {
                          params : { last_status_id : record.get ( 'last_status_id' ) } ,
                          callback : function ( records , operation , success ) {
                              if ( success ) {
//----------frmAdd--------
                                  Ext.getCmp ( 'contenterCenter' ).remove ( Ext.getCmp ( 'tabpanel2' ) , true ) || { } ;
                                  var frmAdd = new formAdd ( ) ;
                                  Ext.getCmp ( 'contenterCenter' ).add ( frmAdd ) ;
                                  Ext.getCmp ( 'contenterCenter' ).setActiveTab ( frmAdd ) ;
                                  record.set ( 'dc_emp_id' , recordx[0].get ( 'id' ) ) ;
                                  record.set ( 'status_hdr_id' , record.get ( 'c_status' ) ) ;
                                  record.set ( 'up_status_hdr_id' , records[0].get ( 'id' ) ) ;

                                  frmAdd.getForm ( ).loadRecord ( record ) ;
                                  Ext.getCmp ( 'frm-mode' ).setValue ( 'EDIT' ) ;
                                  if ( butt == 'view' )
                                      DisbledButton ( true ) ;
                                  else
                                      DisbledButton ( false ) ;
//----------frmAdd--------
                              }
                          }
                      } ) ;
//----------storeStatus---  
                  }
              }
          } ) ;
//----------storeEmpItem--->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


      }
      else if ( butt == 'remove' ) {
          var win = new Ext.Window ( {
              id : "win-msg-delete" ,
              title : "Remove" ,
              modal : true ,
              width : 250 ,
              height : 130 ,
              html : "ท่านต้องการที่จะลบข้อมูล ?" ,
              buttons : [ {
                      text : "Confirm" ,
                      handler : function () {
                          Ext.Ajax.request ( {
                              url : Ext.mnController ,
                              params : {
                                  mode : 'DELETE' ,
                                  id : record.get ( 'id' ) ,
                              } ,
                              method : 'GET' ,
                              //POST
                              success : function ( result , request ) {
                                  var jsonData = Ext.util.JSON.decode ( result.responseText ) ;
                                  //decode json
                                  if ( jsonData.success ) {
                                  }
                                  else {
                                      Ext.MessageBox.alert ( 'Failed' , jsonData.msg ) ;
                                      // alert massage error
                                  }
                                  Ext.getCmp ( "win-msg-delete" ).hide () ;
                                  // hidden window-panel
                                  Ext.getCmp ( "win-msg-delete" ).destroy () ;
                                  // clear memory :: garbage collection
                                  Ext.getCmp ( 'tabpanel1' ).getStore ().reload () ;
                              } ,
                              failure : function ( result , request ) {
                                  Ext.MessageBox.alert ( 'Failed' , result.responseText ) ;
                                  // connect error
                              }
                          } ) ;
                      }
                  } , {
                      text : "Cancel" ,
                      handler : function () {
                          Ext.getCmp ( "win-msg-delete" ).hide () ;
                          Ext.getCmp ( "win-msg-delete" ).destroy () ;
                          Ext.getCmp ( 'tabpanel1' ).getStore ().reload () ;
                      }
                  } ]
          } ).show () ;

      }

  }
  function cellClick ( grid , rowIndex , columnIndex , e ) {
      var record = grid.getStore ().getAt ( rowIndex ) ;
      if ( columnIndex == grid.getColumnModel ().getIndexById ( 'edit' ) ) {
          controllTab ( record , 'edit' ) ;
      }
      else if ( columnIndex == grid.getColumnModel ().getIndexById ( 'changeStatus' ) ) {
          controllTab ( record , 'changeStatus' ) ;
      }
      else if ( columnIndex == grid.getColumnModel ().getIndexById ( 'view' ) ) {
          controllTab ( record , 'view' ) ;
      }
      else if ( columnIndex == grid.getColumnModel ().getIndexById ( 'remove' ) ) {
          controllTab ( record , 'remove' ) ;
      }
  }
  function DisbledButton ( t ) {
      //Disabled etc...
      if ( t ) {
          Ext.getCmp ( 'buSaveID' ).hide () ;
      }
      else {
          Ext.getCmp ( 'buSaveID' ).show () ;
      }
  }
//Ext

  Ext.mnController = 'reg/controller/mnPoWorkingHdr.php' ;
  Ext.DAO = 'reg/DAO/ListPoWorkingHdr.php' ;
  Ext.title = 'ข้อมูลใบขอเบิก' ;

  Ext.DAOstatus = 'dc/DAO/All_ArCombo.php' ;

  //Ext.storeEmpItem
  Ext.storeEmpItem = new Ext.data.JsonStore ( {
      storeId : 'myStoreEmpItem' ,
      url : Ext.DAOstatus ,
      root : 'data' ,
      baseParams : { type : 'storeEmpItem' } ,
      //Permission i_read
      idProperty : 'id' ,
      totalProperty : 'totalCount' ,
      fields : [ 'id' , 'c_name' ]
  } ) ;
  //
  Ext.storeStatus = new Ext.data.JsonStore ( {
      storeId : 'myStoreStatus' ,
      url : Ext.DAOstatus ,
      root : 'data' ,
      baseParams : { type : 'storeStatus' } ,
      //Permission i_read
      idProperty : 'id' ,
      totalProperty : 'totalCount' ,
      fields : [ 'id' , 'c_code' , 'c_name' , 'i_seq' ]
  } ) ;
  Ext.store = new Ext.data.JsonStore ( {
      storeId : 'myStore' ,
      autoDestroy : true ,
      autoLoad : true ,
      url : Ext.DAO ,
      root : 'data' ,
      baseParams : {
          i_read : user_right_read , dc_emp_id : Ext.session.emp_id
      } ,
      //Permission i_read
      idProperty : 'id' ,
      totalProperty : 'totalCount' ,
      fields : [ {
              name : 'no'
          } , {
              name : 'id'
          } , {
              name : 'po_working_hdr_id' , type : 'int'
          } , {
              name : 'po_status_hdr_id' , type : 'int'
          } , {
              name : 'last_status_id' , type : 'int'
          } , {
              name : 'c_po_code'
          } , {
              name : 'c_name'
          } , {
              name : 'c_status'
          } , {
              name : 'd_doc_date'
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
  } ) ;
  Ext.getDate = Ext.apply ( {
      year : new Date ().getFullYear () ,
      month : new Date ().getMonth () + 1 ,
      day : new Date ().getDay () ,
      getNowCarlen : function () {
          var day = new Date () ;
          var dd = day.getDate () ;
          var mm = day.getMonth () + 1 ;
          var yy = day.getFullYear () + 543 ;
          mm = ( mm < 10 ) ? ( "0" + mm ) : mm ;
          dd = ( dd < 10 ) ? ( "0" + dd ) : dd ;
          return dd + '-' + mm + '-' + yy ;
      } ,
      defaultDate : function ( typeStartDate ) {
          var day = new Date () ;
          var dd = day.getDate () ;
          var mm = day.getMonth () + 1 ;
          var yy = day.getFullYear () + 543 ;
          if ( typeStartDate == 1 ) // วันที่เริ่ม -1 เดือน
          {
              dd = "01" ;
              mm = "0" + mm.toString () ;
          }
          else {
              dd = "0" + dd.toString () ;
              mm = "0" + mm.toString () ;
          }
          return dd.substr ( - 2 ) + "-" + mm.substr ( - 2 ) + "-" + yy.toString () ;
      }
  } ) ;

//formAdd Extend
  Ext.extend ( formAdd = function () {
      Ext.storeDtl = new Ext.data.JsonStore ( {
          storeId : 'myStore' ,
          autoDestroy : true ,
          autoLoad : true ,
          url : 'reg/DAO/ListActionPo.php' ,
          root : 'data' ,
          baseParams : {
              i_read : 3 , hdrID : Ext.getHdrID
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
      ;
      var gridDtl = {

          title : "รายละเอียด" ,
          xtype : 'grid' ,
          id : 'tabpanelDtl' ,
          border : false ,
          stripeRows : true ,
          loadMask : true ,
          store : Ext.storeDtl ,
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

      } ;
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
                  xtype : "hidden" ,
                  name : "i_config" ,

              } , {
                  xtype : 'textfield' ,
                  fieldLabel : 'เลขที่เอกสาร' ,
                  name : 'c_po_code' ,
                  readOnly : true

              } , {
                  xtype : 'textfield' ,
                  fieldLabel : 'รายการ' ,
                  width : 400 ,
                  name : 'c_name' , readOnly : true ,
                  validator : function ( val ) {
                      if ( ! Ext.isEmpty ( val ) ) {
                          return true ;
                      }
                      else {
                          return "กรุณาระบุ ชื่อสถานะ " ;
                      }
                  }
              } , {
                  fieldLabel : 'สถานะของการดำเนินงาน' ,
                  xtype : 'displayfield' ,
                  name : 'status_hdr_id'
              } , {
                  fieldLabel : 'สถานะที่รอดำเนินการ' ,
                  xtype : 'combo' ,
                  id : 'up_status_hdr_idID' ,
                  store : Ext.storeStatus ,
                  valueField : 'id' ,
                  displayField : 'c_name' ,
                  submitValue : true ,
                  hiddenName : 'up_status_hdr_id' ,
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

              } , {
                  xtype : 'textfield' ,
                  fieldLabel : 'เลขที่ดำเนินงาน' ,
                  name : 'c_code' ,
//                  value : '25/32/62'
//                  readOnly : true
              } , {
                  xtype : 'datefield' ,
                  fieldLabel : 'ลงวันที่ดำเนินงาน' ,
                  name : 'd_doc_date' ,
                  validator : function ( val ) {
                      if ( ! Ext.isEmpty ( val ) ) {
                          return true ;
                      }
                      else {
                          return "กรุณาระบุ ลงวันที่เอกสาร " ;
                      }
                  }
              } , {
                  fieldLabel : 'ผู้รับผิดชอบ' ,
                  xtype : 'combo' ,
                  id : 'dc_emp_idID' ,
                  store : Ext.storeEmpItem ,
                  valueField : 'id' ,
                  displayField : 'c_name' ,
                  submitValue : true ,
                  hiddenName : 'dc_emp_id' ,
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
//
              } , {
                  xtype : 'textarea' ,
                  fieldLabel : 'หมายเหตุ' ,
                  name : 'c_comment' ,
                  width : 300
              } , gridDtl ] ,
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
                                      Ext.getCmp ( 'contenterCenter' ).remove ( Ext.getCmp ( 'frm-Add' ) , true ) || { } ;
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
                      Ext.getCmp ( 'contenterCenter' ).setActiveTab ( 'tabpanel1' ) ;
                  }
              } ]
      } ) ;
  }
  , Ext.FormPanel , { } ) ;
//formAdd Extend
  Ext.extend ( searchGrid = function () {
      //interlizing

      var cmbFilters = {
          xtype : 'combo' ,
          id : 'filter-ID' ,
          store : new Ext.data.SimpleStore ( {
              fields : [ "id" , "c_name" ] ,
              data : [ [ 'c_name' , "เรื่องขอเบิก" ] , [ 'c_code' , "เลขที่ใบขอเบิก" ] ]
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

      //classOverride
      searchGrid.superclass.constructor.call ( this , {
          initComponent : function () {
              searchGrid.superclass.initComponent.call ( this ) ;

              this.fn ( this ) ;
              /*console.log('Loading...');*/
          } ,
          listeners : {
              afterrender : function ( obj , eOpts ) { }
          } ,
          fn : function () {} ,
          id : 'frm-grid-searchID' ,
          frame : true ,
          bodyStyle : "padding:2px" ,
          autoHeight : true ,
          width : 730 ,
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
          buttons : [ /*{
           xtype : 'button' , iconCls : 'icon-add' , name : 'buAdd' , id : 'buAddID' , text : 'เพิ่มข้อมูล'
           } ,*/ {
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
  }
  , Ext.FormPanel , { } ) ;

//OnLoad Renderer
  Ext.onReady ( function () {
      Ext.QuickTips.init () ;
      Ext.user_right_add = user_right_add ;
      Ext.user_right_edit = user_right_edit ;
      Ext.user_right_delete = user_right_delete ;
      Ext.beginStatus = 22 ; //status เริ่มต้น
      var gridMain = {
          region : 'center' ,
          title : Ext.title ,
          xtype : 'grid' ,
          id : 'tabpanel1' ,
          border : false ,
          stripeRows : true ,
          loadMask : true ,
          store : Ext.store ,
          tbar : [ new searchGrid () ] ,
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
                  header : "ดำเนินการสถานะ" ,
                  sortable : false ,
                  align : 'center' ,
                  id : 'changeStatus' ,
                  width : 100 ,
                  dataIndex : 'id' ,
                  renderer : function ( value , metaData , record , row , col , store , gridView ) {
                      return '<img src="../images/icn-update.jpg"); style="cursor:pointer"/>' ;
                      //return '<img src="../images/icons/application_form.png"); style="cursor:pointer"/>' ;
                  }
              } , {
                  header : "เลขที่เอกสาร" ,
                  sortable : true ,
                  dataIndex : 'c_po_code' ,
                  renderer : function ( value , metaData , record , rowIndex , colIndex , store ) {
                      metaData.attr = "align='center'" ;
                      return value ;
                  }
              } , {
                  header : "สถานะที่ดำเนินการ" ,
                  sortable : true ,
                  dataIndex : 'last_status_id' ,
                  renderer : function ( value , metaData , record , rowIndex , colIndex , store ) {
//                      metaData.attr = "align='center'" ;
                      return record.get ( 'c_status' ) ;
                  }

              } , {
                  header : "รายการ" ,
                  width : 210 ,
                  sortable : true ,
                  dataIndex : 'c_name'
              } , {

                  header : "วันที่ดำเนินงาน" ,
                  width : 120 ,
                  sortable : true ,
                  dataIndex : 'd_doc_date' ,
                  renderer : shortThaiDate
              } , {
                  header : "รายละเอียด" ,
                  sortable : false ,
                  align : 'center' ,
                  renderer : function ( value , metaData , record , row , col , store , gridView ) {

                      if ( parseInt ( 'last_status_id' ) !== Ext.beginStatus ) {
                          return '<a href="./actionPo.php?id=' + record.get ( 'id' ) + '"><img src="../images/icons/application_form.png");/></a>' ;
                      }
                      else {
                          return "" ;
                      }
                  }
              } ] ,
          //		autoExpandColumn: 'c_name',
          bbar : new Ext.PagingToolbar ( {
              pageSize : 20 ,
              store : Ext.store ,
              displayInfo : true ,
              displayMsg : 'Displaying topics {0} - {1} of {2}'
          } ) ,
          listeners : {
              afterrender : function () {
                  Ext.getCmp ( 'tabpanel1' ).addColumn ( new Ext.grid.Column ( {
                      header : 'แสดง' ,
                      align : 'center' ,
                      id : 'view' ,
                      sortable : false ,
                      width : 50 ,
                      dataIndex : 'id' ,
                      renderer : function ( value , metaData , record , row , col , store , gridView ) {
                          var i_enable = record.get ( 'i_enable' ) ;
                          return '<img src="../images/icons/magnifier2.png"); style="cursor:pointer"/>' ;
                      }
                  } ) ) ;
                  if ( Ext.user_right_add ) {
                      if ( ! Ext.isEmpty ( Ext.getCmp ( "buAdd" ) ) )
                          Ext.getCmp ( 'buAdd' ).setDisabled ( false ) ;
                  }
                  else {
                      if ( ! Ext.isEmpty ( Ext.getCmp ( "buAdd" ) ) )
                          Ext.getCmp ( 'buAdd' ).setDisabled ( true ) ;
                  }
                  if ( Ext.user_right_edit ) {
                      //all
                      if ( ! Ext.isEmpty ( Ext.getCmp ( "role-form-mode" ) ) )
                          Ext.getCmp ( "role-form-mode" ).setValue ( 'EDIT' ) ;
//                      Ext.getCmp ( 'tabpanel1' ).addColumn ( new Ext.grid.Column ( {
//                          header : "ดำเนินการสถานะ" ,
//                          sortable : false ,
//                          align : 'center' ,
//                          id : 'changeStatus' ,
//                          width : 100 ,
//                          dataIndex : 'id' ,
//                          renderer : function ( value , metaData , record , row , col , store , gridView ) {
//                              return '<img src="../images/icons/application_form.png"); style="cursor:pointer"/>' ;
//                          }
//                      } ) ) ;
                      Ext.getCmp ( 'tabpanel1' ).addColumn ( new Ext.grid.Column ( {
                          header : "แก้ไข" ,
                          sortable : false ,
                          align : 'center' ,
                          id : 'edit' ,
                          width : 50 ,
                          dataIndex : 'id' ,
                          renderer : function ( value , metaData , record , row , col , store , gridView ) {
                              return '<img src="../images/icons/document_edit.gif"); style="cursor:pointer"/>' ;
                          }
                      } ) ) ;

                  }
                  if ( Ext.user_right_delete ) {
                      //edit
//                      Ext.getCmp ( 'tabpanel1' ).addColumn ( new Ext.grid.Column ( {
//                          header : 'ลบ' ,
//                          align : 'center' ,
//                          id : 'remove' ,
//                          sortable : false ,
//                          width : 80 ,
//                          dataIndex : 'id' ,
//                          renderer : function ( value , metaData , record , row , col , store , gridView ) {
//                              var i_enable = record.get ( 'i_enable' ) ;
//                              return '<img src="../images/icons/document_delete.gif"); style="cursor:pointer"/>' ;
//                          }
//                      } ) ) ;
                  }
              }
          }

      } ;

      new Ext.Viewport ( {
          layout : 'border' ,
          items : [ new Ext.TabPanel ( {
                  region : 'center' ,
                  border : false ,
                  id : 'contenterCenter' ,
                  defaults : {
                      autoScroll : true
                  } ,
                  items : [ gridMain ]

              } ) ]
      } ) ;
      Ext.getCmp ( 'contenterCenter' ).setActiveTab ( 'tabpanel1' ) ;
      Ext.getCmp ( 'tabpanel1' ).on ( 'cellclick' , cellClick , this ) ;
  } ) ;
