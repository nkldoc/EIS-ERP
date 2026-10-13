  /* global Ext  */

// @ts-ignore
  Ext.obj = Ext.apply ( {
      pid : 'adj001' ,
      customer_th : "MCOT อสมท." ,
      method : 'POST' ,
      title_menu_th : "รายการใบขอปรับปรุงนี้แจ้งหนี้ พิมพ์" ,
      title_gridMain_th : "แสดงข้อมูลรายการใบขอปรับปรุงนี้แจ้งหนี้" ,
      title_formMain_th : "แก้ไขรายละเอียดการใบขอปรับปรุงนี้แจ้งหนี้" ,
      title_gridDetail_th : "รายการปรับปรุงนี้แจ้งหนี้" ,
      dc_cnt_id : null ,
      ar_so_hdr_id : null ,
      controllerMain : './adj/controller/mnAdj001.php' , //manage MODE ADD EDIT DELETE GENCODE ADJ
      controllerDetail : './adj/controller/mnAdjDtl001.php' , //manage MODE ADD DELETE
      DAOMain : './adj/DAO/adj001_list.php?mode=READ' , //list dtl from i_parent  <> 0
      DAODetail : './adj/DAO/adj001Dtl_list.php?mode=READ' , //list dtl from i_parent  = 0
      DAODetailed : './adj/DAO/adj001Dtl_list.php?mode=READSUB' , //list dtl from i_parent <> 0
      DAOGetRemain : './adj/DAO/adj001Dtl_list.php?mode=GETREMAIN' , //list dtl from i_parent <> 0
      setParamsEdit : function ( record ) {
          // @ts-ignore
          Ext.getCmp ( 'disPlayCntID' ).show () ;
          Ext.obj.dc_cnt_id = record.data.dc_cnt_id ;
          // @ts-ignore
          Ext.storeSo.baseParams = { type : 'storeSo' , dc_cnt_id : Ext.obj.dc_cnt_id } ;
          // @ts-ignore
          Ext.getCmp ( 'disPlaySoID' ).show () ;
          Ext.obj.ar_so_hdr_id = record.data.ar_so_hdr_id ;
          // @ts-ignore
          Ext.storeBl.baseParams = { type : 'storeBl' , dc_cnt_id : Ext.obj.dc_cnt_id , ar_so_hdr_id : Ext.obj.ar_so_hdr_id } ;
          // @ts-ignore
          Ext.getCmp ( 'disPlayBlID' ).show () ;

          Ext.obj.ar_bill_invoice_hdr_id = record.data.ar_bill_invoice_hdr_id ;


          // @ts-ignore
          var clx = " dc_cnt_id" + Ext.obj.dc_cnt_id ;
          clx += " , " + Ext.obj.ar_so_hdr_id ;
          clx += " , " + Ext.obj.ar_bill_invoice_hdr_id ;

      } ,
//Controller
      controllTabAdj : function ( record , butt ) {

          if ( butt === 'add' ) {

              // @ts-ignore
              Ext.getCmp ( 'contenterCenter' ).remove ( Ext.getCmp ( 'frm-adj-hdrID' ) , true ) || { } ; //null obj not errer
              // @ts-ignore
              Ext.getCmp ( 'contenterCenter' ).remove ( Ext.getCmp ( 'frm-adj-dtlID' ) , true ) || { } ; //null obj not errer
              var frmAdj = new frmAddAdjHdr ( false ) ;
              // @ts-ignore
              Ext.getCmp ( 'contenterCenter' ).add ( frmAdj ) ;
              // @ts-ignore
              Ext.getCmp ( 'contenterCenter' ).setActiveTab ( frmAdj ) ;
              // @ts-ignore
              Ext.getCmp ( 'modeID' ).setValue ( "ADD" ) ;
          }
          else if ( butt === "edit" || butt === 'view' ) {
              var c_area_print = '' + record.get ( 'c_area_ref_doc' ) ;
              //var c_area_code = '' + record.get('c_area_code');
              if ( c_area_print !== '0' ) {
                  var dis = true ;

              }
              else {
                  var dis = false ;
              }

              // @ts-ignore
              Ext.default.f_vat_amtID = 1 ;
              // @ts-ignore
              Ext.getCmp ( 'contenterCenter' ).remove ( Ext.getCmp ( 'frm-adj-hdrID' ) , true ) || { } ; //null obj not errer
              // @ts-ignore
              Ext.getCmp ( 'contenterCenter' ).remove ( Ext.getCmp ( 'frm-adj-dtlID' ) , true ) || { } ; //null obj not errer

              //create form and add tab
              var frmBill = new frmAddAdjHdr ( dis ) ;
              // @ts-ignore
              Ext.getCmp ( 'contenterCenter' ).add ( frmBill ) ;
              // @ts-ignore
              Ext.getCmp ( 'contenterCenter' ).setActiveTab ( frmBill ) ;

              frmBill.getForm ().loadRecord ( record ) ;

              var formBlDtl = new frmAddAdjDtl ( dis ) ;
              // @ts-ignore
              Ext.getCmp ( 'contenterCenter' ).add ( formBlDtl ) ;
              // @ts-ignore
              Ext.getCmp ( 'modeID' ).setValue ( "EDIT" ) ;
              formBlDtl.getForm ().loadRecord ( record ) ;
              // @ts-ignore
              Ext.getCmp ( 'contenterCenter' ).setActiveTab ( frmBill ) ;
              // @ts-ignore
              Ext.getCmp ( 'contenterCenter' ).setActiveTab ( formBlDtl ) ;
              this.setParamsEdit ( record ) ;
              Ext.storeDtled.reload (
                  {
                      params : {
                          mode : 'GETDATA' ,
                          id : record.data.id ,
                          accessData : 'edit'
                      } ,
                      // @ts-ignore
                      callback : function ( records , operation , success ) {
                          if ( success ) {
                              //frmSoDtl.getEl().unmask();
                              formBlDtl.getEl ().unmask () ;


                              /*Ext.getCmp('hdrID').setValue(record.get('ar_bill_invoice_hdr_id'));
                               Ext.getCmp('soHdrID').setValue(record.get('ar_so_hdr_id'));*/

                              // @ts-ignore
                              Ext.getCmp ( 'tabBlDtlGrid' ).on ( 'cellclick' , Ext.obj.clickRemoveProductBl , this ) ;

                          }
                      }
                  } ) ;

          }
          else if ( butt === 'formPrint' ) {

              console.log ( "print" ) ;
          }

      } ,
      columnMini : [ {
              header : "ID System" ,
              sortable : true ,
              hidden : true ,
              dataIndex : 'id'
          } , {
              header : "รหัส" ,
              sortable : true ,
              dataIndex : 'c_code' ,
          } , {
              header : "ชื่อ" ,
              sortable : true ,
              id : 'c_name' ,
              dataIndex : 'c_name' ,
              // @ts-ignore
              renderer : function ( value , metaData , record , rowIndex , colIndex , store ) {
                  metaData.attr = "style='cursor:pointer';" ;
                  return value ;
              }
          } ] ,
      columnSo : [ {
              header : "ID System" ,
              sortable : true ,
              hidden : true ,
              dataIndex : 'id'
          } , {
              header : "รหัส" ,
              sortable : true ,
              dataIndex : 'c_code' ,
          } , {
              header : "รายการ" ,
              sortable : true ,
              id : 'c_name' ,
              dataIndex : 'c_name' ,
              // @ts-ignore
              renderer : function ( value , metaData , record , rowIndex , colIndex , store ) {
                  metaData.attr = "style='cursor:pointer';" ;
                  return value ;
              }
          } ] ,
      columnBl : [ {
              header : "ID System" ,
              sortable : true ,
              hidden : true ,
              dataIndex : 'id'
          } , {
              header : "รหัส" ,
              sortable : true ,
              dataIndex : 'c_code' ,
              width : 300 ,
          } , {
              header : "รายการ" ,
              sortable : true ,
              id : 'c_name' ,
              dataIndex : 'c_name' ,
              // @ts-ignore
              renderer : function ( value , metaData , record , rowIndex , colIndex , store ) {
                  metaData.attr = "style='cursor:pointer';" ;
                  return value ;
              }
          } ] ,
//+++++++++++++++++++++++++++++*******************
      storeDcCnt : function () {
          // @ts-ignore
          return new Ext.data.JsonStore (
              {
//                    autoLoad: true,
                  storeId : 'myStoreCnt' ,
                  url : 'adj/DAO/items.php' ,
                  baseParams : {
                      type : 'storeCnt'
                  } ,
                  root : 'data' ,
                  idProperty : 'id' ,
                  totalProperty : 'totalCount' ,
                  fields : [ 'no' , 'id' , 'c_code' , 'c_name' , 'dc_cnt_type_name' , 'c_tax_value' , 'c_address' , 'c_telephone' , 'c_mobile' , 'c_fax' ]
                      /***
                       *
                       ประเภทลูกค้า	: เอเจนซี
                       เลขประจำตัวผู้เสียภาษีอากร	: 0105516013258
                       ที่อยู่	: 2 อาคารเพลินจิตเซ็นเตอร์ ชั้น 22 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110
                       โทรศัพท์	: 02-629-6000 ต่อ 6320,6306
                       โทรศัพท์เคลื่อนที่	:
                       โทรสาร	:
                       */
              } )
      } ,
      PopCntForm : function () {
          // @ts-ignore
          return new Ext.ux.Poplov (
              {
                  text : 'ชื่อลูกค้า' ,
                  id : 'dc_cnt_idID' ,
                  iconCls : 'page_magnify' ,
                  valueHidden : 'dc_cnt_id' ,
                  store : this.storeDcCnt () ,
                  headerGrid : this.columnMini ,
                  widthText : 350 ,
                  fieldLabel : 'ชื่อลูกค้า' ,
                  isCellClickGrid : true ,
                  // @ts-ignore
                  cellClickGrid : function ( grid , rowIndex , columnIndex , e ) {
                      // @ts-ignore
                      Ext.getCmp ( 'disPlayCntID' ).show () ;
                      var id = 'dc_cnt_idID' ;
                      var nameID = id + '_Name' ;
                      var record = grid.getStore ().getAt ( rowIndex ) ;
                      if ( parseInt ( record.data.id ) !== parseInt ( Ext.obj.dc_cnt_id ) && Ext.obj.dc_cnt_id !== null ) {

                          // @ts-ignore
                          Ext.MessageBox.alert ( 'Clear Data' , "ข้อมูล  SO และ BL จะถูกเคลียร์" , function () {
                              //console.log("ข้อมูล  SO และ BL จะถูกเคลียร์");
                          } ) ;
                      }
                      else {

                      }

                      var TextShow = record.data.c_code + ' ' + record.data.c_name ;
                      // @ts-ignore
                      Ext.getCmp ( id ).setValue ( record.data.id ) ;
                      // @ts-ignore
                      Ext.getCmp ( nameID ).setValue ( TextShow ) ;
                      // @ts-ignore
                      Ext.getCmp ( "win-pop-lov" + id ).hide () ;
                      // @ts-ignore
                      Ext.getCmp ( "win-pop-lov" + id ).destroy () ;
                      Ext.obj.dc_cnt_id = record.data.id ;
                      // @ts-ignore
                      Ext.storeSo.baseParams = { type : 'storeSo' , dc_cnt_id : Ext.obj.dc_cnt_id } ;
                      // @ts-ignore
                      Ext.getCmp ( 'frm-adj-hdrID' ).getForm ().loadRecord ( record ) ;
                      //



                  }
              } ) ;
      } ,
//------------------------------------------------
      storeSo : function () {

          // @ts-ignore
          return new Ext.data.JsonStore ( {
//                    autoLoad: true,
              storeId : 'storeSo' ,
              url : 'adj/DAO/items.php' ,
              root : 'data' ,
              idProperty : 'id' ,
              totalProperty : 'totalCount' ,
              fields : [ 'no' , 'id' , 'ar_so_hdr_id' , 'c_code' , 'c_name' , 'c_contract_no' , 'c_po_no' , 'd_so_date' , 'dc_comm_id' , 'dc_comm_name' ]
          } ) ;
      } ,
      PopSoForm : function () {
          // @ts-ignore
          return new Ext.ux.Poplov (
              {
                  text : 'เลขที่ Order' ,
                  id : 'ar_so_hdr_idID' ,
                  iconCls : 'page_magnify' ,
                  valueHidden : 'ar_so_hdr_id' ,
                  // @ts-ignore
                  store : Ext.storeSo , // this.storeSo(),
                  headerGrid : this.columnSo ,
                  widthText : 350 ,
                  fieldLabel : 'เลขที่ Order' ,
                  isCellClickGrid : true ,
                  // @ts-ignore
                  cellClickGrid : function ( grid , rowIndex , columnIndex , e ) {
//Lable show
                      // @ts-ignore
                      Ext.getCmp ( 'disPlaySoID' ).show () ;
//Default
                      var id = 'ar_so_hdr_idID' ;
                      var nameID = id + '_Name' ;
                      var record = grid.getStore ().getAt ( rowIndex ) ;
                      if ( parseInt ( record.data.id ) !== parseInt ( Ext.obj.ar_so_hdr_id ) && Ext.obj.ar_so_hdr_id !== null ) {

                          // @ts-ignore
                          Ext.MessageBox.alert ( 'Clear Data' , "BL จะถูกเคลียร์" , function () {
                              //console.log("BL จะถูกเคลียร์");
                          } ) ;
                      }
                      else {

                      }

                      var TextShow = record.data.c_code + ' ' + record.data.c_name ;
                      // @ts-ignore
                      Ext.getCmp ( id ).setValue ( record.data.id ) ;
                      // @ts-ignore
                      Ext.getCmp ( nameID ).setValue ( TextShow ) ;
                      // @ts-ignore
                      Ext.getCmp ( "win-pop-lov" + id ).hide () ;
                      // @ts-ignore
                      Ext.getCmp ( "win-pop-lov" + id ).destroy () ;

                      Ext.obj.ar_so_hdr_id = record.data.id ;
                      record.set ( 'so_code' , record.data.c_code ) ;
                      // @ts-ignore
                      Ext.storeBl.baseParams = { type : 'storeBl' , dc_cnt_id : Ext.obj.dc_cnt_id , ar_so_hdr_id : Ext.obj.ar_so_hdr_id } ;
                      // @ts-ignore
                      Ext.getCmp ( 'frm-adj-hdrID' ).getForm ().loadRecord ( record ) ;


                  }
              } ) ;
      } ,
//------------------------------------------------
      storeBl : function () {
          // @ts-ignore
          return new Ext.data.JsonStore (
              {
                  storeId : 'myStoreBl' ,
                  url : 'adj/DAO/items.php' ,
                  baseParams : {
                      type : 'storeBl' ,
                      dc_cnt_id : this.dc_cnt_id , // Ext.getCmp('dc_cnt_idID').getValue(),
                      ar_so_hdr_id : this.ar_so_hdr_id // Ext.getCmp('ar_so_hdr_idID').getValue()
                  } ,
                  root : 'data' ,
                  idProperty : 'id' ,
                  totalProperty : 'totalCount' ,
                  fields : [ 'no' , 'id' , 'c_code' ,
                      'c_name' ,
                      'dc_tax_id_tax' , 'dc_tax_id_vat' , 'vat_rate' , 'tax_rate' ,
                      'd_billing_date' ,
                      'f_total_cost_amt1' , 'f_disc_com_amt1' , 'f_net_disc_comm_amt1' ,
                      'f_net_cost_amt1' , 'f_vat_amt1' , 'f_disc_cash_amt1' , 'f_net_cost_add_vat_amt1' ]


              } ) ;
      } ,
      PopBlForm : function () {
          // @ts-ignore
          return new Ext.ux.Poplov (
              {
                  text : 'เลขที่ใบวางบิล/ใบแจ้งหนี้' ,
                  id : 'ar_bill_invoice_hdr_idID' ,
                  iconCls : 'page_magnify' ,
                  valueHidden : 'ar_bill_invoice_hdr_id' ,
                  // @ts-ignore
                  store : Ext.storeBl ,
                  headerGrid : this.columnBl ,
                  widthText : 350 ,
                  fieldLabel : 'เลขที่ใบวางบิล/ใบแจ้งหนี้' ,
                  isCellClickGrid : true ,
                  // @ts-ignore
                  cellClickGrid : function ( grid , rowIndex , columnIndex , e ) {
                      // @ts-ignore
                      Ext.getCmp ( 'disPlayBlID' ).show () ;
                      var id = 'ar_bill_invoice_hdr_idID' ;
                      var nameID = id + '_Name' ;
                      var record = grid.getStore ().getAt ( rowIndex ) ;
                      var TextShow = record.data.c_code + ' ' + record.data.c_name ;
                      // @ts-ignore
                      Ext.getCmp ( id ).setValue ( record.data.id ) ;
                      // @ts-ignore
                      Ext.getCmp ( nameID ).setValue ( TextShow ) ;
                      // @ts-ignore
                      Ext.getCmp ( "win-pop-lov" + id ).hide () ;
                      // @ts-ignore
                      Ext.getCmp ( "win-pop-lov" + id ).destroy () ;
                      Ext.obj.ar_bill_invoice_hdr_id = record.data.id ;
                      record.set ( 'bl_code' , record.data.c_code ) ;
                      record.set ( 'c_name' , record.data.c_area_code ) ;
                      record.set ( 'i_parent' , record.data.id ) ;
                      record.set ( 'id' , 0 ) ;
                      record.set ( 'ar_bill_invoice_hdr_id' , 0 ) ;
                      // @ts-ignore
                      Ext.getCmp ( 'frm-adj-hdrID' ).getForm ().loadRecord ( record ) ;


                  }
              } ) ;
      } ,
//------------------------------------------------
      statusBuGenCode : function () {
          // @ts-ignore
          var items = parseFloat ( Ext.getCmp ( 'f_req_amtID' ).getValue ().replace ( /,/g , '' ) ) ,
              // @ts-ignore
              c_code = '' + Ext.getCmp ( 'c_area_codeEditDisID' ).getValue () ;

//        console.log('item = ' + items);
//        console.log('code' + c_code);

          if ( items === 0 ) {
              // @ts-ignore
              Ext.getCmp ( 'buGenCodeID' ).hide () ;
          }
          else if ( c_code !== '0' && items !== 0 ) {
              // @ts-ignore
              Ext.getCmp ( 'buGenCodeID' ).hide () ;
              // @ts-ignore
              Ext.getCmp ( 'buSaveID' ).hide () ;
//            Ext.getCmp('buAddSubDtlID').hide();

          }
          else {
              // @ts-ignore
              Ext.getCmp ( 'buGenCodeID' ).show () ;
              // @ts-ignore
              Ext.getCmp ( 'buSaveID' ).show () ;
//            Ext.getCmp('buAddSubDtlID').show();

          }
          // @ts-ignore
          Ext.getCmp ( 'frm-adj-dtlID' ).doLayout () ; //
      } ,
      right : function () {
          /*console.log('i_read ::: ' + this.i_read
           + 'add ::: ' + this.i_add
           + 'edit :::: ' + this.i_edit
           + 'del :::: ' + this.i_delete);*/
      } ,
      // @ts-ignore
      i_add : user_right_add ,
      // @ts-ignore
      i_read : user_right_read ,
      i_edit : 0 , // user_right_edit,
      // @ts-ignore
      i_delete : user_right_delete ,
      fieldsetCntID : false ,
      //soDtl choose billing
      i_soDtl : 0 ,
      id : null ,
      setLog : function ( i ) {

          this.logId = i ; //now
          const songs = [ 0 ] ;
          // @ts-ignore
          const totalSongs = songs.push ( 1 ) ;
          //console.log(totalSongs);
      } ,
      getLog : function () {
          return this.txtArray[this.logId] ;
      } ,
      getStoreRow : function ( store , value ) { // Ext.global.getStoreRow(store,id);
          // @ts-ignore
          for ( i = 0 ; i < store.data.items.length ; i ++ ) {
              // @ts-ignore
              var rec = store.data.items[i] ;
              if ( value === rec.data.id ) {
                  return rec ;
              }
          } // loop
      } ,
      getItemsDtl : function () {
          return this.i_soDtl ;
      } ,
      glCloseMonth : function () {
          return null ;
      } ,
      // @ts-ignore
      columnOnGrid : function ( grid , rowIndex , columnIndex , e ) {


      } ,
      // @ts-ignore
      cellClick : function ( grid , rowIndex , columnIndex , e ) //EVENT
      {
          var record = grid.getStore ().getAt ( rowIndex ) ;

          if ( columnIndex === grid.getColumnModel ().getIndexById ( 'c_area_codeID' ) ) //before PRINT
          {
              if ( record.get ( 'i_is_status' ) === 2 )
                  Ext.obj.controllTabAdj ( record , 'formPrint' ) ;
          }
          else if ( columnIndex === grid.getColumnModel ().getIndexById ( 'edit' ) ) //EDIT
          {
              // #TODO 2 open edit & cancel
              //if (record.get('i_is_status') === 2)
              Ext.obj.controllTabAdj ( record , 'edit' ) ;
          }
          else if ( columnIndex === grid.getColumnModel ().getIndexById ( 'view' ) ) //VIEW
          {
              //disbled Bu Save
          }
          else if ( columnIndex === grid.getColumnModel ().getIndexById ( 'cancelID' ) ) //CANCLE
          {
              if ( record.get ( 'i_is_status' ) === 2 )
                  deRemove ( record.get ( 'id' ) , 'cancel' ) ;
          }
          else if ( columnIndex === grid.getColumnModel ().getIndexById ( 'delID' ) ) //DEL
          {

              if ( record.get ( 'delID' ) !== "" )
                  deRemove ( record.get ( 'id' ) , 'del' ) ;
          }
          else if ( columnIndex === grid.getColumnModel ().getIndexById ( 'print_statusID' ) ) // after PRINT
          {

              var status = record.get ( 'print_status' ) ;
              if ( status === 1 ) {
                  //printPreview(record);
              }
              else if ( status === 2 ) {
                  // @ts-ignore
                  printPreview ( record ) ;
              }
              else if ( status === 3 ) {
                  // @ts-ignore
                  Preview ( record.get ( 'id' ) ) ;
              }

          }
      } ,
      // @ts-ignore
      clickRemoveProductBl : function ( grid , rowIndex , columnIndex , e ) //Remove  BL DTL
      {
          var record = grid.getStore ().getAt ( rowIndex ) ;
          if ( columnIndex === grid.getColumnModel ().getIndexById ( 'removePro' ) ) {
              if ( record.get ( 'id' ) !== "grandTotal" )
                  // @ts-ignore
                  var win = new Ext.Window (
                      {
                          id : "win-msg-delete-master-sub-bl" ,
                          title : "Remove" ,
                          modal : true ,
                          width : 250 ,
                          height : 130 ,
                          html : "ท่านต้องการที่จะลบข้อมูล ?" ,
                          buttons : [
                              {
                                  text : "Confirm" ,
                                  handler : function () {
                                      // @ts-ignore
                                      Ext.Ajax.request (
                                          {
                                              url : Ext.obj.controllerDetail ,
                                              params : {
                                                  mode : 'DELETE' ,
                                                  id : record.get ( 'id' ) ,
                                                  ar_bill_invoice_hdr_id : record.get ( 'ar_bill_invoice_hdr_id' ) ,
                                                  ar_so_dtl_id : record.get ( 'ar_so_dtl_id' )
                                              } ,
                                              method : 'POST' ,
                                              //POST
                                              // @ts-ignore
                                              success : function ( result , request ) {

                                                  // @ts-ignore
                                                  var jsonData = Ext.util.JSON.decode ( result.responseText ) ; //decode json
                                                  if ( jsonData.success ) {
                                                      // @ts-ignore
                                                      Ext.default.f_vat_amtID = 3 ;
                                                      // @ts-ignore
                                                      Ext.f_vat = null ;
                                                  }
                                                  else {

                                                      // @ts-ignore
                                                      Ext.MessageBox.alert ( 'Failed' , jsonData.msg ) ; // alert massage error
                                                  }


                                                  // @ts-ignore
                                                  Ext.getCmp ( "win-msg-delete-master-sub-bl" ).destroy () ; // clear memory :: garbage collection
                                                  //DELETE BL DTL
                                                  // @ts-ignore
                                                  Ext.getCmp ( 'tabBlDtlGrid' ).getStore ().reload () ;
                                                  // @ts-ignore
                                                  Ext.getCmp ( 'tabGridMasterID' ).getStore ().reload () ; // reload grid & store
                                              } ,
                                              // @ts-ignore
                                              failure : function ( result , request ) {

                                                  // @ts-ignore
                                                  Ext.MessageBox.alert ( 'Failed' , result.responseText ) ; // connect error
                                              }
                                          } ) ;
                                  }
                              } , {
                                  text : "Cancel" ,
                                  handler : function () {


                                      // @ts-ignore
                                      Ext.getCmp ( "win-msg-delete-master-sub-bl" ).destroy () ;
                                      // @ts-ignore
                                      Ext.getCmp ( 'tabGridMasterID' ).getStore ().reload () ;
                                  }
                              } ]
                      } ).show () ;
          }
      } ,
      controllTab : function ( { } , butt ) { //OPEN WINDOW
          if ( butt === "adj001" ) {
              var title_txt = "แสดงรายการบิล/แจ้งหนี้ แล้ว" ;
              var menu_txt = "adj001" ;
          }
          else if ( butt === "adjWaitQue001" ) {
              var title_txt = "แสดงรายการที่วางบิลแล้ว" ;
              var menu_txt = "adjWaitQue001" ;
          }
          // @ts-ignore
          var webAppWaiting = new Ext.Window (
              {
                  iconCls : 'icon-grid' ,
                  loadMask : true ,
                  // @ts-ignore
                  height : Ext.getBody ().getViewSize ().height * 0.8 ,
                  // @ts-ignore
                  width : Ext.getBody ().getViewSize ().width * 0.8 ,
                  //80%
                  constrainHeader : true ,
                  maximizable : true ,
                  minimizable : true ,
                  closable : true ,
                  layout : 'fit' ,
                  title : title_txt ,
                  id : 'win-panel-iframe-load' ,
                  bodyStyle : {
                      mixHeight : '100px'
                  } ,
                  autoScroll : true ,
                  listeners : {
                      // @ts-ignore
                      beforerender : function ( win ) {

                      } ,
                      // @ts-ignore
                      afterrender : function ( win ) {
                          // @ts-ignore
                          Ext.getCmp ( 'win-panel-iframe-load' ).update ( '<iframe id="win-panel-iframe-loadID" src="' + menu_txt + '.php" frameborder=\"0\" width=\"100%\" height=\"100%\"></iframe>' ) ;

                      } ,
                      // @ts-ignore
                      'close' : function ( win ) {
                          // @ts-ignore
                          Ext.MessageBox.show ( {
                              title : 'Confirm Reload' ,
                              msg : ' คุณต้องการที่เรียกดูข้อมูลรายการที่วางบิลแล้ว ใหม่อีกครั้ง ?' ,
                              // @ts-ignore
                              buttons : Ext.MessageBox.OKCANCEL ,
                              icon : '' ,
                              //                                icon: Ext.MessageBox.QUESTION,

                              fn : function ( btn ) {
                                  if ( btn === 'ok' ) {
                                      Ext.store.reload () ;
                                  }
                                  else {
//                                        console.log(Ext.MessageBox);
                                      return ;
                                  }
                              }
                          } ) ;
                      }
                  } ,
                  single : true ,
                  minimize : function ( win ) {
                      var f = win ;
                      f.doLayout () ;
                      // @ts-ignore
                      var h = f.body.dom.scrollHeight ;
                      // @ts-ignore
                      win.setWidth ( Ext.getBody ().getViewSize ().width * 0.2 ) ;
                      // @ts-ignore
                      win.setHeight ( Ext.getBody ().getViewSize ().height * 0.2 ) ;
                      win.center () ;
                  }
              } ) ;
          webAppWaiting.show () ;
      } ,
      storeSoDtl : function () {
          // @ts-ignore
          return new Ext.data.JsonStore (
              {
                  storeId : 'myStoreSoDtl' ,
                  baseParams : {
                      type : 'storeSoBillingDtl'
                  } ,
                  // @ts-ignore
                  proxy : new Ext.data.HttpProxy (
                      {
                          url : Ext.obj.DAODetail , //'api/ListTvAddSoBillingDtl.php',
                          timeout : 90000
                      } ) ,
                  root : 'data' ,
                  idProperty : 'id' ,
                  totalProperty : 'totalCount' ,
                  fields : [
                      { name : 'no' } ,
                      { name : 'id' } ,
                      { name : 'ar_so_dtl_id' , type : 'int' } ,
                      { name : 'c_name' } ,
                      { name : 'f_total_cost' } ,
                      { name : 'f_req_amt' } ,
                      { name : 'f_disc_com' } ,
                      { name : 'f_total_req' } ,
                      { name : 'f_net_cost' } ,
                      { name : 'f_balance' } ,
                      { name : 'f_net_disc_comm_amt' } ,
                      { name : 'f_new_net_cost' } ,
                  ]
              } ) ;
      } ,
      selectProductBilling : function ( record ) {
          var storeSoDtl = Ext.obj.storeSoDtl () ;
          storeSoDtl.setBaseParam ( "mode" , "LISTDATA" ) ;
          // @ts-ignore
          storeSoDtl.setBaseParam ( "id" , Ext.getCmp ( "hdrID" ).getValue () ) ;
          // @ts-ignore
          storeSoDtl.setBaseParam ( "i_parent" , Ext.getCmp ( "i_parentID" ).getValue () ) ;
          /*รายการวางบิล/แจ้งหนี้	สถานะยืนยันรายได้	จำนวนเงิน
           หลังหักส่วนลดการค้า	รวมเงินที่ขอ
           ปรับลดหนี้แล้ว	ยอดหนี้คงเหลือ	จำนวนเงินที่ขอปรับลด	จำนวนเงินที่ถูกต้อง*/
          var gridDtl = {
              xtype : 'grid' ,
              id : 'tabInvoiceDtlGrid' ,
              border : false ,
              stripeRows : true ,
              loadMask : true ,
              //frame : true,
              autoHeight : true ,
              store : storeSoDtl ,
              layout : 'fit' ,
              stateId : 'stateGrid' ,
              viewConfig : {
                  stripeRows : true
              } ,
              refreshSelection : function () {
                  if ( 0 >= this.selectedRecords.length ) {
                      return ;
                  }
                  var newRecordsToSelect = [ ] ;
                  for ( var i = 0 ; i < this.selectedRecords.length ; i ++ ) {
                      record = this.getStore ().getById ( this.selectedRecords[i].getId () ) ;
                      // @ts-ignore
                      if ( ! Ext.isEmpty ( record ) ) {
                          newRecordsToSelect.push ( record ) ;
                      }
                  }
                  this.getSelectionModel ().select ( newRecordsToSelect ) ;
                  this.getView ().focusRow ( newRecordsToSelect[0] ) ;
              } ,
              tbar : [
                  { xtype : 'displayfield' , name : 'disPayAdj' , value : 'ระบุรายการที่จะปรับปรุงหนี้ ยอดเงินของใบแจ้งนี้คงเหลือ ' } ,
                  { xtype : 'displayfield' , name : 'f_receive_all_bill' , id : 'f_receive_all_billID' } ,
                  { xtype : 'hidden' , name : 'f_rec_amt' , id : 'f_rec_amtID' }
              ] ,
              // @ts-ignore
              columns : [ new Ext.grid.RowNumberer ( {
                      width : 35 ,
                      header : " No " ,
                      // @ts-ignore
                      renderer : function ( value , metaData , record , row , col , store , gridView ) {
                          return record.get ( 'no' ) ;
                      }
                  } ) , {
                      header : "ID System" ,
                      sortable : true ,
                      hidden : true ,
                      dataIndex : 'id'

                          /**รายการวางบิล/แจ้งหนี้	สถานะยืนยันรายได้	จำนวนเงิน
                           หลังหักส่วนลดการค้า	รวมเงินที่ขอ
                           ปรับลดหนี้แล้ว	ยอดหนี้คงเหลือ	จำนวนเงินที่ขอปรับลด	จำนวนเงินที่ถูกต้อง*/
                  } , {
                      header : "รายการวางบิล/แจ้งหนี้" ,
                      dataIndex : 'c_name' ,
                      id : 'CproductID'

                  } , {
                      header : "<p>จำนวนเงิน</p>หลังหักส่วนลดการค้า" ,
                      align : 'right' ,
                      dataIndex : 'f_net_disc_comm_amt' ,
                      width : 170
                  } , {
                      header : "<p>รวมเงินที่ขอ</p>ปรับลดหนี้แล้ว" ,
                      align : 'right' ,
                      dataIndex : 'f_total_req' ,
                      width : 180
                  } , {
                      header : "ยอดหนี้คงเหลือ" ,
                      align : 'right' ,
                      dataIndex : 'f_balance' ,
                      width : 130
                  } , {
                      header : "จำนวนเงินที่ขอปรับลด" ,
                      align : 'right' ,
                      dataIndex : 'f_req_amt' ,
                      width : 130
                  } , { //  f_net_disc_comm_amt f_total_req f_balance f_req_amt f_new_net_cost
                      header : "จำนวนเงินที่ถูกต้อง" ,
                      align : 'right' ,
                      dataIndex : 'f_new_net_cost' ,
                      width : 130 ,
                      // @ts-ignore
                      renderer : function ( value , metaData , record , row , col , store , gridView ) {

                          if ( record.get ( 'id' ) === 'grandTotal' ) {

                              // @ts-ignore
                              Ext.getCmp ( 'f_receive_all_billID' ).setValue ( record.get ( 'f_receive_amt' ) ) ;


                          }
                          return value ;
                      }
                  } ] ,
              autoExpandColumn : "CproductID"
          } ;
          var itemsSoDtl = [
              {
                  xtype : 'hidden' ,
                  name : 'mode' ,
                  value : 'ADD' ,
              } , {
                  xtype : 'hidden' ,
                  name : 'ar_bill_invoice_hdr_id' ,
                  // @ts-ignore
                  value : Ext.getCmp ( 'hdrID' ).getValue ()
              } ,
              gridDtl ] ;
          var id = 'invoice_dtlID' ;

          // @ts-ignore
          if ( ! Ext.isEmpty ( ( storeSoDtl.load () ) ) )
              // @ts-ignore
              new Ext.Window (
                  {
                      id : "win-pop-lov" + id ,
                      title : " เลือกรายการปรับปรุงหนี้" ,
                      modal : true ,
                      plain : true ,
                      frame : true ,
                      layout : "fit" ,
                      maximizable : true ,
                      constrainHeader : true ,
                      closable : true ,
                      init : function () {

                      } ,
                      listeners : {
                          // @ts-ignore
                          afterrender : function ( obj , eOpts ) {

                              this.fn = function ( widht , height ) { //percentage
                                  // @ts-ignore
                                  var width = Ext.getBody ().getViewSize ().width * widht ;
                                  // @ts-ignore
                                  var height = Ext.getBody ().getViewSize ().height * height ;
                                  this.setSize ( width , height ) ;
                              } ;
                              this.fn ( .70 , .75 ) ;
                          } ,
                          // @ts-ignore
                          "maximize" : function ( window , opts ) { //when property minimizable
                              // @ts-ignore
                              window.setWidth ( Ext.getBody ().getViewSize ().width * .999 ) ;
                              window.expand ( '' , false ) ;
                              window.center () ;
                          }
                      } ,
                      items : [
                          {
                              xtype : 'form' ,
                              id : 'form-widgets' + id ,
                              url : 'adj/controller/mnAdjDtl001.php' ,
                              items : itemsSoDtl ,
                              autoScroll : true ,
                              buttonAlign : 'left' ,
                              buttons : [
                                  {
                                      text : 'บันทึกรายการ ที่เลือก' ,
                                      id : 'buSaveSubID' ,
                                      iconCls : 'icon-save' ,
                                      handler : function () {
                                          // @ts-ignore
                                          var form = Ext.getCmp ( 'form-widgets' + id ).getForm () ;
                                          if ( form.isValid () ) {// && Ext.obj.getItemsDtl() > 0
                                              form.submit (
                                                  {
                                                      waitMsg : 'Saving Data...' ,
                                                      // @ts-ignore
                                                      success : function ( form , action ) {
                                                          // @ts-ignore
                                                          Ext.Msg.alert ( 'Success' , action.result.msg , function () {

                                                              // 1.Unset value checkbox
                                                              Ext.obj.i_soDtl = 0 ;
                                                              // @ts-ignore
                                                              Ext.default.f_vat_amtID = 4 ;
                                                              // @ts-ignore
                                                              Ext.getCmp ( 'tabBlDtlGrid' ).getStore ().reload () ;
                                                              // @ts-ignore
                                                              Ext.getCmp ( 'tabGridMasterID' ).getStore ().reload () ; // reload grid & store
                                                              // @ts-ignore
                                                              Ext.getCmp ( "win-pop-lov" + id ).destroy () ;
                                                              return true ;
                                                          } ) ;
                                                      } ,
                                                      // @ts-ignore
                                                      failure : function ( form , action ) {
                                                          switch ( action.failureType ) {

                                                              // @ts-ignore
                                                              case Ext.form.Action.CLIENT_INVALID:

                                                                  // @ts-ignore
                                                                  Ext.Msg.alert ( 'Failure' , 'Form fields may not be submitted with invalid values' ) ;
                                                                  break ;
                                                                  // @ts-ignore
                                                              case Ext.form.Action.CONNECT_FAILURE:

                                                                  // @ts-ignore
                                                                  Ext.Msg.alert ( 'Failure' , 'พลข้อผิดพลาดในการเชื่อต่อเครือข่าย' ) ;
                                                                  break ;
                                                                  // @ts-ignore
                                                              case Ext.form.Action.SERVER_INVALID:

                                                                  // @ts-ignore
                                                                  Ext.Msg.alert ( 'Failure' , action.result.msg ) ;
                                                          }
                                                      }
                                                  } ) ;
                                          }
                                      }
                                  } , {

                                      // @ts-ignore
                                      text : Ext.GLOBAL_BU_BACK_TH ,
                                      handler : function () {

                                          // @ts-ignore
                                          Ext.getCmp ( "win-pop-lov" + id ).destroy () ;
                                      }
                                  } ] ,
                              //buttons
                          } ]
                          //items
                  } ).show () ;
      } ,
      defaultDate ( typeStartDate ) {
          var day = new Date () ;
          var dd = day.getDate () ;
          var mm = day.getMonth () + 1 ;
          var yy = day.getFullYear () + 543 ;

          if ( typeStartDate == 1 ) // วันที่เริ่ม -1 เดือน
          {
              // @ts-ignore
              dd = "01" ;
              // @ts-ignore
              mm = "0" + mm.toString () ;
          }
          else {
              // @ts-ignore
              dd = "0" + dd.toString () ;
              // @ts-ignore
              mm = "0" + mm.toString () ;
          }
          // @ts-ignore
          return dd.substr ( - 2 ) + "-" + mm.substr ( - 2 ) + "-" + yy.toString () ;
      }
  } ) ;
// @ts-ignore
  Ext.store = new Ext.data.JsonStore (
      {
          storeId : 'myStore' ,
          autoDestroy : true ,
          // @ts-ignore
          proxy : new Ext.data.HttpProxy (
              {
                  url : Ext.obj.DAOMain , //
                  timeout : 1200000 ,
                  method : 'POST'
              } ) ,
          root : 'data' ,
          baseParams : {
              // @ts-ignore
              i_read : user_right_read
          } ,
          //Permission i_read
          idProperty : 'id' ,
          totalProperty : 'totalCount' ,
          //sortInfo:{I field: 'd_doc_date', direction: 'DESC'},
          // vat_rate ,tax_rate ,dc_tax_id_vat ,dc_tax_id_tax
          fields : [
              { name : 'no' } ,
              { name : 'delID' } ,
              { name : 'editID' } ,
              { name : 'cancelID' } ,
              { name : 'id' } ,
              { name : 'dc_cnt_id' } ,
              { name : 'ar_so_hdr_id' } ,
              { name : 'i_parent' } ,
              { name : 'c_area_ref_doc' } ,
              { name : 'txt_status' } ,

              { name : 'd_request_adjust_date' } ,
              { name : 'c_area_code' } ,
              { name : 'c_area_print' } ,
              { name : 'so_code' } ,
              { name : 'txtar_so_hdr_idID' } ,
              { name : 'c_cnt_name' } ,

              { name : 'f_net_cost_amt' } ,
              { name : 'f_new_net_cost' } ,
              { name : 'f_req_amt' } ,
              { name : 'f_vat_amt' } ,
              { name : 'f_net_cost_add_vat_amt' } ,
              { name : 'vat_rate' } ,
              { name : 'tax_rate' } ,
              { name : 'f_tax_amt' } ,

              { name : 'txtdc_cnt_idID' , type : 'string' } ,
              { name : 'dc_cnt_type_name' , type : 'string' } ,
              { name : 'c_tax_value' , type : 'string' } ,
              { name : 'c_address' , type : 'string' } ,
              { name : 'c_telephone' , type : 'string' } ,
              { name : 'c_mobile' , type : 'string' } ,
              { name : 'c_fax' , type : 'string' } ,

              { name : 'c_so_no' , type : 'string' } ,
              { name : 'c_po_no' , type : 'string' } ,
              { name : 'c_contract_no' , type : 'string' } ,
              { name : 'dc_comm_name' , type : 'string' } ,
              { name : 'd_so_date' } ,

              { name : 'txtar_bill_invoice_hdr_idID' } ,
              { name : 'bl_code' , type : 'string' } ,
              { name : 'd_billing_date' } ,
              { name : 'f_total_cost_amt1' } ,
              { name : 'f_disc_com_amt1' } ,
              { name : 'f_net_disc_comm_amt1' } ,
              { name : 'f_net_cost_amt1' } ,
              { name : 'f_vat_amt1' } ,
              { name : 'f_net_cost_add_vat_amt1' } ,
              { name : 'f_disc_cash_amt1' } ,
              { name : 'dc_comment_dec_id' } ,
              { name : 'c_comment' , type : 'string' } ,
              { name : 'c_comment2' , type : 'string' } ]
      } ) ;
// @ts-ignore
  Ext.storeDtl = new Ext.data.JsonStore (
      {
          storeId : 'myStoreDtl' ,
          // @ts-ignore
          proxy : new Ext.data.HttpProxy (
              {
                  url : Ext.obj.DAODetail ,
                  timeout : 90000 ,
              } ) ,
          baseParams : { mode : 'LISTDATA' } ,
          root : 'data' ,
          idProperty : 'id' ,
          totalProperty : 'totalCount' ,
          //sortInfo:{ field: 'i_seq', direction: 'ASC'},
          fields : [
              {
                  name : 'no'
              } , {
                  name : 'id'
              } , {
                  name : 'ar_so_hdr_id'
              } , {
                  name : 'ar_so_dtl_id'
              } , {
                  name : 'soBill' ,
                  type : 'int'
              } , {
                  name : 'billing'
              } , {
                  name : 'soDtlID'
              } , {
                  name : 'soDtlEditID'
              } , {
                  name : 'ap_po_hdr_id'
              } , {
                  name : 'f_wht_amt'
              } , {
                  name : 'f_net_disc_comm_amt'
              } , {
                  name : 'f_vat_amt'
              } , //ยอดรวม vat
              {
                  name : 'f_net_vat_amt'
              } , //ยอดรวมทั้งหมดบวก vat f_net_disc_comm_amt+f_vat_amt
              {
                  name : 'dc_product_id' ,
                  type : 'int'
              } , {
                  name : 'txtdc_product_idID' ,
                  type : 'string'
              } , {
                  name : 'c_code' ,
                  type : 'string'
              } , {
                  name : 'c_name' ,
                  type : 'string'
              } , {
                  name : 'c_comment' ,
                  type : 'string'
              } , {
                  name : 'i_enabled' ,
                  type : 'int'
              } , {
                  name : 'i_is_jingle'
              } , {
                  name : 'i_seq' ,
                  type : 'int'
              } , {
                  name : 'c_type'
              } , {
                  name : 'f_quan'
              } , {
                  name : 'f_total_cost'
              } , {
                  name : 'f_disc_com_amt'
              } , {
                  name : 'f_disc_com'
              } , {
                  name : 'f_disc_cash_amt_bal'
              } , {
                  name : 'f_disc_cash'
              } , {
                  name : 'f_disc_cash_amt'
              } , {
                  name : 'f_net_cost'
              } ]
      } ) ;
// @ts-ignore
  Ext.storeDtled = new Ext.data.JsonStore (
      {
          storeId : 'myStoreBlDtl' ,
          // @ts-ignore
          proxy : new Ext.data.HttpProxy (
              {
                  url : Ext.obj.DAODetailed ,
                  timeout : 90000 ,
              } ) ,
          //baseParams: { mn:'editso', },
          root : 'data' ,
          idProperty : 'id' ,
          totalProperty : 'totalCount' ,
          //sortInfo:{ field: 'i_seq', direction: 'ASC'},
          fields : [
              { name : 'no' } ,
              { name : 'id' } ,
              { name : 'DelDtlID' } ,
              { name : 'ar_bill_invoice_hdr_id' } ,
              { name : 'ar_so_dtl_id' } ,
              { name : 'c_name' } ,
              { name : 'onair_date' } ,
              { name : 'f_net_disc_comm_amt' } ,
              { name : 'pre_f_req_amt' } ,
              { name : 'f_req_amt' } ,
              { name : 'f_req_total_amt' } ,
              { name : 'f_new_net_cost' } ,
              { name : 'f_req_total_amt' } ,

              /*sum_f_net_cost_add_vat_amt: "200.00"
               sum_f_net_cost_amt: "40000.00"
               sum_f_new_net_cost: "39800.00"
               sum_f_req_amt: "200.00"
               sum_f_tax_amt: "4.000000"
               sum_f_vat_amt: ".00"
               sum_tax_rate: "2.00"
               sum_vat_rate: null*/
              { name : 'sum_f_net_cost_add_vat_amt' } ,
              { name : 'sum_f_net_cost_amt' } ,
              { name : 'sum_f_new_net_cost' } ,
              { name : 'sum_f_req_amt' } ,
              { name : 'sum_f_tax_amt' } ,
              { name : 'sum_f_vat_amt' } ,
              { name : 'sum_tax_rate' } ,
              { name : 'sum_vat_rate' }
          ]
      } ) ;
// @ts-ignore
  Ext.commentDecStore = new Ext.data.JsonStore (
      {
          autoLoad : true ,
          storeId : 'myStoreDc_comment_dec' ,
          url : './api/dc/DAO/ListDc_comment_dec.php' ,
          baseParams : {
              type : 'vatStore'
          } ,
          root : 'data' ,
          idProperty : 'id' ,
          totalProperty : 'totalCount' ,
          fields : [ 'id' , 'c_code' , 'c_name' ]
      } ) ;
  function deRemove ( id , statusBu ) {

      //1 noAction 2 cancel, 3 remove
      //    Ext.obj.setLog(statusBu === 'del' ? 4 : 5); //del or remove
      var txt = ( statusBu === 'del' ) ? 'ลบข้อมูล' : 'ยกเลิกรายการใช้งาน' ;
      // @ts-ignore
      var win = new Ext.Window (
          {
              id : "win-msg-delete-master-sub" ,
              title : "" + txt ,
              modal : true ,
              width : 250 ,
              height : 130 ,
              loadMask : true ,
              html : "ท่านต้องการที่จะ [" + txt + "] ข้อมูล ?" ,
              buttons : [
                  {
                      text : "Confirm" ,
                      handler : function () {
                          // @ts-ignore
                          Ext.showLoadingMask () ;
                          // @ts-ignore
                          Ext.Ajax.request (
                              {
                                  url : './adj/controller/mnAdj001.php' ,
                                  params : {
                                      mode : 'DELETE' ,
                                      statusBu : statusBu ,
                                      id : id
                                  } ,
                                  method : 'POST' ,
                                  //POST
                                  // @ts-ignore
                                  success : function ( result , request ) {

                                      // @ts-ignore
                                      var jsonData = Ext.util.JSON.decode ( result.responseText ) ; //decode json
                                      if ( jsonData.success ) {

                                          if ( jsonData.data.invalid )
                                              // @ts-ignore
                                              Ext.MessageBox.alert ( 'Warnning' , jsonData.msg ) ;
                                          else
                                              // @ts-ignore
                                              Ext.MessageBox.alert ( 'Success' , jsonData.msg , function () {
                                                  //before add tab remove
                                                  // @ts-ignore
                                                  Ext.getCmp ( 'contenterCenter' ).remove ( Ext.getCmp ( 'frm-adj-hdrID' ) , true ) || { } ; //null obj not errer
                                                  // @ts-ignore
                                                  Ext.getCmp ( 'contenterCenter' ).remove ( Ext.getCmp ( 'frm-adj-dtlID' ) , true ) || { } ; //null obj not errer
                                              } ) ; // alert massage success
                                      }
                                      else {

                                          // @ts-ignore
                                          Ext.MessageBox.alert ( 'Failed' , jsonData.msg ) ; // alert massage error
                                      }

                                      // @ts-ignore
                                      Ext.getCmp ( "win-msg-delete-master-sub" ).destroy () ; // clear memory :: garbage collection
                                      Ext.store.reload () ; // reload grid & store
                                  } ,
                                  // @ts-ignore
                                  failure : function ( result , request ) {

                                      // @ts-ignore
                                      Ext.MessageBox.alert ( 'Failed' , result.responseText ) ; // connect error
                                  }
                              } ) ;
                      }
                  } , {
                      text : "Cancel" ,
                      handler : function () {

                          // @ts-ignore
                          Ext.getCmp ( "win-msg-delete-master-sub" ).destroy () ;
                      }
                  } ]
          } ) ;
      if ( statusBu === 1 )
          // @ts-ignore
          Ext.MessageBox.alert ( 'Warnning' , "ปิดการวางบิลรับเงินแล้ว " ) ;
      else if ( statusBu === 2 )
          // @ts-ignore
          Ext.MessageBox.alert ( 'Warnning' , "ใบวางบิลถูกผูกกับรายการปรับปรุงหนี้แล้ว " ) ;
      else if ( statusBu === 'cancel' || statusBu === 'del' || statusBu === 'enabled' )
          win.show () ;
  }

//-------------FROM PRINT----------
  function frmPrePrint () {
      // @ts-ignore
      frmPrePrint.superclass.constructor.call ( this , {
          listeners : {
              // @ts-ignore
              afterrender : function ( obj , eOpts ) { }
          } ,
          id : 'frm-Add3' ,
          url : 'api/imc0003_mn.php' ,
          frame : true ,
          autoScroll : true ,
          loadMask : true ,
          closable : true ,
          labelWidth : 1 ,
          bodyStyle : false ,
          items : [
              {
                  xtype : 'hidden' ,
                  name : 'mode' ,
                  value : 'GENCODE_IVC' ,
              } , {
                  xtype : 'hidden' ,
                  name : 'type' ,
                  value : 'print_json'
              } , {
                  xtype : 'hidden' ,
                  name : 'pj_hdr_id' ,
                  // @ts-ignore
                  value : Ext.getField.pj_hdr_id
              } , {
                  xtype : 'hidden' ,
                  name : 'pj_invoice_hdr_id' ,
                  // @ts-ignore
                  value : Ext.getField.id
              } , {
                  xtype : 'compositefield' ,
                  msgTarget : 'side' ,
                  items : [
                      {
                          xtype : 'textfield' ,
                          style : {
                              width : '100%' ,
                              fontWeight : 'bold' ,
                              paddingLeft : '40%' ,
                              paddingRight : 'auto' ,
                              marginBottom : '100px'
                          } ,
                          readOnly : true ,
                          cls : 'frm-hidden' ,
                          name : 'c_business' ,
                          value : 'บริษัท อสมท จำกัด (มหาชน)'
                      }

                  ]

              } , {
                  xtype : 'compositefield' ,
                  msgTarget : 'side' ,
                  items : [
                      {
                          xtype : 'displayfield' ,
                          name : 'lblcnt' ,
                          value : 'ลูกค้า'
                      } , // c_name_inv i_is_show_txt_dtl
                      {
                          xtype : 'textfield' ,
                          style : {
                              width : '42%' ,
                              marginBottom : '10px'
                          } ,
                          readOnly : true ,
                          cls : 'frm-hidden' ,
                          name : 'c_name_inv' ,
                      } , {
                          xtype : 'displayfield' ,
                          anchor : '-50' ,
                          name : 'lbladress' ,
                          value : 'ที่อยู่'
                      } , {
                          xtype : 'textarea' ,
                          readOnly : true ,
                          cls : 'frm-hidden' ,
                          name : 'c_address_inv' ,
                      } ]
              } , {
                  xtype : 'compositefield' ,
                  msgTarget : 'side' ,
                  anchor : '-50' ,
                  items : [
                      {
                          xtype : 'displayfield' ,
                          name : 'lbldate' ,
                          value : 'วันที่'
                      } , {
                          xtype : 'textfield' ,
                          style : {
                              width : '45%' ,
                              marginBottom : '10px'
                          } ,
                          readOnly : true ,
                          cls : 'frm-hidden' ,
                          name : 'd_billing_date' ,
                      } , {
                          xtype : 'displayfield' ,
                          name : 'lblc_area_code' ,
                          value : 'เลขที่'
                      } , {
                          xtype : 'textfield' ,
                          readOnly : true ,
                          cls : 'frm-hidden' ,
                          name : 'c_area_code' ,
                      } ]

              } , {
                  xtype : 'compositefield' ,
                  msgTarget : 'side' ,
                  anchor : '-50' ,
                  items : [

                      {
                          xtype : 'displayfield' ,
                          name : 'lblc_code' ,
                          value : 'เลขที่ Order'
                      } , {
                          xtype : 'textfield' ,
                          readOnly : true ,
                          cls : 'frm-hidden' ,
                          name : 'c_code' ,
                      } , ]
              } , {
                  xtype : 'compositefield' ,
                  msgTarget : 'side' ,
                  items : [
                      {
                          xtype : 'displayfield' ,
                          name : 'lblcontact_no' ,
                          value : 'เลขที่สัญญา  '
                      } , {
                          xtype : 'textfield' ,
                          style : {
                              width : '38%' ,
                              marginBottom : '10px'
                          } ,
                          readOnly : true ,
                          cls : 'frm-hidden' ,
                          name : 'c_contract_no' ,
                      } , {
                          xtype : 'displayfield' ,
                          name : 'lbld_doc_date' ,
                          value : 'ลงวันที่'
                      } , {
                          xtype : 'textfield' ,
                          cls : 'frm-hidden' ,
                          name : 'd_doc_date' ,
                      } , ]
              } ,
              // @ts-ignore
              gridDetailPrint ()
                  /*, {
                   html: "<hr>",
                   style: 'display: block;margin-top: 0.5em; margin-bottom: 0.5em; margin-left: auto; margin-right: auto; border-style: hidden;'
                   }*/
          ] ,
      } ) ;
  }
//FORM SERACH
  function frmSearchMainGrid () {
      // @ts-ignore
      frmSearchMainGrid.superclass.constructor.call ( this , {
          initComponent : function () {
              // @ts-ignore
              frmSearchMainGrid.superclass.initComponent.call ( this ) ;
              this.fn ( this ) ;
          } ,
          listeners : {
              afterrender : function () {

              }
          } ,
          fn : function () { } ,
          id : 'frm-grid-searchID' ,
          frame : true ,
          bodyStyle : "padding:2px" ,
          autoHeight : true ,
          width : 600 ,
          labelWidth : 130 ,
          defaults : {
              anchor : '0' ,
          } ,
          items : [
              {
                  xtype : 'compositefield' ,
                  fieldLabel : 'คำที่ค้นหา' ,
                  msgTarget : 'side' ,
                  anchor : '-10' ,
                  defaults : {
                      flex : 1
                  } ,
                  items : [
                      {
                          xtype : 'textfield' ,
                          id : 'val-ID' ,
                          name : 'value'
                      } , {
                          xtype : 'combo' ,
                          id : 'filter-ID' ,
                          // @ts-ignore
                          store : new Ext.data.SimpleStore (
                              {
                                  fields : [ "id" , "c_name" ] ,
                                  data : [
                                      [ 'b.c_area_ref_doc' , "เลขที่ใบขอปรับปรุงหนี้" ] ,
                                      [ 'b.c_area_code' , "เลขที่ใบวางบิล" ] ,
                                      [ 'b.c_area_print' , "เลขที่พิมพ์ใบวางบิล" ] , //dc_area_id
                                      [ 's.c_code' , "เลขที่ Order" ] ,
                                      [ 'c.c_billing_name' , "ชื่อลูกค้า" ]
                                  ] //c_area_ref_doc txt_is_status so_code c_billing_name d_request_adjust_date
                              } ) ,

                          value : 'b.c_area_ref_doc' ,
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

                              // @ts-ignore
                              select : function ( combo , record , index ) {

                                  // @ts-ignore
                                  var newValue = record.data.id ;
                              }
                          }
                      } ]
              } , {
                  xtype : 'compositefield' ,
                  fieldLabel : '&nbsp;&nbsp;ระหว่างวันที่ขอปรับปรุงหนี้' ,
                  msgTarget : 'side' ,
                  items : [ {
                          xtype : 'datefield' ,
                          name : 'startDate' ,
                          id : 'startDateID' ,
                          value : Ext.obj.defaultDate ( 1 )
                      } , {
                          xtype : 'datefield' ,
                          name : 'endDate' ,
                          id : 'endDateID' ,
                          value : Ext.obj.defaultDate ( 2 )
                      } ]
              } , {
                  xtype : 'compositefield' ,
                  fieldLabel : 'สถานะของรายการ' ,
                  msgTarget : 'side' ,
                  anchor : '-10' ,
                  defaults : {
                      flex : 1
                  } ,
                  items : [
                      {
                          xtype : 'combo' ,
                          id : 'i_is_bill_completeID' ,
                          // @ts-ignore
                          store : new Ext.data.SimpleStore (
                              {
                                  fields : [ "id" , "c_name" ] ,
                                  data : [
                                      [ '-1' , "เลือกทั้งหมด" ] ,
                                      [ 'AR' , "ยังไม่พิมพ์ใบวางบิล" ] ,
                                      [ 'BL' , "พิมพ์ใบวางบิลแล้ว" ]
                                  ] ,
                              } ) ,
                          value : '-1' ,
                          valueField : 'id' ,
                          displayField : 'c_name' ,
                          submitValue : true ,
                          hiddenName : 'status_print' ,
                          mode : "local" ,
                          triggerAction : "all" ,
                          forceSelection : true ,
                          selectOnFocus : true ,
                          editable : false ,
                          listeners : {

                              // @ts-ignore
                              select : function ( combo , record , index ) {

                                  // @ts-ignore
                                  var newValue = record.data.id ;
                              }
                          }
                      } , {
                          xtype : 'combo' ,
                          id : 'enabled-ID' ,
                          // @ts-ignore
                          store : new Ext.data.JsonStore (
                              {
                                  fields : [
                                      {
                                          name : 'id'
                                      } , {
                                          name : 'c_name'
                                      } ] ,
                                  data : [
                                      {
                                          id : '-1' ,
                                          c_name : 'ทั้งหมด'
                                      } , {
                                          id : '1' ,
                                          c_name : 'ใช้งาน'
                                      } , {
                                          id : '2' ,
                                          c_name : 'ไม่ใช้งาน'
                                      } ]
                              } ) ,
                          value : '-1' ,
                          valueField : 'id' ,
                          displayField : 'c_name' ,
                          submitValue : true ,
                          hiddenName : 'i_enabled' ,
                          mode : "local" ,
                          triggerAction : "all" ,
                          forceSelection : true ,
                          selectOnFocus : true ,
                          editable : false ,
                          listeners : {
                              // @ts-ignore
                              select : function ( combo , record , index ) {

                                  // @ts-ignore
                                  var newValue = record.data.id ;
                              }
                          }
                      } ]
              } ] ,
          buttonAlign : 'left' ,

          buttons : [
              {
                  text : 'เพิ่มคำร้องปรับปรุงหนี' ,
                  id : 'buView' ,
                  iconCls : 'icon-add' ,
                  handler : function () {
                      Ext.obj.controllTabAdj ( { } , 'add' ) ; //controllTabAdj
                  }

              } , {
                  xtype : 'tbfill'
              } , {
                  text : 'ค้นหา' ,
                  iconCls : 'icon-magnifier' ,
                  handler : function () {

                      Ext.store.setBaseParam ( "mode" , "SEARCH" ) ;
                      // @ts-ignore
                      Ext.store.setBaseParam ( "filter" , Ext.getCmp ( "filter-ID" ).getValue () ) ;
                      // @ts-ignore
                      Ext.store.setBaseParam ( "value" , Ext.getCmp ( "val-ID" ).getValue () ) ;
                      // @ts-ignore
                      Ext.store.setBaseParam ( "i_is_bill_complete" , Ext.getCmp ( "i_is_bill_completeID" ).getValue () ) ;
                      // @ts-ignore
                      Ext.store.setBaseParam ( "startDate" , Ext.getCmp ( "startDateID" ).getValue () ) ;
                      // @ts-ignore
                      Ext.store.setBaseParam ( "endDate" , Ext.getCmp ( "endDateID" ).getValue () ) ;
                      // @ts-ignore
                      Ext.getCmp ( 'tabGridMasterID' ).getStore ().load () ;
                  }
              } , {
                  text : 'เริ่มใหม' ,
                  iconCls : 'icon-reset' , //iconfinder_POWER - RESTART_16946.png
                  handler : function () {
                      // @ts-ignore
                      Ext.getCmp ( 'frm-grid-searchID' ).getForm ().reset () ;
                  }
              } ]
      } ) ;
  }
//TAB GRID&SUMARY DTL VAT TO HDR Ext.setSummary(record)

  Ext.setSummary = function ( record , caseID_check ) {

      // @ts-ignore
      var caseID_check = parseInt ( caseID_check ) ;
//    console.log(caseID_check);
      if ( caseID_check !== 1 ) {
          // @ts-ignore
          Ext.getCmp ( 'f_tax_amtID' ).setValue ( record.get ( 'sum_f_tax_amt' ) ) ;
          // @ts-ignore
          Ext.getCmp ( 'tax_rateID' ).setValue ( record.get ( 'sum_tax_rate' ) ) ;
          // @ts-ignore
          Ext.getCmp ( 'f_net_cost_add_vat_amtID' ).setValue ( record.get ( 'sum_f_net_cost_add_vat_amt' ) ) ;
          // @ts-ignore
          Ext.getCmp ( 'f_vat_amtID' ).setValue ( record.get ( 'sum_f_vat_amt' ) ) ;
          // @ts-ignore
          Ext.getCmp ( 'vat_rateID' ).setValue ( record.get ( 'sum_vat_rate' ) ) ;
          // @ts-ignore
          Ext.getCmp ( 'f_req_amtID' ).setValue ( record.get ( 'sum_f_req_amt' ) ) ;
//        console.log('in case');
      }
      else {
//        console.log('none case');
      }
      Ext.obj.statusBuGenCode () ;
  } ;
  function frmAddAdjDtl ( i ) // BL DTL (i) แสดงข้อมูลอย่างเดียว
  {
      var buSelectPro = ( i ) ? [ ] : [
          {
              xtype : 'button' ,
              text : 'ระบุรายการปรับปรุงหนี้' ,
              id : 'buAddSubDtlID' ,
              handler : function () {
                  // @ts-ignore
                  Ext.Ajax.request (
                      {
                          url : Ext.obj.DAOGetRemain ,
                          params : {
                              mode : 'GETREMAIN' ,
                              // @ts-ignore
                              i_parent : Ext.getCmp ( "i_parentID" ).getValue ()
                          } ,
                          method : 'POST' ,
                          //POST
                          // @ts-ignore
                          success : function ( result , request ) {

                              // @ts-ignore
                              var jsonData = Ext.util.JSON.decode ( result.responseText ) ; //decode json
                              if ( jsonData.success ) {
                                  if ( jsonData.data.invalid )
                                      // @ts-ignore
                                      Ext.MessageBox.alert ( 'Warnning' , jsonData.msg ) ;
                                  else {
                                      Ext.obj.selectProductBilling () ; // show form
                                      // @ts-ignore
                                      Ext.getCmp ( "f_receive_all_billID" ).setValue ( jsonData.data.txt_remain ) ;
                                      // @ts-ignore
                                      Ext.getCmp ( "f_rec_amtID" ).setValue ( jsonData.data.f_remain ) ;
                                  }

                              }
                              else {
                                  // @ts-ignore
                                  Ext.MessageBox.alert ( 'Failed' , jsonData.msg ) ; // alert massage error
                              }
                          } ,
                          // @ts-ignore
                          failure : function ( result , request ) {
                              // @ts-ignore
                              Ext.MessageBox.alert ( 'Failed' , result.responseText ) ; // connect error
                          }
                      } ) ;
              }
          } ] ;
      var columnDelete = ( ! i ) ? {
          id : 'removePro' ,
          align : 'center' ,
          header : "ลบ " ,
          width : 50 ,
          dataIndex : 'DelDtlID' ,
          // @ts-ignore
          renderer : function ( value , metaData , record , row , col , store , gridView ) {
              return ( record.get ( 'id' ) === 'grandTotal' ) ? '' : value ;
          }
      } : {
          id : 'disabledID' ,
          align : 'center' ,
          header : "ลบ " ,
          width : 50 ,
          dataIndex : 'DelDtlID' ,
          // @ts-ignore
          renderer : function ( value , metaData , record , row , col , store , gridView ) {
              return '-' ;
          }
      } ;

      // @ts-ignore
      var dyColumn = [ new Ext.grid.RowNumberer (
              {
                  width : 35 ,
                  header : " No " ,
                  // @ts-ignore
                  renderer : function ( value , metaData , record , row , col , store , gridView ) {
                      if ( record.get ( 'id' ) === "grandTotal" ) {
                          // @ts-ignore
                          Ext.setSummary ( record , Ext.default.f_vat_amtID ) ;
                      }

                      return record.get ( 'no' ) ;
                  }
              } ) , {
              header : "ID System" ,
              sortable : true ,
              hidden : true ,
              dataIndex : 'id'
          } ,
          columnDelete , {
              header : "รายการวางบิล/แจ้งหนี้ " ,
              width : 210 ,
              dataIndex : 'c_name'
          } , {
              header : "เดือน/ปี ที่ออกอากาศ" ,
              align : 'right' ,
              width : 70 ,
              dataIndex : 'onair_date'
          } , {
              header : "จำนวนเงินหลังหักส่วนลดการค้า" ,
              align : 'right' ,
              dataIndex : 'f_net_disc_comm_amt'
          } , {
              header : "จำนวนเงินที่ขอปรับลดก่อนหน้านี้" ,
              align : 'right' ,
              dataIndex : 'pre_f_req_amt'
          } , {
              header : "จำนวนเงินที่ขอปรับลดในครั้งนี้" ,
              align : 'right' ,
              dataIndex : 'f_req_amt'
          } , {
              header : "จำนวนเงินที่ขอปรับลดหนี้ทั้งหมด" ,
              align : 'right' ,
              dataIndex : 'f_req_total_amt'
          } , {
              header : "จำนวนเงินที่ถูกต้อง " ,
              align : 'right' ,
              dataIndex : 'f_new_net_cost'
          } ] ;

      //TODO
      var gridDtl2 = {
          xtype : 'grid' ,
          id : 'tabBlDtlGrid' ,
          border : false ,
          stripeRows : true ,
          loadMask : true ,
          frame : true ,
          bodyStyle : "padding:2px" ,
          autoHeight : true ,
          store : Ext.storeDtled ,
          viewConfig : {
              forceFit : true ,
              // @ts-ignore
              getCellCls : function ( value ) {
                  //console.log(value);
              }
          } ,
          columns : dyColumn
      } ;
      // @ts-ignore
      frmAddAdjDtl.superclass.constructor.call ( this , {
          id : 'frm-adj-dtlID' ,
          frame : true ,
          url : Ext.obj.controllerDetail ,
          bodyStyle : "padding:3px" ,
          autoScroll : true ,
          loadMask : true ,
          width : 700 ,
          labelWidth : 145 ,
          defaults : { flex : 1 } ,
          title : 'แก้ไข/เลือกรายการปรับปรุงหนี้' ,
          items : [
              {
                  xtype : 'hidden' ,
                  name : 'id' ,
                  //value: Ext.getCmp('hdrID').getValue(),
              } , {
                  // isEditVatRate
                  // isEditVatRate
                  xtype : 'hidden' ,
                  name : 'isEditVat' ,
                  id : 'isEditVatID' ,
                  value : false
              } , {
                  xtype : 'hidden' ,
                  name : 'mode' ,
                  id : 'modeEditID' ,
                  value : 'GENCODE' ,
              } ,
              buSelectPro , gridDtl2 , //grid
              {
                  html : "<p>&nbsp;</p>" ,
                  style : 'display: block;margin-top: 0.5em; margin-bottom: 0.5em; margin-left: auto; margin-right: auto; border-style: hidden;'
              } , { //
                  xtype : 'hidden' , //displayfield
                  name : 'f_vat_rate' ,
                  // @ts-ignore
                  value : Ext.getCmp ( 'f_vat_rateID' ).getValue ()
              } , {
                  xtype : 'textfield' ,
                  fieldLabel : 'จำนวนเงินที่ขอปรับลด' ,
                  name : 'f_req_amt' ,
                  id : 'f_req_amtID' ,
                  value : 0 ,
                  readOnly : true ,
                  style : {
                      'labelAlign' : 'right' ,
                      'font-weight' : 'bold' ,
                      'padding' : '3px' ,
                      'margin' : '3px' ,
                      'background-color' : '#fff' ,
                      'text-align' : 'right' ,
                      'width' : '200px'
                  }
              } , {
                  xtype : 'textfield' ,
                  fieldLabel : 'อัตราภาษีมูลค่าเพิ่ม' ,
                  name : 'vat_rate' ,
                  id : 'vat_rateID' ,
                  value : 0 ,
                  readOnly : true , style : {
                      'labelAlign' : 'right' ,
                      'font-weight' : 'bold' ,
                      'padding' : '3px' ,
                      'margin' : '3px' ,
                      'background-color' : '#fff' ,
                      'text-align' : 'right' ,
                      'width' : '200px'
                  }
              } , {
                  xtype : 'textfield' ,
                  fieldLabel : 'จำนวนเงินภาษีมูลค่าเพิ่ม' ,
                  name : 'f_vat_amt' ,
                  value : 0 ,
                  id : 'f_vat_amtID' ,
                  readOnly : true , style : {
                      'labelAlign' : 'right' ,
                      'font-weight' : 'bold' ,
                      'padding' : '3px' ,
                      'margin' : '3px' ,
                      'background-color' : '#fff' ,
                      'text-align' : 'right' ,
                      'width' : '200px'
                  }
              } , {
                  xtype : 'textfield' ,
                  fieldLabel : 'จำนวนเงินที่ขอปรับลดรวมภาษีมูลค่าเพิ่ม' ,
                  name : 'f_net_cost_add_vat_amt' ,
                  value : 0 ,
                  id : 'f_net_cost_add_vat_amtID' ,
                  readOnly : true , style : {
                      'labelAlign' : 'right' ,
                      'font-weight' : 'bold' ,
                      'padding' : '3px' ,
                      'margin' : '3px' ,
                      'background-color' : '#fff' ,
                      'text-align' : 'right' ,
                      'width' : '200px'
                  }
              } , {
                  html : "<div>&nbsp;</div>" ,
                  style : 'background:eee !important; display: block;margin-top: 0.5em; margin-bottom: 0.5em; margin-left: auto; margin-right: auto; border-style: hidden;'
              } , {
                  xtype : 'textfield' ,
                  fieldLabel : 'อัตราภาษีหัก ณ ที่จ่าย ' ,
                  name : 'tax_rate' ,
                  value : 0 ,
                  id : 'tax_rateID' ,
                  readOnly : true , style : {
                      'labelAlign' : 'right' ,
                      'font-weight' : 'bold' ,
                      'padding' : '3px' ,
                      'margin' : '3px' ,
                      'background-color' : '#fff' ,
                      'text-align' : 'right' ,
                      'width' : '200px'
                  }
              } , {
                  xtype : 'textfield' ,
                  fieldLabel : 'จำนวนเงินภาษีหัก ณ ที่จ่าย ' ,
                  name : 'f_tax_amt' ,
                  value : 0 ,
                  id : 'f_tax_amtID' ,
                  readOnly : true , style : {
                      'labelAlign' : 'right' ,
                      'font-weight' : 'bold' ,
                      'padding' : '3px' ,
                      'margin' : '3px' ,
                      'background-color' : '#fff' ,
                      'text-align' : 'right' ,
                      'width' : '200px'
                  }
              } ] ,
          buttonAlign : 'left' ,
          listeners : {
              beforerender : function () {
                  // @ts-ignore
                  Ext.showLoadingMask () ;
              } ,
              afterrender : function () {
                  //                var f_vat_amt = Ext.getCmp('f_vat_amtID').getValue();
                  //                var f_vat_dtl = Ext.getCmp('f_vat_dtlID').getValue();
                  //                if (f_vat_amt))
                  //                    Ext.getmp('f_vat_amtID').setValue(0);
                  //                if (Ext.isEmpt(f_vat_dtl))
                  //                    Ext.getmp('f_vat_dtlID').setValue(0);
              }

          } ,
          buttons : [
              {
                  text : ' ออกเลข ADJXX' ,
                  id : 'buGenCodeID' ,
                  iconCls : 'icon-save' ,
                  listeners : {
                      afterrender : function () {
                          // console.log(Ext.isEdit('f_vat_amtID', true));
                      } //afterrender
                  } ,
                  handler : function () {

//                     var isEdit = Ext.glob.isEdit('f_vat_amtID'); //  true fals
//                     isEditVatID
//                     console.log("isEdit ::: ");
//                     console.log(isEdit);
//                     if (isEdit)
//                     Ext.getCmp('isEditVatID').setValue(true);

                      // @ts-ignore
                      var form = Ext.getCmp ( 'frm-adj-dtlID' ).getForm () ;
                      //                    Ext.obj.setLog(8);

                      form.submit (
                          {
                              waitMsg : 'Saving Data...' ,
                              // @ts-ignore
                              success : function ( form , action ) {
                                  if ( action.result.c_code != '' )
                                      // @ts-ignore
                                      Ext.Msg.alert ( 'Success' , action.result.c_code , function () {
                                          // @ts-ignore
                                          Ext.getCmp ( 'contenterCenter' ).remove ( Ext.getCmp ( 'frm-adj-hdrID' ) , true ) || { } ; //null obj not errer
                                          // @ts-ignore
                                          Ext.getCmp ( 'contenterCenter' ).remove ( Ext.getCmp ( 'frm-adj-dtlID' ) , true ) || { } ; //null obj not errer
                                          Ext.store.reload () ;
                                      } ) ;
                                  else // update f_vat_amt 0.02
                                      // @ts-ignore
                                      Ext.Msg.alert ( 'Success' , 'บันทีกรายการเรียบร้อย' , function () {
                                          // @ts-ignore
                                          Ext.getCmp ( 'contenterCenter' ).remove ( Ext.getCmp ( 'frm-adj-hdrID' ) , true ) || { } ; //null obj not errer
                                          // @ts-ignore
                                          Ext.getCmp ( 'contenterCenter' ).remove ( Ext.getCmp ( 'frm-adj-dtlID' ) , true ) || { } ; //null obj not errer
                                          Ext.store.reload () ;
                                      } ) ;
                              } ,
                              // @ts-ignore
                              failure : function ( form , action ) {
                                  switch ( action.failureType ) {

                                      // @ts-ignore
                                      case Ext.form.Action.CLIENT_INVALID:

                                          // @ts-ignore
                                          Ext.Msg.alert ( 'Failure' , 'Form fields may not be submitted with invalid values' ) ;
                                          break ;
                                          // @ts-ignore
                                      case Ext.form.Action.CONNECT_FAILURE:

                                          // @ts-ignore
                                          Ext.Msg.alert ( 'Failure' , 'พลข้อผิดพลาดในการเชื่อต่อเครือข่าย' ) ;
                                          break ;
                                          // @ts-ignore
                                      case Ext.form.Action.SERVER_INVALID:

                                          // @ts-ignore
                                          Ext.Msg.alert ( 'Failure' , action.result.msg ) ;
                                  }
                              }
                          } ) ;
                  }
              } ]

      } ) ;
  }
//CHECK SELECT SO DTL TO BL DTL
  function getChk ( obj ) {
      if ( obj.checked )
          Ext.obj.i_soDtl ++ ;
      else
          Ext.obj.i_soDtl -- ;
  }

//List Cal

// ON MCOT OLD

  function split_comma ( strNum ) {
      while ( strNum.search ( ',' ) != - 1 ) {
          strNum = strNum.replace ( ',' , '' ) ;
      }
      return  strNum ;
  }

// @ts-ignore
  Ext.adjCal = function ( f_net_cost , id , obj ) {

      // @ts-ignore
      var f_req_amtID = parseFloat ( split_comma ( Ext.get ( 'f_req_amtID' + id ).dom.value || { } ) ) ;
      // @ts-ignore
      var f_rec_amtID = parseFloat ( split_comma ( Ext.getCmp ( "f_rec_amtID" ).getValue () || { } ) ) ;

      if ( f_req_amtID > f_rec_amtID ) {
          // @ts-ignore
          Ext.Msg.alert ( 'Success' , "ไม่สามารถปรับปรุงหนี้ได้ จำนวนเงินที่ขอปรับปรุงเกินยอดคงเหลือ" , function () {
              // @ts-ignore
              Ext.get ( 'f_req_amtID' + id ).dom.value = 0 ;//f_rec_amtID;
              // @ts-ignore
              Ext.get ( 'f_req_amtID' + id ).dom.focus () ;
              return true ;
          } ) ;
      }
      else if ( f_req_amtID > f_net_cost ) {
          // @ts-ignore
          Ext.Msg.alert ( 'Success' , "ไม่สามารถปรับปรุงหนี้ได้ จำนวนเงินที่ขอปรับปรุงเกินยอดจำนวนที่ถูกต้อง" , function () {
              // @ts-ignore
              Ext.get ( 'f_req_amtID' + id ).dom.value = f_net_cost ;
              // @ts-ignore
              Ext.get ( 'f_req_amtID' + id ).dom.focus () ;
              return true ;
          } ) ;
      }
      else {
          //isTure go
          // @ts-ignore
          var f_bal = parseFloat ( f_net_cost - f_req_amtID ) ;
          // @ts-ignore
          Ext.get ( 'f_new_costID' + id ).dom.value = Ext.floatRenderer ( f_bal ) ;

      }

  } ;

  var adjHdrItems = function () {

      return [ { xtype : 'displayfield' , fieldLabel : 'เลขที่ใบขอปรับปรุงหนี้' , name : 'c_area_ref_doc' , id : 'c_area_codeEditDisID' }
          , { xtype : 'hidden' , name : 'mode' , id : 'modeID' , value : "ADD" }
          , { xtype : 'hidden' , name : 'id' , id : 'hdrID' }
          , { xtype : 'hidden' , name : 'i_adj_rest' , value : 0 }
          , Ext.obj.PopCntForm ().mini
              , {
                  xtype : 'fieldset' ,
                  title : 'ข้อมูลลูกค้า' ,
                  id : 'disPlayCntID' ,
                  layout : 'form' ,
                  defaults : { width : '600px' , xtype : 'displayfield' , style : { overflowY : 'auto' } } ,
                  listeners : {
                      afterrender : function () {
                          // @ts-ignore
                          this.getActive = function ( v ) {
                              // @ts-ignore
                              if ( parseInt ( Ext.getCmp ( 'dc_cnt_idID' ).getValue () ) > 0 )
                                  this.show () ;
                              else
                                  this.hide () ;
                          } ;
                          // @ts-ignore
                          this.getActive ( Ext.getCmp ( 'dc_cnt_idID' ).getValue () ) ;
                      }
                  } ,
                  // dc_cnt_type_name, c_tax_value c_address  c_telephone c_mobile, c_fax
                  items : [ {
                          fieldLabel : 'ประเภทลูกค้า ' , name : 'dc_cnt_type_name'
                      } , {
                          fieldLabel : 'เลขประจำตัวผู้เสียภาษีอากร ' , name : 'c_tax_value'
                      } , {
                          fieldLabel : 'ที่อยู่	' , name : 'c_address'
                      } , {
                          fieldLabel : 'โทรศัพท์ ' , name : 'c_telephone'
                      } , {
                          fieldLabel : 'โทรศัพท์เคลื่อนที่ ' , name : 'c_mobile'
                      } , {
                          fieldLabel : 'โทรสาร ' , name : 'c_fax'
                      } ] }
          , Ext.obj.PopSoForm ().mini
              , {
                  xtype : 'fieldset' ,
                  title : 'ข้อมูลใบสั่งโฆษณา (Order)' ,
                  id : 'disPlaySoID' ,
                  layout : 'form' ,
                  defaults : { width : '600px' , xtype : 'displayfield' , style : { overflowY : 'auto' } } ,
                  listeners : {
                      afterrender : function () {
                          // @ts-ignore
                          this.getActive = function ( v ) {
                              // @ts-ignore
                              if ( parseInt ( Ext.getCmp ( 'ar_so_hdr_idID' ).getValue () ) > 0 )
                                  this.show () ;
                              else
                                  this.hide () ;
                          } ;
                          // @ts-ignore
                          this.getActive ( Ext.getCmp ( 'ar_so_hdr_idID' ).getValue () ) ;
                      }
                  } ,
                  items : [
                      {

                          fieldLabel : 'เลขที่ใบสั่งโฆษณา (Order)' ,
                          name : 'c_so_no'
                      } , {
                          fieldLabel : 'เลขที่ใบสั่งซื้อ/เช่าเวลาจากลูกค้า' ,
                          name : 'c_po_no'
                      } , {

                          fieldLabel : 'ชื่อผู้นำเข้า' ,
                          name : 'dc_comm_name'

                      } , {
                          fieldLabel : 'วันที่ใบสั่งโฆษณา/เช่าเวลา' ,
                          name : 'd_so_date'

                      }

                  ]
              }

          , Ext.obj.PopBlForm ().mini
              , {
                  xtype : 'fieldset' ,
                  title : 'ข้อมูลใบวางบิล/ใบแจ้งหนี้' ,
                  id : 'disPlayBlID' ,
                  layout : 'form' ,
                  defaults : { width : '600px' , xtype : 'displayfield' , style : { overflowY : 'auto' } } ,
                  listeners : {
                      afterrender : function () {
                          // @ts-ignore
                          this.getActive = function ( v ) {
                              // @ts-ignore
                              if ( parseInt ( Ext.getCmp ( 'ar_bill_invoice_hdr_idID' ).getValue () ) > 0 )
                                  this.show () ;
                              else
                                  this.hide () ;
                          } ;
                          // @ts-ignore
                          this.getActive ( Ext.getCmp ( 'ar_bill_invoice_hdr_idID' ).getValue () ) ;
                      }
                  } ,
                  items : [ {
                          fieldLabel : 'เลขที่ใบวางบิล/ใบแจ้งหนี้' ,
                          name : 'bl_code' ,
                      } , {
                          fieldLabel : 'วันที่วางบิล/แจ้งหนี้	' ,
                          name : 'd_billing_date' ,
                      } , {
                          fieldLabel : 'จำนวนเงิน' ,
                          name : 'f_total_cost_amt1' ,
                      } , {
                          fieldLabel : 'ส่วนลดการค้า' ,
                          name : 'f_disc_com_amt1' ,
                      } , {
                          fieldLabel : 'จำนวนเงินหลังหักส่วนลดการค้า' ,
                          name : 'f_net_disc_comm_amt1' ,
                      } , {
                          fieldLabel : 'ส่วนลดล่วงหน้า/ส่วนลดเงินสด' ,
                          name : 'f_disc_cash_amt1' ,
                      } , {
                          fieldLabel : 'จำนวนเงินสุทธิ' ,
                          name : 'f_net_cost_amt1' ,
                      } , {
                          fieldLabel : 'ภาษีมูลค่าเพิ่ม 7.00 %' ,
                          name : 'f_vat_amt1' ,
                      } , {
                          fieldLabel : 'จำนวนเงินรวมภาษีมูลค่าเพิ่ม' ,
                          name : 'f_net_cost_add_vat_amt1' ,
                      } ]
              }
          , { xtype : 'hidden' , id : 'c_commentID' , name : 'c_comment' }
          , {
              xtype : 'datefield'
              , name : 'd_request_adjust_date'
              , value : Ext.obj.defaultDate ( 2 )
              , validator : function ( val ) {
                  // @ts-ignore
                  return Ext.isEmpty ( val ) ? "กรุณาเลือก วันที่ใบสั่งโฆษณา" : true ;
              }
          } , {
              xtype : 'combo' ,
              mode : 'local' ,
              value : 1 ,
              width : 250 ,
              // disabled: dis,
              triggerAction : 'all' ,
              forceSelection : true ,
              editable : false ,
              fieldLabel : 'เหตุผลในการขอปรับปรุงหนี้' ,
              id : 'dc_comment_dec_idID' ,
              name : 'dc_comment_dec_id' ,
              hiddenName : 'dc_comment_dec_id' ,
              displayField : 'c_name' ,
              valueField : 'id' ,
              store : Ext.commentDecStore ,
              listeners : {
                  // @ts-ignore
                  select : function ( cb , rec , ind ) {
                      this.getRate ( rec.json.c_name ) ;
                  } ,
                  afterrender : function () {
                      this.getRate = function ( v ) {
                          // @ts-ignore
                          Ext.getCmp ( 'c_commentID' ).setValue ( v ) ;
                          //console.log(v);
                      } ;
                      this.getRate ( this.getStore ().data.items[0].json.c_name ) ;
                  }
              }
          }
          , { xtype : 'textarea' , width : 500 , fieldLabel : 'หมายเหตุ' , name : 'c_comment2' }
          , { xtype : 'hidden' , name : 'i_parent' , id : 'i_parentID' }
          , { xtype : 'hidden' , id : 'dc_vat_idID' , name : 'dc_tax_id_vat' }
          , { xtype : 'hidden' , id : 'f_vat_rateID' , name : 'dc_tax_id_tax' }
          , { xtype : 'hidden' , id : 'dc_tax_idID' , name : 'vat_rate' }
          , { xtype : 'hidden' , id : 'f_tax_rateID' , name : 'tax_rate' }

      ] ;
  } ;

  function frmAddAdjHdr ( i ) // BL DTL (i) แสดงข้อมูลอย่างเดียว Else
  {
      // @ts-ignore
      frmAddAdjHdr.superclass.constructor.call ( this , {
          id : 'frm-adj-hdrID' ,
          url : Ext.obj.controllerMain ,
          frame : true ,
          bodyStyle : "padding:5px" ,
          autoScroll : true ,
          width : 700 ,
          labelWidth : 180 ,
          defaults : { flex : 1 } ,
          //closable:true,
          loadMask : true ,
          title : Ext.obj.title_gridMain_th ,
          items : adjHdrItems () ,
          buttonAlign : 'left' ,
          // @ts-ignore
          listeners : { afterrender : function ( win ) { } } ,
          buttons : [ {
                  text : 'บันทึกรายการ' ,
                  id : 'buSaveID' ,
                  iconCls : 'icon-save' ,
                  handler : function () {
                      // @ts-ignore
                      var form = Ext.getCmp ( 'frm-adj-hdrID' ).getForm () ;
                      // @ts-ignore
                      if ( Ext.getCmp ( 'ar_bill_invoice_hdr_idID_Name' ).getValue () == '' ) {
                          // @ts-ignore
                          var isChk = false ;
                          // @ts-ignore
                          Ext.Msg.alert ( 'Failure' , 'กรุณาเลือกใบวางบิลที่จะปรับปรุงหนี้' , function () {
                              // @ts-ignore
                              Ext.get ( 'ar_bill_invoice_hdr_idID_Name' ).dom.focus () ;

                          } ) ;

                      }
                      else if ( form.isValid () ) {
                          form.submit ( {
                              waitMsg : 'Saving Data...' ,
                              // @ts-ignore
                              success : function ( form , action ) {
                                  Ext.obj.id = action.result.data.id ;
                                  if ( action.result.data.id === 0 ) {
//เตือนในกรณีบันทึกไม่ฟ่าน ปิดเดือนหรือ..
                                      // @ts-ignore
                                      Ext.Msg.alert ( 'Success' , action.result.data.msg ) ;

                                  }
                                  else {

                                      // @ts-ignore
                                      Ext.Msg.alert ( 'Success' , action.result.data.msg , function () {

                                          Ext.store.setBaseParam ( "mode" , "SEARCH" ) ;
                                          // @ts-ignore
                                          Ext.store.setBaseParam ( "filter" , Ext.getCmp ( "filter-ID" ).getValue () ) ;
                                          // @ts-ignore
                                          Ext.store.setBaseParam ( "value" , Ext.getCmp ( "val-ID" ).getValue () ) ;
                                          // @ts-ignore
                                          Ext.store.setBaseParam ( "i_is_bill_complete" , Ext.getCmp ( "i_is_bill_completeID" ).getValue () ) ;
                                          // @ts-ignore
                                          Ext.store.setBaseParam ( "startDate" , Ext.getCmp ( "startDateID" ).getValue () ) ;
                                          // @ts-ignore
                                          Ext.store.setBaseParam ( "endDate" , Ext.getCmp ( "endDateID" ).getValue () ) ;
                                          Ext.store.reload ( {
                                              /* params: {
                                               typeStore: action.result.data.id
                                               },*/
                                              // @ts-ignore
                                              callback : function ( records , operation , success ) {
                                                  if ( success ) {
                                                      for ( i = 0 ; i < this.data.items.length ; i ++ ) {
                                                          var rec = this.data.items[i] ;
                                                          if ( action.result.data.id === rec.data.id ) {
                                                              Ext.obj.controllTabAdj ( rec , 'edit' ) ;
                                                          }
                                                      } // loop
                                                  }
                                              }
                                          } ) ;
                                          return true ;
                                      } ) ;
                                  }
                              } ,
                              // @ts-ignore
                              failure : function ( form , action ) {
                                  switch ( action.failureType ) {

                                      // @ts-ignore
                                      case Ext.form.Action.CLIENT_INVALID:

                                          // @ts-ignore
                                          Ext.Msg.alert ( 'Failure' , 'Form fields may not be submitted with invalid values' ) ;
                                          break ;
                                          // @ts-ignore
                                      case Ext.form.Action.CONNECT_FAILURE:

                                          // @ts-ignore
                                          Ext.Msg.alert ( 'Failure' , 'พลข้อผิดพลาดในการเชื่อต่อเครือข่าย' ) ;
                                          break ;
                                          // @ts-ignore
                                      case Ext.form.Action.SERVER_INVALID:

                                          // @ts-ignore
                                          Ext.Msg.alert ( 'Failure' , action.result.msg ) ;
                                  }
                              }
                          } ) ;
                      } //else
                  } //hand
              } , {

                  // @ts-ignore
                  text : Ext.GLOBAL_BU_BACK_TH ,
                  handler : function () {

                      // @ts-ignore
                      Ext.getCmp ( 'contenterCenter' ).setActiveTab ( 'tabGridID' ) ;
                  }
              } ]
      } ) ;
  }

// ON MCOT OLD
// @ts-ignore
  Ext.extend ( frmPrePrint , Ext.FormPanel , { } ) ;
// @ts-ignore
  Ext.extend ( frmSearchMainGrid , Ext.FormPanel , { } ) ;
// @ts-ignore
  Ext.extend ( frmAddAdjHdr , Ext.FormPanel , { } ) ;
// @ts-ignore
  Ext.extend ( frmAddAdjDtl , Ext.FormPanel , { } ) ;
//----------RUNAPP-----------------
// @ts-ignore
  Ext.onReady ( function () {
      //   Ext.showLoadingMask();
      // @ts-ignore
      Ext.QuickTips.init () ;
      Ext.obj.right () ;
      // @ts-ignore
      Ext.default = Ext.apply ( {
          f_vat_rate : null
      } ) ;
      var gridMain = {
          region : 'center' ,
          title : Ext.obj.title_gridMain_th ,
          // 'แสดงข้อมูลรายการวางบิลแล้ว Billing',
          xtype : 'grid' ,
          id : 'tabGridMasterID' ,
          border : false ,
          stripeRows : true ,
          loadMask : true ,
          store : Ext.store ,
          listeners : {
              // @ts-ignore
              render : function ( grid ) {

//                grid.getView().el.select('.x-grid3-header').setStyle('display', 'none');

              }

          } ,
          tbar : [ new frmSearchMainGrid () ] ,
          defaults : {
              flex : 1
          } ,
          columns : [
              // @ts-ignore
              new Ext.grid.RowNumberer (
                  {
                      width : 35 ,
                      header : " No " ,
                      // @ts-ignore
                      renderer : function ( value , metaData , record , row , col , store , gridView ) {
                          return record.get ( 'no' ) ;
                      }
                  } ) , {
                  header : "ID System" ,
                  sortable : true ,
                  hidden : true ,
                  dataIndex : 'id'
              } , {
                  header : "แก้ไข" ,
                  sortable : false ,
                  align : 'center' ,
                  id : 'edit' ,
                  width : 30 ,
                  dataIndex : 'id' ,
                  // @ts-ignore
                  renderer : function ( value , metaData , record , row , col , store , gridView ) {
                      //../images/icons/book_addresses_edit.png => images/icons/billing-icon.png
                      return '<img src="images/icons/billing-icon.png"); align="center" style="cursor:pointer"/>' ;
                  }
              } , {
                  header : "เลขที่ขอปรับปรุงหนี้" , sortable : true , width : 60 , dataIndex : 'c_area_ref_doc' ,
                  // @ts-ignore
                  renderer : function ( value , metaData , record , row , col , store , gridView ) {
                      return value ;
                  }

              } , {
                  /******เลขที่ใบขอปรับปรุงหนี้	สถานะ	วันที่ขอปรับปรุงหนี้	เลขที่ใบวางบิล/ใบแจ้งหนี้	เลขที่พิมพ์ใบวางบิล/ใบแจ้งหนี้	เลขที่ Order	ชื่อลูกค้า
                   จำนวนเงิน / ที่วางบิล/แจ้งหนี้	 || ยอดที่ถูกต้อง	 || จำนวนเงิน / ที่ขอปรับลด	 || ภาษีมูลค่าเพิ่ม	 || จำนวนเงิน / ที่ขอปรับลดรวมภาษี*/
                  header : "สถานะ" ,
                  width : 32 ,
                  dataIndex : 'txt_status'
              } , {
                  // @ts-ignore
                  header : "วันที่ขอปรับปรุงหนี้" , sortable : true , width : 50 , dataIndex : 'd_request_adjust_date' , renderer : Ext.shortThaiDate

              } , {

                  header : "เลขที่ใบวางบิล/ใบแจ้งหนี้" , sortable : true , hidden : true , width : 58 , dataIndex : 'c_area_code'
              } , {
                  header : "เลขที่พิมพ์ใบวางบิล/ใบแจ้งหนี้" , sortable : true , width : 66 , dataIndex : 'c_area_print'
              } , {
                  header : "เลขที่ Order" , sortable : true , width : 40 , dataIndex : 'so_code'
              } , {
                  header : "ชื่อลูกค้า" , sortable : true , width : 120 , dataIndex : 'c_cnt_name'
              } , {
                  header : 'จำนวนเงิน/ที่วางบิลแจ้งหนี้' , align : 'right' , dataIndex : 'f_net_cost_amt' , width : 65 , sortable : true
              } , {
                  header : 'ยอดที่ถูกต้อง' , align : 'right' , dataIndex : 'f_new_net_cost' , width : 40 , sortable : true
              } , {
                  header : 'จำนวนเงิน/ที่ขอปรับลด' , align : 'right' , dataIndex : 'f_req_amt' , width : 55 , sortable : true
              } , {
                  header : "ภาษีมูลค่าเพิ่ม" , align : 'right' , sortable : true , width : 55 , dataIndex : 'f_vat_amt'
              } , {
                  header : 'จำนวนเงิน/ที่ขอปรับลดรวมภาษี' , align : 'right' , dataIndex : 'f_net_cost_add_vat_amt' , width : 70 , sortable : true
              } , {
                  header : "ลบ" ,
                  sortable : false ,
                  align : 'center' ,
                  id : 'delID' ,
                  width : 30 ,
                  dataIndex : 'delID' ,
                  // @ts-ignore
                  renderer : function ( value , metaData , record , row , col , store , gridView ) {
                      metaData = 'align="left" style="cursor:pointer"' ;
                      return value ;
                  }

              } , {

                  header : "ผู้ที่สร้าง" ,
                  hidden : true ,
                  sortable : true ,
                  dataIndex : 'create_id'
              } , {
                  header : "วันที่สร้าง" ,
                  hidden : true ,
                  sortable : true ,
                  dataIndex : 't_create_dt' ,
                  // @ts-ignore
                  renderer : Ext.shortThaiDate
              } , {
                  header : "หน่วยงานผู้สร้าง" ,
                  hidden : true ,
                  sortable : true ,
                  dataIndex : 'create_org_id'
              } , {
                  header : "ผู้แก้ไข" ,
                  hidden : true ,
                  sortable : true ,
                  dataIndex : 'update_id'
              } , {
                  header : "วันที่แก้ไข" ,
                  hidden : true ,
                  sortable : true ,
                  dataIndex : 't_update_dt' ,
                  // @ts-ignore
                  renderer : Ext.shortThaiDate
              } , {
                  header : "หน่วยงานผู้แก้ไข" ,
                  hidden : true ,
                  sortable : true ,
                  dataIndex : 'update_org_id'
              } ] ,
          viewConfig : {
              forceFit : true
          } ,
          // @ts-ignore
          bbar : new Ext.PagingToolbar (
              {
                  pageSize : 20 ,
                  store : Ext.store ,
                  displayInfo : true ,
                  displayMsg : 'แสดงรายการ {0} - {1} of {2}'
              } )
      } ;
      // @ts-ignore
      new Ext.Viewport (
          {
              layout : 'border' ,
              items : [ {
                      border : false ,
                      region : 'center' ,
                      xtype : 'tabpanel' ,
                      id : 'contenterCenter' ,
                      defaults : {
                          autoScroll : true
                      } ,
                      items : [ gridMain ] ,
                      resizeTabs : true ,
                      minTabWidth : 200 ,
                      tabWidth : 300 ,
                      enableTabScroll : true ,
                      listeners : {
                          afterrender : function () {
                              // @ts-ignore
                              Ext.getCmp ( 'contenterCenter' ).setActiveTab ( 'tabGridMasterID' ) ;
                              Ext.store.reload () ;
                              // @ts-ignore
                              Ext.getCmp ( 'tabGridMasterID' ).on ( 'cellclick' , Ext.obj.cellClick , this ) ;
                              ///
                              // @ts-ignore
                              Ext.storeSo = Ext.obj.storeSo () ;
                              // @ts-ignore
                              Ext.storeBl = Ext.obj.storeBl () ;

                          } ,
                          // @ts-ignore
                          afteradd : function ( obj , ownerCt , index ) { } ,
                          // @ts-ignore
                          tabchange : function ( tabPanel , newTab , oldTab , eOpts ) {
                              //console.log(newTab.id);
                              // @ts-ignore
                              Ext.getCmp ( newTab.id ).doLayout () ;
                          } ,
                          // @ts-ignore
                          remove : function ( obj , cp ) {
                              // console.log(obj.getId());
                          }
                      }
                  } ]

          } ) ;
  } ) ;