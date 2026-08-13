Ext.onReady(function () {
  Ext.QuickTips.init();
  Ext.objChk = [];

  /* =============================================== */
  if (Ext.I_MENU_CANCEL == "3") title_panel = "ยกเลิกใบเบิกพิเศษ  (e-PHIS)";
  else if (Ext.I_MENU_CANCEL == "4") title_panel = "ยกเลิกใบเบิกพิเศษ  (Vision Net)";
  /* =============================================== */

  Ext.store = new Ext.data.JsonStore({
    id: "store",
    autoDestroy: true,
    autoLoad: false,
    url: "api/List_CancelImpRequestVSNNone.php",
    baseParams: { type: "imp_expense_approve", i_type_menu: Ext.I_MENU_CANCEL }, // Permission i_read
    root: "data",
    idProperty: "id",
    totalProperty: "totalCount",
    fields: [
      { name: "no" },
      { name: "id" },
      { name: "hdr_id" },
      { name: "gl_tran_hdr_id" },
      { name: "table_name" },
      { name: "c_code_g" },
      { name: "c_request" },
      { name: "c_request_desc" },
      { name: "d_doc_date" },
      { name: "c_acc_item" },
      { name: "f_inv" },
      { name: "i_status" },
      { name: "gl_tran_hdr_id_cancel" },
      { name: "gl_tran_hdr_rq_id" },
      { name: "c_code_cancel" },
      { name: "c_code_bank_cancel" },
      { name: "c_code_request" },
      { name: "c_creditor" },
      { name: "c_status_doc" },
      { name: "c_acc_dr_full" },
      { name: "c_acc_cr_full" },

    ],
  });

  // pagingBar
  pagingBar = new Ext.PagingToolbar({
    pageSize: 20,
    store: Ext.store,
    displayInfo: true,
    displayMsg: "Displaying topics {0} - {1} of {2}",
  });

  function pop_cancel(arr) {
    new Ext.Window({
      title: "เลือกข้อมูล",
      id: "win-pop-cancel",
      layout: "column",
      modal: true,
      border: false,
      items: [
        {
          // column 1
          columnWidth: 1,
          layout: "fit",
          height: Ext.getBody().getViewSize().height * 0.7,
          width: Ext.getBody().getViewSize().width * 0.7,
          border: false,
          items: [
            new Ext.FormPanel({
              labelWidth: 200, // label settings here cascade unless overridden
              labelAlign: "right",
              frame: true,
              items: [
                {
                  xtype: "fieldset",
                  title: "ยกเลิกรายการตั้งหนี้ " + (arr.data.table_name == "imp_request_ephis_hdr" ? "ใบเบิกพิเศษ e-PHIS" : "ใบเบิกพิเศษ Vision Net"),
                  defaults: { xtype: "displayfield", width: "100%", readOnly: true },
                  items: [
					{ fieldLabel: "<b>เลขที่ใบเบิกพิเศษ</b>", style: "color:red; font-weight: bold;", value: arr.data.c_request_desc },
					{ fieldLabel: "<b>เลขที่ตั้งหนี้พิเศษ</b>", style: "color:red; font-weight: bold;", value: arr.data.c_request },
                    { fieldLabel: "<b>ชื่อผู้รับเงิน</b>", value: arr.data.c_creditor },
					{ fieldLabel: "<b>รหัสบัญชีตั้งหนี้ DR</b>", value: arr.data.c_acc_dr_full },
					{ fieldLabel: "<b>รหัสบัญชีตั้งหนี้ CR</b>", value: arr.data.c_acc_cr_full },
                    { fieldLabel: "<b>ข้อมูลนำเข้า</b>", value: arr.data.table_name == "imp_request_ephis_hdr" ? "ใบเบิกพิเศษ e-PHIS" : "ใบเบิกพิเศษ Vision Net" },
                    { fieldLabel: "<b>วันที่ใบเบิก/ตรวจรับ</b>", value: shortThaiDate(arr.data.d_doc_date) },
                    { fieldLabel: "<b>รายการ</b>", value: arr.data.c_acc_item },
                    { fieldLabel: "<b>จำนวนขอเบิกทั้งสิ้น</b>", value: floatRenderer(arr.data.f_inv) }
                    ,{
						xtype: "compositefield"
						,fieldLabel: "<b>สาเหตุที่ยกเลิกใบเบิก</b>"
						,anchor: "100%"
						,msgTarget: "under"
						,readOnly: false
						,items: [
									{ id: "c_reason"
									, fieldLabel: "ระบุสาเหตุที่ยกเลิกใบเบิก"
									, xtype: "textfield", width: 200, readOnly: false 
									}
								,{ xtype: "displayfield", value: "<font color=red>*</font>" }
						]
					} 
                  ],
                },
              ],
              buttons: [
                {
                  text: "&nbsp;" + Ext.GLOBAL_BU_SAVE_TH + "&nbsp;",
                  iconCls: "icon-save",
                  handler: function () {
                    var msg = "";
                    var check = false;

                    if (Ext.getCmp("c_reason").getValue() == "") {
                      msg += "กรุณากรอก สาเหตุที่ยกเลิกใบเบิก<br>";
                    }

                    if (msg == "") {
                      new Ext.Window({
                        id: "win-pop-confirm",
                        title: "ยืนยันรายการ",
                        modal: true,
                        autoHeight: true,
                        width: 270,
                        html: "<div style='font-size: 14px; padding: 8px 2px; background: #fff; height: 45px;'>ท่านต้องการยกเลิกใบเบิกหรือไม่ ?</div>",
                        buttons: [
                          {
                            text: "Confirm",
                            handler: function () {
                              Ext.getCmp("win-pop-confirm").getEl().mask("Please wait...", "x-mask-loading");
                              Ext.Ajax.request({
                                url: "api/mn_CancelImpRequestVSNNone.php",
                                method: "POST",
                                params: {
                                  mode: "CANCEL_RQV_SPECIAL",
                                //   gl_tran_hdr_id: arr.data.gl_tran_hdr_id,
                                  hdr_id: arr.data.hdr_id,
                                  dtl_id: arr.data.id,
                                  table_name: arr.data.table_name,
                                  c_reason:Ext.getCmp("c_reason").getValue()
                                  //d_save_jv_cancel: Ext.util.Format.date(Ext.getCmp("d_save_jv_cancel").getValue(), "Y-m-d"),
                                },
                                success: function (result, request) {
                                  Ext.MessageBox.minWidth = 300;
                                  Ext.getCmp("win-pop-confirm").getEl().unmask();
                                  var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                                  if (jsonData.success == true) {
                                    Ext.store.reload();
                                  }
                                  Ext.getCmp("win-pop-confirm").destroy();
                                  Ext.getCmp("win-pop-cancel").destroy();

                                  Ext.MessageBox.alert("แจ้งรายการ", jsonData.msg); // alert massage error
                                },
                                failure: function (result, request) {
                                  Ext.MessageBox.alert("Failed", result.responseText); // connect error
                                },
                              });
                            },
                          },
                          {
                            text: Ext.GLOBAL_BU_BACK_TH,
                            handler: function () {
                              Ext.getCmp("win-pop-confirm").destroy();
                            },
                          },
                        ],
                      }).show();
                    } else {
                      Ext.Msg.minWidth = 300;
                      Ext.Msg.alert("แจ้งเตือน", msg);
                    }
                  },
                },
                {
                  text: Ext.GLOBAL_BU_BACK_TH,
                  handler: function () {
                    Ext.getCmp("win-pop-cancel").destroy();
                  },
                },
              ],
            }),
          ],
        },
      ],
    }).show();
  }

  function controllTab(record, butt) {
    if (butt == "cancel") {
      pop_cancel(record);
    }
  } // controllTab

  function Preview(id) {
    new Ext.Window({
      title: "แสดงรายละเอียดสมุดรายวัน",
      id: "Preview",
      modal: true,
      preventBodyReset: true,
      closable: true,
      autoScroll: true,
      maximized: true, // เต็มจอ auto
      html: '<iframe name="printf" src="../gl/preview/Pre_GlTranHdr.php?id=' + id + '" style="width:100%; height:100%; border-style:hidden;"></iframe>',
      buttonAlign: "left",
      buttons: [
        {
          text: "&nbsp;" + Ext.GLOBAL_BU_PRINT_TH + "&nbsp;",
          iconCls: "printer_mono",
          handler: function () {
            document.printf.window.print();
          },
        },
        {
          text: Ext.GLOBAL_BU_BACK_TH,
          handler: function () {
            Ext.getCmp("Preview").destroy();
          },
        },
      ],
    }).show();
  }

  // ================================ gridMain ================================ //
  cellClick = function (grid, rowIndex, columnIndex, e) {
    var record = grid.getStore().getAt(rowIndex);

    if (columnIndex == grid.getColumnModel().getIndexById("cancel")) {
      if (record.data.i_status == 9) {
      } else {
        controllTab(record, "cancel");
      }
    } else if (columnIndex == grid.getColumnModel().getIndexById("printBank")) {
      if (record.data.gl_tran_hdr_id_cancel > 0) {
        Preview(record.data.gl_tran_hdr_id_cancel);
      }
    } else if (columnIndex == grid.getColumnModel().getIndexById("print")) {
      if (record.data.gl_tran_hdr_rq_id > 0) {
        Preview(record.data.gl_tran_hdr_rq_id);
      }
    }
  }; // cellClick

  // gridMain
  gridMain = new Ext.grid.GridPanel({
    region: "center",
    layout: "fit",
    title: "แสดงรายการ" + title_panel,
    id: "tabpanel1",
    border: false,
    stripeRows: true,
    loadMask: true,
    store: Ext.store,
    viewConfig: {
      emptyText: "ไม่มีข้อมูล..",
      deferEmptyText: false,
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
                width: 100,
                mode: "local",
                store: new Ext.data.SimpleStore({
                  fields: ["value", "text"],
                  data: [["c_request", "เลขที่ใบเบิกพิเศษ"]],
                }),
                value: "c_request",
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
                width: 200,
                fieldLabel: "fieldLabel",
                emptyText: "คำที่ต้องการค้นหา",
              },
            ],
          },
          {
            xtype: "buttongroup",
            frame: false,
            items: [
              { xtype: "label", text: "วันที่ใบเบิก : " },
              { xtype: "tbspacer", width: 4 },
              {
                id: "s_d_doc_date1",
                xtype: "datefield",
                width: 128,
                listeners: {
                  afterrender: function () {
                    var date = new Date();
                    date = new Date(date.getFullYear() + 542, date.getMonth(), 1);
                    this.setValue(date);
                  },
                },
              },
              { xtype: "tbspacer", width: 6 },
              { xtype: "label", text: "ถึงวันที่ : " },
              { xtype: "tbspacer", width: 4 },
              {
                id: "s_d_doc_date2",
                xtype: "datefield",
                width: 128,
                listeners: {
                  afterrender: function () {
                    this.setValue(addY(543));
                  },
                },
              },
            ],
          },
        ],
        buttonAlign: "left",
        buttons: [
          { xtype: "tbfill" },
          {
            text: "ค้นหา",
            iconCls: "icon-magnifier",
            handler: function () {
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
                Ext.store.setBaseParam("d_doc_date1", Ext.util.Format.date(Ext.getCmp("s_d_doc_date1").getValue(), "Y-m-d"));
                Ext.store.setBaseParam("d_doc_date2", Ext.util.Format.date(Ext.getCmp("s_d_doc_date2").getValue(), "Y-m-d"));
                Ext.store.load();
              } else {
                Ext.Msg.alert("แจ้งเตือน", msg);
              }
            },
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
        id: "cancel",
        header: "-",
        sortable: false,
        align: "center",
        width: 120,
        dataIndex: "id",
        renderer: function (value, metaData, record, row, col, store, gridView) {
          if (record.data.i_status == 8) {
          } else {
            return "<button style='font-size:11px; cursor:pointer; color: red;'>ปรับ=>ไม่ใช้งาน</button>";
          }
        },
      }, 
      { header: "เลขที่ใบเบิกพิเศษ", sortable: true, width: 110, align: "center", dataIndex: "c_request_desc" },
      { header: "เลขที่ตั้งหนี้พิเศษ", sortable: true, width: 120, align: "center", dataIndex: "c_request" },
      { header: "เลขที่นำเข้าใบเบิกพิเศษ Vision Net", sortable: true, width: 200, align: "center", dataIndex: "c_code_request" },
      {
        header: "วันที่ใบเบิก/ตรวจรับ",
        sortable: true,
        align: "center",
        dataIndex: "d_doc_date",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          return value != "" ? shortThaiDate(value) : "";
        },
      },
      { id: "c_acc_item", header: "รายการ", sortable: true, width: 300, dataIndex: "c_acc_item" },
      { id: "c_creditor", header: "ชื่อผู้รับเงิน", sortable: true, width: 100, dataIndex: "c_creditor" },
      {
        header: "จำนวนขอเบิกทั้งสิ้น",
        sortable: true,
        dataIndex: "f_inv",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "style= 'cursor:pointer; text-align:right; color: blue;';";
          return floatRenderer(value);
        },
      },
      {
        id: "i_status",
        header: "สถานะใบเบิก",
        sortable: false,
        align: "center",
        width: 120,
        dataIndex: "i_status",
        renderer: function (value, metaData, record, row, col, store, gridView) {
          if (value == 2) {
            return "<font color=#CC3300>ส่งเบิกสมบูรณ์</font>";
          } else {
            return "<font color=red>ไม่ใช้งาน</font>";
          }
        },
      },
      { header: "", dataIndex: "", width: 20 },
    ],
    autoExpandColumn: "c_acc_item",
    bbar: pagingBar,
  }); // gridMain

  /* ====================== CENTER ====================== */
  center = new Ext.TabPanel({
    region: "center",
    border: false,
    // activeTab: 0, //default Tab
    id: "contenterCenter",
    defaults: { autoScroll: true },
    items: [gridMain],
  });
  // SET ref Grid&Tab
  Ext.getCmp("tabpanel1").on("cellclick", cellClick, this);

  // SetTab Controller Loads
  Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
  /* ====================== RENDER ====================== */
  new Ext.Viewport({
    layout: "border",
    items: [center],
  });
});
