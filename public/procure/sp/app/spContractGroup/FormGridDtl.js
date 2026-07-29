Ext.saveDtl = function () {
  let msg = "";
  let mode = Ext.getCmp("dtl_mode").getValue().inputValue;

  if (mode == "EDIT_DTL" || mode == "DELETE_DTL") {
    if (Ext.getCmp("dtl_id").getValue() == "") {
      msg += "<span style='white-space: nowrap;'>- กรุณาเลือก รายการอ้างอิง</span><br>";
    }
  }

  if (mode == "ADD_DTL" || mode == "EDIT_DTL") {
    if (Ext.getCmp("dtl_d_holiday").getValue() == "") {
      msg += "<span style='white-space: nowrap;'>- กรุณากรอก วันที่</span><br>";
    }
    if (Ext.getCmp("dtl_c_name").getValue() == "") {
      msg += "<span style='white-space: nowrap;'>- กรุณากรอก ชื่อรายการ</span><br>";
    }
  }

  if (msg == "") {
    Ext.getCmp("contenterCenter")
      .getEl()
      .mask("Please wait...", "x-mask-loading");
    Ext.Ajax.request({
      url: "api/mn_spHolidayHdr.php",
      method: "POST",
      params: {
        mode: mode,
        id: mode == "ADD_DTL" ? "" : Ext.getCmp("dtl_id").getValue(),
        sp_holiday_hdr_id: Ext.HDR_ID,
        d_holiday: Ext.util.Format.date(Ext.getCmp("dtl_d_holiday").getValue(), "Y-m-d"),
        c_name: Ext.getCmp("dtl_c_name").getValue(),
        c_comment: Ext.getCmp("dtl_c_comment").getValue()
      },
      success: function(result, request) {
        Ext.getCmp("contenterCenter")
          .getEl()
          .unmask();
        let json = Ext.util.JSON.decode(result.responseText); //decode json
        Ext.storeDtl.load({ params: { hdr_id: Ext.HDR_ID } });
        Ext.Msg.alert("แจ้งเตือน", json.msg);

        Ext.getCmp("dtl_id").setValue("");
        Ext.getCmp("dtl_refer").setValue("");
        Ext.getCmp("dtl_mode").setValue("ADD_DTL");
        Ext.getCmp("dtl_c_name").setValue("");
      },
      failure: function(result, request) {
        Ext.MessageBox.alert("Failed", result.responseText); // connect error
      }
    });
  } else {
    Ext.Msg.alert("แจ้งเตือน", msg);
  }
}; // saveDtl

// Class Extend
formPanelDtl = function(args) {
  formPanelDtl.superclass.constructor.call(this, {
    title: "วันหยุดประจำ",
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
        Ext.storeDtl.load({
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
            items: [
              {
                xtype: "grid",
                id: "grid_dtl",
                border: false,
                stripeRows: true,
                loadMask: true,
                store: Ext.storeDtl,
                viewConfig: {
                  emptyText: "ไม่มีข้อมูล..",
                  deferEmptyText: false
                },
                columns: [
                  new Ext.grid.RowNumberer({
                    header: "ที่",
                    width: 30,
                    renderer: function(value, metaData, record, row, col, store, gridView) {
                      return record.get("no");
                    }
                  }),
                  {
                    header: "วันที่",
                    sortable: true,
                    dataIndex: "d_holiday",
                    width: 180,
                    renderer: function(value, metaData, record, rowIndex, colIndex, store) {
                      metaData.attr = 'style="cursor:pointer; text-align:center;"';
                      return value != "" ? longThaiDate(value) : "";
                    }
                  },
                  {
                    id: "c_name",
                    header: "ชื่อรายการ",
                    sortable: true,
                    dataIndex: "c_name",
                    renderer: function(value, metaData, record, rowIndex, colIndex, store) {
                      metaData.attr = 'style="cursor:pointer; text-align:center;"';
                      return value;
                    }
                  },
                  {
                    header: "สถานะ",
                    sortable: true,
                    dataIndex: "i_type",
                    width: 150,
                    renderer: function(value, metaData, record, rowIndex, colIndex, store) {
                      if (value == 1) {
                        metaData.attr = 'style="cursor:pointer; text-align:center; color: #fb7c7c;"';
                        return "Manual";
                      } else {
                        metaData.attr = 'style="cursor:pointer; text-align:center; color: #26a2d2;"';
                        return "Autometic";
                      }
                    }
                  },
                  {
                    header: "หมายเหตุ",
                    sortable: true,
                    dataIndex: "c_comment",
                    width: 200,
                    renderer: function(value, metaData, record, rowIndex, colIndex, store) {
                      metaData.attr = 'style="cursor:pointer; text-align:center;"';
                      return value;
                    }
                  }
                ],
                autoExpandColumn: "c_name"
              }
            ]
          },
          {
            region: "east",
            layout: "fit",
            border: false,
            width: 500,
            items: [
              new Ext.FormPanel({
                labelWidth: 90,
                labelAlign: "right",
                frame: true,
                items: [
                  {
                    xtype: "fieldset",
                    title: "รายการที่เลือก",
                    defaults: { width: "90%" },
                    items: [
                      {
                        xtype: "hidden",
                        id: "dtl_id"
                      },
                      {
                        xtype: "displayfield",
                        fieldLabel: "รายการอ้างอิง",
                        id: "dtl_refer"
                      },
                      {
                        xtype: "radiogroup",
                        fieldLabel: "เลือก",
                        id: "dtl_mode",
                        columns: [55, 65, 50, 120],
                        items: [
                          { boxLabel: "เพิ่ม", checked: true, name: "dtl_mode", inputValue: "ADD_DTL" },
                          { boxLabel: "แก้ไข", name: "dtl_mode", inputValue: "EDIT_DTL" },
                          { boxLabel: "ลบ", name: "dtl_mode", inputValue: "DELETE_DTL" },
                          { boxLabel: "โหลดวันหยุดประจำปี", name: "dtl_mode", inputValue: "LOAD_HOLIDAY" }
                        ]
                      },
                      {
                        xtype: "datefield",
                        fieldLabel: "วันที่",
                        id: "dtl_d_holiday",
                        value: addY(543)
                      },
                      {
                        xtype: "textfield",
                        id: "dtl_c_name",
                        fieldLabel: "ชื่อรายการ"
                      },
                      {
                        xtype: "textarea",
                        id: "dtl_c_comment",
                        fieldLabel: "หมายเหตุ"
                      }
                    ],
                    buttons: [
                      {
                        text: "&nbsp;" + Ext.GLOBAL_BU_SAVE_TH + "&nbsp;",
                        iconCls: "icon-save",
                        handler: function() {
                                                    Ext.saveDtl();
                        }
                      },
                      {
                        text: Ext.GLOBAL_BU_BACK_TH,
                        handler: function() {
                          Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
                          Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"), true) || {};
                        }
                      }
                    ]
                  }
                ]
              })
            ]
          }
        ]
      })
    ]
  });

  cellClickDtl = function(grid, rowIndex, columnIndex, e) {
    let record = grid.getStore().getAt(rowIndex);

    Ext.getCmp("dtl_id").setValue(record.data.id);
    Ext.getCmp("dtl_refer").setValue(record.data.c_name);
    Ext.getCmp("dtl_mode").setValue("EDIT_DTL");
    Ext.getCmp("dtl_d_holiday").setValue(record.data.d_holiday);
    Ext.getCmp("dtl_c_name").setValue(record.data.c_name);
    Ext.getCmp("dtl_c_comment").setValue(record.data.c_comment);
  }; //cellClickDtl
  Ext.getCmp("grid_dtl").on("cellclick", cellClickDtl, this);
}; // formPanelDtl
Ext.extend(formPanelDtl, Ext.Panel, {});
