var AppPoStore = function (statuss) {
    function checkID(row) {
  var models = Ext.getCmp("gridEditor2").getStore().getRange();
  if (document.getElementById("chk_" + row).checked == true) {
    models[row].set("CheckColumn", true);
  } else {
    models[row].set("CheckColumn", false);
    document.getElementById("f_bid" + row).value = null;
    document.getElementById("f_bid_total" + row).value = null;
  }
}
function change_f_bid(type, row) {
    
//    alert(type);
//    console.log(row);
//   return false;
  var models = Ext.getCmp("gridEditor2").getStore().getRange();
  var num2 = Ext.getCmp("gridEditor2").store.data.items[row].data.f_unit_price;
  var num = Ext.getCmp("gridEditor2").store.data.items[row].data.i_qty;
  // num2 = num2 ? num2.replace(/,/g, "") : "";
  if (type == 1) {
    if (document.getElementById("f_bid" + row).value.replace(/\,/g,'') > 0) {
      var f_bid = document.getElementById("f_bid" + row).value.replace(/\,/g,'');
      models[row].set("CheckColumn", true);
      // document.getElementById("chk_" + row).checked = true;
      var f_did_total = f_bid * num;
      
      
//      document.getElementById("f_bid" + row).value = floatMinus(f_bid, 2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
//      document.getElementById("f_bid_total" + row).value = floatMinus(f_did_total, 2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

      var originalNum = Ext.selectRow.get('f_total_amt').replace(/\,/g,''); 
      var cleanNum = originalNum.replace(/\,/g,'');
      var f_total_amt = parseFloat(cleanNum);
      
      
      if(f_total_amt < f_did_total){
        Ext.MessageBox.alert('แจ้งเตือนยอดเงินเกิน !',
        'เงินที่จอง : '+ Ext.selectRow.get('f_total_amt') +
        '\nเงินหลังต่อรอง : '+ Ext.floatRenderer(f_did_total)); 
         document.getElementById("f_bid_total" + row).value =0.00;
         document.getElementById("f_bid" + row).value  =0.00;
      }else{
                document.getElementById("f_bid" + row).value = floatMinus(f_bid, 2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                document.getElementById("f_bid_total" + row).value = floatMinus(f_did_total, 2).replace(/\B(?=(\d{3})+(?!\d))/g, ","); 
      }
    } else {
      document.getElementById("f_bid" + row).value = null;
      document.getElementById("f_bid_total" + row).value = null;
      document.getElementById("chk_" + row).checked = false;
      models[row].set("CheckColumn", false);
      
    }
  } else if (type == 2) {
    if (document.getElementById("f_bid_total" + row).value > 0) {
      var f_did_total = document.getElementById("f_bid_total" + row).value.replace(/\,/g,'');
      models[row].set("CheckColumn", true);
      // document.getElementById("chk_" + row).checked = true;
      var f_bid = f_did_total / num;
        var originalNum = Ext.selectRow.get('f_total_amt').replace(/\,/g,''); 
        var cleanNum = originalNum.replace(/\,/g,'');
        var f_total_amt = parseFloat(cleanNum);
      if(f_total_amt < f_did_total){

        Ext.MessageBox.alert('แจ้งเตือนยอดเงินเกิน !',
        'เงินที่จอง : '+ Ext.selectRow.get('f_total_amt') +
        '\nเงินหลังต่อรอง : '+ Ext.floatRenderer(f_did_total)); 
        document.getElementById("f_bid_total" + row).value = 0.00;
        document.getElementById("f_bid" + row).value  = 0.00;
      }else{
                document.getElementById("f_bid" + row).value = floatMinus(f_bid, 2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                document.getElementById("f_bid_total" + row).value = floatMinus(f_did_total, 2).replace(/\B(?=(\d{3})+(?!\d))/g, ","); 
      }
   
      
//      alert(document.getElementById("f_bid_total" + row).value);
    } else {
      document.getElementById("f_bid" + row).value = null;
      document.getElementById("f_bid_total" + row).value = null;
      document.getElementById("chk_" + row).checked = false;
      models[row].set("CheckColumn", false);
    }
  }
}
Ext.CheckColumn = Ext.extend(Ext.grid.Column, {
  /**
   * @private
   * Process and refire events routed from the GridView's processEvent method.
   */
  processEvent: function (name, e, grid, rowIndex, colIndex) {
    var record = grid.store.getAt(rowIndex);

    // // Event only on enable row (depending on css)
    // if (name == "mousedown" && grid.getView().getRowClass(record, rowIndex).indexOf("privileges-grid-disable") == -1) {
    //   var checked = !record.data[this.dataIndex];

    // if click on 'all' checkbox, check all boxes on the same row
    if (this.dataIndex == "all") {
      var checked = !record.data[this.dataIndex];
      for (var i = 1; i < grid.getColumnModel().config.length; i++) {
        record.set(grid.getColumnModel().config[i].dataIndex, checked);
      }
    } else {
      // uncheck 'all' box if one is unchecked
      if (!checked && record.data["all"]) {
        record.set("all", checked);
      }
      record.set(this.dataIndex, checked);
    }

    return false; // Cancel row selection.
    // } else {
    //   return Ext.grid.ActionColumn.superclass.processEvent.apply(this, arguments);
    // }
  },

  renderer: function (v, p, record) {
    p.css += " x-grid3-check-col-td";
    // Remove notify and edit to internet,intranet,all groups
    if ((this.dataIndex == "oper2" || this.dataIndex == "oper3") && (record.id == 0 || record.id == 1 || record.id == -1)) {
      return "";
    }
    return String.format('<div class="x-grid3-check-col{0}">&#160;</div>', v ? "-on" : "");
  },

  // Deprecate use as a plugin. Remove in 4.0
  init: Ext.emptyFn,
});
var delete_bidder_hdr = function () {
  var win = new Ext.Window({
    id: "win-msg-delete",
    title: "Remove",
    modal: true,
    width: 250,
    height: 130,
    html: "ท่านต้องการที่จะลบข้อมูล ?",
    buttons: [
      {
        text: "Confirm",
        handler: function () {
          Ext.Ajax.request({
            url: "tor/api/mnTorController.php",
            params: {
              mode: "DELETE_SP_TOR_BIDDER_HDR",
              id: Ext.SP_TOR_BIDDER_HDR_ID,
            },
            method: "GET", //POST
            success: function (result, request) {
              Ext.getCmp("win-msg-delete").destroy();
              Ext.store2.setBaseParam("sp_tor_id", Ext.SP_TOR_ID);
              Ext.store2.load({
                callback: function (record, operation, success) {
                  if (success) {
                    // var i = this.data.length - 1;
                    // if (i >= 0) {
                    //   Ext.getCmp("bbf_total_price4ID").setValue(record[i].get("f_total_amt"));
                    //   Ext.getCmp("bbf_qty4ID").setValue(record[i].get("i_qty_amt"));
                    // } else {
                    //   Ext.getCmp("bbf_total_price4ID").setValue("0");
                    //   Ext.getCmp("bbf_qty4ID").setValue("0.00");
                    // }
                  }
                },
              });
            },
            failure: function (result, request) {
              Ext.MessageBox.alert("Failed", result.responseText); // connect error
            },
          });
        },
      },
      {
        text: "Cancel",
        handler: function () {
          Ext.getCmp("win-msg-delete").hide();
          Ext.getCmp("win-msg-delete").destroy();
          Ext.getCmp("tabpanel1").getStore().reload();
        },
      },
    ],
  }).show();
};
    var comboCost = new Ext.form.ComboBox({
        mode: "local",
        readOnly: true,
        store: Ext.dc_cost,
        anchor: "100%",
        fieldLabel: "หน่วยงานที่รับผิดชอบ",
        valueField: "id",
        displayField: "c_name",
        hiddenName: "dc_cost_id",
        name: "c_cost_name",
        triggerAction: "all",
        forceSelection: true,
        selectOnFocus: true,
        typeAhead: false,
        emptyText: "กรุณาเลือก...",
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
    });
    var comboCost2 = new Ext.form.ComboBox({
        mode: "local",
        store: Ext.dc_cost,
        anchor: "100%",
        readOnly: true,
        value: Ext.costID,
        fieldLabel: "หน่วยงานเจ้าของเรื่อง",
        valueField: "id",
        displayField: "c_name",
        hiddenName: "dc_cost2_id",
        name: "c_cost_name",
        triggerAction: "all",
        forceSelection: true,
        selectOnFocus: true,
        typeAhead: false,
        emptyText: "กรุณาเลือก...",
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

        }
    });

    var comboUsedBgYear = new Ext.form.ComboBox({
        mode: "local",
        readOnly: true,
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
    });
    var columnMini = [
        {
            header: "ID System",
            sortable: true,
            hidden: true,
            dataIndex: "id",
        },
        {
            header: "เลขที่ใบเบิก",
            sortable: true,
            dataIndex: "c_code",
        },
        {
            header: "รายการ­",
            sortable: true,
            id: "c_name",
            dataIndex: "c_name",
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                metaData.attr = "style='cursor:pointer';";
                return value;
            },
        },
    ];

    var statusx = statuss;

    if (statusx == "add") {
        Ext.getCmp("tabpanel1").getSelectionModel().clearSelections();
    }
    // var typeTor = ;
    var bgProject = new Ext.form.ComboBox({
        mode: "local",
        store: Ext.bgProject,
        id: "projectID",
        anchor: "100%",
        fieldLabel: "ชื่อโครงการ",
        submitValue: true,
        hiddenName: "bg_budget_dtl_project_id",
        name: "c_budget_dtl_project_id",
        valueField: "id",
        displayField: "c_name",
        triggerAction: "all",
        forceSelection: false,
        selectOnFocus: true,
        typeAhead: false,
        emptyText: "กรุณาเลือก",
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
    });
    var col1 = [
        new Ext.grid.RowNumberer({width: 35, header: " No ", dataIndex: "no"}),
        {header: "ID System", hidden: true, dataIndex: "id"},
        {header: "งวดที่", align: "center", dataIndex: "i_seq", width: 10},
        {
            header: "วันที่ส่งมอบ",
            align: "center",
            dataIndex: "d_period_date",
            width: 25,
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                if (value == "รวม") {
                    metaData.attr = "style='font-weight:bold;color:blue'; align='right'";
                    return Ext.floatRenderer(value);
                } else {
                    metaData.attr = "";
                    if (record.get("i_is_dtl")) {
                        return "";
                    } else {
                        return DategetShortDateMonthName(value);
                    }
                }
            },
        },
        {
            header: "รายละเอียด จัดซื้อ",
            dataIndex: "c_name",
            width: 35,
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                if (value.substring(0, 3) == "รวม") {
                    metaData.attr = "style='font-weight:bold;color:blue'; align='right'";
                } else {
                    metaData.attr = "";
                }
                return value; //DategetShortDateMonthName(value);
            },
        },
        {header: "จำนวน", dataIndex: "f_quan", width: 20, align: "right"},
        {header: "ก่อน VAT", dataIndex: "f_unit_cost", align: "right", width: 25},
        {header: "รวม VAT", dataIndex: "f_unit_cost_vat", align: "right", width: 25},
        {
            header: "บันทึกรายละเอียดในงวดงาน",
            sortable: false,
            hideable: false,
            draggable: false,
            align: "center",
            id: "edit21",
            width: 25,
            dataIndex: "id",
            renderer: function (value, metaData, record, row, col, store, gridView) {
                if (record.get("id") == "grandtotal" || record.get("i_is_dtl")) {
                    return "";
                } else {
                    if (record.get("buStatus") == true) {
                        return '<img src="../images/icons/document_edit.gif"); style="cursor:pointer"/>';
                    } else {
                        return record.get("buStatus");
                    }
                }
            },
        },
    ];

    var disp = false ? "displayfield" : "textfield";
    if (!Ext.isEmpty(Ext.getCmp("winChequeID"))) {
        Ext.getCmp("winChequeID").destroy();
    }
    return new Ext.Window({
        collapsible: true,
        maximizable: true,
        title: Ext.title,
        width: Ext.getCmp("contenterCenter").getWidth() - 5,
        height: Ext.getCmp("contenterCenter").getHeight() - 5,
        id: "winChequeID",

        minWidth: 850,
        minHeight: 450,
        layout: "fit",
        modal: true,
        plain: true,
        bodyStyle: "padding:1px;",
        buttonAlign: "center",
        items: [
            new Ext.FormPanel({
                id: Ext.poFormID,
                columnWidth: 1,
                url: "tor/api/mnTorController.php",
                frame: true,
                autoScroll: true,
                labelAlign: "left",
                bodyStyle: "padding:1px",
                labelWidth: 160,
                listeners: {
                    afterrender: function () {
                        Ext.getCmp("i_pr_type1ID").setValue(Ext.selectRow.json.i_pr_type1);
                        Ext.getCmp("i_pr_type2ID").setValue(Ext.selectRow.json.i_pr_type2);
                        Ext.getCmp("i_pr_type3ID").setValue(Ext.selectRow.json.i_pr_type3);
                        Ext.getCmp("f_type_amtID").setValue(Ext.selectRow.json.f_total_amt);
                        Ext.getCmp("f_type_amtID2").setValue(Ext.selectRow.json.f_type2_amt);
                        Ext.getCmp("f_type_amtID3").setValue(Ext.selectRow.json.f_type3_amt);
                    },
                },
                items: [
                    {
                        layout: "column",
                        border: false,
                        items: [
                            {
                                columnWidth: 0.6,
                                layout: "form",
                                border: true,
                                items: [
                                    {
                                        xtype: "hidden",
                                        name: "id",
                                        id: "torHdrID", //i_is_more
                                    },
                                    {
                                        xtype: "hidden",
                                        name: "dc_emp_id",
                                        id: "dc_emp_idID", //i_is_more
                                    },
                                    {
                                        xtype: "hidden",
                                        name: "sp_emp_id",
                                        id: "sp_emp_idID", //i_is_more
                                    },
                                    {
                                        xtype: "hidden",
                                        name: "dc_department_id",
                                        id: "dc_department_idID", //i_is_more
                                    },
                                    {
                                        xtype: disp,
                                        readOnly: true,
                                        fieldLabel: "รหัส PR",
                                        id: "codeHdrID",
                                        style: "text-align: center;font-weight:bold;background:#eee;",
                                        name: "c_code",
                                    },
                                    {
                                        xtype: "textarea",
                                        width: 500,
                                        height: 35,
                                        fieldLabel: "เรื่อง/โครงการ",
                                        name: "c_name",
                                        width: 300,
                                    },
                                    comboUsedBgYear,
                                    //  {xtype: 'displayfield', fieldLabel: "ชื่อโครงการ", name: 'c_budget_dtl_project'},
                                    comboCost,
                                    comboCost2,
                                    {
                                        xtype: 'datefield',
                                        fieldLabel: "วันที่บันทึก",
                                        name: "d_tor_date",
                                        readOnly: true,
                                    },
                                    {
                                        xtype: "buttongroup",
                                        fieldLabel: "วันที่ประกาศแผน/แต่งตั้ง คกก.",
                                        frame: false,
                                        border: false,
                                        items: [
                                            {
                                                xtype: "datefield",
                                                name: "d_egp_date",
                                                validator: function (val) {
                                                    if (!Ext.isEmpty(val)) {
                                                        return true;
                                                    } else {
                                                        return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                                    }
                                                },
                                            },
                                            {
                                                xtype: "tbspacer",
                                                width: 18,
                                            },
                                            {
                                                xtype: "label",
                                                style: {
                                                    color: "red",
                                                    width: "100px",
                                                },
                                                text: "* วันที่จับ KPI",
                                            },
                                        ],
                                    },
                                    {
                                        xtype: "combo",
                                        readOnly: true,
                                        mode: "local",
                                        store: Ext.torType,
                                        anchor: "40%",
                                        fieldLabel: "วิธีดำเนินงาน",
                                        submitValue: true,
                                        hiddenName: "tor_type_id",
                                        name: "c_type_id",
                                        id: "tor_type_idID",
                                        valueField: "id",
                                        displayField: "c_name",
                                        triggerAction: "all",
                                        forceSelection: false,
                                        selectOnFocus: true,
                                        typeAhead: false,
                                        emptyText: "กรุณาเลือก",
                                        validator: function (val) {
                                            if (!Ext.isEmpty(val)) {
                                                return true;
                                            } else {
                                                return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                            }
                                        },
                                        listeners: {
                                            afterrender: function () {
                                                this.fn = function () {
                                                    if (this.getValue() == 1) {
                                                        //tor_type_id === 1 (เจาะจง)
                                                        Ext.getCmp("lableLessID").show();
                                                    } else {
                                                        Ext.getCmp("lableLessID").hide();
                                                    }
                                                };
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
                                    },
                                    {
                                        xtype: "displayfield",
                                        fieldLabel: "แบบ ",
                                        name: "lableLess",
                                        value: Ext.tor_type_idTxt.tor_type_id1[Ext.i_is_more], //i_is_more
                                        id: "lableLessID",
                                        listeners: {
                                            beforerender: function () {},
                                            afterrender: function () {
                                                this.fn = function () {
                                                    var tor_type_idID = Ext.getCmp("tor_type_idID").getValue();
                                                    if (Ext.getCmp("tor_type_idID").getValue() != 1) {
                                                        this.hide();
                                                    } else {
                                                        this.show();
                                                    }
                                                };
                                                this.fn();
                                            },
                                        },
                                    },
                                    {
                                        xtype: "buttongroup",
                                        fieldLabel: "จำนวนเงิน",
                                        frame: false,
                                        border: false,
                                        items: [
                                            {
                                                xtype: "textfield",
                                                readOnly: true,
                                                fieldLabel: "จำนวนเงิน",
                                                name: "f_total_amt",
                                                id: "f_totalID",
                                                listeners: {
                                                    blur: function () {
                                                        this.fn();
                                                    },
                                                    afterrender: function () {
                                                        this.fn = function () {
                                                            var val = 0;
                                                            val = this.getValue();
                                                            var f_total = parseFloat(val.replace(/,/g, "") / 1);
                                                            this.setValue(Ext.floatRenderer(f_total));
                                                        };
                                                        this.fn();
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                    {
                                        xtype: "textfield",
                                        readOnly: true,
                                        fieldLabel: "รหัสเอกสารอ้างอิง",
                                        name: "d_doc_ref",
                                    },
                                    {
                                        xtype: "buttongroup",
                                        fieldLabel: "วันที่บันทีกแจ้งเตือน",
                                        frame: false,
                                        border: false,
                                        items: [
                                            {
                                                xtype: "datefield",
                                                name: "DateAdd1",
                                                validator: function (val) {
                                                    if (!Ext.isEmpty(val)) {
                                                        return true;
                                                    } else {
                                                        return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                                    }
                                                },
                                            },
                                            {
                                                xtype: "tbspacer",
                                                width: 18,
                                            },
                                            {
                                                xtype: "label",
                                                style: {
                                                    color: "red",
                                                    width: "100px",
                                                },
                                                text: "* แจ้งเตือน จากวันถัดไป " + Ext.menu_i_alarm + " วัน",
                                            },
                                        ],
                                    },
                                    {
                                        xtype: "buttongroup",
                                        fieldLabel: "วันที่บันทีก PA",
                                        frame: false,
                                        border: false,
                                        items: [
                                            {
                                                xtype: "datefield",
                                                name: "DateAdd2",
                                                validator: function (val) {
                                                    if (!Ext.isEmpty(val)) {
                                                        return true;
                                                    } else {
                                                        return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                                    }
                                                },
                                            },
                                            {
                                                xtype: "tbspacer",
                                                width: 18,
                                            },
                                            {
                                                xtype: "label",
                                                style: {
                                                    color: "red",
                                                    width: "150px",
                                                },
                                                text: "* นับ PA จากวันถัดไป " + Ext.menu_i_day + " วัน",
                                            },
                                        ],
                                    },
                                    {
                                        fieldLabel: "วันที่บันทึก",
                                        xtype: "datefield",
                                        name: "d_tor_status_date",
                                        validator: function (val) {
                                            if (!Ext.isEmpty(val)) {
                                                return true;
                                            } else {
                                                return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                            }
                                        },
                                    },
                                    {
                                        xtype: "textarea",
                                        width: 400,
                                        name: "c_comment",
                                        //
                                    },
                                    Ext.getBodyMultiBudget(Ext.selectRow, 'st3005'),
                                    {
                                        xtype: "radiogroup",
                                        columns: [180],
                                        fieldLabel: "โหมดการบันทึก",
                                        id: "modesubID",
                                        hidden: true,
                                        style: {
                                            "font-weight": "bold",
                                        },
                                        items: [
                                            {
                                                name: "mode",
                                                checked: true,
                                                inputValue: "UPDATEFORMSTSATUS",
                                                boxLabel: "อัพเดทรายการ",
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                columnWidth: 0.4,
                                layout: "table",
                            },
                        ],
                    },
                ],
                buttonAlign: "center",
                buttons: [
                    {
                        text: "บันทึกรายการ",
                        id: "buSaveSubID",
                        iconCls: "icon-save",
                        handler: function () {
                            var formSubmit = function () {
                                form.submit({
                                    waitMsg: "Saving Data...",
                                    success: function (form, action) {
                                        Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                                            Ext.getCmp("tabpanel1").getStore().reload();
                                            Ext.selectRow = null;
                                            Ext.getCmp("winChequeID").destroy();
                                        });
                                    },
                                    failure: function (form, action) {
                                        switch (action.failureType) {
                                            case Ext.form.Action.CLIENT_INVALID:
                                                Ext.Msg.alert("Failure", "Form fields may not be submitted with invalid values");
                                                break;
                                            case Ext.form.Action.CONNECT_FAILURE:
                                                Ext.Msg.alert("Failure", "พลข้อผิดพลาดในการเชื่อต่อเครือข่าย");
                                                break;
                                            case Ext.form.Action.SERVER_INVALID:
                                                Ext.Msg.alert("Failure", action.result.msg);
                                        }
                                    },
                                });
                            }; //END

                            var form = Ext.getCmp(Ext.poFormID).getForm();
                            if (form.isValid()) {
                                if (Ext.getCmp("modesubID").getValue().inputValue === "VIEW") {
                                } else if (Ext.getCmp("modesubID").getValue().inputValue === "DELETE") {
                                    Ext.MessageBox.show({
                                        title: "Icon Support",
                                        msg: "คุณต้องการที่จะลบ รายการที่เลือกนี้ใช่ใหม ?",
                                        buttons: Ext.MessageBox.OKCANCEL,
                                        icon: Ext.MessageBox.WARNING,
                                        fn: function (btn) {
                                            if (btn === "ok") {
                                                formSubmit(form);
                                            } else {
                                                return;
                                            }
                                        },
                                    });
                                } else {
                                    formSubmit(form);
                                }
                            }
                        },
                        //haddler
                    },
                    {
                        text: Ext.GLOBAL_BU_BACK_TH, iconCls: "icon-back",
                        handler: function () {
                            Ext.getCmp("winChequeID").hide();
                            Ext.getCmp("winChequeID").destroy();
                        },
                    },
                ],
            }),
        ],listeners:{ 
            afterrender:function(){ 
                Ext.getCmp('tabpanel1').getEl().unmask(); Ext.application.setHideName('buDarf',Ext.selectRow.get('i_is_register')?1:0); Ext.application.afterRender(this);
            }
        }
    });
}; 
Ext.loadStore = function (status, show) {
    Ext.menu_i_alarm = Ext.selectRow.get('i_alarm');
    Ext.menu_i_day = Ext.selectRow.get('i_day');
    var statusx = status;
 
    if (statusx === "edit" && Ext.isEmpty(Ext.selectRow))
        Ext.Msg.alert("แจ้งเตือน", "กรุณา click เลือกข้อมูลที่จะแก้ไขใน data grid", function (form, action) {
            return false;
        });
    else
        Ext.dc_cost.reload({
            callback: function (recordx, operation, success) {
                if (success) {
                    Ext.po_emp.reload({
                        callback: function (recordx, operation, success) {
                            if (success) {
                                Ext.po_user_permission.reload({
                                    callback: function (recordx, operation, success) {
                                        if (success) {
                                            Ext.dc_expense_budget_type.reload({
                                                callback: function (recordx, operation, success) {
                                                    if (success) {
                                                        Ext.po_expense_group.reload({
                                                            callback: function (recordx, operation, success) {
                                                                if (success) {
                                                                    Ext.po_expense.reload({
                                                                        callback: function (recordx, operation, success) {
                                                                            if (success) {
                                                                                //AppPoStore(statusx).show();

                                                                                if (statusx == "add") {
                                                                                    Ext.HDR_ID = null;
                                                                                    Ext.selectRow = null;
                                                                                    Ext.i_is_more = 0;
                                                                                    var winApp = AppPoStore(statusx);
                                                                                    winApp.show();
                                                                                } else if (statusx === "edit") {
                                                                                    //
                                                                                    Ext.HDR_ID = Ext.selectRow.data.po_working_hdr_id;
                                                                                    Ext.tor_type_id = Ext.selectRow.data.tor_type_id; // default start เจาะจงน้อวกว่า 5 แสน
                                                                                    Ext.i_is_more = Ext.selectRow.data.i_is_more;

                                                                                    /*  if (!Ext.selectRow.get("po_expense_id")) Ext.selectRow.set("po_expense_id", null);
                                                                                     if (!Ext.selectRow.get("po_creditor_id")) Ext.selectRow.set("po_creditor_id", null);
                                                                                     if (!Ext.selectRow.get("dc_expense_budget_type_id")) Ext.selectRow.set("dc_expense_budget_type_id", null);
                                                                                     if (!Ext.selectRow.get("bg_budget_dtl_project_id")) Ext.selectRow.set("bg_budget_dtl_project_id", null);
                                                                                     if (!Ext.selectRow.get("dc_department_id")) Ext.selectRow.set("dc_department_id", null);
                                                                                     if (!Ext.selectRow.get("dc_cost_id")) Ext.selectRow.set("dc_cost_id", null);*/

                                                                                    var winApp = AppPoStore(statusx);
                                                                                    Ext.getCmp("winChequeID").items.items[0].getForm().loadRecord(Ext.selectRow);
                                                                                    winApp.show();
                                                                                }

                                                                                //
                                                                            }
                                                                        },
                                                                    }); //po_expense
                                                                }
                                                            },
                                                        }); //po_expense_group
                                                    }
                                                },
                                            }); //dc_expense_budget_type
                                        }
                                    },
                                }); //po_user_permission
                            }
                        },
                    }); //po_emp
                }
            },
        });
};