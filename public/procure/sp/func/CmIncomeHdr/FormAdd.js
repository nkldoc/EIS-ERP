Ext.HDR_ID = null;
Ext.HDR_c_yyyy_mm = null;
Ext.title_panel = "แบบไม่มี PR";
// const showExpenseBudget = function (dc_expense_budget_type_id) {
//   if (dc_expense_budget_type_id != "") {
//    Ext.getCmp("dc_expense_budget_type_id").show();
//  }
// };

const saveHdr = function (type) {
    let msg = "";
    let PanelDtl = new formPanelDtl();
    Ext.getCmp("contenterCenter").add(PanelDtl);
    Ext.getCmp("contenterCenter").setActiveTab(PanelDtl);

    return false;

  if (Ext.getCmp("c_doc").getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณากรอก เอกสารอ้างอิง</span><br>";
  }

  if (Ext.getCmp("dc_cost_id").getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณาเลือก ส่วนงาน</span><br>";
  }

  // if (Ext.getCmp("dc_expense_budget_type_id").getValue() == "" && Ext.getCmp("dc_expense_budget_type_id").getValue() == 0) {
  //   msg += "<span style='white-space: nowrap;'>- กรุณาเลือก แหล่งเงิน</span><br>";
  // }

  if (Ext.I_REC_MENU_TYPE == Ext.DATA_REC_MENU_TYPE_TRANF || Ext.I_REC_MENU_TYPE == Ext.DATA_REC_MENU_TYPE_BORROW_TRANF) {
    let dc_bank_target = Ext.getCmp("dc_bank_acc_company_id").getValue();
    if (dc_bank_target == "" || dc_bank_target == "0") {
      msg += "<span style='white-space: nowrap;'>- กรุณาเลือก เลขที่บัญชีรับโอน</span><br>";
    }
  }

  if (Ext.I_REC_MENU_TYPE == Ext.DATA_REC_MENU_TYPE_CASH || Ext.I_REC_MENU_TYPE == Ext.DATA_REC_MENU_TYPE_CHEQUE || Ext.I_REC_MENU_TYPE == Ext.DATA_REC_MENU_TYPE_BORROW_CASH) {
    let dc_config_id = Ext.getCmp("gl_dc_config_id").getValue();
    if (dc_config_id == "" || dc_config_id == "0") {
      msg += "<span style='white-space: nowrap;'>- กรุณาเลือก Config ผัง เงินสด/โอน</span><br>";
    }
  }

  if (Ext.getCmp("d_import_date").getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณากรอก วันที่ Load ใบเสร็จ</span><br>";
  }

  var c1 = String(Ext.getCmp("c_yyyy").getValue());
  var c2 = String(Ext.getCmp("c_mm").getValue());
  var c2_len = c2.length;
  var i_panda = c2_len == "1" ? "0".concat(c2) : c2;
  var c_mon_year = c1.concat(i_panda);

  if (msg == "") {
    Ext.getCmp("frm-Add").getEl().mask("Please wait...", "x-mask-loading");
    Ext.Ajax.request({
      url: "api/mn_ImportCmIncomeHdr.php",
      method: "POST",
      params: {
        mode: Ext.getCmp("role-form-mode").getValue(),
        id: Ext.getCmp("id").getValue(),
        c_doc: Ext.getCmp("c_doc").getValue(),
        dc_cost_id: Ext.getCmp("dc_cost_id").getValue(),
        dc_bank_acc_company_id: Ext.I_REC_MENU_TYPE == Ext.DATA_REC_MENU_TYPE_TRANF || Ext.I_REC_MENU_TYPE == Ext.DATA_REC_MENU_TYPE_BORROW_TRANF ? Ext.getCmp("dc_bank_acc_company_id").getValue() : "",
        // dc_expense_budget_type_id: Ext.getCmp("dc_expense_budget_type_id").getValue(),
        // dc_acc_id_hdr: Ext.getCmp("dc_acc_id_hdr").getValue(),
        d_import_date: Ext.util.Format.date(Ext.getCmp("d_import_date").getValue(), "Y-m-d"),
        gl_dc_config_id: Ext.I_REC_MENU_TYPE == Ext.DATA_REC_MENU_TYPE_CASH || Ext.I_REC_MENU_TYPE == Ext.DATA_REC_MENU_TYPE_CHEQUE || Ext.I_REC_MENU_TYPE == Ext.DATA_REC_MENU_TYPE_BORROW_CASH ? Ext.getCmp("gl_dc_config_id").getValue() : "",
        cm_receive_type_id: Ext.getCmp("cm_receive_type_id").getValue(),
        c_mm: Ext.getCmp("c_mm").getValue(),
        c_yyyy: Ext.getCmp("c_yyyy").getValue(),
        c_comment: Ext.getCmp("c_comment").getValue(),
        i_type_income: Ext.I_REC_MENU_TYPE,
        i_enable: 1,
      },
      success: function (result, request) {
        Ext.getCmp("frm-Add").getEl().unmask();
        let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
        if (jsonData.success == true) {
          Ext.store.load({ params: { mode: "" } });
          Ext.getCmp("id").setValue(jsonData.id);
          Ext.getCmp("role-form-mode").setValue("EDIT");
          Ext.Msg.alert("แจ้งเตือน", "บันทึกเรียบร้อย");
          Ext.HDR_ID = jsonData.id;
          Ext.HDR_c_yyyy_mm = c_mon_year;

          // ============ PanelDtl ============ //
          let PanelDtl = new formPanelDtl();
          Ext.getCmp("contenterCenter").add(PanelDtl);
          Ext.getCmp("contenterCenter").setActiveTab(PanelDtl);
          Ext.storeDtl.reload()
          Ext.dc_map_bookbank_acc.reload()
          Ext.dc_expense_budget_type.setBaseParam("dc_cost_ids", Ext.getCmp("dc_cost_id").getValue());
          Ext.dc_expense_budget_type.reload();
        } else {
          Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg);
        }
      },
      failure: function (result, request) {
        Ext.MessageBox.alert("Failed", result.responseText); // connect error
      },
    });
  } else {
    Ext.Msg.alert("แจ้งเตือน", msg);
  }
}; // saveHdr

// Class Extend
formAdd = function (args) {
    Ext.storeCreditor = new Ext.data.JsonStore({
        //autoLoad: true,
        storeId: "myStoreCont",
        url: "tor/api/mnTorController.php",
        baseParams: {mode: "LIST_POP_CREDITOR"},
        root: "data",
        idProperty: "id",
        totalProperty: "totalCount",
        fields: [{name: "no"}, {name: "dc_creditor_id"}, {name: "c_tax_number_imp"}, {name: "c_name"}, {name: "f_total_price"}],
    });
    var columnMini = [
        {
            header: "ID System",
            sortable: true,
            hidden: true,
            dataIndex: "dc_creditor_id",
        },
        {
            header: "",
            sortable: true,
            hidden: true,
            dataIndex: "c_code",
        },
        {
            header: "เลขที่ประจำตัวผู้เสียภาษี",
            align: "center",
            width: 150,
            sortable: true,
            dataIndex: "c_tax_number_imp",
        },
        {
            header: "ชื่อ",
            sortable: true,
            id: "c_name",
            dataIndex: "c_name",
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                metaData.attr = "style='cursor:pointer';";
                return value;
            },
        },
        {
            header: "วงเงิน",
            align: "right",
            width: 150,
            sortable: true,
            dataIndex: "f_total_price",
        },
    ];
    var columnMini2 = [
        {header: "ID System", sortable: true, hidden: true, dataIndex: "id"},
        {header: "รหัสหมวดสินทรัพย์", sortable: true, dataIndex: "c_code"},
        {
            header: "ชื่อ",
            sortable: true,
            id: "c_name",
            dataIndex: "c_name",
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                metaData.attr = "style='cursor:pointer';";
                return value;
            },
        },
    ];
    var PopCreditorForm = new Ext.Poplov_in({
        text: "เลือกผู้เสนอราคา",
        id: "dc_creditor_id2ID",
        iconCls: "page_magnify",
        valueHidden: "dc_creditor_id",
        store: Ext.storeCreditor,
        headerGrid: columnMini,
        widthText: 280,
        fieldLabel: "เลือกผู้เสนอราคา",
        isCellClickGrid: true,
        cellClickGrid: function (grid, rowIndex, columnIndex, e) {
            var id = "dc_creditor_id2ID";
            var nameID = id + "_Name";
            var record = grid.getStore().getAt(rowIndex);
            var c_tax_number_imp = record.data.c_tax_number_imp == null ? "(ไม่มีเลขที่ประจำตัวผู้เสียภาษี)" : record.data.c_tax_number_imp;
            var TextShow = c_tax_number_imp + " : " + record.data.c_name;
            // Ext.getCmp("f_totalID1").setValue(record.data.f_total_price);
            // Ext.getCmp("f_totalID2").setValue(record.data.f_total_price);
            Ext.getCmp("dc_creditor_idID").setValue(record.data.dc_creditor_id);
            Ext.getCmp(nameID).setValue(TextShow);
            Ext.getCmp("win-pop-lov" + id).hide();
            Ext.getCmp("win-pop-lov" + id).destroy();
        },
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
      afterrender: function (obj, eOpts) {},
    },
    items: [
      {
        xtype: "form",
        id: "form-widgets",
        frame: true,
        labelAlign: "right",
        labelWidth: 150,
        bodyStyle: { padding: "10px 20px" },
        defaults: { anchor: "100%", msgTarget: "side", allowBlank: false },
        items: [
          {
            xtype: "container",
            layout: "hbox",
            align: "stretch",
                        RemoveHeight: true,
                        labelWidth: 200,
            defaults: { xtype: "fieldset", flex: 1, margins: "0px 3px", autoHeight: true },
            items: [
              {
                title: "บันทึกข้อมูล " + Ext.title_panel,
                RemoveCls: "x-box-item",
                collapsible: true,
                collapsed: false,
                defaults: { labelStyle: "width:150px;", allowBlank: true },
                items: [
                  {
                    xtype: "hidden",
                    id: "role-form-mode",
                    name: "mode",
                    readOnly: true,
                  },
                  {
                    xtype: "hidden",
                    id: "id",
                    name: "id",
                                        readOnly: true,
                  },
                  {
                    xtype: "textfield",
                    fieldLabel: "เอกสารอ้างอิง",
                    id: "c_doc",
                    name: "c_doc",
                    width: 200,
                                    },
                                    new Ext.form.ComboBox({
                                        mode: "local",
//            readOnly: true,
                                        fieldLabel: "ปีงบประมาณ",
                                        submitValue: true,
                                        hiddenName: "i_yyyy",
                                        name: "i_year",
                                        store: Ext.store_year,
                                        valueField: "id",
                                        displayField: "c_name",
                                        value: Ext.bgYear,
                                        triggerAction: "all",
                                        forceSelection: true,
                                        selectOnFocus: true,
                                        typeAhead: false,
                                        emptyText: "กรุณาเลือกปีงบประมาณ...",
                                        listeners: {
                                            afterrender: function () {
                                                this.fn = function () {};
                                            },
                                            Change: function () {
                                                this.fn();
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
                                    new Ext.form.ComboBox({
                                        mode: "local",
                                        store: Ext.dc_expense_budget_type,
                                        fieldLabel: "แหล่งเงิน",
                                        anchor: "100%",
                                        submitValue: true,
                                        name: "dc_expense_budget_type_idTxt",
                                        hiddenName: "dc_expense_budget_type_id",
                                        //po_expense_group_id
                                        valueField: "id",
                                        displayField: "c_name",
                                        triggerAction: "all",
                                        forceSelection: true,
                                        selectOnFocus: true,
                                        typeAhead: false,
                                        emptyText: "กรุณาเลือกแหล่งเงิน...",
                                        validator: function (val) {
                                            if (!Ext.isEmpty(val)) {
                                                return true;
                                            } else {
                                                return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                            }
                                        },
                                        listeners: {
                                            afterrender: function () {
                                                this.fn = function () {};
                                            },
                                            Change: function () {
                                                this.fn();
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
                                    new Ext.form.ComboBox({
                                        mode: "local",
                                        store: Ext.po_expense,
                                        valueField: "id",
                                        displayField: "c_name",
                                        anchor: "100%",
                                        submitValue: true,
                                        name: "c_detail",
                                        hiddenName: "po_expense_id",
                                        triggerAction: "all",
                                        allBlank: true,
                                        forceSelection: true,
                                        selectOnFocus: true,
                                        fieldLabel: "รายการย่อย",
                                        width: 200,
                                        typeAhead: false,
                                        emptyText: "กรุณาเลือกใช้จ่าย...",
                                        validator: function (val) {
                                            if (!Ext.isEmpty(val)) {
                                                return true;
                                            } else {
                                                return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                            }
                                        },
                                        listeners: {
                                            afterrender: function () {
                                                this.fn = function () {};
                                            },
                                            Change: function () {
                                                this.fn();
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
                                    {
                                        xtype: "compositefield",
                                        id: "dc_creditor_idID_pop",
                                        fieldLabel: "เลือกผู้ชนะ ผู้ขาย/ผู้รับจ้าง",
                                        msgTarget: "side",
                                        // anchor: "",
                                        defaults: {
                                            flex: 1,
                                        },
                                        items: [PopCreditorForm.mini],
                                    },
                  {
                    xtype: "textarea",
                    fieldLabel: "หมายเหตุ",
                    readOnly: Ext.butt == "add" || Ext.butt == "edit" ? false : true,
                    id: "c_comment",
                    name: "c_comment",
                    width: 300,
                  },
                ],
              },
            ],
          },
        ],
        buttonAlign: "left",
        buttons: [
          {
            text: "&nbsp;" + Ext.GLOBAL_BU_SAVE_TH + "&nbsp;",
            id: "saveHdr",
            iconCls: "icon-save",
            disabled: Ext.butt == "add" || Ext.butt == "edit" ? false : true,
            handler: function () {
              saveHdr(false);
            },
          },
          {
            text: Ext.GLOBAL_BU_BACK_TH,
            handler: function () {
              Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
              Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"), true) || {}; // null obj not errer
            },
          },
        ],
      },
    ],
  });
}; // formAdd
Ext.extend(formAdd, Ext.Panel, {});
