Ext.onReady(function () {
  Ext.QuickTips.init();
  /*===============================================*/
  Ext.title_panel = "ครุภัณฑ์จากการจัดซื้อ";
  /*===============================================*/
  // pagingBar
  Ext.pagingBar = new Ext.PagingToolbar({
    pageSize: 20,
    store: Ext.store,
    displayInfo: true,
    displayMsg: "Displaying topics {0} - {1} of {2}",
  });
  const DisbledButton = function (t, record) {
    if (t) {
      Ext.getCmp("saveDtl").hide();
      /*Ext.getCmp("saveHdr").hide();*/
      Ext.getCmp("add_dtl").hide();
    }/* else {
      Ext.getCmp("saveHdr").show();
    }*/
  };

  const controllTab = function (record, butt) {
    Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; // null obj no 1t errer
    Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"), true) || {}; // null obj not errer
    Ext.butt = butt;
    if (butt == "edit" || butt == "view") {

      if (record.data.c_code_d != ""){
        // ============ formAdd ============ //
        Ext.HDR_ID = record.data.id;
        let frmAdd = new formAdd(record.data);
        Ext.getCmp("contenterCenter").add(frmAdd);
        Ext.getCmp("contenterCenter").setActiveTab(frmAdd);
        Ext.getCmp("form-widgets").getForm().loadRecord(record);

        Ext.getCmp("f_workin0").setValue(Ext.floatRenderer(record.data.f_workin0));
        Ext.getCmp("f_workin1").setValue(Ext.floatRenderer(record.data.f_workin1));
        Ext.getCmp("f_workin2").setValue(Ext.floatRenderer(record.data.f_workin2));
        Ext.getCmp("f_before").setValue(Ext.floatRenderer(record.data.f_before));
        Ext.getCmp("f_donate").setValue(Ext.floatRenderer(record.data.f_donate));
       
        // ============ PanelDtl ============ //
        let PanelDtl = new formPanelDtl();
        Ext.getCmp("contenterCenter").add(PanelDtl);
        //Ext.getCmp("contenterCenter").setActiveTab(PanelDtl);
        var f_sum_hdr = record.data.f_workin0 + record.data.f_workin2 + record.data.f_before + record.data.f_donate ; 
        Ext.getCmp("f_sum_hdr").setValue(Ext.floatRenderer(f_sum_hdr));
        summoney();
      }
      

      if (butt == "view") {
        DisbledButton(true, record);
      } else {
        DisbledButton(false, record);
      }
    }
  }; // controllTab

  // ================================ gridMain ================================ //
  cellClick = function (grid, rowIndex, columnIndex, e) {
    let record = grid.getStore().getAt(rowIndex);
    if (columnIndex == grid.getColumnModel().getIndexById("view")) {
      controllTab(record, "view");
    } else if (columnIndex == grid.getColumnModel().getIndexById("edit")) {
      if (record.get("c_code_d") != ""){
        if (record.data.i_is_register  == 0){
          controllTab(record, "edit");
        }else if (record.data.i_is_register  == 1){
          Preview(record.data.sp_check_period_hdr_id,record.data.c_code_check);
        }
      }
    }else if (columnIndex == grid.getColumnModel().getIndexById("view_pdf_asset")) {
      var id =  record.data.imp_assetall_supplies_hdr_id ;
      
      if (record.data.c_code_d != ""){
        
         if (record.data.i_is_register  == 1){
          Preview2(id, "../asset/pdf/PDF_assetimpost.php" );
        }
      }
    }else if (columnIndex == grid.getColumnModel().getIndexById("edit2")) {
      if (record.get("c_code_d") != ""){
        if (record.data.i_is_register  == 1){
          Preview3(record.data.sp_check_period_hdr_id,record.data.c_code_check);
        }
      }
    }else if (columnIndex == grid.getColumnModel().getIndexById("view_pdf_asset2")) {
      var id =  record.data.imp_assetall_supplies_hdr_id ;
      
      if (record.data.c_code_d != ""){
        
         if (record.data.i_is_register  == 1){
          Preview4(id, "../asset/pdf/PDF_assetimpost.php" );
        }
      }
    }
  }; //cellClick
  rowContextmenu = function (grid, rowIndex, e) {
    e.stopEvent();
    grid.getSelectionModel().selectRow(rowIndex);
    var record = grid.store.getAt(rowIndex);
    if (record) {
      var menu = new Ext.menu.Menu();
      menu.add({
        text: 'คัดลอก "' + record.data.c_code_check + '"',
        icon: "../images/icons/page_copy.png",
        scope: this,
        handler: function (e) {
          copyToClipboard(record.data.c_code_check);
        },
      });

      /* user_id = 22 : อินทิรา นิลศิริ */
      
      if (Ext.session.user_id == 1) {
        menu.addSeparator();
        menu.add(
          new Ext.menu.Item({
            text: "show only admin",
            disabled: true,
            cls: "menu-separator-text",
          })
        );
       
        menu.add({
          text: "(console_record)",
          icon: "../images/icons/script.png",
          scope: this,
          handler: function (e) {
            console.log(record);
          },
          
        });
        menu.add({
          text: 'คัดลอก :' + record.data.sp_tor_hdr_period_id + '  จากระบบ : '+ record.data.c_system,
          icon: "../images/icons/page_copy.png",
          scope: this,
          handler: function (e) {
            copyToClipboard(record.data.sp_tor_hdr_period_id);
          },
        });
      }
      menu.showAt(e.getXY());
    }
  }; //rowContextmenu
  const search = function () {
    var msg = "";
    if (msg == "") {
      
        if (Ext.getCmp("value-box").getValue() != "") {
          Ext.store.setBaseParam("value", Ext.getCmp("value-box").getValue());
          Ext.store.setBaseParam("filter", Ext.getCmp("filter").getValue());
        } else {
          Ext.store.setBaseParam("value", "");
          Ext.store.setBaseParam("filter", "");
        }
        Ext.store.setBaseParam("mode", "SEARCH");
        Ext.store.load();
      
    } else {
      Ext.Msg.alert("แจ้งเตือน", msg);
    }
  };
  function copyToClipboard(str) {
    var el = document.createElement("textarea");
    el.value = str;
    el.setAttribute("readonly", "");
    el.style.position = "absolute";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    var selected = document.getSelection().rangeCount > 0 ? document.getSelection().getRangeAt(0) : false;
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    if (selected) {
      document.getSelection().removeAllRanges();
      document.getSelection().addRange(selected);
    }
    Ext.example.msg("Copied to Clipboard.&nbsp;", "- คัดลอกไปยังคลิปบอร์ดสำเร็จ", 1);
    $(this).next("text copied");
    setTimeout(function () {
      $(this).next().remove();
    }, 2000);
  }
  function Preview4(id,c_code_check) {
    new Ext.Window({
      title: "รายงานรายละเอียดการชึ้นทะเบียนครุภัณฑ์",
      id: "Preview4",
      modal: true,
      preventBodyReset: true,
      closable: true,
      autoScroll: true,
      maximized: true, // เต็มจอ auto
      html: "<iframe name='printf' src='pdf/PDF_assetimpostsum.php/รายงานทะเบียนสินทรัพย์?id=" + id + "' style='width:100%; height:100%; border-style:hidden;'></iframe>",
      buttonAlign: "left",
      buttons: [
        {
          text: "&nbsp;" + Ext.GLOBAL_BU_PRINT_TH + "&nbsp;",
          iconCls: "icon-save",
          handler: function() {
            document.printf.window.print();
          }
        },{
          text: "&nbsp;&nbsp;PDF&nbsp;&nbsp;",
          iconCls: "icon-pdf",
          handler: function () {
            window.open("../lib/htmlToPdf.php/JV_PDF.pdf?locat=" + encodeURI("asset/pdf/PDF_assetimpost&CHK_CODE="+c_code_check+"&id=" + id));
          },
        },
        {
          text: Ext.GLOBAL_BU_BACK_TH,
          handler: function() {
            Ext.getCmp("Preview4").destroy();
          }
        }
      ]
    }).show();
  }
  function Preview3(id,c_code_check) {
    new Ext.Window({
      title: "รายงานรายละเอียดการชึ้นทะเบียนครุภัณฑ์",
      id: "Preview3",
      modal: true,
      preventBodyReset: true,
      closable: true,
      autoScroll: true,
      maximized: true, // เต็มจอ auto
      html: "<iframe name='printf' src='preview/Pre_AmImpPurchasecount.php?id=" + id + "' style='width:100%; height:100%; border-style:hidden;'></iframe>",
      buttonAlign: "left",
      buttons: [
        {
          text: "&nbsp;" + Ext.GLOBAL_BU_PRINT_TH + "&nbsp;",
          iconCls: "icon-save",
          handler: function() {
            document.printf.window.print();
          }
        },{
          text: "&nbsp;&nbsp;PDF&nbsp;&nbsp;",
          iconCls: "icon-pdf",
          handler: function () {
            window.open("../lib/htmlToPdf.php/JV_PDF.pdf?locat=" + encodeURI("asset/preview/Pre_AmImpPurchasecount&CHK_CODE="+c_code_check+"&id=" + id));
          },
        },
        {
          text: Ext.GLOBAL_BU_BACK_TH,
          handler: function() {
            Ext.getCmp("Preview3").destroy();
          }
        }
      ]
    }).show();
  }
  function Preview2(id,c_code_check) {
    new Ext.Window({
      title: "รายงานรายละเอียดการชึ้นทะเบียนครุภัณฑ์",
      id: "Preview2",
      modal: true,
      preventBodyReset: true,
      closable: true,
      autoScroll: true,
      maximized: true, // เต็มจอ auto
      html: "<iframe name='printf' src='pdf/PDF_assetimpost.php/รายงานทะเบียนสินทรัพย์?id=" + id + "' style='width:100%; height:100%; border-style:hidden;'></iframe>",
      buttonAlign: "left",
      buttons: [
        {
          text: "&nbsp;" + Ext.GLOBAL_BU_PRINT_TH + "&nbsp;",
          iconCls: "icon-save",
          handler: function() {
            document.printf.window.print();
          }
        },{
          text: "&nbsp;&nbsp;PDF&nbsp;&nbsp;",
          iconCls: "icon-pdf",
          handler: function () {
            window.open("../lib/htmlToPdf.php/JV_PDF.pdf?locat=" + encodeURI("asset/pdf/PDF_assetimpost&CHK_CODE="+c_code_check+"&id=" + id));
          },
        },
        {
          text: Ext.GLOBAL_BU_BACK_TH,
          handler: function() {
            Ext.getCmp("Preview2").destroy();
          }
        }
      ]
    }).show();
  }
  function Preview(id,c_code_check) {
    new Ext.Window({
      title: "รายงานรายละเอียดการชึ้นทะเบียนครุภัณฑ์",
      id: "Preview",
      modal: true,
      preventBodyReset: true,
      closable: true,
      autoScroll: true,
      maximized: true, // เต็มจอ auto
      html: "<iframe name='printf' src='preview/Pre_AmImpPurchase.php?id=" + id + "' style='width:100%; height:100%; border-style:hidden;'></iframe>",
      buttonAlign: "left",
      buttons: [
        {
          text: "&nbsp;" + Ext.GLOBAL_BU_PRINT_TH + "&nbsp;",
          iconCls: "icon-save",
          handler: function() {
            document.printf.window.print();
          }
        },{
          text: "&nbsp;&nbsp;PDF&nbsp;&nbsp;",
          iconCls: "icon-pdf",
          handler: function () {
            window.open("../lib/htmlToPdf.php/JV_PDF.pdf?locat=" + encodeURI("asset/preview/Pre_AmImpPurchase&CHK_CODE="+c_code_check+"&id=" + id));
          },
        },
        {
          text: Ext.GLOBAL_BU_BACK_TH,
          handler: function() {
            Ext.getCmp("Preview").destroy();
          }
        }
      ]
    }).show();
  }

  // gridMain
  const gridMain = new Ext.grid.GridPanel({
    region: "center",
    layout: "fit",
    title: "แสดงรายการ" + Ext.title_panel,
    id: "tabpanel1",
    border: false,
    stripeRows: true,
    loadMask: true,
    store: Ext.store,
    viewConfig: {
      emptyText: "ไม่มีข้อมูล..",
      deferEmptyText: false,
    },
    listeners: {
      afterRender: function (grid) {
        var element = Ext.get(grid.getView().mainHd.id);
        element.on("contextmenu", function (e, t) {
          e.stopEvent();
          var menu = new Ext.menu.Menu();
          menu.add({
            text: "Refresh",
            icon: "../images/icons/arrow_refresh_small.png",
            scope: this,
            handler: function (e) {
              grid.store.load();
            },
          });
          if (Ext.session.user_id == 1) {
            menu.addSeparator();
            menu.add(
              new Ext.menu.Item({
                text: "show only admin",
                disabled: true,
                cls: "menu-separator-text",
              })
            );
            menu.add({
              text: "Inspect SQL",
              icon: "../images/icons/script_lightning.png",
              scope: this,
              handler: function (e) {
                grid.store.load({ params: { show_sql: 1 } });
              },
            });
          }
          menu.showAt(e.getXY());
        });
      },
    },
    tbar: [
      { 
        xtype: "buttongroup",
        title: "ระบุเงื่อนไขในการค้นหาข้อมูล",
        columns: 1,
        defaults: { scale: "small", style: "float: right" },
        items: [
          {
            xtype: "buttongroup",
            frame: false,
            items: [
              { xtype: "label", text: "ค้นหาโดย : " },
              { xtype: "tbspacer", width: 4 },
              {
                id: "filter",
                xtype: "combo",
                width: 135,
                mode: "local",
                store: new Ext.data.SimpleStore({
                  fields: ["value", "text"],
                  data: [

                    ["c_code_check", "เลขที่ตรวจรับ"],
                    ["c_code", "เลขที่สัญญา"],
                  ],
                }),
                value: "c_code_check",
                valueField: "value",
                displayField: "text",
                allowBlank: false,
                editable: false,
                triggerAction: "all",
                typeAhead: false,
              },
              { xtype: "tbspacer", width: 4 },
              {
                xtype: "textfield",
                id: "value-box",
                width: 335,
                fieldLabel: "fieldLabel",
                emptyText: "คำที่ต้องการค้นหา",
              },
              
            ],
            buttonAlign: "left",
            buttons: [
              { xtype: "tbfill" },
              {
                text: "ค้นหา",
                iconCls: "icon-magnifier",
                handler: function () {
                  search();
                },
              },
            
            ],
          },
        ],
      },
    ],
    columns: [
      new Ext.grid.RowNumberer({
        header: "ที่",
        width: 30,
        renderer: function (value, metaData, record, row, col, store, gridView) {
          return record.get("no");
        },
      }),
      {
        id: "edit",
        header: "-",
        sortable: false,
        align: "center",
        width: 100,
        dataIndex: "id",
        renderer: function (value, metaData, record, row, col, store, gridView) {
            if (record.data.i_is_register  == 0){
              return "<button style='font-size:11px; cursor:pointer; color: green;'>ขึ้นทะเบียน</button>";
            }else if (record.data.i_is_register  == 1){
              return "<button style='font-size:11px; cursor:pointer; color: blue;'>แสดงรายการ</button>";
            }else{
              return "";
            }
        },
      },{
        id: "edit2",
        header: "-",
        sortable: false,
        align: "center",
        width: 100,
        dataIndex: "id",
        renderer: function (value, metaData, record, row, col, store, gridView) {
            if (record.data.i_is_register  == 0){
              
            }else if (record.data.i_is_register  == 1){
              return "<button style='font-size:11px; cursor:pointer; color: blue;'>แสดงรายการ</button>";
            }else{
              return "";
            }
        },
      },{
        header: "เลขที่ตรวจรับ",
        sortable: false,
        align: "center",
        width: 100,
        
        dataIndex: "c_code_check",
      }
      // ,{
      //   header: "เลขที่ใบขอเบิก",
      //   sortable: false,
      //   align: "center",
      //   width: 100,
      //   dataIndex: "c_code_d",
      // }
      ,{
        header: "มาจาก",
        sortable: false,
        align: "center",
        width: 100,
        hidden : true,
        dataIndex: "c_system",
      },{
        header: "วันที่ตรวจรับ",
        sortable: true,
        align: "center",
        dataIndex: "d_checking_date",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          return value != "" ? shortThaiDate(value) : "";
        },
      },{
        header: "เลขที่สัญญา",
        sortable: false,
        align: "center",
        width: 100,
        dataIndex: "c_code",
        renderer: function (value, metaData, record, row, col, store, gridView) {
          metaData.attr = "align='left' font-weight:bold;'";
          return (value);
        },
      },{
        header: "งวดที่",
        sortable: false,
        align: "center",
        width: 50,
        dataIndex: "i_period",
      },{
        header: "ชื่อโครงการ",
        sortable: false,
        align: "left",
        width: 350,
        id : "c_name",
        dataIndex: "c_name",
      },{
        header: "จำนวนเงิน",
        sortable: true,
        align: "center",
        dataIndex: "f_total",
        renderer: function (value, metaData, record, row, col, store, gridView) {
          metaData.attr = "align='right' style='color:blue; font-weight:bold;'";
          return floatRenderer(value);
        },
      },{
        header: "ผู้ทำรายการ",
        sortable: false,
        align: "center",
        width: 120,
        dataIndex: "sp_emp",
        renderer: function (value, metaData, record, row, col, store, gridView) {
          metaData.attr = "align='left' style='color:black; font-weight:bold;'";
          return floatRenderer(value);
        },
      },
      {
        header: "-",
        sortable: false,
        id: "view_pdf_asset",
        width: 80,
        align: "center",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
        //  return "<button style='font-size:11px; color: red; font-weight: bold'; cursor:pointer;'><img src='../images/icons/printer_mono.png' style='margin-right:1px;'/>" + " PDF" + "</button>";
        if (record.data.c_code_d != ""){
          if (record.data.i_is_register  == 0){
            return "";
          }else if (record.data.i_is_register  == 1){
            return "<button style='font-size:11px; color: red; font-weight: bold'; cursor:pointer;'><img src='../images/icons/printer_mono.png' style='margin-right:1px;'/>" + " PDF" + "</button>"
          }
        }
        else
          return "";


        },
      },{
        header: "-",
        sortable: false,
        id: "view_pdf_asset2",
        width: 80,
        align: "center",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
        //  return "<button style='font-size:11px; color: red; font-weight: bold'; cursor:pointer;'><img src='../images/icons/printer_mono.png' style='margin-right:1px;'/>" + " PDF" + "</button>";
        if (record.data.c_code_d != ""){
          if (record.data.i_is_register  == 0){
            return "";
          }else if (record.data.i_is_register  == 1){
            return "<button style='font-size:11px; color: red; font-weight: bold'; cursor:pointer;'><img src='../images/icons/printer_mono.png' style='margin-right:1px;'/>" + " PDF" + "</button>"
          }
        }
        else
          return "";


        },
      },
      /*{
        header: "วันที่ทำรายการล่าสุด",
        sortable: true,
        align: "center",
        dataIndex: "d_update",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          return value != "" ? shortThaiDate(value) : "";
        },
      },
      {
        header: "วันที่สร้างรายการ",
        sortable: true,
        align: "center",
        dataIndex: "d_create",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          return value != "" ? shortThaiDate(value) : "";
        },
      },*/
      { width: 40, dataIndex: "" },
    ],
      autoExpandColumn: "c_name",
    bbar: Ext.pagingBar,
  }); //gridMain
  /*====================== CENTER ======================*/
  center = new Ext.TabPanel({
    region: "center",
    border: false,
    //activeTab: 0, //default Tab
    id: "contenterCenter",
    defaults: { autoScroll: false },
    items: [gridMain],
  });
  // SET ref Grid&Tab
  Ext.getCmp("tabpanel1").on("cellclick", cellClick, this);
  Ext.getCmp("tabpanel1").on("rowContextmenu", rowContextmenu, this);
  // SetTab Controller Loads
  Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
  
  /*====================== RENDER ======================*/
  new Ext.Viewport({
    layout: "border",
    items: [center],
  });

  new Ext.KeyNav("tabpanel1", {
    enter: function (e) {
      search();
    },
    scope: this,
  });
});
