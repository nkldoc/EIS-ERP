function Preview(id) {
  new Ext.Window({
    title: "แสดงรายละเอียดสมุดรายวัน",
    id: "Preview",
    modal: true,
    preventBodyReset: true,
    closable: true,
    autoScroll: true,
    maximized: true, // เต็มจอ auto
    html: "<iframe name='printf' src='preview/Pre_GlTranHdr.php?id=" + id + "' style='width:100%; height:100%; border-style:hidden;'></iframe>",
    buttonAlign: "left",
    buttons: [
      {
        text: "&nbsp;" + Ext.GLOBAL_BU_PRINT_TH + "&nbsp;",
        iconCls: "icon-save",
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

Ext.onReady(function () {
  Ext.QuickTips.init();

  // pagingBar
  pagingBar = new Ext.PagingToolbar({
    pageSize: 20,
    store: Ext.store,
    displayInfo: true,
    displayMsg: "Displaying topics {0} - {1} of {2}",
  });

  function controllTab(record, butt) {
    Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; // null obj not error

    if (butt == "add") {
      var frmAdd = new formAdd();

      Ext.getCmp("contenterCenter").add(frmAdd);
      Ext.getCmp("contenterCenter").setActiveTab(frmAdd);
      Ext.getCmp("role-form-mode").setValue("ADD");
    } else if (butt == "edit_hdr") {
      var frmAdd = new formAdd(butt);

      Ext.getCmp("contenterCenter").add(frmAdd);
      Ext.getCmp("contenterCenter").setActiveTab(frmAdd);
      Ext.getCmp("role-form-mode").setValue("EDIT");
      Ext.getCmp("form-widgets").getForm().loadRecord(record);

      if (record.data.i_is_post > 1) {
        //				Ext.getCmp("c_ref_doc").setDisabled(true);
        Ext.getCmp("d_save_date").setDisabled(true);
      }
    } else if (butt == "edit") {
      var frmAdd = new formAdd(butt);

      Ext.getCmp("contenterCenter").add(frmAdd);
      Ext.getCmp("contenterCenter").setActiveTab(frmAdd);
      Ext.getCmp("role-form-mode").setValue("EDIT");
      Ext.getCmp("form-widgets").getForm().loadRecord(record);

      Ext_Show(record.data.id);

      if (record.data.i_is_post > 1) {
        //				Ext.getCmp("c_ref_doc").setDisabled(true);
        Ext.getCmp("d_save_date").setDisabled(true);
      }
    } else if (butt == "edit_mini") {
      PopTranDtl(record.data.id, true, record.data.i_receive);
    }
  } // controllTab

  function deleteHdr(id, mode) {
    var txt = mode == "DELETE" ? "ลบ" : "ยกเลิก";
    new Ext.Window({
      id: "win-msg-delete",
      title: "แจ้งเตือน",
      modal: true,
      width: 250,
      height: 130,
      html: "<div style='background-color: #fff; height: 100%; font-size: 14px; font-weight: bold; padding: 4px;'>ท่านต้องการที่จะ" + txt + "ข้อมูล ?</div>",
      buttons: [
        {
          text: "Confirm",
          handler: function () {
            Ext.getCmp("win-msg-delete").getEl().mask("Please wait...", "x-mask-loading");
            Ext.Ajax.request({
              url: "api/mn_GlTranhdr.php",
              method: "POST",
              params: {
                mode: mode,
                id: id,
              },
              success: function (result, request) {
                var jsonData = Ext.util.JSON.decode(result.responseText); // decode json
                if (jsonData.success == true) {
                } else {
                  Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg);
                }
                Ext.getCmp("win-msg-delete").destroy();
                Ext.store.reload();
              },
              failure: function (result, request) {
                Ext.MessageBox.alert("แจ้งเตือน", result.responseText);
              },
            });
          },
        },
        {
          text: Ext.GLOBAL_BU_BACK_TH,
          handler: function () {
            Ext.getCmp("win-msg-delete").destroy();
          },
        },
      ],
    }).show();
  }

  //================================ gridMain ================================//
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
        // กล่องค้นหาข้อมูล 1
        xtype: "buttongroup",
        title: "ระบุเงื่อนไขในการค้นหาข้อมูล",
        columns: 1,
        defaults: { scale: "small", style: "float: right" },
        items: [
          {
            // แถวที่ 1
            xtype: "buttongroup",
            frame: false,
            items: [
              { xtype: "label", text: "ค้นหาโดย : " },
              { xtype: "tbspacer", width: 4 },
              {
                id: "filter",
                xtype: "combo",
                width: 122,
                mode: "local",
                store: new Ext.data.SimpleStore({
                  fields: ["value", "text"],
                  data: [
                    ["c_ref_doc", "เลขที่เอกสาร"],
                    ["c_code", "GX"],
                    ["c_code_post", "GL"],
                  ],
                }),
                value: "c_ref_doc",
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
                width: 164,
                fieldLabel: "fieldLabel",
                emptyText: "คำที่ต้องการค้นหา",
              },
            ],
          },
          {
            // แถวที่ 2
            xtype: "buttongroup",
            frame: false,
            items: [
              { xtype: "label", text: "วันที่บันทึกบัญชี : " },
              { xtype: "tbspacer", width: 4 },
              {
                id: "s_save_date1",
                xtype: "datefield",
                width: 122,
                listeners: {
                  afterrender: function () {
                    var date = new Date();
                    date = new Date(date.getFullYear() + 543, date.getMonth() - 2, 1);
                    this.setValue(date);
                  },
                },
              },
              { xtype: "tbspacer", width: 5 },
              { xtype: "label", text: "ถึงวันที่ : " },
              { xtype: "tbspacer", width: 4 },
              {
                id: "s_save_date2",
                xtype: "datefield",
                width: 122,
                listeners: {
                  afterrender: function () {
                    this.setValue(addY(543));
                  },
                },
              },
            ],
          },
          {
            // แถวที่ 3
            xtype: "buttongroup",
            frame: false,
            items: [
              { xtype: "label", text: "สถานะการผ่านรายการ : " },
              { xtype: "tbspacer", width: 4 },
              {
                id: "s_is_post",
                xtype: "combo",
                width: 122,
                mode: "local",
                store: Ext.storePost,
                value: "0",
                valueField: "value",
                displayField: "text",
                allowBlank: false,
                editable: false,
                triggerAction: "all",
                typeAhead: false,
              },
              { xtype: "tbspacer", width: 6 },
              { xtype: "label", text: "สถานะ : " },
              { xtype: "tbspacer", width: 4 },
              {
                id: "s_enable",
                xtype: "combo",
                width: 122,
                mode: "local",
                store: new Ext.data.SimpleStore({
                  fields: ["value", "text"],
                  data: [
                    ["0", "- เลือกทั้งหมด -"],
                    ["1", "ใช้งาน"],
                    ["2", "ไม่ใช้งาน"],
                  ],
                }),
                value: "1",
                valueField: "value",
                displayField: "text",
                allowBlank: false,
                editable: false,
                triggerAction: "all",
                typeAhead: false,
              },
            ],
          },
        ],
        buttonAlign: "left",
        buttons: [
          {
            text: "เพิ่มข้อมูล",
            id: "buAdd",
            iconCls: "icon-add",
            hidden: I_PAGE == 2 ? true : false, // 2=แก้ไขสมุดรายวัน
            handler: function (grid, rowIndex, colIndex) {
              controllTab({}, "add");
            },
            //			}, { // NMU ไม่ได้ใช้ รายการโอนกลับต้นงวด
            //				text : "รายการโอนกลับต้นงวด",
            //				iconCls: "page-copy-icon",
            //				handler: function(grid, rowIndex, colIndex) {
            //
            //					var cellClick_lov_copy	= function(grid, rowIndex, columnIndex, e) {
            //						var record	= grid.getStore().getAt(rowIndex);
            //
            //						Ext.getCmp("ss_gl_tran_hdr_id").setValue(record.id);
            //						Ext.getCmp("ss_c_code").setValue(record.data.c_code);
            //						Ext.getCmp("ss_c_ref_doc").setValue(record.data.c_ref_doc);
            //						Ext.getCmp("ss_d_save_date").setValue(DategetShortDateMonthName(record.data.d_save_date));
            //						Ext.getCmp("ss_f_total_amt").setValue(floatRenderer(record.data.f_total_amt));
            //						Ext.getCmp("ss_c_comment").setValue(record.data.c_comment1+record.data.c_comment2+record.data.c_comment3);
            //					};
            //
            //					new Ext.Window({
            //						title: "เลือกข้อมูล",
            //						id: "win-pop-copy",
            //						layout: "column",
            //						modal: true,
            //						border: false,
            //						items:[{ // column 1
            //				            columnWidth: 0.3,
            //				            layout: "fit",
            //				            height: (Ext.getBody().getViewSize().height * 0.8),
            //							width: (Ext.getBody().getViewSize().width * 0.25),
            //							border: false,
            //				            items: [new Ext.FormPanel({
            //				                labelWidth: 90, // label settings here cascade unless overridden
            //				                labelAlign: "right",
            //				                frame: true,
            //				                items: [{
            //				                    xtype: "fieldset",
            //				                    title: "รายการที่เลือก",
            //				                    defaults: { xtype: "textfield", width: "90%", readOnly: true },
            //				                    items :[{
            //				                    	xtype: "hidden",
            //				                    	id: "ss_gl_tran_hdr_id"
            //				                    }, {
            //				                    	id: "ss_c_code",
            //				                    	fieldLabel: "รหัส"
            //				                    }, {
            //				                    	id: "ss_c_ref_doc",
            //				                    	fieldLabel: "เลขที่เอกสาร"
            //				                    }, {
            //				                    	id: "ss_d_save_date",
            //				                    	fieldLabel: "วันที่บันทึกบัญชี"
            //				                    }, {
            //				                    	id: "ss_f_total_amt",
            //				                    	fieldLabel: "เดบิตหรือเครดิต",
            //				                    	style: "text-align: right"
            //				                    }, {
            //				                    	xtype: "textarea",
            //				                    	id: "ss_c_comment",
            //				                    	fieldLabel: "คำอธิบายรายการ"
            //				                    }]
            //				                }],
            //				                buttons: [{
            //				                    text: "โอนกลับต้นงวด",
            //				                    iconCls: "page-copy-icon",
            //				                    handler : function() {
            //				                    	var msg	= "";
            //				                    	var tran_hdr_id	= Ext.getCmp("ss_gl_tran_hdr_id").getValue();
            //
            //				                    	if(tran_hdr_id == "") { msg	+= "กรุณาเลือกรายการทางด้านซ้าย"; }
            //
            //				                    	if(msg == "") {
            //
            //				                    		new Ext.Window({
            //				    							id: "win-pop-confirm",
            //				    							title: "ยืนยันรายการ",
            //				    							modal: true,
            //				    							autoHeight: true,
            //				    							width: 250,
            //				    							html: "<div style=\"background: #fff; height: 70px;\">ท่านต้องการโอนกลับต้นงวดหรือไม่ ?</div>",
            //				    							buttons: [{
            //				    								text: "Confirm",
            //				    								handler: function() {
            //				    									Ext.getCmp("win-pop-confirm").getEl().mask("Please wait...", "x-mask-loading");
            //				    									Ext.Ajax.request({
            //				    										url: "api/mn_GlTranhdr.php",
            //				    										method: "POST",
            //				    										params: {
            //				    											mode: "REVERSE",
            //				    											id: tran_hdr_id
            //				    										},
            //				    										success: function ( result, request ) {
            //				    											Ext.getCmp("win-pop-confirm").getEl().unmask();
            //				    											var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
            //				    											if (jsonData.success == true) {
            //				    												//Ext.MessageBox.alert("Success", jsonData.msg);		// alert massage success
            //				    												Ext.getCmp("win-pop-confirm").destroy();
            //					    											Ext.getCmp("win-pop-copy").destroy();
            //
            //					    											Ext.Msg.alert("แจ้งเตือน", jsonData.msg);
            //
            //					    											store.reload();
            //					    											store_gx_reverse.reload();
            //				    											} else {
            //				    												Ext.getCmp("win-pop-confirm").destroy();
            //				    												Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg);			// alert massage error
            //				    											}
            //				    										},
            //				    										failure: function ( result, request) {
            //				    											Ext.MessageBox.alert("Failed", result.responseText);		// connect error
            //				    										}
            //				    									});
            //				    								}
            //				    							}, {
            //				    								text : Ext.GLOBAL_BU_BACK_TH,
            //				    								handler : function() { Ext.getCmp("win-pop-confirm").destroy(); }
            //				    							}]
            //				    						}).show();
            //
            //				                    	} else { Ext.Msg.alert("แจ้งเตือน", msg); }
            //				                    }
            //				                },{
            //				                    text: Ext.GLOBAL_BU_BACK_TH,
            //				                    handler : function() { Ext.getCmp("win-pop-copy").destroy(); }
            //				                }]
            //				            })]
            //						}, { // column 2
            //				            columnWidth: 0.7,
            //				            layout: "fit",
            //				            height: (Ext.getBody().getViewSize().height * 0.8),
            //							width: (Ext.getBody().getViewSize().width * 0.65),
            //				            items: [{
            //								xtype: "grid",
            //								id: "grid-copy",
            //								border: false,
            //								stripeRows: true,
            //								loadMask: true,
            //								store: store_gx_reverse,
            //								viewConfig : {
            //									emptyText: "ไม่มีข้อมูล..",
            //									deferEmptyText: false
            //								},
            //								listeners : {
            //									afterrender : function() {
            //										this.getStore().setBaseParam("mode","");
            //										this.getStore().load();
            //									}
            //								},
            //								tbar: [{
            //									id: "copy-filter",
            //									xtype: "combo",
            //									width: 110,
            //									mode: "local",
            //									store: new Ext.data.SimpleStore({
            //										fields: [ "value", "text" ],
            //										data: [
            //										       [ "c_code", "รหัส" ],
            //										       [ "c_ref_doc", "เลขที่เอกสาร" ],
            //										       [ "c_comment", "คำอธิบายรายการ" ]
            //										      ]
            //									}),
            //									valueField: "value",
            //									displayField: "text",
            //									value: "c_code",
            //									allowBlank: false,
            //									editable: false,
            //									triggerAction: "all",
            //									typeAhead : false,
            //									emptyText : "เลือกตัวกรอง",
            //								}, " ", {
            //									id: "copy-value",
            //									xtype: "textfield",
            //									width: 130,
            //									emptyText : "คำที่ต้องการค้นหา",
            //								}, "-", {
            //									text: "ค้นหา",
            //									iconCls: "icon-magnifier",
            //									handler : function() {
            //										if (Ext.getCmp("copy-value").getValue() != "") {
            //											store_gx_reverse.setBaseParam("filter", Ext.getCmp("copy-filter").getValue());
            //											store_gx_reverse.setBaseParam("value", Ext.getCmp("copy-value").getValue());
            //										} else {
            //											store_gx_reverse.setBaseParam("value", "");
            //											store_gx_reverse.setBaseParam("filter", "");
            //										}
            //
            //										store_gx_reverse.setBaseParam("mode", "SEARCH");
            //										store_gx_reverse.load();
            //									}
            //								}],
            //								bbar: new Ext.PagingToolbar({
            //							    	pageSize: 15,
            //							    	store: store_gx_reverse,
            //							    	displayInfo: true,
            //							    	displayMsg: "Displaying topics {0} - {1} of {2}"
            //							    }),
            //								columns:[
            //								new Ext.grid.RowNumberer({header:"ที่", width: 30,
            //									renderer:function(value, metaData, record, row, col, store, gridView) {
            //										return record.get("no");
            //									}
            //								}), {
            //									header: "รหัส", sortable: true, dataIndex: "c_code",
            //									renderer: function(value, metaData, record, rowIndex, colIndex, store) {
            //							    		metaData.attr = "style= \"cursor:pointer; text-align:center;\";";
            //							    		return value;
            //							    	}
            //							    }, {
            //							    	header: "เลขที่เอกสาร", sortable: true, dataIndex: "c_ref_doc",
            //							    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
            //							    		metaData.attr = "style= \"cursor:pointer; text-align:center;\";";
            //							    		return value;
            //							    	}
            //							    }, {
            //							    	header: "วันที่บันทึกบัญชี", sortable: true, dataIndex: "d_save_date",
            //							    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
            //							    		metaData.attr = "style= \"cursor:pointer; text-align:center;\";";
            //							    		return DategetShortDateMonthName(value);
            //							    	}
            //							    }, {
            //							    	header: "เดบิตหรือเครดิต", sortable: true, dataIndex: "f_total_amt",
            //							    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
            //							    		metaData.attr = "style= \"cursor:pointer; text-align:right;\";";
            //							    		return floatRenderer(value);
            //							    	}
            //							    }, {
            //							    	id: "synComment", header: "คำอธิบายรายการ", sortable: true,
            //							    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
            //							    		metaData.attr = "style= \"cursor:pointer\";";
            //							    		return record.data.c_comment1+record.data.c_comment2+record.data.c_comment3;
            //							    	}
            //							    }],
            //							    autoExpandColumn: "synComment"
            //							}]
            //						}]
            //					}).show();
            //
            //					Ext.getCmp("grid-copy").on("cellclick", cellClick_lov_copy, this);
            //
            //				}
          },
        ],
      },
      {
        // กล่องค้นหาข้อมูล 2
        xtype: "buttongroup",
        title: "&nbsp;",
        columns: 1,
        defaults: { scale: "small", style: "float: right" },
        items: [
          {
            // แถวที่ 1
            xtype: "buttongroup",
            frame: false,
            items: [
              { xtype: "label", text: "ผู้สร้างรายการ : " },
              {
                xtype: "tbspacer",
                width: 4,
              },
              new Ext.form.ComboBox({
                id: "s_user_create_id",
                store: Ext.storeUser_create,
                valueField: "id",
                displayField: "c_name",
                mode: "local",
                triggerAction: "all",
                emptyText: "กรุณาเลือก...",
                width: 291,
                forceSelection: true,
                selectOnFocus: true,
                typeAhead: false,
                value: 0,
                listeners: {
                  change: function (combo, newValue) {
                    if (newValue == "") {
                      combo.reset();
                    }
                  },
                  beforequery: function (q) {
                    if (q.query) {
                      var length = q.query.length;
                      q.query = new RegExp(Ext.escapeRe(q.query));
                      q.query.length = length;
                    }
                  },
                  blur: function () {
                    this.getStore().clearFilter();
                  },
                },
              }),
            ],
          },
          {
            // แถวที่ 2
            xtype: "buttongroup",
            frame: false,
            items: [
              { xtype: "label", text: "ผู้แก้ไขรายการ : " },
              {
                xtype: "tbspacer",
                width: 4,
              },
              new Ext.form.ComboBox({
                id: "s_user_update_id",
                store: Ext.storeUser_update,
                valueField: "id",
                displayField: "c_name",
                mode: "local",
                triggerAction: "all",
                emptyText: "กรุณาเลือก...",
                width: 291,
                forceSelection: true,
                selectOnFocus: true,
                typeAhead: false,
                value: 0,
                listeners: {
                  change: function (combo, newValue) {
                    if (newValue == "") {
                      combo.reset();
                    }
                  },
                  beforequery: function (q) {
                    if (q.query) {
                      var length = q.query.length;
                      q.query = new RegExp(Ext.escapeRe(q.query));
                      q.query.length = length;
                    }
                  },
                  blur: function () {
                    this.getStore().clearFilter();
                  },
                },
              }),
            ],
          },
          {
            // แถวที่ 3
            xtype: "buttongroup",
            frame: false,
            items: [
              { xtype: "label", text: "วันที่เอกสาร : " },
              { xtype: "tbspacer", width: 4 },
              {
                id: "s_doc_date1",
                xtype: "datefield",
                width: 122,
              },
              { xtype: "tbspacer", width: 5 },
              { xtype: "label", text: "ถึงวันที่ : " },
              { xtype: "tbspacer", width: 4 },
              {
                id: "s_doc_date2",
                xtype: "datefield",
                width: 122,
              },
            ],
          },
        ],
        buttonAlign: "left",
        buttons: [
          {
            text: "ค้นหา",
            iconCls: "icon-magnifier",
            handler: function () {
              var msg = "";

              if (Ext.getCmp("s_save_date1").getValue() == "" || Ext.getCmp("s_save_date2").getValue() == "") {
                msg += "กรุณากรอก วันที่บันทึก<br>";
              }

              if (msg == "") {
                if (Ext.getCmp("value-box").getValue() != "") {
                  Ext.store.setBaseParam("value", Ext.getCmp("value-box").getValue());
                  Ext.store.setBaseParam("filter", Ext.getCmp("filter").getValue());
                } else {
                  Ext.store.setBaseParam("value", "");
                  Ext.store.setBaseParam("filter", "");
                }

                Ext.store.setBaseParam("mode", "SEARCH");
                Ext.store.setBaseParam("d_save_date1", Ext.util.Format.date(Ext.getCmp("s_save_date1").getValue(), "Y-m-d"));
                Ext.store.setBaseParam("d_save_date2", Ext.util.Format.date(Ext.getCmp("s_save_date2").getValue(), "Y-m-d"));
                Ext.store.setBaseParam("i_is_post", Ext.getCmp("s_is_post").getValue());
                Ext.store.setBaseParam("i_enable", Ext.getCmp("s_enable").getValue());
                Ext.store.setBaseParam("dc_user_create_id", Ext.getCmp("s_user_create_id").getValue());
                Ext.store.setBaseParam("dc_user_update_id", Ext.getCmp("s_user_update_id").getValue());
                Ext.store.setBaseParam("d_doc_date1", Ext.util.Format.date(Ext.getCmp("s_doc_date1").getValue(), "Y-m-d"));
                Ext.store.setBaseParam("d_doc_date2", Ext.util.Format.date(Ext.getCmp("s_doc_date2").getValue(), "Y-m-d"));
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
        id: "edit",
        header: "แก้ไข",
        sortable: true,
        width: 70,
        dataIndex: "id",
        hidden: I_PAGE == 2 ? true : false, // 2=แก้ไขสมุดรายวัน
        renderer: function (value, metaData, record, row, col, store, gridView) {
          metaData.attr = "align='center';";
          if (I_PAGE == 2) {
          } else {
            if (record.get("i_enable") == 2) {
            } else if (record.get("i_is_post") == 1 || record.get("i_is_post") == 2) {
              return "<button style='font-size:11px; cursor:pointer; color: green;'>แก้ไข</button>";
            }
          }
        },
      },
      {
        id: "edit_mini",
        header: "-",
        sortable: true,
        width: 100,
        dataIndex: "id",
        hidden: I_PAGE == 3 ? true : false,
        renderer: function (value, metaData, record, row, col, store, gridView) {
          metaData.attr = "align='center';";
          if (I_PAGE == 3) {
          } else {
            if (record.get("i_enable") == 2) {
            } else if (record.get("i_is_post") == 2 || record.get("i_is_post") == 3) {
              return "<button style='font-size:11px; cursor:pointer; color: green;'>แก้ไขรายละเอียด</button>";
            }
          }
        },
      },
      {
        id: "delete",
        header: "ลบ",
        sortable: true,
        dataIndex: "id",
        width: 150,
        renderer: function (value, metaData, record, row, col, store, gridView) {
          if (record.get("table_name") == "imp_expense_hdr") {
            var txt = "e-phis";
          } else if (record.get("table_name") == "imp_expense_vsn_hdr") {
            var txt = "vision net";
          } else if (record.get("table_name") == "gl_bank") {
            var txt = "BTN";
          } else if (record.get("table_name") == "imp_receive_hdr") {
            var txt = "รายได้";
          } else if (record.get("table_name") == "ar_bill_hdr" || record.get("table_name") == "ar_cut_hdr" || record.get("table_name") == "ar_receipt_hdr") {
            var txt = "ลูกหนี้";
          }

          metaData.attr = "align='center';";
          if (record.get("i_enable") == 2) {
          } else if (record.get("i_is_post") == 1) {
            // รอลงบัญชี
            if (record.get("i_source") == 1) {
              // 1=ยกเลิกได้, 2=ยกเลิกที่ต้นทาง
              return "<button style='font-size:11px; cursor:pointer; color: red;'>&nbsp;ลบ&nbsp;</button>";
            } else {
              return "<font color=red>ยกเลิกรายการที่ " + txt + "</font>";
            }
          } else if (record.get("i_is_post") == 2) {
            // GX
            if (record.get("i_status_period") == 1) {
              // 1=เปิดงวด, 2=ปิดงวด
              if (record.get("i_source") == 1) {
                // 1=ยกเลิกได้, 2=ยกเลิกที่ต้นทาง
                return "<button style='font-size:11px; cursor:pointer; color: red;'>ยกเลิกรายการ</button>";
              } else {
                return "<font color=red>ยกเลิกรายการที่ " + txt + "</font>";
              }
            } else {
              return "<font color=red>ปิดงวด</font>";
            }
          }
        },
      },
      {
        id: "print",
        header: "พิมพ์",
        sortable: true,
        width: 50,
        dataIndex: "id",
        renderer: function (value, metaData, record, row, col, store, gridView) {
          metaData.attr = "align='center';";
          if (record.get("i_is_post") > 1) {
            return "<img src='../images/icons/printer_mono.png'); style='cursor:pointer;'/>";
          }
        },
      },
      {
        header: "GX",
        sortable: false,
        width: 90,
        dataIndex: "c_code",
        renderer: function (value, metaData, record, row, col, store, gridView) {
          metaData.attr = "align='center';";
          return value;
        },
      },
      {
        header: "GL",
        sortable: false,
        width: 90,
        dataIndex: "c_code_post",
        renderer: function (value, metaData, record, row, col, store, gridView) {
          metaData.attr = "align='center';";
          return value;
        },
      },
      {
        header: "เลขที่เอกสาร",
        sortable: true,
        width: 200,
        dataIndex: "c_ref_doc",
        renderer: function (value, metaData, record, row, col, store, gridView) {
          metaData.attr = "align='center';";
          return value;
        },
      },
      {
        header: "ข้อมูลต้นทาง",
        sortable: true,
        dataIndex: "table_name",
        renderer: function (value, metaData, record, row, col, store, gridView) {
          if (record.get("table_name") == "imp_expense_hdr") {
            var txt = "e-phis";
          } else if (record.get("table_name") == "imp_expense_vsn_hdr") {
            var txt = "vision net";
          } else if (record.get("table_name") == "gl_bank") {
            var txt = "BTN";
          } else if (record.get("table_name") == "imp_receive_hdr") {
            var txt = "รายได้";
          } else if (record.get("table_name") == "ar_bill_hdr" || record.get("table_name") == "ar_cut_hdr" || record.get("table_name") == "ar_receipt_hdr") {
            var txt = "ลูกหนี้";
          } else {
            var txt = "JV";
          }
          metaData.attr = "align='center';";
          return txt;
        },
      },
      {
        header: "วันที่บันทึกบัญชี",
        sortable: true,
        width: 100,
        dataIndex: "d_save_date",
        renderer: function (value, metaData, record, row, col, store, gridView) {
          metaData.attr = "align='center';";
          return shortThaiDate(value);
        },
      },
      {
        header: "วันที่เอกสาร",
        sortable: true,
        width: 100,
        dataIndex: "d_doc_date",
        renderer: function (value, metaData, record, row, col, store, gridView) {
          metaData.attr = "align='center';";
          return shortThaiDate(value);
        },
      },
      {
        header: "จำนวนเงิน",
        sortable: true,
        dataIndex: "f_total_amt",
        renderer: function (value, metaData, record, row, col, store, gridView) {
          metaData.attr = "align='right' style='color:blue; font-weight:bold;'";
          return floatRenderer(value);
        },
      },
      { id: "c_comment1", header: "คำอธิบาย", sortable: true, width: 200, dataIndex: "c_comment1" },
      { header: "ผู้สร้าง", sortable: true, dataIndex: "dc_user_create_id" },
      { header: "ผู้แก้ไข", sortable: true, dataIndex: "dc_user_update_id" },
      {
        header: "สถานะใช้งาน",
        sortable: false,
        width: 80,
        renderer: function (value, metaData, record, row, col, store, gridView) {
          metaData.attr = "align='center';";
          if (record.get("i_enable") == 1) {
            return "<img src='../images/icons/yes.gif');/>";
          } else {
            return "<img src='../images/icons/no.gif');/>";
          }
        },
      },
    ],
    //		autoExpandColumn: "c_comment1",
    bbar: pagingBar,
  }); //gridMain

  //============================== cellClick ==============================//
  cellClick = function (grid, rowIndex, columnIndex, e) {
    var record = grid.getStore().getAt(rowIndex);

    if (columnIndex == grid.getColumnModel().getIndexById("edit")) {
      if (I_PAGE == 2) {
      } else {
        if (record.get("i_enable") == 2) {
        } else if (record.get("i_is_post") == 1) {
          controllTab(record, "edit");
        } else if (record.get("i_is_post") == 2) {
          controllTab(record, "edit_hdr");
        }
      }
    } else if (columnIndex == grid.getColumnModel().getIndexById("edit_mini")) {
      if (I_PAGE == 3) {
      } else {
        if (record.get("i_enable") == 2) {
        } else if (record.get("i_is_post") == 2 || record.get("i_is_post") == 3) {
          controllTab(record, "edit_mini");
        }
      }
    } else if (columnIndex == grid.getColumnModel().getIndexById("delete")) {
      if (record.get("i_enable") == 2) {
      } else if (record.get("i_is_post") == 1) {
        // รอลงบัญชี
        if (record.get("i_source") == 1) {
          // 1 = ยกเลิกได้, 2=ยกเลิกที่ต้นทาง
          deleteHdr(record.get("id"), "DELETE");
        }
      } else if (record.get("i_is_post") == 2) {
        // GX
        if (record.get("i_status_period") == 1) {
          // 1=เปิดงวด,2=ปิดงวด
          if (record.get("i_source") == 1) {
            // 1 = ยกเลิกได้, 2=ยกเลิกที่ต้นทาง
            deleteHdr(record.get("id"), "DELETE_GX");
          }
        }
      }
    } else if (columnIndex == grid.getColumnModel().getIndexById("print")) {
      if (record.get("i_is_post") > 1) {
        Preview(record.data.id);
      }
    }
  }; //cellClick

  /*====================== CENTER ======================*/
  var center = new Ext.TabPanel({
    region: "center",
    border: false,
    //activeTab: 0, //default Tab
    id: "contenterCenter",
    defaults: { autoScroll: true },
    items: [gridMain],
  });
  // SET ref Grid&Tab
  Ext.getCmp("tabpanel1").on("cellclick", cellClick, this);

  // SetTab Controller Loads
  Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
  /*====================== RENDER ======================*/
  new Ext.Viewport({
    layout: "border",
    items: [center],
  });
});
