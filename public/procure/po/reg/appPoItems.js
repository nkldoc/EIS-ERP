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
      else if ( butt == 'copy' ) {
          var frmAdd = new formAdd () ;
          Ext.getCmp ( 'contenterCenter' ).add ( frmAdd ) ;
          Ext.getCmp ( 'contenterCenter' ).setActiveTab ( frmAdd ) ;
          record.set ( 'id' , null ) ;
          record.set ( 'c_code' , null ) ;
          frmAdd.getForm ().loadRecord ( record ) ;
          Ext.getCmp ( 'frm-mode' ).setValue ( 'ADD' ) ;

          if ( butt == 'view' )
              DisbledButton ( true ) ;
          else
              DisbledButton ( false ) ;
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
      else if ( columnIndex == grid.getColumnModel ().getIndexById ( 'copy' ) ) {
          controllTab ( record , 'copy' ) ;
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
  Ext.store = new Ext.data.JsonStore ( {
      storeId : 'myStore' ,
      autoDestroy : true ,
      autoLoad : true ,
      url : Ext.DAO ,
      root : 'data' ,
      baseParams : {
          i_read : user_right_read
      } ,
      //Permission i_read
      idProperty : 'id' ,
      totalProperty : 'totalCount' ,
      fields : [ {
              name : 'no'
          } , {
              name : 'id'
          } , {
              name : 'c_code'
          } , {
              name : 'c_name'
          } , {
              name : 'i_seq' , type : 'int'
          } , {
              name : 'i_sibilitie' , type : 'int'
          } , {
              name : 'i_parent'
          } , {
              name : 'i_config'
          } , {
              name : 'c_comment'
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
                  fieldLabel : 'รหัส' ,
                  name : 'c_code' ,
                  readOnly : true
              } , {
                  xtype : 'textfield' ,
                  fieldLabel : 'ชื่อสถานะ' ,
                  name : 'c_name' ,
                  validator : function ( val ) {
                      if ( ! Ext.isEmpty ( val ) ) {
                          return true ;
                      }
                      else {
                          return "กรุณาระบุ ชื่อสถานะ " ;
                      }
                  }
              } , {
                  xtype : "numberfield" ,
                  validateOnBlur : true ,
                  fieldLabel : 'ลำดับ' ,
                  name : 'i_seq' ,
                  validator : function ( val ) {
                      if ( ! Ext.isEmpty ( val ) ) {
                          return true ;
                      }
                      else {
                          return "กรุณาระบุ ลำดับ " ;
                      }
                  }
              } , {
//
////                  fieldLabel : 'ผู้มีอำนาจลงนาม' ,
//                  xtype : 'radiogroup' ,
//                  columns : [ 180 , 150 ] ,
//                  id : 'i_sibilitieID' ,
////                  name : 'i_sibilitie' , //ผู้มีอำนาจลงนาม
//                  items : [ {
//                          boxLabel : 'ไม่ต้องต้องผู้มีอำนาจลงนาม' , checked : true ,
//                          name : 'i_sibilitie' , //ผู้มีอำนาจลงนาม
//                          inputValue : 0
//                      } , {
//                          boxLabel : 'ต้องผู้มีอำนาจลงนาม' ,
//                          inputValue : 1 , name : 'i_sibilitie' //ผู้มีอำนาจลงนาม
//                      } ]
//                  , listeners : {
//                      beforerender : function () {
////                          console.log ( 'beforerender ' ) ;
//                      } ,
//                      change : function ( newValue , oldValue , eOpts ) {
////                          console.log ( 'select ' + this.getValue ().inputValue ) ;
//                      } ,
//                      afterrender : function () {
//
//                          if ( this.getValue ().inputValue ) {
////                              console.log ( 'show' ) ;
//                          }
//                          else {
////                              console.log ( 'Dont show' ) ;
//                          }
////                          console.log ( 'afterrender ' + this.getValue ().inputValue ) ;
//                      }
//                  }
//              } , { xtype : 'textfield' ,
//                  fieldLabel : 'ผู้มีอำนาจลงนาม' ,
//                  isteners : {
//                      beforerender : function () {
//                          console.log ( ' >>>>>>>>> ' + Ext.getCmp ( 'i_sibilitieID' ).getValue ().inputValue ) ;
//                      } ,
//                      afterrender : function () {
//
//                          if ( Ext.getCmp ( 'i_sibilitieID' ).getValue ().inputValue ) {
//                              this.hide () ;
//                          }
//                          else {
//                              this.show () ;
//                          }
////                          console.log ( 'afterrender ' + this.getValue ().inputValue ) ;
//                      }
//                  }
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
                          boxLabel : 'ใช้งาน' ,
                          checked : true ,
                          name : 'i_enable' ,
                          inputValue : Ext.CONF_STATUS_ENABLE
                      } , {
                          boxLabel : 'ไม่ใช้งาน' ,
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
              afterrender : function ( obj , eOpts ) {/*console.log('Load Finish');*/
              } ,
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
          buttons : [ {
                  xtype : 'button' , iconCls : 'icon-add' , name : 'buAdd' , id : 'buAddID' , text : 'เพิ่มข้อมูล'
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
  }
  , Ext.FormPanel , { } ) ;

//OnLoad Renderer
  Ext.onReady ( function () {
      Ext.QuickTips.init () ;
      Ext.user_right_add = user_right_add ;
      Ext.user_right_edit = user_right_edit ;
      Ext.user_right_delete = user_right_delete ;

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
                  header : "รหัส" ,
                  hidden : true ,
                  sortable : true ,
                  dataIndex : 'c_code' ,
                  renderer : function ( value , metaData , record , rowIndex , colIndex , store ) {
                      metaData.attr = "align='center'" ;
                      return value ;
                  }
              } , {
                  header : "ลำดับ" ,
                  sortable : true ,
                  dataIndex : 'i_seq' ,
                  renderer : function ( value , metaData , record , rowIndex , colIndex , store ) {
                      metaData.attr = "align='center'" ;
                      return value ;
                  }
              } , {
                  id : 'c_name' ,
                  header : "ชื่อสถานะ" ,
                  width : 210 ,
                  sortable : true ,
                  dataIndex : 'c_name'
              } , {
                  header : "Status" ,
                  sortable : false ,
                  align : 'center' ,
                  renderer : function ( value , metaData , record , row , col , store , gridView ) {
                      var i_enable = record.get ( 'i_enable' ) ;
                      if ( parseInt ( i_enable ) === parseInt ( Ext.CONF_STATUS_ENABLE ) ) {
                          return '<img src="../images/icons/yes.gif");/>' ;
                      }
                      else {
                          return '<img src="../images/icons/no.gif");/>' ;
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
                      Ext.getCmp ( 'tabpanel1' ).addColumn ( new Ext.grid.Column ( {
                          header : "คัดลอก" ,
                          sortable : false ,
                          align : 'center' ,
                          id : 'copy' ,
                          width : 50 ,
                          dataIndex : 'id' ,
                          renderer : function ( value , metaData , record , row , col , store , gridView ) {
                              return '<img src="../images/icons/database_copy.png"); style="cursor:pointer"/>' ;
                          }
                      } ) ) ;
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
                      Ext.getCmp ( 'tabpanel1' ).addColumn ( new Ext.grid.Column ( {
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

      new Ext.Viewport ( {
          layout : 'border' ,
          items : [ new Ext.TabPanel ( {
                  region : 'center' ,
                  border : false ,
                  id : 'contenterCenter' ,
                  defaults : {
                      autoScroll : true
                  } ,
                  items : [ gridMain ] ,

              } ) ]
      } ) ;
      Ext.getCmp ( 'contenterCenter' ).setActiveTab ( 'tabpanel1' ) ;
      Ext.getCmp ( 'tabpanel1' ).on ( 'cellclick' , cellClick , this ) ;
      // InfoMainGrid ( 'tabpanel1' , true , true , true , true , true , true ) ;

  } ) ;
