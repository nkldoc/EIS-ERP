Ext.HDR_ID = null;
Ext.checkID = [];
const saveDtl = function (type) {
  let msg = "";
  // if (Ext.getCmp("d_approve_date").getValue() == "") {
  //   msg += "<span style='white-space: nowrap;'>- กรุณากรอก วันที่อนุมัติฏีกา</span><br>";
  // }

  if (msg == "") {
    var win = new Ext.Window({
      id: "MessageBox_re",
      title: "ยืนยันรายการ ",
      modal: true,
      width: 310,
      items: [
        {
          xtype: "form",
          frame: true,
          labelAlign: "right",
          labelWidth: 0.1,
          bodyStyle: { padding: "10px 20px" },
          defaults: { anchor: "100%", msgTarget: "side" },
          items: [
            {
              xtype: "displayfield",
              id: "displaytext",
              width: 200,
              value: "ยืนยันการบันทึกรายการ",
              style: "text-align: center; white-space: nowrap;",
            },
          ],
        },
      ],
      buttonAlign: "left",
      buttons: [
        {
          text: "ยืนยัน",
          id: "btn_save-MessageBox_re",
          iconCls: "icon-save",
          handler: function () {
            Ext.getCmp("MessageBox_re").hide();
            Ext.getCmp("MessageBox_re").destroy();
            let msg = "";
            if (msg == "") {
              Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");

              Ext.Ajax.request({
                url: "tor/api/mn_spSetUserCostSysSP.php",
                method: "POST",
                params: {
                  mode: type,
                  id: Ext.HDR_ID,
                  i_type_view: Ext.getCmp("s_i_type_view").getValue(),
                  dc_cost_id_s: JSON.stringify(Ext.checkID),
                  c_code_sys: Ext.C_CODE_SYS,
                },
                success: function (result, request) {
                  Ext.getCmp("contenterCenter").getEl().unmask();
                  let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                  if (jsonData.success == true) {
                    Ext.HDR_ID = jsonData.id;
                    Ext.store.load();
                    Ext.storeDtl.load({
                      params: {
                        dc_user_id: Ext.HDR_ID,
                        i_type_view: Ext.getCmp("s_i_type_view").getValue(),
                      },
                    });
                    Ext.Msg.alert("แจ้งเตือน", "บันทึกเรียบร้อย");
                    Ext.getCmp("contenterCenter").remove(Ext.getCmp("contenterCenter"), true) || {}; // null obj not errer
                    Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"), true) || {}; // null obj not errer
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
          },
        },
        { xtype: "tbfill" },
        {
          text: "ย้อนกลับ",
          handler: function () {
            Ext.getCmp("MessageBox_re").hide();
            Ext.getCmp("MessageBox_re").destroy();
          },
        },
      ],
    }).show();
  } else {
    Ext.Msg.alert("แจ้งเตือน", msg);
  }
}; // saveHdr

const setFormAdd = function (record) {
  // Ext.getCmp("c_code").setValue(record.data.c_code);
  Ext.getCmp("i_year").setValue(record.data.i_yyyy);
  Ext.getCmp("dc_expense_budget_type_id").setValue(record.data.dc_expense_budget_type_id);
  Ext.getCmp("dc_cost_id").setValue(record.data.dc_cost_id);
  Ext.getCmp("dc_cost_chk_id").setValue(record.data.dc_cost_id);
  Ext.getCmp("c_code_chk").setValue(record.data.c_code);
  Ext.getCmp("dc_creditor_idID").setValue(record.data.dc_creditor_id);
  Ext.getCmp("dc_creditor_idID_Name").setValue(record.data.dc_creditor_name);
  Ext.getCmp("d_sign_contract").setValue(record.data.d__create);
  Ext.getCmp("d_start_contract").setValue(record.data.d_doc_date);
  Ext.getCmp("d_end_contract").setValue(record.data.d_due_date);
  Ext.getCmp("i_purchase").setValue(record.data.i_purchase);

  let myNewRecord = new storeDtlRecord({
    id: "",
    bg_expense_id: record.data.po_expense_id,
    f_total: record.data.f_total_amt,
    c_comment: "",
  });
  Ext.storeDtl.removeAll();
  Ext.storeDtl.add(myNewRecord);

  // Ext.getCmp("d_doc_date_0").setValue(record.data.f_sum);
  // Ext.getCmp("c_comment_0").setValue();
};

function checkID(ID_Check) {
  var store = Ext.storeDtl;
  if (document.getElementById("chk_" + ID_Check).checked) {
    var index = Ext.checkID.indexOf(ID_Check);
    if (index == -1) {
      Ext.checkID.push(ID_Check);
      var indexID = store.findExact("id", "" + ID_Check);
      var recordID = store.getAt(indexID);
      // Ext.checkRecord.push(recordID);
    }
  } else {
    var index = Ext.checkID.indexOf(ID_Check);
    if (index > -1) {
      Ext.checkID.splice(index, 1);

      function findIndexByValue(array, value) {
        for (var i = 0; i < array.length; i++) {
          if (array[i].id === value) {
            return i; // Return the index if the value matches
          }
        }
        return -1; // Return -1 if the value is not found
      }
    }
  }
  if (Ext.console) console.log(Ext.checkID);
}

status_use_check = function (id) {
  if (!document.getElementById("chk_" + id).checked) {
    document.getElementById("chk_" + id).checked = true;
  } else {
    document.getElementById("chk_" + id).checked = false;
  }
  checkID(parseInt(id));
};

cellClick_gridDtl = function (grid, rowIndex, columnIndex, e) {
  let record = grid.getStore().getAt(rowIndex);

  var view = Ext.getCmp("s_i_type_view").getValue() == 1 ? 1 : 0;
  if (record.data.i_last == view) {
    if (columnIndex == grid.getColumnModel().getIndexById("i_status_use_check")) {
      status_use_check(record.get("id"));
    }
    if (columnIndex == grid.getColumnModel().getIndexById("c_name_check")) {
      status_use_check(record.get("id"));
    }
  }
}; //cellClick

// Class Extend
formAdd = function (args) {
  formAdd.superclass.constructor.call(this, {
    title: "รายละเอียด" + Ext.title_panel,
    id: "PanelDtl",
    iconCls: "icon-application-view-list",
    region: "center",
    layout: "fit",
    border: false,
    stripeRows: true,
    loadMask: true,
    listeners: {
      afterrender: function (obj, eOpts) {},
    },
    items: [
      new Ext.grid.EditorGridPanel({
        id: "gridEditor",
        region: "center",
        layout: "fit",
        border: true,
        stripeRows: true,
        loadMask: true,
        clicksToEdit: 1,
        store: Ext.storeDtl,
        viewConfig: {
          emptyText: "ไม่มีข้อมูล..",
          deferEmptyText: false,
          getRowClass: function (record, index, rowParams) {
            if (record.data.i_type == 2) {
              return "td-total";
            }
            // return index % 2 == 0 ? "grid-odd padd-6" : "grid-even padd-6";
          },
        },
        listeners: {
          afterrender: function (obj, eOpts) {
            Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
            Ext.storeDtl.load({
              params: {
                dc_user_id: Ext.HDR_ID,
                i_type_view: Ext.i_type_view,
              },
              callback: function (records, operation, success) {
                Ext.getCmp("contenterCenter").getEl().unmask();
                Ext.checkID = [];
                records.forEach(function (record) {
                  if (record.get("i_status_use") == 1) {
                    Ext.checkID.push(parseInt(record.get("id")));
                  }
                });
              },
            });
          },
        },
        tbar: [
          {
            xtype: "buttongroup",
            columns: 1,
            defaults: { scale: "small", style: "float: left" },
            items: [
              {
                xtype: "buttongroup",
                frame: false,
                items: [
                  {
                    xtype: "hidden",
                    id: "s_dc_user_id",
                    name: "s_dc_user_id",
                    readOnly: true,
                  },
                  { xtype: "label", text: "ชื่อพนักงาน :ㅤ" },
                  { xtype: "label", id: "s_dc_user_name", text: "", style: "color: blue; font-weight: bold;" },
                  { xtype: "tbspacer", width: 4 },
                ],
              },
              {
                xtype: "buttongroup",
                frame: false,
                items: [
                  {
                    xtype: "hidden",
                    id: "role-form-mode",
                    name: "mode",
                    readOnly: true,
                  },
                  { xtype: "label", text: "ระดับสิทธิ์ : " },
                  { xtype: "tbspacer", width: 4 },
                  {
                    id: "s_i_type_view",
                    xtype: "combo",
                    width: 354,
                    mode: "local",
                    store: new Ext.data.SimpleStore({
                      fields: ["id", "c_name"],
                      data: [
                        [1, "หน่วยงาน/ฝ่าย"],
                        [2, "ส่วนงาน/คณะ"],
                      ],
                    }),
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    value: 1,
                    listeners: {
                      select: function (combo, newValue) {
                        Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
                        Ext.storeDtl.load({
                          params: {
                            dc_user_id: Ext.HDR_ID,
                            i_type_view: this.value,
                          },
                          callback: function (records, operation, success) {
                            Ext.checkID = [];
                            if (success) {
                              Ext.each(records, function (record) {
                                if (record.data.i_status_use) {
                                  Ext.checkID.push(parseInt(record.data.id));
                                }
                              });
                            } else {
                              console.log("Failed to load records");
                            }
                            Ext.getCmp("contenterCenter").getEl().unmask();
                          },
                        });
                        if (this.value == 1) {
                          Ext.getCmp("gridEditor").getColumnModel().setHidden(0, false);
                          Ext.getCmp("gridEditor").getColumnModel().setColumnHeader(2, "หน่วยงาน/ฝ่าย");
                        } else if (this.value == 2) {
                          Ext.getCmp("gridEditor").getColumnModel().setHidden(0, true);
                          Ext.getCmp("gridEditor").getColumnModel().setColumnHeader(2, "ส่วนงาน/คณะ");
                        }
                      },
                    },
                  },
                ],
              },
            ],
          },
          { xtype: "tbfill" },
        ],
        columns: [
          // new Ext.grid.RowNumberer({
          //   header: "ที่",
          //   width: 30,
          //   renderer: function (value, metaData, record, row, col, store, gridView) {
          //     metaData.attr = "style='cursor:pointer; text-align:center;';";
          //     return record.get("no");
          //   },
          // }),
          {
            header: "ส่วนงาน/คณะ",
            sortable: false,
            width: 350,
            dataIndex: "c_name",
            renderer: function (value, metaData, record, row, col, store, gridView) {
              if (record.data.i_last == 1) {
                return "";
              } else {
                return value;
              }
            },
          },
          {
            sortable: false,
            align: "center",
            id: "i_status_use_check",
            dataIndex: "id",
            width: 25,
            renderer: function (value, metaData, record, row, col, store, gridView) {
              var view = Ext.getCmp("s_i_type_view").getValue() == 1 ? 1 : 0;
              if (record.data.i_last == view) {
                var checked = record.data.i_status_use == 1 ? "checked" : "";
                return "<input style='margin-top:3px; margin-bottom:2px; pointer-events: none;' type='checkbox' id='chk_" + value + "' value='" + value + "'" + checked + "> ";
              }
            },
          },
          {
            header: "ส่วนงาน/คณะ",
            id: "c_name_check",
            sortable: false,
            width: 350,
            dataIndex: "c_name",
            renderer: function (value, metaData, record, row, col, store, gridView) {
              var view = Ext.getCmp("s_i_type_view").getValue() == 1 ? 1 : 0;
              if (record.data.i_last == view) {
                return value;
              }
            },
          },
          { width: 20, dataIndex: "" },
        ],
        bbar: [
          {
            text: "&nbsp;ยืนยันบันทึกสิทธิ์&nbsp;",
            id: "saveDtl",
            // disabled: Ext.DataSelect.d_create == "" ? false : true,
            iconCls: "icon-save",
            handler: function () {
              saveDtl("ADD");
            },
          },
          "->",
          {
            xtype: "label",
            id: "statusbar",
            html: "<div style='padding: 3px 6px 2px;'><img src='../images/icons/accept.png'><span style='position: relative; top: -4px; left: 5px;'>Ready</span></div>",
          },
        ],
      }),
    ],
  });
  Ext.getCmp("gridEditor").on("cellclick", cellClick_gridDtl, this);
}; // formAdd
Ext.extend(formAdd, Ext.Panel, {});
