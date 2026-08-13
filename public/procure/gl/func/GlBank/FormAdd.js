Ext.HDR_ID = null;

const saveHdr = function(type) {
  var msg = "";
  var i_return = 3;
  var i_type_year = 9;

  if (Ext.getCmp("gl_dc_book_type_id_bank_id").getValue() == "") {
    msg += "- กรุณาเลือก ประเภทสมุดบัญชีธนาคาร<br>";
  }
  if (Ext.getCmp("gl_dc_book_type_id").getValue() == "") {
    msg += "- กรุณาเลือก ประเภทสมุดบัญชี<br>";
  }
  if (Ext.getCmp("dc_bank_acc_company_id_target").getValue() == "") {
    msg += "- กรุณาเลือก เลขที่บัญชีโอน<br>";
  }
  if (Ext.getCmp("dc_bank_acc_company_id_source").getValue() == "") {
    msg += "- กรุณาเลือก รับโอน<br>";
  }
  if (Ext.getCmp("dc_bank_acc_company_id_source2").getValue() == "") {
    msg += "- กรุณาเลือก เลขที่บัญชีเงินฝาก<br>";
  }
  if (Ext.getCmp("dc_acc_id").getValue() == "") {
    msg += "- กรุณาเลือก รหัสบัญชี<br>";
  }
  if (Ext.getCmp("d_doc_date").getValue() == "") {
    msg += "- กรุณากรอก วันที่เอกสาร<br>";
  }
  if (Ext.getCmp("d_save_jv_date").getValue() == "") {
    msg += "- กรุณากรอก วันที่บันทึกบัญชี<br>";
  }
  if (Ext.getCmp("f_money").getValue() == "") {
    msg += "- กรุณากรอก จำนวนเงิน<br>";
  }
  if (Ext.getCmp("dc_acc_id").getValue() != "") {
    var i_group = Ext.getStoreItems(Ext.dc_acc, Ext.getCmp("dc_acc_id").getValue(), "i_group");

    var i_return = Ext.getCmp("i_return").getValue().inputValue;
    var i_type_year = Ext.getCmp("i_type_year").getValue().inputValue;
  }
  if (msg == "") {
    Ext.getCmp("frm-Add")
      .getEl()
      .mask("Please wait...", "x-mask-loading");
    Ext.Ajax.request({
      url: "api/mn_GlBank.php",
      method: "POST",
      params: {
        mode: Ext.getCmp("role-form-mode").getValue(),
        id: Ext.getCmp("id").getValue(),
        c_doc: Ext.getCmp("c_doc").getValue(),
        c_doc_bank: Ext.getCmp("c_doc_bank").getValue(),
        gl_dc_book_type_id_bank_id: Ext.getCmp("gl_dc_book_type_id_bank_id").getValue(),
        gl_dc_book_type_id: Ext.getCmp("gl_dc_book_type_id").getValue(),
        dc_bank_acc_company_id_target: Ext.getCmp("dc_bank_acc_company_id_target").getValue(),
        dc_bank_acc_company_id_source: Ext.getCmp("dc_bank_acc_company_id_source").getValue(),
        dc_bank_acc_company_id_source2: Ext.getCmp("dc_bank_acc_company_id_source2").getValue(),
        dc_acc_id: Ext.getCmp("dc_acc_id").getValue(),
        d_doc_date: Ext.util.Format.date(Ext.getCmp("d_doc_date").getValue(), "Y-m-d"),
        d_save_jv_date: Ext.util.Format.date(Ext.getCmp("d_save_jv_date").getValue(), "Y-m-d"),
        f_money: Ext.getCmp("f_money")
          .getValue()
          .replace(/,/g, ""),
        c_comment: Ext.getCmp("c_comment").getValue(),
        i_type_jv: Ext.getCmp("i_type_jv").getValue().inputValue,
        i_return: i_return,
        i_type_year: i_type_year,
        c_budget_year: Ext.getCmp("c_budget_year").getValue(),
        dc_expense_budget_type_id: Ext.getCmp("dc_expense_budget_type_id_IDX").getValue()
      },
      success: function(result, request) {
        Ext.getCmp("frm-Add")
          .getEl()
          .unmask();
        let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
        if (jsonData.success == true) {
          Ext.store.load({ params: { mode: "" } });
          Ext.getCmp("id").setValue(jsonData.id);
          Ext.getCmp("role-form-mode").setValue("EDIT");
          Ext.Msg.alert("แจ้งเตือน", "บันทึกเรียบร้อย");
          Ext.HDR_ID = jsonData.id;
          Ext.getCmp("GENCODE").show();
        } else {
          Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg);
        }
      },
      failure: function(result, request) {
        Ext.MessageBox.alert("Failed", result.responseText); // connect error
      }
    });
  } else {
    Ext.Msg.alert("แจ้งเตือน", msg);
  }
}; // saveHdr

gencode = function() {
  Ext.getCmp("frm-Add")
    .getEl()
    .mask("Please wait...", "x-mask-loading");
  Ext.Ajax.request({
    url: "api/mn_GlBank.php",
    method: "POST",
    params: {
      mode: "GENCODE",
      id: Ext.HDR_ID
    },
    success: function(result, request) {
      Ext.getCmp("frm-Add")
        .getEl()
        .unmask();
      var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
      if (jsonData.success == true) {
        Ext.store.load({ params: { mode: "" } });
        Ext.Msg.alert("แจ้งเตือน", jsonData.msg);
        Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
      } else {
        Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg);
      }
    },
    failure: function(result, request) {
      Ext.MessageBox.alert("Failed", result.responseText); // connect error
    }
  });
}; // gencode

// Class Extend
formAdd = function(args) {
  Ext.getCmp("contenterCenter")
    .getEl()
    .mask("Please wait...", "x-mask-loading");
  Ext.dc_bank_acc_company.setBaseParam("filter", "c_code");
  Ext.dc_bank_acc_company.setBaseParam("value", "");
  Ext.dc_bank_acc_company.setBaseParam("mode", "SEARCH");
  Ext.dc_bank_acc_company.load({
    callback: function(records, operation, success) {
      if (success == true) {
        this.chkMask = true;
        Ext.getCmp("contenterCenter")
          .getEl()
          .unmask();
      }
    }
  });

  var targetPop = new Ext.ux.Poplov({
    fieldLabel: "เลขที่บัญชีโอน",
    id: "dc_bank_acc_company_id_target",
    iconCls: "page_magnify",
    store: Ext.dc_bank_acc_company,
    widthText: 500,
    headerGrid: [
      {
        header: "ID System",
        sortable: true,
        hidden: true,
        dataIndex: "id"
      },
      {
        id: "c_bank_name",
        header: "ธนาคาร",
        sortable: true,
        dataIndex: "c_bank_name",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "style= 'cursor:pointer';";
          return value;
        }
      },
      {
        id: "c_branch_name",
        header: "สาขา",
        sortable: true,
        dataIndex: "c_branch_name",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "style= 'cursor:pointer';";
          return value;
        }
      },
      {
        id: "c_code",
        header: "เลขที่บัญชี",
        sortable: true,
        dataIndex: "c_code",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "style= 'cursor:pointer';";
          return value;
        }
      },
      {
        id: "c_name",
        header: "ชื่อ",
        sortable: true,
        dataIndex: "c_name",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "style= 'cursor:pointer';";
          return value;
        }
      },
      {
        id: "c_type_name",
        header: "ประเภท",
        sortable: true,
        dataIndex: "c_type_name",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "style= 'cursor:pointer';";
          return value;
        }
      },
      {
        id: "c_code_acc",
        header: "รหัส",
        sortable: true,
        dataIndex: "c_code_acc",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "style= 'cursor:pointer';";
          return value;
        }
      },
      {
        id: "c_name_acc",
        header: "ผังบัญชี",
        sortable: true,
        dataIndex: "c_name_acc",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "style= 'cursor:pointer';";
          return value;
        }
      }
    ],
    isCellClickGrid: true,
    cellClickGrid: function(grid, rowIndex, columnIndex, e) {
      var record = grid.getStore().getAt(rowIndex);

      Ext.getCmp("dc_bank_acc_company_id_target").setValue(record.data.id);
      Ext.getCmp("dc_bank_acc_company_id_target_Name").setValue(record.data.c_code + " : " + record.data.c_name);

      Ext.getCmp("win-pop-lovdc_bank_acc_company_id_target").destroy();
    }
  });
  var sourcePop = new Ext.ux.Poplov({
    fieldLabel: "รับโอน",
    id: "dc_bank_acc_company_id_source",
    iconCls: "page_magnify",
    store: Ext.dc_bank_acc_company,
    widthText: 500,
    headerGrid: [
      {
        header: "ID System",
        sortable: true,
        hidden: true,
        dataIndex: "id"
      },
      {
        id: "c_bank_name",
        header: "ธนาคาร",
        sortable: true,
        dataIndex: "c_bank_name",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "style= 'cursor:pointer';";
          return value;
        }
      },
      {
        id: "c_branch_name",
        header: "สาขา",
        sortable: true,
        dataIndex: "c_branch_name",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "style= 'cursor:pointer';";
          return value;
        }
      },
      {
        id: "c_code",
        header: "เลขที่บัญชี",
        sortable: true,
        dataIndex: "c_code",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "style= 'cursor:pointer';";
          return value;
        }
      },
      {
        id: "c_name",
        header: "ชื่อ",
        sortable: true,
        dataIndex: "c_name",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "style= 'cursor:pointer';";
          return value;
        }
      },
      {
        id: "c_type_name",
        header: "ประเภท",
        sortable: true,
        dataIndex: "c_type_name",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "style= 'cursor:pointer';";
          return value;
        }
      },
      {
        id: "c_code_acc",
        header: "รหัส",
        sortable: true,
        dataIndex: "c_code_acc",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "style= 'cursor:pointer';";
          return value;
        }
      },
      {
        id: "c_name_acc",
        header: "ผังบัญชี",
        sortable: true,
        dataIndex: "c_name_acc",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "style= 'cursor:pointer';";
          return value;
        }
      }
    ],
    isCellClickGrid: true,
    cellClickGrid: function(grid, rowIndex, columnIndex, e) {
      var record = grid.getStore().getAt(rowIndex);

      Ext.getCmp("dc_bank_acc_company_id_source").setValue(record.data.id);
      Ext.getCmp("dc_bank_acc_company_id_source_Name").setValue(record.data.c_code + " : " + record.data.c_name);

      Ext.getCmp("win-pop-lovdc_bank_acc_company_id_source").destroy();
    }
  });
  var source2Pop = new Ext.ux.Poplov({
    fieldLabel: "เลขที่บัญชีเงินฝาก",
    id: "dc_bank_acc_company_id_source2",
    iconCls: "page_magnify",
    store: Ext.dc_bank_acc_company,
    widthText: 500,
    headerGrid: [
      {
        header: "ID System",
        sortable: true,
        hidden: true,
        dataIndex: "id"
      },
      {
        id: "c_bank_name",
        header: "ธนาคาร",
        sortable: true,
        dataIndex: "c_bank_name",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "style= 'cursor:pointer';";
          return value;
        }
      },
      {
        id: "c_branch_name",
        header: "สาขา",
        sortable: true,
        dataIndex: "c_branch_name",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "style= 'cursor:pointer';";
          return value;
        }
      },
      {
        id: "c_code",
        header: "เลขที่บัญชี",
        sortable: true,
        dataIndex: "c_code",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "style= 'cursor:pointer';";
          return value;
        }
      },
      {
        id: "c_name",
        header: "ชื่อ",
        sortable: true,
        dataIndex: "c_name",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "style= 'cursor:pointer';";
          return value;
        }
      },
      {
        id: "c_type_name",
        header: "ประเภท",
        sortable: true,
        dataIndex: "c_type_name",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "style= 'cursor:pointer';";
          return value;
        }
      },
      {
        id: "c_code_acc",
        header: "รหัส",
        sortable: true,
        dataIndex: "c_code_acc",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "style= 'cursor:pointer';";
          return value;
        }
      },
      {
        id: "c_name_acc",
        header: "ผังบัญชี",
        sortable: true,
        dataIndex: "c_name_acc",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "style= 'cursor:pointer';";
          return value;
        }
      }
    ],
    isCellClickGrid: true,
    cellClickGrid: function(grid, rowIndex, columnIndex, e) {
      var record = grid.getStore().getAt(rowIndex);

      Ext.getCmp("dc_bank_acc_company_id_source2").setValue(record.data.id);
      Ext.getCmp("dc_bank_acc_company_id_source2_Name").setValue(record.data.c_code + " : " + record.data.c_name);

      Ext.getCmp("win-pop-lovdc_bank_acc_company_id_source2").destroy();
    }
  });

  formAdd.superclass.constructor.call(this, {
    region: "center",
    title: "ข้อมูล" + Ext.title_panel,
    iconCls: "icon-application-form-add",
    id: "frm-Add",
    border: false,
    stripeRows: true,
    loadMask: true,
    listeners: {
      afterrender: function(obj, eOpts) {}
    },
    items: [
      {
        xtype: "form",
        id: "form-widgets",
        frame: true,
        labelAlign: "right",
        labelWidth: 200,
        bodyStyle: { padding: "10px 20px" },
        defaults: { anchor: "100%", msgTarget: "side", allowBlank: false },
        items: [
          {
            xtype: "container",
            layout: "hbox",
            align: "stretch",
            RemoveHeight: true,
            defaults: { xtype: "fieldset", flex: 1, margins: "0px 3px", autoHeight: true },
            items: [
              {
                title: "บันทึกข้อมูล " + Ext.title_panel,
                RemoveCls: "x-box-item",
                collapsible: true,
                collapsed: false,
                defaults: { labelStyle: "width:200px;", allowBlank: true },
                items: [
                  {
                    xtype: "hidden",
                    id: "role-form-mode",
                    name: "mode",
                    readOnly: true
                  },
                  {
                    xtype: "hidden",
                    id: "id",
                    name: "id",
                    readOnly: true
                  },
                  {
                    xtype: "radiogroup",
                    id: "i_type_jv",
                    fieldLabel: "ประเภทเอกสาร",
                    columns: [250],
                    items: [
                      {
                        boxLabel: "บันทึกบัญชีโอนระหว่างธนาคารและเงินสด",
                        name: "i_type_jv",
                        inputValue: 1
                      },
                      {
                        boxLabel: "บันทึกบัญชีโอนระหว่างธนาคารและบัญชีอื่นๆ",
                        name: "i_type_jv",
                        inputValue: 2,
                        checked: true
                      }
                    ]
                  },
                  {
                    xtype: "textfield",
                    fieldLabel: "เลขที่อ้างอิงธนาคาร",
                    id: "c_doc_bank",
                    name: "c_doc_bank",
                    width: 200
                  },
                  new Ext.form.ComboBox({
                    fieldLabel: "ประเภทสมุดบัญชีธนาคาร",
                    id: "gl_dc_book_type_id_bank_id",
                    name: "gl_dc_book_type_id_bank_id",
                    store: Ext.gl_dc_book_type,
                    valueField: "id",
                    displayField: "c_name",
                    mode: "local",
                    triggerAction: "all",
                    emptyText: "กรุณาเลือก...",
                    width: 200,
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    listeners: {
                      beforequery: function(q) {
                        if (q.query) {
                          var length = q.query.length;
                          q.query = new RegExp(Ext.escapeRe(q.query));
                          q.query.length = length;
                        }
                      },
                      blur: function() {
                        this.getStore().clearFilter();
                      }
                    }
                  }),
                  {
                    xtype: "compositefield",
                    id: "span_target",
                    anchor: "100%",
                    msgTarget: "under",
                    items: [targetPop.mini]
                  },
                  {
                    xtype: "compositefield",
                    id: "span_source",
                    anchor: "100%",
                    msgTarget: "under",
                    items: [sourcePop.mini]
                  },
                  {
                    xtype: "textfield",
                    fieldLabel: "เลขที่อ้างอิง",
                    id: "c_doc",
                    name: "c_doc",
                    width: 200
                  },
                  new Ext.form.ComboBox({
                    fieldLabel: "ประเภทสมุดบัญชี",
                    id: "gl_dc_book_type_id",
                    name: "gl_dc_book_type_id",
                    store: Ext.gl_dc_book_type,
                    valueField: "id",
                    displayField: "c_name",
                    mode: "local",
                    triggerAction: "all",
                    emptyText: "กรุณาเลือก...",
                    width: 200,
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    listeners: {
                      afterrender: function() {
                        this.fn = function() {};
                      },
                      Change: function(value) {
                        this.fn();
                      },
                      beforequery: function(q) {
                        if (q.query) {
                          var length = q.query.length;
                          q.query = new RegExp(Ext.escapeRe(q.query));
                          q.query.length = length;
                        }
                      },
                      blur: function() {
                        this.getStore().clearFilter();
                      }
                    }
                  }),
                  {
                    xtype: "compositefield",
                    id: "span_source2",
                    anchor: "100%",
                    msgTarget: "under",
                    items: [source2Pop.mini]
                  },
                  new Ext.form.ComboBox({
                    fieldLabel: "รหัสบัญชี",
                    id: "dc_acc_id",
                    name: "dc_acc_id",
                    store: Ext.dc_acc,
                    valueField: "id",
                    displayField: "c_name",
                    mode: "local",
                    triggerAction: "all",
                    emptyText: "กรุณาเลือก...",
                    width: 500,
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    listeners: {
                      afterrender: function() {
                        this.fn = function(chk = false) {
                          var i_group = Ext.getStoreItems(Ext.dc_acc, this.getValue(), "i_group");

                          Ext.getCmp("i_return").show();
                          Ext.getCmp("i_type_year").show();
                          Ext.getCmp("dc_expense_budget_type_id_IDX").show();
                          Ext.getCmp("c_budget_year").show();

                          if (chk == false) {
                            Ext.getCmp("i_return3").setValue(true);
                            Ext.getCmp("i_type_year9").setValue(true);
                          }
                        };
                      },
                      Change: function(value) {
                        this.fn();
                      },
                      beforequery: function(q) {
                        if (q.query) {
                          var length = q.query.length;
                          q.query = new RegExp(Ext.escapeRe(q.query));
                          q.query.length = length;
                        }
                      },
                      blur: function() {
                        this.getStore().clearFilter();
                      }
                    }
                  }),
                  {
                    xtype: "radiogroup",
                    id: "i_return",
                    fieldLabel: "สถานะเป็นรายการหักส่งคืน",
                    columns: [70, 70, 150],
                    hidden: true,
                    items: [
                      {
                        boxLabel: "หักส่งคืน",
                        id: "i_return1",
                        name: "i_return",
                        inputValue: 1
                      },
                      {
                        boxLabel: "ปรับปรุง",
                        id: "i_return2",
                        name: "i_return",
                        inputValue: 2
                      },
                      {
                        boxLabel: "ไม่ระบุ",
                        id: "i_return3",
                        name: "i_return",
                        inputValue: 3
                      }
                    ]
                  },
                  {
                    xtype: "radiogroup",
                    id: "i_type_year",
                    fieldLabel: "งบประมาณ",
                    columns: [130, 100, 190],
                    hidden: true,
                    items: [
                      {
                        boxLabel: "ไม่ระบุปีงบประมาณ",
                        id: "i_type_year9",
                        name: "i_type_year",
                        inputValue: 9
                      },
                      {
                        boxLabel: "ปีงบประมาณ",
                        id: "i_type_year1",
                        name: "i_type_year",
                        inputValue: 1
                      },
                      {
                        boxLabel: "เหลื่อมปีงบประมาณ",
                        id: "i_type_year2",
                        name: "i_type_year",
                        inputValue: 2
                      }
                    ]
                  },
                  new Ext.form.ComboBox({
                    fieldLabel: "",
                    id: "c_budget_year",
                    width: 200,
                    mode: "local",
                    store: Ext.store_year,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    hidden: true,
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    value: new Date().getFullYear(),
                    listeners: {
                      change: function(combo, newValue) {
                        if (newValue == "") {
                          combo.reset();
                        }
                      },
                      beforequery: function(q) {
                        if (q.query) {
                          var length = q.query.length;
                          q.query = new RegExp(Ext.escapeRe(q.query));
                          q.query.length = length;
                        }
                      },
                      blur: function() {
                        this.getStore().clearFilter();
                      }
                    }
                  }),
                  new Ext.form.ComboBox({
                    fieldLabel: "แหล่งเงิน",
                    id: "dc_expense_budget_type_id_IDX",
                    name: "dc_expense_budget_type_id",
                    store: Ext.dc_expense_budget_type,
                    valueField: "id",
                    displayField: "c_name",
                    mode: "local",
                    hidden: true,
                    triggerAction: "all",
                    emptyText: "กรุณาเลือก...",
                    width: 400,
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    listeners: {
                      beforequery: function(q) {
                        if (q.query) {
                          var length = q.query.length;
                          q.query = new RegExp(Ext.escapeRe(q.query));
                          q.query.length = length;
                        }
                      },
                      blur: function() {
                        this.getStore().clearFilter();
                      }
                    }
                  }),
                  {
                    xtype: "datefield",
                    fieldLabel: "วันที่เอกสาร",
                    id: "d_doc_date",
                    name: "d_doc_date",
                    width: 200,
                    value: addY(543)
                  },
                  {
                    xtype: "datefield",
                    fieldLabel: "วันที่บันทึกบัญชี",
                    id: "d_save_jv_date",
                    name: "d_save_jv_date",
                    width: 200,
                    value: addY(543)
                  },
                  new Ext.form.TextField({
                    fieldLabel: "จำนวนเงิน",
                    id: "f_money",
                    style: "text-align: right",
                    width: 200,
                    listeners: {
                      afterrender: function() {
                        this.fn = function() {
                          this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
                        };
                      },
                      Change: function(value) {
                        this.fn();
                      }
                    }
                  }),
                  {
                    xtype: "textarea",
                    fieldLabel: "หมายเหตุ",
                    id: "c_comment",
                    name: "c_comment",
                    width: 300
                  }
                ]
              }
            ]
          }
        ],
        buttonAlign: "left",
        buttons: [
          {
            text: "&nbsp;" + Ext.GLOBAL_BU_SAVE_TH + "&nbsp;",
            id: "saveHdr",
            iconCls: "icon-save",
            disabled: Ext.butt == "add" || Ext.butt == "edit" ? false : true,
            handler: function() {
              saveHdr(false);
            }
          },
          {
            text: "&nbsp;บันทึกเลขที่เอกสาร&nbsp;",
            id: "GENCODE",
            iconCls: "icon-save",
            disabled: Ext.butt == "add" || Ext.butt == "edit" ? false : true,
            handler: function() {
              gencode();
            }
          },
          {
            text: Ext.GLOBAL_BU_BACK_TH,
            handler: function() {
              Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
              Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"), true) || {}; // null obj not errer
            }
          }
        ]
      }
    ]
  });
}; // formAdd
Ext.extend(formAdd, Ext.Panel, {});
