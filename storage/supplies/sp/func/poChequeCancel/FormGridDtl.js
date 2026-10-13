const saveDtl = function() {
  let msg = "";
  if (Ext.getCmp("dtl_i_cheque").getValue().inputValue == 1) {
    if (Ext.getCmp("dtl_c_creditor").getValue() == "") {
      msg += "<span style='white-space: nowrap;'>- กรุณากรอก จ่ายให้</span><br>";
    }
    if (Ext.getCmp("dtl_c_cheque").getValue() == "") {
      msg += "<span style='white-space: nowrap;'>- กรุณากรอก เลขที่เช็ค</span><br>";
    }
  }
  if (Ext.getCmp("dtl_f_total").getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณากรอก จำนวนเงิน</span><br>";
  }
  if (msg == "") {
    Ext.getCmp("contenterCenter")
      .getEl()
      .mask("Please wait...", "x-mask-loading");
    Ext.Ajax.request({
      url: "api/mn_poWorking.php",
      method: "POST",
      params: {
        mode: "SAVE_CHEQUE",
        po_working_hdr_id: Ext.HDR_ID,
        i_cheque: Ext.getCmp("dtl_i_cheque").getValue().inputValue,
        c_creditor: Ext.getCmp("dtl_c_creditor").getValue(),
        c_cheque: Ext.getCmp("dtl_c_cheque").getValue(),
        f_total: Ext.getCmp("dtl_f_total")
          .getValue()
          .replace(/,/g, ""),
        c_comment: Ext.getCmp("dtl_c_comment").getValue()
      },
      success: function(result, request) {
        Ext.getCmp("contenterCenter")
          .getEl()
          .unmask();
        let json = Ext.util.JSON.decode(result.responseText); //decode json
        Ext.storeCheque.load({ params: { hdr_id: Ext.HDR_ID } });
        Ext.store.load();
        Ext.Msg.alert("แจ้งเตือน", json.msg);
      },
      failure: function(result, request) {
        Ext.MessageBox.alert("Failed", result.responseText); // connect error
      }
    });
  } else {
    Ext.Msg.alert("แจ้งเตือน", msg);
  }
}; // saveDtl

const delteDtl = function(id, i_status) {
  Ext.getCmp("contenterCenter")
    .getEl()
    .mask("Please wait...", "x-mask-loading");
  Ext.Ajax.request({
    url: "api/mn_poChequeCancel.php",
    method: "POST",
    params: {
      mode: "DELETE_CHEQUE",
      id: id,
      i_status: i_status
    },
    success: function(result, request) {
      Ext.getCmp("contenterCenter")
        .getEl()
        .unmask();
      Ext.storeCheque.load({ params: { hdr_id: Ext.HDR_ID } });
    },
    failure: function(result, request) {
      Ext.MessageBox.alert("Failed", result.responseText); // connect error
    }
  });
}; // deleteDtl

// Class Extend
formPanelDtl = function(args) {
  const formPanelDD = new Ext.FormPanel({
    labelWidth: 100,
    labelAlign: "right",
    frame: true,
    items: [
      {
        xtype: "fieldset",
        title: "รายการที่เลือก",
        defaults: { width: "90%" },
        items: [
          {
            xtype: "displayfield",
            id: "dtl_c_approve",
            style: "font-weight: bold; color: blue;",
            fieldLabel: "เลขที่ฏีกา"
          },
          {
            xtype: "radiogroup",
            id: "dtl_i_cheque",
            fieldLabel: "รายการบัญชี",
            columns: [70, 80, 150],
            items: [
              {
                boxLabel: "เขียนเช็ค",
                name: "i_cheque",
                inputValue: 1,
                checked: true
              },
              {
                boxLabel: "ภาษีบริษัท",
                name: "i_cheque",
                inputValue: 2
              },
              {
                boxLabel: "ประกันสังคม",
                name: "i_cheque",
                inputValue: 3
              }
            ],
            listeners: {
              change: function(obj, value) {
                if (value.inputValue == 1) {
                  Ext.getCmp("dtl_c_creditor").show();
                  Ext.getCmp("dtl_c_cheque").show();
                } else {
                  Ext.getCmp("dtl_c_cheque").hide();
                  Ext.getCmp("dtl_c_creditor").hide();
                }
              }
            }
          },
          {
            xtype: "textfield",
            id: "dtl_c_creditor",
            name: "c_creditor",
            fieldLabel: "จ่ายให้"
          },
          {
            xtype: "textfield",
            id: "dtl_c_cheque",
            name: "c_cheque",
            fieldLabel: "เลขที่เช็ค",
            style: "text-align:center; font-weight: bold;",
            listeners: {
              afterrender: function() {
                this.fn = function() {};
              },
              Change: function(value) {
                this.fn();
              }
            }
          },
          {
            xtype: "textfield",
            id: "dtl_f_total",
            name: "f_total",
            fieldLabel: "จำนวนเงิน",
            style: "text-align: right; font-weight: bold;",
            listeners: {
              afterrender: function() {
                this.fn = function() {
                  let value = floatMinus(this.getValue().replace(/,/g, ""), 2);
                  this.setValue(floatRenderer(value));
                  if (parseFloat(value) >= 0) {
                    $("#dtl_f_total").css("color", "blue");
                  } else {
                    $("#dtl_f_total").css("color", "red");
                  }
                };
              },
              Change: function(value) {
                this.fn();
              }
            }
          },
          {
            xtype: "textarea",
            id: "dtl_c_comment",
            name: "c_comment",
            fieldLabel: "หมายเหตุ"
          }
        ],
        buttons: [
          {
            text: "&nbsp;" + Ext.GLOBAL_BU_SAVE_TH + "&nbsp;",
            iconCls: "icon-save",
            handler: function() {
              saveDtl();
            }
          },
          {
            text: Ext.GLOBAL_BU_BACK_TH,
            handler: function() {
              Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"), true) || {};
            }
          }
        ]
      }
    ]
  });

  const girdDtl = new Ext.grid.GridPanel({
    id: "grid_dtl",
    border: false,
    stripeRows: true,
    loadMask: true,
    store: Ext.storeCheque,
    selModel: new Ext.grid.RowSelectionModel({ singleSelect: true }),
    viewConfig: {
      emptyText: "ไม่มีข้อมูล..",
      deferEmptyText: false
    },
    columns: [
      {
        header: "ที่",
        align: "center",
        width: 30,
        renderer: function(value, metaData, record, row, col, store, gridView) {
          if (record.get("i_type") == 1) {
            return record.get("no");
          } else {
            metaData.attr = 'style="font-weight: bold;"';
          }
        }
      },
      {
        header: "จ่ายให้",
        sortable: true,
        align: "center",
        dataIndex: "c_creditor",
        width: 200,
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          if (record.get("i_type") == 1) {
            metaData.attr = 'style="text-align:left;"';
            return value;
          } else {
            metaData.attr = 'style="font-weight: bold; text-align:right;"';
            return value;
          }
        }
      },
      {
        header: "เลขที่เช็ค",
        sortable: true,
        align: "center",
        dataIndex: "c_cheque",
        width: 100,
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          if (record.get("i_type") == 1) {
            return value;
          } else {
            metaData.attr = 'style="font-weight: bold; text-align:right;"';
            return value;
          }
        }
      },
      {
        header: "จำนวนเงิน",
        sortable: true,
        dataIndex: "f_total",
        width: 100,
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          if (record.get("i_type") == 1) {
            metaData.attr = 'style="text-align: right;"';
            return floatRenderer(floatMinus(value, 2));
          } else {
            metaData.attr = 'style="text-align: right; font-weight: bold;"';
            return floatRenderer(floatMinus(value, 2));
          }
        }
      },
      {
        id: "c_comment",
        header: "หมายเหตุ",
        sortable: true,
        dataIndex: "c_comment",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          if (record.get("i_type") == 1) {
            return value;
          } else {
            metaData.attr = 'style="font-weight: bold;"';
          }
        }
      },
      {
        header: "สถานะ",
        sortable: false,
        align: "center",
        dataIndex: "i_status",
        width: 90,
        renderer: function(value, metaData, record, row, col, store, gridView) {
          if (record.get("i_type") == 1) {
            if (value == 1) {
              return "<font color=green>สมบูรณ์</font>";
            } else if (value == 2) {
              return "<font color=red>ยกเลิก</font>";
            } else {
              return "<font color=blue>รอดำเนินการ</font>";
            }
          } else {
            metaData.attr = 'style="font-weight: bold;"';
          }
        }
      },
      {
        id: "save_confirm",
        header: "ยืนยันรายการ",
        sortable: false,
        align: "center",
        dataIndex: "id",
        hidden: Ext.I_STATUS == 12 ? false : true, // ตัดจ่ายเจ้าหนี้
        width: 90,
        renderer: function(value, metaData, record, row, col, store, gridView) {
          if (record.data.i_status != 1) {
            return "<button style='font-size:11px; cursor:pointer; color: green;'>ยืนยันรายการ</button>";
          } else {
            return "<button style='font-size:11px; cursor:pointer; color: red;'>ยกเลิก</button>";
          }
        }
      }
    ],
    autoExpandColumn: "c_comment"
  });

  formPanelDtl.superclass.constructor.call(this, {
    title: "รายการเช็ค",
    id: "PanelDtl",
    iconCls: "icon-application-view-list",
    region: "center",
    layout: "fit",
    border: false,
    stripeRows: true,
    loadMask: true,
    listeners: {
      afterrender: function(obj, eOpts) {
        Ext.getCmp("contenterCenter")
          .getEl()
          .mask("Please wait...", "x-mask-loading");

        Ext.storeCheque.load({
          params: { hdr_id: Ext.HDR_ID },
          callback: function(records, operation, success) {
            Ext.getCmp("contenterCenter")
              .getEl()
              .unmask();
          }
        });
      }
    },
    items: [
      new Ext.Panel({
        layout: "border",
        border: false,
        bodyPadding: 5,
        items: [
          {
            region: "center",
            layout: "fit",
            items: [girdDtl]
          },
          {
            region: "east",
            layout: "fit",
            border: false,
            width: 500,
            items: [formPanelDD]
          }
        ]
      })
    ]
  });

  Ext.DELETE_ID = null;
  let menu = new Ext.menu.Menu({
    items: [
      {
        iconCls: "icon-cancel",
        text: "ยกเลิก",
        handler: function() {
          delteDtl(Ext.DELETE_ID, 2);
        }
      },
      {
        iconCls: "icon-bin",
        text: "ลบรายการ",
        handler: function() {
          delteDtl(Ext.DELETE_ID, 0);
        }
      }
    ]
  });

  Ext.getCmp("grid_dtl").on("cellcontextmenu", function(record, rowIndex, cellIndex, e) {
    var record = Ext.storeCheque.getAt(rowIndex).data;
    if (record.i_type == 1) {
      if (record.i_status == 0 || record.i_status == 2) {
        Ext.DELETE_ID = Ext.storeCheque.getAt(rowIndex).data.id;
        menu.showAt(Ext.EventObject.getXY());
      }
    }
    Ext.EventObject.stopEvent();
  });

  cellClickDtl = function(grid, rowIndex, columnIndex, e) {
    let record = grid.getStore().getAt(rowIndex);
    if (columnIndex == grid.getColumnModel().getIndexById("save_confirm")) {
      Ext.getCmp("contenterCenter")
        .getEl()
        .mask("Please wait...", "x-mask-loading");
      Ext.Ajax.request({
        url: "api/mn_poWorking.php",
        method: "POST",
        params: {
          mode: "SAVE_CHEQUE_CONFIRM",
          id: record.id,
          i_status: record.data.i_status == 1 ? "0" : "1"
        },
        success: function(result, request) {
          Ext.getCmp("contenterCenter")
            .getEl()
            .unmask();
          let json = Ext.util.JSON.decode(result.responseText); //decode json
          Ext.storeCheque.load({ params: { hdr_id: Ext.HDR_ID } });
        },
        failure: function(result, request) {
          Ext.MessageBox.alert("Failed", result.responseText); // connect error
        }
      });
    }
  }; //cellClick

  Ext.getCmp("grid_dtl").on("cellclick", cellClickDtl, this);
}; // formPanelDtl
Ext.extend(formPanelDtl, Ext.Panel, {});
